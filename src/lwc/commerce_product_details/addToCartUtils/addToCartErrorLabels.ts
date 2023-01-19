import insufficientAccess from '@salesforce/label/Commerce_Product_Details_Add_To_Cart_Error.insufficientAccessErrorMessage';
import invalidBatchSize from '@salesforce/label/Commerce_Product_Details_Add_To_Cart_Error.addItemToCartIncrementalPurchaseQuantityLimitErrorMessage';
import maximumLimitExceeded from '@salesforce/label/Commerce_Product_Details_Add_To_Cart_Error.addItemToCartMaximumPurchaseQuantityLimitErrorMessage';
import limitExceeded from '@salesforce/label/Commerce_Product_Details_Add_To_Cart_Error.addItemToCartMaximumCartSizeErrorMessage';
import missingRecord from '@salesforce/label/Commerce_Product_Details_Add_To_Cart_Error.addItemToCartMinimumPurchaseQuantityLimitErrorMessage';
import defaultErrorMessage from '@salesforce/label/Commerce_Product_Details_Add_To_Cart_Error.genericAddToCartErrorMessage';

export {
    /**
     * A label of the form "You don’t have permission to complete this action."
     *
     * @type {string}
     */
    insufficientAccess,
    /**
     * A label of the form "Item couldn't be added to the cart. This product has a maximum purchase limit. Check quantity limits."
     *
     * @type {string}
     */
    maximumLimitExceeded,
    /**
     * A label of the form "Your cart is full."
     *
     * @type {string}
     */
    limitExceeded,
    /**
     * A label of the form "Item couldn't be added to the cart. This product has a minimum purchase limit. Check quantity limits."
     *
     * @type {string}
     */
    missingRecord,
    /**
     * A label of the form "Item couldn't be added to the cart. Always purchase this product in set increments. Check product increments."
     *
     * @type {string}
     */
    invalidBatchSize,
    /**
     * A label of the form "An unexpected error occurred. Try again later."
     *
     * @type {string}
     */
    defaultErrorMessage,
};
