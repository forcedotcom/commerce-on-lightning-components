import { defaultErrorMessage, insufficientAccess, invalidApiInput, opInvalidInPreviewMode } from './errorLabels';
import type { ExceptionWithError, PlatformError } from './types';

function isPlatformError(error: unknown): error is PlatformError {
    return !!error && typeof error === 'object' && 'errorCode' in error && 'message' in error;
}

function isPlatformErrorList(errors: unknown): errors is PlatformError[] {
    return !!errors && Array.isArray(errors) && isPlatformError(errors[0]);
}

function isExceptionWithError(exception: unknown): exception is ExceptionWithError {
    return !!exception && typeof exception === 'object' && 'error' in exception;
}

function convertErrorMessage(errorCode: string | undefined): string {
    switch (errorCode) {
        case 'INVALID_API_INPUT':
        case 'ILLEGAL_QUERY_PARAMETER_VALUE':
            return invalidApiInput;
        case 'INSUFFICIENT_ACCESS_OR_READONLY':
        case 'INSUFFICIENT_ACCESS':
        case 'ITEM_NOT_FOUND':
        case 'INVALID_FIELD':
            return insufficientAccess;
        default:
            return defaultErrorMessage;
    }
}

export function getErrorInfo(exception: string | unknown = '', isPreviewMode = false): string {
    if (isPreviewMode) {
        return opInvalidInPreviewMode;
    }
    if (typeof exception === 'string' && exception) {
        return exception;
    } else if (isExceptionWithError(exception) && isPlatformErrorList(exception.error) && exception.error?.length) {
        return convertErrorMessage(exception.error[0].errorCode);
    }
    return defaultErrorMessage;
}
