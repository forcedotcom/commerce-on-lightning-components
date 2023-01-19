import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import type { CommerceError } from 'commerce/cartApi';
import { CartSummaryAdapter } from 'commerce/cartApi';
import Summary from 'commerce_builder/cartSummary';
import { apiData } from './data/cartSummaryData';
import type { TestWireAdapter } from 'types/testing';

jest.mock('commerce/cartApi', () =>
    Object.assign({}, jest.requireActual('commerce/cartApi'), {
        CartSummaryAdapter: mockCreateTestWireAdapter(),
    })
);
jest.mock(
    '@salesforce/label/Commerce_Cart_Error_Messages.getCartItemsInsufficientAccessErrorMessage',
    () => {
        return {
            default: 'Insufficient Access Error Message.',
        };
    },
    { virtual: true }
);
// The mockFn is needed to test whether Toast.show was called, simply spying on Toast.show does not work
const mockTestFn = jest.fn();
jest.mock('lightning/toast', () => ({
    show: jest.fn((param) => mockTestFn(param)),
}));
const cartSummaryAdapter = <typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter;

/**
 * Error code returned for an empty cart.
 */
const MISSING_RECORD = 'MISSING_RECORD';

/**
 * Default displayable Cart Totals.
 */
const DEFAULT_CART_TOTALS = {
    discountAmount: '-1000',
    originalPrice: '5000',
    shippingPrice: '0',
    subtotal: '4000',
    tax: '250',
    total: '3250',
};

