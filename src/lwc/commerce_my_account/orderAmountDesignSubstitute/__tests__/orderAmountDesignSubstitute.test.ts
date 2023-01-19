import { createElement } from 'lwc';
import OrderAmount from 'commerce_my_account/orderAmountDesignSubstitute';
import { grossTaxFields } from './data/grossTaxFields';
import { netTaxFields } from './data/netTaxFields';

import type OrderTotalsWithFields from 'commerce_my_account/orderTotalsWithFields';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

describe('commerce_my_account/orderAmountDesignSubstitute', () => {
    let element: HTMLElement & OrderAmount;

    beforeEach(() => {
        jest.clearAllMocks();
        // Create element
        element = createElement('commerce_my_account-order-amount-design-substitute', {
            is: OrderAmount,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        document.body.removeChild(element);
    });

    it('Test custom style', async () => {
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

    it('Test _netTaxFields', async () => {
        element.netTaxOrdersFieldMapping = JSON.stringify(netTaxFields);

        await Promise.resolve();

        const orderTotalsWithFieldsElem: (HTMLElement & OrderTotalsWithFields) | null = (<OrderAmount & HTMLElement>(
            element
        ))?.querySelector('commerce_my_account-order-totals-with-fields');

        expect(orderTotalsWithFieldsElem?.netTaxFields).toEqual(netTaxFields);
    });

    it('Test _grossTaxFields', async () => {
        element.grossTaxOrdersFieldMapping = JSON.stringify(grossTaxFields);

        await Promise.resolve();

        const orderTotalsWithFieldsElem: (HTMLElement & OrderTotalsWithFields) | null = (<OrderAmount & HTMLElement>(
            element
        ))?.querySelector('commerce_my_account-order-totals-with-fields');

        expect(orderTotalsWithFieldsElem?.grossTaxFields).toEqual(grossTaxFields);
    });
});
