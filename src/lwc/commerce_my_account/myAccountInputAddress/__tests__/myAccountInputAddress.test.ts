import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import MyAccountInputAddress from 'commerce_my_account/myAccountInputAddress';
import { AppContextAdapter } from 'commerce/contextApi';
import { querySelector } from 'kagekiri';
import type { PageReference } from 'types/common';
import { createMyAccountAddress, MyAccountAddressDetailAdapter, updateMyAccountAddress } from 'commerce/myAccountApi';
import { CurrentPageReference } from 'lightning/navigation';
import type { PlatformError } from 'types/unified_checkout';

let exposedNavigationParams: PageReference | undefined;
type reportValidity = { reportValidity: () => boolean };
const address = {
    city: 'Cityville',
    country: 'Countrystan',
    addressType: 'shipping',
    isDefault: false,
    name: 'Namo Doe',
    firstName: 'Namo',
    lastName: 'Doe',
    postalCode: '12344',
    region: 'CA',
    street: '122 Boulevard Street',
};
const mockAddresses = [address];
const mockCurrentPageReference = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Address_Form',
    },
    state: {
        addressId: 'address123',
    },
};
const outputAddress = {
    addressId: 'address123',
    city: 'Cityville',
    country: 'Countrystan',
    addressType: 'shipping',
    isDefault: false,
    name: 'Namo',
    postalCode: '12344',
    region: 'CA',
    street: '122 Boulevard Street',
};

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        AppContextAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock(
    '@salesforce/label/Commerce_My_Account_InputAddress.firstNameLabel',
    () => {
        return {
            default: 'First Name',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/Commerce_My_Account_InputAddress.lastNameLabel',
    () => {
        return {
            default: 'Last Name',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/Commerce_My_Account_InputAddress.addressTypeLabel',
    () => {
        return {
            default: 'Address Type',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/Commerce_My_Account_InputAddress.streetLabel',
    () => {
        return {
            default: 'Street Address',
        };
    },
    { virtual: true }
);
jest.mock(
    '@salesforce/label/Commerce_My_Account_InputAddress.cityLabel',
    () => {
        return {
            default: 'City',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/Commerce_My_Account_InputAddress.countryLabel',
    () => {
        return {
            default: 'Country',
        };
    },
    { virtual: true }
);
jest.mock(
    '@salesforce/label/Commerce_My_Account_InputAddress.provinceLabel',
    () => {
        return {
            default: 'State/Province',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/Commerce_My_Account_InputAddress.postalCodeLabel',
    () => {
        return {
            default: 'ZIP/Postal Code',
        };
    },
    { virtual: true }
);
jest.mock(
    '@salesforce/label/Commerce_My_Account_InputAddress.saveLabel',
    () => {
        return {
            default: 'Save',
        };
    },
    { virtual: true }
);
jest.mock(
    '@salesforce/label/Commerce_My_Account_InputAddress.cancelLabel',
    () => {
        return {
            default: 'Cancel',
        };
    },
    { virtual: true }
);
jest.mock(
    '@salesforce/label/Commerce_My_Account_Error_Messages.defaultErrorMessage',
    () => {
        return {
            default: 'Default Error',
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

jest.mock(
    'lightning/navigation',
    () => ({
        navigate: jest.fn((_, params) => {
            exposedNavigationParams = params;
        }),
        NavigationContext: mockCreateTestWireAdapter(),
        CurrentPageReference: mockCreateTestWireAdapter(),
    }),
    { virtual: true }
);

jest.mock('commerce/myAccountApi', () => {
    return Object.assign({}, jest.requireActual('commerce/myAccountApi'), {
        createMyAccountAddress: jest.fn(),
        updateMyAccountAddress: jest.fn(),
        MyAccountAddressDetailAdapter: mockCreateTestWireAdapter(),
    });
});

type addressForm =
    | 'componentHeaderNewAddressLabel'
    | 'makeDefaultAddressLabel'
    | 'formWidth'
    | 'showDifferentAddressTypes'
    | 'isDefaultAddress'
    | 'firstName'
    | 'lastName'
    | 'addressType'
    | 'street'
    | 'city'
    | 'country'
    | 'province'
    | 'postalCode';

type lightningInputAddress = {
    streetLabel: string;
    street: string;
    cityLabel: string;
    city: string;
    countryLabel: string;
    country: string;
    provinceLabel: string;
    province: string;
    postalCodeLabel: string;
    postalCode: string;
};

function mockedMyAccountAddress404Response(): PlatformError[] {
    return [
        {
            errorCode: 'ITEM_NOT_FOUND',
            message: "You can't perform this operation.",
        },
    ];
}

describe('input address', () => {
    let element: HTMLElement & MyAccountInputAddress;

    beforeEach(() => {
        element = createElement('commerce_my_account-my-account-input-address', {
            is: MyAccountInputAddress,
        });
        element.makeDefaultAddressLabel = 'makeDefaultAddressLabel';
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'componentHeaderNewAddressLabel',
            defaultValue: undefined,
            changeValue: 'New address',
        },
        {
            property: 'makeDefaultAddressLabel',
            defaultValue: 'makeDefaultAddressLabel',
            changeValue: 'Make default address label',
        },
        {
            property: 'firstName',
            defaultValue: '',
            changeValue: 'firstName',
        },
        {
            property: 'lastName',
            defaultValue: '',
            changeValue: 'lastName',
        },
        {
            property: 'street',
            defaultValue: '',
            changeValue: '12 Street',
        },
        {
            property: 'city',
            defaultValue: '',
            changeValue: 'Vancouver',
        },
        {
            property: 'country',
            defaultValue: '',
            changeValue: 'Canada',
        },
        {
            property: 'isDefaultAddress',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'province',
            defaultValue: '',
            changeValue: 'Ontario',
        },
        {
            property: 'postalCode',
            defaultValue: '',
            changeValue: '23456',
        },
        {
            property: 'addressType',
            defaultValue: '',
            changeValue: 'Billing',
        },
        {
            property: 'showDifferentAddressTypes',
            defaultValue: true,
            changeValue: false,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<addressForm>propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<addressForm>propertyTest.property]).not.toBe(propertyTest.changeValue);

                // Change the value.
                //@ts-ignore
                element[<addressForm>propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[<addressForm>propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });

    describe('MyAccountAddressDetailAdapter', () => {
        it('should populate the MyAccountAddressDetailAdapter adapter data and send it to thecomponent', async () => {
            (<typeof MyAccountAddressDetailAdapter & typeof TestWireAdapter>MyAccountAddressDetailAdapter).emit({
                data: {
                    count: 1,
                    items: mockAddresses,
                },
                error: undefined,
                loaded: true,
                loading: false,
            });
            await Promise.resolve();
            const inputAddress = <HTMLElement & lightningInputAddress>querySelector('[data-address-fields]');
            const firstNameElement = <HTMLElement & { value: string }>querySelector('[data-firstname-field]');
            const lastNameElement = <HTMLElement & { value: string }>querySelector('[data-lastname-field]');
            const addressTypeElement = <HTMLElement & { value: string }>querySelector('[data-address-type-field]');

            expect(firstNameElement.value).toBe('Namo');
            expect(lastNameElement.value).toBe('Doe');
            expect(addressTypeElement.value).toBe('shipping');
            expect(inputAddress.street).toBe('122 Boulevard Street');
            expect(inputAddress.city).toBe('Cityville');
            expect(inputAddress.country).toBe('Countrystan');
            expect(inputAddress.province).toBe('CA');
            expect(inputAddress.postalCode).toBe('12344');
        });
        it('should load first name and last name when provided from the API into the UI fields', async () => {
            (<typeof MyAccountAddressDetailAdapter & typeof TestWireAdapter>MyAccountAddressDetailAdapter).emit({
                data: {
                    count: 1,
                    items: [
                        {
                            city: 'San Fransisco',
                            country: 'US',
                            addressType: 'shipping',
                            isDefault: false,
                            firstName: 'first',
                            lastName: 'last',
                            postalCode: '12344',
                            region: 'CA',
                            street: '122 Boulevard Street',
                        },
                    ],
                },
                error: undefined,
                loaded: true,
                loading: false,
            });
            await Promise.resolve();
            const firstNameElement = <HTMLElement & { value: string }>querySelector('[data-firstname-field]');
            const lastNameElement = <HTMLElement & { value: string }>querySelector('[data-lastname-field]');
            expect(firstNameElement.value).toBe('first');
            expect(lastNameElement.value).toBe('last');
        });
        it('should load first name and last name when provided from the API via Name field for lastName first country', async () => {
            (<typeof MyAccountAddressDetailAdapter & typeof TestWireAdapter>MyAccountAddressDetailAdapter).emit({
                data: {
                    count: 1,
                    items: [
                        {
                            city: 'Tokyo',
                            country: 'JP',
                            addressType: 'shipping',
                            isDefault: false,
                            name: 'full name',
                            postalCode: '12344',
                            region: 'TK',
                            street: '122 Boulevard Street',
                        },
                    ],
                },
                error: undefined,
                loaded: true,
                loading: false,
            });
            await Promise.resolve();
            const firstNameElement = <HTMLElement & { value: string }>querySelector('[data-firstname-field]');
            await Promise.resolve();
            expect(firstNameElement.value).toBe('full name');
        });
        it('should give error the MyAccountAddressDetailAdapter adapter data load fails', async () => {
            (<typeof MyAccountAddressDetailAdapter & typeof TestWireAdapter>MyAccountAddressDetailAdapter).emit({
                data: undefined,
                error: [
                    {
                        errorCode: 'ITEM_NOT_FOUND',
                        message: "You can't perform this operation.",
                    },
                ],
                loaded: true,
                loading: false,
            });
            await Promise.resolve();
            const addressErrorNotification = element.querySelector('b2c_lite_commerce-scoped-notification');
            expect(addressErrorNotification).toBeTruthy();
        });
    });

    describe('country and state', () => {
        it('should have country selected as Canada (CA) when appContextAdapter has CA in shippingCountries', async () => {
            (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
                data: { shippingCountries: ['CA'] },
            });
            await Promise.resolve();
            const countryElement = <HTMLElement & lightningInputAddress>querySelector('[data-address-fields]', element);
            expect(countryElement.country).toBe('CA');
        });
        it('should have country selected as the one passed into the component from any parent component', () => {
            (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
                data: { shippingCountries: ['US', 'CA', 'MX'] },
            });
            element.country = 'MX';
            expect(element.country).toBe('MX');
        });
        it('should have first country selected when appContextAdapter has multiple in shippingCountries', async () => {
            (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
                data: { shippingCountries: ['MX', 'CA', 'JP'] },
            });
            await Promise.resolve();
            const countryElement = <HTMLElement & lightningInputAddress>querySelector('[data-address-fields]', element);
            expect(countryElement.country).toBe('MX');
        });
        it('should have  province empty when country list is empty', () => {
            (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
                data: { shippingCountries: [] },
            });
            expect(element.province).toBe('');
        });
    });

    describe('labels', () => {
        it('should use default labels', async () => {
            const inputAddress = <HTMLElement & lightningInputAddress>querySelector('[data-address-fields]');
            const firstNameElement = <HTMLElement & { label: string }>querySelector('[data-firstname-field]');
            const lastNameElement = <HTMLElement & { label: string }>querySelector('[data-lastname-field]');
            const addressTypeElement = <HTMLElement & { label: string }>querySelector('[data-address-type-field]');

            await Promise.resolve();

            expect(firstNameElement.label).toBe('First Name');
            expect(lastNameElement.label).toBe('Last Name');
            expect(addressTypeElement.label).toBe('Address Type');
            expect(inputAddress.streetLabel).toBe('Street Address');
            expect(inputAddress.cityLabel).toBe('City');
            expect(inputAddress.countryLabel).toBe('Country');
            expect(inputAddress.provinceLabel).toBe('State/Province');
            expect(inputAddress.postalCodeLabel).toBe('ZIP/Postal Code');
        });
    });

    describe('builder properties', () => {
        it('should show the component header when showComponentHeader is true', async () => {
            element.showComponentHeader = true;
            await Promise.resolve();

            const componentHeaderElement = <HTMLElement>querySelector('.address-header');
            expect(componentHeaderElement).toBeTruthy();
        });

        it('should show the mark default address checkbox when showDefaultAddress is true', async () => {
            await Promise.resolve();

            const defaultAddressElement = <HTMLElement>querySelector('[data-default-address-checkbox]');
            expect(defaultAddressElement).toBeTruthy();
        });

        it('should show the address type as shipping when showDifferentAddressTypes is false', async () => {
            element.showDifferentAddressTypes = false;
            await Promise.resolve();

            expect(element.addressType).toBe('Shipping');
        });
    });
    describe('events', () => {
        it('should get the firstname,lastname  updated when "commit" event dispatches on change of name fields', async () => {
            const firstInput = <HTMLElement & { value: string }>querySelector('[data-firstname-field]');
            const lastInput = <HTMLElement & { value: string }>querySelector('[data-lastname-field]');
            firstInput.value = 'first1';
            lastInput.value = 'last1';
            element.country = 'JP';
            await Promise.resolve();
            firstInput.dispatchEvent(new CustomEvent('commit'));
            lastInput.dispatchEvent(new CustomEvent('commit'));

            expect(element.firstName).toBe('first1');
            expect(element.lastName).toBe('last1');
        });
        it('should get the addressType  updated when "change" event dispatches on change of address type dropdown', () => {
            const addressType = <HTMLElement & { value: string }>querySelector('[data-address-type-field]');
            addressType.value = 'Shipping';
            addressType.dispatchEvent(new CustomEvent('change'));
            expect(element.addressType).toBe('Shipping');
        });
        it('should get the isDefaultAddress updated when "change" event dispatches on change of make default address checkbox', () => {
            const markDefaultAddress = <HTMLElement & { checked: boolean }>(
                querySelector('[data-default-address-checkbox]')
            );
            markDefaultAddress.checked = true;
            markDefaultAddress.dispatchEvent(new CustomEvent('change'));
            expect(element.isDefaultAddress).toBe(true);
        });
        it('should get the street updated when "change" event dispatches on change of street field on the form', () => {
            const inputAddress = <HTMLElement & { street: string }>querySelector('[data-address-fields]');
            inputAddress.street = '1 Main St.';
            inputAddress.dispatchEvent(new CustomEvent('change'));
            expect(element.street).toBe('1 Main St.');
        });
    });

    describe('navigation and save', () => {
        it('triggers navigation on cancel', () => {
            element.dispatchEvent(
                new CustomEvent('firstaction', {
                    bubbles: true,
                    cancelable: true,
                })
            );

            expect(exposedNavigationParams).toEqual({
                type: 'comm__namedPage',
                attributes: { name: 'Address_List' },
                state: { addressType: '' },
            });
        });
        it('triggers wire adapter call and navigation on save during create address', async () => {
            (createMyAccountAddress as jest.Mock).mockImplementation(() => {
                return Promise.resolve(outputAddress);
            });

            const firstName = <HTMLElement & reportValidity>querySelector('[data-firstname-field]');
            const lastName = <HTMLElement & reportValidity>querySelector('[data-lastname-field]');
            const addressType = <HTMLElement & reportValidity>querySelector('[data-address-type-field]');
            const inputAddress = <HTMLElement & reportValidity>querySelector('[data-address-fields]');

            firstName.reportValidity = (): boolean => true;
            lastName.reportValidity = (): boolean => true;
            addressType.reportValidity = (): boolean => true;
            inputAddress.reportValidity = (): boolean => true;
            element.dispatchEvent(
                new CustomEvent('secondaction', {
                    bubbles: true,
                    cancelable: true,
                })
            );
            await Promise.resolve();
            expect(createMyAccountAddress).toHaveBeenCalledTimes(1);

            const loadingSpinner = element.querySelector('lightning-spinner');
            expect(loadingSpinner).not.toBeNull();

            expect(exposedNavigationParams).toEqual({
                type: 'comm__namedPage',
                attributes: { name: 'Address_List' },
                state: { addressType: '' },
            });
        });

        it('should return error notification when error on save during create address', async () => {
            (createMyAccountAddress as jest.Mock).mockImplementation(() => {
                return Promise.reject(mockedMyAccountAddress404Response);
            });

            const firstName = <HTMLElement & reportValidity>querySelector('[data-firstname-field]');
            const lastName = <HTMLElement & reportValidity>querySelector('[data-lastname-field]');
            const addressType = <HTMLElement & reportValidity>querySelector('[data-address-type-field]');
            const inputAddress = <HTMLElement & reportValidity>querySelector('[data-address-fields]');

            firstName.reportValidity = (): boolean => true;
            lastName.reportValidity = (): boolean => true;
            addressType.reportValidity = (): boolean => true;
            inputAddress.reportValidity = (): boolean => true;

            element.dispatchEvent(
                new CustomEvent('secondaction', {
                    bubbles: true,
                    cancelable: true,
                })
            );
            await Promise.resolve();
            document.body.appendChild(element);
            const addressErrorNotification = element.querySelector('b2c_lite_commerce-scoped-notification');
            expect(addressErrorNotification).toBeTruthy();
        });

        it('triggers wire adapter call and navigation on save during edit address', async () => {
            (updateMyAccountAddress as jest.Mock).mockImplementation(() => {
                return Promise.resolve(outputAddress);
            });

            const firstName = <HTMLElement & reportValidity>querySelector('[data-firstname-field]');
            const lastName = <HTMLElement & reportValidity>querySelector('[data-lastname-field]');
            const addressType = <HTMLElement & reportValidity>querySelector('[data-address-type-field]');
            const inputAddress = <HTMLElement & reportValidity>querySelector('[data-address-fields]');

            firstName.reportValidity = (): boolean => true;
            lastName.reportValidity = (): boolean => true;
            addressType.reportValidity = (): boolean => true;
            inputAddress.reportValidity = (): boolean => true;

            // @ts-ignore
            CurrentPageReference.emit(mockCurrentPageReference);
            await Promise.resolve();
            const addressId = 'address123';

            const updateContactPointAddressResponse = await updateMyAccountAddress({ addressId, ...address });
            expect(updateMyAccountAddress).toHaveBeenCalledTimes(1);
            expect(updateContactPointAddressResponse).toEqual(outputAddress);

            element.dispatchEvent(
                new CustomEvent('secondaction', {
                    bubbles: true,
                    cancelable: true,
                })
            );

            expect(exposedNavigationParams).toEqual({
                type: 'comm__namedPage',
                attributes: { name: 'Address_List' },
                state: { addressType: '' },
            });
        });

        it('should return error notification when error on save during edit address', async () => {
            (updateMyAccountAddress as jest.Mock).mockImplementation(() => {
                return Promise.reject(mockedMyAccountAddress404Response());
            });
            const firstName = <HTMLElement & reportValidity>querySelector('[data-firstname-field]');
            const lastName = <HTMLElement & reportValidity>querySelector('[data-lastname-field]');
            const addressType = <HTMLElement & reportValidity>querySelector('[data-address-type-field]');
            const inputAddress = <HTMLElement & reportValidity>querySelector('[data-address-fields]');

            firstName.reportValidity = (): boolean => true;
            lastName.reportValidity = (): boolean => true;
            addressType.reportValidity = (): boolean => true;
            inputAddress.reportValidity = (): boolean => true;

            // @ts-ignore
            CurrentPageReference.emit(mockCurrentPageReference);
            await Promise.resolve();

            element.dispatchEvent(
                new CustomEvent('secondaction', {
                    bubbles: true,
                    cancelable: true,
                })
            );

            await Promise.resolve();
            document.body.appendChild(element);
            const addressErrorNotification = element.querySelector('b2c_lite_commerce-scoped-notification');
            expect(addressErrorNotification).toBeTruthy();

            addressErrorNotification?.dispatchEvent(
                new CustomEvent('dismissnotification', {
                    bubbles: true,
                    cancelable: true,
                })
            );
            await Promise.resolve();
            const addressErrorNotificationAfterDismiss = element.querySelector('b2c_lite_commerce-scoped-notification');
            expect(addressErrorNotificationAfterDismiss).toBeFalsy();
        });
    });
});
