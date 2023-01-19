import type { ErrorLabels } from 'commerce_cart/types';

/**
 * Labels for supported error states
 *
 * @typedef {Object} ErrorLabels
 *
 * @property {string} webstoreNotFound
 * A label of the form "You don't have access to this store".
 *
 * @property {string} effectiveAccountNotFound
 * A label of the form "You don't have permission".
 *
 * @property {string} gateDisabled
 * A label of the form "Lists aren’t available in this store".
 *
 * @property {string} invalidInput
 * A label of the form "Check the parameters and try again".
 * (or) "Coupon {code} is invalid."
 *
 * @property {string} insufficientAccess
 * A label of the form "An unexpected error occurred. Try again later".
 *
 * @property {string} maximumLimitExceeded
 * A label of the form "You reached your limit of lists"
 * (or) "This product has a maximum purchase limit."
 * (or) "You can apply up to 2 coupons per cart."
 *
 * @property {string} tooManyRecords
 * A label of the form "You reached your limit of items per list".
 *
 * @property {string} itemNotFound
 * A label of the form "The item you selected wasn't found".
 *
 * @property {string} missingRecord
 * A label of the form "This product has a minimum purchase limit.".
 *
 * @property {string} invalidBatchSize
 * A label of the form "Always purchase this product in set of increments.".
 *
 * @property {string} alreadyApplied
 * A label of the form "Coupon {code} is already applied."
 *
 * @property {string} blockedExclusive
 * A label of the form "This coupon can't be applied to your cart."
 *
 * @property {string} unqualifiedCart
 * A label of the form "Your cart isn't eligible for coupon {code}."
 *
 * @property {string} defaultErrorMessage
 * A label of the form "An unexpected error occurred. Try again later".
 */

/**
 * Generates the localized label
 * if any for a given error code.
 *
 * @param {string} errorCode
 *  The the error code that is returned by the failed callback.
 *
 * @param {ErrorLabels} labels
 *  The localized labels associated for the appropriate error code.
 *
 * @returns {string}
 *  The localized text for the associated error code, if any errorCode is available;
 *  otherwise, undefined.
 */

const emptyObject = Object.create(null);

export default function getErrorMessage(errorCode: string, labels: ErrorLabels): string {
    const errorLabels = labels || emptyObject;
    switch (errorCode) {
        case 'WEBSTORE_NOT_FOUND':
            return errorLabels.webstoreNotFound;
        case 'EFFECTIVE_ACCOUNT_NOT_FOUND':
            return errorLabels.effectiveAccountNotFound;
        case 'API_DISABLED_FOR_ORG':
            return errorLabels.gateDisabled;
        case 'INVALID_API_INPUT':
            return errorLabels.invalidInput;
        case 'MAX_LIMIT_EXCEEDED':
            return errorLabels.maximumLimitExceeded;
        case 'LIMIT_EXCEEDED':
            return errorLabels.limitExceeded;
        case 'TOO_MANY_RECORDS':
            return errorLabels.tooManyRecords;
        case 'INSUFFICIENT_ACCESS':
            return errorLabels.insufficientAccess;
        case 'ITEM_NOT_FOUND':
            return errorLabels.itemNotFound;
        case 'MISSING_RECORD':
            return errorLabels.missingRecord;
        case 'INVALID_BATCH_SIZE':
            return errorLabels.invalidBatchSize;
        case 'ALREADY_APPLIED':
            return errorLabels.alreadyApplied;
        case 'BLOCKED_EXCLUSIVE':
            return errorLabels.blockedExclusive;
        case 'UNQUALIFIED_CART':
            return errorLabels.unqualifiedCart;
        default:
            return errorLabels.defaultErrorMessage;
    }
}
