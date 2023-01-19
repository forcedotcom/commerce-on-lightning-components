import { getErrorInfo } from 'commerce_my_account/errorHandler';
import { defaultErrorMessage, invalidApiInput, insufficientAccess, opInvalidInPreviewMode } from '../errorLabels';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

describe('ErrorHandler - generateErrorLabel', () => {
    it('should generate default error label with null error message input', () => {
        const label = getErrorInfo(null, false);
        expect(label).toEqual(defaultErrorMessage);
    });

    it('should generate error label using string error message', () => {
        const label = getErrorInfo('TEST-ERROR', false);
        expect(label).toBe('TEST-ERROR');
    });

    it('should generate fatal error if Error message is empty', () => {
        const label = getErrorInfo(new Error(), false);
        expect(label).toEqual(defaultErrorMessage);
    });

    it('should generate default error label with no error message input', () => {
        const label = getErrorInfo();
        expect(label).toEqual(defaultErrorMessage);
    });

    it('should generate error label for INVALID_API_INPUT error codes', () => {
        const label = getErrorInfo(
            { error: [{ errorCode: 'INVALID_API_INPUT', message: 'invalid input message' }] },
            false
        );
        expect(label).toEqual(invalidApiInput);
    });

    it('should generate error label for ILLEGAL_QUERY_PARAMETER_VALUE error codes', () => {
        const label = getErrorInfo(
            {
                error: [
                    { errorCode: 'ILLEGAL_QUERY_PARAMETER_VALUE', message: 'illegal query parameter input message' },
                ],
            },
            false
        );
        expect(label).toEqual(invalidApiInput);
    });

    it('should generate error label for INSUFFICIENT_ACCESS error codes', () => {
        const label = getErrorInfo(
            {
                error: [{ errorCode: 'INSUFFICIENT_ACCESS', message: 'insufficient access message' }],
            },
            false
        );
        expect(label).toEqual(insufficientAccess);
    });
    it('should generate error label for INSUFFICIENT_ACCESS_OR_READONLY error codes', () => {
        const label = getErrorInfo(
            {
                error: [{ errorCode: 'INSUFFICIENT_ACCESS_OR_READONLY', message: 'insufficient access message' }],
            },
            false
        );
        expect(label).toEqual(insufficientAccess);
    });

    it('should generate error label for ITEM_NOT_FOUND error codes', () => {
        const label = getErrorInfo(
            { error: [{ errorCode: 'ITEM_NOT_FOUND', message: 'item not found message' }] },
            false
        );
        expect(label).toEqual(insufficientAccess);
    });
    it('should generate error label for default error codes', () => {
        const label = getErrorInfo(
            { error: [{ errorCode: 'INTERNAL_SERVER_ERROR', message: 'some other error' }] },
            false
        );
        expect(label).toEqual(defaultErrorMessage);
    });

    [
        { exception: [{ errorCode: 'INTERNAL_SERVER_ERROR', message: 'some other error' }], isPreviewMode: true },
        { exception: null, isPreviewMode: true },
        { exception: new Error(), isPreviewMode: true },
        { exception: '', isPreviewMode: true },
        { exception: undefined, isPreviewMode: true },
    ].forEach(({ exception, isPreviewMode }) => {
        it('should generate error label for preview mode', () => {
            const label = getErrorInfo(exception, isPreviewMode);
            expect(label).toEqual(opInvalidInPreviewMode);
        });
    });
});
