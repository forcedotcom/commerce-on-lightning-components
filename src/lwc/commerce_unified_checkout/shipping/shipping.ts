import { api, LightningElement, track, wire } from 'lwc';
import type { LwcCustomEventTargetOf } from 'types/common';
import {
    CheckoutAddressAdapter,
    CheckoutGuestEmailAdapter,
    CheckoutInformationAdapter,
    createContactPointAddress,
    updateContactPointAddress,
    notifyAndPollCheckout,
    waitForCheckout,
    updateContactInformation,
    updateShippingAddress,
} from 'commerce/checkoutApi';
import { checkoutStatusIsReady } from 'commerce_unified_checkout/checkoutApiInternal';

import type { StoreAdapterCallbackEntry } from 'experience/store';

import type InputAddress from '../inputAddress/inputAddress';
import type AddressVisualPicker from '../addressVisualPicker/addressVisualPicker';
import { StencilType } from 'commerce_unified_checkout/stencil';

import type {
    Address,
    CheckoutInformation,
    CheckoutSavable,
    ContactInfo,
    ContactPointAddressData,
    DeliveryGroup,
    ErrorLabels,
    Locator,
} from 'types/unified_checkout';

import type { SessionContext } from 'commerce/contextApi';
import { SessionContextAdapter } from 'commerce/contextApi';
import {
    isSameContactInfo,
    isSameContactPointAddress,
    isSameDeliveryAddress,
} from 'commerce_unified_checkout/addresses';

import templateEdit from './shipping.html';
import templateReadonly from './shippingReadonly.html';
import templateStencil from './shippingStencil.html';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import { CheckoutError } from 'commerce_unified_checkout/errorHandler';
import {
    generateCheckoutIntegrationErrorLabel,
    generateErrorLabel,
    isCheckoutIntegrationError,
    noDeliveryMethodsLabels,
    noErrorLabels,
} from 'commerce_unified_checkout/errorHandler';
import {
    getCustomLocale,
    isLastNameFirstCountry,
    getCountryLabel,
} from 'commerce_unified_checkout/internationalization';
import { end, publishEkgLogs } from 'commerce_unified_checkout/ekg';

// WARNING: the use of permissions via scoped modules works for our very limited use case
// but is not a pattern that should be replicated or extended
import hasAccountAddressManager from '@salesforce/userPermission/AccountAddressManager';

enum SetFocusMode {
    NONE,
    ADDRESS_LIST,
    EDIT_FORM,
}

const DEFAULTS = {
    showNewAddressButton: false,
    showNewAddressForm: false,
    existingAddressesOnly: true,
    readOnly: false,
    showAddressList: false,
    shippingAddressLimit: 6,
    shippingStencilItemCount: 6,
    shippingAddressLimitIncrease: 6,
    showShowMoreAddressesButton: false,
};

const DEFAULTSHIPPINGADDRESS: Address = {
    city: '',
    country: '',
    isDefault: false,
    name: '',
    firstName: '',
    lastName: '',
    postalCode: '',
    region: '',
    street: '',
};

const DEFAULTCONTACTINFO: ContactInfo = {
    phoneNumber: '',
};

const INPUT_ADDRESS_CHANGE_DEBOUNCE_WAIT = 3000;

export default class Shipping extends LightningElement implements CheckoutSavable {
    public static renderMode = 'light';
    @track private shippingAddress: Address = DEFAULTSHIPPINGADDRESS;
    @track private contactInfo: ContactInfo = DEFAULTCONTACTINFO;
    @track private _addresses: Address[] = [];
    private _initValue?: string;
    private _addressesInitialized = false;
    private _checkoutInformationInitialized = false;
    private _dismissible = false;
    private _checkoutMode: CheckoutMode = CheckoutMode.EDIT;
    private _isDirty = false;
    private _isSaved = true;

    /**
     * These flags used to synchronize automatic a11y focus changes with the render pipeline.
     *
     * - no change    -- _setFocusMode: NONE, _setFocusContext: unused
     * - existing CPA -- _setFocusMode: ADDRESS_LIST, _setFocusContext: addressId in address list to focus on
     * - new CPA      -- _setFocusMode: EDIT_FORM, _setFocusContext: unused
     */
    private _setFocusMode = SetFocusMode.NONE;
    private _setFocusContext = '';

