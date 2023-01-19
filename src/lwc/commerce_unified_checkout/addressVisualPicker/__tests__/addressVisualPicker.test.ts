import { createElement } from 'lwc';
import AddressVisualPicker from 'commerce_unified_checkout/addressVisualPicker';
import type { Address } from 'types/unified_checkout';
import type Button from 'lightning/button';
import type Badge from 'lightning/badge';

jest.mock(
    '@salesforce/label/Commerce_Unified_Checkout_Shipping.badgeLabel',
    () => {
        return {
            default: 'Default',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/Commerce_Unified_Checkout_Shipping.editAddressLabel',
    () => {
        return {
            default: 'Edit',
        };
    },
    { virtual: true }
);

const createAddresses = (): Address[] => {
    return [
        {
            addressId: 'address1',
            isDefault: true,
            firstName: 'Jane',
            lastName: 'Doe',
            street: '123 Broadway',
            city: 'New York',
            postalCode: '11000',
            region: 'NY',
            country: 'US',
        },
        {
            addressId: 'address2',
            isDefault: false,
            firstName: 'John',
            lastName: 'Doe',
            street: '5 Wall Street',
            city: 'Burlington',
            postalCode: '01803',
            region: 'MA',
            country: 'US',
        },
        {
            addressId: 'address3',
            isDefault: false,
            firstName: 'Janice',
            lastName: 'Doe',
            street: '500 Broadway',
            city: 'New York',
            postalCode: '11000',
            region: 'NY',
            country: 'US',
        },
    ];
};

describe('checkout shipping addresses radio group visual picker', () => {
    let element: HTMLElement & AddressVisualPicker;

    const addresses = createAddresses();

    beforeEach(() => {
        element = createElement('commerce_unified_checkout-address-visual-picker', {
            is: AddressVisualPicker,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'options',
            defaultValue: undefined,
            changeValue: [],
        },
        {
            property: 'value',
            defaultValue: undefined,
            changeValue: 'address1',
        },
        {
            property: 'disabled',
            defaultValue: false,
            changeValue: true,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                // @ts-ignore
                expect(element[propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                // @ts-ignore
                expect(element[propertyTest.property]).not.toStrictEqual(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                // @ts-ignore
                expect(element[propertyTest.property]).toStrictEqual(propertyTest.changeValue);
            });
        });
    });

    describe('events', () => {
        it('should dispatch "changeaddressoption" event when an address is selected', async () => {
            let dispatched = false;
            element.addEventListener('changeaddressoption', () => {
                dispatched = true;
            });

            element.options = addresses;
            await Promise.resolve();

            const inputEls = element.querySelectorAll('input');
            // click on the second address
            inputEls[1].click();
            expect(dispatched).toBe(true);
        });

        it('should dispatch "editaddress" event when an address edit button clicked', async () => {
            let dispatched = false;
            element.addEventListener('editaddress', () => {
                dispatched = true;
            });

            element.options = addresses;
            element.value = addresses[0].addressId;
            await Promise.resolve();

            const inputEls = <HTMLElement & Button>element.querySelector('[data-edit]');
            // click on the second address
            inputEls.click();
            expect(dispatched).toBe(true);
        });
    });

    it('should display name correctly for a country where last name comes before first name', async () => {
        element.options = [
            {
                addressId: 'japanAddress',
                isDefault: true,
                firstName: 'Jim',
                lastName: 'Doe',
                street: 'Some street',
                city: 'Some city',
                postalCode: '11000',
                region: 'AA',
                country: 'JP',
            },
        ];
        await Promise.resolve();
        expect((<HTMLElement>element.querySelector('.slds-text-heading_small')).textContent).toBe('Doe Jim');
    });

    it('should display name correctly for for address where only name field has value', async () => {
        element.options = [
            {
                addressId: 'japanAddress',
                isDefault: true,
                name: 'First Last',
                street: 'Some street',
                city: 'Some city',
                postalCode: '11000',
                region: 'AA',
                country: 'JP',
            },
        ];
        await Promise.resolve();
        expect((<HTMLElement>element.querySelector('.slds-text-heading_small')).textContent).toBe('First Last');
    });

    it('should update the value property when an address is selected', async () => {
        element.options = addresses;
        await Promise.resolve();

        const inputEls = element.querySelectorAll('input');
        // click on the second address
        inputEls[2].click();
        expect(element.value).toBe('address3');
    });

    it('should have default labels for badge', async () => {
        element.options = addresses;
        await Promise.resolve();

        const radioAddress = <HTMLElement & Badge>element.querySelector('.slds-radio__label lightning-badge');
        expect(radioAddress).toBeTruthy();
        expect(radioAddress.label).toBe('Default');
    });
});
