import { getPriceLabel, getProductLabel } from '../labelGenerators';

jest.mock('commerce/currencyFormatter', () => ({
    __esModule: true,
    default: (_currency: string, value: number | string | null | undefined, _currencyDisplay: string): string =>
        '$' + value?.toString(),
}));

describe('getPriceLabel', () => {
    [
        {
            label: 'test {0}',
            amount: 12.99,
            placeHolder: '{0}',
            expected: 'test $12.99',
        },
        {
            label: undefined,
            amount: 12.99,
            placeHolder: '{0}',
            expected: '',
        },
        {
            label: 'test {0}',
            amount: 12.99,
            placeHolder: undefined,
            expected: 'test $12.99',
        },
        {
            label: 'test {0}',
            amount: '12.99',
            placeHolder: undefined,
            expected: 'test $12.99',
        },
        {
            label: 'test {0}',
            amount: 12.99,
            placeHolder: '{amount}',
            expected: 'test {0}',
        },
    ].forEach((values) => {
        it(`generates this string: ${values.expected}`, () => {
            expect(getPriceLabel(values.label, values.amount, 'USD', values.placeHolder)).toBe(values.expected);
        });
    });
});

describe('getProductLabel', () => {
    [
        {
            label: 'test {0}',
            name: 'PRODUCT_NAME',
            placeHolder: '{0}',
            expected: 'test PRODUCT_NAME',
        },
        {
            label: undefined,
            name: 'PRODUCT_NAME',
            placeHolder: '{0}',
            expected: '',
        },
        {
            label: 'test {name}',
            name: 'PRODUCT_NAME',
            placeHolder: undefined,
            expected: 'test PRODUCT_NAME',
        },
        {
            label: 'test {0}',
            name: ' ',
            placeHolder: '{0}',
            expected: 'test',
        },
        {
            label: 'test {0}',
            name: undefined,
            placeHolder: '{0}',
            expected: 'test',
        },
    ].forEach((values) => {
        it(`generates this string: ${values.expected}`, () => {
            expect(getProductLabel(values.label, values.name, values.placeHolder)).toBe(values.expected);
        });
    });
});
