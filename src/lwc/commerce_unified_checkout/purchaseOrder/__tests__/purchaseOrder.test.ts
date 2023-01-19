import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import PurchaseOrder from '../purchaseOrder';
import type BillingAddressGroup from 'commerce_unified_checkout/billingAddressGroup';
import { InternalContextAdapter } from 'commerce/context';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { CheckoutInformationAdapter, placeOrder, simplePurchaseOrderPayment } from 'commerce/checkoutApi';

import type { OrderConfirmation, PaymentAuthorizationResponse } from 'types/unified_checkout';

import { querySelector } from 'kagekiri';
import { navigate } from 'lightning/navigation';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import { PaymentAuthorizationError } from 'commerce_unified_checkout/paymentAuthorizationError';

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
        placeOrder: jest.fn(),
        simplePurchaseOrderPayment: jest.fn(),
        CheckoutInformationAdapter: mockCreateTestWireAdapter(),
    });
});

const mockedPlaceOrder = placeOrder as jest.Mock<Promise<OrderConfirmation>>;
const mockedSimplePurchaseOrderPayment = simplePurchaseOrderPayment as jest.Mock<Promise<PaymentAuthorizationResponse>>;

jest.mock(
    '@app/csrfToken',
    () => {
        return { default: 'csrftoken' };
    },
    { virtual: true }
);

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