    /**
     * Strings to show error message header and body
     * Empty strings hide the notification
     */
    private _errorLabels: ErrorLabels = noErrorLabels;

    private _showPersonName = true;
    private _readonlyDefaultAddress = false;
    private _showNewAddressForm = DEFAULTS.showNewAddressForm;
    private _existingAddressesOnly = DEFAULTS.existingAddressesOnly;
    private _showNewAddressButton = DEFAULTS.showNewAddressButton;
    private _showShowMoreAddressesButton = DEFAULTS.showShowMoreAddressesButton;
    private _showAddressList = DEFAULTS.showAddressList;
    private _canShowAddressList = DEFAULTS.showAddressList;
    @track private _address = DEFAULTSHIPPINGADDRESS;
    private _email!: string | undefined;
    private _shippingAddressLimit = DEFAULTS.shippingAddressLimit;
    private _isLoggedIn = false;
    private _isReadOnly = DEFAULTS.readOnly;
    private _pendingTimeout: ReturnType<typeof setTimeout> | null = null;
    private _showStencil = true;
    private get _shippingStencilItemCount(): number {
        return this.summaryModeEnabled ? 1 : DEFAULTS.shippingStencilItemCount;
    }

    @wire(SessionContextAdapter)
    private sessionHandler(response: StoreAdapterCallbackEntry<SessionContext>): void {
        if (response.data) {
            this._isLoggedIn = response.data.isLoggedIn;
            if (this.isGuestUser) {
                this._readonlyDefaultAddress = false;
                this._showNewAddressForm = true;
                this._existingAddressesOnly = false;
                this._showAddressList = false;
                this._canShowAddressList = false;
                // no explicit this._setFocusMode as focus should go to first focusable component
            } else {
                this._existingAddressesOnly = !hasAccountAddressManager;
            }
        }
    }

    @wire(CheckoutInformationAdapter)
    checkoutAdapterHandler(response: StoreAdapterCallbackEntry<CheckoutInformation>): void {
        // in builder mode wire adapter payload is empty. to prevet rendering an empty
        // component a design time subsitute sets a mock data payload in our constructor.
        if (this.builderMode) {
            return;
        }
        // ignore the initialization payloads that don't have data loaded yet, e.g. !response.loaded
        // ignore payloads with stale data, e.g. response.loading
        // ignore payloads checkout.ts will render, e.g. response.error
        if (!response.data || response.loading) {
            return;
        }

        // we only support one delivery group at this time.
        const deliveryAddress = response.data?.deliveryGroups?.items?.[0]?.deliveryAddress;
        const contactInfo = response.data?.contactInfo;
        const isLoading = !checkoutStatusIsReady(response.data?.checkoutStatus);
        const hasError = response.data?.errors?.length;

        // if we don't have local changes to keep update to the most recent state
        if (!this._isDirty && this._isSaved) {
            if (deliveryAddress && !isSameDeliveryAddress(this.shippingAddress, deliveryAddress)) {
                this.shippingAddress = deliveryAddress;
            }

            if (this.isGuestUser) {
                this.contactInfo = { ...contactInfo };
                this._address = this.shippingAddress;
                // setAddressesForRadioGroup never reached in guest mode so clear stencil here
                this._showStencil = false;
                // End EKG markers
                end('t-ekg-to-shipping-interactive');
                end('t-address-3');
                end('t-checkout-3');
                publishEkgLogs();
            }

            // auto select address on first load
            if (!isLoading && !this._checkoutInformationInitialized) {
                this._checkoutInformationInitialized = true;
                if (!this.isGuestUser && !hasError && deliveryAddress && this.summaryModeEnabled) {
                    this.dispatchShowSummaryModeEvent();
                } else {
                    this.dispatchHideSummaryModeEvent();
                }
                this.setAddresses();
            }
        }

    }

    private dispatchShowSummaryModeEvent(): void {
        this.dispatchEvent(
            new CustomEvent('showsummarymode', {
                bubbles: true,
                composed: true,
            })
        );
    }

