import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import UnifiedCheckout from 'commerce_unified_checkout/checkout';
import { CheckoutInformationAdapter } from 'commerce/checkoutApi';
import { generateUrl, NavigationContext } from 'lightning/navigation';
import { generateErrorLabel } from 'commerce_unified_checkout/errorHandler';
import { SessionContextAdapter } from 'commerce/contextApi';

// These mocks cover aspects of interaction with the server that we don't want to be testing
jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('commerce/contextApi', () => ({
    SessionContextAdapter: mockCreateTestWireAdapter(),
}));

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => 'current_cart'),
    NavigationContext: mockCreateTestWireAdapter(),
    navigate: jest.fn(),
}));

jest.mock('commerce/checkoutApi', () =>
    Object.assign({}, jest.requireActual('commerce/checkoutApi'), {
        CheckoutInformationAdapter: mockCreateTestWireAdapter(),
    })
);

const generatedErrorLabel = {
    header: 'ERROR-HEADER',
    body: 'ERROR-BODY',
};

jest.mock('commerce_unified_checkout/errorHandler', () => {
    return Object.assign({}, jest.requireActual('commerce_unified_checkout/errorHandler'), {
        generateErrorLabel: jest.fn(() => generatedErrorLabel),
    });
});

describe('Shipping Instructions component checkoutAdapterHandler', () => {
    let element: HTMLElement & UnifiedCheckout;

    beforeEach(async () => {
        element = createElement('commerce_unified_checkout-checkout', {
            is: UnifiedCheckout,
        });

        (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({
            test: 'test',
        });

        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    it('should generate cart url', () => {
        expect(generateUrl).toHaveBeenCalledWith(
            {
                test: 'test',
            },
            {
                attributes: {
                    name: 'Current_Cart',
                },
                type: 'comm__namedPage',
            }
        );
    });

    it('should show fatal error in non builder mode', async () => {
        (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
            data: {
                isPreview: false,
            },
        });

        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            error: {
                message: 'error message',
            },
        });

        await Promise.resolve();

        // @ts-ignore
        const notificationContent = element.shadowRoot.querySelector('b2c_lite_commerce-scoped-notification');
        expect(generateErrorLabel).toHaveBeenCalledWith(
            { message: 'error message' },
            {
                body: 'B2C_Lite_Checkout.fatalErrorBody',
                header: 'B2C_Lite_Checkout.genericErrorHeader',
                returnToCart: 'B2C_Lite_Checkout.returnToCart',
            }
        );
        expect(notificationContent.textContent).toContain('ERROR-HEADERERROR-BODY');
    });

    it('should not show fatal error if no error message', async () => {
        (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
            data: null,
        });

        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({});

        await Promise.resolve();

        // @ts-ignore
        const error = element.shadowRoot.querySelector('lightning-formatted-url');
        await Promise.resolve();

        expect(error).toBeNull();
    });

    it('should not show fatal error in builder mode or authenticated user preview mode', async () => {
        (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
            data: {
                isPreview: true,
            },
        });

        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            error: {
                message: 'error message',
            },
        });

        await Promise.resolve();

        // @ts-ignore
        const error = element.shadowRoot.querySelector('lightning-formatted-url');
        await Promise.resolve();

        expect(error).toBeNull();
    });
});
