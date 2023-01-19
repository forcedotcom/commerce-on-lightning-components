import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import InputAddress from 'commerce_unified_checkout/inputAddress';
import { AppContextAdapter } from 'commerce/contextApi';
import type LightningButton from 'lightning/button';
import type LightningInput from 'lightning/input';
import type LightningInputAddress from 'lightning/inputAddress';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        AppContextAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock(
    '@salesforce/label/B2C_Lite_CheckoutInputAddress.provinceLabel',
    () => {
        return {
            default: 'State/Province',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/B2C_Lite_CheckoutInputAddress.postalCodeLabel',
    () => {
        return {
            default: 'ZIP/Postal Code',
        };
    },
    { virtual: true }
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

describe('input address', () => {
    let element: HTMLElement & InputAddress;

    beforeEach(() => {
        element = createElement('commerce_unified_checkout-input-address', {
            is: InputAddress,
        });

        element.makeDefaultAddressLabel = 'makeDefaultAddressLabel';
        element.phoneNumberLabel = 'phoneNumberLabel';

        (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
            data: { shippingCountries: ['US'] },
        });

        element.showPersonName = true;
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('country and state', () => {
        it('should have country selected as Canada (CA) when appContextAdapter has CA in shippingCountries', () => {
            (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
                data: { shippingCountries: ['CA'] },
            });
            expect(element.country).toBe('CA');
        });
        it('should have country selected as the one passed into the component from any parent component', () => {
            (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
                data: { shippingCountries: ['US', 'CA', 'MX'] },
            });
            element.country = 'MX';
            expect(element.country).toBe('MX');
        });
        it('should have first country selected when appContextAdapter has multiple in shippingCountries', () => {
            (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
                data: { shippingCountries: ['MX', 'CA', 'JP'] },
            });
            expect(element.country).toBe('MX');
        });
    });

    describe('events', () => {
        it('should not dispatch "addresschanged" events when change on input and any of other fields is invalid', () => {
            let dispatched = false;
            element.addEventListener('addresschanged', () => {
                dispatched = true;
            });

            const firstInput = <HTMLElement & LightningInput>element.querySelector('[data-firstname-field]');
            const lastInput = <HTMLElement & LightningInput>element.querySelector('[data-lastname-field]');
            lastInput.checkValidity = (): boolean => false;
            firstInput.value = 'first1';
            firstInput.dispatchEvent(new CustomEvent('commit'));
            expect(dispatched).toBe(false);
        });

        it('should dispatch "addresschanged" events when first and last name changes on input and other fields are valid', () => {
            let dispatched = false;
            element.addEventListener('addresschanged', () => {
                dispatched = true;
            });

            const firstInput = <HTMLElement & LightningInput>element.querySelector('[data-firstname-field]');
            const lastInput = <HTMLElement & LightningInput>element.querySelector('[data-lastname-field]');
            const inputAddress = <HTMLElement & LightningInputAddress>element.querySelector('[data-address-fields]');
            firstInput.checkValidity = (): boolean => true;
            lastInput.checkValidity = (): boolean => true;
            inputAddress.checkValidity = (): boolean => true;

            firstInput.value = 'first1';
            firstInput.dispatchEvent(new CustomEvent('commit'));
            expect(dispatched).toBe(true);

            dispatched = false;
            lastInput.value = 'last1';
            lastInput.dispatchEvent(new CustomEvent('commit'));
            expect(dispatched).toBe(true);
        });

        it('should dispatch "addresschanged" events when phone number changes and other fields are valid', async () => {
            element.showPhoneNumber = true;
            let dispatched = false;
            element.addEventListener('addresschanged', () => {
                dispatched = true;
            });

            await Promise.resolve();
            const firstInput = <HTMLElement & LightningInput>element.querySelector('[data-firstname-field]');
            const lastInput = <HTMLElement & LightningInput>element.querySelector('[data-lastname-field]');
            const inputAddress = <HTMLElement & LightningInputAddress>element.querySelector('[data-address-fields]');
            const phoneNumberElement = <HTMLElement & LightningInput>element.querySelector('[data-phonenumber-field]');
            firstInput.checkValidity = (): boolean => true;
            lastInput.checkValidity = (): boolean => true;
            inputAddress.checkValidity = (): boolean => true;
            phoneNumberElement.checkValidity = (): boolean => true;
            phoneNumberElement.value = '212-555-0123';
            phoneNumberElement.dispatchEvent(new CustomEvent('commit'));
            expect(dispatched).toBe(true);
        });

        it('should dispatch "addresschanged" event when mark default address changes', async () => {
            element.showDefaultAddress = true;
            let dispatched = false;
            element.addEventListener('addresschanged', () => {
                dispatched = true;
            });

            await Promise.resolve();
            const firstInput = <HTMLElement & LightningInput>element.querySelector('[data-firstname-field]');
            const lastInput = <HTMLElement & LightningInput>element.querySelector('[data-lastname-field]');
            const inputAddress = <HTMLElement & LightningInputAddress>element.querySelector('[data-address-fields]');
            const markDefaultAddress = <HTMLElement & LightningInput>(
                element.querySelector('[data-default-address-checkbox]')
            );
            firstInput.checkValidity = (): boolean => true;
            lastInput.checkValidity = (): boolean => true;
            inputAddress.checkValidity = (): boolean => true;
            markDefaultAddress.checkValidity = (): boolean => true;
            markDefaultAddress.checked = true;
            markDefaultAddress.dispatchEvent(new CustomEvent('change'));
            expect(dispatched).toBe(true);
        });
    });

    describe('focus', () => {
        it('should call focus on the first name input component for countries where first name comes before last name', () => {
            (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
                data: { shippingCountries: ['CA'] },
            });
            const inputFirstName = <HTMLElement & LightningInput>element.querySelector('[data-firstname-field]');
            let focusCalled = false;
            inputFirstName.focus = (): void => {
                focusCalled = true;
            };
            element.focus();
            expect(focusCalled).toBe(true);
        });

        it('should call focus on the last name input component for countries where last name comes before first name', () => {
            (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
                data: { shippingCountries: ['JP'] },
            });
            const inputLastName = <HTMLElement & LightningInput>element.querySelector('[data-lastname-field]');
            let focusCalled = false;
            inputLastName.focus = (): void => {
                focusCalled = true;
            };
            element.focus();
            expect(focusCalled).toBe(true);
        });

        it('should not call focus on any other input component other than the first', () => {
            const inputAddress = <HTMLElement & LightningInputAddress>element.querySelector('[data-address-fields]');
            let focusNotCalled = true;
            inputAddress.focus = (): void => {
                focusNotCalled = false;
            };
            element.focus();
            expect(focusNotCalled).toBe(true);
        });
    });

    describe('validation', () => {
        it('should return true when reportValidity called and all fields are filled', () => {
            const inputFirstName = <HTMLElement & LightningInput>element.querySelector('[data-firstname-field]');
            const inputLastName = <HTMLElement & LightningInput>element.querySelector('[data-lastname-field]');
            const inputAddress = <HTMLElement & LightningInputAddress>element.querySelector('[data-address-fields]');
            inputFirstName.reportValidity = (): boolean => true;
            inputLastName.reportValidity = (): boolean => true;
            inputAddress.reportValidity = (): boolean => true;

            const isValid = element.reportValidity();

            expect(isValid).toBe(true);
        });

        it('should return false when reportValidity is called and the first name input reports false report validity', () => {
            const inputFirstName = <HTMLElement & LightningInput>element.querySelector('[data-firstname-field]');
            const inputLastName = <HTMLElement & LightningInput>element.querySelector('[data-lastname-field]');
            const inputAddress = <HTMLElement & LightningInputAddress>element.querySelector('[data-address-fields]');
            inputFirstName.reportValidity = (): boolean => false;
            inputLastName.reportValidity = (): boolean => true;
            inputAddress.reportValidity = (): boolean => true;

            const isValid = element.reportValidity();

            expect(isValid).toBe(false);
        });

        // a functional test for this should be added instead
        it('should run reportValidity on both first last name and address when reportValidity is called', () => {
            const inputFirstName = <HTMLElement & LightningInput>element.querySelector('[data-firstname-field]');
            const inputLastName = <HTMLElement & LightningInput>element.querySelector('[data-lastname-field]');
            const inputAddress = <HTMLElement & LightningInputAddress>element.querySelector('[data-address-fields]');
            let firstNameReportValidityCalled = false;
            let lastNameReportValidityCalled = false;
            let addressReportValidityCalled = false;
            inputFirstName.reportValidity = (): boolean => {
                firstNameReportValidityCalled = true;
                return true;
            };

            inputLastName.reportValidity = (): boolean => {
                lastNameReportValidityCalled = true;
                return true;
            };

            inputAddress.reportValidity = (): boolean => {
                addressReportValidityCalled = true;
                return true;
            };

            element.reportValidity();

            expect(firstNameReportValidityCalled).toBe(true);
            expect(lastNameReportValidityCalled).toBe(true);
            expect(addressReportValidityCalled).toBe(true);
        });
    });

    it('should update the first name property when only name is provided', () => {
        element.address = {
            name: 'John Doe',
            street: '415 Mission Street',
            city: 'San Francisco',
            postalCode: '94105',
            region: '',
            country: 'US',
            isDefault: true,
        };
        expect(element.address).toEqual({
            firstName: 'John Doe',
            lastName: '',
            street: '415 Mission Street',
            city: 'San Francisco',
            postalCode: '94105',
            region: '',
            country: 'US',
            isDefault: true,
        });
    });

    it('should update the contact info property when the contact info is set', () => {
        element.contactInfo = {
            firstName: 'First',
            lastName: 'Last',
            phoneNumber: '8885550101',
        };
        expect(element.contactInfo).toEqual({
            firstName: '',
            lastName: '',
            phoneNumber: '8885550101',
        });
        expect(element.phoneNumber).toBe('8885550101');
    });

    it('should not update the contact info properties when the contact info is empty', () => {
        element.contactInfo = {};
        expect(element.contactInfo).toEqual({
            firstName: '',
            lastName: '',
            phoneNumber: '',
        });
        expect(element.phoneNumber).toBe('');
    });

    it('should update the contact info property when the phone is set', () => {
        element.phoneNumber = '8885550101';
        expect(element.contactInfo).toEqual({
            firstName: '',
            lastName: '',
            phoneNumber: '8885550101',
        });
    });

    it('should update the contact info property when the first name is set', () => {
        element.firstName = 'First';
        element.lastName = 'Last';
        expect(element.contactInfo).toEqual({
            firstName: 'First',
            lastName: 'Last',
            phoneNumber: '',
        });
    });

    it('should update the name property when first name changes on input', () => {
        const input = <HTMLElement & LightningInput>element.querySelector('[data-firstname-field]');
        element.lastName = 'Last';
        input.value = 'First';
        input.dispatchEvent(new CustomEvent('commit'));
        expect(element.firstName).toBe('First');
        expect(element.lastName).toBe('Last');
    });

    it('should update the name property when last name changes on input', () => {
        const input = <HTMLElement & LightningInput>element.querySelector('[data-lastname-field]');
        element.firstName = 'First';
        input.value = 'Last';
        input.dispatchEvent(new CustomEvent('commit'));
        expect(element.firstName).toBe('First');
        expect(element.lastName).toBe('Last');
    });

    it('should update the street when street changes', () => {
        const inputAddress = <HTMLElement & LightningInputAddress>element.querySelector('[data-address-fields]');
        inputAddress.street = '1 Main St.';
        inputAddress.dispatchEvent(new CustomEvent('change'));
        expect(element.street).toBe('1 Main St.');
    });

    it('should return the values set when getting the values and no changes have been made', () => {
        const address = {
            firstName: 'First',
            lastName: 'Last',
            street: 'Street',
            city: 'City',
            country: 'US',
            postalCode: 'PostalCode',
            province: 'ProvinceCode',
            isDefaultAddress: false,
        };

        Object.assign(element, address);

        expect({
            firstName: element.firstName,
            lastName: element.lastName,
            street: element.street,
            city: element.city,
            country: element.country,
            postalCode: element.postalCode,
            province: element.province,
            isDefaultAddress: element.isDefaultAddress,
        }).toEqual(address);
    });

    it('should use default labels', async () => {
        const inputAddress = <HTMLElement & LightningInputAddress>element.querySelector('[data-address-fields]');
        const firstNameElement = <HTMLElement & LightningInput>element.querySelector('[data-firstname-field]');
        const lastNameElement = <HTMLElement & LightningInput>element.querySelector('[data-lastname-field]');

        element.showPhoneNumber = true;

        await Promise.resolve();
        const phoneNumberElement = <HTMLElement & LightningInput>element.querySelector('[data-phonenumber-field]');
        expect(firstNameElement.label).toBe('B2C_Lite_CheckoutInputAddress.firstNameLabel');
        expect(lastNameElement.label).toBe('B2C_Lite_CheckoutInputAddress.lastNameLabel');
        expect(inputAddress.streetLabel).toBe('B2C_Lite_CheckoutInputAddress.streetLabel');
        expect(inputAddress.cityLabel).toBe('B2C_Lite_CheckoutInputAddress.cityLabel');
        expect(inputAddress.countryLabel).toBe('B2C_Lite_CheckoutInputAddress.countryLabel');
        expect(inputAddress.provinceLabel).toBe('State/Province');
        expect(inputAddress.postalCodeLabel).toBe('ZIP/Postal Code');
        expect(phoneNumberElement.label).toBe('phoneNumberLabel');
    });

    it('should show the component header when an address id exists', async () => {
        element.address = {
            name: 'John Doe',
            street: '415 Mission Street',
            city: 'San Francisco',
            postalCode: '94105',
            region: '',
            country: 'US',
            addressId: 'xyz',
            isDefault: true,
        };
        await Promise.resolve();

        // @ts-ignore
        const componentHeaderElement = element.querySelector('.address-header');
        expect(componentHeaderElement).toBeTruthy();
    });

    it('should show the first name and last name fields when showPersonName is true', () => {
        // @ts-ignore
        const firstNameElement = element.querySelector('[data-firstname-field]');
        // @ts-ignore
        const lastNameElement = element.querySelector('[data-lastname-field]');

        expect(firstNameElement).toBeTruthy();
        expect(lastNameElement).toBeTruthy();
    });

    it('should show the phone number field when showPhoneNumber is true', async () => {
        element.showPhoneNumber = true;
        await Promise.resolve();

        // @ts-ignore
        const phoneNumberElement = element.querySelector('[data-phonenumber-field]');
        expect(phoneNumberElement).toBeTruthy();
    });

    it('should show the mark default address checkbox when showDefaultAddress is true', async () => {
        element.showDefaultAddress = true;
        await Promise.resolve();

        // @ts-ignore
        const defaultAddressElement = element.querySelector('[data-default-address-checkbox]');
        expect(defaultAddressElement).toBeTruthy();
    });

    it('should show the back to list link when showBackToListLink is true', async () => {
        element.showBackToListLink = true;
        await Promise.resolve();

        // @ts-ignore
        const backToListLinkElement = element.querySelector('[data-back-to-list-link]');
        expect(backToListLinkElement).toBeTruthy();
    });

    it('should set read-only on all fields if disabled is true', async () => {
        element.disabled = true;
        await Promise.resolve();

        const firstNameElement = <HTMLElement & LightningInput>element.querySelector('[data-firstname-field]');
        const lastNameElement = <HTMLElement & LightningInput>element.querySelector('[data-lastname-field]');
        const addressElement = <HTMLElement & LightningInputAddress>element.querySelector('[data-address-fields]');

        expect(firstNameElement.readOnly).toBe(true);
        expect(lastNameElement.readOnly).toBe(true);
        expect(addressElement.readOnly).toBe(true);
    });

    it('should dispatch "closenewaddressformclick" event when back to list link is clicked', async () => {
        element.showBackToListLink = true;
        await Promise.resolve();

        let dispatched = false;
        element.addEventListener('closenewaddressformclick', () => {
            dispatched = true;
        });

        const backToListLinkElement = <HTMLElement & LightningButton>element.querySelector('[data-back-to-list-link]');
        backToListLinkElement.click();

        expect(dispatched).toBe(true);
    });

    it('should show the slds-box class when showFormBorderStyle is true', async () => {
        element.showFormBorderStyle = true;
        await Promise.resolve();

        const formDiv = element.querySelector('.slds-box');
        expect(formDiv).toBeTruthy();
    });

    it('should hide the slds-box class when showFormBorderStyle is false', async () => {
        element.showFormBorderStyle = false;
        await Promise.resolve();

        // @ts-ignore
        const formDiv = element.querySelector('.slds-box');
        expect(formDiv).toBeFalsy();
    });
});