    private dispatchHideSummaryModeEvent(): void {
        this.dispatchEvent(
            new CustomEvent('hidesummarymode', {
                bubbles: true,
                composed: true,
            })
        );
    }

    @wire(CheckoutAddressAdapter, {
        pageSize: '$shippingAddressLimit',
        addressType: 'Shipping',
        sortOrder: 'CreatedDateDesc',
    })
    private addressHandler(response: StoreAdapterCallbackEntry<ContactPointAddressData>): void {
        if (this.isAuthenticatedUser && !this.builderMode) {
            if (response?.data?.items) {
                const previousAddressesLength = this._addresses.length;
                // we're not really paging, we use nextPageUrl to know if more addresses are hidden/not loaded
                this._showShowMoreAddressesButton = response?.data?.nextPageUrl ? true : false;
                this._addresses = response.data.items;
                // auto select address on first load
                if (!this._addressesInitialized) {
                    this._addressesInitialized = true;
                    this.setAddresses();
                }
                if (this._showAddressList && previousAddressesLength < this._addresses.length) {
                    // when showing more addresses for a11y set focus to first new address
                    const value = this._addresses[previousAddressesLength]?.addressId;
                    if (value) {
                        this._setFocusMode = SetFocusMode.ADDRESS_LIST;
                        this._setFocusContext = value;
                    }
                }
            }

            // show API error notification
            // but do not change the message if we already are showing a transient "update" error
            if (response?.error && !this.isError) {
                this._errorLabels = generateErrorLabel(response.error);
            }
        }
    }

    /**
     * Retrieves guest email info value from store
     */
    @wire(CheckoutGuestEmailAdapter)
    private checkoutGuestEmailHandler(response: StoreAdapterCallbackEntry<string>): void {
        if (this.isGuestUser) {
            this._email = response?.data || '';
        }
    }

    /**
     * Disable the input controls and components when checkout mode is disabled.
     *
     * @private
     *
     * @type {boolean}
     */
    private get isDisabled(): boolean {
        return this._checkoutMode === CheckoutMode.DISABLED;
    }

    /**
     * Get label for country code of the shipping address
     *
     * @private
     *
     * @type {string}
     */
    private get countryLabel(): string {
        return this.shippingAddress.country ? getCountryLabel(this.shippingAddress.country) : '';
    }

    /**
     * When true means that sets the visibility of summary mode property in experience builder.
     * @type {boolean}
     */
    @api
    public summaryModeEnabled = false;

    /**
     * Returns true if the element's value is valid.
     *
     * @type {boolean}
     */
    @api
    public get checkValidity(): boolean {
        if (this._showNewAddressForm) {
            // when this._showNewAddressForm true when form is valid and can be queried
            return !!this.getShippingAddressComponent()?.checkValidity();
        }

        // true when an address is selected in the list
        return !!this._initValue;
    }

    /**
     * Returns true if the element's value is valid otherwise reports error and returns false.
     *
     * @type {boolean}
     */
    @api
    public reportValidity(): boolean {
        if (this._showNewAddressForm) {
            // when this._showNewAddressForm true when form is valid and can be queried
            return !!this.getShippingAddressComponent()?.reportValidity();
        }

        // true when an address is selected in the list
        return !!this._initValue;
    }

    @api
    public get readOnly(): boolean {
        return this._isReadOnly;
    }
    public set readOnly(value: boolean) {
        this._isReadOnly = value;
    }

    /**
     * Helper to test if error notification is showing
     * @type {boolean}
     */
    @api public get isError(): boolean {
        return !!this._errorLabels.header;
    }

    /**
     * the text that is displayed for component header for an existing address.
     */
    @api public componentHeaderEditAddressLabel: string | undefined;

    /**
     * the text that is displayed for default address checkbox.
     */
    @api public makeDefaultAddressLabel: string | undefined;

    /**
     * the text that is displayed for the edit address button.
     */
    @api public editAddressLabel: string | undefined;

    /**
     * the text displayed for the edit address phone number label
     */
    @api public phoneNumberLabel: string | undefined;

    /**
     * the text displayed for the edit address phone number placeholder text
     */
    @api public phoneNumberPlaceholderText: string | undefined;

