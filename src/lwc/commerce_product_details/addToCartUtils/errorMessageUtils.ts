import {
    defaultErrorMessage,
    insufficientAccess,
    invalidBatchSize,
    limitExceeded,
    maximumLimitExceeded,
    missingRecord,
} from './addToCartErrorLabels';

export enum AddToCartErrorType {
    INSUFFICIENT_ACCESS = 'INSUFFICIENT_ACCESS',
    MAX_LIMIT_EXCEEDED = 'MAX_LIMIT_EXCEEDED',
    LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
    MISSING_RECORD = 'MISSING_RECORD',
    INVALID_BATCH_SIZE = 'INVALID_BATCH_SIZE',
}

const errorMessageToLabelMap = new Map<AddToCartErrorType, string>([
    [AddToCartErrorType.INSUFFICIENT_ACCESS, insufficientAccess],
    [AddToCartErrorType.MAX_LIMIT_EXCEEDED, maximumLimitExceeded],
    [AddToCartErrorType.LIMIT_EXCEEDED, limitExceeded],
    [AddToCartErrorType.MISSING_RECORD, missingRecord],
    [AddToCartErrorType.INVALID_BATCH_SIZE, invalidBatchSize],
]);

/**
 * Generates the localized label
 * if any for a given error code.
 *
 * @param {string} errorCode
 *  The the error code that is returned by the failed callback.
 *
 * @returns {string}
 *  The localized text for the associated error code, if any errorCode is available;
 *  otherwise, undefined.
 */
export function getErrorMessage(errorCode?: AddToCartErrorType): string {
    return errorMessageToLabelMap.get(errorCode as AddToCartErrorType) || defaultErrorMessage;
}
