import type { OrderDeliveryGroup } from 'commerce_my_account/orderDeliveryGroupContainer';
import { processOrderItemData, formatOrderItems, itemFieldsList } from '../processOrderItemDataResponse';
import { orderItems } from './data/formattedOrderItems';
import { orderItemData } from './data/orderItemApiDataResponse';

const orderDeliveryGroup: OrderDeliveryGroup = {
    orderDeliveryGroupSummaryId: '123',
    groupTitle: 'Adda Shabeel 116/9l Arifwala Road',
    orderItemsHasNextPage: false,
    orderItemsErrorMessage: 'error',
};
const orderDeliveryGroupWithItems: OrderDeliveryGroup = {
    orderDeliveryGroupSummaryId: '123',
    groupTitle: 'Adda Shabeel 116/9l Arifwala Road',
    orderItemsHasNextPage: false,
    orderItemsErrorMessage: 'error',
    orderItems: orderItems,
};

describe('processOrderItemDataResponse/processOrderItemData', () => {
    const transformedOrderDeliveryGroup = processOrderItemData(orderDeliveryGroup, orderItems, '123');
    it('resets any existing error', () => {
        expect(transformedOrderDeliveryGroup.orderItemsErrorMessage).toBeUndefined();
    });

    it('adds the order items field to the order delivery group', () => {
        expect(transformedOrderDeliveryGroup.orderItems).toBeDefined();
    });

    it('updates the order items field to the order delivery group', () => {
        const currentOrderDeliveryGroupItemsLenght = orderDeliveryGroupWithItems.orderItems?.length || 0;
        const otherTransformedOrderDeliveryGroup = processOrderItemData(orderDeliveryGroupWithItems, orderItems, '123');
        expect(otherTransformedOrderDeliveryGroup.orderItems?.length).toBe(
            currentOrderDeliveryGroupItemsLenght + orderItems.length
        );
    });

    it('sets the orderItemNextPageToken when it is present and hasNextPage to true', () => {
        expect(transformedOrderDeliveryGroup.orderItemNextPageToken).toBe('123');
        expect(transformedOrderDeliveryGroup.orderItemsHasNextPage).toBe(true);
    });

    it('sets hasNextPage property to false when orderItemNextPageToken is not defined', () => {
        const otherTransformedOrderDeliveryGroup = processOrderItemData(orderDeliveryGroup, orderItems, undefined);
        expect(otherTransformedOrderDeliveryGroup.orderItemNextPageToken).toBeUndefined();
        expect(otherTransformedOrderDeliveryGroup.orderItemsHasNextPage).toBe(false);
    });
});
const productFieldMapping = [
    {
        entity: 'OrderItemSummary',
        name: 'Tax',
        label: 'Tax for the order item',
        type: 'number',
    },
    {
        entity: 'Product2',
        name: 'SKU',
        label: 'SKU',
        type: 'STRING',
    },
];

describe('processOrderItemDataResponse/formatOrderItems', () => {
    const result = formatOrderItems(orderItemData, productFieldMapping, true);

    it('populates the orderItem fields to be shown in the ui', () => {
        expect(result?.[0].fields?.[0].dataName).toBe('Tax');
        expect(result?.[0].fields?.[1].dataName).toBe('SKU');
    });

    it('sets the totalPrice field for each item when showTotal is set to true', () => {
        expect(result[0].totalPrice).toBe(Number(orderItemData[0].fields['OrderItemSummary.AdjustedLineAmount'].text));
    });

    it('does not set the totalPrice field when showTotal is set to false', () => {
        const resultWithoutTotal = formatOrderItems(orderItemData, productFieldMapping, false);
        expect(resultWithoutTotal[0]?.totalPrice).toBeUndefined();
    });

    it('sets the product name field for each item', () => {
        expect(result[0].name).toBe(orderItemData[0].product.fields['Product2.Name'].text);
    });
    it('truncates the orderItemSummaryId to 15 characters.', () => {
        expect(result[0].orderItemSummaryId).toBe(orderItemData[0].orderItemSummaryId.slice(0, 15));
    });

    it('sets isValid property', () => {
        expect(result[0].isValid).toBe(true);
    });
    it('sets variant  property', () => {
        expect(result[0].variants).toBeDefined();
    });
});

describe('processOrderItemDataResponse/itemFieldsList', () => {
    const productFieldMappingWithSomeFieldsAreNotInApiData = [
        {
            entity: 'OrderItemSummary',
            name: 'Tax',
            label: 'Tax for the order item',
            type: 'number',
        },
        {
            entity: 'Product2',
            name: 'abc',
            type: 'string',
            label: 'Alphabet',
        },
        {
            entity: 'Product2',
            name: 'SKU',
            label: 'SKU',
            type: 'STRING',
        },
        {
            entity: 'OrderItemSummary',
            name: 'TotalAmtWithTax',
            label: 'Total',
            type: 'number',
        },
        {
            entity: 'OrderAdjustmentAggregateSummary',
            name: 'TotalPromotionDistAmount',
            label: 'Order Level Promotions Applied',
            type: 'Currency',
        },
        {
            entity: 'OrderAdjustmentAggregateSummary',
            name: 'TotalLinePromotionAmount',
            label: 'Line Item Promotions Applied',
            type: 'Currency',
        },
    ];
    it('returns a list of the fields that exist for an orderItem', () => {
        const fieldsToShow = itemFieldsList(productFieldMappingWithSomeFieldsAreNotInApiData, orderItemData[0]);
        expect(fieldsToShow).toHaveLength(3);
    });
    it('sets the orderAdjustmentAggregate fields', () => {
        const fieldsToShow = itemFieldsList(productFieldMappingWithSomeFieldsAreNotInApiData, orderItemData[0]);
        expect(fieldsToShow).toContainEqual({
            label: 'Line Item Promotions Applied',
            dataName: 'TotalLinePromotionAmount',
            type: 'Currency',
            text: '123.0',
        });
        expect(fieldsToShow).not.toContainEqual({
            label: 'Order Level Promotions Applied',
            dataName: 'TotalPromotionDistAmount',
            type: 'Currency',
            text: '0.0',
        });
    });
});