    /**
     * the text that is displayed for returning to the list of addresses.
     */
    @api public backToListLabel: string | undefined;

    /**
     * the text that is displayed for new address button
     */
    @api public newAddressButtonLabel: string | undefined;

    /**
     * the text that is displayed for show more addresses button
     */
    @api public showMoreButtonLabel: string | undefined;

    /**
     * Sets how many addresses to display
     */
    @api
    get shippingAddressLimit(): number {
        return this._shippingAddressLimit;
    }
    set shippingAddressLimit(value: number) {
        this._shippingAddressLimit = value;
    }

    /**
     * Sets how many more addresses to show on click
     */
    @api shippingAddressLimitIncrease = DEFAULTS.shippingAddressLimitIncrease;

    /**
     * Address that populates the address input form
     */
    @api
    get address(): Address {
        return this._address;
    }
    set address(address: Address) {
        this._address = address;
    }

    /**
     * Keeps track if the context is Runtime or Design time (Experience Builder)
     */
    @api builderMode = false;

    /**
     * Default for whether to show or hide the form
     */
    @api
    get showNewAddressForm(): boolean {
        return this._showNewAddressForm;
    }

    set showNewAddressForm(showForm: boolean) {
        this._showNewAddressForm = showForm;
    }

    /**
     * Sets the visibility of the address list provided that the component is not in STENCIL mode.
     */
    @api
    get showAddressList(): boolean {
        return this._showAddressList && !this.showStencil;
    }
    set showAddressList(value: boolean) {
        this._showAddressList = value;
    }

    /**
     * The list of addresses to display in the radio group
     */
    @api
    get addresses(): Address[] {
        return this._addresses;
    }
    set addresses(addressList: Address[]) {
        this._addresses = addressList;
    }

    /**
     * The default address option to select in the radio group
     */
    @api
    get initialValue(): string | undefined {
        return this._initValue;
    }
    set initialValue(value: string | undefined) {
        this._initValue = value;
    }

    /**
     * Sets the visibility of the new address button provided that the component is not in STENCIL mode.
     */
    @api
    public get showNewAddressButton(): boolean {
        return this._showNewAddressButton && !this.showStencil;
    }

    public set showNewAddressButton(value: boolean) {
        this._showNewAddressButton = value;
    }

    /**
     * Sets show/hide show more address button
     */
    @api
    public get showShowMoreAddressesButton(): boolean {
        return this._showAddressList && this._showShowMoreAddressesButton;
    }

    public set showShowMoreAddressesButton(value: boolean) {
        this._showShowMoreAddressesButton = value;
    }

