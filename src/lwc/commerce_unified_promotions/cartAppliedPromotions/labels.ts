import defaultErrorMessage from '@salesforce/label/Commerce_Cart_Error_Messages.defaultErrorMessage';
import effectiveAccountNotFound from '@salesforce/label/Commerce_Cart_Error_Messages.getCartItemPromotionEffectiveAccountNotFoundErrorMessage';
import insufficientAccess from '@salesforce/label/Commerce_Cart_Error_Messages.getCartItemPromotionInsufficientAccessErrorMessage';
import invalidInput from '@salesforce/label/Commerce_Cart_Error_Messages.getCartItemPromotionInvalidInputErrorMessage';
import webstoreNotFound from '@salesforce/label/Commerce_Cart_Error_Messages.webstoreNotFoundErrorMessage';

export {
    /**
     * A label of the form "An unexpected error occurred. Try again later."
     *
     * @type {string}
     */
    defaultErrorMessage,
    /**
     * A label of the form "You don’t have permission to get cart item promotions. Try another user account."
     *
     * @type {string}
     */
    effectiveAccountNotFound,
    /**
     * A label of the form "You need permission to access promotions. The store admin can help with that."
     *
     * @type {string}
     */
    insufficientAccess,
    /**
     * A label of the form "You don't have access to this cart. Try another cart ID."
     *
     * @type {string}
     */
    invalidInput,
    /**
     * A label of the form "You don't have access to this store."
     *
     * @type {string}
     */
    webstoreNotFound,
};
