import { transformPromotionContents } from '../transformations';
import { apiData, transformedApiData } from './data/cartAppliedPromotions';

// Mock the labels with known values.
jest.mock(
    '@salesforce/label/Cart_Applied_Promotions.couponCodeValueWithPromotionNameSeparator',
    () => {
        return {
            default: '{code} - {name}',
        };
    },
    { virtual: true }
);

describe('commerce_unified_promotions/CartAppliedPromotions/transformations: Promotion Content transformations', () => {
    it('should transform api promotions data when promotions api data is provided', () => {
        expect(transformPromotionContents(apiData.withPromotions.promotions, true, true)).toEqual(
            transformedApiData.withDetails
        );
    });

    it('should transform api promotions data when promotions api data is not provided', () => {
        expect(transformPromotionContents(apiData.withOutPromotions.promotions, true, true)).toEqual(
            transformedApiData.withOutDetails
        );
        expect(transformPromotionContents(undefined, true, true)).toEqual(transformedApiData.withOutDetails);
    });

    it('should transform api promotions data when promotions api data is missing the details information', () => {
        expect(transformPromotionContents(apiData.withMissingPromotionDetails.promotions, false, false)).toEqual(
            transformedApiData.withMissingDetails
        );
    });
});
