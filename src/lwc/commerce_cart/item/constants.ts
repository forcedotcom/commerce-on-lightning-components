export const DELETE_ITEM_EVENT = 'deletecartitem';
export const UPDATE_ITEM_EVENT = 'updatecartitem';
export const NAVIGATE_PRODUCT_EVENT = 'navigatetoproduct';

/**
 * These field values will be in the ProductDetailsData object and not the ProductDetailsData.fields array
 */
export const PRODUCT_DETAIL_FIELDS: Record<string, string> = {
    Name: 'name',
    StockKeepingUnit: 'sku',
};