describe('commerce_builder/cartSummary: Cart Summary', () => {
    let element: Summary & HTMLElement;

    type summary =
        | 'backgroundColor'
        | 'discountAmountTextColor'
        | 'discountAmountTextSize'
        | 'originalTextColor'
        | 'originalTextSize'
        | 'shippingTextColor'
        | 'shippingTextSize'
        | 'showDiscountAmount'
        | 'showOriginalPrice'
        | 'showShippingPrice'
        | 'showSubtotalPrice'
        | 'showTaxIncludedLabel'
        | 'showTaxPrice'
        | 'subtotalTextColor'
        | 'subtotalTextSize'
        | 'taxIncludedLabelFontColor'
        | 'taxIncludedLabelFontSize'
        | 'taxTextColor'
        | 'taxTextSize'
        | 'totalTextColor'
        | 'totalTextSize';

    beforeEach(() => {
        jest.clearAllMocks();
        element = createElement('commerce_builder-cart-summary', {
            is: Summary,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe.each`
        property                       | defaultValue | changeValue
        ${'backgroundColor'}           | ${undefined} | ${''}
        ${'discountAmountTextColor'}   | ${undefined} | ${'#111111'}
        ${'discountAmountTextSize'}    | ${undefined} | ${'small'}
        ${'originalTextColor'}         | ${undefined} | ${'#111111'}
        ${'originalTextSize'}          | ${undefined} | ${'small'}
        ${'shippingTextColor'}         | ${undefined} | ${''}
        ${'shippingTextSize'}          | ${undefined} | ${'small'}
        ${'showDiscountAmount'}        | ${false}     | ${true}
        ${'showOriginalPrice'}         | ${false}     | ${true}
        ${'showShippingPrice'}         | ${false}     | ${true}
        ${'showSubtotalPrice'}         | ${false}     | ${true}
        ${'showTaxIncludedLabel'}      | ${false}     | ${true}
        ${'showTaxPrice'}              | ${false}     | ${true}
        ${'subtotalTextColor'}         | ${undefined} | ${'#111111'}
        ${'subtotalTextSize'}          | ${undefined} | ${'small'}
        ${'taxIncludedLabelTextColor'} | ${undefined} | ${'#111111'}
        ${'taxIncludedLabelTextSize'}  | ${undefined} | ${'small'}
        ${'taxTextColor'}              | ${undefined} | ${'#111111'}
        ${'taxTextSize'}               | ${undefined} | ${'medium'}
        ${'totalTextColor'}            | ${undefined} | ${'#111111'}
        ${'totalTextSize'}             | ${undefined} | ${'large'}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(element[<summary>property]).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            expect(element[<summary>property]).not.toBe(changeValue);
            element[<summary>property] = <never>changeValue;
            expect(element[<summary>property]).toBe(changeValue);
        });
    });

    describe('CartSummary', () => {
        beforeEach(() => {
            element.showDiscountAmount = true;
            element.showOriginalPrice = true;
            element.showShippingPrice = true;
            element.showSubtotalPrice = true;
            element.showTaxPrice = true;
        });

        [undefined, apiData.cartSummaryNoItems].forEach((cartSummaryData) => {
            it(`is not displayed when there are no cart items - cart data is ${JSON.stringify(
                cartSummaryData
            )}`, async () => {
                cartSummaryAdapter.emit({
                    data: cartSummaryData,
                    error: undefined,
                    loaded: true,
                    loading: false,
                });

                await Promise.resolve();

                const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
                expect(cartSummaryElement).toBeFalsy();
            });
        });

        // Original Price
        it(`provides the original price when 'showOriginalPrice' is true`, async () => {
            cartSummaryAdapter.emit({
                data: apiData.cartSummaryNetTax,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.originalPrice).toBeTruthy();
        });

        it(`should call toast message with cart summary api error code`, async () => {
            cartSummaryAdapter.emit({
                data: undefined,
                error: <CommerceError>{ code: 'INSUFFICIENT_ACCESS' },
                loaded: true,
                loading: false,
            });

            await Promise.resolve();
            expect(mockTestFn).toHaveBeenCalledWith({ label: 'Insufficient Access Error Message.', variant: 'error' });
        });

        it(`toast notification should not be displayed on error if the user is in builder with cartTotals having default data`, async () => {
            element.cartTotals = DEFAULT_CART_TOTALS;
            cartSummaryAdapter.emit({
                data: undefined,
                error: <CommerceError>{ code: 'INSUFFICIENT_ACCESS' },
                loaded: true,
                loading: false,
            });

            await Promise.resolve();
            expect(mockTestFn).not.toHaveBeenCalled();
        });

        it(`toast notification of type error is not display when cart is empty`, async () => {
            cartSummaryAdapter.emit({
                data: undefined,
                error: <CommerceError>{ code: MISSING_RECORD },
                loaded: true,
                loading: false,
            });

            await Promise.resolve();
            expect(mockTestFn).not.toHaveBeenCalled();
        });

        it(`does not provide the original price when 'showOriginalPrice' is false`, async () => {
            element.showOriginalPrice = false;
            cartSummaryAdapter.emit({
                data: apiData.cartSummaryNetTax,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.originalPrice).toBeFalsy();
        });

        // Subtotal Price
        it(`provides the subtotal price when 'showSubtotalPrice' is true`, async () => {
            cartSummaryAdapter.emit({
                data: apiData.cartSummaryNetTax,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.subtotal).toBeTruthy();
        });

        it(`does not provide the subtotal price when 'showSubtotalPrice' is false`, async () => {
            element.showSubtotalPrice = false;
            cartSummaryAdapter.emit({
                data: apiData.cartSummaryNetTax,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.subtotal).toBeFalsy();
        });

        // Discount Amount
        it(`provides the discount amount when 'showDiscountAmount' is true`, async () => {
            cartSummaryAdapter.emit({
                data: apiData.cartSummaryNetTax,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.discountAmount).toBeTruthy();
        });

        it(`does not provide the discount amount when 'showDiscountAmount' is false`, async () => {
            element.showDiscountAmount = false;
            cartSummaryAdapter.emit({
                data: apiData.cartSummaryNetTax,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.discountAmount).toBeFalsy();
        });

        // Shipping Price
        it(`provides the shipping price when 'showShippingPrice' is true`, async () => {
            cartSummaryAdapter.emit({
                data: apiData.cartSummaryNetTax,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.shippingPrice).toBeTruthy();
        });

        it(`does not provide the shipping price when 'showShippingPrice' is false`, async () => {
            element.showShippingPrice = false;
            cartSummaryAdapter.emit({
                data: apiData.cartSummaryNetTax,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.shippingPrice).toBeFalsy();
        });

        // Tax Price
        it(`provides the tax price when 'showTaxPrice' is true`, async () => {
            cartSummaryAdapter.emit({
                data: apiData.cartSummaryNetTax,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.tax).toBeTruthy();
        });

        it(`does not provide the tax price when 'showTaxPrice' is false`, async () => {
            element.showTaxPrice = false;
            cartSummaryAdapter.emit({
                data: apiData.cartSummaryNetTax,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.tax).toBeFalsy();
        });

        it(`does not provide the tax price when the store tax type is 'Gross'`, async () => {
            cartSummaryAdapter.emit({
                data: apiData.cartSummaryGrossTax,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.tax).toBeFalsy();
        });

        // Total Price
        it(`provides the total price when cart totals are provided`, async () => {
            cartSummaryAdapter.emit({
                data: apiData.cartSummaryNetTax,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.total).toBeTruthy();
        });

        it(`does not provide the total price when cart prices from api are undefined}`, async () => {
            cartSummaryAdapter.emit({
                data: apiData.cartSummaryUndefinedPrices,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.total).toBeFalsy();
        });

        it(`does not provide the total price when cart summary data is null`, async () => {
            cartSummaryAdapter.emit({
                data: null,
                error: undefined,
                loaded: true,
                loading: false,
            });

            await Promise.resolve();

            const cartSummaryElement = element.querySelector<Summary & HTMLElement>('commerce_cart-summary');
            expect(cartSummaryElement?.cartTotals?.total).toBeFalsy();
        });

        // Tax Included Label
        describe('shows the tax included label', () => {
            it(`when the store tax type is 'Gross' and showTaxIncludedLabel is true`, async () => {
                element.showTaxIncludedLabel = true;
                cartSummaryAdapter.emit({
                    data: apiData.cartSummaryGrossTax,
                    error: undefined,
                    loaded: true,
                    loading: false,
                });

                await Promise.resolve();

                const taxIncludedSlotElement = element.querySelector('div[slot=taxIncludedLabel]');
                expect(taxIncludedSlotElement).toBeTruthy();
            });

            it('when the store tax type is undefined, cartTotals is provided, and showTaxIncludedLabel is true', async () => {
                element.showTaxIncludedLabel = true;
                element.cartTotals = DEFAULT_CART_TOTALS;
                cartSummaryAdapter.emit({
                    data: null,
                    error: undefined,
                    loaded: true,
                    loading: false,
                });

                await Promise.resolve();

                const taxIncludedSlotElement = element.querySelector('div[slot=taxIncludedLabel]');
                expect(taxIncludedSlotElement).toBeTruthy();
            });
        });

        describe.each`
            taxType      | cartTotals             | showTaxIncludedLabel
            ${'Gross'}   | ${undefined}           | ${false}
            ${'Net'}     | ${undefined}           | ${true}
            ${'Net'}     | ${undefined}           | ${false}
            ${'Gross'}   | ${DEFAULT_CART_TOTALS} | ${false}
            ${'Net'}     | ${DEFAULT_CART_TOTALS} | ${false}
            ${undefined} | ${DEFAULT_CART_TOTALS} | ${false}
            ${undefined} | ${undefined}           | ${true}
            ${undefined} | ${undefined}           | ${false}
        `('does not show the tax included label', ({ taxType, cartTotals, showTaxIncludedLabel }) => {
            it(`when the store tax type is ${JSON.stringify(taxType)},
                cartTotals is ${JSON.stringify(cartTotals)},
                and showTaxIncludedLabel is ${JSON.stringify(showTaxIncludedLabel)}`, async () => {
                element.showTaxIncludedLabel = showTaxIncludedLabel;
                element.cartTotals = cartTotals;
                let apiDataSource;
                switch (taxType) {
                    case 'Net':
                        apiDataSource = apiData.cartSummaryNetTax;
                        break;
                    case 'Gross':
                        apiDataSource = apiData.cartSummaryNetTax;
                        break;
                    default:
                        apiDataSource = null;
                }
                cartSummaryAdapter.emit({
                    data: apiDataSource,
                    error: undefined,
                    loaded: true,
                    loading: false,
                });

                await Promise.resolve();

                const taxIncludedSlotElement = element.querySelector('div[slot=taxIncludedLabel]');
                expect(taxIncludedSlotElement).toBeFalsy();
            });
        });
    });
});