    /**
     * This method called when user clicks on "Next" button for the Shipping step.
     * Sets the shipping address from either the chosen Contact Point Address (radio) or a custom address (form inputs).
     * If a custom address, also creates a new Contact Point Address record.
     * Reject promise if data is invalid, thus short-circuiting checkout.ts#proceedToNextStep
     */
    @api
    public async checkoutSave(): Promise<void> {
        this._errorLabels = noErrorLabels;

        // there is no radio group component on first load in summary mode, getAddressFromRadioGroup gets undefined here
        // always set shipping address as default address if leaving or refreshing checkout page
        const initAddress = this._addresses.find((item) => this._initValue === item.addressId);
        const cpaAddress = this.getAddressFromRadioGroup() || initAddress;
        const customAddress = this.getAddressFromForm();
        let address = customAddress || cpaAddress;

        // if no address (guest user with incomplete data entry),
        // then Navigation forward won't be allowed.
        // UI validation errors already shown, so no need for generic error banner.
        if (!address) {
            throw new Error('delivery address required');
        }

        // reset dirty to capture new changes and rely on not saved to indicate dirty save in flight
        this._isDirty = false;
        this._isSaved = false;

        // (shallow) copy the address so it doesn't change under us during async calls
        address = Object.assign({}, address);

        // don't notify until all updates are done
        let checkoutInformation: CheckoutInformation | undefined;
        try {
            if (customAddress && this.isAuthenticatedUser) {
                // create or update the address
                if (!address.addressId) {
                    address = await createContactPointAddress({
                        ...address,
                        addressType: 'Shipping',
                    });
                    // change from new address to edit address mode (supply addressId)
                    this._address = address;
                    // make the new address the selected one
                    this._initValue = address.addressId;
                } else if (!isSameContactPointAddress(this.address, address)) {
                    await updateContactPointAddress({
                        ...address,
                        addressType: 'Shipping',
                    });
                }
            } else if (this.isGuestUser) {
                const contactInformation = this.getContactInfo();
                if (!isSameContactInfo(this.contactInfo, contactInformation)) {
                    // note: if billing is different than shipping ContactInfo will be overwritten during payment address step
                    checkoutInformation = await updateContactInformation(contactInformation);
                    // note: updateContactInformation is sync so no need for waitForCheckout here
                }
            }

            if (!isSameDeliveryAddress(this.shippingAddress, address)) {
                const deliveryAddressGroup: DeliveryGroup = {
                    deliveryAddress: address,

                    desiredDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    // shipping instructions are not required and do not change when not provided
                };
                //as updating shipping address back to default address, shipping should not be in summary mode anymore
                this.dispatchHideSummaryModeEvent();
                checkoutInformation = await updateShippingAddress(deliveryAddressGroup);
            }

            this._isSaved = true;
        } catch (e) {
            // show errors from update (PATCH) operations
            this._errorLabels = generateErrorLabel(e);
            this.dispatchHideSummaryModeEvent();
            throw e;
        } finally {
            // if we even partially modified the checkout state update the wire adapters
            // trigger polling and cart refresh
            if (checkoutInformation) {
                await notifyAndPollCheckout(checkoutInformation);
            }
        }

        // show API error notification
        // only shows the error if checkout information update reqeust is sent from this component
        // but do not change the message if we already are showing a transient "update" error
        // Throw error to keep it in the edit mode
        const readyCheckoutInformation = await waitForCheckout();
        // note: checkout.ts renders errors thrown from waitForCheckout here
        if (isCheckoutIntegrationError(readyCheckoutInformation) && !this.isError) {
            this._errorLabels = generateCheckoutIntegrationErrorLabel(readyCheckoutInformation);
            this.dispatchHideSummaryModeEvent();
            throw new Error(this._errorLabels.body);
        }
        // we are responsible for showing no shipping method error on behalf of shippingMethod.ts
        // here we see if any delivery methods are available for the selected delivery group/address.
        // however, we don't show the error until the user clicks proceed (next).
        // aside: we only support one delivery group at this time.
        const items = readyCheckoutInformation?.deliveryGroups?.items?.[0]?.availableDeliveryMethods;
        const noDeliveryMethods = !(Array.isArray(items) && items.length);
        if (noDeliveryMethods) {
            this._errorLabels = generateErrorLabel(noDeliveryMethodsLabels.body);
            this.dispatchHideSummaryModeEvent();
            throw new Error('no available methods for delivery address');
        }
    }

    /**
     * The current checkout mode for this component
     *
     * @type {CheckoutMode}
     */
    @api public get checkoutMode(): CheckoutMode {
        return this._checkoutMode;
    }

    set checkoutMode(value: CheckoutMode) {
        this._checkoutMode = value;
        this._isReadOnly = value === CheckoutMode.SUMMARY;
    }

    /**
     * Gets display name for shipping summary mode based on country.
     * Also, returns name or names (first and last) based on how the address
     * was saved.
     * @returns string - display name
     */
    private get displayName(): string | undefined {
        if (this.shippingAddress.firstName && this.shippingAddress.lastName) {
            return isLastNameFirstCountry(this.shippingAddress.country)
                ? `${this.shippingAddress.lastName} ${this.shippingAddress.firstName}`
                : `${this.shippingAddress.firstName} ${this.shippingAddress.lastName}`;
        }
        return this.shippingAddress.name || this.shippingAddress.firstName || this.shippingAddress.lastName;
    }

    /**
     * True if show any of the buttons. False otherwise.
     * @returns boolean
     */
    private get showButtons(): boolean {
        return this.showShowMoreAddressesButton || this.showNewAddressButton;
    }

