import { getErrorInfo } from '../failedActionEvaluator';
import type { ErrorLabels } from 'commerce_cart/types';

const errorLabels = {
    webstoreNotFound: 'You dont have access to this store.',
    effectiveAccountNotFound: 'You dont have permission to get wishlists.',
    gateDisabled: 'The store admin can help with that.',
    invalidInput: 'Check the parameters and try again.',
    insufficientAccess: 'You need permission to access lists.',
    maximumLimitExceeded: 'You reached your limit.',
    limitExceeded: 'Your cart is full.',
    tooManyRecords: 'You reached your limit of items.',
    itemNotFound: "The item you selected wasn't found.",
    missingRecord: 'This product has a minimum purchase limit.',
    invalidBatchSize: 'Always purchase this product in set of increments.',
    defaultErrorMessage: 'An unexpected error occurred. Try again later.',
};

describe('commerce_cart/failedActionEvaluator: Failed Action Evaluator', () => {
    [
        {
            actionError: 'WEBSTORE_NOT_FOUND',
            expectedErrorInfo: {
                code: 'WEBSTORE_NOT_FOUND',
                message: errorLabels.webstoreNotFound,
            },
        },
        {
            actionError: 'EFFECTIVE_ACCOUNT_NOT_FOUND',
            expectedErrorInfo: {
                code: 'EFFECTIVE_ACCOUNT_NOT_FOUND',
                message: errorLabels.effectiveAccountNotFound,
            },
        },
        {
            actionError: 'API_DISABLED_FOR_ORG',
            expectedErrorInfo: {
                code: 'API_DISABLED_FOR_ORG',
                message: errorLabels.gateDisabled,
            },
        },
        {
            actionError: 'INVALID_API_INPUT',
            expectedErrorInfo: {
                code: 'INVALID_API_INPUT',
                message: errorLabels.invalidInput,
            },
        },
        {
            actionError: 'MAX_LIMIT_EXCEEDED',
            expectedErrorInfo: {
                code: 'MAX_LIMIT_EXCEEDED',
                message: errorLabels.maximumLimitExceeded,
            },
        },
        {
            actionError: 'LIMIT_EXCEEDED',
            expectedErrorInfo: {
                code: 'LIMIT_EXCEEDED',
                message: errorLabels.limitExceeded,
            },
        },
        {
            actionError: 'TOO_MANY_RECORDS',
            expectedErrorInfo: {
                code: 'TOO_MANY_RECORDS',
                message: errorLabels.tooManyRecords,
            },
        },
        {
            actionError: 'INSUFFICIENT_ACCESS',
            expectedErrorInfo: {
                code: 'INSUFFICIENT_ACCESS',
                message: errorLabels.insufficientAccess,
            },
        },
        {
            actionError: 'ITEM_NOT_FOUND',
            expectedErrorInfo: {
                code: 'ITEM_NOT_FOUND',
                message: errorLabels.itemNotFound,
            },
        },
        {
            actionError: 'MISSING_RECORD',
            expectedErrorInfo: {
                code: 'MISSING_RECORD',
                message: errorLabels.missingRecord,
            },
        },
        {
            actionError: 'INVALID_BATCH_SIZE',
            expectedErrorInfo: {
                code: 'INVALID_BATCH_SIZE',
                message: errorLabels.invalidBatchSize,
            },
        },
        {
            actionError: '',
            expectedErrorInfo: {
                code: '',
                message: errorLabels.defaultErrorMessage,
            },
        },
    ].forEach((action) => {
        it(`returns the error information ( code & message ) when actionError is "${action.actionError}"`, () => {
            expect(getErrorInfo(action.actionError, errorLabels as ErrorLabels)).toMatchObject(
                action.expectedErrorInfo
            );
        });
    });

    [undefined, null, {}].forEach((invalidInput) => {
        const expectedErrorInfo = {
            code: invalidInput,
            message: undefined,
        };
        it(`return the error information with no error message & no error code when invalid labels "${invalidInput}"`, () => {
            //@ts-ignore
            expect(getErrorInfo(invalidInput, invalidInput)).toMatchObject(expectedErrorInfo);
        });
    });
});
