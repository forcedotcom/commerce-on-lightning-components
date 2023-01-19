import { createElement } from 'lwc';
import RadioGroup from 'commerce_unified_checkout/radioGroup';

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

const createAddresses = () => {
    return [
        {
            addressId: 'address1',
            isDefault: true,
            name: 'Jane Doe',
            street: '123 Broadway',
            city: 'New York',
            postalCode: '11000',
            regionCode: 'NY',
            country: 'US',
        },
        {
            addressId: 'address2',
            isDefault: false,
            name: 'John Doe',
            street: '5 Wall Street',
            city: 'Burlington',
            postalCode: '01803',
            regionCode: 'MA',
            country: 'US',
        },
        {
            addressId: 'address3',
            isDefault: false,
            name: 'Janice Doe',
            street: '500 Broadway',
            city: 'New York',
            regionCode: 'NY',
            country: 'US',
        },
    ];
};

const createComponent = (properties) => {
    const element = createElement('commerce_unified_checkout-radio-group', {
        is: RadioGroup,
    });

    if (properties) {
        Object.assign(element, properties);
    }

    document.body.appendChild(element);
    return element;
};

describe('checkout shipping addresses radio group', () => {
    let element;

    const addresses = createAddresses();

    beforeEach(() => {
        element = createComponent();
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
        {
            property: 'editAddressLabel',
            defaultValue: 'Edit',
            changeValue: 'Edit Address',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property]).not.toStrictEqual(propertyTest.changeValue);

                // Change the value.
                element[propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property]).toStrictEqual(propertyTest.changeValue);
            });
        });
    });

    describe('events', () => {
        it('should dispatch "changeaddressoption" event when an address is selected', () => {
            let dispatched = false;
            element.addEventListener('changeaddressoption', () => {
                dispatched = true;
            });

            element.options = addresses;

            return Promise.resolve().then(() => {
                const inputEls = element.querySelectorAll('input');
                // click on the second address
                inputEls[1].click();
                expect(dispatched).toBe(true);
            });
        });

        it('should dispatch "editaddress" event when an address edit button clicked', () => {
            let dispatched = false;
            element.addEventListener('editaddress', () => {
                dispatched = true;
            });

            element.options = addresses;

            return Promise.resolve().then(() => {
                const inputEls = element.querySelectorAll('lightning-button');
                // click on the second address
                inputEls[1].click();
                expect(dispatched).toBe(true);
            });
        });

        it('should dispatch "blur" event when an address is selected', () => {
            const handler = jest.fn();
            element.addEventListener('blur', handler);

            element.options = addresses;

            return Promise.resolve()
                .then(() => {
                    const inputEls = element.querySelectorAll('input');
                    inputEls[1].dispatchEvent(new CustomEvent('blur'));
                })
                .then(() => {
                    expect(handler).toHaveBeenCalled();
                });
        });
    });

    describe('focus', () => {
        it('should call focus on the first radio input', () => {
            element.options = addresses;
            return Promise.resolve().then(() => {
                const firstInput = element.querySelector('input');
                let focusCalled = false;
                firstInput.focus = () => {
                    focusCalled = true;
                };
                jest.spyOn(firstInput, 'focus');
                element.focus();
                expect(focusCalled).toBe(true);
            });
        });

        it('should not call focus on any other input component other than the first', () => {
            element.options = addresses;
            return Promise.resolve().then(() => {
                const inputAddress = element.querySelectorAll('input');
                let focusNotCalled = true;
                inputAddress.focus = () => {
                    focusNotCalled = false;
                };
                jest.spyOn(inputAddress, 'focus');
                element.focus();
                expect(focusNotCalled).toBe(true);
            });
        });
    });

    it('should update the value property when an address is selected', () => {
        element.options = addresses;
        return Promise.resolve().then(() => {
            const inputEls = element.querySelectorAll('input');
            // click on the second address
            inputEls[2].click();
            expect(element.value).toBe('address3');
        });
    });

    it('should have default labels for badge', () => {
        element.options = addresses;
        return Promise.resolve().then(() => {
            const radioAddress = element.querySelector('label > span.defaultLabel');
            expect(radioAddress.textContent).toBe('Default');
        });
    });
});
