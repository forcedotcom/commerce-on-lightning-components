import { api, LightningElement, track, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import type { LightningNavigationContext, LwcCustomEventTargetOf } from 'types/common';
import type BillingAddressGroup from '../billingAddressGroup/billingAddressGroup';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type { AppContext, SessionContext } from 'commerce/contextApi';
import { Locators } from './locators';

import type {
    Locator,
    CheckoutInformation,
    Address,
    PaymentCompleteResponse,
    ErrorLabels,
} from 'types/unified_checkout';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { generateErrorLabel, noErrorLabels, paymentErrorLabels } from 'commerce_unified_checkout/errorHandler';
import { CheckoutInformationAdapter, placeOrder, simplePurchaseOrderPayment } from 'commerce/checkoutApi';

import { StencilType } from 'commerce_unified_checkout/stencil';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import { PaymentAuthorizationError } from 'commerce_unified_checkout/paymentAuthorizationError';

const DEFAULT_ADDRESS: Address = {
    name: '',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    isDefault: false,
};

const DEFAULT_BILLING_ADDRESS_INFO = {
    requireBillingAddress: true,
    showBillingAddressHeading: true,
};

export default class PurchaseOrder extends LightningElement {
    public static renderMode = 'light';

    @track private shippingAddress!: Address;
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

    /**
     * Show or hide the purchase order heading
     */
    @api public hideHeading = false;

    // PO related labels
    @api public headerLabel: string | undefined;
    @api public inputLabel: string | undefined;
    @api public placeholderLabel: string | undefined;

    // Billing Address related labels
    @api public requireBillingAddress = DEFAULT_BILLING_ADDRESS_INFO.requireBillingAddress;
    @api public showBillingAddressHeading = DEFAULT_BILLING_ADDRESS_INFO.showBillingAddressHeading;
    @api public billingAddressFieldsetLegendLabel: string | undefined;
    @api public billingAddressSameAsShippingAddressLabel: string | undefined;

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
     * Once the purchase order (payment api) and place order (checkout api) is completed successfully,
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
     * Set billing address information and complete the purchase order.
     * @async
     * @returns Promise - PaymentCompleteResponse
     */
    @api
    public async completePayment(): Promise<PaymentCompleteResponse> {
        let billingAddressGroupComponent;
        let address;

        if (this.requireBillingAddress) {
            billingAddressGroupComponent = this.getBillingAddressGroupComponent();
            address = this.transformToPaymentAddress(
                this.enterBillingAddress ? billingAddressGroupComponent?.billingAddress : this.shippingAddress
            );
        }

        const purchaseOrderInputValue = this.getPurchaseOrderInput().value;
        return simplePurchaseOrderPayment(this.checkoutId, purchaseOrderInputValue, address).catch(
            (errorResponse: PaymentCompleteResponse) => {
                const error = errorResponse.errors?.[0];
                throw new PaymentAuthorizationError(error);
            }
        );
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
     * Get purchase order input
     * @returns purchaseOrderInput - payment component
     */
    private getPurchaseOrderInput(): HTMLInputElement {
        return <HTMLInputElement>this.querySelector(Locators.purchaseOrderInput);
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
     * Validate the payment and billing address form inputs
     * @returns true - if pass the form validation
     */
    private inputsValidated(): boolean {
        const purchaseOrderInput = this.getPurchaseOrderInput();
        const billingAddressGroupComponent = this.getBillingAddressGroupComponent();

        if (!this.requireBillingAddress) {
            return purchaseOrderInput.reportValidity();
        }

        if (this.enterBillingAddress) {
            return (
                purchaseOrderInput.reportValidity() &&
                billingAddressGroupComponent?.billingAddressComponent.reportValidity()
            );
        }

        return purchaseOrderInput.reportValidity() && this.isAddressValid(this.shippingAddress);
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

    private transformToPaymentAddress(address: Address): Address {
        const result = {
            city: address.city,
            country: address.country,
            name: address.name,
            postalCode: address.postalCode,
            region: address.region,
            street: address.street,
        };
        return result;
    }
}
