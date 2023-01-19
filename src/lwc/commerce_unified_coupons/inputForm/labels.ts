import inputFormCharacterLimitMessage from '@salesforce/label/Cart_Applied_Coupons.inputFormCharacterLimitMessage';
import inputFormLabel from '@salesforce/label/Cart_Applied_Coupons.inputFormLabel';
import alreadyApplied from '@salesforce/label/Cart_Error_Messages.applyCouponAlreadyAppliedErrorMessage';
import blockedExclusive from '@salesforce/label/Cart_Error_Messages.applyCouponBlockedExclusiveErrorMessage';
import defaultErrorMessage from '@salesforce/label/Cart_Error_Messages.defaultErrorMessage';
import effectiveAccountNotFound from '@salesforce/label/Cart_Error_Messages.applyCouponEffectiveAccountNotFoundErrorMessage';
import insufficientAccess from '@salesforce/label/Cart_Error_Messages.applyCouponInsufficientAccessErrorMessage';
import maximumLimitExceeded from '@salesforce/label/Cart_Error_Messages.applyCouponMaxLimitExceededErrorMessage';
import invalidInput from '@salesforce/label/Cart_Error_Messages.applyCouponInvalidInputErrorMessage';
import unqualifiedCart from '@salesforce/label/Cart_Error_Messages.applyCouponUnqualifiedCartErrorMessage';
import webstoreNotFound from '@salesforce/label/Cart_Error_Messages.webstoreNotFoundErrorMessage';

export default {
    /**
     * Input form label of the form "Enter up to 255 characters."
     */
    inputFormCharacterLimitMessage,
    /**
     * Input form label of the form "Enter a coupon"
     */
    inputFormLabel,
    /**
     * A label of the form "Coupon {code} is already applied."
     *
     * @type {string}
     */
    alreadyApplied,
    /**
     * A label of the form "This coupon can't be applied to your cart."
     *
     * @type {string}
     */
    blockedExclusive,
    /**
     * A label of the form "An unexpected error occurred. Try again later."
     *
     * @type {string}
     */
    defaultErrorMessage,
    /**
     * A label of the form "You don't have permission to apply this coupon {code}."
     *
     * @type {string}
     */
    effectiveAccountNotFound,
    /**
     * A label of the form "You need permission to apply the coupon {code}. The store admin can help with that."
     *
     * @type {string}
     */
    insufficientAccess,
    /**
     * A label of the form "You can apply up to 2 coupons per cart."
     *
     * @type {string}
     */
    maximumLimitExceeded,
    /**
     * A label of the form "Coupon {code} is invalid."
     *
     * @type {string}
     */
    invalidInput,
    /**
     * A label of the form "Your cart isn't eligible for coupon {code}."
     *
     * @type {string}
     */
    unqualifiedCart,
    /**
     * A label of the form "You don't have access to this store."
     *
     * @type {string}
     */
    webstoreNotFound,
};
