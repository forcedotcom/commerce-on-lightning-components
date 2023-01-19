import { api, LightningElement, wire } from 'lwc';
import { CartSummaryAdapter } from 'commerce/cartApi';
import type { CommerceError } from 'commerce/cartApi';
import type { CartSummaryData } from 'commerce/cartApi';
import type { CartSummaryInformation, Totals } from './types';
import currency from '@salesforce/i18n/currency';
import canDisplayOriginalPrice from 'commerce_cart/originalPriceDisplayEvaluator';
import { displayDiscountPrice } from 'commerce_unified_promotions/discountPriceDisplayEvaluator';
import { createStyleString } from 'community_styling/inlineStyles';
import { getErrorInfo } from 'commerce_cart/failedActionEvaluator';
import type { ErrorLabels } from 'commerce_cart/types';
import {
    webstoreNotFound,
    effectiveAccountNotFound,
    insufficientAccess,
    defaultErrorMessage,
    invalidInput,
} from './labels';
import type { ToastConfig } from 'lightning/toast';
import Toast from 'lightning/toast';

/**
 * Error code returned for an empty cart.
 */
const MISSING_RECORD = 'MISSING_RECORD';

/**
 * Tax locale type.
 * A value of 'Net' means tax is not included in final price.
 * A value of 'Gross' means tax is included in final price.
 */
type TaxType = 'Net' | 'Gross';

/**
 * A summary display of cart total costs and savings.
 *
 * Note:
 * "Cart Summary" refers to the entire component. This is the terminology we use internally and to customers.
 * "Totals" refers to the prices that are displayed in the Cart Summary component.
 *
 * @slot headerText ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Summary", textDisplayInfo: "{\"headingTag\": \"h2\", \"textStyle\": \"heading-medium\"}", "textDecoration": "{\"bold\": true}" }}] })
 * @slot promotionsLabel ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Promotions", textDisplayInfo: "{\"headingTag\": \"p\", \"textStyle\": \"body-regular\"}" }}] })
 * @slot shippingLabel ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Shipping", textDisplayInfo: "{\"headingTag\": \"p\", \"textStyle\": \"body-regular\"}" }}] })
 * @slot subtotalLabel ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Subtotal", textDisplayInfo: "{\"headingTag\": \"p\", \"textStyle\": \"body-regular\"}" }}] })
 * @slot taxIncludedLabel ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Tax included", textDisplayInfo: "{\"headingTag\": \"p\", \"textStyle\": \"body-regular\"}", textAlign: "right" }}] })
 * @slot taxLabel ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Tax", textDisplayInfo: "{\"headingTag\": \"p\", \"textStyle\": \"body-regular\"}" }}] })
 * @slot totalLabel ({ locked: true, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Total", textDisplayInfo: "{\"headingTag\": \"p\", \"textStyle\": \"heading-small\"}", "textDecoration": "{\"bold\": true}" }}] })
 */
export default class CartSummary extends LightningElement {
    /**
     * Enable the component to render as light DOM
     * @static
     */
    public static renderMode = 'light';

    /**
     * Gets or sets the background color, specified as a valid CSS color representation.
     */
    @api public backgroundColor: string | undefined;

    /**
     * Gets or sets the mock cart totals for experience builder.
     */
    @api public cartTotals: Totals | undefined;

    /**
     * Gets or sets the color of the discount amount, specified as a valid CSS color representation.
     */
    @api public discountAmountTextColor: string | undefined;

    /**
     * Gets or sets the size of the discount amount, currently: 'small', 'medium', 'large'.
     */
    @api public discountAmountTextSize: string | undefined;

    /**
     * Gets or sets the color of the original price label text, specified as a valid CSS color representation.
     */
    @api public originalTextColor: string | undefined;

    /**
     * Gets or sets the size of the original price label text, currently: 'small', 'medium', 'large'.
     */
    @api public originalTextSize: string | undefined;

    /**
     * Gets or sets the color of the shipping price label text, specified as a valid CSS color representation.
     */
    @api public shippingTextColor: string | undefined;

    /**
     * Gets or sets the size of the shipping price label text, currently: 'small', 'medium', 'large'.
     */
    @api public shippingTextSize: string | undefined;

    /**
     * Whether or not to display the discount price.
     */
    @api public showDiscountAmount = false;

    /**
     * Whether or not to show the original price.
     */
    @api public showOriginalPrice = false;

    /**
     * Whether or not to show shipping price.
     */
    @api public showShippingPrice = false;

    /**
     * Whether or not show subtotal price.
     */
    @api public showSubtotalPrice = false;

    /**
     * Whether or not to show the tax included label.
     */
    @api public showTaxIncludedLabel = false;

    /**
     * Whether or not to show tax price.
     */
    @api public showTaxPrice = false;

    /**
     * Gets or sets the color of the subtotal price label text, specified as a valid CSS color representation.
     */
    @api public subtotalTextColor: string | undefined;

    /**
     * Gets or sets the size of the subtotal price label text, currently: 'small', 'medium', 'large'.
     */
    @api public subtotalTextSize: string | undefined;

