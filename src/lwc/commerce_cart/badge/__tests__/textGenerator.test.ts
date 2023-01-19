import generateText from '../textGenerator';
import type { CountType } from '../types';
// Mock the labels with known values.
jest.mock('../labels', () => ({
    itemsInCart: '{0} items in cart',
    itemInCart: '1 item in cart',
    productTypesInCart: '{0} product types in cart',
    productTypeInCart: '{0} product type in cart',
    emptyCart: 'Cart is empty',
}));

describe('commerce_cart/badge: Text Generator', () => {
    [
        {
            count: 1,
            countType: 'Unique',
            result: '1 product type in cart',
        },
        {
            count: 1,
            countType: 'Total',
            result: '1 item in cart',
        },
        {
            count: 2,
            countType: 'Unique',
            result: '2 product types in cart',
        },
        {
            count: 2,
            countType: 'Total',
            result: '2 items in cart',
        },
        {
            count: 0,
            countType: 'Unique',
            result: 'Cart is empty',
        },
        {
            count: 0,
            countType: 'Total',
            result: 'Cart is empty',
        },
        {
            count: -1,
            countType: 'Unique',
            result: 'Cart is empty',
        },
        {
            count: -1,
            countType: 'Total',
            result: 'Cart is empty',
        },
        {
            count: undefined,
            countType: 'Unique',
            result: 'Cart is empty',
        },
        {
            count: undefined,
            countType: 'Total',
            result: 'Cart is empty',
        },
        {
            count: null,
            countType: 'Unique',
            result: 'Cart is empty',
        },
        {
            count: null,
            countType: 'Total',
            result: 'Cart is empty',
        },
    ].forEach((p) => {
        it(`returns the string "${p.result}" when given countType: "${p.countType}"`, () => {
            const labelStr = generateText(p.countType as CountType, p.count);
            expect(labelStr).toBe(p.result);
        });
    });

    ['', undefined, null].forEach((countType) => {
        it(`generates no text for an invalid countType (${countType})`, () => {
            expect(generateText(countType as CountType, 1)).toBeUndefined();
        });
    });
});
