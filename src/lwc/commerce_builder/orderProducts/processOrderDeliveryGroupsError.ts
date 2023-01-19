import type { OrderDeliveryGroup } from 'commerce_my_account/orderDeliveryGroupContainer';

export function processOrderDeliveryGroupsError(
    orderDeliveryGroups: OrderDeliveryGroup[],
    prefixToShippingGroup: string
): OrderDeliveryGroup[] {
    return orderDeliveryGroups.map((orderDeliveryGroup) => {
        return {
            ...orderDeliveryGroup,
            shippingFields: undefined,
            groupTitle: prefixToShippingGroup,
        };
    });
}
