import { LightningElement, api, wire } from 'lwc';
import { AppContextAdapter } from 'commerce/contextApi';
import type { AppContext } from 'commerce/contextApi';
import type { ProductDetailData, ProductPricingResult } from 'commerce/productApi';
import type { ProductTaxResult } from 'commerce/productApiInternal';
import type { StoreAdapterCallbackEntry } from 'experience/store';

export default class ProductPricing extends LightningElement {
    static renderMode = 'light';

    /**
     * Product api.
     *
     * @type { ProductDetailData | Record<string, never> | null }
     */
    @api
    product?: ProductDetailData | Record<string, never> | null;

    /**
     * Product pricing api.
     *
     * @type { ProductPricingResult | Record<string, never> | null}
     */
    @api
    productPricing?: ProductPricingResult | Record<string, never> | null;

    /**
     * product tax api.
     *
     * @type {ProductTaxResult }
     */

    @api
    productTax?: ProductTaxResult;

    /**
     * product variant api.
     *
     * @type {isValid: boolean }
     */

    @api
    productVariant?: {
        isValid: boolean | undefined;
    };

    @wire(AppContextAdapter)
    updateAppContext(entry: StoreAdapterCallbackEntry<AppContext>): void {
        if (entry.data) {
            this.taxLocaleType = entry.data.taxType;
        }
    }

    /**
     * Whether or not to show the negotiated price.
     *
     * @type {Boolean}
     */
    @api
    showNegotiatedPrice: boolean | undefined;

    /**
     * The color of the negotiated price label text.
     *
     * @type {string}
     */
    @api
    negotiatedPriceTextColor: string | undefined;

    /**
     * The size of the negotiated price label text.
     *
     * @type {string}
     */
    @api
    negotiatedPriceTextSize: string | undefined;

    /**
     * The negotiated price label text.
     *
     * @type {string}
     */
    @api
    negotiatedPriceLabel: string | undefined;

    /**
     * The color of the original price label text.
     */
    @api
    originalPriceTextColor: string | undefined;

    /**
     * The size of the original price label text.
     *
     * @type {string}
     */
    @api
    originalPriceTextSize: string | undefined;

    /**
     * The original price label text.
     *
     * @type {string}
     */
    @api
    originalPriceLabel: string | undefined;

    /**
     * The unavailable price label text.
     *
     * @type {string}
     */
    @api
    unavailablePriceLabel: string | undefined;

    /**
     * Whether or not to display the Original price
     *
     * @type {Boolean}
     */
    @api
    showOriginalPrice: boolean | undefined;

    /**
     * Whether or not to show the VAT Tax section.
     *
     * @type {Boolean}
     */
    @api
    showTaxIndication: boolean | undefined;

    /**
     * The Tax Included label text.
     *
     * @type {string}
     */
    @api
    taxIncludedLabel: string | undefined;

    /**
     * The size of the tax label text.
     *
     * @type {string}
     */
    @api
    taxLabelSize: string | undefined;

    /**
     * The color of the Tax label text.
     *
     * When the value is not set taxLabelColor will have a default value of STYLE_DEFAULTS.taxLabelColor
     *
     * @type {string}
     */
    @api
    taxLabelColor: string | undefined;

    /**
     * Tax locale type for the product.
     * Possible values are "Gross" and "Net"
     *
     * @type {string}
     */
    taxLocaleType: string | undefined;

    /**
     * Tax rate for the product.
     * When a given product is exempt, taxRatePercentage will be 0
     *
     * @type {number}
     */
    get taxRatePercentage(): number | undefined {
        const { taxPolicies = [] } = this.productTax || {};
        const taxRate = taxPolicies[0]?.taxRatePercentage;
        return taxRate !== null && taxRate !== undefined ? Number(taxRate) : undefined;
    }

    /**
     * The ISO 4217 currency code for the product detail page
     *
     * @type {string}
     */
    get currencyCode(): string | undefined {
        return this.productPricing?.currencyIsoCode || undefined;
    }

    /**
     * The localized negotiated price of the item.
     *
     * @type {string}
     */
    get negotiatedPrice(): string | undefined {
        return this.productPricing?.negotiatedPrice || undefined;
    }

    /**
     * The type of product, for example: 'Simple', 'Variation', 'VariationParent'
     * 'VariationParent' products are not available to buy.
     *
     * @type {string}
     */
    productClass: string | undefined;

    /**
     * The localized original price of the item.
     *
     * @type {string}
     */
    get originalPrice(): string | unknown {
        return this.productPricing?.listPrice || undefined;
    }
    /**
     * Gets the associated dxp CSS font size property for the given text size.
     *
     * @param {string} textSize
     *  The size of heading to be reflected by the returned CSS class.
     *  Valid values are: "small", "medium", and "large"
     *
     * @returns {string}
     *  The dxp CSS property matching the requested size, if one exists; otherwise, undefined.
     */
    dxpTextSize(textSize: string | undefined): string | undefined {
        let size;
        switch (textSize) {
            case 'small':
                size = 'var(--dxp-s-text-heading-small-font-size)';
                break;
            case 'medium':
                size = 'var(--dxp-s-text-heading-medium-font-size)';
                break;
            case 'large':
                size = 'var(--dxp-s-text-heading-large-font-size)';
                break;
            default:
                size = 'initial';
                break;
        }
        return size;
    }

    /**
     * Custom styling for the product price
     */
    get priceStyles(): string {
        return `--com-c-product-details-tax-info-label-color: ${this.taxLabelColor || 'initial'};
        --com-c-product-details-tax-info-label-size: ${this.dxpTextSize(this.taxLabelSize)};
        --com-c-product-details-original-price-label-color: ${this.originalPriceTextColor || 'initial'};
        --com-c-product-details-original-price-label-size: ${this.dxpTextSize(this.originalPriceTextSize)};
        --com-c-product-details-negotiated-price-label-color: ${this.negotiatedPriceTextColor || 'initial'};
        --com-c-product-details-negotiated-price-label-size: ${this.dxpTextSize(this.negotiatedPriceTextSize)};
        `;
    }

    /**
     * Should render pricing component if
     * the variantAttribute selection is not invalid AND
     * not a VariationParent product AND
     * pricing data is loaded AND
     * product data is loaded.
     *
     * We need to check both pricing data and product data are loaded.
     * We still want to render the pricing component if there is no data or error occurs instead of hiding the component completely,
     * because the pricing component has a price unavailable state we could leverage.
     *
     * @returns { boolean }
     */
    get displayPricing(): boolean {
        return (
            this.productVariant?.isValid !== false &&
            this.product?.productClass !== 'VariationParent' &&
            this.isProductDataAvailable &&
            this.isProductPricingDataAvailable
        );
    }

    get isProductDataAvailable(): boolean {
        return this.product !== undefined && this.product !== null;
    }

    get isProductPricingDataAvailable(): boolean {
        return this.productPricing !== undefined && this.productPricing !== null;
    }

    public renderedCallback(): void {
        this.classList.toggle('slds-hide', !this.displayPricing);
    }
}