describe('commerce_unified_checkout/purchaseOrder', () => {
    let element: HTMLElement & PurchaseOrder;

    beforeEach(async () => {
        element = createElement('commerce_unified_checkout-purchase-order', {
            is: PurchaseOrder,
        });

        element.builderMode = false;
        element.billingAddressFieldsetLegendLabel = 'Billing Address';
        element.billingAddressSameAsShippingAddressLabel = 'My billing address is the same as my shipping address';
        element.headerLabel = 'headerLabel';
        element.inputLabel = 'inputLabel';
        element.placeholderLabel = 'placeholderLabel';

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
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    describe('elements', () => {
        it('should present purchase order element', async () => {
            await Promise.resolve();
            const purchaseOrderInput = <HTMLInputElement>querySelector('[data-purchase-order-input]');
            expect(purchaseOrderInput).toBeTruthy();
        });

        it('should present billing address component', async () => {
            await Promise.resolve();
            const billingAddressElement = <BillingAddressGroup & HTMLElement>(
                querySelector('[data-billing-address-group]')
            );
            expect(billingAddressElement).toBeTruthy();
        });

        it('should not present billing address component when requireBillingAddress is false', async () => {
            element.requireBillingAddress = false;
            await Promise.resolve();
            const billingAddressElement = <BillingAddressGroup & HTMLElement>(
                querySelector('[data-billing-address-group]')
            );
            expect(billingAddressElement).toBeFalsy();
        });

        it('should show the heading', async () => {
            element.hideHeading = false;
            await Promise.resolve();
            const heading = <HTMLElement>querySelector('[data-heading]');
            expect(heading).toBeTruthy();
        });

        it('should hide the heading', async () => {
            element.hideHeading = true;
            await Promise.resolve();
            const heading = <HTMLElement>querySelector('[data-heading]');
            expect(heading).not.toBeTruthy();
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
            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: true },
            });

            mockedPlaceOrder.mockImplementation(() => {
                return Promise.resolve({ orderReferenceNumber: 'orderReferenceNumber', errors: [] });
            });

            mockedSimplePurchaseOrderPayment.mockImplementation(() => {
                return Promise.resolve({ salesforceResultCode: 'Success', errors: [] });
            });
        });

        it('should not proceed the api call when purchase order input is invalid', async () => {
            await Promise.resolve();
            const purchaseOrderInput = <HTMLInputElement>querySelector('[data-purchase-order-input]');
            purchaseOrderInput.reportValidity = (): boolean => false;
            await expect(element.checkoutSave()).rejects.toThrow('Required data is missing');
        });

        it('should not proceed the api call when using billing address and the form is invalid', async () => {
            await Promise.resolve();
            const purchaseOrderInput = <HTMLInputElement>querySelector('[data-purchase-order-input]');

            const billingAsShippingAddressCheckbox = <BillingAddressGroup & HTMLElement>(
                querySelector('[data-use-same-shipping-address]')
            );

            const billingAddressInputform = <BillingAddressGroup & HTMLElement>(
                querySelector('[data-billing-input-address]')
            );

            // @ts-ignore
            billingAsShippingAddressCheckbox.checked = false;
            billingAsShippingAddressCheckbox.dispatchEvent(new CustomEvent('change'));
            purchaseOrderInput.reportValidity = (): boolean => true;
            billingAddressInputform.reportValidity = (): boolean => false;
            await Promise.resolve();
            await expect(element.checkoutSave()).rejects.toThrow('Required data is missing');
        });

        it('should place order when requireBillingAddress is false', async () => {
            element.requireBillingAddress = false;
            await Promise.resolve();
            const purchaseOrderInput = <HTMLInputElement>querySelector('[data-purchase-order-input]');
            purchaseOrderInput.reportValidity = (): boolean => true;
            await element.checkoutSave();
            expect(placeOrder).toHaveBeenCalledTimes(1);
        });
    });
    describe('display api error', () => {
        beforeEach(() => {
            mockedPlaceOrder.mockImplementation(() => {
                return Promise.reject({ ok: false });
            });
            mockedSimplePurchaseOrderPayment.mockImplementation(() => {
                return Promise.resolve({ salesforceResultCode: 'Success', errors: [] });
            });
        });

        it('should show error and not proceed when place order API throws an error', async () => {
            await Promise.resolve();
            const purchaseOrderInput = <HTMLInputElement>querySelector('[data-purchase-order-input]');
            purchaseOrderInput.reportValidity = (): boolean => true;
            expect(element.isError).toBeFalsy();
            await expect(element.checkoutSave()).rejects.toEqual({ ok: false });
            expect(placeOrder).toHaveBeenCalledTimes(1);
            expect(element.isError).toBeTruthy();
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
            mockedSimplePurchaseOrderPayment.mockImplementation(() => {
                return Promise.resolve({ salesforceResultCode: 'Success', errors: [] });
            });
        });

        it('should place order when using the same shipping address for billing', async () => {
            await Promise.resolve();
            const purchaseOrderInput = <HTMLInputElement>querySelector('[data-purchase-order-input]');
            purchaseOrderInput.reportValidity = (): boolean => true;
            await element.checkoutSave();
            expect(placeOrder).toHaveBeenCalledTimes(1);
        });

        it('should place order when using new billing address', async () => {
            await Promise.resolve();
            const purchaseOrderInput = <HTMLInputElement>querySelector('[data-purchase-order-input]');
            const billingAsShippingAddressCheckbox = <BillingAddressGroup & HTMLElement>(
                querySelector('[data-use-same-shipping-address]')
            );
            const billingAddressInputform = <BillingAddressGroup & HTMLElement>(
                querySelector('[data-billing-input-address]')
            );

            // @ts-ignore
            billingAsShippingAddressCheckbox.checked = false;
            billingAsShippingAddressCheckbox.dispatchEvent(new CustomEvent('change'));
            purchaseOrderInput.reportValidity = (): boolean => true;
            billingAddressInputform.reportValidity = (): boolean => true;
            await Promise.resolve();
            await element.checkoutSave();
            expect(placeOrder).toHaveBeenCalledTimes(1);
        });
    });

    describe('one page layout place order', () => {
        beforeEach(() => {
            mockedPlaceOrder.mockImplementation(() => {
                return Promise.resolve({ orderReferenceNumber: 'orderReferenceNumber', errors: [] });
            });
            mockedSimplePurchaseOrderPayment.mockImplementation(() => {
                return Promise.resolve({ salesforceResultCode: 'Success', errors: [] });
            });
        });
        it('should place order when place order api is getting called', async () => {
            await Promise.resolve();
            const purchaseOrderInput = <HTMLInputElement>querySelector('[data-purchase-order-input]');
            purchaseOrderInput.reportValidity = (): boolean => true;
            await element.placeOrder();
            expect(placeOrder).toHaveBeenCalledTimes(1);
        });
    });

    describe('navigation', () => {
        beforeEach(() => {
            mockedPlaceOrder.mockImplementation(() => {
                return Promise.resolve({ orderReferenceNumber: 'orderReferenceNumber', errors: [] });
            });
            mockedSimplePurchaseOrderPayment.mockImplementation(() => {
                return Promise.resolve({ salesforceResultCode: 'Success', errors: [] });
            });
        });

        it('should navigate to the order confomation page when the placing order is completed', async () => {
            await Promise.resolve();
            const purchaseOrderInput = <HTMLInputElement>querySelector('[data-purchase-order-input]');
            purchaseOrderInput.reportValidity = (): boolean => true;
            await element.checkoutSave();
            expect(navigate).toHaveBeenCalledWith(undefined, orderConfirmationPageRef);
        });

        it('should not navigate to the order confomation page when the orderReferenceNumber is missing', async () => {
            mockedPlaceOrder.mockImplementation(() => {
                return Promise.resolve({ orderReferenceNumber: '', errors: [] });
            });

            await Promise.resolve();
            const purchaseOrderInput = <HTMLInputElement>querySelector('[data-purchase-order-input]');
            purchaseOrderInput.reportValidity = (): boolean => true;
            await expect(element.checkoutSave()).rejects.toThrow('Required orderReferenceNumber is missing');
            expect(navigate).toHaveBeenCalledTimes(0);
        });
    });

    describe('failed Purchase Order', () => {
        beforeEach(() => {
            mockedPlaceOrder.mockImplementation(() => {
                return Promise.resolve({ orderReferenceNumber: 'orderReferenceNumber', errors: [] });
            });
            mockedSimplePurchaseOrderPayment.mockImplementation(() => {
                return Promise.reject({
                    errors: [
                        {
                            title: 'Purchase Order Failure',
                            instance: 'test01',
                            detail: 'We are unable to process your payment at this time.  Please try back later.',
                            type: '/commerce/errors/payment-failure',
                        },
                    ],
                });
            });
        });

        it('When called completePayment an API error in simplePurchaseOrderPayment results in error', async () => {
            await expect(element.completePayment()).rejects.toEqual(
                new PaymentAuthorizationError({
                    title: 'Purchase Order Failure',
                    instance: 'test01',
                    detail: 'We are unable to process your payment at this time.  Please try back later.',
                    type: '/commerce/errors/payment-failure',
                })
            );
        });

        it('When called checkoutSave an API error in simplePurchaseOrderPayment results in error', async () => {
            const purchaseOrderInput = <HTMLInputElement>querySelector('[data-purchase-order-input]');
            purchaseOrderInput.reportValidity = (): boolean => true;
            await expect(element.checkoutSave()).rejects.toEqual(
                new PaymentAuthorizationError({
                    title: 'Purchase Order Failure',
                    instance: 'test01',
                    detail: 'We are unable to process your payment at this time.  Please try back later.',
                    type: '/commerce/errors/payment-failure',
                })
            );
        });
    });
});
