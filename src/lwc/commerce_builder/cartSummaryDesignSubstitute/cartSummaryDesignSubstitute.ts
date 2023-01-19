import { LightningElement, api } from 'lwc';
import type { Totals } from '../cartSummary/types';

/**
 * Default displayable Cart Totals.
 */
const DEFAULT_CART_TOTALS = {
    discountAmount: '-1000',
    originalPrice: '5000',
    shippingPrice: '0',
    subtotal: '4000',
    tax: '250',
    total: '3250',
};

/**
 * A summary display of cart total costs and savings.
 *
 * @slot headerText ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Summary", textDisplayInfo: "{\"headingTag\": \"h2\", \"textStyle\": \"heading-medium\"}", "textDecoration": "{\"bold\": true}" }}] })
 * @slot promotionsLabel ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Promotions", textDisplayInfo: "{\"headingTag\": \"p\", \"textStyle\": \"body-regular\"}" }}] })
 * @slot shippingLabel ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Shipping", textDisplayInfo: "{\"headingTag\": \"p\", \"textStyle\": \"body-regular\"}" }}] })
 * @slot subtotalLabel ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Subtotal", textDisplayInfo: "{\"headingTag\": \"p\", \"textStyle\": \"body-regular\"}" }}] })
 * @slot taxIncludedLabel ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Tax included", textDisplayInfo: "{\"headingTag\": \"p\", \"textStyle\": \"body-regular\"}", textAlign: "right" }}] })
 * @slot taxLabel ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Tax", textDisplayInfo: "{\"headingTag\": \"p\", \"textStyle\": \"body-regular\"}" }}] })
 * @slot totalLabel ({ locked: true, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Total", textDisplayInfo: "{\"headingTag\": \"p\", \"textStyle\": \"heading-small\"}", "textDecoration": "{\"bold\": true}" }}] })
 */
export default class CartSummaryDesignSubstitute extends LightningElement {
    /**
     * Enable the component to render in `light DOM` to query the elements within it.
     * @static
     */
    static renderMode = 'light';

    /**
     * Gets or sets the background color, specified as a valid CSS color representation.
     */
    @api public backgroundColor: string | undefined;

    /**
     * Gets or sets the color of the discount amount, specified as a valid CSS color representation.
     */
    @api public discountAmountTextColor: string | undefined;

    /**
     * Gets or sets the size of the discount amount, currently: 'small', 'medium', 'large'.
     */
    @api public discountAmountTextSize: string | undefined;

    /**
     * Gets or sets the text that is displayed for component header.
     */
    @api public headerText: string | undefined;

    /**
     * Gets or sets the color of the original price label text, specified as a valid CSS color representation.
     */
    @api public originalTextColor: string | undefined;

    /**
     * Gets or sets the size of the original price label text, currently: 'small', 'medium', 'large'.
     */
    @api public originalTextSize: string | undefined;

    /**
     * Gets or sets the text that is displayed for promotions.
     */
    @api public promotionsLabel: string | undefined;

    /**
     * Gets or sets the text that is displayed for shipping.
     */
    @api public shippingLabel: string | undefined;

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
     * Whether or not to show tax price.
     */
    @api public showTaxPrice = false;

    /**
     * Whether or not to show the tax included label.
     */
    @api public showTaxIncludedLabel = false;

    /**
     * Gets or sets the text that is displayed for subtotal.
     */
    @api public subtotalLabel: string | undefined;

    /**
     * Gets or sets the color of the subtotal price label text, specified as a valid CSS color representation.
     */
    @api public subtotalTextColor: string | undefined;

    /**
     * Gets or sets the size of the subtotal price label text, currently: 'small', 'medium', 'large'.
     */
    @api public subtotalTextSize: string | undefined;

    /**
     * Gets or sets the text for tax included label.
     */
    @api public taxIncludedLabel: string | undefined;

    /**
     * Gets or sets the tax included label text color, specified as a valid CSS color representation.
     */
    @api public taxIncludedLabelFontColor: string | undefined;

    /**
     * Gets or sets the tax included label text size, a value of 'small', 'medium', or 'large'.
     */
    @api public taxIncludedLabelFontSize: string | undefined;

    /**
     * Gets or sets the text that is displayed for tax.
     */
    @api public taxLabel: string | undefined;

    /**
     * Gets or sets the color of the tax price label text, specified as a valid CSS color representation.
     */
    @api public taxTextColor: string | undefined;

    /**
     * Gets or sets the tax price label text, a value of 'small', 'medium', or 'large'.
     */
    @api public taxTextSize: string | undefined;

    /**
     * Gets or sets the text that is displayed for total.
     */
    @api public totalLabel: string | undefined;

    /**
     * Gets or sets the total price label text, specified as a valid CSS color representation.
     */
    @api public totalTextColor: string | undefined;

    /**
     * Gets or sets the total price label text, a value of 'small', 'medium', or 'large'.
     */
    @api public totalTextSize: string | undefined;

    /**
     * Gets the default pricing information to be displayed for the cart totals.
     */
    get cartTotals(): Totals {
        return {
            discountAmount: this.showDiscountAmount ? DEFAULT_CART_TOTALS.discountAmount : undefined,
            originalPrice: this.showOriginalPrice ? DEFAULT_CART_TOTALS.originalPrice : undefined,
            shippingPrice: this.showShippingPrice ? DEFAULT_CART_TOTALS.shippingPrice : undefined,
            subtotal: this.showSubtotalPrice ? DEFAULT_CART_TOTALS.subtotal : undefined,
            tax: this.showTaxPrice && !this.showTaxIncludedLabel ? DEFAULT_CART_TOTALS.tax : undefined,
            total: DEFAULT_CART_TOTALS.total,
        };
    }
}
