import {
    successfullyAddedToCart,
    itemsNotAvailableInStoreHeaderText,
    itemsAddedItemNotAvailableInStoreHelpText,
    itemAddedItemsNotAvailableInStoreHelpText,
    itemAddedItemNotAvailableInStoreHelpText,
    itemsAddedItemsNotAvailableInStoreHelpText,
    noItemsAvailableHelpText,
} from './labels';

/**
 *  generateModalHeading generates a string that is the heading of the Reorder Modal.
 *  generateModalSubeading generates a string that is the subheading of the Reorder Modal.
 *
 *  Count of how many items were successfully added to cart
 *  @param {number} succeededProductCount
 *
 *  Count of how many items failed to be added to cart
 *  @param {number} failedProductCount
 *
 *  @returns {string}
 */

export function generateModalHeading(succeededProductCount: number, failedProductCount: number): string | undefined {
    if (succeededProductCount > 0 && failedProductCount === 0) {
        return successfullyAddedToCart;
    } else if (succeededProductCount > 0 && failedProductCount > 0) {
        return itemsNotAvailableInStoreHeaderText;
    }
    return itemsNotAvailableInStoreHeaderText;
}

export function generateModalSubheading(succeededProductCount: number, failedProductCount: number): string | undefined {
    let subheading;
    if (succeededProductCount > 1 && failedProductCount === 1) {
        subheading = itemsAddedItemNotAvailableInStoreHelpText.replace('{0}', succeededProductCount.toString());
    } else if (succeededProductCount === 1 && failedProductCount > 1) {
        subheading = itemAddedItemsNotAvailableInStoreHelpText.replace('{0}', failedProductCount.toString());
    } else if (succeededProductCount === 1 && failedProductCount === 1) {
        subheading = itemAddedItemNotAvailableInStoreHelpText;
    } else if (succeededProductCount > 1 && failedProductCount > 1) {
        subheading = itemsAddedItemsNotAvailableInStoreHelpText?.replace('{0}', succeededProductCount.toString());
        subheading = subheading?.replace('{1}', failedProductCount.toString());
    } else if (succeededProductCount === 0) {
        subheading = noItemsAvailableHelpText;
    }
    return subheading;
}
