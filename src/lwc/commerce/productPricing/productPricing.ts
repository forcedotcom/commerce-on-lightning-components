import { LightningElement, api } from 'lwc';
import strikethroughAssistiveText from '@salesforce/label/B2B_Product_Details_Summary.strikethroughAssistiveText';
import displayOriginalPriceEvaluator from './productPricingUtils';

/**
 * A display of product pricing.
 */
export default class ProductPricing extends LightningElement {
    public static renderMode = 'light';
    /**
     * Assistive text, required because screenreaders do not read out strikethrough styling
     * @returns {string} '(crossed out)'
     * @private
     */
    get strikethroughAssistiveText(): string {
        return strikethroughAssistiveText;
    }

    /**
     * The localized negotiated price label for the item.
     * @type {string}
     */
    @api
    negotiatedPriceLabel: string | undefined;

    /**
     * The localized original price label for the item.
     * @type {string}
     */
    @api
    originalPriceLabel: string | undefined;

    /**
     * The localized label to display when no pricing is available
     * @type {string}
     */
    @api
    unavailablePriceLabel: string | undefined;

    /**
     * The localized negotiated price of the item.
     * @type {string}
     */
    @api
    negotiatedPrice: string | undefined;

    /**
     * The localized original price of the item.
     * @type {string}
     */
    @api
    originalPrice: string | undefined;

    /**
     * The ISO 4217 currency code for the product detail page
     *
     * @type {string}
     */
    @api
    currencyCode: string | undefined;

    /**
     * Whether or not to display the negotiated price
     * @type {boolean}
     */
    @api
    showNegotiatedPrice = false;

    /**
     * Whether or not to display the original price
     * @type {boolean}
     */
    @api
    showOriginalPrice = false;

    /**
     * Whether or not to display the tax inlcuded text
     * @type {Boolean}
     */
    @api
    showTaxIndication = false;

    /**
     * The Tax Included label text.
     *
     * @type {string}
     */
    @api
    taxIncludedLabel: string | undefined;

    /**
     * Tax locale type for the product.
     * Possible values are "Gross" and "Net"
     *
     * @type {string}
     */
    @api
    taxLocaleType: string | undefined;

    /**
     * Tax rate for the product.
     * When a given product is exempt, taxRate will be 0
     *
     * @type {number}
     */
    @api
    taxRate: number | undefined;

    /**
     * Gets whether Tax Information can be shown. Will only be true
     * when taxLocaleType is "Gross", showTaxIndication is configured to be shown and
     * taxRate is not 0 or when taxRate is undefined (this scenario occurs when CommerceTax perm is not enabled)
     *
     * @type {boolean}
     */
    get taxInfoVisible(): boolean {
        if (this.showTaxIndication) {
            return this.isPriceAvailable && this.taxLocaleType === 'Gross' && this.taxRate !== 0;
        }

        return false;
    }

    /**
     * Whether or not to display the original price
     * @returns {boolean}
     * @private
     */
    get displayOriginalPrice(): boolean {
        return displayOriginalPriceEvaluator(
            this.showNegotiatedPrice,
            this.showOriginalPrice,
            this.negotiatedPrice,
            this.originalPrice
        );
    }

    /**
     * Whether or not to display the negotiated price
     * @returns {boolean}
     * @private
     */
    get displayNegotiatedPrice(): boolean {
        return this.showNegotiatedPrice && !!this.negotiatedPrice;
    }

    /**
     * Whether or not to display the assistive text for strike-through text
     * @returns {boolean}
     * @private
     */
    get displayAssistiveText(): boolean {
        return this.displayNegotiatedPrice && this.displayOriginalPrice;
    }

    /**
     * Whether or not the pricing information is available
     * @returns {boolean}
     *  true if negotiated price exists and needs to be shown, false otherwise
     * @private
     */
    get isPriceAvailable(): boolean {
        return this.showNegotiatedPrice && !!this.negotiatedPrice;
    }

    /**
     * Whether there is an negotiated price label to display.
     * @returns {boolean}
     * @private
     */
    get hasNegotiatedPriceLabel(): boolean {
        return !!this.negotiatedPriceLabel;
    }

    /**
     * Whether there is an original price label to display.
     * @returns {boolean}
     * @private
     */
    get hasOriginalPriceLabel(): boolean {
        return !!this.originalPriceLabel;
    }
}
