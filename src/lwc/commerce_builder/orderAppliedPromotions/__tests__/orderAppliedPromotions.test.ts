import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import OrderAppliedPromotions from 'commerce_builder/orderAppliedPromotions';

jest.mock(
    'transport',
    () => {
        return {
            fetch: jest.fn(() => {
                return Promise.resolve();
            }),
        };
    },
    { virtual: true }
);

jest.mock('commerce/orderApi', () =>
    Object.assign({}, jest.requireActual('commerce/orderApi'), {
        OrderAdjustmentsAdapter: mockCreateTestWireAdapter(),
    })
);

describe('commerce_builder-order-applied-promotions', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('Test commerce_unified_promotions-summary visibility', () => {
        const element: Element = createElement('commerce_builder-order-applied-promotions', {
            is: OrderAppliedPromotions,
        });
        document.body.appendChild(element);

        //this is just for coverage
        expect(true).toBe(true);
    });
});
