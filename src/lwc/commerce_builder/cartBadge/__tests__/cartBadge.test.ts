import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import CartBadge from 'commerce_builder/cartBadge';
import type Badge from 'commerce_cart/badge';
import type { ProductCountType } from '../types';

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => 'current_cart'),
    NavigationContext: mockCreateTestWireAdapter(),
    navigate: jest.fn(),
    CurrentPageReference: mockCreateTestWireAdapter(),
}));

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(),
    }),
    { virtual: true }
);

describe('Cart Badge', () => {
    let element: HTMLElement & CartBadge;

    beforeEach(() => {
        jest.clearAllMocks();

        element = createElement('commerce_builder-cart-badge', {
            is: CartBadge,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            value: 'UniqueProductCount',
            expected: 'Unique',
        },
        {
            value: 'TotalProductCount',
            expected: 'Total',
        },
        {
            value: undefined,
            expected: 'Total',
        },
    ].forEach((countType) => {
        it('Count type', async () => {
            element.countType = <ProductCountType>countType.value;

            await Promise.resolve();

            const badge: (HTMLElement & Badge) | null = element.querySelector('commerce_cart-badge');
            expect(badge?.countType).toBe(countType.expected);
        });
    });
});
