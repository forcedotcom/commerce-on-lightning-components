/**
 * ErrorLabels interface lists Labels for supported error states
 */
export declare interface ErrorLabels {
    webstoreNotFound: string;
    effectiveAccountNotFound: string;
    gateDisabled: string;
    invalidInput: string;
    insufficientAccess: string;
    maximumLimitExceeded: string;
    limitExceeded: string;
    tooManyRecords: string;
    itemNotFound: string;
    missingRecord: string;
    invalidBatchSize: string;
    alreadyApplied: string;
    blockedExclusive: string;
    unqualifiedCart: string;
    defaultErrorMessage: string;
}

/**
 * ErrorInfo interface helps create an object
 * for the error details of the failed action.
 */
export declare interface ErrorInfo {
    code: string;
    message: string;
}
