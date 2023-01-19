/**
 * Representation of Applied Promotions Information
 *
 * @typedef {Object} AppliedPromotion
 *
 * @property {string} id
 *  The promotion id.
 *
 * @property {string} name
 *  The promotion name.
 *
 * @property {string} [termsAndConditions]
 *  The promotion's terms and conditions.
 *  Terms and conditions will not be displayed if no value is provided.
 *
 * @property {string} discountAmount
 *  The promotion discount amount.
 */

export declare type AppliedPromotion = {
    id: string;
    name: string;
    termsAndConditions?: string;
    discountAmount: string;
};
