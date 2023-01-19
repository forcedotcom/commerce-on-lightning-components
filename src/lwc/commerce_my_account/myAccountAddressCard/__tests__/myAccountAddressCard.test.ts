import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import MyAccountAddressCard from 'commerce_my_account/myAccountAddressCard';
import { querySelector } from 'kagekiri';

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(() => Promise.resolve()),
    }),
    { virtual: true }
);

jest.mock(
    '@salesforce/label/Commerce_My_Account_AddressCard.addressLabel',
    () => {
        return {
            default: 'Address',
        };
    },
    { virtual: true }
);
jest.mock(
    'lightning/navigation',
    () => ({
        navigate: jest.fn(),
        NavigationContext: mockCreateTestWireAdapter(),
    }),
    { virtual: true }
);

const mockAddress = {
    firstName: 'Amy',
    lastName: 'Taylor',
    addressType: 'Shipping',
    street: '5 Wall Street',
    region: 'CA',
    city: 'San Fransisco',
    country: 'US',
    postalCode: '55555',
    isDefault: true,
};

describe('commerce_my_account/MyAccountAddressCard: MyAccountAddressCard', () => {
    let element: MyAccountAddressCard & HTMLElement;

    beforeEach(() => {
        element = createElement('commerce_my_account-my-account-address-card', {
            is: MyAccountAddressCard,
        });

        element.addressType = mockAddress.addressType;
        element.street = mockAddress.street;
        element.city = mockAddress.city;
        element.country = mockAddress.country;
        element.postalCode = mockAddress.postalCode;
        element.isDefault = mockAddress.isDefault;
        document.body.appendChild(element);
    });
    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'defaultBadgeLabel',
            defaultValue: '',
            changeValue: 'Default',
        },
        {
            property: 'defaultBadgeColor',
            defaultValue: 'var(--dxp-g-root)',
            changeValue: 'var(--dxp-g-root-1)',
        },
        {
            property: 'defaultBorderRadius',
            defaultValue: '0',
            changeValue: '2',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                // @ts-ignore
                expect(element[propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                // @ts-ignore
                expect(element[propertyTest.property]).not.toBe(propertyTest.changeValue);
                // Change the value.
                // @ts-ignore
                element[propertyTest.property] = propertyTest.changeValue;
                // Ensure we reflect the changed value.
                // @ts-ignore
                expect(element[propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('should parse the name property with correct order for firstName first country', async () => {
        element.country = 'US';
        element.firstName = 'FirstName';
        element.lastName = 'LastName';
        await Promise.resolve();
        const nameElement = <HTMLElement>querySelector('.name-decoration', element);
        expect(nameElement.textContent).toBe('FirstName LastName');
    });
    it('should parse the name property with correct order for firstName last country', async () => {
        element.country = 'JP';
        element.firstName = 'FirstName';
        element.lastName = 'LastName';
        await Promise.resolve();
        const nameElement = <HTMLElement>querySelector('.name-decoration', element);
        expect(nameElement.textContent).toBe('LastName FirstName');
    });
});

describe('styles', () => {
    let element: MyAccountAddressCard & HTMLElement;

    beforeEach(() => {
        element = createElement('commerce_my_account-my-account-address-card', {
            is: MyAccountAddressCard,
        });
        element.addressType = mockAddress.addressType;
        element.street = mockAddress.street;
        element.city = mockAddress.city;
        element.country = mockAddress.country;
        element.postalCode = mockAddress.postalCode;
        element.isDefault = mockAddress.isDefault;
        document.body.appendChild(element);
    });
    afterEach(() => {
        document.body.removeChild(element);
    });

    it('Should display specified default badge label on the address card', () => {
        element.isDefault = true;
        element.defaultBadgeLabel = 'duplicate default';
        document.body.appendChild(element);
        const defaultBadgeLabel = <HTMLElement & { label: string }>querySelector('lightning-badge');
        return Promise.resolve().then(() => {
            expect(defaultBadgeLabel.label).toBe('duplicate default');
        });
    });
});
