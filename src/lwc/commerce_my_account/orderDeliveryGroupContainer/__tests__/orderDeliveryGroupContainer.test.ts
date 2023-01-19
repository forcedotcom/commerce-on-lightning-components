import { createElement } from 'lwc';
import { orderItemSummariesResponse, anotherOrderItemSummariesResponse } from './data/groupData';
import type { TestWireAdapter } from 'types/testing';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { OrderItemsAdapter, OrderItemsAdjustmentsAdapter } from 'commerce/orderApi';
import OrderDeliveryGroupContainer from 'commerce_my_account/orderDeliveryGroupContainer';
import type { OrderDeliveryGroup as OrderDeliveryGroupData } from 'commerce_my_account/orderDeliveryGroupContainer';
import { adjustmentsAdapterResponse } from './data/adjustmentsData';
import type OrderDeliveryGroupDisplay from 'commerce_my_account/orderDeliveryGroupDisplay';
jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });
jest.mock('commerce/context');
jest.mock('commerce/contextApi');

jest.mock('../labels', () => ({
    genericErrorMessageLabel: 'error',
}));

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(),
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
}));
jest.mock('commerce/orderApi', () =>
    Object.assign({}, jest.requireActual('commerce/orderApi'), {
        OrderItemsAdapter: mockCreateTestWireAdapter(),
        OrderItemsAdjustmentsAdapter: mockCreateTestWireAdapter(),
    })
);

const orderDeliveryGroupData: OrderDeliveryGroupData = {
    orderDeliveryGroupSummaryId: '123',
    groupTitle: 'Adda Shabeel 116/9l Arifwala Road',
    orderItemsHasNextPage: false,
    shippingFields: [
        {
            label: 'abc',
            text: 'shipping',
            type: 'test',
        },
    ],
};

