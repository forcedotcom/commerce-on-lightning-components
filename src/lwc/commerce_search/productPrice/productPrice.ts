import { LightningElement, api } from 'lwc';
import { original, negotiated } from './priceStyleStringGenerators';
import originalPriceAltText from '@salesforce/label/B2B_Search_Product_Card.originalPriceAltText';
import priceUnavailable from '@salesforce/label/B2B_Search_Product_Card.priceUnavailable';
import priceLoading from '@salesforce/label/B2B_Search_Product_Card.priceLoading';
import type { ProductSearchPricesData, ProductSearchPriceConfiguration } from 'commerce/productApiInternal';

/**
 * Generates an SLDS CSS class representing heading text of a given size.
 *
 * @param {string} size
 *  The size of heading to be reflected by the returned CSS class.
 *  Valid values are: "small", "medium", and "large"
 *
 * @returns {string}
 *  The SLDS CSS class matching the requested size, if one exists; otherwise, undefined.
 */
export function generateClassForSize(size: string | undefined): string | undefined {
    let cssClass;

    switch (size) {
        case 'small':
            cssClass = 'slds-text-heading_small';
            break;
        case 'medium':
            cssClass = 'slds-text-heading_medium';
            break;
        case 'large':
            cssClass = 'slds-text-heading_large';
            break;
        default:
            // Undefined is our default for unrecognized values.
            cssClass = undefined;
            break;
    }

    return cssClass;
}

/**
 * Representation of the product price which is displayed in product information views
 */
export default class ProductPrice extends LightningElement {
    public static renderMode = 'light';

    /**
     * The prices display-data.
     *
     * @typedef {Object} Prices
     *
     * @property {string} [listingPrice]
     *  The the list price for the card item.
     *
     * @property {string} [negotiatedPrice]
     *  The the negotiated price for the card item.
     *
     * @property {string} [currencyIsoCode]
     *  The ISO 4217 currency code of all card item prices in the search result.
     *
     * @property {Boolean} isLoading
     *  Whether the price is in the loading state.
     */

    /**
     * The price UI configuration.
     *
     * @typedef {Object} PriceConfiguration
     *
     * @property {Boolean} showNegotiatedPrice
     *  Whether or not to show the negotiated price.
     *
     * @property {Boolean} showListingPrice
     *  Whether or not to show the original/list price.
     */

    /**
     * Supported price styling customizations.
     *
     * @typedef {Object} CustomStyles
     *
     * @property {string} ["negotiated-font-size"]
     *  The size of the negotiated price, currently: 'small', 'medium', 'large'.
     *
     * @property {string} ["negotiated-color"]
     *  The color of the negotiated price, specified as a valid CSS color representation.
     *
     * @property {string} ["original-font-size"]
     *  The size of the list price, currently: 'small', 'medium', 'large'.
     *
     * @property {string} ["original-color"]
     *  The color of the original/list price, specified as a valid CSS color representation.
     */

    /**
     * Gets or sets the prices display-data.
     *
     * @type {ProductSearchPricesData}
     */
    @api
    displayData?: ProductSearchPricesData;

    /**
     * Gets or sets the price configuration.
     *
     * @type {PriceConfiguration}
     */
    @api
    configuration?: ProductSearchPriceConfiguration;

    /**
     * Gets or sets the optional custom styles applied to the summary.
     *
     * @type {CustomStyles}
     */
    @api
    customStyles?: Record<string, string>;

    /**
     * Gets the normalized prices display-data.
     *
     * @type {Prices}
     */
    get normalizedDisplayData(): ProductSearchPricesData | undefined {
        return this.displayData;
    }

    /**
     * Gets the normalized price configuration.
     *
     * @type {PriceConfiguration}
     */
    get normalizedConfiguration(): ProductSearchPriceConfiguration | undefined {
        return this.configuration;
    }

    /**
     * Original price for a product, before any discounts or entitlements are applied.
     * Note: expects real numbers in string type.
     * @type {string}
     */
    get listingPrice(): string | undefined {
        return this.normalizedDisplayData?.listingPrice;
    }

    /**
     * Final price for a product after all discounts and/or entitlements are applied.
     * Note: expects real numbers in string type.
     * @type {string}
     */
    get negotiatedPrice(): string | undefined {
        return this.normalizedDisplayData?.negotiatedPrice;
    }

    /**
     * The alphabetic, three-letter ISO currency code for the prices listed
     * Examples: USD, GBP, JPY, etc.
     * @type {string}
     */
    get currencyCode(): string | undefined {
        return this.normalizedDisplayData?.currencyIsoCode;
    }

    /**
     * Whether to show the listing price, in addition to the negotiated price
     * @type {Boolean} showListingPrice
     */
    get showListingPrice(): boolean | undefined {
        return this.normalizedConfiguration?.showListingPrice;
    }

    /**
     * Whether to show the negotiated price
     * @type {Boolean} shownegotiatedPrice
     */
    get showNegotiatedPrice(): boolean | undefined {
        return this.normalizedConfiguration?.showNegotiatedPrice;
    }

    /**
     * Whether or not the pricing information is loading
     * @returns {Boolean}
     * @private
     */
    private get isLoading(): boolean {
        return this.normalizedDisplayData?.isLoading ?? false;
    }

    /**
     * Whether or not the pricing information is available
     * @returns {Boolean}
     * @private
     */
    private get isPriceAvailable(): boolean | undefined {
        // Don't display a price if the negotiated price isn't available as the buyer can't buy such a product.
        return this.showNegotiatedPrice && !!this.negotiatedPrice;
    }

    /**
     * Whether or not the listing price can be shown
     * @returns {Boolean}
     * @private
     */
    private get canShowListingPrice(): boolean | undefined {
        return (
            this.showListingPrice &&
            this.isPriceAvailable &&
            // Don't show listing price if it's less than or equal to the negotiated price.
            Number(this.listingPrice) > Number(this.negotiatedPrice)
        );
    }

    /**
     * Gets the custom CSS classes to apply to the original price.
     *
     * @returns {string}
     *
     * @readonly
     * @private
     */
    private get originalPriceCustomClasses(): string {
        const classes: string[] = [];
        const fontSize = this.customStyles?.['original-font-size'] ?? '';
        classes.push(fontSize);
        classes.push('listing-price');
        classes.push('value');

        // Strikethrough original price only if the negotiated price is visible
        // and if it's less than the listing price.
        classes.push('price-line-through');

        return classes.join(' ');
    }

    /**
     * Gets the custom CSS styles to apply to the original price.
     *
     * @returns {Object}
     *
     * @readonly
     * @private
     */
    private get originalPriceCustomStyles(): Record<string, string> {
        return original.createForStyles(this.customStyles);
    }

    /**
     * Gets the custom CSS classes to apply to the negotiated price.
     *
     * @returns {string}
     *
     * @readonly
     * @private
     */
    private get negotiatedPriceCustomClasses(): string {
        const negotiatedFontSize = this.customStyles && this.customStyles['negotiated-font-size'];
        return generateClassForSize(negotiatedFontSize) + ' negotiated-price value';
    }

    /**
     * Gets the custom CSS styles to apply to the negotiated price.
     *
     * @type {string}
     *
     * @readonly
     * @private
     */
    private get negotiatedPriceCustomStyles(): string {
        return negotiated.createForStyles(this.customStyles);
    }

    /**
     * Gets the required i18n labels.
     */
    get labels(): Record<string, string> {
        return {
            originalPriceAltText,
            priceUnavailable,
            priceLoading,
        };
    }
}
