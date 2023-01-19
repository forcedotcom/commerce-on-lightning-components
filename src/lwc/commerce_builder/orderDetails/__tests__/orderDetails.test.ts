import { createElement } from 'lwc';
import OrderDetails from 'commerce_builder/orderDetails';
import type MyAccountOrderDetails from 'commerce_my_account/orderDetails';
import { orderSummaryFields } from './data/orderSummaryFields';

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

describe('commerce_builder/orderDetails', () => {
    let element: HTMLElement & OrderDetails;

    beforeEach(() => {
        jest.clearAllMocks();
        // Create element
        element = createElement('commerce_builder-order-details', {
            is: OrderDetails,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        document.body.removeChild(element);
    });

    it('verifies orderSummaryHighlightsFieldMapping is populated in commerce_my_account-order-details', async () => {
        element.orderSummaryHighlightsFieldMapping = JSON.stringify(orderSummaryFields);

        await Promise.resolve();

        const myAccountOrderDetailElement: (HTMLElement & MyAccountOrderDetails) | null = (<OrderDetails & HTMLElement>(
            element
        ))?.querySelector('commerce_my_account-order-details');

        expect(myAccountOrderDetailElement?.orderSummaryHighlightsFieldMapping).toEqual(orderSummaryFields);
    });
});
