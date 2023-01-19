// imports to mock:

// datasource imports
import {
    startCheckout,
    getCheckoutInformation,
    deleteCheckoutInformation,
    updateContactInformation,
    updateShippingAddress,
    updateDeliveryMethod,
    placeOrder,
    authorizePayment as authorizePaymentDataSource,
    clientRequest,
} from '../checkoutApiDataSource';

// eslint-disable-next-line jest/no-mocks-import
import { mockFetchResponseAndData } from '../__mocks__/fetchServiceWrapper.mock';
import { cartSummaryChanged } from 'commerce/cartApiInternal';

// imports to test
import {
    mockDelay,
    loadCheckoutRetryDelayMs,
    activeCartId,
    checkoutStore,
    CheckoutGuestEmailAdapter,
    CheckoutInformationAdapter,
    notifyAndPollCheckout,
    loadCheckout,
    waitForCheckout,
    updateGuestEmail as updateGuestEmailCheckoutApi,
    updateContactInformation as updateContactInformationCheckoutApi,
    updateShippingAddress as updateShippingAddressCheckoutApi,
    updateDeliveryMethod as updateDeliveryMethodCheckoutApi,
    authorizePayment,
    postAuthorizePayment,
    paymentClientRequest,
    placeOrder as placeOrderCheckoutApi,
    notifyCheckout,
    restartCheckout,
} from '../checkoutStore';

// types:
import type {
    Address,
    PaymentAuthorizationResponse,
    CheckoutInformation,
    DeliveryGroup,
    PlatformError,
    PaymentClientRequestResponse,
    PaymentsData,
} from 'types/unified_checkout';
import { getStoreAdapterValue, StoreActionError } from 'experience/store';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import { CheckoutError } from 'commerce_unified_checkout/errorHandler';
import { CheckoutStatus } from '../checkoutStatus';
import { ENSURELOADED, PAYMENTCLIENTREQUEST } from '../action-types';

// These mocks cover aspects of interaction with the server that we don't want to be testing
jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('experience/store', () =>
    Object.assign({}, jest.requireActual('experience/store'), {
        getStoreAdapterValue: jest.fn((adapter, _options) => {
            if (adapter.name === 'CartSummaryAdapter') {
                return Promise.resolve({
                    cartId: 'cartId123',
                });
            }
            throw new Error(`Test Error: Please provide mocked 'getStoreAdapterValue' for adapter '${adapter.name}'`);
        }),
    })
);

// Notification that there was a cart summary change to be fake notified and captured with this
jest.mock('commerce/cartApiInternal', () =>
    Object.assign({}, jest.requireActual('commerce/cartApiInternal'), {
        cartSummaryChanged: jest.fn().mockReturnValue(''),
    })
);

// Most of the mocks come from the checkoutApiDataSource where we mock every needed function generally returning a generic string
jest.mock('../checkoutApiDataSource', () => {
    const originalModule = jest.requireActual('../checkoutApiDataSource');
    return Object.assign({ __esModule: true }, originalModule, {
        startCheckout: jest.fn(),
        getCheckoutInformation: jest.fn(),
        deleteCheckoutInformation: jest.fn().mockResolvedValue('deleteCheckoutResult'),
        updateContactInformation: jest.fn(),
        updateShippingAddress: jest.fn(),
        updateDeliveryMethod: jest.fn(),
        placeOrder: jest.fn().mockResolvedValue('placeOrderResult'),
        authorizePayment: jest.fn(),
        clientRequest: jest.fn(),
    });
});

/**
 * time needed for StoreAdapter load blackout throttle timer to elapse
 */
function waitForBlackout(): Promise<never> {
    const STOREADAPTERLOADBLACKOUT = 200;
    // used for polling requests
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    return new Promise((resolve) => setTimeout(resolve, STOREADAPTERLOADBLACKOUT));
}

/**
 * most checkout API return this
 */
function mockedCheckoutResponse(): CheckoutInformation {
    return {
        checkoutId: 'checkoutIdResult',
        contactInfo: {
            firstName: 'Bob',
            lastName: 'Vance',
            email: 'bob.vance@vanceRefrigration.com',
            phoneNumber: '3215550123',
        },
        deliveryGroups: { items: [] },
        errors: [],
    };
}

