import { createElement } from 'lwc';
import OrderAmount from 'commerce_builder/orderAmount';
import type MyAccountOrderAmount from 'commerce_my_account/orderAmount';
import { grossTaxFields } from './data/grossTaxFields';
import { netTaxFields } from './data/netTaxFields';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

describe('commerce_builder/orderAmount', () => {
    let element: HTMLElement & OrderAmount;

    beforeEach(() => {
        jest.clearAllMocks();
        // Create element
        element = createElement('commerce_builder-order-amount', {
            is: OrderAmount,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        document.body.removeChild(element);
    });

    it('Test _netTaxFields', async () => {
        element.netTaxOrdersFieldMapping = JSON.stringify(netTaxFields);

        await Promise.resolve();

        const myAccountOrderAmountElem: (HTMLElement & MyAccountOrderAmount) | null = (<OrderAmount & HTMLElement>(
            element
        ))?.querySelector('commerce_my_account-order-amount');

        expect(myAccountOrderAmountElem?.netTaxOrdersFieldMapping).toEqual(netTaxFields);
    });

    it('Test _grossTaxFields', async () => {
        element.grossTaxOrdersFieldMapping = JSON.stringify(grossTaxFields);

        await Promise.resolve();

        const myAccountOrderAmountElem: (HTMLElement & MyAccountOrderAmount) | null = (<OrderAmount & HTMLElement>(
            element
        ))?.querySelector('commerce_my_account-order-amount');

        expect(myAccountOrderAmountElem?.grossTaxOrdersFieldMapping).toEqual(grossTaxFields);
    });
});
