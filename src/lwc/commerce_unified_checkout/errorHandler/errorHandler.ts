import type { PlatformError, ErrorLabels, ExceptionWithError, CheckoutInformation } from 'types/unified_checkout';
import genericErrorHeader from '@salesforce/label/B2C_Lite_Checkout.genericErrorHeader';
import unknownErrorBody from '@salesforce/label/B2C_Lite_Checkout.unknownErrorBody';
import noDeliveryAddressesBody from '@salesforce/label/B2C_Lite_Checkout.noDeliveryAddressesBody';
import noDeliveryMethodsBody from '@salesforce/label/B2C_Lite_Checkout.noDeliveryMethodsBody';
import fatalErrorBody from '@salesforce/label/B2C_Lite_Checkout.fatalErrorBody';
import returnToCart from '@salesforce/label/B2C_Lite_Checkout.returnToCart';
import paymentErrorBody from '@salesforce/label/B2C_Lite_Checkout.paymentErrorBody';
import type { StoreAdapterCallbackEntry } from 'experience/store';

export enum CheckoutError {
    CANNOT_START_CHECKOUT = 'CANNOT_START_CHECKOUT',
    CANNOT_POLL_CHECKOUT = 'CANNOT_POLL_CHECKOUT',
    NULL_CHECKOUT_JSON = 'NULL_CHECKOUT_JSON',
    NULL_CHECKOUTID = 'NULL_CHECKOUTID',
    SESSION_IN_ERROR = 'SESSION_IN_ERROR',
    SESSION_NOT_LOADED = 'SESSION_NOT_LOADED',
    NO_DELIVERY_ADDRESSES = 'NO_DELIVERY_ADDRESSES',
}

/**
 * no error
 * group scoped notification labels
 */
export const noErrorLabels = {
    body: '',
    header: '',
};

/**
 * generic/unknown error
 * group scoped notification labels
 */
export const unknownErrorLabels = {
    body: unknownErrorBody,
    header: genericErrorHeader,
};

/**
 * no delivery methods for selected address error
 * group scoped notification labels
 */
export const noDeliveryMethodsLabels = {
    body: noDeliveryMethodsBody,
    header: genericErrorHeader,
};

/**
 * generic/fatal error
 * group scoped notification labels
 */
export const fatalErrorLabels = {
    body: fatalErrorBody,
    header: genericErrorHeader,
    returnToCart: returnToCart,
};

export const paymentErrorLabels = {
    body: paymentErrorBody,
    header: genericErrorHeader,
};

function isPlatformError(error: unknown): error is PlatformError {
    return (
        !!error &&
        typeof error === 'object' &&
        'errorCode' in error &&
        typeof (error as PlatformError).errorCode === 'string' &&
        'message' in error &&
        typeof (error as PlatformError).message === 'string'
    );
}

function isPlatformErrors(errors: unknown): errors is PlatformError[] {
    return !!errors && typeof errors === 'object' && Array.isArray(errors) && isPlatformError(errors[0]);
}

function convertErrorMessage(error: Error): string | undefined {
    if (!error.message) {
        return fatalErrorBody;
    }

    switch (error.message) {
        case CheckoutError.CANNOT_POLL_CHECKOUT:
        case CheckoutError.CANNOT_START_CHECKOUT:
        case CheckoutError.NULL_CHECKOUTID:
        case CheckoutError.NULL_CHECKOUT_JSON:
        case CheckoutError.SESSION_IN_ERROR:
        case CheckoutError.SESSION_NOT_LOADED:
            return fatalErrorBody;
        case CheckoutError.NO_DELIVERY_ADDRESSES:
            return noDeliveryAddressesBody;
        default: {
            return error.message;
        }
    }
}

/**
 * Check if exception contains error attritube.
 * Due to the limition of TypeScript, we are not able to use instanceof StoreActionError to check.
 * reference: https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
 *
 * @param exception {unknown}
 * @returns boolean
 */
function isExceptionWithError(exception: unknown): exception is ExceptionWithError {
    return !!exception && typeof exception === 'object' && 'error' in exception;
}

/**
 * Check if the checkoutInformation contains 422 error detail.
 *
 * @param checkoutInformation {CheckoutInformation}
 * @returns boolean
 */
export function isCheckoutIntegrationError(checkoutInformation: CheckoutInformation | undefined): boolean {
    const errors = checkoutInformation?.errors;
    return Array.isArray(errors) && errors.length > 0;
}

/*
 * Generate error label from the error exception
 *
 * @param exception optional error exception or error string
 * @returns {ErrorLabels} with error string as the body or default to unknown error
 */
export function generateErrorLabel(
    exception: string | unknown = '',
    defaultErrorLabel: ErrorLabels = unknownErrorLabels
): ErrorLabels {
    const errorLabels = { ...defaultErrorLabel };
    if (typeof exception === 'string' && exception) {
        errorLabels.body = exception;
    } else if (isExceptionWithError(exception) && isPlatformErrors(exception.error) && exception.error?.length) {
        errorLabels.body = exception.error[0].message;
    } else if (isPlatformErrors(exception) && exception?.length) {
        errorLabels.body = exception[0].message;
    } else if (exception instanceof Error) {
        errorLabels.body = convertErrorMessage(exception);
    }
    return errorLabels;
}

/**
 * Generate Error Label for checkoutinformation contains 422 error detail.
 *
 * @param checkoutInformation {CheckoutInformation}
 * @returns boolean
 */
export function generateCheckoutIntegrationErrorLabel(
    checkoutInformation: CheckoutInformation | undefined
): ErrorLabels {
    // show 422 integration error detail which is structred differently from all other error response
    // otherwise check should we show the no delivery methods available error
    const errorDetail = checkoutInformation?.errors?.[0]?.detail;
    return generateErrorLabel(errorDetail);
}

/**
 * Generate Error Label for CheckoutInfrmation wire adpater errors
 *
 * @param checkoutInformation {StoreAdapterCallbackEntry<CheckoutInformation>}
 * @returns ErrorLabels
 */
export function generateCheckoutInformationErrorLabel(
    checkoutInformation: StoreAdapterCallbackEntry<CheckoutInformation>
): ErrorLabels {
    // show thrown Error
    if (checkoutInformation?.error) {
        return generateErrorLabel(checkoutInformation.error);
    }

    // show 422 error
    if (isCheckoutIntegrationError(checkoutInformation?.data)) {
        return generateCheckoutIntegrationErrorLabel(checkoutInformation?.data);
    }

    return noErrorLabels;
}

/**
 * Check if CheckoutInformation.error or integration error exists
 *
 * @param checkoutInformation {StoreAdapterCallbackEntry<CheckoutInformation>}
 * @returns boolean
 */
export function isCheckoutInformationError(
    checkoutInformation: StoreAdapterCallbackEntry<CheckoutInformation>
): boolean {
    return !!checkoutInformation?.error || isCheckoutIntegrationError(checkoutInformation?.data);
}

/**
 * Unwraps an error resulting from dispatching an action
 * The error could either be of Type StoreActionError
 * which wraps the underlying error and stores in an error property
 * or the actual error itself
 *
 * @param e the action error
 * @returns the underlying error
 */
export function unwrapActionError(e: unknown): unknown {
    if (isExceptionWithError(e)) {
        return e.error;
    }

    return e;
}