    /**
     * Gets or sets the tax included label text color, specified as a valid CSS color representation.
     */
    @api public taxIncludedLabelFontColor: string | undefined;

    /**
     * Gets or sets the tax included label text size, a value of 'small', 'medium', or 'large'.
     */
    @api public taxIncludedLabelFontSize: string | undefined;

    /**
     * Gets or sets the color of the tax price label text, specified as a valid CSS color representation.
     */
    @api public taxTextColor: string | undefined;

    /**
     * Gets or sets the tax price label text, a value of 'small', 'medium', or 'large'.
     */
    @api public taxTextSize: string | undefined;

    /**
     * Gets or sets the total price label text, specified as a valid CSS color representation.
     */
    @api public totalTextColor: string | undefined;

    /**
     * Gets or sets the total price label text, a value of 'small', 'medium', or 'large'.
     */
    @api public totalTextSize: string | undefined;

    /**
     * Gets cart summary data transformed from Api response.
     */
    private cartSummaryInfo = <CartSummaryInformation>{};

    /**
     * Gets or sets whether cart items exist or not.
     * @type {boolean}
     */
    private _hasCartItems = false;

    /**
     * Sets the custom background color and custom CSS properties for the cart summary component.
     */
    private get cartSummaryCustomCssStyles(): string {
        const discountAmountDxpTextSize = this.dxpTextSize(this.discountAmountTextSize);
        const originalDxpTextSize = this.dxpTextSize(this.originalTextSize);
        const shippingDxpTextSize = this.dxpTextSize(this.shippingTextSize);
        const subtotalDxpTextSize = this.dxpTextSize(this.subtotalTextSize);
        const textIncludedLabelDxpTextSize = this.dxpTextSize(this.taxIncludedLabelFontSize);
        const taxDxpTextSize = this.dxpTextSize(this.taxTextSize);
        const totalDxpTextSize = this.dxpTextSize(this.totalTextSize);

        const customStylingProperties = {
            'background-color': this.backgroundColor,
            '--com-c-cart-summary-discount-amount-text-color': this.discountAmountTextColor,
            '--com-c-cart-summary-discount-amount-text-size': `var(${discountAmountDxpTextSize})`,
            '--com-c-cart-summary-original-text-color': this.originalTextColor,
            '--com-c-cart-summary-original-text-size': `var(${originalDxpTextSize})`,
            '--com-c-cart-summary-shipping-text-color': this.shippingTextColor,
            '--com-c-cart-summary-shipping-text-size': `var(${shippingDxpTextSize})`,
            '--com-c-cart-summary-subtotal-text-color': this.subtotalTextColor,
            '--com-c-cart-summary-subtotal-text-size': `var(${subtotalDxpTextSize})`,
            '--com-c-cart-summary-tax-included-label-font-color': this.taxIncludedLabelFontColor,
            '--com-c-cart-summary-tax-included-label-font-size': `var(${textIncludedLabelDxpTextSize})`,
            '--com-c-cart-summary-tax-text-color': this.taxTextColor,
            '--com-c-cart-summary-tax-text-size': `var(${taxDxpTextSize})`,
            '--com-c-cart-summary-total-text-color': this.totalTextColor,
            '--com-c-cart-summary-total-text-size': `var(${totalDxpTextSize})`,
        };
        return createStyleString(customStylingProperties);
    }

    /**
     * The totals to be displayed in the cart summary.
     */
    private get cartSummaryTotals(): Totals | undefined {
        return this.cartTotals || this.transformCartTotals();
    }

    /**
     * The ISO 4217 currency code.
     */
    private get currencyCode(): string {
        return this.cartSummaryInfo.currencyCode || currency;
    }

    /**
     * The Discount Price.
     */
    private get discountAmount(): string | undefined {
        return this.cartSummaryInfo.totals?.discountAmount;
    }

    /**
     * Whether or not to display the cart summary component.
     */
    get displayCartSummary(): boolean {
        return this.cartTotals !== undefined || this._hasCartItems;
    }

    /**
     * The Original Price.
     */
    private get originalPrice(): string | undefined {
        return this.cartSummaryInfo.totals?.originalPrice;
    }

    /**
     * The Shipping Price.
     */
    private get shippingPrice(): string | undefined {
        return this.cartSummaryInfo.totals?.shippingPrice;
    }

    /**
     * Whether or not to display the discount amount.
     */
    private get _showDiscountAmount(): boolean {
        return displayDiscountPrice(this.showDiscountAmount, this.discountAmount);
    }

    /**
     * Whether or not to display the original price.
     */
    private get _showOriginalPrice(): boolean {
        return canDisplayOriginalPrice(true, this.showOriginalPrice, this.subtotalPrice, this.originalPrice);
    }

    /**
     * Gets whether or not to show the tax price
     *
     * Tax price will only be displayed when
     *  - the tax type is 'Net'
     *  - and the showTaxPrice builder setting is true
     */
    private get _showTaxPrice(): boolean {
        return this.taxType === 'Net' && this.showTaxPrice;
    }

