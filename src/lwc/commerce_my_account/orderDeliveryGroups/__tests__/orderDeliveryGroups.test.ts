import { createElement } from 'lwc';
import OrderDeliveryGroups from 'commerce_my_account/orderDeliveryGroups';
import type { OrderDeliveryGroup } from 'commerce_my_account/orderDeliveryGroupContainer';

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(),
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
}));

const singleOrderDeliveryGroupData: OrderDeliveryGroup[] = [
    {
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
    },
];

const multipleOrderDeliveryGroupsData: OrderDeliveryGroup[] = [
    {
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
    },
    {
        orderDeliveryGroupSummaryId: '1234',
        groupTitle: 'Adda Shabeel 125/9l Arifwala Road',
        orderItemsHasNextPage: false,
        shippingFields: [
            {
                label: 'abc',
                text: 'shipping',
                type: 'test',
            },
        ],
    },
];

describe('commerce_builder/orderDeliveryGroups', () => {
    let element: HTMLElement & OrderDeliveryGroups;
    beforeEach(() => {
        jest.clearAllMocks();
        element = createElement('commerce_builder-order-delivery-groups', {
            is: OrderDeliveryGroups,
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
            property: 'errorMessage',
            defaultValue: undefined,
            changeValue: 'error',
        },
        {
            property: 'fieldNames',
            defaultValue: undefined,
            changeValue: ['Product2.Name'],
        },
        {
            property: 'productFieldMapping',
            defaultValue: undefined,
            changeValue: [
                {
                    entity: 'OrderItemSummary',
                    name: 'AdjustedLineAmount',
                    label: 'Adjusted Line Subtotal',
                    type: 'Formula (Currency)',
                },
            ],
        },
        {
            property: 'isMultipleGroups',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'orderDeliveryGroups',
            defaultValue: undefined,
            changeValue: multipleOrderDeliveryGroupsData,
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
                expect(element[propertyTest.property as keyof OrderDeliveryGroups]).toBe(propertyTest.defaultValue);
            });
            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof OrderDeliveryGroups]).not.toBe(propertyTest.changeValue);
                //@ts-ignore
                element[propertyTest.property as keyof OrderDeliveryGroups] = propertyTest.changeValue;
                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof OrderDeliveryGroups]).toStrictEqual(
                    propertyTest.changeValue
                );
            });
        });
    });

    describe('accessibility', () => {
        it('is accessible when there are multiple orderDeliveryGroups', () => {
            expect.assertions(1);
            element.orderSummaryId = '123';
            element.showProductImage = true;
            element.showTotal = true;
            element.isMultipleGroups = true;
            element.orderDeliveryGroups = multipleOrderDeliveryGroupsData;
            return Promise.resolve().then(async () => {
                await expect(element).toBeAccessible();
            });
        });
        it('is accessible when there is a single orderDeliveryGroup', () => {
            expect.assertions(1);
            element.orderSummaryId = '123';
            element.showProductImage = true;
            element.showTotal = true;
            element.isMultipleGroups = false;
            element.orderDeliveryGroups = singleOrderDeliveryGroupData;
            return Promise.resolve().then(async () => {
                await expect(element).toBeAccessible();
            });
        });
    });
});
