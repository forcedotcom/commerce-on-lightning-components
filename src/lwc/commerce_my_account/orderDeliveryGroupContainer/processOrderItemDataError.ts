import type { OrderDeliveryGroup } from 'commerce_my_account/orderDeliveryGroupContainer';
import { genericErrorMessageLabel } from './labels';

export function processOrderItemDataWithNoItemsError(
    orderDeliveryGroup: OrderDeliveryGroup,
    prefixToShippingGroup: string
): OrderDeliveryGroup {
    return {
        ...orderDeliveryGroup,
        orderItemsHasNextPage: false,
        orderItemNextPageToken: undefined,
        shippingFields: undefined,
        groupTitle: prefixToShippingGroup,
        orderItemsErrorMessage: genericErrorMessageLabel,
    };
}

export function processOrderItemError(
    error: { message: string | null; code: string | null },
    orderDeliveryGroup: OrderDeliveryGroup,
    prefixToShippingGroup: string
): OrderDeliveryGroup {
    return {
        ...orderDeliveryGroup,
        shippingFields: undefined,
        groupTitle: prefixToShippingGroup,
        orderItemsErrorMessage: error.message ?? genericErrorMessageLabel,
    };
}
