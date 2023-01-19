import { getErrorMessage } from '../errorMessageUtils';
import {
    insufficientAccess,
    maximumLimitExceeded,
    limitExceeded,
    missingRecord,
    invalidBatchSize,
    defaultErrorMessage,
} from '../addToCartErrorLabels';

describe('getErrorMessage', () => {
    it.each`
        errorCode                | expected
        ${'INSUFFICIENT_ACCESS'} | ${insufficientAccess}
        ${'MAX_LIMIT_EXCEEDED'}  | ${maximumLimitExceeded}
        ${'LIMIT_EXCEEDED'}      | ${limitExceeded}
        ${'MISSING_RECORD'}      | ${missingRecord}
        ${'INVALID_BATCH_SIZE'}  | ${invalidBatchSize}
        ${'ERROR_CODE'}          | ${defaultErrorMessage}
        ${undefined}             | ${defaultErrorMessage}
    `('return the string $expected when errorCode is $errorCode', ({ errorCode, expected }) => {
        expect(getErrorMessage(errorCode)).toBe(expected);
    });
});
