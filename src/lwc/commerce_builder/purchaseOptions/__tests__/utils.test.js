import * as utils from '../../purchaseOptions/utils';

const mockQuantityRule = {
    minimum: '2',
    maximum: '100',
    increment: '5',
};

const mockQuantityGuides = {
    showGuides: true,
    quantitySelectorLabel: 'QTY',
    minimumValueGuideText: 'minimum number is {0}',
    maximumValueGuideText: 'maximum number is {0}',
    incrementValueGuideText: 'increment number is {0}',
};

const mockExpectedRuleSet = {
    incrementText: '',
    minimumText: '',
    maximumText: '',
    combinedText: '',
};

describe('purchaseOptions/utils: Purchase Options Utils', () => {
    describe('computePurchaseRule', () => {
        [undefined, {}].forEach((quantityRule) => {
            it(`returns an empty rule set when quantityRule is empty (${quantityRule})`, () => {
                expect(
                    utils.computePurchaseRuleSet(quantityRule, {
                        ...mockQuantityGuides,
                    })
                ).toStrictEqual(mockExpectedRuleSet);
            });
        });
        [undefined, {}].forEach((quantityGuides) => {
            it(`returns an empty rule set when quantityGuides is empty (${quantityGuides})`, () => {
                expect(utils.computePurchaseRuleSet({ ...mockQuantityRule }, quantityGuides)).toStrictEqual(
                    mockExpectedRuleSet
                );
            });
        });

        it('returns a rule set when increment rule is missing', () => {
            const expectedRule = {
                ...mockExpectedRuleSet,
                minimumText: 'minimum number is 2',
                maximumText: 'maximum number is 100',
                combinedText: 'minimum number is 2 • maximum number is 100',
            };

            const quantityRule = { ...mockQuantityRule };
            quantityRule.increment = '';

            const actualRule = utils.computePurchaseRuleSet(quantityRule, {
                ...mockQuantityGuides,
            });

            expect(actualRule).toStrictEqual(expectedRule);
        });

        it('returns a rule set when when minimum rule is missing', () => {
            const expectedRule = {
                ...mockExpectedRuleSet,
                maximumText: 'maximum number is 100',
                incrementText: 'increment number is 5',
                combinedText: 'maximum number is 100 • increment number is 5',
            };

            const quantityRule = { ...mockQuantityRule };
            quantityRule.minimum = '';

            const actualRule = utils.computePurchaseRuleSet(quantityRule, {
                ...mockQuantityGuides,
            });

            expect(actualRule).toStrictEqual(expectedRule);
        });

        it('returns a rule set when maximum rule is missing', () => {
            const expectedRule = {
                ...mockExpectedRuleSet,
                minimumText: 'minimum number is 2',
                incrementText: 'increment number is 5',
                combinedText: 'minimum number is 2 • increment number is 5',
            };

            const quantityRule = { ...mockQuantityRule };
            quantityRule.maximum = '';

            const actualRule = utils.computePurchaseRuleSet(quantityRule, {
                ...mockQuantityGuides,
            });

            expect(actualRule).toStrictEqual(expectedRule);
        });

        it('returns a rule set when increment rule guide is missing', () => {
            const expectedRule = {
                ...mockExpectedRuleSet,
                minimumText: 'minimum number is 2',
                maximumText: 'maximum number is 100',
                combinedText: 'minimum number is 2 • maximum number is 100',
            };

            const quantityGuides = { ...mockQuantityGuides };
            quantityGuides.incrementValueGuideText = '';

            const actualRule = utils.computePurchaseRuleSet({ ...mockQuantityRule }, quantityGuides);

            expect(actualRule).toStrictEqual(expectedRule);
        });

        it('returns a rule set when minimum rule guide is missing', () => {
            const expectedRule = {
                ...mockExpectedRuleSet,
                maximumText: 'maximum number is 100',
                incrementText: 'increment number is 5',
                combinedText: 'maximum number is 100 • increment number is 5',
            };

            const quantityGuides = { ...mockQuantityGuides };
            quantityGuides.minimumValueGuideText = '';

            const actualRule = utils.computePurchaseRuleSet({ ...mockQuantityRule }, quantityGuides);

            expect(actualRule).toStrictEqual(expectedRule);
        });

        it('returns a rule set when maximum rule guide is missing', () => {
            const expectedRule = {
                ...mockExpectedRuleSet,
                minimumText: 'minimum number is 2',
                incrementText: 'increment number is 5',
                combinedText: 'minimum number is 2 • increment number is 5',
            };

            const quantityGuides = { ...mockQuantityGuides };
            quantityGuides.maximumValueGuideText = '';

            const actualRule = utils.computePurchaseRuleSet({ ...mockQuantityRule }, quantityGuides);

            expect(actualRule).toStrictEqual(expectedRule);
        });
    });
});
