import type { CouponsData } from 'commerce/cartApi';
import type { CouponInformationDetail } from './types';

/**
 * Transforms Cart Applied Coupons
 * @returns {CouponInformationDetail[]} A new list of transformed cart applied coupons
 *  Output:
 *  [{
 *     id: '4or0000000001GAA',
 *     name: '10OFFCART',
 *     termsAndConditions: 'Terms and Conditions for the 10OFFCOFFEE Coupon',
 *     isFocusable: true
 *  }]
 */
export const transformCouponContents = (
    couponsData: CouponsData | undefined,
    showTermsAndConditions: boolean,
    isCouponApplied: boolean
): CouponInformationDetail[] => {
    let appliedCoupons = <CouponInformationDetail[]>[];
    const coupons = couponsData?.coupons || [];
    if (coupons) {
        appliedCoupons = coupons.map((coupon, index) => {
            const termsAndConditions =
                showTermsAndConditions && coupon.termsAndConditions ? coupon.termsAndConditions : '';
            /* As of 236 we are assuming the API returns a list of applied coupons
            in the order of newest to oldest. So we are setting the isFocusable property
            to true for only the first element. If the sort order changes in the future
            we will need to update this implementation to check for coupon id. */
            const isFocusable = index === 0 && isCouponApplied;
            return {
                id: coupon.cartCouponId,
                name: coupon.couponCode,
                termsAndConditions: termsAndConditions,
                isFocusable: isFocusable,
            };
        });
    }
    return appliedCoupons;
};
