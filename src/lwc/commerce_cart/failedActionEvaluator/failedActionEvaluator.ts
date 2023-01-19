import type { ErrorInfo, ErrorLabels } from 'commerce_cart/types';
import getErrorMessage from './errorCodeEvaluator';

/**
 * Properties supported by the ErrorLabel type
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
 * @property {string} defaultErrorMessage
 * A label of the form "An unexpected error occurred. Try again later".
 */

/**
 * Gets the error information based of the failed callback.
 *
 * @returns {ErrorInfo[]}
 * the error details of the failed action.
 */
export function getErrorInfo(errorCode: string, errorLabels: ErrorLabels): ErrorInfo {
    const localizedErrorLabels = errorLabels;
    return {
        code: errorCode,
        message: getErrorMessage(errorCode, localizedErrorLabels),
    };
}
