import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { OrderDeliveryGroupsAdapter } from 'commerce/orderApi';
import OrderProducts from 'commerce_builder/orderProducts';
import type { TestWireAdapter } from 'types/testing';
import {
    multipleOrderDlieveryGroupsDataResponse,
    orderDeliveryGroupDataResponse,
} from './data/orderDeliveryGroupDataResponse';
import type OrderDeliveryGroups from 'commerce_my_account/orderDeliveryGroups';
import { stringProductFieldMapping, stringShippingAddressFieldMapping } from './data/fieldMappings';
import { navigate } from 'lightning/navigation';
import { getDefaultProductFields } from '../defaultOrderProductFields';
jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });
jest.mock('commerce/orderApi', () =>
    Object.assign({}, jest.requireActual('commerce/orderApi'), {
        OrderDeliveryGroupsAdapter: mockCreateTestWireAdapter(),
    })
);
jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => Promise.resolve('')),
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
}));
jest.mock('../labels', () => ({
    genericErrorMessageLabel: 'error',
}));

describe('commerce_builder/orderProducts', () => {
    let element: HTMLElement & OrderProducts;
    beforeEach(() => {
        jest.clearAllMocks();
        element = createElement('commerce_builder-order-products', {
            is: OrderProducts,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        document.body.removeChild(element);
    });
    [
        {
            property: 'orderSummaryId',
            defaultValue: undefined,
            changeValue: '123',
        },
        {
            property: 'adjustmentsAmountTextColor',
            defaultValue: undefined,
            changeValue: '#FFFF',
        },
        {
            property: 'otherAdjustmentsLabel',
            defaultValue: undefined,
            changeValue: 'other',
        },
        {
            property: 'showMoreProductLabel',
            defaultValue: undefined,
            changeValue: 'Show More',
        },
        {
            property: 'prefixToShippingGroup',
            defaultValue: undefined,
            changeValue: 'Ship To ',
        },
        {
            property: 'productFieldMapping',
            defaultValue: undefined,
            changeValue: stringProductFieldMapping,
        },
        {
            property: 'productUnavailableMessage',
            defaultValue: undefined,
            changeValue: 'unavailable',
        },
        {
            property: 'showTotal',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'showProductImage',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'shippingGroupFieldMapping',
            defaultValue: undefined,
            changeValue: stringShippingAddressFieldMapping,
        },
        {
            property: 'textDisplayInfo',
            defaultValue: undefined,
            changeValue: { headingTag: 'h2', textStyle: 'heading-large' },
        },
        {
            property: 'totalPriceTextColor',
            defaultValue: undefined,
            changeValue: '#FFFF',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof OrderProducts]).toBe(propertyTest.defaultValue);
            });
            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof OrderProducts]).not.toBe(propertyTest.changeValue);
                //@ts-ignore
                element[propertyTest.property as keyof OrderProducts] = propertyTest.changeValue;
                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof OrderProducts]).toStrictEqual(propertyTest.changeValue);
            });
        });
    });

    describe('accessibility', () => {
        it('is accessible', () => {
            expect.assertions(1);
            element.orderSummaryId = '123';
            element.shippingGroupFieldMapping = stringShippingAddressFieldMapping;
            element.productFieldMapping = stringProductFieldMapping;
            element.showTotal = true;
            element.showProductImage = true;
            element.productUnavailableMessage = 'abc';
            element.totalPriceTextColor = '#FFFF';
            element.adjustmentsAmountTextColor = '#FFFF';
            return Promise.resolve().then(async () => {
                await expect(element).toBeAccessible();
            });
        });
    });

    describe('error response', () => {
        it('sets the errorMessage property of orderDeliveryGroups when there is an error response and resets group title and shipping fields', async () => {
            element.orderSummaryId = '123';
            element.shippingGroupFieldMapping = stringShippingAddressFieldMapping;
            element.productFieldMapping = stringProductFieldMapping;
            element.prefixToShippingGroup = '';
            (<typeof OrderDeliveryGroupsAdapter & typeof TestWireAdapter>OrderDeliveryGroupsAdapter).emit({
                error: { message: 'error message' },
            });
            const orderDeliveryGroupsComp: (HTMLElement & OrderDeliveryGroups) | null = element.querySelector(
                'commerce_my_account-order-delivery-groups'
            );
            return Promise.resolve().then(() => {
                expect(orderDeliveryGroupsComp?.errorMessage).toBeDefined();
                expect(orderDeliveryGroupsComp?.orderDeliveryGroups?.[0]?.shippingFields).toBeUndefined();
            });
        });

        it('sets the errorMessage property of orderDeliveryGroups to a generic error message when there is an error response without an error message', () => {
            element.orderSummaryId = '123';
            element.shippingGroupFieldMapping = stringShippingAddressFieldMapping;
            element.productFieldMapping = stringProductFieldMapping;
            element.prefixToShippingGroup = '';
            (<typeof OrderDeliveryGroupsAdapter & typeof TestWireAdapter>OrderDeliveryGroupsAdapter).emit({
                error: { message: '501 not implemented' },
            });
            const orderDeliveryGroupsComp: (HTMLElement & OrderDeliveryGroups) | null = element.querySelector(
                'commerce_my_account-order-delivery-groups'
            );
            return Promise.resolve().then(() => {
                expect(orderDeliveryGroupsComp?.errorMessage).toBeDefined();
            });
        });
        it('sets the errorMessage property of orderDeliveryGroups to a generic error message when there is empty data', () => {
            element.orderSummaryId = '123';
            element.shippingGroupFieldMapping = stringShippingAddressFieldMapping;
            element.productFieldMapping = stringProductFieldMapping;
            element.prefixToShippingGroup = '';
            (<typeof OrderDeliveryGroupsAdapter & typeof TestWireAdapter>OrderDeliveryGroupsAdapter).emit({
                data: {},
            });
            const orderDeliveryGroupsComp: (HTMLElement & OrderDeliveryGroups) | null = element.querySelector(
                'commerce_my_account-order-delivery-groups'
            );
            return Promise.resolve().then(() => {
                expect(orderDeliveryGroupsComp?.errorMessage).toBeDefined();
            });
        });
    });

    describe('handleOrderDeliveryGroupResponse', () => {
        it('sets the group title', async () => {
            element.orderSummaryId = '123';
            element.shippingGroupFieldMapping = stringShippingAddressFieldMapping;
            element.productFieldMapping = stringProductFieldMapping;
            element.prefixToShippingGroup = '';

            (<typeof OrderDeliveryGroupsAdapter & typeof TestWireAdapter>OrderDeliveryGroupsAdapter).emit({
                data: orderDeliveryGroupDataResponse,
            });
            await Promise.resolve();
            const orderDeliveryGroupsComp: (HTMLElement & OrderDeliveryGroups) | null = element.querySelector(
                'commerce_my_account-order-delivery-groups'
            );
            expect(orderDeliveryGroupsComp?.orderDeliveryGroups?.[0].groupTitle).toBeDefined();
        });
        it('sets the group title which includes the non empty prefix to shipping gropu', async () => {
            element.orderSummaryId = '123';
            element.shippingGroupFieldMapping = stringShippingAddressFieldMapping;
            element.productFieldMapping = stringProductFieldMapping;
            element.prefixToShippingGroup = 'Ship To';

            (<typeof OrderDeliveryGroupsAdapter & typeof TestWireAdapter>OrderDeliveryGroupsAdapter).emit({
                data: orderDeliveryGroupDataResponse,
            });
            await Promise.resolve();
            const orderDeliveryGroupsComp: (HTMLElement & OrderDeliveryGroups) | null = element.querySelector(
                'commerce_my_account-order-delivery-groups'
            );
            expect(orderDeliveryGroupsComp?.orderDeliveryGroups?.[0].groupTitle).toBeDefined();
        });

        it('sets the group shipping fields', async () => {
            const shippingFields = [
                { dataName: 'Name', label: 'Name', text: 'Order Delivery Method1', type: 'string' },
                { dataName: 'TotalAmount', label: 'Pretax Total', text: '11.99', type: 'currency' },
            ];
            element.orderSummaryId = '123';
            element.shippingGroupFieldMapping = stringShippingAddressFieldMapping;
            element.productFieldMapping = stringProductFieldMapping;
            element.prefixToShippingGroup = '';

            (<typeof OrderDeliveryGroupsAdapter & typeof TestWireAdapter>OrderDeliveryGroupsAdapter).emit({
                data: orderDeliveryGroupDataResponse,
            });

            await Promise.resolve();
            const orderDeliveryGroupsComp: (HTMLElement & OrderDeliveryGroups) | null = element.querySelector(
                'commerce_my_account-order-delivery-groups'
            );
            expect(orderDeliveryGroupsComp?.orderDeliveryGroups?.[0].shippingFields).toEqual(shippingFields);
        });

        it('sets isMultipleGroups property to false for child component when there is one orderDeliveryGroup', () => {
            element.orderSummaryId = '123';
            element.shippingGroupFieldMapping = stringShippingAddressFieldMapping;
            element.productFieldMapping = stringProductFieldMapping;
            element.prefixToShippingGroup = '';
            (<typeof OrderDeliveryGroupsAdapter & typeof TestWireAdapter>OrderDeliveryGroupsAdapter).emit({
                data: orderDeliveryGroupDataResponse,
            });

            return Promise.resolve().then(() => {
                const orderDeliveryGroupsComp: (HTMLElement & OrderDeliveryGroups) | null = element.querySelector(
                    'commerce_my_account-order-delivery-groups'
                );
                expect(orderDeliveryGroupsComp?.isMultipleGroups).toBe(false);
            });
        });

        it('sets isMultipleGroups property to true for child component when there is more than one orderDeliveryGroup', () => {
            element.orderSummaryId = '123';
            element.shippingGroupFieldMapping = stringShippingAddressFieldMapping;
            element.productFieldMapping = stringProductFieldMapping;
            element.prefixToShippingGroup = '';

            (<typeof OrderDeliveryGroupsAdapter & typeof TestWireAdapter>OrderDeliveryGroupsAdapter).emit({
                data: multipleOrderDlieveryGroupsDataResponse,
            });
            return Promise.resolve().then(() => {
                const orderDeliveryGroupsComp: (OrderDeliveryGroups & HTMLElement) | null = element.querySelector(
                    'commerce_my_account-order-delivery-groups'
                );
                expect(orderDeliveryGroupsComp?.isMultipleGroups).toBe(true);
            });
        });

        it('sets FieldMapping properties to default array for child component when the field mappings are undefined', () => {
            element.orderSummaryId = '123';
            (<typeof OrderDeliveryGroupsAdapter & typeof TestWireAdapter>OrderDeliveryGroupsAdapter).emit({
                data: multipleOrderDlieveryGroupsDataResponse,
            });
            const defaultProductFields = getDefaultProductFields();
            return Promise.resolve().then(() => {
                const orderDeliveryGroupsComp: (OrderDeliveryGroups & HTMLElement) | null = element.querySelector(
                    'commerce_my_account-order-delivery-groups'
                );
                expect(orderDeliveryGroupsComp?.productFieldMapping).toEqual(defaultProductFields);
                expect(orderDeliveryGroupsComp?.orderDeliveryGroups?.[0]?.shippingFields).toBeDefined();
            });
        });
    });
    describe('navigation', () => {
        it('calls navigate when it hears a custom event navigatetoproductdetailpage', async () => {
            element.orderSummaryId = '123';
            element.shippingGroupFieldMapping = stringShippingAddressFieldMapping;
            element.productFieldMapping = stringProductFieldMapping;

            (<typeof OrderDeliveryGroupsAdapter & typeof TestWireAdapter>OrderDeliveryGroupsAdapter).emit({
                data: multipleOrderDlieveryGroupsDataResponse,
            });
            await Promise.resolve();
            const orderDeliveryGroupsComp = element.querySelector('commerce_my_account-order-delivery-groups');
            orderDeliveryGroupsComp?.dispatchEvent(
                new CustomEvent('navigatetoproductdetailpage', { detail: { productId: '123' } })
            );
            await Promise.resolve();
            expect(navigate).toHaveBeenCalled();
        });
    });
});