function mockedCheckout404Response(): PlatformError[] {
    return [
        {
            errorCode: 'CHECKOUT_NOT_FOUND',
            message: "We can't find the checkout. Try starting again with a new cart.",
        },
    ];
}

async function loadAndWaitForCheckout(): Promise<CheckoutInformation> {
    await loadCheckout(); // this loads once and might start polling
    return waitForCheckout(); // this waits for polling if any
}

/**
 * These tests cover just the checkoutApi file but do touch other files that weren't mocked. Not every method
 * was mocked, however just enough to ensure no calls were attempted of the server.
 */
describe('commerce_unified_checkout/checkoutStore tests', () => {
    let adapter: CheckoutInformationAdapter;

    // Generic address usable in a several tests
    const address: Address | null = {
        city: 'Cityville',
        country: 'Countrystan',
        isDefault: false,
        firstName: 'First',
        lastName: 'Last',
        postalCode: '12344',
        region: 'CA',
        street: '122 Boulevard Street',
    };

    const deliveryGroup: DeliveryGroup = {
        deliveryAddress: address,
        desiredDeliveryDate: '2022-01-01T00:00:00.000Z',
        shippingInstructions: '',
    };

    beforeEach(() => {
        (<jest.Mock>startCheckout).mockResolvedValue(mockedCheckoutResponse());
        (<jest.Mock>getCheckoutInformation).mockResolvedValue(mockFetchResponseAndData(200, mockedCheckoutResponse()));
        // getCheckoutInformation is called multiple times per test, ensure returned data is unmodified
        (<jest.Mock>getCheckoutInformation).mockImplementation(() =>
            Promise.resolve(mockFetchResponseAndData(200, mockedCheckoutResponse()))
        );
        (<jest.Mock>updateContactInformation).mockResolvedValue(
            mockFetchResponseAndData(200, mockedCheckoutResponse())
        );
        (<jest.Mock>updateShippingAddress).mockResolvedValue(mockFetchResponseAndData(200, mockedCheckoutResponse()));
        (<jest.Mock>updateDeliveryMethod).mockResolvedValue(mockFetchResponseAndData(200, mockedCheckoutResponse()));
    });

    /**
     * Make sure we clear the mocks and Store state between methods to not create dependencies
     */
    afterEach(async () => {
        await waitForCheckout().catch(jest.fn());
        if (adapter) {
            await adapter.get().catch(jest.fn());
            adapter.disconnect();
        }
        checkoutStore.delete();
        jest.clearAllMocks();
        mockDelay();
    });

    it('loadCheckoutRetryDelayMs should return incrementally greater delays as try count goes from 1 -> 14', () => {
        const expected = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 100,
            6: 200,
            7: 300,
            8: 400,
            9: 1500,
            10: 3000,
            11: 6000,
            12: 12000,
            13: 24000,
            14: 48000,
        };
        const results = Object.keys(expected).reduce((result: { [key: string]: number }, tryCount) => {
            result[tryCount] = loadCheckoutRetryDelayMs(Number(tryCount));
            return result;
        }, {});
        expect(results).toEqual(expected);
        expect(() => loadCheckoutRetryDelayMs(15)).toThrow();
    });

    it('activeCartId returns "active" when CartSummaryAdapter has no cart ID', async () => {
        (<jest.Mock>getStoreAdapterValue).mockResolvedValueOnce({});
        expect(await activeCartId()).toBe('active');
    });

    it('activeCartId returns "active" when CartSummaryAdapter throws an error', async () => {
        (<jest.Mock>getStoreAdapterValue).mockRejectedValueOnce(new Error());
        expect(await activeCartId()).toBe('active');
    });

    it('activeCartId returns the actual cart ID when CartSummaryAdapter valid', async () => {
        expect(await activeCartId()).toBe('cartId123');
    });

    it('throws an error if checkout session cannot be loaded', async () => {
        (getCheckoutInformation as jest.Mock).mockResolvedValueOnce(mockFetchResponseAndData(500));
        await expect(loadAndWaitForCheckout()).rejects.toThrow(StoreActionError);
        expect(checkoutStore.get('checkoutInformation')).toBeInstanceOf(Error);
    });

    it('throws an error if checkout JSON fails to load', async () => {
        (getCheckoutInformation as jest.Mock).mockResolvedValueOnce(mockFetchResponseAndData(200, null));
        await expect(loadAndWaitForCheckout()).rejects.toThrow(CheckoutError.NULL_CHECKOUT_JSON);
        expect(checkoutStore.get('checkoutInformation')).toBeInstanceOf(Error);
    });

    it('loads with no error if checkout JSON loads with 422', async () => {
        await notifyAndPollCheckout(await updateShippingAddressCheckoutApi(deliveryGroup));
        await waitForCheckout();
        (updateShippingAddress as jest.Mock).mockResolvedValueOnce(
            mockFetchResponseAndData(422, mockedCheckoutResponse())
        );
        await notifyAndPollCheckout(await updateShippingAddressCheckoutApi(deliveryGroup));
        await waitForCheckout();
        expect(checkoutStore.get('checkoutInformation')).toBeDefined();
    });

    it('throws an error if checkoutId is missing in the checkout session', async () => {
        (getCheckoutInformation as jest.Mock).mockResolvedValueOnce(
            mockFetchResponseAndData(200, {
                ...mockedCheckoutResponse(),
                checkoutId: '',
            })
        );
        await expect(loadCheckout()).rejects.toThrow(CheckoutError.NULL_CHECKOUTID);
        expect(checkoutStore.get('checkoutInformation')).toBeInstanceOf(Error);
    });

    it('polls the get checkout API when it returns 202', async () => {
        (getCheckoutInformation as jest.Mock).mockResolvedValueOnce(
            mockFetchResponseAndData(202, mockedCheckoutResponse())
        );
        // note: 2nd call returns default mock
        await loadCheckout();
        await waitForCheckout();
        expect(getCheckoutInformation).toHaveBeenCalledTimes(2);
        // cart summary not called for status 202
        expect(cartSummaryChanged).toHaveBeenCalledTimes(1);
    });

    it('throws an error if polling the get checkout API always returns 202', async () => {
        mockDelay((_ms: number) => <Promise<never>>Promise.resolve());
        (getCheckoutInformation as jest.Mock).mockResolvedValue(
            mockFetchResponseAndData(202, mockedCheckoutResponse())
        );
        await loadCheckout();
        await expect(waitForCheckout()).rejects.toThrow('async maximum wait exceeded');
        expect(getCheckoutInformation).toHaveBeenCalledTimes(15);
        // cart summary not called for status 202 and not called when an error encountered
        expect(cartSummaryChanged).toHaveBeenCalledTimes(0);
    });

    it('wraps the error if delay the get checkout API always returns string', async () => {
        mockDelay((_ms: number) => {
            // eslint-disable-next-line no-throw-literal
            throw 'a string';
        });
        (getCheckoutInformation as jest.Mock).mockResolvedValue(
            mockFetchResponseAndData(202, mockedCheckoutResponse())
        );
        await expect(loadCheckout()).rejects.toThrow('a string');
        expect(getCheckoutInformation).toHaveBeenCalledTimes(0);
    });

    it('calls start checkout when get checkout API returns 404', async () => {
        (getCheckoutInformation as jest.Mock).mockResolvedValueOnce(
            mockFetchResponseAndData(404, mockedCheckout404Response())
        );
        // note: 2nd call returns default mock
        await loadCheckout();
        await waitForCheckout();
        expect(getStoreAdapterValue).toHaveBeenCalledTimes(1);
        expect(startCheckout).toHaveBeenCalledTimes(1);
        expect(getCheckoutInformation).toHaveBeenCalledTimes(2);
        expect(cartSummaryChanged).toHaveBeenCalledTimes(1);
    });

    it('loads an error when start checkout failed after get checkout API returns 404', async () => {
        expect.assertions(5);
        (getCheckoutInformation as jest.Mock).mockResolvedValueOnce(
            mockFetchResponseAndData(404, mockedCheckout404Response())
        );
        (startCheckout as jest.Mock).mockRejectedValueOnce([{ errorCode: 'CART_NOT_FOUND' }]);

        let result: StoreAdapterCallbackEntry<CheckoutInformation> | undefined;
        const dataCallback = jest.fn().mockImplementation((payload) => (result = payload));
        adapter = new CheckoutInformationAdapter(dataCallback);
        adapter.update({});
        adapter.connect();
        await adapter.get().catch(jest.fn());

        await loadCheckout().catch(jest.fn());

        // We don't test all the values in the resulting data as they all are handled the same way and it wouldn't add much
        // to this test. We just test cartId which should be enough
        expect(getCheckoutInformation).toHaveBeenCalledTimes(1);
        expect(result?.error).toBeInstanceOf(Error);
        expect((<StoreActionError>result?.error)?.error).toEqual([{ errorCode: 'CART_NOT_FOUND' }]);
        expect(result?.loaded).toBe(true);
        expect(result?.data).toBeUndefined();
    });

    it('loads an error when start checkout does not return 201', async () => {
        (getCheckoutInformation as jest.Mock).mockResolvedValueOnce(
            mockFetchResponseAndData(404, mockedCheckout404Response())
        );
        (startCheckout as jest.Mock).mockRejectedValueOnce([{ errorCode: 'CART_NOT_FOUND' }]);
        // note: 2nd call returns default mock
        await expect(loadCheckout()).rejects.toThrow(StoreActionError);
        expect(startCheckout).toHaveBeenCalledTimes(1);
        expect(getCheckoutInformation).toHaveBeenCalledTimes(1);
        expect(cartSummaryChanged).toHaveBeenCalledTimes(0);
    });

    it('loads an error when start checkout does not return a checkout session ID', async () => {
        (getCheckoutInformation as jest.Mock).mockResolvedValueOnce(
            mockFetchResponseAndData(404, mockedCheckout404Response())
        );
        (startCheckout as jest.Mock).mockResolvedValueOnce({ ...mockedCheckoutResponse(), checkoutId: '' });
        // note: 2nd call returns default mock
        await expect(loadCheckout()).rejects.toThrow(CheckoutError.NULL_CHECKOUTID);
        expect(startCheckout).toHaveBeenCalledTimes(1);
        expect(getCheckoutInformation).toHaveBeenCalledTimes(1);
        expect(cartSummaryChanged).toHaveBeenCalledTimes(0);
    });

    it('calls delete checkout when get checkout API returns 410 on first GET', async () => {
        (getCheckoutInformation as jest.Mock).mockResolvedValueOnce(
            mockFetchResponseAndData(410, mockedCheckoutResponse())
        );
        // note: 2nd call returns default mock
        await loadCheckout();
        await waitForCheckout();
        expect(deleteCheckoutInformation).toHaveBeenCalledTimes(1);
        expect(getCheckoutInformation).toHaveBeenCalledTimes(2);
    });

    it('correctly clears and reloads the state when restarting', async () => {
        expect(checkoutStore.get('checkoutInformation')).toBeUndefined();
        await loadCheckout();
        expect(getCheckoutInformation).toHaveBeenCalledTimes(1);
        expect(checkoutStore.get('checkoutInformation')).toBeDefined();
        checkoutStore.delete();
        await loadCheckout();
        expect(getCheckoutInformation).toHaveBeenCalledTimes(2);
        expect(checkoutStore.get('checkoutInformation')).toBeDefined();
    });

    it('triggers a delayed reload if load attempted while load in progress', async () => {
        const p1 = loadCheckout();
        const p2 = loadCheckout();
        expect(getCheckoutInformation).toHaveBeenCalledTimes(0);
        await p1;
        expect(getCheckoutInformation).toHaveBeenCalledTimes(1);
        await p2;
        expect(getCheckoutInformation).toHaveBeenCalledTimes(2);
    });

    it('correctly makes a call to the correct DataSource for updating the shipping address', async () => {
        // Testing CheckoutApi.updateShippingAddress()
        await loadCheckout();
        await notifyAndPollCheckout(await updateShippingAddressCheckoutApi(deliveryGroup));
        await waitForCheckout();
        expect(updateShippingAddress).toHaveBeenCalledTimes(1);
        expect(updateShippingAddress).toHaveBeenCalledWith(
            {
                ...deliveryGroup,
                deliveryAddress: {
                    city: 'Cityville',
                    country: 'Countrystan',
                    firstName: 'First',
                    lastName: 'Last',
                    postalCode: '12344',
                    region: 'CA',
                    street: '122 Boulevard Street',
                    // isDefault: false, -- removed
                },
            },
            'checkoutIdResult'
        );
        expect(cartSummaryChanged).toHaveBeenCalledTimes(2);
        // TODO: Add a test here and elsewhere to make sure this doesn't return until finished polling checkout information
    });

    it('correctly makes a call to the correct DataSource for updating the shipping address by ID', async () => {
        // Testing CheckoutApi.updateShippingAddress()
        await loadCheckout();
        await notifyAndPollCheckout(
            await updateShippingAddressCheckoutApi({
                ...deliveryGroup,
                deliveryAddress: {
                    ...address,
                    addressId: 'cpaID',
                },
            })
        );
        await waitForCheckout();
        expect(updateShippingAddress).toHaveBeenCalledTimes(1);
        expect(updateShippingAddress).toHaveBeenCalledWith(
            {
                ...deliveryGroup,
                deliveryAddress: {
                    id: 'cpaID',
                },
            },
            'checkoutIdResult'
        );
        expect(cartSummaryChanged).toHaveBeenCalledTimes(2);
        // TODO: Add a test here and elsewhere to make sure this doesn't return until finished polling checkout information
    });

    it('correctly makes a call to the correct DataSource for updating the shipping instructions', async () => {
        // Testing CheckoutApi.updateShippingAddress()
        await loadCheckout();
        await notifyAndPollCheckout(await updateShippingAddressCheckoutApi({ shippingInstructions: 'by the cat' }));
        await waitForCheckout();
        expect(updateShippingAddress).toHaveBeenCalledTimes(1);
        expect(updateShippingAddress).toHaveBeenCalledWith(
            {
                shippingInstructions: 'by the cat',
            },
            'checkoutIdResult'
        );
        expect(cartSummaryChanged).toHaveBeenCalledTimes(2);
        // TODO: Add a test here and elsewhere to make sure this doesn't return until finished polling checkout information
    });

    it('correctly makes a call to the correct DataSource for selecting a delivery method', async () => {
        // Testing CheckoutApi.updateDeliveryMethod()
        await loadCheckout();
        const deliveryMethod = 'MyDeliveryMethod';
        await notifyAndPollCheckout(await updateDeliveryMethodCheckoutApi(deliveryMethod));
        await waitForCheckout();
        expect(updateDeliveryMethod).toHaveBeenCalledTimes(1);
        expect(updateDeliveryMethod).toHaveBeenCalledWith(deliveryMethod, 'checkoutIdResult');
        expect(cartSummaryChanged).toHaveBeenCalledTimes(2);
    });

    it('correctly makes a call to the correct DataSource for updating contact information', async () => {
        // Testing CheckoutApi.updateContactInformation()
        await loadCheckout();
        const contactInfo = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'email@example.com',
            phoneNumber: '9876543210',
        };

        await notifyAndPollCheckout(await updateContactInformationCheckoutApi(contactInfo));
        await waitForCheckout();
        expect(updateContactInformation).toHaveBeenCalledTimes(1);
        expect(updateContactInformation).toHaveBeenCalledWith(contactInfo, 'checkoutIdResult');
        expect(cartSummaryChanged).toHaveBeenCalledTimes(2);
    });

    it('throws an error when updating contact information with an invalid checkout session', async () => {
        expect.assertions(2);
        (getCheckoutInformation as jest.Mock).mockResolvedValueOnce(mockFetchResponseAndData(500));
        await expect(loadAndWaitForCheckout()).rejects.toThrow(StoreActionError);

        const contactInfo = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'email@example.com',
            phoneNumber: '9876543210',
        };

        await expect(updateContactInformationCheckoutApi(contactInfo)).rejects.toThrow(CheckoutError.SESSION_IN_ERROR);
    });

    it('retries the call to the correct DataSource for updating contact information on conflict', async () => {
        await loadCheckout();
        const contactInfo = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'email@example.com',
            phoneNumber: '9876543210',
        };
        (<jest.Mock>updateContactInformation).mockResolvedValueOnce(mockFetchResponseAndData(409));

        await notifyAndPollCheckout(await updateContactInformationCheckoutApi(contactInfo));
        await waitForCheckout();
        expect(updateContactInformation).toHaveBeenCalledTimes(2);
        expect(updateContactInformation).toHaveBeenCalledWith(contactInfo, 'checkoutIdResult');
    });

    it('restartCheckout resets the state', async () => {
        await loadCheckout();
        expect(checkoutStore.get('checkoutInformation')).toBeTruthy();
        await restartCheckout();
        expect(checkoutStore.get('checkoutInformation')).toBeFalsy();
    });

    it('ensureLoaded returns existing state without triggering a load', async () => {
        await notifyCheckout(mockedCheckoutResponse());
        await checkoutStore.dispatch(ENSURELOADED);
        await waitForCheckout();
        expect(getCheckoutInformation).toHaveBeenCalledTimes(0);
    });

    it('ensureLoaded returns existing load if one in progress', async () => {
        checkoutStore.dispatch(ENSURELOADED);
        await checkoutStore.dispatch(ENSURELOADED);
        await waitForCheckout();
        expect(getCheckoutInformation).toHaveBeenCalledTimes(1);
    });

    it('correctly calls the update guest email api', async () => {
        // Testing updateGuestEmailCheckoutApi
        const guestEmail = 'guest@example.com';

        const result = await updateGuestEmailCheckoutApi(guestEmail);
        expect(result).toBe(guestEmail);

        // This part of the test ensures the guest email adapter call is successful as part of this api
        const dataCallback = jest.fn();
        adapter = new CheckoutGuestEmailAdapter(dataCallback);
        adapter.update({});
        adapter.connect();
        const adapterResult = await adapter.get();

        expect(adapterResult.data).toBe(guestEmail);
        expect(adapterResult.loaded).toBe(true);
        expect(adapterResult.error).toBeUndefined();
    });

    it('correctly calls the update guest email api with undefined', async () => {
        // Testing updateGuestEmailCheckoutApi (undefined case)
        const noGuestEmail = undefined;

        const result = await updateGuestEmailCheckoutApi(noGuestEmail);

        // Note that the expected result does not match what was passed in and the guest email is defined
        expect(result).toBe('');
    });

    it('correctly makes a call to the correct DataSource for placeOrder', async () => {
        // Testing CheckoutApi.placeOrder()
        await loadCheckout();
        const result = await placeOrderCheckoutApi();
        expect(placeOrder).toHaveBeenCalledTimes(1);
        expect(placeOrder).toHaveBeenCalledWith('checkoutIdResult');
        expect(result).toBe('placeOrderResult');
    });

    it('correctly triggers a restart and returns the right values from the Checkout Information Adapter', async () => {
        // Testing the CheckoutInformationAdapter
        expect(getCheckoutInformation).toHaveBeenCalledTimes(0);
        await loadCheckout();
        expect(getCheckoutInformation).toHaveBeenCalledTimes(1);
        // initial load complete, will be discarded and reloaded when 1st wire adapter connected

        let result: StoreAdapterCallbackEntry<CheckoutInformation> | undefined;
        const dataCallback = jest.fn().mockImplementation((payload) => (result = payload));
        adapter = new CheckoutInformationAdapter(dataCallback);
        adapter.update({});
        adapter.connect();
        await adapter.get();
        await waitForCheckout();

        // We don't test all the values in the resulting data as they all are handled the same way and it wouldn't add much
        // to this test. We just test cartId which should be enough
        expect(getCheckoutInformation).toHaveBeenCalledTimes(2);
        expect(result?.data?.checkoutId).toContain('checkoutIdResult');
        expect(result?.loaded).toBe(true);
        expect(result?.error).toBeUndefined();
    });

    it('notifyCheckout updates the information in Checkout Information Adapter', async () => {
        // Testing the CheckoutInformationAdapter
        let result: StoreAdapterCallbackEntry<CheckoutInformation> | undefined;
        const dataCallback = jest.fn().mockImplementation((payload) => (result = payload));
        adapter = new CheckoutInformationAdapter(dataCallback);
        adapter.update({});
        adapter.connect();
        await adapter.get();
        await waitForCheckout();
        // 2 dataCallback calls: loading, loaded
        expect(dataCallback).toHaveBeenCalledTimes(2);
        expect(getCheckoutInformation).toHaveBeenCalledTimes(1);
        expect(result?.data?.checkoutStatus).toBe(CheckoutStatus.Ready);

        await notifyCheckout({ ...mockedCheckoutResponse(), checkoutStatus: CheckoutStatus.ReadyWithError });
        await adapter.get();
        await waitForCheckout();
        expect(dataCallback).toHaveBeenCalledTimes(4);
        expect(getCheckoutInformation).toHaveBeenCalledTimes(1);
        expect(result?.data?.checkoutStatus).toBe(CheckoutStatus.ReadyWithError);
    });

    it('notifyAndPollCheckout triggers polling when given 202 to the checkoutStatus in Checkout Information Adapter', async () => {
        // Testing the CheckoutInformationAdapter
        let result: StoreAdapterCallbackEntry<CheckoutInformation> | undefined;
        const dataCallback = jest.fn().mockImplementation((payload) => (result = payload));
        adapter = new CheckoutInformationAdapter(dataCallback);
        adapter.update({});
        adapter.connect();
        await adapter.get();
        await waitForCheckout();
        // 2 dataCallback calls: loading, loaded
        expect(dataCallback).toHaveBeenCalledTimes(2);
        expect(getCheckoutInformation).toHaveBeenCalledTimes(1);
        expect(result?.data?.checkoutStatus).toBe(CheckoutStatus.Ready);

        await waitForBlackout();
        await notifyAndPollCheckout({ ...mockedCheckoutResponse(), checkoutStatus: CheckoutStatus.AsyncInProgress });
        await waitForCheckout();
        await adapter.get();
        expect(dataCallback).toHaveBeenCalledTimes(6);
        expect(getCheckoutInformation).toHaveBeenCalledTimes(2);
        expect(result?.data?.checkoutStatus).toBe(CheckoutStatus.Ready);
        expect(cartSummaryChanged).toHaveBeenCalledTimes(3);
    });

    it('notifyAndPollCheckout swallows polling error when given 202 to the checkoutStatus in Checkout Information Adapter', async () => {
        // Testing the CheckoutInformationAdapter
        let result: StoreAdapterCallbackEntry<CheckoutInformation> | undefined;
        const dataCallback = jest.fn().mockImplementation((payload) => (result = payload));
        adapter = new CheckoutInformationAdapter(dataCallback);
        adapter.update({});
        adapter.connect();
        await adapter.get();
        await waitForCheckout();
        // 2 dataCallback calls: loading, loaded
        expect(dataCallback).toHaveBeenCalledTimes(2);
        expect(getCheckoutInformation).toHaveBeenCalledTimes(1);
        expect(result?.data?.checkoutStatus).toBe(CheckoutStatus.Ready);

        (getCheckoutInformation as jest.Mock).mockResolvedValueOnce(mockFetchResponseAndData(500));
        await waitForBlackout();
        await notifyAndPollCheckout({ ...mockedCheckoutResponse(), checkoutStatus: CheckoutStatus.AsyncInProgress });
        await expect(waitForCheckout()).rejects.toThrow();
        await adapter.get().catch(jest.fn());
        expect(dataCallback).toHaveBeenCalledTimes(6);
        expect(getCheckoutInformation).toHaveBeenCalledTimes(2);
        expect(result?.error).toBeTruthy();
    });

    describe('authorizePayment', () => {
        const mockCheckoutSessionId = 'mockcheckoutsessionid';
        const mockToken = 'mocktoken';
        const mockAddress: Address = {
            city: 'Boston',
            country: 'US',
            postalCode: '02128',
            region: 'MA',
            street: '9 Chaucer St.',
        };
        const mockAuthResponse: PaymentAuthorizationResponse = {
            salesforceResultCode: 'Success',
            errors: [],
        };

        it('should call CheckoutApiDataSource.authorizePayment', () => {
            (<jest.Mock>authorizePaymentDataSource).mockResolvedValue(mockAuthResponse);
            const authorizeResult = authorizePayment(mockCheckoutSessionId, mockToken, mockAddress);
            return expect(authorizeResult).resolves.toEqual(mockAuthResponse);
        });
    });

    describe('postAuthorizePayment', () => {
        const mockCheckoutSessionId = 'mockcheckoutsessionid';
        const mockToken = 'mocktoken';
        const mockAddress: Address = {
            city: 'Boston',
            country: 'US',
            postalCode: '02128',
            region: 'MA',
            street: '9 Chaucer St.',
        };
        const mockAuthResponse: PaymentAuthorizationResponse = {
            salesforceResultCode: 'Success',
            errors: [],
        };

        it('should call CheckoutApiDataSource.authorizePayment', () => {
            (<jest.Mock>authorizePaymentDataSource).mockResolvedValue(mockAuthResponse);
            const authorizeResult = postAuthorizePayment(mockCheckoutSessionId, mockToken, mockAddress);
            return expect(authorizeResult).resolves.toEqual(mockAuthResponse);
        });
    });

    describe('paymentClientRequest', () => {
        const mockClientRequestResponse: PaymentClientRequestResponse = {
            paymentsData: {},
            errors: [],
        };
        const mockPaymentsDataInput = { test: '123' };
        let clientRequestResult: Promise<PaymentsData>;

        beforeEach(() => {
            jest.spyOn(checkoutStore, 'dispatch');
        });

        describe('DataSource returns resolved promise', () => {
            beforeEach(async () => {
                (<jest.Mock>clientRequest).mockResolvedValue(mockClientRequestResponse);
                clientRequestResult = await paymentClientRequest(mockPaymentsDataInput);
            });

            it(`should dispatch a ${PAYMENTCLIENTREQUEST} action`, () => {
                expect(checkoutStore.dispatch).toHaveBeenCalledWith(PAYMENTCLIENTREQUEST, mockPaymentsDataInput);
            });

            it('should return the API response', () => {
                expect(clientRequestResult).toEqual(mockClientRequestResponse);
            });
        });

        describe('DataSource returns rejected promise', () => {
            let error: unknown;
            describe('422 error', () => {
                const mockError = {
                    errors: [
                        {
                            detail: 'Unexpected payment gateway response.',
                            invalidParameters: [],
                            title: 'We cannot complete this request due to an administration issue.',
                            type: '/commerce/payment',
                        },
                    ],
                    paymentsData: {},
                    salesforceResultCode: 'SystemError',
                };

                beforeEach(async () => {
                    (<jest.Mock>clientRequest).mockRejectedValue(mockError);
                    try {
                        clientRequestResult = await paymentClientRequest(mockPaymentsDataInput);
                    } catch (e: unknown) {
                        error = e;
                    }
                });

                it(`should dispatch a ${PAYMENTCLIENTREQUEST} action`, () => {
                    expect(checkoutStore.dispatch).toHaveBeenCalledWith(PAYMENTCLIENTREQUEST, mockPaymentsDataInput);
                });

                it('should return the API error', () => {
                    expect(error).toEqual(mockError);
                });
            });

            describe('platform error', () => {
                const mockError = [
                    {
                        errorCode: 'INVALID_API_INPUT',
                        message: "Something's not right with the request parameter '{0}'.",
                    },
                ];
                beforeEach(async () => {
                    (<jest.Mock>clientRequest).mockRejectedValue(mockError);
                    try {
                        clientRequestResult = await paymentClientRequest(mockPaymentsDataInput);
                    } catch (e: unknown) {
                        error = e;
                    }
                });

                it(`should dispatch a ${PAYMENTCLIENTREQUEST} action`, () => {
                    expect(checkoutStore.dispatch).toHaveBeenCalledWith(PAYMENTCLIENTREQUEST, mockPaymentsDataInput);
                });

                it('should return the API error', () => {
                    expect(error).toEqual(mockError);
                });
            });
        });
    });
});
