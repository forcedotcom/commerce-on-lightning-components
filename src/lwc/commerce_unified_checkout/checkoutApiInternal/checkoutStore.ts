// Checkout API Store and Adapter

import type { Action, Adapter, State, StoreAdapterCallbackHandler } from 'experience/store';
import { getStoreAdapterValue, Store, StoreAdapter, StoreActionError } from 'experience/store';
import {
    getCheckoutInformation as dsGetCheckoutInformation,
    deleteCheckoutInformation as dsDeleteCheckoutInformation,
    startCheckout as dsStartCheckout,
    clientRequest as dsClientRequest,
    updateContactInformation as dsUpdateContactInformation,
    updateShippingAddress as dsUpdateShippingAddress,
    updateDeliveryMethod as dsUpdateDeliveryMethod,
    authorizePayment as dsAuthorizePayment,
    placeOrder as dsPlaceOrder,
} from './checkoutApiDataSource';
import type { FetchResponseAndData } from './checkoutApiDataSource';
import { CartSummaryAdapter } from 'commerce/cartApi';
import type { CartSummaryData } from 'commerce/cartApi';
import { cartSummaryChanged } from 'commerce/cartApiInternal';
import type {
    Address,
    CheckoutInformation,
    ContactInfo,
    DeliveryGroup,
    OrderConfirmation,
    PaymentAuthorizationResponse,
    PaymentRequestType,
    PaymentsData,
} from 'types/unified_checkout';

import {
    NOTIFYCHECKOUT,
    LOADCHECKOUT,
    ENSURELOADED,
    WAITFORCHECKOUT,
    UPDATEGUESTEMAIL,
    PAYMENTCLIENTREQUEST,
} from './action-types';
import { CheckoutError, unwrapActionError } from 'commerce_unified_checkout/errorHandler';
import {
    CheckoutStatus,
    checkoutStatusIsOk,
    checkoutStatusNotStartable,
    checkoutStatusCanRestart,
} from './checkoutStatus';

// ====================================
// CheckoutStore definition
// ====================================

interface CheckoutStore {
    // most recent cached checkout API response directly accessible by our dispatch handlers
    // setting CheckoutInformation can be retrieved directly (provided not null or an error)
    // with state.get('checkoutInformation).checkoutId
    // setting an error serializes it directly into the key so it is
    // retrieved with (state.get('checkoutInformation) instanceof Error)
    checkoutInformation?: CheckoutInformation;

    // copy of checkoutInformation managed and uplifted by checkoutInformationAdapter.
    // Note: we do this because Store['wiredCheckoutInformation'] contains a hash map,
    // not a CheckoutInformation
    wiredCheckoutInformation?: CheckoutInformation;

    // TODO: move the below properties to separate generic checkout properties that
    // share a single wire adapter that updates checkout status not directly related
    // to the checkout API state

    // inter-component data future ContactInfo API call
    guestEmail?: string;
}

// ====================================
// Convenience helper functions (public or private)
// ====================================
// These are not needed directly in typical use cases but can be used when
// implementing advanced custom checkout behaviors

/**
 * returns a promise that resolves after specified time
 */
