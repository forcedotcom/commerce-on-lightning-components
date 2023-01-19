import type { OrderDeliveryGroup } from 'commerce_my_account/orderDeliveryGroupContainer';
import { processOrderItemDataWithNoItemsError, processOrderItemError } from '../processOrderItemDataError';

jest.mock('../labels', () => ({
    genericErrorMessageLabel: 'error',
}));

const orderDeliveryGroup: OrderDeliveryGroup = {
    orderDeliveryGroupSummaryId: '123',
    groupTitle: 'Adda Shabeel 116/9l Arifwala Road',
    orderItemsHasNextPage: false,
};
describe('processOrderItemDataError/processOrderItemDataWithNoItemsError', () => {
    const result: OrderDeliveryGroup = processOrderItemDataWithNoItemsError(orderDeliveryGroup, '');

    it('sets an error', () => {
        expect(result?.orderItemsErrorMessage).toBeDefined();
    });

    it('removes the shippingFields property of the orderDeliveryGroup', () => {
        expect(result.shippingFields).toBeUndefined();
    });

    it('unsets the orderItemNextPageToken and hasNextPage properties of the orderDeliveryGroup', () => {
        expect(result.orderItemNextPageToken).toBeUndefined();
        expect(result.orderItemsHasNextPage).toBe(false);
    });
    it('sets the groupTitle to the prefix of shipping group', () => {
        expect(result.groupTitle).toBe('');
    });
});

describe('processOrderItemDataError/processOrderItemError', () => {
    const result = processOrderItemError({ message: 'error', code: '401' }, orderDeliveryGroup, '');
    const resultWithDefaultErrorMessage = processOrderItemError({ message: null, code: '401' }, orderDeliveryGroup, '');

    it('sets the error property with the provided error message', () => {
        expect(result.orderItemsErrorMessage).toBe('error');
    });
    it('sets the error property with the default error message', () => {
        expect(resultWithDefaultErrorMessage.orderItemsErrorMessage).toBeDefined();
    });
    it('removes the shippingFields property of the orderDeliveryGroup', () => {
        expect(result.shippingFields).toBeUndefined();
    });
    it('sets the groupTitle to the prefix of shipping group', () => {
        expect(result.groupTitle).toBe('');
    });
});
