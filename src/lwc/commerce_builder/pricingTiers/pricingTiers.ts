import { LightningElement, api, wire } from 'lwc';
import type { ProductPricingResult, ProductPriceAdjustmentTierData, ProductDetailData } from 'commerce/productApi';
import { transformTierAdjustmentContents } from './pricingTiersUtility';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type { SessionContext } from 'commerce/contextApi';
import { SessionContextAdapter } from 'commerce/contextApi';
import type { SelectedVariant } from './types';

/**
 * Dedicated Building Block component which displays pricing tiers for a product with tiered discounts.
 *
 * @slot title ({ defaultContent: [ { descriptor: "dxp_base/textBlock", attributes: { "textDisplayInfo": "{\"headingTag\": \"h1\", \"textStyle\": \"heading-medium\"}", text: "Tier Discounts"} }]})
 *
 */
export default class PricingTiers extends LightningElement {
    static renderMode = 'light';

    /**
     *  The row label text displayed for the second row of adjustment tiers where the quantities are displayed.
     */
    @api
    quantityRowLabel?: string;

    /**
     *  The row label text displayed for the first row of adjustment tiers where the discounts per unit are displayed.
     */
    @api
    discountRowLabel?: string;

    /**
     * Border radius of the price adjustment tiers
     */
    @api
    borderRadius?: number;

    /**
     * Background color of the price adjustment tiers
     */
    @api
    backgroundColor?: string;

    /**
     * Row title text for price adjustment tiers
     */
    @api
    rowTitleTextColor?: string;

    /**
     * Label text for price adjustment tiers
     */
    @api
    labelTextColor?: string;

    /**
     * Color for the price adjustment tiers
     */
    @api
    textColor?: string;

    /**
     * Border Color of the price adjustment tiers
     */
    @api
    borderColor?: string;

    /**
     * Product detail data binding from Data Provider
     */
    @api
    product?: ProductDetailData;

    /**
     * See SelectedVariant in ProductDataProvider
     */
    @api
    productVariant?: SelectedVariant;

    /**
     * Product Pricing API response data
     *
     * @type { ProductPricingResult | Record<string, never> }
     */
    @api
    productPricing?: ProductPricingResult | Record<string, never>;

    get priceAdjustmentTiers(): ProductPriceAdjustmentTierData[] {
        return transformTierAdjustmentContents(<ProductPricingResult>this.productPricing);
    }

    /**
     * Retrieves session context
     *
     * We need to show the price tier component during preview mode. And we can use session context
     * to retrieve whether preview mode is on/off.
     */
    @wire(SessionContextAdapter) session?: StoreAdapterCallbackEntry<SessionContext>;

    get isPreviewMode(): boolean {
        return !!this.session?.data?.isPreview;
    }

    /**
     * Whether the tier pricing is disabled
     */
    get isTierPricingDisabled(): boolean {
        return this.productVariant?.isValid === false || this.product?.productClass === 'VariationParent';
    }

    get showTiers(): boolean {
        return (
            this.isPreviewMode ||
            (this?.productPricing?.priceAdjustment?.priceAdjustmentTiers !== undefined && !this.isTierPricingDisabled)
        );
    }

    get currencyCode(): string | null {
        return this?.productPricing?.currencyIsoCode || null;
    }

    // At the time of writing this, experience builder has a bug where default value for some variables
    // were not set and we verify values before passing down css variables
    get pricingTiersCustomStyles(): string {
        return `
         ${this.borderRadius ? `--com-c-pricing-tiers-border-radius: ${this.borderRadius}px;` : ``}
         ${this.backgroundColor ? `--com-c-pricing-tiers-background-color: ${this.backgroundColor};` : ``}
         ${this.rowTitleTextColor ? `--com-c-pricing-tiers-row-title-text-color: ${this.rowTitleTextColor};` : ``}
         ${this.labelTextColor ? `--com-c-pricing-tiers-label-text-color: ${this.labelTextColor};` : ``}
         ${this.textColor ? `--com-c-pricing-tiers-text-color: ${this.textColor};` : ``}
         ${this.borderColor ? `--com-c-pricing-tiers-border-color: ${this.borderColor};` : ``}
        `.trim();
    }

    public renderedCallback(): void {
        this.classList.toggle('slds-hide', !this.showTiers);
    }
}
