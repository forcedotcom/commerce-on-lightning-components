import { createElement } from 'lwc';
import Summary from 'commerce_cart/summary';
import { querySelector, querySelectorAll } from 'kagekiri';
import { cartTotalsData } from './data/summaryData';

const selector = {
    originalPrice: '.original-price',
    subtotalPrice: '[data-subtotal] commerce-formatted-price',
    discountAmount: '[data-discount] commerce-formatted-price',
    shippingPrice: '[data-shipping] commerce-formatted-price',
    taxPrice: '[data-tax] commerce-formatted-price',
    totalPrice: '.total-price commerce-formatted-price',
    taxIncludedLabel: '.tax-included-label',
};

describe('commerce_cart/summary: Cart Summary', () => {
    let element: Summary & HTMLElement;

    type summary = 'cartTotals' | 'currencyCode';

    beforeEach(() => {
        element = createElement('commerce_cart-summary', {
            is: Summary,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe.each`
        property          | defaultValue | changeValue
        ${'cartTotals'}   | ${undefined} | ${null}
        ${'currencyCode'} | ${undefined} | ${'USD'}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(element[<summary>property]).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            // Ensure the value isn't already set to the target value.
            expect(element[<summary>property]).not.toBe(changeValue);

            // Change the value.
            element[<summary>property] = <never>changeValue;

            // Ensure we reflect the changed value.
            expect(element[<summary>property]).toBe(changeValue);
        });
    });

    describe('Cart Summary', () => {
        beforeEach(() => {
            element.cartTotals = cartTotalsData.pricesAreProvided;
        });

        it('is accessible', async () => {
            await Promise.resolve();
            return Promise.resolve().then(() => expect(element).toBeAccessible());
        });

        it(`displays cart summary prices when 'cartTotals' is provided`, () => {
            const cartPricesElements = querySelectorAll('commerce-formatted-price');
            expect(cartPricesElements).toHaveLength(6);
        });

        // Original Price
        it(`displays the original price when original price is provided`, async () => {
            element.cartTotals = cartTotalsData.pricesAreProvided;
            await Promise.resolve();

            const originalPriceElement = querySelector(selector.originalPrice);
            // @ts-ignore
            expect(originalPriceElement.value).toBe('5000');
        });

        it(`does not display the original price when original price is not provided`, async () => {
            element.cartTotals = cartTotalsData.pricesNotProvided;
            await Promise.resolve();

            const originalPriceElement = querySelector(selector.originalPrice);
            expect(originalPriceElement).toBeFalsy();
        });

        // Subtotal Price
        it(`displays the subtotal price when subtotal price is provided`, async () => {
            element.cartTotals = cartTotalsData.pricesAreProvided;
            await Promise.resolve();

            const subtotalPriceElement = querySelector(selector.subtotalPrice);
            // @ts-ignore
            expect(subtotalPriceElement.value).toBe('4000');
        });

        it(`does not display the subtotal price when subtotal price is not provided`, async () => {
            element.cartTotals = cartTotalsData.pricesNotProvided;
            await Promise.resolve();

            const subtotalPriceElement = querySelector(selector.subtotalPrice);
            expect(subtotalPriceElement).toBeFalsy();
        });

        // Shipping Price
        it(`displays the shipping price when shipping price is provided`, async () => {
            element.cartTotals = cartTotalsData.pricesAreProvided;
            await Promise.resolve();

            const shippingPriceElement = querySelector(selector.shippingPrice);
            // @ts-ignore
            expect(shippingPriceElement.value).toBe('10');
        });

        it(`does not display the shipping price when shipping price is not provided`, async () => {
            element.cartTotals = cartTotalsData.pricesNotProvided;
            await Promise.resolve();

            const shippingPriceElement = querySelector(selector.shippingPrice);
            expect(shippingPriceElement).toBeFalsy();
        });

        // Tax Price
        it(`displays the tax price when tax price is provided`, async () => {
            element.cartTotals = cartTotalsData.pricesAreProvided;
            await Promise.resolve();

            const taxPriceElement = querySelector(selector.taxPrice);
            // @ts-ignore
            expect(taxPriceElement.value).toBe('250');
        });

        it('does not display the tax price when the tax price is not provided', async () => {
            element.cartTotals = cartTotalsData.pricesNotProvided;
            await Promise.resolve();

            const taxPriceElement = querySelector(selector.taxPrice);
            expect(taxPriceElement).toBeFalsy();
        });

        // Total Price
        it(`displays the total price when total price is provided`, async () => {
            element.cartTotals = cartTotalsData.pricesAreProvided;
            await Promise.resolve();

            const totalPriceElement = querySelector(selector.totalPrice);
            // @ts-ignore
            expect(totalPriceElement.value).toBe('3260');
        });

        it(`does not display the total price when total price is not provided`, async () => {
            element.cartTotals = cartTotalsData.pricesNotProvided;
            await Promise.resolve();

            const totalPriceElement = querySelector(selector.totalPrice);
            // @ts-ignore
            expect(totalPriceElement.value).toBeFalsy();
        });
    });
});
