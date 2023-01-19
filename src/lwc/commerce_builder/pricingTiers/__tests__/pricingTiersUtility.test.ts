import { transformTierAdjustmentContents } from '../pricingTiersUtility';

const pricingDataPercentageBasedAdjustment = {
    currencyIsoCode: 'USD',
    listPrice: null,
    priceAdjustment: {
        priceAdjustmentTiers: [
            {
                id: '123',
                adjustmentType: 'PercentageBasedAdjustment',
                adjustmentValue: '50',
                lowerBound: '20',
                upperBound: '60',
                tierUnitPrice: '10',
            },
        ],
        id: '1',
    },
    pricebookEntryId: '01uxx0000008yn8AAA',
    unitPrice: '45',
};

const pricingDataDirectAdjustment = {
    currencyIsoCode: 'USD',
    listPrice: null,
    priceAdjustment: {
        priceAdjustmentTiers: [
            {
                id: '321',
                adjustmentType: 'DirectAdjustment',
                adjustmentValue: '5',
                lowerBound: '2',
                upperBound: '6',
                tierUnitPrice: '1',
            },
        ],
        id: '1',
    },
    pricebookEntryId: '01uxx0000008yn8AAA',
    unitPrice: '45',
};

const expectedTransformedDataPercentAdjustment = [
    {
        id: '123',
        adjustmentValueFormat: 'percent-fixed',
        adjustmentValue: '50',
        lowerBound: '20',
        upperBound: '60',
        tierUnitPrice: '10',
    },
];

const expectedTransformedDataCurrencyAdjustment = [
    {
        id: '321',
        adjustmentValueFormat: 'currency',
        adjustmentValue: '5',
        lowerBound: '2',
        upperBound: '6',
        tierUnitPrice: '1',
    },
];

const pricingData2 = { priceAdjustment: null };

describe('commerce_builder/pricingTiers/tiersUtility: transformTierAdjustmentContents', () => {
    describe('transformTierAdjustmentContents', () => {
        it(`should return percent-fixed pricing transformations for PercentageBased AdjustmentType`, () => {
            expect(transformTierAdjustmentContents(pricingDataPercentageBasedAdjustment)).toStrictEqual(
                expectedTransformedDataPercentAdjustment
            );
        });

        it(`should return currency pricing transformations for Direct AdjustmentType`, () => {
            expect(transformTierAdjustmentContents(pricingDataDirectAdjustment)).toStrictEqual(
                expectedTransformedDataCurrencyAdjustment
            );
        });

        it(`should return empty array when there is no attribute priceAdjustmentTiers`, () => {
            expect(transformTierAdjustmentContents(pricingData2)).toHaveLength(0);
        });

        it(`should return empty array when there is no attribute priceAdjustment`, () => {
            expect(transformTierAdjustmentContents({})).toHaveLength(0);
        });

        it(`should return empty array when pricingData is undefined`, () => {
            expect(transformTierAdjustmentContents(undefined)).toHaveLength(0);
        });
    });
});
