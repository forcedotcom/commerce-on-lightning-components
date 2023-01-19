import { LightningElement, api } from 'lwc';
import type { PriceAdjustmentTier } from 'src/lwc/commerce_builder/pricingTiers/types';

/**
 * A UI control to add a price adjustment tiers.
 */
export default class PricingTiers extends LightningElement {
    static renderMode = 'light';

    /**
     * Gets or sets the text of the label text for the quantity row.
     *
     * @type {string}
     */
    @api
    quantityRowLabel?: string;

    /**
     * Gets or sets the text of the label text for the discount row.
     *
     * @type {string}
     */
    @api
    discountRowLabel?: string;

    /**
     * The ISO 4217 currency code for the tier pricing
     *
     * @type {string}
     */
    @api
    currencyCode!: string;

    /**
     * Gets the content to
     * display the tier pricing.
     * @type {PriceAdjustmentTier[]}
     */
    @api
    adjustmentTiers?: PriceAdjustmentTier[] | null;

    /**
     * Gets whether this price adjustment tiers should display the content
     * based of 'adjustmentTiers' configuration
     */
    get transformedAdjustmentTiers(): PriceAdjustmentTier[] {
        return (this.adjustmentTiers || []).map((tier) => {
            return {
                ...tier,
                isCurrency: tier.adjustmentValueFormat === 'currency',
            };
        });
    }
}
