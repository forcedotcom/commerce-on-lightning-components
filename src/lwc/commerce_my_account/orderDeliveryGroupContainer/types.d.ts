import type { Adjustment } from 'commerce_my_account/itemFields';
import type { OrderItemSummaryProductData, EntityField } from 'commerce/orderApiInternal';

export declare type ProductVariant = {
    name: string;
    value: string;
};

/*
 * a combination of transformed data from orderItem data fetch and orderItemAdjustments data fetch
 */
export declare type OrderItem = Omit<OrderItemSummaryProductData, 'fields'> & {
    orderItemSummaryId: string;
    fields?: EntityField[];
    adjustments?: Adjustment[];
    name?: string | null;
    totalPrice?: number;
    isValid?: boolean;
    variants?: ProductVariant[];
};

/*
 * a combination of transformed data from orderItem data fetch and orderDeliveryGroupDataFetch
 */
export declare type OrderDeliveryGroup = {
    orderDeliveryGroupSummaryId: string | null;
    groupTitle: string | null;
    shippingFields?: EntityField[];
    orderItems?: OrderItem[];
    orderItemsErrorMessage?: string;
    orderItemNextPageToken?: string | null;
    orderItemsHasNextPage: boolean;
};

export declare type TransformedOrderItemAdjustments = {
    [orderItemSummaryId: string]: Adjustment[];
};
