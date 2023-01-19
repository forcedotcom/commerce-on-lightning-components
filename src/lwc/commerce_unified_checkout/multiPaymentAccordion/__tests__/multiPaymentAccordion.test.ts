import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import MultiPaymentAccordion from '../multiPaymentAccordion';
import { InternalContextAdapter } from 'commerce/context';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { CheckoutInformationAdapter, placeOrder, simplePurchaseOrderPayment } from 'commerce/checkoutApi';
import type { CheckoutStep, OrderConfirmation, PaymentAuthorizationResponse } from 'types/unified_checkout';

import { querySelector, querySelectorAll } from 'kagekiri';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import type MultiPaymentAccordionSection from '../../multiPaymentAccordionSection/multiPaymentAccordionSection';

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

const getPaymentComponent = async (): Promise<CheckoutStep> => {
    await Promise.resolve();
    const section = <MultiPaymentAccordionSection & HTMLElement>(
        querySelector('[data-accordion-section-key="credit-card"]')
    );
    const paymentComponent = section.paymentComponent;
    jest.spyOn(paymentComponent, 'placeOrder').mockImplementation(() =>
        Promise.resolve({
            orderReferenceNumber: 'orderReferenceNumber',
            errors: [],
        })
    );

    section.dispatchEvent(
        new CustomEvent('sectionselected', {
            detail: {
                name: 'credit-card',
            },
            bubbles: true,
            composed: true,
        })
    );
    await Promise.resolve();
    return paymentComponent;
};

describe('commerce_unified_checkout/purchaseOrder', () => {
    let element: HTMLElement & MultiPaymentAccordion;

    beforeEach(async () => {
        element = createElement('commerce_unified_checkout-multi-payment-accordion', {
            is: MultiPaymentAccordion,
        });

        element.cardPaymentLabel = 'Credit Card';
        element.headerLabel = 'Purchase Order';
        element.inputLabel = 'Purchase Order Number';
        element.placeholderLabel = '';
        element.requireBillingAddress = true;

        element.showBillingAddressHeading = true;
        element.billingAddressFieldsetLegendLabel = 'Billing Address';
        element.billingAddressSameAsShippingAddressLabel = 'My billing address is the same as my shipping address';

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

    //TODO(s.hussain): test skipped till it is figured out why it is failing and fixed as part of W-11932841
    it.skip('is accessible', async () => {
        await expect(element).toBeAccessible();
    });

    describe('elements', () => {
        it('should present two accordion section elements', () => {
            const accordionSectionElements = querySelectorAll('[data-accordion-section]');
            expect(accordionSectionElements).toHaveLength(2);
        });

        it('should expand first accordion section', () => {
            const firstSection = querySelectorAll('[data-accordion-section]')[0];
            const content = firstSection.shadowRoot?.querySelector('[data-accordion-section-content="credit-card"]');
            expect(content).toBeTruthy();
        });

        it('should present credit card payment element', () => {
            const creditCardSection = <MultiPaymentAccordionSection & HTMLElement>(
                querySelector('[data-accordion-section-key="credit-card"]')
            );
            expect(creditCardSection).toBeTruthy();
        });

        it('should present purchase order element', () => {
            const purchaseOrderSection = <MultiPaymentAccordionSection & HTMLElement>(
                querySelector('[data-accordion-section-key="purchase-order"]')
            );
            expect(purchaseOrderSection).toBeTruthy();
        });
    });

    describe('select section', () => {
        it('should pass selected section to all section components', async () => {
            const creditCardSection = <MultiPaymentAccordionSection & HTMLElement>(
                querySelector('[data-accordion-section-key="credit-card"]')
            );

            creditCardSection.dispatchEvent(
                new CustomEvent('sectionselected', {
                    detail: {
                        name: 'credit-card',
                    },
                    bubbles: true,
                    composed: true,
                })
            );
            await Promise.resolve();
            expect(creditCardSection.isExpanded).toBe(true);
        });
    });

    describe('placing order as a authenticated user', () => {
        beforeEach(() => {
            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: true },
            });
        });

        it('should trigger place order action of the selected section', async () => {
            const paymentComponent = await getPaymentComponent();
            await element.checkoutSave();
            expect(paymentComponent.placeOrder).toHaveBeenCalled();
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

    describe('one page layout place order', () => {
        beforeEach(() => {
            mockedPlaceOrder.mockImplementation(() => {
                return Promise.resolve({ orderReferenceNumber: 'orderReferenceNumber', errors: [] });
            });
            mockedSimplePurchaseOrderPayment.mockImplementation(() => {
                return Promise.resolve({ salesforceResultCode: 'Success', errors: [] });
            });
        });
        it('should trigger place order action of the selected section', async () => {
            const paymentComponent = await getPaymentComponent();
            await element.placeOrder();
            expect(paymentComponent.placeOrder).toHaveBeenCalled();
        });
    });

    describe('expand all in builder mode', () => {
        it('should expand all steps even without a section selected', async () => {
            const section = <MultiPaymentAccordionSection & HTMLElement>(
                querySelector('[data-accordion-section-key="credit-card"]')
            );
            section.dispatchEvent(
                new CustomEvent('sectionselected', {
                    detail: {
                        name: 'none',
                    },
                    bubbles: true,
                    composed: true,
                })
            );
            await Promise.resolve();
            await Promise.resolve();
            const sections = <MultiPaymentAccordionSection[] & HTMLElement[]>(
                (<unknown>querySelectorAll('data-accordion-section'))
            );
            await Promise.resolve();
            sections.forEach((s) => {
                expect(s.isExpanded).toBe(true);
            });
        });
    });
});
