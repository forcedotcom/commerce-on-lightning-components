/**
 * @description There is a difference between the fields that are provided, and the fields
 * that are in the actual response.  This is a mapping between the fields provided, and the actual
 * field in the response from the Order API
 */
export const PROMO_FIELD_MAPPINGS: Record<string, string> = {
    TotalProductPromotionAmount: 'totalProductPromotionTotalAmount',
};
