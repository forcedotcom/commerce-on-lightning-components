import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import BillingAddressGroup from 'commerce_unified_checkout/billingAddressGroup';
import { SessionContextAdapter } from 'commerce/contextApi';
import { CheckoutInformationAdapter } from 'commerce/checkoutApi';
import type Input from 'lightning/input';
import type InputAddress from 'commerce_unified_checkout/inputAddress';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        SessionContextAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock('commerce/checkoutApi', () => {
    return Object.assign({}, jest.requireActual('commerce/checkoutApi'), {
        CheckoutInformationAdapter: mockCreateTestWireAdapter(),
    });
});

const defaultAddresses = [
    {
        isDefault: true,
        name: 'Jane Doe',
        street: '123 Broadway',
        city: 'New York',
        postalCode: '11000',
        region: 'NY',
        country: 'US',
    },
    {
        isDefault: false,
        name: 'John Doe',
        street: '5 Wall Street',
        city: 'Burlington',
        postalCode: '01803',
        region: 'MA',
        country: 'US',
    },
];

describe('billing address group component', () => {
    let element: HTMLElement & BillingAddressGroup;

    beforeEach(() => {
        element = createElement('commerce_unified_checkout-billing-address-group', {
            is: BillingAddressGroup,
        });

        element.builderMode = false;
        element.labelSameAsShippingOption = 'Same as shipping address';
        element.phoneNumberLabel = 'phoneNumberLabel';

        (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
            data: { isLoggedIn: true },
        });

        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                deliveryGroups: { items: [{ deliveryAddress: defaultAddresses[0] }] },
            },
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    describe('elements', () => {
        it('should present the use same as shipping address checkbox', async () => {
            await Promise.resolve();
            const useSameAddressCheckbox = <HTMLElement & Input>(
                element.querySelector('[data-use-same-shipping-address]')
            );
            expect(useSameAddressCheckbox).toBeTruthy();
            expect(useSameAddressCheckbox.checked).toBeTruthy();
        });

        it('should set the shipping address from store delivery address when checkbox it checked', async () => {
            await Promise.resolve();
            const shippingAddress = defaultAddresses[0];
            expect(element.shippingAddress).toEqual(shippingAddress);
        });

        it('should set the phone # from store when checkbox is checked as a guest user', async () => {
            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: false },
            });

            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    deliveryGroups: { items: [{ deliveryAddress: defaultAddresses[0] }] },
                    contactInfo: {
                        phoneNumber: '99999999',
                    },
                },
            });
            await Promise.resolve();
            const shippingAddress = defaultAddresses[0];
            expect(element.shippingAddress).toEqual(shippingAddress);
            const billingAddressform = <HTMLElement & InputAddress>(
                element.querySelector('[data-billing-input-address]')
            );
            expect(billingAddressform.contactInfo.phoneNumber).toBe('99999999');
        });

        it('should set the phone # as empty string when there is no data in the store', async () => {
            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: false },
            });

            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {},
            });
            await Promise.resolve();

            const billingAddressform = <HTMLElement & InputAddress>(
                element.querySelector('[data-billing-input-address]')
            );
            expect(billingAddressform.contactInfo.phoneNumber).toBe('');
        });

        it('should show billing address form if when the checkbox is unchecked', async () => {
            await Promise.resolve();
            const useSameAddressCheckbox = <HTMLElement & Input>(
                element.querySelector('[data-use-same-shipping-address]')
            );
            useSameAddressCheckbox.checked = false;
            const billingAddressform = <HTMLElement & InputAddress>(
                element.querySelector('[data-billing-input-address]')
            );
            expect(billingAddressform).toBeTruthy();
        });

        it('should should set the billing address when the checkbox is unchecked', async () => {
            await Promise.resolve();
            const useSameAddressCheckbox = <HTMLElement & Input>(
                element.querySelector('[data-use-same-shipping-address]')
            );
            const billingAddressform = <HTMLElement & InputAddress>(
                element.querySelector('[data-billing-input-address]')
            );
            const setAddress = {
                isDefault: true,
                firstName: 'Jane',
                lastName: 'Doe',
                street: '123 Broadway',
                city: 'New York',
                postalCode: '11000',
                region: 'NY',
                country: 'US',
            };
            const resultAddress = {
                isDefault: true,
                firstName: 'Jane',
                lastName: 'Doe',
                street: '123 Broadway',
                city: 'New York',
                postalCode: '11000',
                region: 'NY',
                country: 'US',
            };
            useSameAddressCheckbox.checked = false;
            billingAddressform.address = setAddress;
            useSameAddressCheckbox.dispatchEvent(new CustomEvent('change'));
            expect(element.billingAddressComponent.address).toEqual(resultAddress);
        });
        it('should get the shipping address when set the value', async () => {
            await Promise.resolve();
            element.shippingAddress = defaultAddresses[0];
            expect(element.shippingAddress).toEqual(defaultAddresses[0]);
        });
        it('should get the billing address when set the value', async () => {
            await Promise.resolve();
            const setAddress = {
                isDefault: true,
                firstName: 'Jane',
                lastName: 'Doe',
                street: '123 Broadway',
                city: 'New York',
                postalCode: '11000',
                region: 'NY',
                country: 'US',
            };
            const resultAddress = {
                isDefault: true,
                firstName: 'Jane',
                lastName: 'Doe',
                street: '123 Broadway',
                city: 'New York',
                postalCode: '11000',
                region: 'NY',
                country: 'US',
            };
            element.billingAddress = setAddress;
            const billingAddressform = <HTMLElement & InputAddress>(
                element.querySelector('[data-billing-input-address]')
            );
            billingAddressform.address = setAddress;
            expect(element.billingAddress).toEqual(resultAddress);
        });

        it('should hide the billing address form when the checkbox is checked', async () => {
            await Promise.resolve();
            const useSameAddressCheckbox = <HTMLElement & Input>(
                element.querySelector('[data-use-same-shipping-address]')
            );
            useSameAddressCheckbox.click();
            await Promise.resolve();
            const div = <HTMLElement>element.querySelector('commerce_unified_checkout-input-address')?.parentElement;
            expect(div.classList.contains('slds-hide')).toBeTruthy();
        });

        it('should show billing address heading when enabled', async () => {
            const BILLING_ADDRESS = 'Billing Address';
            element.showBillingAddressHeading = true;
            element.billingAddressHeadingLabel = BILLING_ADDRESS;

            await Promise.resolve();
            const heading = <HTMLElement>element.querySelector('h3');
            expect(heading.textContent).toEqual(BILLING_ADDRESS);
        });

        it('should not show billing address heading when disabled', async () => {
            element.showBillingAddressHeading = false;

            await Promise.resolve();
            const heading = <HTMLElement>element.querySelector('h2');
            expect(heading).toBeFalsy();
        });
    });

    describe('events', () => {
        it('should dispatch "changebillingaddressoption" event when checkbox is unchecked', async () => {
            await Promise.resolve();
            const useSameAddressCheckbox = <HTMLElement & Input>(
                element.querySelector('[data-use-same-shipping-address]')
            );
            let dispatched = false;
            element.addEventListener('changebillingaddressoption', () => {
                dispatched = true;
            });
            useSameAddressCheckbox.dispatchEvent(new CustomEvent('change'));
            expect(dispatched).toBe(true);
        });
        it('should dispatch "change" event when address changes and set billing address', async () => {
            await Promise.resolve();
            const billingAddressform = <HTMLElement & InputAddress>(
                element.querySelector('[data-billing-input-address]')
            );
            const setAddress = {
                isDefault: true,
                firstName: 'Jane',
                lastName: 'Doe',
                street: '123 Broadway',
                city: 'New York',
                postalCode: '11000',
                region: 'NY',
                country: 'US',
            };
            const resultAddress = {
                isDefault: true,
                firstName: 'Jane',
                lastName: 'Doe',
                street: '123 Broadway',
                city: 'New York',
                postalCode: '11000',
                region: 'NY',
                country: 'US',
            };

            let dispatched = false;
            billingAddressform.addEventListener('change', () => {
                dispatched = true;
            });

            billingAddressform.address = setAddress;
            billingAddressform.dispatchEvent(new CustomEvent('change'));
            expect(element.billingAddress).toEqual(resultAddress);
            expect(dispatched).toBe(true);
        });
    });

    describe('focus', () => {
        it('should call focus on the checkbox', async () => {
            await Promise.resolve();
            const useSameAddressCheckbox = <HTMLElement & Input>(
                element.querySelector('[data-use-same-shipping-address]')
            );
            jest.spyOn(useSameAddressCheckbox, 'focus');
            element.focus();
            expect(useSameAddressCheckbox.focus).toHaveBeenCalled();
        });
    });

    describe('validation', () => {
        it('should reportValidity return trun when checkbox is checked', async () => {
            await Promise.resolve();
            const useSameAddressCheckbox = <HTMLElement & Input>(
                element.querySelector('[data-use-same-shipping-address]')
            );
            useSameAddressCheckbox.checked = true;
            const isValid = element.reportValidity();
            expect(isValid).toBe(true);
        });

        it('should return false when reportValidity is called and address form is missing reqiure fields', () => {
            const useSameAddressCheckbox = <HTMLElement & Input>(
                element.querySelector('[data-use-same-shipping-address]')
            );
            const billingAddressform = <HTMLElement & InputAddress>(
                element.querySelector('[data-billing-input-address]')
            );
            useSameAddressCheckbox.checked = false;
            jest.spyOn(billingAddressform, 'reportValidity').mockReturnValue(false);
            const isValid = element.reportValidity();
            expect(isValid).toBe(false);
        });
    });
});
