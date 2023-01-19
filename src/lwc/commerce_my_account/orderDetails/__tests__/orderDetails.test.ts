import { createElement } from 'lwc';

import type { TestWireAdapter } from 'types/testing';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { OrderAdapter } from 'commerce/orderApi';
import OrderDetails from 'commerce_my_account/orderDetails';
import type OrderDetailsDisplay from 'commerce_my_account/orderDetailsDisplay';

import { orderSummaryFieldsData } from './data/orderSummaryFieldsData';
import { orderSummaryFields } from './data/orderSummaryFields';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Refresh the page or contact us for assistance.';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });
jest.mock('commerce/context');
jest.mock('commerce/contextApi');

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => ''),
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
}));

jest.mock('lightning/uiRecordApi', () => ({
    getFieldValue: jest.fn(),
    getRecord: jest.fn(),
}));

jest.mock('commerce/orderApi', () =>
    Object.assign({}, jest.requireActual('commerce/orderApi'), {
        OrderAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock(
    '@salesforce/label/B2B_Buyer_Orders.genericErrorMessage',
    () => {
        return {
            default: GENERIC_ERROR_MESSAGE,
        };
    },
    { virtual: true }
);

describe('commerce_my_account/orderDetails: Order Details', () => {
    let element: HTMLElement & OrderDetails;

    beforeEach(() => {
        jest.clearAllMocks();
        // Create element
        element = createElement('commerce_my_account-order-details', {
            is: OrderDetails,
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
            changeValue: '1Osxx0000004CLwCAM',
        },
        {
            property: 'orderSummaryHighlightsFieldMapping',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'highlightsTitle',
            defaultValue: undefined,
            changeValue: 'Snazzy Title!',
        },
        {
            property: 'highlightsCardBorderColor',
            defaultValue: undefined,
            changeValue: 'var(--dxp-g-neutral-1)',
        },
        {
            property: 'highlightsCardBackgroundColor',
            defaultValue: undefined,
            changeValue: 'var(--dxp-g-root)',
        },
        {
            property: 'highlightsCardTextColor',
            defaultValue: undefined,
            changeValue: 'var(--dxp-g-root-contrast)',
        },
        {
            property: 'highlightsCardBorderRadius',
            defaultValue: undefined,
            changeValue: '2',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof OrderDetails]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof OrderDetails]).not.toBe(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[propertyTest.property as keyof OrderDetailsDisplay] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof OrderDetails]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('verifies highlightsCardBackgroundColor value gets refelected in orderDetailsDisplay', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: orderSummaryFieldsData,
        });

        const orderDetailsDisplay: HTMLElement | null = (<OrderDetails & HTMLElement>element)!.querySelector(
            'commerce_my_account-order-details-display'
        );

        element.highlightsCardBackgroundColor = '#FFFFFF';
        await Promise.resolve();
        expect(orderDetailsDisplay?.style.cssText).toBe(
            '--com-c-my-account-order-details-background-color: #FFFFFF; --com-c-my-account-order-details-font-color: initial; --com-c-my-account-order-details-border-color: initial; --com-c-my-account-order-details-border-radius: initial;'
        );
    });

    it('verifies highlightsCardTextColor value gets reflected in orderDetailsDisplay', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: orderSummaryFieldsData,
        });

        const orderDetailsDisplay: HTMLElement | null = (<OrderDetails & HTMLElement>element)!.querySelector(
            'commerce_my_account-order-details-display'
        );

        element.highlightsCardTextColor = '#000000';
        await Promise.resolve();
        expect(orderDetailsDisplay?.style.cssText).toBe(
            '--com-c-my-account-order-details-background-color: initial; --com-c-my-account-order-details-font-color: #000000; --com-c-my-account-order-details-border-color: initial; --com-c-my-account-order-details-border-radius: initial;'
        );
    });

    it('verifies highlightsCardBorderColor value gets reflected in orderDetailsDisplay', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: orderSummaryFieldsData,
        });

        const orderDetailsDisplay: HTMLElement | null = (<OrderDetails & HTMLElement>element)!.querySelector(
            'commerce_my_account-order-details-display'
        );

        element.highlightsCardBorderColor = '#DDDDDD';
        await Promise.resolve();
        expect(orderDetailsDisplay?.style.cssText).toBe(
            '--com-c-my-account-order-details-background-color: initial; --com-c-my-account-order-details-font-color: initial; --com-c-my-account-order-details-border-color: #DDDDDD; --com-c-my-account-order-details-border-radius: initial;'
        );
    });

    it('verifies highlightsCardBorderRadius value gets reflected in orderDetailsDisplay', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: orderSummaryFieldsData,
        });

        const orderDetailsDisplay: HTMLElement | null = (<OrderDetails & HTMLElement>element)!.querySelector(
            'commerce_my_account-order-details-display'
        );

        element.highlightsCardBorderRadius = '10';
        await Promise.resolve();
        expect(orderDetailsDisplay?.style.cssText).toBe(
            '--com-c-my-account-order-details-background-color: initial; --com-c-my-account-order-details-font-color: initial; --com-c-my-account-order-details-border-color: initial; --com-c-my-account-order-details-border-radius: 10px;'
        );
    });

    it('Verifies highlightsTitle value gets refelected in orderDetailsDisplay', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: orderSummaryFieldsData,
        });

        await Promise.resolve();

        const orderDetailsDisplayElem: (HTMLElement & OrderDetailsDisplay) | null = (<OrderDetails & HTMLElement>(
            element
        ))!.querySelector('commerce_my_account-order-details-display');

        expect(orderDetailsDisplayElem?.titleText).toBeUndefined();

        element.highlightsTitle = 'TEST TITLE';
        await Promise.resolve();
        expect(orderDetailsDisplayElem?.titleText).toBe('TEST TITLE');
    });

    it('Tests that orderSummaryHighlightsFieldMapping is being set in the orderDetailsDisplay component', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: orderSummaryFieldsData,
            error: undefined,
        });

        element.orderSummaryHighlightsFieldMapping = orderSummaryFields;

        await Promise.resolve();

        const orderDetailsDisplayElem: (HTMLElement & OrderDetailsDisplay) | null = (<OrderDetails & HTMLElement>(
            element
        ))!.querySelector('commerce_my_account-order-details-display');

        expect(orderDetailsDisplayElem?.fieldMapping).toEqual(orderSummaryFields);
    });

    it('Tests that detailsData is being set in the orderDetailsDisplay component', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: orderSummaryFieldsData,
            error: undefined,
        });

        await Promise.resolve();

        const orderDetailsDisplayElem: (HTMLElement & OrderDetailsDisplay) | null = (<OrderDetails & HTMLElement>(
            element
        ))!.querySelector('commerce_my_account-order-details-display');

        expect(orderDetailsDisplayElem?.detailsData).toEqual(orderSummaryFieldsData);
    });

    it('Test error condition', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: null,
            error: {
                message: 'TEST ERROR',
            },
        });

        await Promise.resolve();

        const errorElem = (<HTMLElement>element)!.querySelector('commerce-error');

        expect(errorElem?.textContent).toContain(GENERIC_ERROR_MESSAGE);
    });
});
