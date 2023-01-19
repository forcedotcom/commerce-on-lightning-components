import { getLabelForOriginalPrice } from 'commerce_cart/originalPriceLabelGenerator';

jest.mock(
    '@salesforce/label/Commerce_Cart_Summary.originalPriceAssistiveText',
    () => {
        return { default: 'Original price (crossed out): {0}' };
    },
    { virtual: true }
);

describe('Original price label generator', () => {
    [
        {
            currencyCode: null,
            price: null,
        },
        {
            currencyCode: undefined,
            price: '132',
        },
        {
            currencyCode: '',
            price: '132',
        },
        {
            currencyCode: 'USD',
            price: null,
        },
        {
            currencyCode: 'USD',
            price: undefined,
        },
        {
            currencyCode: 'USD',
            price: '',
        },
    ].forEach((input) => {
        it(`returns an empty string if invalid input (${input.currencyCode}, ${input.price}) is provided`, () => {
            expect(getLabelForOriginalPrice(input.currencyCode, input.price)).toBe('');
        });
    });

    [
        {
            currencyCode: 'USD',
            price: '240',
            expected: 'Original price (crossed out): $240.00',
        },
        {
            currencyCode: 'GBP',
            price: '240',
            expected: 'Original price (crossed out): £240.00',
        },
    ].forEach((input) => {
        it(`gets the aria label for the original price (${input.currencyCode}, ${input.price})`, () => {
            expect(getLabelForOriginalPrice(input.currencyCode, input.price)).toEqual(input.expected);
        });
    });
});