function _delay(milliseconds: number): Promise<never> {
    // used for polling requests
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
let delay = _delay;

/**
 * disable retry delays for tests
 * TODO: use jest timer mocks instead; however, they are currently not working for this use case
 */
export function mockDelay(fn?: (milliseconds: number) => Promise<never>): void {
    delay = fn ? fn : _delay;
}

/**
 * computes desired dead time between GET attempts
 * may throw if max attempts exceeded
 */
export function loadCheckoutRetryDelayMs(tryCount: number): number {
    const initialWaitMillis = 0;
    const linerWaitMillis = 100;
    const exponentialWaitMillis = 750;
    const maxRetryCount = 14;

    if (tryCount > maxRetryCount) {
        throw new Error('async maximum wait exceeded');
    }
    if (tryCount <= 4) {
        return initialWaitMillis;
    }
    if (tryCount > 4 && tryCount <= 8) {
        return linerWaitMillis * (tryCount - 4);
    }
    return exponentialWaitMillis * Math.pow(2, tryCount - 8);
}

/**
 * Convert CPA address to checkout API address
 * - use CPA ID if present
 * - otherwise use raw address data
 */
function transformToCheckoutAddress(address: Address): Address {
    if (address.addressId) {
        return {
            id: address.addressId,
        };
    }
    return {
        city: address.city,
        country: address.country,
        firstName: address.firstName,
        lastName: address.lastName,
        postalCode: address.postalCode,
        region: address.region,
        street: address.street,
        // id from address.addressId -- renamed, also not returned strangely
        // fields: {} -- not currently allowed
        // isDefault -- not allowed
        // addressType -- not allowed
        // countryCode -- weirdly returned in response but not allowed in request
        // regionCode -- weirdly returned in response but not allowed in request
    };
}

/**
 * helper to retrieve the active cartId from the store or else the string 'active'
 * note: using the actual cart ID to get/create the checkout session is more efficient
 * note: for page refresh this is slower as it serializes cart summary load ahead of
 *       checkout load, but refresh is not a typical case.
 */
export function activeCartId(): Promise<string> {
    return getStoreAdapterValue<CartSummaryData>(CartSummaryAdapter)
        .then((cs) => cs.cartId)
        .catch((_e) => Promise.resolve(''))
        .then((s) => s || 'active');
}

/**
 * TypeScript predicate
 */
function isCheckoutInformation(
    payload: CheckoutInformation | Error | null | undefined
): payload is CheckoutInformation {
    const isError = payload instanceof Error; // note in TypeScript this probably doesn't work, but we don't care
    return !!payload && !isError;
}

/**
 *  must wrap as Error or uplifted wire adapter will publish the error as data
 */
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
function wrapErrorForStore(e: any): Error {
    return e instanceof Error ? e : new StoreActionError(e);
}

/**
 * helper to validate and normalize checkout DataSource responses
 * - ensures required fields are present.
 * - copy HTTP status code to checkoutStatus field.
 * - throws if HTTP status < 200 or > 299 and !422, or if payload invalid.
 */
function parseCheckoutResponse(responseAndData: FetchResponseAndData): CheckoutInformation {
    if (!checkoutStatusIsOk(responseAndData.response.status)) {
        // when error body available as JSON then throw error body without response
        // note: this is the apparent behavior as of fetchService commit feb 2 commit 70f0123a
        //
        // we do not modify the cached checkout session as we assume it is unchanged
        // when a PATCH fails
        throw responseAndData.data;
    }
    // TODO: some (most) status 422 are not buyer recoverable
    // those should be thrown wrapped in an Error
    if (!responseAndData.data) {
        throw new Error(CheckoutError.NULL_CHECKOUT_JSON);
    }
    // shallow copy seems good enough here to avoid freeze errors from fetch
    const checkoutInformation = { ...responseAndData.typedData<CheckoutInformation>() };
    checkoutInformation.checkoutStatus = responseAndData.response.status;
    if (!checkoutInformation.checkoutId) {
        throw new Error(CheckoutError.NULL_CHECKOUTID);
    }
    return checkoutInformation;
}

/**
 * helper to retrieve the active checkoutId from the store or else the string 'active'
 * throws if the previously loaded checkout session is an error
 */
function activeCheckoutId(): string {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const checkoutInformation = checkoutStore.get('checkoutInformation');
    if (checkoutInformation instanceof Error) {
        // when we save an error the checkout session ID gets lost to us
        throw new Error(CheckoutError.SESSION_IN_ERROR);
    }
    return (<CheckoutInformation>checkoutInformation)?.checkoutId || 'active';
}

/**
 * helper to test if checkout session is an error
 */
function ensureSessionNotInError(state: State<CheckoutStore>): void {
    const checkoutInformation = state.get('checkoutInformation');
    if (checkoutInformation instanceof Error) {
        throw checkoutInformation;
    }
}

/**
 * helper to retrieve checkout session or throw an error if its not loaded or in error state
 */
function getCheckoutInformation(state: State<CheckoutStore>): CheckoutInformation {
    const checkoutInformation = state.get('checkoutInformation');
    if (checkoutInformation instanceof Error) {
        throw checkoutInformation;
    }
    if (!checkoutInformation) {
        throw new Error(CheckoutError.SESSION_NOT_LOADED);
    }
    return <CheckoutInformation>checkoutInformation;
}

/**
 * helper to auto-retry checkout update (PATCH) in case of 409 Conflict
 */
async function waitAndRetryUpdateOnConflict(
    updateFn: () => Promise<FetchResponseAndData>
): Promise<FetchResponseAndData> {
    const maxUpdateAttempts = 2;
    for (let updateCheckoutAttempts = 0; ; updateCheckoutAttempts += 1) {
        // eslint-disable-next-line no-await-in-loop
        const responseAndData = await updateFn();
        if (
            responseAndData.response.status !== CheckoutStatus.ErrorConflict ||
            updateCheckoutAttempts > maxUpdateAttempts
        ) {
            return responseAndData;
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define, no-await-in-loop
        await waitForCheckout();
    }
}

// ========================================
// Store action implementations (private)
// ========================================

/**
 * implements notiifyCheckout
 */
function _notifyCheckout(
    state: State<CheckoutStore>,
    payload: CheckoutInformation | Error | null
): Promise<CheckoutInformation | Error | null> {
    if (!payload) {
        state.delete('checkoutInformation');
        state.delete('guestEmail');
    } else {
        state.set('checkoutInformation', payload);
    }
    return Promise.resolve(payload);
}

/**
 * helper for _loadCheckout
 * makes a GET checkout session API call and saves it or its Error in the state in
 * both dispatch and uplifted forms.
 * will force checkout session to restart if there is no cached session and the
 * newly loaded session is in error or does not exist.
 */
async function loadCheckoutOnce(state: State<CheckoutStore>): Promise<CheckoutInformation> {
    try {
        let callCartSummaryChanged = false;
        let checkoutId = activeCheckoutId();
        let responseAndData = await dsGetCheckoutInformation(checkoutId);

        // checkoutInformation is undefined the first time we hit this code after browser refresh or navigation.
        // when allowRestart make additional API calls to clear errors and restart the session
        const allowRestart = checkoutId === 'active';
        if (allowRestart && !checkoutStatusNotStartable(responseAndData.response.status)) {
            if (checkoutStatusCanRestart(responseAndData.response.status)) {
                // just entered checkout page and checkout session in error, delete it
                // throws for all non-ok responses (expected response is 204)
                await dsDeleteCheckoutInformation(checkoutId);
                responseAndData = await dsGetCheckoutInformation(checkoutId);
            }
            if (responseAndData.response.status === CheckoutStatus.ErrorNotFound) {
                // new checkout needed.
                // should return status '201 Created' and new checkout session ID
                // throws for all non-ok responses, such as:
                //   status 409 - checkout exists
                //   status 423 - db lock
                const startResponse = await dsStartCheckout(await activeCartId());
                // asynchronously reload the cart summary (e.g. delivery cost) after any POST/PUT (201 or 202)
                callCartSummaryChanged = true;
                // avoid server side checkout session 'active' error by explicitly
                // requesting the new session by session ID in the subsequent GET
                if (!startResponse?.checkoutId) {
                    throw new Error(CheckoutError.NULL_CHECKOUTID);
                }
                checkoutId = startResponse.checkoutId;
                // in testing startCheckout does NOT return the complete state and a
                // follow up GET is still required.
                responseAndData = await dsGetCheckoutInformation(checkoutId);
            }
        }

        // the following validates and normalizes the response data
        // if unrecoverable unwrap the error body and throw it to our error handler below
        const checkoutInformation = parseCheckoutResponse(responseAndData);

        if (callCartSummaryChanged || checkoutInformation.checkoutStatus === CheckoutStatus.Ready) {
            // asynchronously reload the cart summary (e.g. delivery cost) after any POST/PUT (201 or 202)
            // asynchronously reload the cart summary (e.g. delivery cost) after any GET 200
            // FUTURE: also reload after GET 202; however, this might adversely effect server performance
            cartSummaryChanged();
        }

        // avoid overwriting previous error
        ensureSessionNotInError(state);

        // save the state and trigger the wire-adapters
        return state.dispatch(NOTIFYCHECKOUT, checkoutInformation);
    } catch (e) {
        // avoid overwriting previous error
        ensureSessionNotInError(state);

        // save the error and trigger wire-adapters
        await state.dispatch(NOTIFYCHECKOUT, wrapErrorForStore(e));
        throw e;
    }
}

/**
 * these are used by _loadCheckout to eliminate simultaneous API loads
 */
let _loadCheckoutAgainPromise: Promise<CheckoutInformation> | null = null;
let _loadCheckoutAgainWaiting = 0;
let _loadCheckoutAgainAttempts = 0;

/**
 * implements loadCheckout
 */
function _loadCheckout(state: State<CheckoutStore>): Promise<CheckoutInformation> {
    if (_loadCheckoutAgainPromise) {
        // request is in flight and caller wants a new request
        _loadCheckoutAgainWaiting++;
        // clear subsequent attempts with explicit load request
        _loadCheckoutAgainAttempts = 0;
        return _loadCheckoutAgainPromise;
    }
    // back-off requests if desired
    const currentPromise = Promise.resolve()
        .then(() => delay(loadCheckoutRetryDelayMs(_loadCheckoutAgainAttempts)))
        .catch(async (e) => {
            // handle maximum retries exceeded
            await state.dispatch(NOTIFYCHECKOUT, wrapErrorForStore(e));
            throw e;
        })
        .then(() => loadCheckoutOnce(state));
    _loadCheckoutAgainPromise = currentPromise
        .then((checkoutInformation) => {
            const restart =
                checkoutInformation.checkoutStatus === CheckoutStatus.AsyncInProgress || _loadCheckoutAgainWaiting > 0;
            _loadCheckoutAgainWaiting = 0;
            _loadCheckoutAgainPromise = null;
            if (restart) {
                // the request in flight finished but we need to queue another
                _loadCheckoutAgainAttempts++;
                // tricky, we need to reset _loadCheckoutAgainPromise before the next tick
                return _loadCheckout(state);
            }
            // the request in flight finished and nobody queued a request
            // and there are no pending changes
            _loadCheckoutAgainAttempts = 0;
            return checkoutInformation;
        })
        .catch((err) => {
            // the request in flight failed
            // return error for this request and any queued requests
            _loadCheckoutAgainAttempts = 0;
            _loadCheckoutAgainWaiting = 0;
            _loadCheckoutAgainPromise = null;
            return Promise.reject(err);
        });
    // load again errors are handled in the caller or ignored
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    _loadCheckoutAgainPromise.catch(() => {});
    return currentPromise;
}

/**
 * implements ensureLoaded
 * if checkout state is not loaded (null) returns a promise that resolves to the current checkout state,
 * otherwise immediately returns the loaded checkout state
 * unlike loadCheckout does not trigger additional reloads if a load is already in progress
 */
async function _ensureLoaded(state: State<CheckoutStore>): Promise<CheckoutInformation> {
    // if we're already loaded just return the state
    if (state.get('checkoutInformation')) {
        return getCheckoutInformation(state);
    }

    // if there's a load in progress return it
    if (_loadCheckoutAgainPromise) {
        return _loadCheckoutAgainPromise;
    }

    // tricky, we need to reset _loadCheckoutAgainPromise before the next tick
    // note: we expect caller to catch errors
    return _loadCheckout(state);
}

/**
 * implements waitForCheckout
 */
async function _waitForCheckout(state: State<CheckoutStore>): Promise<CheckoutInformation> {
    // if we're currently loading wait for async computation to complete and return it
    while (_loadCheckoutAgainPromise) {
        // eslint-disable-next-line no-await-in-loop
        await _loadCheckoutAgainPromise;
    }
    // otherwise return cached state
    return getCheckoutInformation(state);
}

/**
 * implements updateGuestEmail
 */
function _updateGuestEmail(state: State<CheckoutStore>, guestEmail: string): string {
    // Store is aware of StoreAdapter-controlled entries (W-9547157)
    // The following will become state['guestEmail'][StoreAdapterConfig].data
    state.set('guestEmail', guestEmail);
    return guestEmail;
}

function _paymentClientRequest(state: State<CheckoutStore>, paymentsData: PaymentsData): Promise<PaymentsData> {
    return dsClientRequest(activeCheckoutId(), paymentsData);
}

// ====================================
// CheckoutStore implementation (public)
// ====================================
// Here we define the actions we can perform on the store, and what they do
// update actions return a Promise so our callers can wait on them if needed

export const checkoutStore = new Store<CheckoutStore>('Checkout', {
    actions: {
        [NOTIFYCHECKOUT]: (
            state: State<CheckoutStore>,
            payload: CheckoutInformation | Error | null
        ): Promise<CheckoutInformation | Error | null> => _notifyCheckout(state, payload),
        [LOADCHECKOUT]: (state: State<CheckoutStore>): Promise<CheckoutInformation> => _loadCheckout(state),
        [ENSURELOADED]: (state: State<CheckoutStore>): Promise<CheckoutInformation> => _ensureLoaded(state),
        [WAITFORCHECKOUT]: (state: State<CheckoutStore>): Promise<CheckoutInformation> => _waitForCheckout(state),
        [UPDATEGUESTEMAIL]: (state: State<CheckoutStore>, payload: string): string => _updateGuestEmail(state, payload),
        [PAYMENTCLIENTREQUEST]: (state: State<CheckoutStore>, payload: string): Promise<PaymentsData> =>
            _paymentClientRequest(state, payload),
    },

    // must clear all cached checkout data in preparation for reloading a new 'active' session.
    // this is required any time the previous checkout session becomes invalid.
    // (attempts to use other checkout api after the previous session became invalid will fail
    // until the cache the restart is called).
    //
    // use discard true to drop entire checkout state when navigating away from the
    // checkout page, thus ensuring we reload a fresh copy from the API.
    // This automatic discard is triggered when the last component's wire-adapter reference
    // is removed. In the off case that a checkout wire-adapter life-span extends
    // beyond the page then state must be explicitly cleared with the restartCheckout method.
    //
    // note: this does not clear the server side cart; it only clears browser cache.
    discard: true,
});

// ====================================
// Adapter helpers (private)
// ====================================

/**
 * the checkoutInformationLoader can gets multiple simultaneous invocations causing
 * unwanted api calls and infinte tail recursions
 */
let checkoutInformationFirstLoaderPromise: Promise<CheckoutInformation> | null = null;

/**
 * time needed for StoreAdapter load blackout throttle timer to elapse
 */
const STOREADAPTERLOADBLACKOUT = 200;

/**
 * forces delayed publish of cached state whenever primary 'checkoutInformation' changes
 */
function checkoutInformationConnector(adapter: Adapter<CheckoutStore>): void {
    adapter.subscribeAction(NOTIFYCHECKOUT, () => {
        // avoid infinite tail recursion
        if (!checkoutInformationFirstLoaderPromise) {
            adapter.load();
            delay(STOREADAPTERLOADBLACKOUT).then(() => {
                // work-around for when the load blackout timer is triggering which causes
                // the last round of changes not to uplift when there are many changes in
                // quick succession
                //
                // note: W-11618770 changed blackout timer from throttle to debounce so we can remove this
                // however, it still behaves as a throttle so it needs revisiting...
                adapter.load();
            });
        }
    });
}

/**
 * helper for checkoutInformationLoader when no data has been loaded or cached yet
 */
async function checkoutInformationFirstLoader(state: State<CheckoutStore>): Promise<CheckoutInformation> {
    if (!state.get('wiredCheckoutInformation')) {
        // tricky: clear all cached data each time the number of attached
        // wire-adapters increments from none to one.
        //
        // this works because checkoutStore has discard true, which causes
        // the key wiredCheckoutInformation to become undefined when
        // the number of attached wire-adapters decrements from one to none.
        // however, the key 'checkoutInformation' doesn't auto-magically
        // become undefined so we have to manually clear it when we notice
        // wiredCheckoutInformation has become auto-magically cleared.
        //
        // this approach has beneficial side effect of notifying loading true
        // during the initial state load.
        //
        // aside: it would be cleaner to subscribe to wiredCheckoutInformation
        // discard events but it isn't workable.  Adding a key subscription causes
        // the discard to never fire.   Further the "value" included in these events
        // are the opaque StoreAdapterEntry so the data never becomes recognizably
        // discarded (e.g. undefined).
        await state.dispatch(NOTIFYCHECKOUT, null);
    }

    // ensure the checkout state is loading but don't trigger _loadCheckoutAgainWaiting reloads
    // warning: be wary of infinite recursive since loadCheckout can dispatch NOTIFYCHECKOUT
    return <Promise<CheckoutInformation>>state.dispatch(ENSURELOADED);
}

/**
 * wire adapter on 'wiredCheckoutInformation' key so any data is "uplifted" to become a StoreAdapterEntry
 * initial publish will be { loading: true, loaded: false } then { loading: false, loaded: true, data: thedata }
 * setting CheckoutInformation publishes as { loading: false, loaded: true, data: thedata }
 * setting an Error publishes as { loading: false, loaded: true, error: theerror }
 * not used: setting undefined publishes as { loading: false, loaded: true }
 */
function checkoutInformationLoader(
    _: Action<Record<string, unknown>>,
    state: State<CheckoutStore>
): Promise<CheckoutInformation> | CheckoutInformation {
    // if we don't yet have cached data we return a Promise that resolves to the loaded cached data
    if (!state.get('wiredCheckoutInformation') || !state.get('checkoutInformation')) {
        if (!checkoutInformationFirstLoaderPromise) {
            checkoutInformationFirstLoaderPromise = checkoutInformationFirstLoader(state)
                .catch((e) => {
                    // unlike the way the immediate error thrown below is handled, rejected promises
                    // returned are handled as "error" and eventually unhandled rejections.
                    return Promise.reject(wrapErrorForStore(e));
                })
                .finally(() => {
                    checkoutInformationFirstLoaderPromise = null;
                });
        }
        return checkoutInformationFirstLoaderPromise;
    }

    // manually uplift 'checkoutInformation' slice to 'wiredCheckoutInformation'.
    // leverage helper to ensure we throw when saved state is Error
    // note: throwing an immediate error results in that error being published as "after { error }"
    //
    // by not returning a Promise we avoid wire-adapter notifying a
    // spurious loading true with stale data
    return getCheckoutInformation(state);
}

// ========================
// Adapter Definitions (public)
// ========================

export class CheckoutGuestEmailAdapter extends StoreAdapter<CheckoutStore> {
    constructor(dataCallback: StoreAdapterCallbackHandler<string>) {
        super(dataCallback, checkoutStore, 'guestEmail', {});
    }
}

export class CheckoutInformationAdapter extends StoreAdapter<CheckoutStore> {
    constructor(dataCallback: StoreAdapterCallbackHandler<CheckoutInformation>) {
        super(dataCallback, checkoutStore, 'wiredCheckoutInformation', {
            connectors: [checkoutInformationConnector],
            loader: checkoutInformationLoader,
        });
    }
}

// ====================================
// Convenience functions (public)
// ====================================
// These can be used instead of directly manipulating the store via dispatch() methods

/**
 * publish new checkoutInformation so changes can be propogated by the wire adapter to
 * subscribed listeners.
 * Passing an Error replaces the checkout state and checkout ID with the error state.
 * Passing null clears the published data cache.
 * assumes payload has been validated clean by something like parseCheckoutResponse.
 * return passed in payload for convenience.
 */
export function notifyCheckout(
    payload: CheckoutInformation | Error | null
): Promise<CheckoutInformation | Error | null> {
    return checkoutStore.dispatch(NOTIFYCHECKOUT, payload);
}

/**
 * calls notifyCheckout eith supplied data.
 * Triggers polling GET checkout API if payload indicates async computation in progress (httpsStatus is 202).
 * Automatically triggers a cart summary refresh if needed (i.e. delivery method changed).
 * returns passed in payload for convenience.
 *
 * note to avoid race conditions caller should await this promise before calling waitForCheckout
 */
export async function notifyAndPollCheckout(
    payload: CheckoutInformation | Error | null
): Promise<CheckoutInformation | Error | null> {
    await checkoutStore.dispatch(NOTIFYCHECKOUT, payload);

    if (isCheckoutInformation(payload)) {
        // asynchronously reload the cart summary (e.g. delivery cost) after any PATCH (200 or 202)
        cartSummaryChanged();

        if (payload?.checkoutStatus === CheckoutStatus.AsyncInProgress) {
            // start async polling if needed but do not wait for response
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            checkoutStore.dispatch(LOADCHECKOUT).catch(() => {});
        }
    }

    return Promise.resolve(payload);
}

/**
 * loads the checkout session or Error and saves it in the store so it can be accessed by both
 * our dispatch handlers and the wire adapter.
 * returns the loaded checkout session or Error.
 *
 * queues a reload if checkout status is in progress (http status 202); ideally
 * with back off timing if no others waiting.
 *
 * if a load is already in progress the response will be from a new load that is queued
 * for after the current load completes; however, on Error the queued load response will
 * also be the Error.
 *
 * Not needed directly in typical use cases but can be used when
 * implementing advanced custom checkout behaviors
 */
export function loadCheckout(): Promise<CheckoutInformation> {
    return checkoutStore.dispatch(LOADCHECKOUT);
}

/**
 * returns a resolved promise immediately if the checkout status is complete
 * otherwise the returned promise resolves after the checkout status becomes complete
 * or errors.
 *
 * note this does not wait for wire-adapter subcribed components to receive or react.
 */
export function waitForCheckout(): Promise<CheckoutInformation> {
    return checkoutStore.dispatch(WAITFORCHECKOUT);
}

/**
 * clear all cached checkout data in preparation for reloading a new 'active' session.
 * this is required any time the previous checkout session becomes invalid.
 * note: typically the cache is cleared implicitly when the first wire adapter connects.
 *
 * if a load is already in progress this restart will be ignored.
 *
 * (attempts to use other checkout api after the previous session became invalid will fail
 * until the cache is cleared).
 */
export async function restartCheckout(): Promise<void> {
    await notifyCheckout(null);
}

/**
 * update the cached guest email value that is shared between components
 * does not affect the checkout session
 */
export function updateGuestEmail(guestEmail: string | undefined): Promise<void> {
    return checkoutStore.dispatch(UPDATEGUESTEMAIL, guestEmail || '');
}

/**
 * update the guest contact informaion in the active checkout session
 * auto-retries on update conflicts
 * notifying is the responsibility of the caller.
 */
export async function updateContactInformation(contactInfo: ContactInfo): Promise<CheckoutInformation> {
    const responseAndData = await waitAndRetryUpdateOnConflict(() =>
        dsUpdateContactInformation(contactInfo, activeCheckoutId())
    );
    return parseCheckoutResponse(responseAndData);
}

/**
 * update the shipping address for the default delivery group in the active checkout session.
 * auto-retries on update conflicts
 * notifying, async polling, and refreshing cart summary are the responsibility of the caller.
 *
 * Special note: for the shipping address component we want to block the proceed Promise
 * resolve (and subsequent step advancement) until the polling completes and we have verified the
 * supplied address has at least one delivery method.
 */
export async function updateShippingAddress(shippingAddress: DeliveryGroup): Promise<CheckoutInformation> {
    // instructions can be provided without address data
    const transformedAddress = shippingAddress.deliveryAddress
        ? {
              ...shippingAddress,
              deliveryAddress: transformToCheckoutAddress(shippingAddress.deliveryAddress),
          }
        : { ...shippingAddress };
    const responseAndData = await waitAndRetryUpdateOnConflict(() =>
        dsUpdateShippingAddress(transformedAddress, activeCheckoutId())
    );
    return parseCheckoutResponse(responseAndData);
}

/**
 * select one of the available delivery methods for the default delivery group in the active checkout session
 * auto-retries on update conflicts
 * notifying, async polling, and refreshing cart summary are the responsibility of the caller.
 */
export async function updateDeliveryMethod(deliveryMethodId: string): Promise<CheckoutInformation> {
    const responseAndData = await waitAndRetryUpdateOnConflict(() =>
        dsUpdateDeliveryMethod(deliveryMethodId, activeCheckoutId())
    );
    return parseCheckoutResponse(responseAndData);
}

const authorizePaymentRequest = (requestType: PaymentRequestType) => {
    return (
        activeOrCheckoutId: string,
        token: string,
        billingAddress?: Address
    ): Promise<PaymentAuthorizationResponse> => {
        return dsAuthorizePayment(activeOrCheckoutId, token, requestType, billingAddress);
    };
};

/**
 * Authorize a tokenized payment for a checkout session (requestType = 'Auth')
 */
export const authorizePayment = authorizePaymentRequest('Auth');

/**
 * Send a client side authorization result to the server (requestType = 'PostAuth')
 */
export const postAuthorizePayment = authorizePaymentRequest('PostAuth');

/**
 * Send simple purchase order number to the server  (requestType = 'SimplePurchaseOrder')
 */
export const simplePurchaseOrderPayment = authorizePaymentRequest('SimplePurchaseOrder');

/**
 * Payment client request for general server side payment operations
 * This allows a client to send arbitrary data to the payment apex integration and receive arbitrary data in return
 *
 */
export function paymentClientRequest(paymentsData: PaymentsData): Promise<PaymentsData> {
    return checkoutStore.dispatch(PAYMENTCLIENTREQUEST, paymentsData).catch((e: unknown) => {
        throw unwrapActionError(e);
    });
}

/**
 * finalize the order, completing the active checkout session.
 * Pre-conditions: shipping address, shipping method, billing address and payment methods have been set.
 * clears (updates) the cart summary on success
 */
export async function placeOrder(): Promise<OrderConfirmation> {
    const result: OrderConfirmation = await dsPlaceOrder(activeCheckoutId());
    // TODO: as of release 244 there may be a race condition between emptying the cart and placing the order
    cartSummaryChanged();
    return result;
}