    /**
     * Sets the address radio group options based on local variable _addresses contents.
     * Displays of the New Address button and form if no addresses.
     */
    private setAddresses(): void {
        // ensure we don't run before all relevant adapters have loaded
        if (!this._addressesInitialized || !this._checkoutInformationInitialized) {
            return;
        }
        // ensure selected value exists or select something else
        //
        let dispatchNeeded = false;
        if (!this._initValue && this._addresses.length) {
            // if nothing selected and no default address available select the first (default or most recently updated)
            this._initValue = this._addresses[0].addressId;
            this._isDirty = true;
            dispatchNeeded = true;
        }

        if (this._addresses.length > 0) {
            // hide new address form by default if we have at least one saved address
            this._canShowAddressList = true;
            this._showNewAddressButton = !this._existingAddressesOnly && !this.showNewAddressForm;
            this._showAddressList = true;
            this._address.isDefault = false;
        } else if (this._existingAddressesOnly) {
            // no existing addresses and not allowed to add any
            this._canShowAddressList = false;
            this._showNewAddressButton = false;
            this._showAddressList = false;
            // because the error is fatal we publish the error to checkout.ts via the wire adapter
            notifyAndPollCheckout(new Error(CheckoutError.NO_DELIVERY_ADDRESSES));
        } else {
            // show new address form by default if no saved addresses
            this._canShowAddressList = false;
            this._showNewAddressButton = false;
            this._showAddressList = false;
            this._showNewAddressForm = true;
            this._readonlyDefaultAddress = true;
            this._address.isDefault = true;
            this._setFocusMode = SetFocusMode.EDIT_FORM;
        }
        this._showStencil = false;
        // End EKG markers
        end('t-ekg-to-shipping-interactive');
        end('t-address-3');
        end('t-checkout-3');
        publishEkgLogs();
        if (dispatchNeeded) {
            // we dispatch after adjusting render flags like _showStencil correctly to help avoid stencil race conditions
            this.dispatchDataReadyEvent();
        }
    }

    /**
     * Finds the radio group of addresses and returns the selected one
     * @returns address - selected or specified address data or undefined if none selected
     */
    private getAddressFromRadioGroup(specifiedAddressId?: string): Address | undefined {
        const radioComponent = this.getShippingRadioGroupComponent();
        if (radioComponent) {
            const addressId = specifiedAddressId || radioComponent.value;
            return this._addresses.find((item) => addressId === item.addressId);
        }
        return undefined;
    }

    /**
     * Finds the input address list component
     * @returns radioComponent - input address list component
     */
    private getShippingRadioGroupComponent(): AddressVisualPicker | undefined {
        const radioComponent = this.getComponent<AddressVisualPicker>('[data-shipping-radio-group]');

        return radioComponent;
    }

    /**
     * Finds the input address form component
     * @returns shippingAddressComponent - input address component
     */
    private getShippingAddressComponent(): InputAddress | undefined {
        const shippingAddressComponent = this.getComponent<InputAddress>('[data-shipping-input-address]');

        return shippingAddressComponent;
    }

    /**
     * Finds the address input form and returns the inputed address data
     * @returns address - custom address data or undefined if invalid
     */
    private getAddressFromForm(): Address | undefined {
        const shippingAddressComponent = this.getShippingAddressComponent();
        if (shippingAddressComponent && shippingAddressComponent.reportValidity()) {
            return shippingAddressComponent.address;
        }
        return undefined;
    }

    /**
     * Finds the address input form and returns the inputed contact info data
     * @returns contactInfo - custom contact info data or empty object if invalid
     */
    private getContactInfo(): ContactInfo {
        let contactInfo = {};
        const shippingAddressComponent = this.getShippingAddressComponent();
        if (shippingAddressComponent && shippingAddressComponent.reportValidity()) {
            contactInfo = {
                ...shippingAddressComponent.contactInfo,
                email: this._email,
            };
        }
        return contactInfo;
    }

    private getComponent<T extends HTMLElement | LightningElement>(locator: Locator): T {
        return <T>(<unknown>this.querySelector(locator));
    }

    private get showBackToListLink(): boolean {
        return this._addresses.length > 0 && this._canShowAddressList;
    }

