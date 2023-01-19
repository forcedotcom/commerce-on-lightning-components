import type { AppliedPromotion, InternalAppliedPromotion } from './types';
import formatAsCurrency from 'commerce/currencyFormatter';

export function transformPromotions(
    promotions: AppliedPromotion[],
    currencyCode: string | undefined
): InternalAppliedPromotion[] {
    if (!(currencyCode || '').length) {
        return promotions;
    }
    return promotions.map((promotion) => {
        // Format the displayed prices to provide hover text, since we truncate these displayed fields.
        return { ...promotion, formattedDiscountAmount: formatAsCurrency(currencyCode, promotion.discountAmount) };
    });
}
