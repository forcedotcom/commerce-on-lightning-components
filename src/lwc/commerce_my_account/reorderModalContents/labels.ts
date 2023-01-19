import successfullyAddedToCart from '@salesforce/label/B2B_Reorder.successfullyAddedToCart';
import itemsNotAvailableInStoreHeaderText from '@salesforce/label/B2B_Reorder.itemsNotAvailableInStoreHeaderText';
import itemsAddedItemsNotAvailableInStoreHelpText from '@salesforce/label/B2B_Reorder.itemsAddedItemsNotAvailableInStoreHelpText';
import itemAddedItemsNotAvailableInStoreHelpText from '@salesforce/label/B2B_Reorder.itemAddedItemsNotAvailableInStoreHelpText';
import itemsAddedItemNotAvailableInStoreHelpText from '@salesforce/label/B2B_Reorder.itemsAddedItemNotAvailableInStoreHelpText';
import itemAddedItemNotAvailableInStoreHelpText from '@salesforce/label/B2B_Reorder.itemAddedItemNotAvailableInStoreHelpText';
import noItemsAvailableHelpText from '@salesforce/label/B2B_Reorder.noItemsAvailableHelpText';
import unavailableItems from '@salesforce/label/B2B_Reorder.unavailableItems';
import viewCartButtonLabel from '@salesforce/label/B2B_Reorder.viewCartButtonLabel';
import continueShoppingButton from '@salesforce/label/B2B_Reorder.continueShoppingButton';
import spinnerScreenHeaderText from '@salesforce/label/B2B_Reorder.spinnerScreenHeaderText';
import spinnerScreenHelpText from '@salesforce/label/B2B_Reorder.spinnerScreenHelpText';
import errorScreenHeaderText from '@salesforce/label/B2B_Reorder.errorScreenHeaderText';
import errorScreenSubHeaderText from '@salesforce/label/B2B_Reorder.errorScreenSubHeaderText';
import errorScreenButtonLabel from '@salesforce/label/B2B_Reorder.errorScreenButtonLabel';

export {
    /**
     * "All items were added to cart"
     * @type {String}
     */
    successfullyAddedToCart,
    /**
     * "Some items are unavailable"
     * @type {String}
     */
    itemsNotAvailableInStoreHeaderText,
    /**
     * "We added {0} items to your cart, but {1} items are unavailable or out of stock:"
     * @type {String}
     */
    itemsAddedItemsNotAvailableInStoreHelpText,
    /**
     * "We added 1 item to your cart, but {0} items are unavailable or out of stock:"
     * @type {String}
     */
    itemAddedItemsNotAvailableInStoreHelpText,
    /**
     * "We added {0} items to your cart, but 1 item is unavailable or out of stock:"
     * @type {String}
     */
    itemsAddedItemNotAvailableInStoreHelpText,
    /**
     * "We added 1 item to your cart, but 1 item is unavailable or out of stock:"
     * @type {String}
     */
    itemAddedItemNotAvailableInStoreHelpText,
    /**
     * "We could not add any items to your cart, items are unavailable or out of stock."
     * @type {String}
     */
    noItemsAvailableHelpText,
    /**
     * "UNAVAILABLE ITEMS"
     * @type {String}
     */
    unavailableItems,
    /**
     * "VIEW CART"
     * @type {String}
     */
    viewCartButtonLabel,
    /**
     * "CONTINUE SHOPPING"
     * @type {String}
     */
    continueShoppingButton,
    /**
     * "Something isn't right..."
     * @type {String}
     */
    errorScreenHeaderText,
    /**
     * "We couldn't add the items to your cart. Try adding your items again. If the problem persists, contact customer support"
     * @type {String}
     */
    errorScreenSubHeaderText,
    /**
     * "GOT IT."
     * @type {String}
     */
    errorScreenButtonLabel,
    /**
     * "Reorder in progress"
     * @type {String}
     */
    spinnerScreenHeaderText,
    /**
     * "Adding items to your cart..."
     * @type {String}
     */
    spinnerScreenHelpText,
};
