import { api, LightningElement, track, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import type { LightningNavigationContext, LwcCustomEventTargetOf } from 'types/common';
import type BillingAddressGroup from '../billingAddressGroup/billingAddressGroup';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type { AppContext, SessionContext } from 'commerce/contextApi';
import { deepClone } from 'experience/util';
import { Locators } from './locators';
import { isLastNameFirstCountry } from 'commerce_unified_checkout/internationalization';

import type Payment from '../payment/payment';
import type {
    Locator,
    CheckoutInformation,
    ContactInfo,
    Address,
    PaymentCompleteResponse,
    ErrorLabels,
} from 'types/unified_checkout';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import {
    CheckoutInformationAdapter,
    notifyAndPollCheckout,
    updateContactInformation,
    placeOrder,
} from 'commerce/checkoutApi';
import templateEdit from './paymentWithBilling.html';
import { StencilType } from 'commerce_unified_checkout/stencil';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import { PaymentAuthorizationError } from 'commerce_unified_checkout/paymentAuthorizationError';
import { generateErrorLabel, noErrorLabels, paymentErrorLabels } from 'commerce_unified_checkout/errorHandler';
import { isSameContactInfo } from 'commerce_unified_checkout/addresses';

const DEFAULT_ADDRESS: Address = {
    name: '',
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    isDefault: false,
};

const DEFAULTCONTACTINFO: ContactInfo = {
    phoneNumber: '',
    email: '',
};

const DEFAULT_BILLING_ADDRESS_INFO = {
    showBillingAddressHeading: true,
};

const DEFAULTS = {
    showComponentHeader: true,
};

export default class PaymentWithBilling extends LightningElement {
    public static renderMode = 'light';

    @track private shippingAddress!: Address;
    @track private contactInfo: ContactInfo = DEFAULTCONTACTINFO;
    private _errorLabels: ErrorLabels = noErrorLabels;
    private webstoreId = '';
    private checkoutId!: string;

    private _isLoggedIn = false;
    private enterBillingAddress = false;
    private _checkoutMode: CheckoutMode = CheckoutMode.EDIT;
    private _stencilType: StencilType = StencilType.PAYMENT;

    /**
     * Keeps track if the context is Runtime or Design time (Experience Builder)
     */
    @api public builderMode = false;

    @api public showComponentHeader = DEFAULTS.showComponentHeader;

    @wire(NavigationContext)
    private navigationContext!: LightningNavigationContext;

    @wire(SessionContextAdapter)
    private sessionHandler(response: StoreAdapterCallbackEntry<SessionContext>): void {
        if (!this.builderMode && response?.data) {
            this._isLoggedIn = response?.data?.isLoggedIn;
        }
    }

    @wire(AppContextAdapter)
    private appContextHandler(response: StoreAdapterCallbackEntry<AppContext>): void {
        if (!this.builderMode && response?.data) {
            this.webstoreId = response?.data?.webstoreId;
        }
    }

    /**
     * Retrieves data from CheckoutStore
     */
    @wire(CheckoutInformationAdapter)
    checkoutAdapterHandler(response: StoreAdapterCallbackEntry<CheckoutInformation>): void {
        if (!this.builderMode && response?.data && !response.loading) {
            this.shippingAddress = this.getShippingAddress(response?.data);
            this.checkoutId = response?.data?.checkoutId || '';

            if (this.isGuestUser && response.data?.contactInfo) {
                this.contactInfo = deepClone(response.data?.contactInfo).value;
            }
        }
    }

    /**
     * Helper to test if error notification is showing
     * @type {boolean}
     */
    @api
    public get isError(): boolean {
        return !!this._errorLabels.header;
    }

    private get isGuestUser(): boolean {
        return !this._isLoggedIn;
    }

    private getComponent<T extends HTMLElement | LightningElement>(locator: Locator): T {
        return <T>(<unknown>this.querySelector(locator));
    }

    /**
     * Indicate this is the place order component (currently used in one page layout).
     *
     * @async
     *
     * @returns Promise<void>
     */
    @api
    public async placeOrder(): Promise<void> {
        return this.checkoutSave();
    }

    /**
     * This method called when user clicks on "Next" button for this step.
     * Once the payment and place order is completed successfully,
     * it will navigate to the order confirmation page.
     * Reject promise if data is invalid, thus short-circuiting checkout.ts#proceedToNextStep
     *
     * @async
     *
     * @returns Promise<void>
     */
    @api
    public async checkoutSave(): Promise<void> {
        this._errorLabels = noErrorLabels;

        if (!this.inputsValidated()) {
            throw new Error('Required data is missing');
        }

        try {
            await this.updateContactInfo();
            await this.completePayment();
            const result = await placeOrder();

            if (result?.orderReferenceNumber) {
                this.navigateToOrder(this.navigationContext, result.orderReferenceNumber);
            } else {
                throw new Error('Required orderReferenceNumber is missing');
            }
        } catch (e) {
            // Display generic paymentErrorLabels error message for PaymentAuthorizationError
            // Display specific error message for API error response
            this._errorLabels = generateErrorLabel(
                e instanceof PaymentAuthorizationError ? null : e,
                paymentErrorLabels
            );
            throw e;
        }
    }

    /**
     * Set contact information when it's a guest user
     * @async
     * @returns Promise
     */
    private async updateContactInfo(): Promise<void> {
        const billingAddressGroupComponent = this.getBillingAddressGroupComponent();

        if (this.isGuestUser) {
            // shallow copy the contactInfo because the object somehow becomes read-only
            const contactInfo = { ...this.contactInfo };
            if (this.enterBillingAddress) {
                // Update guest contact information first and last name from billing address
                const billingAddressComponent = billingAddressGroupComponent?.billingAddressComponent;
                contactInfo.firstName = billingAddressComponent?.firstName;
                contactInfo.lastName = billingAddressComponent?.lastName;
                contactInfo.phoneNumber = billingAddressComponent?.phoneNumber;
            } else {
                if (this.shippingAddress.firstName && this.shippingAddress.lastName) {
                    contactInfo.firstName = this.shippingAddress?.firstName;
                    contactInfo.lastName = this.shippingAddress?.lastName;
                } else {
                    const isLastNameFirst = isLastNameFirstCountry(this.shippingAddress.country!);
                    const names = this.shippingAddress?.name?.split(' ');
                    if (isLastNameFirst) {
                        contactInfo.firstName = names?.[1] || '';
                        contactInfo.lastName = names?.[0] || '';
                    } else {
                        contactInfo.firstName = names?.[0] || '';
                        contactInfo.lastName = names?.[1] || '';
                    }
                }
            }
            if (!isSameContactInfo(this.contactInfo, contactInfo)) {
                // note we set contactInfo.email in checkoutAdapterHandler
                this.contactInfo = contactInfo;

                await notifyAndPollCheckout(await updateContactInformation(this.contactInfo));
                // note: updateContactInformation is synchronous so no need for waitForCheckout here
            }
        }
    }

    /**
     * Set billing address information and complate the payment
     * @async
     * @returns Promise - CompletePaymentResponse
     */
    private async completePayment(): Promise<PaymentCompleteResponse> {
        const billingAddressGroupComponent = this.getBillingAddressGroupComponent();
        const address = this.enterBillingAddress ? billingAddressGroupComponent?.billingAddress : this.shippingAddress;
        const creditPaymentMethodComponent = this.getCreditPaymentMethodComponent();

        return creditPaymentMethodComponent.completePayment(this.checkoutId, address);
    }

    /**
     * The current checkout mode for this component
     *
     * @type {CheckoutMode}
     */
    @api
    public get checkoutMode(): CheckoutMode {
        return this._checkoutMode;
    }

    public set checkoutMode(value: CheckoutMode) {
        this._checkoutMode = value;
    }

    @api public showBillingAddressHeading = DEFAULT_BILLING_ADDRESS_INFO.showBillingAddressHeading;
    @api public billingAddressFieldsetLegendLabel: string | undefined;
    @api public billingAddressSameAsShippingAddressLabel: string | undefined;
    @api public phoneNumberLabel: string | undefined;
    @api public phoneNumberPlaceholderText: string | undefined;

    /**
     * Naviagte to the order confirmation page
     * @param navigationContext lightning naviagtion context
     * @param orderNumber the order number from place order api response
     */
    private navigateToOrder(navigationContext: LightningNavigationContext, orderNumber: string): void {
        navigate(navigationContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Order',
            },
            state: {
                orderNumber: orderNumber,
            },
        });
    }

    /**
     * Get shipping address from deliver groups from store
     * @param checkoutInformation checkoutInformation from checkoutStore
     * @returns shippingAddress - shipping address
     */
    private getShippingAddress(checkoutInformation: CheckoutInformation): Address {
        let shippingAddress: Address = DEFAULT_ADDRESS;
        const deliveryAddress = checkoutInformation?.deliveryGroups?.items?.[0]?.deliveryAddress;
        if (deliveryAddress) {
            shippingAddress = deliveryAddress;
        }
        return shippingAddress;
    }

    /**
     * Get the payment component
     * @returns creditPaymentMethodComponent - payment component
     */
    private getCreditPaymentMethodComponent(): Payment {
        const creditPaymentMethodComponent = this.getComponent<Payment>(Locators.paymentComponent);
        return creditPaymentMethodComponent;
    }

    /**
     * Get the billing address group component
     * @returns billingAddressGroupComponent - billing address group component
     */
    private getBillingAddressGroupComponent(): BillingAddressGroup {
        const billingAddressGroupComponent = this.getComponent<BillingAddressGroup>(
            Locators.billingAddressGroupLocator
        );
        return billingAddressGroupComponent;
    }

    /**
     * determine if shipping address is empty or not
     */
    private isAddressValid(address: Address): boolean {
        return !!address?.country;
    }

    /**
     * Validate the payment and billing address form inputs and report errors
     * @returns true - if pass the form validation
     */
    @api
    public reportValidity(): boolean {
        return this.inputsValidated();
    }

    /**
     * Validate the payment and billing address form inputs
     * @returns true - if pass the form validation
     */
    private inputsValidated(): boolean {
        const creditPaymentMethodComponent = this.getCreditPaymentMethodComponent();
        const billingAddressGroupComponent = this.getBillingAddressGroupComponent();

        if (this.enterBillingAddress) {
            return (
                creditPaymentMethodComponent.reportValidity() &&
                billingAddressGroupComponent?.billingAddressComponent.reportValidity()
            );
        }

        return creditPaymentMethodComponent.reportValidity() && this.isAddressValid(this.shippingAddress);
    }

    /**
     * Decides whether to show the stencil
     * @returns true - for showing stencil
     */
    private get _showStencil(): boolean {
        return !this.builderMode && this._checkoutMode === CheckoutMode.STENCIL;
    }

    /**
     * Returns a class that would hide the main content based on conditions.
     * @returns 'slds-hide' - for hiding main content
     */
    private get _showEditLayoutClass(): string {
        // Use slds-hide to allow the composed markup to load. Display stencil meanwhile
        return !this.builderMode && this._checkoutMode === CheckoutMode.STENCIL ? 'slds-hide' : '';
    }

    /**
     * Event handler for billing address same as shipping address checkbox
     * @param event billing address option change event
     */
    private handleBillingAddressOptionChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        this.enterBillingAddress = !event.detail.checked;
    }

    render(): HTMLElement {
        // Payment component currently does not support readOnly template.
        return templateEdit;
    }
}
