import { createElement } from 'lwc';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import Payment from '../payment';
import { InternalContextAdapter } from 'commerce/context';
import { authorizePayment } from 'commerce/checkoutApi';
import { setupMockStripeJs, tearDownMockStripeJs } from './stripeJsMock';

import type {
    Address,
    CardPaymentMethodApi,
    CheckoutRequestError,
    CustomPaymentComponent,
    PaymentAuthorizationResponse,
    PaymentClientSideCompleteResponse,
    PaymentCompleteResponse,
    PaymentGatewayLog,
} from 'types/unified_checkout';
import type { TestWireAdapter } from 'types/testing';

import * as mockConfirmInsufficientFunds from './data/stripeConfirmInsufficientFunds.json';
import * as mockConfirmSuccess from './data/stripeConfirmSuccessResponse.json';
import * as mockConfirmRequest from './data/stripeConfirmRequest.json';
import { PaymentAuthorizationError } from 'commerce_unified_checkout/paymentAuthorizationError';

type ScopedNotification = HTMLElement & { type: string; messageHeader: string };

jest.mock('commerce/context', () =>
    Object.assign({}, jest.requireActual('commerce/context'), {
        InternalContextAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock(
    'transport',
    () => {
        return {
            fetch: jest.fn(() => {
                return Promise.resolve();
            }),
        };
    },
    { virtual: true }
);

jest.mock(
    '@app/csrfToken',
    () => {
        return { default: 'csrftoken' };
    },
    { virtual: true }
);

jest.mock('commerce/checkoutApi', () => {
    const successfulPaymentResponse = { salesforceResultCode: 'Success', errors: [] };

    return {
        authorizePayment: jest.fn().mockResolvedValue(successfulPaymentResponse),
        postAuthorizePayment: jest.fn().mockResolvedValue(successfulPaymentResponse),
        CheckoutInformationAdapter: mockCreateTestWireAdapter(),
        paymentClientRequest: jest.fn().mockResolvedValue({}),
    };
});

jest.mock('lightning/platformResourceLoader', () => {
    return {
        loadScript: jest.fn(),
    };
});

jest.mock('../importComponent', () => {
    const originalModule = jest.requireActual('../importComponent');

    return {
        importComponent: (componentName: string): string => {
            if (componentName.indexOf('dummy') > -1) {
                throw Error('Error loading payment component');
            }

            return originalModule.importComponent(componentName);
        },
    };
});

jest.mock('../labels', () => ({
    unknownError: 'Something went wrong, please try again.',
}));

jest.mock(
    'o11y/client',
    () => {
        return {
            getInstrumentation: jest.fn().mockReturnValue({
                activityAsync: jest.fn().mockImplementation((name: string, execute: () => Promise<unknown>) => {
                    return execute();
                }),
            }),
        };
    },
    {
        virtual: true,
    }
);

function getElement(element: HTMLElement, selector: string): HTMLElement {
    return element.querySelector(selector) as HTMLElement;
}

describe('payment component', () => {
    let element: HTMLElement & Payment;
    const checkoutId = 'mockcheckoutId';

    beforeEach(() => {
        window.originalDomApis = {
            htmlelementAddEventListener: Element.prototype.addEventListener,
            elementAppendChild: Document.prototype.appendChild,
            elementAttachShadow: Element.prototype.attachShadow,
            elementSetAttribute: Element.prototype.setAttribute,
            documentCreateElement: Document.prototype.createElement,
        };
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('Native payment component', () => {
        let nativeComponent: HTMLElement & CardPaymentMethodApi;

        beforeEach(() => {
            element = createElement('card-payment-method', {
                is: Payment,
            });

            document.body.appendChild(element);

            nativeComponent = getElement(element, 'commerce_unified_checkout-card-payment-method') as HTMLElement &
                CardPaymentMethodApi;
            element.webstoreId = 'webstoreId';
        });

        it('should not display an error notification', () => {
            const errorNotificationComponent = getElement(
                element,
                'b2c_lite_commerce-scoped-notification'
            ) as ScopedNotification;
            expect(errorNotificationComponent).toBeNull();
        });

        describe('completePayment API', () => {
            const billingAddress: Address = {
                name: 'Shopper Name',
                street: '123 Acme Drive',
                city: 'San Francisco',
                postalCode: '94105',
                region: 'CA',
                country: 'US',
                isDefault: false,
                label: 'Test Label',
                addressType: 'CPA',
            };

            const billingAddressApiInput: Address = {
                name: 'Shopper Name',
                street: '123 Acme Drive',
                city: 'San Francisco',
                postalCode: '94105',
                region: 'CA',
                country: 'US',
            };

            it('should return a rejected promise if webstore id is not defined', () => {
                element.webstoreId = undefined;
                return expect(element.completePayment(checkoutId, billingAddress)).rejects.toBe(
                    'webstore id is required to complete a payment'
                );
            });

            describe('payment successfully completed', () => {
                beforeEach(() => {
                    jest.spyOn(nativeComponent, 'tokenizePaymentMethod').mockImplementation(() =>
                        Promise.resolve({
                            token: 'mockpaymenttoken',
                            errors: [],
                        })
                    );

                    element.completePayment(checkoutId, billingAddress);
                });

                it("should call the cardPaymentMethodComponent's tokenizePaymentMethod API", () => {
                    expect(nativeComponent.tokenizePaymentMethod).toHaveBeenCalledWith(
                        'webstoreId',
                        billingAddressApiInput
                    );
                });

                it('should call the checkoutApi authorizePayment API', () => {
                    expect(authorizePayment).toHaveBeenCalledWith(
                        'mockcheckoutId',
                        'mockpaymenttoken',
                        billingAddressApiInput
                    );
                });
            });

            describe('card declined', () => {
                let declineAuthResponse: PaymentAuthorizationResponse;

                beforeEach(() => {
                    jest.spyOn(nativeComponent, 'tokenizePaymentMethod').mockImplementation(() =>
                        Promise.resolve({
                            token: 'mockpaymenttoken',
                            errors: [],
                        })
                    );

                    declineAuthResponse = {
                        errors: [
                            {
                                detail: 'Your payment was not accepted.  Please try another form of payment',
                                title: 'Your payment was not accepted.  Please try another form of payment',
                                type: '/commerce/errors/payment-failure',
                            },
                        ],
                        salesforceResultCode: 'Decline',
                    } as PaymentAuthorizationResponse;
                    (<jest.Mock>authorizePayment).mockRejectedValue(declineAuthResponse);
                });

                it('should throw a PaymentAuthorizationError', () => {
                    return expect(element.completePayment(checkoutId, billingAddress)).rejects.toMatchObject(
                        new PaymentAuthorizationError(declineAuthResponse.errors?.[0])
                    );
                });
            });

            describe('failed tokenization', () => {
                let completePaymentPromise: Promise<PaymentCompleteResponse>;
                const tokenizeErrorResponse: { errors: CheckoutRequestError[] } = {
                    errors: [
                        {
                            title: 'Tokenize Failure',
                            instance: 'test01',
                            detail: 'We are unable to process your payment at this time.  Please try back later.',
                            type: '/commerce/errors/payment-failure',
                        },
                    ],
                };

                beforeEach(() => {
                    jest.spyOn(nativeComponent, 'tokenizePaymentMethod').mockImplementation(() =>
                        Promise.reject(tokenizeErrorResponse)
                    );
                    completePaymentPromise = element.completePayment(checkoutId, billingAddress);
                });
                it('should return a rejected promise with PaymentAuthorizationError error details', () => {
                    return expect(completePaymentPromise).rejects.toEqual(
                        new PaymentAuthorizationError(tokenizeErrorResponse.errors[0])
                    );
                });
            });

            describe('failed authorization', () => {
                let completePaymentPromise: Promise<PaymentCompleteResponse>;
                const mockAuthErrorResponse = {
                    errors: [
                        {
                            title: 'Auth Failure',
                            instance: 'test01',
                            detail: 'We are unable to process your payment at this time.  Please try back later.',
                            type: '/commerce/errors/payment-failure',
                        },
                    ],
                };

                beforeEach(() => {
                    jest.spyOn(nativeComponent, 'tokenizePaymentMethod').mockImplementation(() =>
                        Promise.resolve({
                            token: 'mockpaymenttoken',
                            errors: [],
                        })
                    );
                    (<jest.Mock>authorizePayment).mockRejectedValue(mockAuthErrorResponse);
                    completePaymentPromise = element.completePayment(checkoutId, billingAddress);
                });
                it('should report failure back to the step', () => {
                    return expect(completePaymentPromise).rejects.toEqual(
                        new PaymentAuthorizationError({
                            title: 'Auth Failure',
                            instance: 'test01',
                            detail: 'We are unable to process your payment at this time.  Please try back later.',
                            type: '/commerce/errors/payment-failure',
                        })
                    );
                });
            });
        });

        describe('focus', () => {
            it('should call the focus API on the native component', () => {
                jest.spyOn(nativeComponent, 'focus');
                element.focus();
                expect(nativeComponent.focus).toHaveBeenCalled();
            });
        });

        describe('reportValidity', () => {
            it('should call reportValidity API on native component', () => {
                jest.spyOn(nativeComponent, 'reportValidity').mockImplementation(() => true);
                element.reportValidity();
                expect(nativeComponent.reportValidity).toHaveBeenCalled();
            });
        });
    });

    describe('custom payment component', () => {
        let customComponent: CustomPaymentComponent & HTMLElement;

        beforeEach(() => {
            setupMockStripeJs();

            element = createElement('card-payment-method', {
                is: Payment,
            });

            ((<unknown>InternalContextAdapter) as typeof TestWireAdapter).emit({
                data: {
                    clientSidePaymentConfiguration: {
                        componentName: 'b2c_lite_commerce/stripeCardElement',
                        config: { publishableAPIKey: 'pk_zyz' },
                    },
                },
            });

            document.body.appendChild(element);
            element.webstoreId = 'webstoreId';
        });

        afterEach(() => {
            tearDownMockStripeJs();
        });

        it('should not display the native component', () => {
            return Promise.resolve().then(() => {
                const nativeComponent = getElement(
                    element,
                    'commerce_unified_checkout-card-payment-method'
                ) as HTMLElement & CardPaymentMethodApi;
                expect(nativeComponent).toBeNull();

                customComponent = getElement(element, '[data-client-side-payment]') as HTMLElement &
                    CustomPaymentComponent;
                expect(customComponent).toBeTruthy();
            });
        });

        it('should initialize stripe with the current locale', async () => {
            await Promise.resolve();
            // @ts-ignore
            // eslint-disable-next-line no-undef
            expect(Stripe).toHaveBeenCalledWith('pk_zyz', { locale: 'en-US' });
        });

        it('should not display an error notification', () => {
            const errorNotificationComponent = getElement(
                element,
                'b2c_lite_commerce-scoped-notification'
            ) as ScopedNotification;
            expect(errorNotificationComponent).toBeNull();
        });

        describe('completePayment', () => {
            let completePaymentResponse: PaymentCompleteResponse;

            const billingAddress: Address = {
                name: 'Shopper Name',
                street: '123 Acme Drive',
                city: 'San Francisco',
                postalCode: '94105',
                region: 'CA',
                country: 'US',
                isDefault: false,
                label: 'Test Label',
                addressType: 'CPA',
            };

            const billingAddressApiInput: Address = {
                name: 'Shopper Name',
                street: '123 Acme Drive',
                city: 'San Francisco',
                postalCode: '94105',
                region: 'CA',
                country: 'US',
            };

            beforeEach(() => {
                customComponent = getElement(element, '[data-client-side-payment]') as HTMLElement &
                    CustomPaymentComponent;
            });

            describe('successful payment', () => {
                const log: PaymentGatewayLog = {
                    authorizationCode: 'pi_3JhcodEYJlmrexwW0QwGERnP',
                    refNumber: 'pi_3JhcodEYJlmrexwW0QwGERnP',
                    interactionType: 'Authorization',
                    interactionStatus: 'Success',
                    request: mockConfirmRequest,
                    response: mockConfirmSuccess,
                };

                beforeEach(async () => {
                    jest.spyOn(customComponent, 'completePayment').mockImplementation(() =>
                        Promise.resolve({
                            responseCode: 'authorizationcode',
                            logs: [log],
                        } as PaymentClientSideCompleteResponse)
                    );

                    completePaymentResponse = await element.completePayment(checkoutId, billingAddress);
                });

                it('should call the completePayment API on the custom component', () => {
                    expect(customComponent.completePayment).toHaveBeenCalledWith(billingAddressApiInput);
                });

                it('should return the correct response', () => {
                    expect(completePaymentResponse).toEqual({
                        salesforceResultCode: 'Success',
                        errors: [],
                    } as PaymentCompleteResponse);
                });
            });

            describe('api error', () => {
                const log: PaymentGatewayLog = {
                    description: 'Insufficient funds',
                    interactionType: 'Authorization',
                    interactionStatus: 'Failed',
                    request: mockConfirmRequest,
                    response: mockConfirmInsufficientFunds,
                };

                beforeEach(() => {
                    jest.spyOn(customComponent, 'completePayment').mockImplementation(() =>
                        Promise.resolve({
                            error: {
                                message: 'Card Declined',
                                code: 'CARD_DECLINE',
                            },
                            logs: [log],
                        } as PaymentClientSideCompleteResponse)
                    );
                });

                it('should return a rejected promise', async () => {
                    await expect(element.completePayment(checkoutId, billingAddress)).rejects.toMatchObject(
                        new PaymentAuthorizationError({
                            type: '/commerce/errors/payment-failure',
                            title: 'Card Declined',
                            detail: 'Card Declined',
                            instance: 'client',
                        })
                    );

                    expect(customComponent.completePayment).toHaveBeenCalledWith(billingAddressApiInput);
                });
            });

            describe('invalid response shape', () => {
                beforeEach(() => {
                    // This is testing specifically a custom component not adhering to response type so we must ts ignore
                    // @ts-ignore
                    jest.spyOn(customComponent, 'completePayment').mockImplementation(() => Promise.resolve({}));
                });

                it('should return a rejected promise', () => {
                    return expect(element.completePayment(checkoutId, billingAddress)).rejects.toMatchObject(
                        new PaymentAuthorizationError({
                            detail: 'no response code received from custom component',
                            instance: 'client',
                            title: 'no response code received from custom component',
                            type: '/commerce/errors/payment-failure',
                        })
                    );
                });
            });
        });

        describe('reportValidity', () => {
            it('should call reportValidity API on the custom component', () => {
                customComponent = getElement(element, '[data-client-side-payment]') as HTMLElement &
                    CustomPaymentComponent;
                jest.spyOn(customComponent, 'reportValidity').mockImplementation(() => true);
                element.reportValidity();
                expect(customComponent.reportValidity).toHaveBeenCalled();
            });
        });

        describe('application context data is undefined', () => {
            beforeEach(() => {
                element = createElement('card-payment-method', {
                    is: Payment,
                });

                ((<unknown>InternalContextAdapter) as typeof TestWireAdapter).emit({
                    data: undefined,
                });

                document.body.appendChild(element);

                element.webstoreId = 'webstoreId';
            });

            it("shouldn't display a custom component", () => {
                customComponent = getElement(element, '[data-client-side-payment]') as HTMLElement &
                    CustomPaymentComponent;
                expect(customComponent).toBeNull();
            });
        });

        describe('error is present in the clientSidePaymentConfiguration', () => {
            beforeEach(() => {
                console.error = jest.fn();
                element = createElement('card-payment-method', {
                    is: Payment,
                });

                ((<unknown>InternalContextAdapter) as typeof TestWireAdapter).emit({
                    data: {
                        clientSidePaymentConfiguration: {
                            error: 'Test Error',
                        },
                    },
                });

                document.body.appendChild(element);

                element.webstoreId = 'webstoreId';
            });

            afterEach(() => {
                (<jest.Mock>console.error).mockClear();
            });

            it('should not display a custom component', () => {
                customComponent = element.querySelector('[data-client-side-payment]') as CustomPaymentComponent &
                    HTMLElement;
                expect(customComponent).toBeNull();
                expect(console.error).toHaveBeenCalledWith('Error loading component: Test Error');

                const errorMsgComponent = getElement(
                    element,
                    'b2c_lite_commerce-scoped-notification'
                ) as ScopedNotification;
                expect(errorMsgComponent).toBeTruthy();

                const messageHeader = errorMsgComponent.messageHeader;
                expect(messageHeader).toBe('Something went wrong, please try again.');

                const notificationType = errorMsgComponent.type;
                expect(notificationType).toBe('error');
            });
        });

        describe('clientSidePaymentConfiguration is present in application context but clientComponentName is not present', () => {
            beforeEach(() => {
                console.error = jest.fn();
                element = createElement('card-payment-method', {
                    is: Payment,
                });

                ((<unknown>InternalContextAdapter) as typeof TestWireAdapter).emit({
                    data: {
                        clientSidePaymentConfiguration: {},
                    },
                });

                document.body.appendChild(element);

                element.webstoreId = 'webstoreId';
            });

            it('should not display a custom component', () => {
                customComponent = element.querySelector('[data-client-side-payment]') as CustomPaymentComponent &
                    HTMLElement;
                expect(customComponent).toBeNull();
            });

            it('should have logged an error in the console', () => {
                expect(console.error).toHaveBeenCalledWith(
                    'Error loading payment component:In client side mode but no payment component provided.'
                );
            });

            it('should display an error notification', () => {
                const errorMsgComponent = getElement(
                    element,
                    'b2c_lite_commerce-scoped-notification'
                ) as ScopedNotification;
                expect(errorMsgComponent).toBeTruthy();

                const messageHeader = errorMsgComponent.messageHeader;
                expect(messageHeader).toBe('Something went wrong, please try again.');

                const notificationType = errorMsgComponent.type;
                expect(notificationType).toBe('error');
            });
        });
    });

    describe('error loading client component', () => {
        beforeEach(() => {
            console.error = jest.fn();
            element = createElement('card-payment-method', {
                is: Payment,
            });

            ((<unknown>InternalContextAdapter) as typeof TestWireAdapter).emit({
                data: {
                    clientSidePaymentConfiguration: {
                        componentName: 'b2c_lite_commerce/dummy',
                        config: { publicKey: 'pk_zyz' },
                    },
                },
            });

            document.body.appendChild(element);

            element.webstoreId = 'webstoreId';
        });

        it('should not display a custom component', () => {
            const customComponent = element.querySelector('[data-client-side-payment]') as CustomPaymentComponent &
                HTMLElement;
            expect(customComponent).toBeNull();
            expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/Error loading payment component:.*/));
        });

        afterEach(() => {
            (<jest.Mock>console.error).mockClear();
        });
    });

    describe('application context has an error', () => {
        beforeEach(() => {
            element = createElement('card-payment-method', {
                is: Payment,
            });

            ((<unknown>InternalContextAdapter) as typeof TestWireAdapter).emit({
                error: 'some error',
            });

            document.body.appendChild(element);

            element.webstoreId = 'webstoreId';
        });

        it('should not display a custom component', () => {
            const customComponent = getElement(element, '[data-client-side-payment]') as HTMLElement &
                CustomPaymentComponent;
            expect(customComponent).toBeNull();
        });

        it('should not display a native component', () => {
            const nativeComponent = getElement(
                element,
                'commerce_unified_checkout-card-payment-method'
            ) as HTMLElement & CardPaymentMethodApi;

            expect(nativeComponent).toBeNull();
        });

        it('should display an error notification', () => {
            const errorNotificationComponent = getElement(
                element,
                'b2c_lite_commerce-scoped-notification'
            ) as ScopedNotification;

            expect(errorNotificationComponent.messageHeader).toBe('Something went wrong, please try again.');
        });
    });

    describe('application context has payment intergation error', () => {
        beforeEach(() => {
            console.error = jest.fn();
            element = createElement('card-payment-method', {
                is: Payment,
            });

            ((<unknown>InternalContextAdapter) as typeof TestWireAdapter).emit({
                data: {
                    clientSidePaymentConfiguration: {
                        error: 'No Payment Integration specified for webStore: 0ZERO00000007p04AA',
                    },
                },
            });

            document.body.appendChild(element);

            element.webstoreId = 'webstoreId';
        });

        afterEach(() => {
            (<jest.Mock>console.error).mockClear();
        });

        it('should not display a custom component', () => {
            const customComponent = getElement(element, '[data-client-side-payment]') as HTMLElement &
                CustomPaymentComponent;
            expect(customComponent).toBeNull();
        });

        it('should not display a native component', () => {
            const nativeComponent = getElement(
                element,
                'commerce_unified_checkout-card-payment-method'
            ) as HTMLElement & CardPaymentMethodApi;

            expect(nativeComponent).toBeNull();
        });

        it('should display an error notification', () => {
            const errorNotificationComponent = getElement(
                element,
                'b2c_lite_commerce-scoped-notification'
            ) as ScopedNotification;
            expect(errorNotificationComponent).toBeTruthy();
            expect(errorNotificationComponent.messageHeader).toBe(
                'No Payment Integration specified for webStore: 0ZERO00000007p04AA'
            );
        });
    });
});
