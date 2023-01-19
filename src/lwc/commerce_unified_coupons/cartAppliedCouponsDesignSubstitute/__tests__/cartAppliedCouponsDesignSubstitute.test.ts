import { createElement } from 'lwc';
import CartAppliedCouponsDesignSubstitute from 'commerce_unified_coupons/cartAppliedCouponsDesignSubstitute';

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(() => Promise.resolve()),
    }),
    { virtual: true }
);

describe('commerce_unified_coupons/CartAppliedCouponsDesignSubstitute: Cart Applied Coupons Design Substitute', () => {
    let element: CartAppliedCouponsDesignSubstitute & HTMLElement;

    type cartAppliedCouponsDesignSubstitute =
        | 'backgroundColor'
        | 'showRevealCouponFormButton'
        | 'revealCouponFormButtonText'
        | 'revealCouponFormButtonTextColor'
        | 'revealCouponFormButtonFontSize'
        | 'couponFormPlaceholderText'
        | 'couponInputBoxBorderRadius'
        | 'couponInputBoxBackgroundColor'
        | 'couponInputBoxTextColor'
        | 'applyCouponButtonText'
        | 'applyCouponButtonTextColor'
        | 'applyCouponButtonTextHoverColor'
        | 'applyCouponButtonBackgroundColor'
        | 'applyCouponButtonBackgroundHoverColor'
        | 'applyCouponButtonBorderColor'
        | 'applyCouponButtonBorderRadius'
        | 'appliedCouponsFontSize'
        | 'appliedCouponsTextColor'
        | 'showTermsAndConditions'
        | 'termsAndConditionsTitleText';

    beforeEach(() => {
        element = createElement('commerce_unified_coupons-cart-applied-coupons-design-substitute', {
            is: CartAppliedCouponsDesignSubstitute,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe.each`
        property                                   | defaultValue | changeValue
        ${'backgroundColor'}                       | ${undefined} | ${''}
        ${'showRevealCouponFormButton'}            | ${false}     | ${true}
        ${'revealCouponFormButtonText'}            | ${undefined} | ${'Show Coupon Form'}
        ${'revealCouponFormButtonTextColor'}       | ${undefined} | ${''}
        ${'revealCouponFormButtonFontSize'}        | ${undefined} | ${'small'}
        ${'couponFormPlaceholderText'}             | ${undefined} | ${'Enter coupon...'}
        ${'couponInputBoxBorderRadius'}            | ${undefined} | ${''}
        ${'couponInputBoxBackgroundColor'}         | ${undefined} | ${''}
        ${'couponInputBoxTextColor'}               | ${undefined} | ${''}
        ${'applyCouponButtonText'}                 | ${undefined} | ${'Apply'}
        ${'applyCouponButtonTextColor'}            | ${undefined} | ${''}
        ${'applyCouponButtonTextHoverColor'}       | ${undefined} | ${''}
        ${'applyCouponButtonBackgroundColor'}      | ${undefined} | ${''}
        ${'applyCouponButtonBackgroundHoverColor'} | ${undefined} | ${''}
        ${'applyCouponButtonBorderColor'}          | ${undefined} | ${''}
        ${'applyCouponButtonBorderRadius'}         | ${undefined} | ${''}
        ${'appliedCouponsFontSize'}                | ${undefined} | ${'small'}
        ${'appliedCouponsTextColor'}               | ${undefined} | ${''}
        ${'showTermsAndConditions'}                | ${false}     | ${true}
        ${'termsAndConditionsTitleText'}           | ${undefined} | ${'Terms and Conditions'}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(element[<cartAppliedCouponsDesignSubstitute>property]).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            expect(element[<cartAppliedCouponsDesignSubstitute>property]).not.toBe(changeValue);
            element[<cartAppliedCouponsDesignSubstitute>property] = <never>changeValue;
            expect(element[<cartAppliedCouponsDesignSubstitute>property]).toBe(changeValue);
        });
    });
});
