import {
    CheckoutError,
    generateCheckoutInformationErrorLabel,
    generateErrorLabel,
    isCheckoutInformationError,
    noErrorLabels,
    unwrapActionError,
} from 'commerce_unified_checkout/errorHandler';
import { StoreActionError } from 'experience/store';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type { CheckoutInformation } from 'types/unified_checkout';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock(
    '@salesforce/label/AddressCountries.US',
    () => {
        return {
            default: 'United States',
        };
    },
    { virtual: true }
);

describe('ErrorHandler - generateErrorLabel', () => {
    it('should generate default error label with no error message input', () => {
        const label = generateErrorLabel();
        expect(label).toEqual({
            body: 'B2C_Lite_Checkout.unknownErrorBody',
            header: 'B2C_Lite_Checkout.genericErrorHeader',
        });
    });

    it('should generate error label using string error message', () => {
        const label = generateErrorLabel('TEST-ERROR');
        expect(label).toEqual({
            body: 'TEST-ERROR',
            header: 'B2C_Lite_Checkout.genericErrorHeader',
        });
    });

    it('should generate error label using StoreActionError', () => {
        const label = generateErrorLabel(
            new StoreActionError([{ errorCode: 'API-ERROR', message: 'API-ERROR-MESSAGE' }])
        );
        expect(label).toEqual({
            body: 'API-ERROR-MESSAGE',
            header: 'B2C_Lite_Checkout.genericErrorHeader',
        });
    });

    it('should generate error label using platform error', () => {
        const label = generateErrorLabel([{ errorCode: 'API-ERROR', message: 'API-ERROR-MESSAGE' }]);
        expect(label).toEqual({
            body: 'API-ERROR-MESSAGE',
            header: 'B2C_Lite_Checkout.genericErrorHeader',
        });
    });

    it('should generate error label base on Error message', () => {
        const label = generateErrorLabel(new Error('ERROR-EXCEPTION'));
        expect(label).toEqual({
            body: 'ERROR-EXCEPTION',
            header: 'B2C_Lite_Checkout.genericErrorHeader',
        });
    });

    it('should generate error label for CANNOT_POLL_CHECKOUT Error', () => {
        const label = generateErrorLabel(new Error(CheckoutError.CANNOT_POLL_CHECKOUT));
        expect(label).toEqual({
            body: 'B2C_Lite_Checkout.fatalErrorBody',
            header: 'B2C_Lite_Checkout.genericErrorHeader',
        });
    });

    it('should generate error label for CANNOT_START_CHECKOUT Error', () => {
        const label = generateErrorLabel(new Error(CheckoutError.CANNOT_START_CHECKOUT));
        expect(label).toEqual({
            body: 'B2C_Lite_Checkout.fatalErrorBody',
            header: 'B2C_Lite_Checkout.genericErrorHeader',
        });
    });

    it('should generate error label for NULL_CHECKOUTID Error', () => {
        const label = generateErrorLabel(new Error(CheckoutError.NULL_CHECKOUTID));
        expect(label).toEqual({
            body: 'B2C_Lite_Checkout.fatalErrorBody',
            header: 'B2C_Lite_Checkout.genericErrorHeader',
        });
    });

    it('should generate error label for NULL_CHECKOUT_JSON Error', () => {
        const label = generateErrorLabel(new Error(CheckoutError.NULL_CHECKOUT_JSON));
        expect(label).toEqual({
            body: 'B2C_Lite_Checkout.fatalErrorBody',
            header: 'B2C_Lite_Checkout.genericErrorHeader',
        });
    });

    it('should generate error label for NO_DELIVERY_ADDRESSES Error', () => {
        const label = generateErrorLabel(new Error(CheckoutError.NO_DELIVERY_ADDRESSES));
        expect(label).toEqual({
            body: 'B2C_Lite_Checkout.noDeliveryAddressesBody',
            header: 'B2C_Lite_Checkout.genericErrorHeader',
        });
    });

    it('should generate fatal error if Error message is empty', () => {
        const label = generateErrorLabel(new Error());
        expect(label).toEqual({
            body: 'B2C_Lite_Checkout.fatalErrorBody',
            header: 'B2C_Lite_Checkout.genericErrorHeader',
        });
    });
});

describe('ErrorHandler - generateCheckoutInformationErrorLabel', () => {
    it('should generate labels for thrown Error', () => {
        const response: StoreAdapterCallbackEntry<CheckoutInformation> = {
            error: new Error(''),
            loaded: true,
            loading: false,
        };
        expect(generateCheckoutInformationErrorLabel(response)).toEqual({
            body: 'B2C_Lite_Checkout.fatalErrorBody',
            header: 'B2C_Lite_Checkout.genericErrorHeader',
        });
    });

    it('should generate labels for checkout integration error', () => {
        const response: StoreAdapterCallbackEntry<CheckoutInformation> = {
            data: { errors: [{ detail: '', type: '/commerce/errors/checkout-failure', title: '', instance: '' }] },
            loaded: true,
            loading: false,
        };
        expect(generateCheckoutInformationErrorLabel(response)).toEqual({
            body: 'B2C_Lite_Checkout.unknownErrorBody',
            header: 'B2C_Lite_Checkout.genericErrorHeader',
        });
    });

    it('should generate no error labels for no error', () => {
        const response: StoreAdapterCallbackEntry<CheckoutInformation> = {
            data: {},
            loaded: true,
            loading: false,
        };
        expect(generateCheckoutInformationErrorLabel(response)).toEqual(noErrorLabels);
    });
});

describe('ErrorHandler - isCheckoutInformationError', () => {
    it('should check checkoutInformation error', () => {
        const response: StoreAdapterCallbackEntry<CheckoutInformation> = {
            error: new Error(''),
            loaded: true,
            loading: false,
        };
        expect(isCheckoutInformationError(response)).toBeTruthy();
    });

    it('should check checkout integration error', () => {
        const response: StoreAdapterCallbackEntry<CheckoutInformation> = {
            data: { errors: [{ detail: '', type: '/commerce/errors/checkout-failure', title: '', instance: '' }] },
            loaded: true,
            loading: false,
        };
        expect(isCheckoutInformationError(response)).toBeTruthy();
    });

    it('should check no error', () => {
        const response: StoreAdapterCallbackEntry<CheckoutInformation> = {
            data: {},
            loaded: true,
            loading: false,
        };
        expect(isCheckoutInformationError(response)).toBeFalsy();
    });
});

describe('unwrapActionError', () => {
    it('should unwrap a StoreActionError', () => {
        const storeActionError = new StoreActionError([{ message: 'test' }]);
        expect(unwrapActionError(storeActionError)).toEqual([{ message: 'test' }]);
    });

    it("should return the given error if it doesn't pass a StoreActionError duck type check", () => {
        const plainError = { mock: 'error' };
        expect(unwrapActionError(plainError)).toEqual(plainError);
    });
});
