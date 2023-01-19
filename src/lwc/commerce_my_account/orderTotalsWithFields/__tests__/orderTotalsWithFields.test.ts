import { createElement } from 'lwc';
import OrderTotalsWithFields from 'commerce_my_account/orderTotalsWithFields';
import type OrderTotals from 'commerce_my_account/orderTotals';
import currency from '@salesforce/i18n/currency';

// Get the builder field items mock data
import { netTaxFields } from './data/netTaxFields';
import { grossTaxFields } from './data/grossTaxFields';
import { netTaxFieldsData } from './data/netTaxFieldsData';
import { grossTaxFieldsData } from './data/grossTaxFieldsData';
import { totalsDataWithoutFields, totalsDataNoPromoWithoutFields } from './data/totalsDataWithoutFields';

// Mock the currency
jest.mock(
    '@salesforce/i18n/currency',
    () => {
        return { default: 'USD' };
    },
    { virtual: true }
);

describe('commerce_my_account/orderTotalsWithFields: Order Summary Totals', () => {
    let element: HTMLElement & OrderTotalsWithFields;

    beforeEach(() => {
        jest.clearAllMocks();
        // Create element
        element = createElement('commerce_my_account-totals-with-fields', {
            is: OrderTotalsWithFields,
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
            property: 'netTaxFields',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'grossTaxFields',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'showHorizontalLineAboveLastField',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'showLastFieldAsBold',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'totalsData',
            defaultValue: undefined,
            changeValue: null,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof OrderTotalsWithFields]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof OrderTotalsWithFields]).not.toBe(
                    propertyTest.changeValue
                );

                // Change the value.
                // @ts-ignore
                element[propertyTest.property as keyof OrderTotalsWithFields] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof OrderTotalsWithFields]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('is accessible', () => {
        element.titleText = 'Totals';
        element.grossTaxFields = grossTaxFields;
        element.netTaxFields = netTaxFields;
        element.showHorizontalLineAboveLastField = true;
        element.showLastFieldAsBold = true;
        return Promise.resolve().then(async () => {
            await expect(element).toBeAccessible();
        });
    });

    [
        {
            netTaxFields: netTaxFields,
            grossTaxFields: grossTaxFields,
            totalsData: netTaxFieldsData,
            expectedFieldsLength: 4,
            testTitle: 'displays net tax order fields when order tax type is net tax',
        },
        {
            netTaxFields: netTaxFields,
            grossTaxFields: grossTaxFields,
            totalsData: grossTaxFieldsData,
            expectedFieldsLength: 5,
            testTitle: 'displays gross tax order fields when order tax type is gross tax',
        },
        {
            netTaxFields: undefined,
            grossTaxFields: undefined,
            totalsData: grossTaxFieldsData,
            expectedFieldsLength: 0,
            testTitle: 'does not display any fields when no net tax and gross tax fields are passed',
        },
        {
            netTaxFields: [],
            grossTaxFields: [],
            totalsData: grossTaxFieldsData,
            expectedFieldsLength: 0,
            testTitle: 'does not display any fields when empty net tax and gross tax fields are passed',
        },
    ].forEach((propertyTest) => {
        // eslint-disable-next-line jest/valid-title
        it(propertyTest.testTitle, () => {
            element.netTaxFields = propertyTest.netTaxFields;
            element.grossTaxFields = propertyTest.grossTaxFields;
            //@ts-ignore
            element.totalsData = propertyTest.totalsData;

            return Promise.resolve().then(() => {
                const totalsComponent: (HTMLElement & OrderTotals) | null | undefined = <HTMLElement & OrderTotals>(
                    element?.querySelector('commerce_my_account-order-totals')
                );

                expect(totalsComponent?.fields).toHaveLength(propertyTest.expectedFieldsLength);
            });
        });
    });

    it('does not display any fields when no fields attribute is passed', () => {
        element.netTaxFields = [];
        element.grossTaxFields = [];
        element.totalsData = totalsDataWithoutFields;

        return Promise.resolve().then(() => {
            const totalsComponent: (HTMLElement & OrderTotals) | null | undefined = <HTMLElement & OrderTotals>(
                element?.querySelector('commerce_my_account-order-totals')
            );

            expect(totalsComponent?.fields).toEqual([]);
        });
    });

    it('takes default currency when no currency code is passed', () => {
        element.netTaxFields = netTaxFields;
        element.grossTaxFields = grossTaxFields;

        element.totalsData = totalsDataWithoutFields;

        return Promise.resolve().then(() => {
            const totalsComponent: (HTMLElement & OrderTotals) | null | undefined = <HTMLElement & OrderTotals>(
                element?.querySelector('commerce_my_account-order-totals')
            );
            expect(totalsComponent?.currencyCode).toBe(currency);
        });
    });

    it('displays promo fields with a non zero value', () => {
        element.netTaxFields = netTaxFields;
        element.grossTaxFields = grossTaxFields;

        element.totalsData = totalsDataWithoutFields;

        return Promise.resolve().then(() => {
            const totalsComponent: (HTMLElement & OrderTotals) | null | undefined = <HTMLElement & OrderTotals>(
                element?.querySelector('commerce_my_account-order-totals')
            );
            expect(totalsComponent?.fields?.length).toBe(1);
        });
    });

    it('does not displays promo fields with a zero value', () => {
        element.netTaxFields = netTaxFields;
        element.grossTaxFields = grossTaxFields;

        element.totalsData = totalsDataNoPromoWithoutFields;

        return Promise.resolve().then(() => {
            const totalsComponent: (HTMLElement & OrderTotals) | null | undefined = <HTMLElement & OrderTotals>(
                element?.querySelector('commerce_my_account-order-totals')
            );
            expect(totalsComponent?.fields?.length).toBe(0);
        });
    });

    it('displays correct currency code when CurrencyIsoCode is passed', () => {
        element.netTaxFields = netTaxFields;
        element.grossTaxFields = grossTaxFields;
        //@ts-ignore
        element.totalsData = grossTaxFieldsData;

        return Promise.resolve().then(() => {
            const totalsComponent: (HTMLElement & OrderTotals) | null | undefined = <HTMLElement & OrderTotals>(
                element?.querySelector('commerce_my_account-order-totals')
            );
            expect(totalsComponent?.currencyCode).toBe('INR');
        });
    });
});
