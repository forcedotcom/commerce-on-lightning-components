import { createElement } from 'lwc';
import OrderDetailsDisplay from 'commerce_my_account/orderDetailsDisplay';
import type FieldDisplay from 'commerce/fieldDisplay';
import { orderSummaryFields } from './data/orderSummaryFields';
import { detailsDataWithoutCurrency } from './data/detailsDataWithoutCurrency';
import { detailsData } from './data/detailsData';

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => ''),
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
}));

jest.mock('lightning/uiRecordApi', () => ({
    getFieldValue: jest.fn(),
    getRecord: jest.fn(),
}));

// Mock the currency
jest.mock(
    '@salesforce/i18n/currency',
    () => {
        return { default: 'USD' };
    },
    { virtual: true }
);

describe('commerce_my_account/OrderDetailsDisplay: Order Details Display', () => {
    let element: HTMLElement & OrderDetailsDisplay;

    beforeEach(() => {
        jest.clearAllMocks();
        // Create element
        element = createElement('commerce_my_account-order-details-display', {
            is: OrderDetailsDisplay,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        document.body.removeChild(element);
    });
    [
        {
            property: 'titleText',
            defaultValue: undefined,
            changeValue: 'Snazzy Title!',
        },
        {
            property: 'fieldMapping',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'detailsData',
            defaultValue: undefined,
            changeValue: null,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof OrderDetailsDisplay]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof OrderDetailsDisplay]).not.toBe(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[propertyTest.property as keyof OrderDetailsDisplay] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof OrderDetailsDisplay]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('takes default currency when no currency code is passed', () => {
        element.fieldMapping = orderSummaryFields;

        element.detailsData = detailsDataWithoutCurrency;

        return Promise.resolve().then(() => {
            const fieldDisplayElem: (HTMLElement & FieldDisplay) | null = (<HTMLElement>element)?.querySelector(
                'commerce-field-display'
            );
            expect(fieldDisplayElem?.currencyCode).toBe('USD');
        });
    });

    it('displays correct currency code when CurrencyIsoCode is passed', () => {
        element.fieldMapping = orderSummaryFields;

        element.detailsData = detailsData;

        return Promise.resolve().then(() => {
            const fieldDisplayElem: (HTMLElement & FieldDisplay) | null = (<HTMLElement>element)?.querySelector(
                'commerce-field-display'
            );
            expect(fieldDisplayElem?.currencyCode).toBe('INR');
        });
    });

    it('tests that currency code is undefined when no details data is passed', () => {
        element.fieldMapping = orderSummaryFields;

        return Promise.resolve().then(() => {
            const fieldDisplayElem: (HTMLElement & FieldDisplay) | null = (<HTMLElement>element)?.querySelector(
                'commerce-field-display'
            );
            expect(fieldDisplayElem?.currencyCode).toBeUndefined();
        });
    });
});
