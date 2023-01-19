import { LightningElement, api } from 'lwc';
import type { CouponSummaryCollectionData } from 'commerce/cartApi';

const DEFAULT_CART_COUPONS = {
    cartCoupons: {
        coupons: [
            {
                cartCouponId: '4or0000000001GAA',
                couponCode: '10OFFCART',
                termsAndConditions: 'Terms and Conditions',
            },
        ],
    },
    cartId: '0a6xxxxxxxxx',
    cartStatus: 'active',
    ownerId: '005xx000001XB9VAAW',
};

export default class CartAppliedCouponsDesignSubstitute extends LightningElement {
    public static renderMode = 'light';

    /**
     * Gets or sets the background color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public backgroundColor: string | undefined;

    /**
     * Whether or not to display the reveal coupon form button.
     * @type {boolean}
     */
    @api public showRevealCouponFormButton = false;

    /**
     * Gets or sets the reveal coupon form button text.
     * @type {string}
     */
    @api public revealCouponFormButtonText: string | undefined;

    /**
     * Gets or sets the reveal coupon form button text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public revealCouponFormButtonTextColor: string | undefined;

    /**
     * Gets or sets the reveal coupon form button font size (small, medium, or large).
     * @type {string}
     */
    @api public revealCouponFormButtonFontSize: string | undefined;

    /**
     * Gets or sets the coupon form placeholder text.
     * @type {string}
     */
    @api public couponFormPlaceholderText: string | undefined;

    /**
     * Gets or sets the coupon input box border radius.
     * @type {string}
     */
    @api public couponInputBoxBorderRadius: string | undefined;

    /**
     * Gets or sets the coupon input box background color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public couponInputBoxBackgroundColor: string | undefined;

    /**
     * Gets or sets the coupon input box text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public couponInputBoxTextColor: string | undefined;

    /**
     * Gets or sets the apply coupon button text.
     * @type {string}
     */
    @api public applyCouponButtonText: string | undefined;

    /**
     * Gets or sets the apply coupon button text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public applyCouponButtonTextColor: string | undefined;

    /**
     * Gets or sets the apply coupon button hover text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public applyCouponButtonTextHoverColor: string | undefined;

    /**
     * Gets or sets the apply coupon button background color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public applyCouponButtonBackgroundColor: string | undefined;

    /**
     * Gets or sets the apply coupon button background hover color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public applyCouponButtonBackgroundHoverColor: string | undefined;

    /**
     * Gets or sets the apply coupon button border color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public applyCouponButtonBorderColor: string | undefined;

    /**
     * Gets or sets the apply coupon button border radius.
     * @type {string}
     */
    @api public applyCouponButtonBorderRadius: string | undefined;

    /**
     * Gets or sets the applied coupon font size (small, medium, or large).
     * @type {string}
     */
    @api public appliedCouponsFontSize: string | undefined;

    /**
     * Gets or sets the applied coupon text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public appliedCouponsTextColor: string | undefined;

    /**
     * Whether or not to show applied coupon's terms and conditions.
     * @type {boolean}
     */
    @api public showTermsAndConditions = false;

    /**
     * Gets the title text that is displayed in the terms and conditions popup.
     * @type {string}
     */
    @api public termsAndConditionsTitleText: string | undefined;

    /**
     * Gets the summary of applied coupons.
     * @return {CouponSummaryCollectionData}
     */
    get cartAppliedCoupons(): CouponSummaryCollectionData {
        return DEFAULT_CART_COUPONS;
    }
}