const productFieldMappingData = [
    {
        entity: 'OrderItemSummary',
        name: 'Quantity',
        label: 'Quantity',
        type: 'double',
    },
    {
        entity: 'OrderItemSummary',
        name: 'StockKeepingUnit',
        label: 'Product Sku',
        type: 'string',
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

describe('commerce_my_account/OrderDeliveryGroup', () => {
    let element: HTMLElement & OrderDeliveryGroupContainer;
    beforeEach(() => {
        jest.clearAllMocks();
        element = createElement('commerce_my_account-order-delivery-group-container', {
            is: OrderDeliveryGroupContainer,
        });

        document.body.appendChild(element);
    });
    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'orderSummaryId',
            defaultValue: undefined,
            changeValue: '123',
        },
        {
            property: 'currencyCode',
            defaultValue: undefined,
            changeValue: 'USD',
        },
        {
            property: 'fieldNames',
            defaultValue: undefined,
            changeValue: ['Product2.Name'],
        },
        {
            property: 'productFieldMapping',
            defaultValue: [],
            changeValue: productFieldMappingData,
        },
        {
            property: 'isMultipleGroups',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'orderDeliveryGroup',
            defaultValue: undefined,
            changeValue: orderDeliveryGroupData,
        },
        {
            property: 'orderDeliveryGroupSummaryId',
            defaultValue: undefined,
            changeValue: '123',
        },
        {
            property: 'otherAdjustmentsLabel',
            defaultValue: undefined,
            changeValue: 'Other',
        },
        {
            property: 'showMoreProductLabel',
            defaultValue: undefined,
            changeValue: 'Show More',
        },
        {
            property: 'prefixToShippingGroup',
            defaultValue: undefined,
            changeValue: 'Ship To',
        },
        {
            property: 'productUnavailableMessage',
            defaultValue: undefined,
            changeValue: 'Unavailable',
        },
        {
            property: 'pageSize',
            defaultValue: undefined,
            changeValue: 5,
        },
        {
            property: 'showProductImage',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'showTotal',
            defaultValue: false,
            changeValue: true,
        },

        {
            property: 'textDisplayInfo',
            defaultValue: undefined,
            changeValue: { headingTag: 'h2', textStyle: 'heading-large' },
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof OrderDeliveryGroupContainer]).toStrictEqual(
                    propertyTest.defaultValue
                );
            });
            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof OrderDeliveryGroupContainer]).not.toBe(
                    propertyTest.changeValue
                );
                //@ts-ignore
                element[propertyTest.property as keyof OrderDeliveryGroupContainer] = propertyTest.changeValue;
                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof OrderDeliveryGroupContainer]).toStrictEqual(
                    propertyTest.changeValue
                );
            });
        });
    });

    describe('accessibility', () => {
        it('is accessible', () => {
            expect.assertions(1);
            element.orderSummaryId = '123';
            element.productFieldMapping = productFieldMappingData;
            element.fieldNames = ['Product2.sku'];
            element.showTotal = true;
            element.showProductImage = true;
            element.productUnavailableMessage = 'abc';
            return Promise.resolve().then(async () => {
                await expect(element).toBeAccessible();
            });
        });
    });

    describe('OrderItemsAdapter error response', () => {
        it('sets the orderDeliveryGroup error if OrderItemsAdapter returns 0 items', async () => {
            element.orderDeliveryGroup = orderDeliveryGroupData;
            element.prefixToShippingGroup = 'Deliver To';
            (<typeof OrderItemsAdapter & typeof TestWireAdapter>OrderItemsAdapter).emit({
                data: { items: [] },
            });
            return Promise.resolve().then(() => {
                const childEl: (HTMLElement & OrderDeliveryGroupDisplay) | null = element.querySelector(
                    'commerce_my_account-order-delivery-group-display'
                );
                expect(childEl?.orderDeliveryGroup?.shippingFields).toBeUndefined();
                expect(childEl?.orderDeliveryGroup?.groupTitle).toBe('Deliver To');
                expect(childEl?.orderDeliveryGroup?.orderItemsErrorMessage).toBeDefined();
            });
        });

        it('sets the group error if OrderItemSummariesAdapter returns error', async () => {
            element.orderDeliveryGroup = orderDeliveryGroupData;
            element.prefixToShippingGroup = 'Deliver To';
            (<typeof OrderItemsAdapter & typeof TestWireAdapter>OrderItemsAdapter).emit({
                error: { message: 'sorry there was an error in the OrderItemSummaries data fetch' },
            });
            return Promise.resolve().then(() => {
                const childEl: (HTMLElement & OrderDeliveryGroupDisplay) | null = element.querySelector(
                    'commerce_my_account-order-delivery-group-display'
                );
                expect(childEl?.orderDeliveryGroup?.shippingFields?.length).toBeUndefined();
                expect(childEl?.orderDeliveryGroup?.groupTitle).toBe('Deliver To');
                expect(childEl?.orderDeliveryGroup?.orderItemsErrorMessage).toBe(
                    'sorry there was an error in the OrderItemSummaries data fetch'
                );
            });
        });
    });

    describe('OrderItemsAdapter data response', () => {
        it('sets the initialFocusedItemId', async () => {
            element.orderDeliveryGroup = orderDeliveryGroupData;
            element.orderDeliveryGroupSummaryId = '123';
            element.productFieldMapping = productFieldMappingData;

            (<typeof OrderItemsAdapter & typeof TestWireAdapter>OrderItemsAdapter).emit({
                data: orderItemSummariesResponse,
            });
            await Promise.resolve();

            const orderDeliveryGroupDisplay: (HTMLElement & OrderDeliveryGroupDisplay) | null = element.querySelector(
                'commerce_my_account-order-delivery-group-display'
            );

            orderDeliveryGroupDisplay?.dispatchEvent(
                new CustomEvent('orderdeliverygroupdisplayshowmoreitems', {
                    detail: {
                        orderDeliveryGroupSummaryId: orderDeliveryGroupData.orderDeliveryGroupSummaryId,
                        nextPageToken: orderDeliveryGroupData.orderItemNextPageToken,
                    },
                })
            );

            await Promise.resolve();

            (<typeof OrderItemsAdapter & typeof TestWireAdapter>OrderItemsAdapter).emit({
                data: anotherOrderItemSummariesResponse,
            });
            await Promise.resolve();
            expect(orderDeliveryGroupDisplay?.orderDeliveryGroup?.orderItems?.length).toBe(2);
        });

        it('sets the data for OrderAdjustmentAggregateSummary.TotalPromotionDistAmount and OrderAdjustmentAggregateSummary.TotalLinePromotionAmount fields with the data in the orderAdjustmentAggregates property', async () => {
            const fieldNames = [
                'OrderAdjustmentAggregateSummary.TotalLinePromotionAmount',
                'OrderAdjustmentAggregateSummary.TotalPromotionDistAmount',
                'Product2.IsActive',
            ];

            element.orderDeliveryGroup = orderDeliveryGroupData;
            element.productFieldMapping = productFieldMappingData;
            element.fieldNames = fieldNames;

            (<typeof OrderItemsAdapter & typeof TestWireAdapter>OrderItemsAdapter).emit({
                data: orderItemSummariesResponse,
            });

            await Promise.resolve();
            const orderDeliveryGroupDisplay: (HTMLElement & OrderDeliveryGroupDisplay) | null = element.querySelector(
                'commerce_my_account-order-delivery-group-display'
            );
            expect(orderDeliveryGroupDisplay?.orderDeliveryGroup?.orderItems?.[0]?.fields).toContainEqual({
                label: 'Line Item Promotions Applied',
                dataName: 'TotalLinePromotionAmount',
                type: 'Currency',
                text: '5.0',
            });
        });

        it('sets the orderDeliveryGroup items', async () => {
            element.orderDeliveryGroup = orderDeliveryGroupData;
            element.productFieldMapping = productFieldMappingData;

            (<typeof OrderItemsAdapter & typeof TestWireAdapter>OrderItemsAdapter).emit({
                data: orderItemSummariesResponse,
            });
            await Promise.resolve();
            const childEl: (HTMLElement & OrderDeliveryGroupDisplay) | null = element.querySelector(
                'commerce_my_account-order-delivery-group-display'
            );
            expect(childEl?.orderDeliveryGroup?.orderItems).toHaveLength(orderItemSummariesResponse.items.length);
        });

        it('sets hasNextPageToken property of orderDeliveryGroup', async () => {
            element.orderDeliveryGroup = orderDeliveryGroupData;
            element.productFieldMapping = productFieldMappingData;
            (<typeof OrderItemsAdapter & typeof TestWireAdapter>OrderItemsAdapter).emit({
                data: orderItemSummariesResponse,
            });
            await Promise.resolve();
            const childEl: (HTMLElement & OrderDeliveryGroupDisplay) | null = element.querySelector(
                'commerce_my_account-order-delivery-group-display'
            );
            expect(childEl?.orderDeliveryGroup?.orderItemsHasNextPage).toBe(true);
            expect(childEl?.orderDeliveryGroup?.orderItemNextPageToken).toBe(orderItemSummariesResponse.nextPageToken);
        });
    });

    describe('orderAdjustments adapter', () => {
        it('transforms the adjustments data with other adjustment label defined', () => {
            element.orderDeliveryGroup = orderDeliveryGroupData;
            element.otherAdjustmentsLabel = 'other';
            element.productFieldMapping = productFieldMappingData;

            (<typeof OrderItemsAdapter & typeof TestWireAdapter>OrderItemsAdapter).emit({
                data: orderItemSummariesResponse,
            });

            expect(element?.orderDeliveryGroup?.orderItems?.[0].adjustments).toBeUndefined();

            (<typeof OrderItemsAdjustmentsAdapter & typeof TestWireAdapter>OrderItemsAdjustmentsAdapter).emit({
                data: adjustmentsAdapterResponse,
            });

            return Promise.resolve().then(() => {
                const childEl: (HTMLElement & OrderDeliveryGroupDisplay) | null = element.querySelector(
                    'commerce_my_account-order-delivery-group-display'
                );
                expect(childEl?.orderDeliveryGroup?.orderItems?.[0].adjustments).toBeDefined();
            });
        });

        it('transforms the adjustments data with other adjustment label not defined', () => {
            element.orderDeliveryGroup = orderDeliveryGroupData;
            element.productFieldMapping = productFieldMappingData;

            (<typeof OrderItemsAdapter & typeof TestWireAdapter>OrderItemsAdapter).emit({
                data: orderItemSummariesResponse,
            });

            expect(element?.orderDeliveryGroup?.orderItems?.[0].adjustments).toBeUndefined();

            (<typeof OrderItemsAdjustmentsAdapter & typeof TestWireAdapter>OrderItemsAdjustmentsAdapter).emit({
                data: adjustmentsAdapterResponse,
            });

            return Promise.resolve().then(() => {
                const childEl: (HTMLElement & OrderDeliveryGroupDisplay) | null = element.querySelector(
                    'commerce_my_account-order-delivery-group-display'
                );
                expect(childEl?.orderDeliveryGroup?.orderItems?.[0].adjustments).toBeDefined();
            });
        });
    });
});
