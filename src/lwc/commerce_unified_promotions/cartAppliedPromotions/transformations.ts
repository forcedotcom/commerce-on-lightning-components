import type { PromotionsData } from 'commerce/cartApi';
import type { PromotionInformationDetail } from './types';
import { generateDisplayablePromotionName } from 'commerce_unified_promotions/nameDisplayEvaluator';
import { displayDiscountPrice } from 'commerce_unified_promotions/discountPriceDisplayEvaluator';

/**
 * Transforms Cart Applied Promotions
 * @returns {PromotionInformationDetail[]} A new list of transformed cart applied promotions
 *  Output :[
 *  {
 *      id: '0c8xx0000000001',
 *      name: '(10PERCENTCART) - 10% off your entire cart',
 *      termsAndConditions :'Terms and Conditions will be displayed as a text block',
 *      discountAmount: '-56.80',
 * }]
 */
export const transformPromotionContents = (
    promotions: PromotionsData | undefined,
    showDiscountAmount: boolean,
    showTermsAndConditions: boolean
): PromotionInformationDetail[] => {
    let promotionalAdjustments = <PromotionInformationDetail[]>[];
    const adjustments = promotions?.promotions || [];
    if (adjustments.length > 0) {
        promotionalAdjustments = adjustments.map((adjustment) => {
            const termsAndConditions =
                showTermsAndConditions && adjustment.termsAndConditions ? adjustment.termsAndConditions : '';
            const discountAmount = displayDiscountPrice(showDiscountAmount, adjustment.adjustmentAmount)
                ? adjustment.adjustmentAmount
                : '';
            const displayName = adjustment.displayName ? adjustment.displayName : '';
            const couponCode = adjustment.couponCode ? adjustment.couponCode : '';
            return {
                id: adjustment.promotionId,
                name: generateDisplayablePromotionName(displayName, couponCode),
                termsAndConditions,
                discountAmount,
            };
        });
    }
    return promotionalAdjustments;
};
