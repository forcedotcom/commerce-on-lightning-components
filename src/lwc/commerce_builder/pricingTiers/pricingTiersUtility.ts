import type { ProductPricingResultData } from 'commerce/productApi';
import type { PriceAdjustmentTier } from './types';

/**
 * Transform the Tier Pricing Adjustments Contents
 * @param data  The specified pricing data
 * @return transformed price adjustments contents
 */
export function transformTierAdjustmentContents(
    data: Partial<ProductPricingResultData> | undefined
): PriceAdjustmentTier[] {
    // Transforms the API Price Adjustments listing into an
    // array of tiers for display.
    const priceAdjustments = (data && data.priceAdjustment && data.priceAdjustment.priceAdjustmentTiers) || [];
    // Transform the Price Adjustment Tiers contents data model
    return priceAdjustments.map((tier) => ({
        id: tier.id,
        adjustmentValueFormat: tier.adjustmentType === 'PercentageBasedAdjustment' ? 'percent-fixed' : 'currency',
        adjustmentValue: tier.adjustmentValue,
        lowerBound: tier.lowerBound,
        upperBound: tier.upperBound,
        tierUnitPrice: tier.tierUnitPrice,
    }));
}