    /**
     * The Subtotal price.
     */
    private get subtotalPrice(): string | undefined {
        return this.cartSummaryInfo.totals?.subtotal;
    }

    /**
     * Get tax included label.
     *
     * The tax included label will only be displayed if
     *     - mock cartTotals is not provided AND tax type is 'Gross' AND the showTaxIncludedLabel builder setting is true
     *     OR
     *     - mock cartTotals is provided AND the showTaxIncludedLabel builder setting is true
     */
    private get _showTaxIncludedLabel(): boolean {
        return ((!this.cartTotals && this.taxType === 'Gross') || !!this.cartTotals) && this.showTaxIncludedLabel;
    }

    /**
     * The Tax Price.
     */
    private get taxPrice(): string | undefined {
        return this.cartSummaryInfo.totals?.tax;
    }

    /**
     * The Total Price.
     */
    private get totalPrice(): string | undefined {
        return this.cartSummaryInfo.totals?.total;
    }

    /**
     * The store's tax type.
     * Value is either 'Net' (tax not included in final price) or 'Gross' (tax is included in final price).
     * Undefined if taxType is not provided or if mock cartTotals is provided.
     */
    private get taxType(): TaxType | undefined {
        switch (this.cartSummaryInfo.taxType) {
            case 'Net':
                return 'Net';
            case 'Gross':
                return 'Gross';
            default:
                return undefined;
        }
    }

    /**
     * Retrieves the information for the current cart
     */
    @wire(CartSummaryAdapter)
    private cartSummary({ data, error }: { data: CartSummaryData; error: CommerceError }): void {
        if (data) {
            this.cartSummaryInfo = {
                currencyCode: data.currencyIsoCode || undefined,
                taxType: data.taxType || undefined,
                totals: {
                    discountAmount: data.totalPromotionalAdjustmentAmount,
                    originalPrice: data.totalListPrice,
                    shippingPrice: data.totalChargeAmount,
                    subtotal: data.totalProductAmount,
                    tax: data.totalTaxAmount,
                    total: data.grandTotalAmount,
                },
            };
            this._hasCartItems = data.uniqueProductCount !== undefined && data.uniqueProductCount > 0;
        } else {
            this.cartSummaryInfo = <CartSummaryInformation>{};
            this._hasCartItems = false;
            // Discerning here for the context/location (builder or store) we are in by checking cartTotals
            if (error && !this.cartTotals) {
                const errorCode = error?.code;
                // If the error code is MISSING_RECORD, the cart is empty and we do not surface a toast message
                if (errorCode !== MISSING_RECORD) {
                    const { message } = getErrorInfo(errorCode, this.cartSummaryLocalizedErrorMessages);
                    const toast = <ToastConfig>{
                        label: message,
                        variant: 'error',
                    };
                    Toast.show(toast, this);
                }
            }
        }
    }

    /**
     * Cart Summary localized error labels.
     *
     * @returns {Object}
     * Object containg the localized error labels associated for the appropriate error code.
     */
    private get cartSummaryLocalizedErrorMessages(): ErrorLabels {
        return {
            webstoreNotFound: webstoreNotFound,
            effectiveAccountNotFound: effectiveAccountNotFound,
            insufficientAccess: insufficientAccess,
            defaultErrorMessage: defaultErrorMessage,
            invalidInput: invalidInput,
            unqualifiedCart: '',
            maximumLimitExceeded: '',
            alreadyApplied: '',
            blockedExclusive: '',
            limitExceeded: '',
            gateDisabled: '',
            tooManyRecords: '',
            itemNotFound: '',
            missingRecord: '',
            invalidBatchSize: '',
        };
    }

    /**
     * Gets the associated dxp CSS font size property for the given text size.
     *
     * @param {string} fontSizeValue
     *  The size of heading to be reflected by the returned CSS class.
     *  Valid values are: "small", "medium", and "large"
     *
     * @returns {string}
     *  The dxp CSS property matching the requested size, if one exists; otherwise, an empty string.
     */
    dxpTextSize(fontSizeValue: string | undefined): string {
        switch (fontSizeValue) {
            case 'small':
                return '--dxp-s-text-heading-small-font-size';
            case 'medium':
                return '--dxp-s-text-heading-medium-font-size';
            case 'large':
                return '--dxp-s-text-heading-large-font-size';
            default:
                return '';
        }
    }

    /**
     * Transforms cart totals data with display logic.
     */
    transformCartTotals(): Totals {
        return {
            discountAmount: this._showDiscountAmount ? this.discountAmount : undefined,
            originalPrice: this._showOriginalPrice ? this.originalPrice : undefined,
            shippingPrice: this.showShippingPrice ? this.shippingPrice : undefined,
            subtotal: this.showSubtotalPrice ? this.subtotalPrice : undefined,
            tax: this._showTaxPrice ? this.taxPrice : undefined,
            total: this.totalPrice ? this.totalPrice : undefined,
        };
    }
}
