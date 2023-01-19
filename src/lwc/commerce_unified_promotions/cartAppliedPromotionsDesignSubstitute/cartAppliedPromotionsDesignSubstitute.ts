import { LightningElement, api } from 'lwc';
import type { PromotionSummaryCollectionData } from 'commerce/cartApi';

const DEFAULT_CART_LEVEL_PROMOTIONS = {
    cartId: '0a6xxxxxxxxx',
    cartStatus: 'active',
    currencyIsoCode: 'USD',
    promotions: {
        promotions: [
            {
                promotionId: 'x211nbsdfa',
                targetType: 'Cart',
                adjustmentAmount: '-1000',
                couponCode: '25PERCENTOFF',
                displayName: 'Premium Discount',
                termsAndConditions: 'Terms and Conditions',
            },
        ],
    },
};

export default class CartAppliedPromotionsDesignSubstitute extends LightningElement {
    public static renderMode = 'light';

    /**
     * Gets the title text that is displayed for the cart applied promotions.
     * @type {string}
     */
    @api public appliedPromotionsTitleText: string | undefined;

    /**
     * Gets the title text that is displayed in the terms and conditions popup.
     * @type {string}
     */
    @api public termsAndConditionsTitleText: string | undefined;

    /**
     * Whether or not show discount amount price.
     * @type {boolean}
     */
    @api public showDiscountAmount = false;

    /**
     * Whether or not show terms and conditions.
     * @type {boolean}
     */
    @api public showTermsAndConditions = false;

    /**
     * Gets or sets the background color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public backgroundColor: string | undefined;

    /**
     * Gets or sets the applied promotions header text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public appliedPromotionsTitleTextColor: string | undefined;

    /**
     * Gets or sets the applied promotions header font size(small,medium,large)
     * @type {string}
     */
    @api public appliedPromotionsTitleFontSize: string | undefined;

    /**
     * Gets or sets the applied promotions text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public appliedPromotionsTextColor: string | undefined;

    /**
     * Gets or sets the discount amount text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public discountAmountTextColor: string | undefined;

    /**
     * Gets or sets the applied promotions text font size(small,medium,large)
     * @type {string}
     */
    @api public appliedPromotionsFontSize: string | undefined;

    /**
     * Gets the summary of applied promotions.
     * @return {PromotionSummaryCollectionData}
     */
    get cartAppliedPromotions(): PromotionSummaryCollectionData {
        return DEFAULT_CART_LEVEL_PROMOTIONS;
    }
}
