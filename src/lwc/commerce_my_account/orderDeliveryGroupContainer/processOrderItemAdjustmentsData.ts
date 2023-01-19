import type { OrderItemsAdjustmentsCollectionData } from 'commerce/orderApi';
import type { TransformedOrderItemAdjustments } from './types';
import type { Adjustment } from 'commerce_my_account/itemFields';
import { generateDisplayablePromotionName } from 'commerce_unified_promotions/nameDisplayEvaluator';
import type { OrderAdjustment } from 'commerce/orderApi';

export function transformAdjustmentFieldsForDisplay(
    orderSummaryAdjustments: OrderAdjustment[],
    otherAdjustmentsLabel: string
): Adjustment[] {
    return orderSummaryAdjustments.map((adjustment: OrderAdjustment, index: number) => {
        const name =
            adjustment.type === 'Other'
                ? otherAdjustmentsLabel
                : generateDisplayablePromotionName(adjustment.displayName, adjustment.basisReferenceDisplayName || '');
        return {
            name: name,
            id: index,
            discountAmount: adjustment.amount,
            ...adjustment,
        };
    });
}

export function processOrderItemAdjustmentsData(
    data: OrderItemsAdjustmentsCollectionData,
    otherAdjustmentsLabel: string
): TransformedOrderItemAdjustments {
    const allAdjustmentsMap: TransformedOrderItemAdjustments = {};
    Object.entries(data.orderItemSummaries).forEach((entry) => {
        if (entry[1].adjustments.length > 0) {
            allAdjustmentsMap[entry[0]] = transformAdjustmentFieldsForDisplay(
                entry[1].adjustments,
                otherAdjustmentsLabel
            );
        }
    });
    return allAdjustmentsMap;
}
