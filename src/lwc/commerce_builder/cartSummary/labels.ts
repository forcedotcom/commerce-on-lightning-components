import defaultErrorMessage from '@salesforce/label/Commerce_Cart_Error_Messages.defaultErrorMessage';
import effectiveAccountNotFound from '@salesforce/label/Commerce_Cart_Error_Messages.getCartItemsEffectiveAccountNotFoundErrorMessage';
import insufficientAccess from '@salesforce/label/Commerce_Cart_Error_Messages.getCartItemsInsufficientAccessErrorMessage';
import invalidInput from '@salesforce/label/Commerce_Cart_Error_Messages.getCartItemsInvalidInputErrorMessage';
import webstoreNotFound from '@salesforce/label/Commerce_Cart_Error_Messages.webstoreNotFoundErrorMessage';

export {
    /**
     * A label of the form "An unexpected error occurred. Try again later."
     *
     * @type {string}
     */
    defaultErrorMessage,
    /**
     * A label of the form "You don't have permission to get the items on this cart."
     *
     * @type {string}
     */
    effectiveAccountNotFound,
    /**
     * A label of the form "You need permission to access cart. The store admin can help with that."
     *
     * @type {string}
     */
    insufficientAccess,
    /**
     * A label of the form "We can't get items in this cart. Try again later."
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
