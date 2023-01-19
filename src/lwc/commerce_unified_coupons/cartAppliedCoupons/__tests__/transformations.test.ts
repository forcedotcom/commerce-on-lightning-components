import { transformCouponContents } from '../transformations';
import { apiData, transformedApiData } from './data/cartAppliedCouponsData';

describe('commerce_unified_coupons/cartAppliedCoupons/transformations: Coupon Content Transformations', () => {
    it('transforms api coupon data when coupon api data is provided', () => {
        expect(transformCouponContents(apiData.withCoupons.cartCoupons, true, false)).toEqual(
            transformedApiData.withDetails
        );
    });

    it('transforms api promotions data when promotions api data is not provided', () => {
        expect(transformCouponContents(apiData.withoutCoupons.cartCoupons, true, true)).toEqual(
            transformedApiData.withoutDetails
        );
        expect(transformCouponContents(undefined, true, true)).toEqual(transformedApiData.withoutDetails);
    });

    it('transforms api promotions data when promotions api data is missing the details information', () => {
        expect(transformCouponContents(apiData.withMissingCouponDetails.cartCoupons, false, false)).toEqual(
            transformedApiData.withMissingDetails
        );
    });
});
