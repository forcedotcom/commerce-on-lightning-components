import { LightningElement, api } from 'lwc';
import { getLabelForOriginalPrice } from 'commerce_cart/originalPriceLabelGenerator';
import type { Totals } from './types';

/**
 * A summary display of cart total prices.
 *
 * Note:
 * "Cart Summary" refers to the entire component. This is the terminology we use internally and to customers.
 * "Totals" refers to the prices that are displayed in the Cart Summary component.
 */
export default class Summary extends LightningElement {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light';

    /**
     * The pricing information to be displayed for the cart totals.
     * Accepts an object of the form
     *
     * {
     *     discountAmount: string | undefined;
     *     originalPrice: string | undefined;
     *     shippingPrice: string | undefined;
     *     subtotal: string | undefined;
     *     tax: string | undefined;
     *     total: string | undefined;
     * }
     *
     * If a value is not provided for a property, the corresponding price label will not be displayed.
     */
    @api public cartTotals: Totals | undefined;

    /**
     * The ISO 4217 currency code
     */
    @api public currencyCode: string | undefined;

    /**
     * Gets the dynamically generated aria label for the original price element.
     *
     * @returns {string} aria label for original price.
     *
     * @readonly
     * @private
     */
    private get ariaLabelForOriginalPrice(): string {
        return getLabelForOriginalPrice(this.currencyCode, this.cartTotals?.originalPrice);
    }
}
