import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import PaymentWithBilling from 'commerce_unified_checkout/paymentWithBilling';
import type Payment from 'commerce_unified_checkout/payment';
import type BillingAddressGroup from 'commerce_unified_checkout/billingAddressGroup';
import { InternalContextAdapter } from 'commerce/context';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { CheckoutInformationAdapter, updateContactInformation, placeOrder } from 'commerce/checkoutApi';

import type { CardPaymentMethodApi, OrderConfirmation } from 'types/unified_checkout';

import { querySelector } from 'kagekiri';
import { navigate } from 'lightning/navigation';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import { PaymentAuthorizationError } from 'commerce_unified_checkout/paymentAuthorizationError';
import { generateErrorLabel } from 'commerce_unified_checkout/errorHandler';

jest.mock(
    'o11y/client',
    () => {
        return {
            getInstrumentation: (): Record<string, unknown> => {
                return {
                    activityAsync: jest.fn().mockImplementation((name: string, execute: () => Promise<unknown>) => {
                        return execute();
                    }),
                };
            },
        };
    },
    {
        virtual: true,
    }
);

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        SessionContextAdapter: mockCreateTestWireAdapter(),
        AppContextAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock('commerce/context', () =>
    Object.assign({}, jest.requireActual('commerce/context'), {
        InternalContextAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock('lightning/navigation', () => ({
    NavigationContext: mockCreateTestWireAdapter(jest.fn()),
    navigate: jest.fn(),
}));

jest.mock('commerce/checkoutApi', () => {
    return Object.assign({}, jest.requireActual('commerce/checkoutApi'), {
        notifyAndPollCheckout: jest.fn(),
        updateContactInformation: jest.fn(),
        placeOrder: jest.fn(),
        CheckoutInformationAdapter: mockCreateTestWireAdapter(),
        authorizePayment: jest.fn(() => {
            return Promise.resolve({ salesforceResultCode: 'Success', errors: [] });
        }),
    });
});

const mockedPlaceOrder = placeOrder as jest.Mock<Promise<OrderConfirmation>>;

jest.mock(
    '@app/csrfToken',
    () => {
        return { default: 'csrftoken' };
    },
    { virtual: true }
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

const defaultAddresses = [
    {
        addressId: 'address1',
        isDefault: true,
        name: 'Jane Doe',
        street: '123 Broadway',
        city: 'New York',
        postalCode: '11000',
        region: 'NY',
        country: 'US',
    },
    {
        addressId: 'address2',
        isDefault: false,
        name: '',
        street: '5 Wall Street',
        city: 'Burlington',
        postalCode: '01803',
        region: 'MA',
        country: 'US',
    },
    {
        addressId: 'address3',
        isDefault: false,
        name: '',
        street: '123 Broadway',
        city: 'Tokyo',
        postalCode: '12345',
        region: 'TK',
        country: 'JP',
    },
    {
        addressId: 'address4',
        isDefault: false,
        name: 'LastName FirstName',
        street: '123 Broadway',
        city: 'Tokyo',
        postalCode: '12345',
        region: 'TK',
        country: 'JP',
    },
    {
        addressId: 'address5',
        isDefault: false,
        firstName: 'First',
        lastName: 'Last',
        street: '123 Broadway',
        city: 'Tokyo',
        postalCode: '12345',
        region: 'TK',
        country: 'JP',
    },
];

const orderConfirmationPageRef = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Order',
    },
    state: {
        orderNumber: 'orderReferenceNumber',
    },
};

describe('commerce_unified_checkout/paymentWithBilling', () => {
    let element: HTMLElement & PaymentWithBilling;
    let nativeComponent: HTMLElement & CardPaymentMethodApi;

    beforeEach(async () => {
        element = createElement('commerce_unified_checkout-payment-with-billing', {
            is: PaymentWithBilling,
        });

        element.builderMode = false;
        element.billingAddressFieldsetLegendLabel = 'Billing Address';
        element.billingAddressSameAsShippingAddressLabel = 'My billing address is the same as my shipping address';
        element.phoneNumberLabel = 'phoneNumberLabel';

        (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
            data: { isLoggedIn: false },
        });

        (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
            data: { webstoreId: 'webstoreid', shippingCountries: ['US'] },
        });

        (<typeof InternalContextAdapter & typeof TestWireAdapter>InternalContextAdapter).emit({
            data: undefined,
        });

        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                deliveryGroups: { items: [{ deliveryAddress: defaultAddresses[0] }] },
                contactInfo: {
                    firstName: 'Jane',
                    lastName: 'Doe',
                    phoneNumber: '99999999',
                    email: 'test@gmail.com',
                },
            },
        });

        window.originalDomApis = {
            htmlelementAddEventListener: Element.prototype.addEventListener,
            elementAppendChild: Document.prototype.appendChild,
            elementAttachShadow: Element.prototype.attachShadow,
            elementSetAttribute: Element.prototype.setAttribute,
            documentCreateElement: Document.prototype.createElement,
        };

        document.body.appendChild(element);
        await Promise.resolve();

        nativeComponent = <CardPaymentMethodApi & HTMLElement>(
            querySelector('commerce_unified_checkout-card-payment-method')
        );
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    describe('elements', () => {
        it('should present payment component', async () => {
            await Promise.resolve();
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            expect(paymentElement).toBeTruthy();
        });

        it('should present payment component header by default', async () => {
            await Promise.resolve();
            const paymentHeader = <Payment & HTMLElement>querySelector('[data-card-payment-header]');
            expect(paymentHeader).toBeTruthy();
        });

        it('should present billing address component', async () => {
            await Promise.resolve();
            const billingAddressElement = <BillingAddressGroup & HTMLElement>(
                querySelector('[data-billing-address-group]')
            );
            expect(billingAddressElement).toBeTruthy();
        });
    });

    describe('checkoutmode', () => {
        it('should set all checkout modes correctly', () => {
            [
                CheckoutMode.FUTURE,
                CheckoutMode.EDIT,
                CheckoutMode.SUMMARY,
                CheckoutMode.DISABLED,
                CheckoutMode.STENCIL,
            ].forEach((mode) => {
                element.checkoutMode = mode;
                expect(element.checkoutMode).toEqual(mode);
            });
        });
    });
    describe('form validation', () => {
        beforeEach(() => {
            jest.spyOn(nativeComponent, 'tokenizePaymentMethod').mockImplementation(() =>
                Promise.resolve({
                    token: 'mockpaymenttoken',
                    errors: [],
                })
            );
        });

        it('should not proceed the api call when payment form input is invalid', async () => {
            await Promise.resolve();
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            paymentElement.reportValidity = (): boolean => false;
            await expect(element.checkoutSave()).rejects.toThrow('Required data is missing');
        });

        it('should not proceed the api call when using billing address and the form is invalid', async () => {
            await Promise.resolve();
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');

            const billingAsShippingAddressCheckbox = <BillingAddressGroup & HTMLElement>(
                querySelector('[data-use-same-shipping-address]')
            );

            const billingAddressInputform = <BillingAddressGroup & HTMLElement>(
                querySelector('[data-billing-input-address]')
            );

            // @ts-ignore
            billingAsShippingAddressCheckbox.checked = false;
            billingAsShippingAddressCheckbox.dispatchEvent(new CustomEvent('change'));
            paymentElement.reportValidity = (): boolean => true;
            billingAddressInputform.reportValidity = (): boolean => false;
            await Promise.resolve();
            await expect(element.checkoutSave()).rejects.toThrow('Required data is missing');
        });
    });
    describe('display api error', () => {
        beforeEach(() => {
            mockedPlaceOrder.mockImplementation(() => {
                return Promise.reject({ ok: false });
            });

            jest.spyOn(nativeComponent, 'tokenizePaymentMethod').mockImplementation(() =>
                Promise.resolve({
                    token: 'mockpaymenttoken',
                    errors: [],
                })
            );
        });

        it('should show error and not proceed when payment component completePayment API throws a PaymentAuthorizationError', async () => {
            const paymentAuthorizationError = new PaymentAuthorizationError({
                detail: 'Your payment was not accepted.  Please try another form of payment',
                title: 'Your payment was not accepted.  Please try another form of payment',
                instance: '',
                type: '/commerce/errors/payment-failure',
            });
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            paymentElement.completePayment = jest.fn().mockRejectedValue(paymentAuthorizationError);
            paymentElement.reportValidity = (): boolean => true;

            await expect(element.checkoutSave()).rejects.toEqual(paymentAuthorizationError);
            expect(placeOrder).not.toHaveBeenCalled();
            expect(element.isError).toBeTruthy();
            expect(generateErrorLabel).toHaveBeenCalledWith(null, {
                body: 'B2C_Lite_Checkout.paymentErrorBody',
                header: 'B2C_Lite_Checkout.genericErrorHeader',
            });
        });

        it('should show error and not proceed when place order API throws an error', async () => {
            await Promise.resolve();
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            paymentElement.reportValidity = (): boolean => true;
            expect(element.isError).toBeFalsy();
            await expect(element.checkoutSave()).rejects.toEqual({ ok: false });
            expect(placeOrder).toHaveBeenCalledTimes(1);
            expect(element.isError).toBeTruthy();
            expect(generateErrorLabel).toHaveBeenCalledWith(
                { ok: false },
                {
                    body: 'B2C_Lite_Checkout.paymentErrorBody',
                    header: 'B2C_Lite_Checkout.genericErrorHeader',
                }
            );
        });
    });
    describe('placing order as a guest', () => {
        beforeEach(() => {
            mockedPlaceOrder.mockImplementation(() => {
                return Promise.resolve({ orderReferenceNumber: 'orderReferenceNumber', errors: [] });
            });

            jest.spyOn(nativeComponent, 'tokenizePaymentMethod').mockImplementation(() =>
                Promise.resolve({
                    token: 'mockpaymenttoken',
                    errors: [],
                })
            );
        });

        it('should place order when using the same shipping address for billing', async () => {
            await Promise.resolve();
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            paymentElement.reportValidity = (): boolean => true;
            await element.checkoutSave();
            expect(placeOrder).toHaveBeenCalledTimes(1);
            expect(updateContactInformation).toHaveBeenCalledTimes(0); // contactinfo unchanged
        });

        it('should call updateContactInfomation with empty name, and old email and phone#', async () => {
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    deliveryGroups: { items: [{ deliveryAddress: defaultAddresses[1] }] },
                },
            });
            await Promise.resolve();
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            const contactInfo = {
                firstName: '',
                lastName: '',
                email: 'test@gmail.com',
                phoneNumber: '99999999',
            };
            paymentElement.reportValidity = (): boolean => true;
            await element.checkoutSave();
            expect(placeOrder).toHaveBeenCalledTimes(1);
            expect(updateContactInformation).toHaveBeenCalledWith(contactInfo);
        });

        it('should place order when using new billing address', async () => {
            await Promise.resolve();
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            const billingAsShippingAddressCheckbox = <BillingAddressGroup & HTMLElement>(
                querySelector('[data-use-same-shipping-address]')
            );
            const billingAddressInputform = <BillingAddressGroup & HTMLElement>(
                querySelector('[data-billing-input-address]')
            );

            // @ts-ignore
            billingAsShippingAddressCheckbox.checked = false;
            billingAsShippingAddressCheckbox.dispatchEvent(new CustomEvent('change'));
            paymentElement.reportValidity = (): boolean => true;
            billingAddressInputform.reportValidity = (): boolean => true;
            await Promise.resolve();
            await element.checkoutSave();
            expect(placeOrder).toHaveBeenCalledTimes(1);
        });

        it('should call updateContactInfomation with empty name for countries where last name comes before first name', async () => {
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    deliveryGroups: { items: [{ deliveryAddress: defaultAddresses[2] }] },
                },
            });
            await Promise.resolve();
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            const contactInfo = {
                firstName: '',
                lastName: '',
                email: 'test@gmail.com',
                phoneNumber: '99999999',
            };
            paymentElement.reportValidity = (): boolean => true;
            await element.checkoutSave();
            expect(placeOrder).toHaveBeenCalledTimes(1);
            expect(updateContactInformation).toHaveBeenCalledWith(contactInfo);
        });

        it('should call updateContactInfomation with correct first name and last name for countries where last name comes before first name', async () => {
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    deliveryGroups: { items: [{ deliveryAddress: defaultAddresses[3] }] },
                },
            });
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            const contactInfo = {
                firstName: 'FirstName',
                lastName: 'LastName',
                email: 'test@gmail.com',
                phoneNumber: '99999999',
            };
            paymentElement.reportValidity = (): boolean => true;
            await element.checkoutSave();
            expect(placeOrder).toHaveBeenCalledTimes(1);
            expect(updateContactInformation).toHaveBeenCalledWith(contactInfo);
        });
        it('should call updateContactInfomation with correct first name and last name from delivery address', async () => {
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    deliveryGroups: { items: [{ deliveryAddress: defaultAddresses[4] }] },
                },
            });
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            const contactInfo = {
                firstName: 'First',
                lastName: 'Last',
                email: 'test@gmail.com',
                phoneNumber: '99999999',
            };
            paymentElement.reportValidity = (): boolean => true;
            await element.checkoutSave();
            expect(placeOrder).toHaveBeenCalledTimes(1);
            expect(updateContactInformation).toHaveBeenCalledWith(contactInfo);
        });
    });

    describe('placing order as a authenticated user', () => {
        beforeEach(() => {
            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: true },
            });

            mockedPlaceOrder.mockImplementation(() => {
                return Promise.resolve({ orderReferenceNumber: 'orderReferenceNumber', errors: [] });
            });

            jest.spyOn(nativeComponent, 'tokenizePaymentMethod').mockImplementation(() =>
                Promise.resolve({
                    token: 'mockpaymenttoken',
                    errors: [],
                })
            );
        });

        it('should place order when using the same shipping address for billing', async () => {
            await Promise.resolve();
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            paymentElement.reportValidity = (): boolean => true;
            await element.checkoutSave();
            expect(placeOrder).toHaveBeenCalledTimes(1);
            expect(updateContactInformation).toHaveBeenCalledTimes(0);
        });

        it('should place order when using new billing address', async () => {
            await Promise.resolve();
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            const billingAsShippingAddressCheckbox = <BillingAddressGroup & HTMLElement>(
                querySelector('[data-use-same-shipping-address]')
            );
            const billingAddressInputform = <BillingAddressGroup & HTMLElement>(
                querySelector('[data-billing-input-address]')
            );

            // @ts-ignore
            billingAsShippingAddressCheckbox.checked = false;
            billingAsShippingAddressCheckbox.dispatchEvent(new CustomEvent('change'));
            paymentElement.reportValidity = (): boolean => true;
            billingAddressInputform.reportValidity = (): boolean => true;
            await Promise.resolve();
            await element.checkoutSave();
            expect(placeOrder).toHaveBeenCalledTimes(1);
            expect(updateContactInformation).toHaveBeenCalledTimes(0);
        });
    });
    describe('one page layout place order', () => {
        beforeEach(() => {
            mockedPlaceOrder.mockImplementation(() => {
                return Promise.resolve({ orderReferenceNumber: 'orderReferenceNumber', errors: [] });
            });

            jest.spyOn(nativeComponent, 'tokenizePaymentMethod').mockImplementation(() =>
                Promise.resolve({
                    token: 'mockpaymenttoken',
                    errors: [],
                })
            );
        });
        it('should place order when place order api is getting called', async () => {
            await Promise.resolve();
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            paymentElement.reportValidity = (): boolean => true;
            await element.placeOrder();
            expect(element.reportValidity()).toBe(true);
            expect(placeOrder).toHaveBeenCalledTimes(1);
        });
    });

    describe('navigation', () => {
        beforeEach(() => {
            jest.spyOn(nativeComponent, 'tokenizePaymentMethod').mockImplementation(() =>
                Promise.resolve({
                    token: 'mockpaymenttoken',
                    errors: [],
                })
            );
        });

        it('should navigate to the order confomation page when the placing order is completed', async () => {
            mockedPlaceOrder.mockImplementation(() => {
                return Promise.resolve({ orderReferenceNumber: 'orderReferenceNumber', errors: [] });
            });

            await Promise.resolve();
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            paymentElement.reportValidity = (): boolean => true;
            await element.checkoutSave();
            expect(navigate).toHaveBeenCalledWith(undefined, orderConfirmationPageRef);
        });

        it('should not navigate to the order confomation page when the orderReferenceNumber is missing', async () => {
            mockedPlaceOrder.mockImplementation(() => {
                return Promise.resolve({ orderReferenceNumber: '', errors: [] });
            });

            await Promise.resolve();
            const paymentElement = <Payment & HTMLElement>querySelector('[data-payment-component]');
            paymentElement.reportValidity = (): boolean => true;
            await expect(element.checkoutSave()).rejects.toThrow('Required orderReferenceNumber is missing');
            expect(navigate).toHaveBeenCalledTimes(0);
        });
    });
});
