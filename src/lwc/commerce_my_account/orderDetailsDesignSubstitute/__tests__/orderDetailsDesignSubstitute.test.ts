import { createElement } from 'lwc';

import OrderDetails from 'commerce_my_account/orderDetailsDesignSubstitute';
import { orderSummaryFields } from './data/orderSummaryFields';
import type OrderDetailsDisplay from 'commerce_my_account/orderDetailsDisplay';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => ''),
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
}));

jest.mock('lightning/uiRecordApi', () => ({
    getFieldValue: jest.fn(),
    getRecord: jest.fn(),
}));

describe('commerce_my_account/orderDetailsDesignSubstitute', () => {
    let element: HTMLElement & OrderDetails;

    beforeEach(() => {
        jest.clearAllMocks();
        // Create element
        element = createElement('commerce_my_account-order-details-design-substitute', {
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
        const orderDetailsDisplay: HTMLElement | null = (<OrderDetails & HTMLElement>element)?.querySelector(
            'commerce_my_account-order-details-display'
        );

        element.highlightsCardBackgroundColor = '#FFFFFF';
        await Promise.resolve();
        expect(orderDetailsDisplay?.style.cssText).toBe(
            '--com-c-my-account-order-details-background-color: #FFFFFF; --com-c-my-account-order-details-font-color: initial; --com-c-my-account-order-details-border-color: initial; --com-c-my-account-order-details-border-radius: initial;'
        );
    });

    it('verifies highlightsCardTextColor value gets reflected in orderDetailsDisplay', async () => {
        const orderDetailsDisplay: HTMLElement | null = (<OrderDetails & HTMLElement>element)?.querySelector(
            'commerce_my_account-order-details-display'
        );

        element.highlightsCardTextColor = '#000000';
        await Promise.resolve();
        expect(orderDetailsDisplay?.style.cssText).toBe(
            '--com-c-my-account-order-details-background-color: initial; --com-c-my-account-order-details-font-color: #000000; --com-c-my-account-order-details-border-color: initial; --com-c-my-account-order-details-border-radius: initial;'
        );
    });

    it('verifies highlightsCardBorderColor value gets reflected in orderDetailsDisplay', async () => {
        const orderDetailsDisplay: HTMLElement | null = (<OrderDetails & HTMLElement>element)?.querySelector(
            'commerce_my_account-order-details-display'
        );

        element.highlightsCardBorderColor = '#DDDDDD';
        await Promise.resolve();
        expect(orderDetailsDisplay?.style.cssText).toBe(
            '--com-c-my-account-order-details-background-color: initial; --com-c-my-account-order-details-font-color: initial; --com-c-my-account-order-details-border-color: #DDDDDD; --com-c-my-account-order-details-border-radius: initial;'
        );
    });

    it('verifies highlightsCardBorderRadius value gets reflected in orderDetailsDisplay', async () => {
        const orderDetailsDisplay: HTMLElement | null = (<OrderDetails & HTMLElement>element)?.querySelector(
            'commerce_my_account-order-details-display'
        );

        element.highlightsCardBorderRadius = '10';
        await Promise.resolve();
        expect(orderDetailsDisplay?.style.cssText).toBe(
            '--com-c-my-account-order-details-background-color: initial; --com-c-my-account-order-details-font-color: initial; --com-c-my-account-order-details-border-color: initial; --com-c-my-account-order-details-border-radius: 10px;'
        );
    });

    it('Test _fieldMapping', async () => {
        element.orderSummaryHighlightsFieldMapping = JSON.stringify(orderSummaryFields);

        await Promise.resolve();

        const orderDetailsDisplay: (HTMLElement & OrderDetailsDisplay) | null = (<OrderDetails & HTMLElement>(
            element
        ))?.querySelector('commerce_my_account-order-details-display');

        expect(orderDetailsDisplay?.fieldMapping).toEqual(orderSummaryFields);
    });
});
