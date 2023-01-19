import { createElement } from 'lwc';
import type { TestWireAdapter } from 'types/testing';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import OrderAmount from 'commerce_my_account/orderAmount';
import type OrderTotalsWithFields from 'commerce_my_account/orderTotalsWithFields';
import { OrderAdapter } from 'commerce/orderApi';
import { grossTaxFields } from './data/grossTaxFields';
import { netTaxFields } from './data/netTaxFields';
import { netTaxFieldsData } from './data/netTaxFieldsData';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Refresh the page or contact us for assistance.';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

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

describe('commerce_my_account/orderAmount: Order Totals', () => {
    let element: HTMLElement & OrderAmount;

    beforeEach(() => {
        jest.clearAllMocks();
        // Create element
        element = createElement('commerce_my_account-order-summary-amount', {
            is: OrderAmount,
        });

        element.orderSummaryId = '1Osxx0000004CLwCAM';
        document.body.appendChild(element);
    });

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        document.body.removeChild(element);
    });

    it('Test custom style', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: netTaxFieldsData,
            error: undefined,
            loaded: true,
            loading: false,
        });

        const orderTotalsWithFieldsElem: HTMLElement | null = (<OrderAmount & HTMLElement>element)?.querySelector(
            'commerce_my_account-order-totals-with-fields'
        );

        expect(orderTotalsWithFieldsElem?.style.cssText).toBe(
            '--com-c-my-account-order-summary-amount-background-color: initial; --com-c-my-account-order-summary-amount-text-color: initial; --com-c-my-account-order-summary-amount-border-color: initial; --com-c-my-account-order-summary-amount-border-radius: initial;'
        );

        element.totalsCardBackgroundColor = '#FFFFFF';
        element.totalsCardTextColor = '#000000';
        await Promise.resolve();
        expect(orderTotalsWithFieldsElem?.style.cssText).toBe(
            '--com-c-my-account-order-summary-amount-background-color: #FFFFFF; --com-c-my-account-order-summary-amount-text-color: #000000; --com-c-my-account-order-summary-amount-border-color: initial; --com-c-my-account-order-summary-amount-border-radius: initial;'
        );

        element.totalsCardBorderColor = '#DDDDDD';
        element.totalsCardBorderRadius = '10';
        await Promise.resolve();
        expect(orderTotalsWithFieldsElem?.style.cssText).toBe(
            '--com-c-my-account-order-summary-amount-background-color: #FFFFFF; --com-c-my-account-order-summary-amount-text-color: #000000; --com-c-my-account-order-summary-amount-border-color: #DDDDDD; --com-c-my-account-order-summary-amount-border-radius: 10px;'
        );
    });

    it('Test error condition', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: null,
            error: {
                message: 'TEST ERROR',
            },
            loaded: true,
            loading: false,
        });

        await Promise.resolve();

        const orderTotalsWithFieldsElem: HTMLElement | null = (<OrderAmount & HTMLElement>element)?.querySelector(
            'commerce_my_account-order-totals-with-fields'
        );

        expect(orderTotalsWithFieldsElem).toBeNull();

        const errorElem: HTMLElement | null = (<HTMLElement>element)?.querySelector('commerce-error');

        expect(errorElem?.textContent).toContain(GENERIC_ERROR_MESSAGE);
    });

    it('Test totalsCardTitle', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: netTaxFieldsData,
            error: undefined,
            loaded: true,
            loading: false,
        });

        await Promise.resolve();

        const orderTotalsWithFieldsElem: (HTMLElement & OrderTotalsWithFields) | null = (<OrderAmount & HTMLElement>(
            element
        ))?.querySelector('commerce_my_account-order-totals-with-fields');

        expect(orderTotalsWithFieldsElem?.titleText).toBeUndefined();

        element.totalsCardTitle = 'TEST TITLE';
        await Promise.resolve();
        expect(orderTotalsWithFieldsElem?.titleText).toBe('TEST TITLE');
    });

    it('Test netTaxOrdersFieldMapping', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: netTaxFieldsData,
            error: undefined,
            loaded: true,
            loading: false,
        });

        element.netTaxOrdersFieldMapping = netTaxFields;

        await Promise.resolve();

        const orderTotalsWithFieldsElem: (HTMLElement & OrderTotalsWithFields) | null = (<OrderAmount & HTMLElement>(
            element
        ))?.querySelector('commerce_my_account-order-totals-with-fields');

        expect(orderTotalsWithFieldsElem?.netTaxFields).toEqual(netTaxFields);
    });

    it('Test grossTaxOrdersFieldMapping', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: netTaxFieldsData,
            error: undefined,
            loaded: true,
            loading: false,
        });

        element.grossTaxOrdersFieldMapping = grossTaxFields;

        await Promise.resolve();

        const orderTotalsWithFieldsElem: (HTMLElement & OrderTotalsWithFields) | null = (<OrderAmount & HTMLElement>(
            element
        ))?.querySelector('commerce_my_account-order-totals-with-fields');

        expect(orderTotalsWithFieldsElem?.grossTaxFields).toEqual(grossTaxFields);
    });

    it('Test totalsData', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: netTaxFieldsData,
            error: undefined,
            loaded: true,
            loading: false,
        });

        await Promise.resolve();

        const orderTotalsWithFieldsElem: (HTMLElement & OrderTotalsWithFields) | null = (<OrderAmount & HTMLElement>(
            element
        ))?.querySelector('commerce_my_account-order-totals-with-fields');

        expect(orderTotalsWithFieldsElem?.totalsData).toEqual(netTaxFieldsData);
    });

    it('Test showHorizontalLineAboveLastField', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: netTaxFieldsData,
            error: undefined,
            loaded: true,
            loading: false,
        });

        await Promise.resolve();

        const orderTotalsWithFieldsElem: (HTMLElement & OrderTotalsWithFields) | null = (<OrderAmount & HTMLElement>(
            element
        ))?.querySelector('commerce_my_account-order-totals-with-fields');

        expect(orderTotalsWithFieldsElem?.showHorizontalLineAboveLastField).toBe(false);

        element.showHorizontalLineAboveLastField = true;
        await Promise.resolve();

        expect(orderTotalsWithFieldsElem?.showHorizontalLineAboveLastField).toBe(true);
    });

    it('Test showLastFieldAsBold', async () => {
        (<typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter).emit({
            data: netTaxFieldsData,
            error: undefined,
            loaded: true,
            loading: false,
        });

        await Promise.resolve();

        const orderTotalsWithFieldsElem: (HTMLElement & OrderTotalsWithFields) | null = (<OrderAmount & HTMLElement>(
            element
        ))?.querySelector('commerce_my_account-order-totals-with-fields');

        expect(orderTotalsWithFieldsElem?.showLastFieldAsBold).toBe(false);

        element.showLastFieldAsBold = true;
        await Promise.resolve();

        expect(orderTotalsWithFieldsElem?.showLastFieldAsBold).toBe(true);
    });
});
