import type { OrderDeliveryGroup } from 'commerce_my_account/orderDeliveryGroupContainer';
import { processOrderDeliveryGroupsError } from '../processOrderDeliveryGroupsError';
const orderDeliveryGroups: OrderDeliveryGroup[] = [
    {
        orderDeliveryGroupSummaryId: '123',
        groupTitle: 'Adda Shabeel 116/9l Arifwala Road',
        orderItemsHasNextPage: false,
        shippingFields: [{ label: 'abc', text: '123', type: 'string' }],
    },
];

describe('processOrderItemDataError/processOrderDeliveryGroupsError', () => {
    const result: OrderDeliveryGroup[] = processOrderDeliveryGroupsError(orderDeliveryGroups, '');

    it('removes the shippingFields property of the orderDeliveryGroup', () => {
        expect(result[0].shippingFields).toBeUndefined();
    });

    it('sets the groupTitle to the prefix of shipping group', () => {
        expect(result[0].groupTitle).toBe('');
    });
});
