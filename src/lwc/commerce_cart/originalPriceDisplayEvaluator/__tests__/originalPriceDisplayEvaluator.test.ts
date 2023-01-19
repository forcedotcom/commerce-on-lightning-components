import canDisplayOriginalPrice from 'commerce_cart/originalPriceDisplayEvaluator';

// originalPrice is GREATER than negotiatedPrice
const originalPriceGreaterThanNegotiatedPrice = {
    original: ['999.99', '700', '650'],
    negotiated: ['500', '399.99', '0'],
    description: 'the original price is GREATER than the negotiated price',
};

// originalPrice is LESS than negotiatedPrice
const originalPriceLessThanNegotiatedPrice = {
    original: ['500', '399.99', '0'],
    negotiated: ['999.99', '700', '650'],
    description: 'the original price is LESS than the negotiated price',
};

// originalPrice is EQUAL to negotiatedPrice
const originalPriceEqualsNegotiatedPrice = {
    original: ['989.99'],
    negotiated: ['989.99'],
    description: 'the original price is EQUAL to the negotiated price',
};

// originalPrice is EQUAL to negotiatedPrice, where the value is 0
const originalPriceEqualsNegotiatedPriceZero = {
    original: [0],
    negotiated: [0],
    description: 'the original price is EQUAL to the negotiated price',
};

// originalPrice is provided and negotiatedPrice is NOT provided
const originalPriceIsProvidedAndNegotiatedPriceIsNotProvided = {
    original: ['500', '399.99', '0'],
    negotiated: [undefined, null],
    description: 'the original price is provided, and the negotiated price is NOT provided',
};

// originalPrice is NOT provided and negotiatedPrice is provided
const originalPriceIsNotProvidedAndNegotiatedPriceIsProvided = {
    original: [undefined, null],
    negotiated: ['500', '399.99', '0'],
    description: 'the original price is NOT provided, and the negotiated price is provided',
};

// neither the originalPrice nor the negotiatedPrice is provided
const originalPriceIsNotProvidedAndNegotiatedPriceIsNotProvided = {
    original: [undefined, null],
    negotiated: [undefined, null],
    description: 'neither the original price nor the negotiated price is provided',
};

describe('commerce_cart/originalPriceDisplayEvaluator: Original Price Display', () => {
    describe('returns true when', () => {
        // both showOriginalPrice and showNegotiatedPrice are enabled and both prices are available
        [
            {
                showOriginalPrice: true,
                showNegotiatedPrice: true,
                prices: [originalPriceGreaterThanNegotiatedPrice],
            },
        ].forEach((scenario) => {
            scenario.prices.forEach((price) => {
                price.original.forEach((originalPriceValue) => {
                    price.negotiated.forEach((negotiatedPriceValue) => {
                        it(`showOriginalPrice is ${scenario.showOriginalPrice}, showNegotiatedPrice is ${scenario.showNegotiatedPrice}, and ${price.description} (negotiatedPrice is ${negotiatedPriceValue} and originalPrice is ${originalPriceValue})`, () => {
                            const result = canDisplayOriginalPrice(
                                scenario.showNegotiatedPrice,
                                scenario.showOriginalPrice,
                                negotiatedPriceValue,
                                originalPriceValue
                            );
                            expect(result).toBe(true);
                        });
                    });
                });
            });
        });
    });

    describe('returns false when', () => {
        // showOriginalPrice is enabled
        [
            {
                showOriginalPrice: true,
                showNegotiatedPrice: true,
                prices: [
                    // both originalPrice and negotiatedPrice are provided
                    originalPriceLessThanNegotiatedPrice,
                    originalPriceEqualsNegotiatedPrice,
                    originalPriceEqualsNegotiatedPriceZero,
                    // originalPrice is provided and negotiatedPrice is NOT provided
                    originalPriceIsProvidedAndNegotiatedPriceIsNotProvided,
                    // originalPrice is NOT provided
                    originalPriceIsNotProvidedAndNegotiatedPriceIsProvided,
                    originalPriceIsNotProvidedAndNegotiatedPriceIsNotProvided,
                ],
            },
            {
                showOriginalPrice: true,
                showNegotiatedPrice: false,
                prices: [
                    // both originalPrice and negotiatedPrice are provided
                    originalPriceGreaterThanNegotiatedPrice,
                    // originalPrice is provided and negotiatedPrice is NOT provided
                    originalPriceIsProvidedAndNegotiatedPriceIsNotProvided,
                    // originalPrice is NOT provided
                    originalPriceIsNotProvidedAndNegotiatedPriceIsProvided,
                    originalPriceIsNotProvidedAndNegotiatedPriceIsNotProvided,
                ],
            },
        ].forEach((scenario) => {
            scenario.prices.forEach((price) => {
                price.original.forEach((originalPriceValue) => {
                    price.negotiated.forEach((negotiatedPriceValue) => {
                        it(`showOriginalPrice is ${scenario.showOriginalPrice}, showNegotiatedPrice is ${scenario.showNegotiatedPrice}, and ${price.description} (negotiatedPrice is ${negotiatedPriceValue} and originalPrice is ${originalPriceValue})`, () => {
                            const result = canDisplayOriginalPrice(
                                scenario.showNegotiatedPrice,
                                scenario.showOriginalPrice,
                                negotiatedPriceValue,
                                originalPriceValue
                            );
                            expect(result).toBe(false);
                        });
                    });
                });
            });
        });

        // showOriginalPrice is disabled
        [
            {
                showOriginalPrice: false,
                showNegotiatedPrice: [true, false],
                prices: [
                    // originalPrice and negotiatedPrice are both provided
                    originalPriceGreaterThanNegotiatedPrice,
                    originalPriceLessThanNegotiatedPrice,
                    originalPriceEqualsNegotiatedPrice,
                    originalPriceEqualsNegotiatedPriceZero,
                    // originalPrice is NOT provided
                    originalPriceIsNotProvidedAndNegotiatedPriceIsProvided,
                    originalPriceIsNotProvidedAndNegotiatedPriceIsNotProvided,
                    // originalPrice is provided and negotiatedPrice is NOT provided
                    originalPriceIsProvidedAndNegotiatedPriceIsNotProvided,
                ],
            },
        ].forEach((scenario) => {
            scenario.showNegotiatedPrice.forEach((showNegotiated) => {
                scenario.prices.forEach((price) => {
                    price.original.forEach((originalPriceValue) => {
                        price.negotiated.forEach((negotiatedPriceValue) => {
                            it(`showOriginalPrice is ${scenario.showOriginalPrice}, showNegotiatedPrice is ${showNegotiated}, and ${price.description} (negotiatedPrice is ${negotiatedPriceValue} and originalPrice is ${originalPriceValue})`, () => {
                                const result = canDisplayOriginalPrice(
                                    showNegotiated,
                                    scenario.showOriginalPrice,
                                    negotiatedPriceValue,
                                    originalPriceValue
                                );
                                expect(result).toBe(false);
                            });
                        });
                    });
                });
            });
        });
    });
});