    private get isGuestUser(): boolean {
        return !this._isLoggedIn;
    }

    private get isAuthenticatedUser(): boolean {
        return this._isLoggedIn;
    }

    private get stencilType(): StencilType {
        return this.isGuestUser ? StencilType.DEFAULT_STENCIL : StencilType.SHIPPING_ADDRESS_PICKER;
    }

    private get showStencil(): boolean {
        return !this.builderMode && this._showStencil;
    }

    private get customLocale(): string {
        return getCustomLocale(this.shippingAddress.country || '');
    }

    private handleShowMoreAddressesClicked(): void {
        this._shippingAddressLimit = Number(this.shippingAddressLimit) + Number(this.shippingAddressLimitIncrease);
    }

    private handleNewAddressButtonClicked(): void {
        this._address = DEFAULTSHIPPINGADDRESS;
        this._readonlyDefaultAddress = false;
        this._showNewAddressForm = true;
        this._showNewAddressButton = false;
        this._showAddressList = false;
        this._setFocusMode = SetFocusMode.EDIT_FORM;
    }

    private handleCloseNewAddressFormClicked(): void {
        this._showNewAddressForm = false;
        this._showNewAddressButton = true;
        this._showAddressList = true;
    }

    private handleAddressOptionChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        this._initValue = event.detail.value;
        this._isDirty = true;
        this.dispatchDataReadyEvent();
    }

    /**
     * When the address changes and the input is valid emit a 'dataready` event
     * (See constructor for reassignment with debounce)
     *
     * @param event
     */
    private handleInputAddressChange(event: CustomEvent): void {
        this._isDirty = true;
        if (this._pendingTimeout !== null) {
            clearTimeout(this._pendingTimeout);
        }

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._pendingTimeout = setTimeout(() => {
            if (event?.detail?.valid) {
                this.dispatchDataReadyEvent();
            }
        }, INPUT_ADDRESS_CHANGE_DEBOUNCE_WAIT);
    }

    /**
     * When the address should be edited load the selected address into the form
     * enter edit mode but do not emit 'dataready'
     *
     * @param event
     */
    private handleEditAddress(event: CustomEvent): void {
        const address = this.getAddressFromRadioGroup(event?.detail?.value);
        if (!address) {
            return; // should not happen, but be robust
        }

        this._address = { ...address }; // shallow editable copy
        this._showNewAddressForm = true;
        this._showNewAddressButton = false;
        this._showAddressList = false;
        this._setFocusMode = SetFocusMode.EDIT_FORM;
        // cannot uncheck default address if set
        this._readonlyDefaultAddress = !!this._address.isDefault;

        // make the visible edited address the selected one
        if (this._initValue !== address.addressId) {
            this._isDirty = true;
            this._initValue = address.addressId;
            this.dispatchDataReadyEvent();
        }
    }

    /**
     *  Emit a 'dataready` event
     */
    private async dispatchDataReadyEvent(): Promise<void> {
        // need to give template time to propogate down to child components
        await Promise.resolve();
        if (this.checkValidity) {
            // Emit event to step when ready. checkout save can happen in step
            this.dispatchEvent(new CustomEvent('dataready', { bubbles: true, composed: true }));
        }
    }

    render(): HTMLElement {
        if (this.showStencil) {
            return templateStencil;
        }
        return this.readOnly ? templateReadonly : templateEdit;
    }

    /**
     * synchronize automatic a11y focus changes with the render pipeline
     */
    renderedCallback(): void {
        if (this._setFocusMode === SetFocusMode.ADDRESS_LIST) {
            // set the input focus to a specific address card as soon as it reaches the DOM
            const elt = this.getShippingRadioGroupComponent();
            if (elt) {
                elt.focusOnValue(this._setFocusContext);
                this._setFocusMode = SetFocusMode.NONE;
            }
        } else if (this._setFocusMode === SetFocusMode.EDIT_FORM) {
            // set the input focus to the edit form as soon as it reaches the DOM
            const elt = this.getShippingAddressComponent();
            if (elt) {
                elt.focus();
                this._setFocusMode = SetFocusMode.NONE;
            }
        }
    }
}
