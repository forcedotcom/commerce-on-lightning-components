import { displayDiscountPrice } from 'commerce_unified_promotions/discountPriceDisplayEvaluator';

describe('commerce_unified_promotions/discountPriceDisplayEvaluator: Discount Price Display', () => {
    [
        {
            showDiscountPrice: true,
            prices: ['-500.00', '-399.99', '-0.90'],
            expectedValue: true,
        },
        {
            showDiscountPrice: false,
            prices: ['-500.00', '-399.99', '-0.90'],
            expectedValue: false,
        },
        {
            showDiscountPrice: true,
            prices: ['', 'Not a number', '0', '-0', '500'],
            expectedValue: false,
        },
    ].forEach((scenario) => {
        scenario.prices.forEach((discountPrice) => {
            it(` returns ${scenario.expectedValue} when showDiscountPrice is ${scenario.showDiscountPrice} and discountPrice is ${discountPrice})`, () => {
                const result = displayDiscountPrice(scenario.showDiscountPrice, discountPrice);
                expect(result).toBe(scenario.expectedValue);
            });
        });
    });
});
