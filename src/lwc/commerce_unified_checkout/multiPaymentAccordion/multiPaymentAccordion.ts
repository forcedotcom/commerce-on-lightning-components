import { LightningElement, api, wire } from 'lwc';
import type MultiPaymentAccordionSection from '../multiPaymentAccordionSection/multiPaymentAccordionSection';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import type { CheckoutSavable } from 'types/unified_checkout';
import type { SessionContext } from 'commerce/contextApi';
import { SessionContextAdapter } from 'commerce/contextApi';
import type { StoreAdapterCallbackEntry } from 'experience/store';

/**
 * The multi payment accordion component is a B2B payment component with an accordion UI layout style.
 * This component consists of only two payment options, credit card or B2B purchase order.
 *
 * For the credit card option please see the checkout payment component for implementation details.
 * For the purchase order option please see the purchase order component for implementation details.
 *
 */
export default class MultiPaymentAccordion extends LightningElement implements CheckoutSavable {
    // Phone number labels required for paymentWithBilling (b2c), but no guest b2b checkout for 242.
    // We will expose these as properties in 244 once guest checkout is supported.
    private _phoneNumberLabel = ' ';
    private _phoneNumberPlaceholderText = ' ';
    private _isPreviewMode = false;

    /**
     * Do not show the header for the payment component
     * @private
     * @type boolean
     */
    private _showComponentHeader = false;

    /**
     * Set the credit-card section by default
     * @private
     * @type string
     */
    private selectedSection = 'credit-card';

    /**
     * Expand or collapse credit card section
     * @private
     */
    private get isCreditCardExpanded(): boolean {
        // Always expand this section in builder mode
        return this.selectedSection === 'credit-card' || this._isPreviewMode;
    }

    /**
     * Expand or collapse purchase order section
     * @private
     */
    private get isPurchaseOrderExpanded(): boolean {
        // Always expand this section in builder mode
        return this.selectedSection !== 'credit-card' || this._isPreviewMode;
    }

    /**
     * Credit Card Heading Label
     */
    @api public cardPaymentLabel: string | undefined;

    /**
     * The Purchase Order Header Label
     * @type string
     */
    @api public headerLabel: string | undefined;

    /**
     * The Purchase Order Number Field Label
     * @type string
     */
    @api public inputLabel: string | undefined;

    /**
     * Purchase Order Number Field Ghost Text
     * @type string
     */
    @api public placeholderLabel: string | undefined;

    /**
     * Require Billing Address for Purchase Order
     * @type boolean
     */
    @api public requireBillingAddress = false;

    /**
     * Show Billing Address Heading
     * @type boolean
     */
    @api public showBillingAddressHeading = false;

    /**
     * Billing Address Heading
     * @type string
     */
    @api public billingAddressFieldsetLegendLabel: string | undefined;

    /**
     * Use Same Address for Billing Label
     * @type string
     */
    @api public billingAddressSameAsShippingAddressLabel: string | undefined;

    /**
     * The current checkout mode for this component
     * @type {CheckoutMode}
     */
    @api
    public checkoutMode: CheckoutMode = CheckoutMode.EDIT;

    @wire(SessionContextAdapter)
    private sessionHandler(response: StoreAdapterCallbackEntry<SessionContext>): void {
        this._isPreviewMode = !!response?.data?.isPreview;
    }

    /**
     * Get the selected checkotu payment component.
     * @param locator
     * @private
     */
    private getPaymentComponent<T extends HTMLElement | LightningElement>(locator: string): T {
        return <T>(<unknown>this.template.querySelector(locator));
    }

    /**
     * Handle select section event. Keep track of selected section name.
     * @param event
     */
    public handleSectionSelected(event: CustomEvent<{ name: string }>): void {
        this.selectedSection = event.detail.name;
    }

    /**
     * Indicate this is the place order component (currently used in one-page layout).
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
     *
     * @async
     *
     * @returns Promise<void>
     */
    @api
    public async checkoutSave(): Promise<void> {
        const paymentComponent = this.getPaymentComponent<MultiPaymentAccordionSection>(
            `[data-accordion-section-key="${this.selectedSection}"]`
        ).paymentComponent;

        if (paymentComponent && paymentComponent.placeOrder) {
            await paymentComponent.placeOrder();
        }
    }
}
