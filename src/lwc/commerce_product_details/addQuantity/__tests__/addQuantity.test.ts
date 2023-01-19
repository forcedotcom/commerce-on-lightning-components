import { createElement } from 'lwc';
import { ADD_PRODUCT_TO_CART_EVT } from '../constants';
import AddQuantity from '../addQuantity';

const VALUE_CHANGED_EVENT = 'valuechanged';

const createComponentUnderTest = (): AddQuantity & HTMLElement => {
    const element = createElement<AddQuantity>('commerce_product_details-add-quantity', {
        is: AddQuantity,
    });
    document.body.appendChild(element);
    return element;
};

describe('Add Quantity to Cart (addQuantity)', () => {
    let element: AddQuantity & HTMLElement;

    beforeEach(() => {
        element = createComponentUnderTest();
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'buttonText',
            defaultValue: undefined,
            changeValue: 'Add me!',
        },
        {
            property: 'customStyles',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'disabled',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'iconName',
            defaultValue: undefined,
            changeValue: 'utility:success',
        },
        {
            property: 'maximumText',
            defaultValue: undefined,
            changeValue: 'Maximum quantity is {0}',
        },
        {
            property: 'minimumText',
            defaultValue: undefined,
            changeValue: 'Minimum quantity is {0}',
        },
        {
            property: 'incrementText',
            defaultValue: undefined,
            changeValue: 'Increment quantity is {0}',
        },
        {
            property: 'quantitySelectorLabel',
            defaultValue: undefined,
            changeValue: 'QTY',
        },
        {
            property: 'quantity',
            defaultValue: undefined,
            changeValue: 55,
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<never>propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<never>propertyTest.property]).not.toBe(propertyTest.changeValue);

                // Change the value.
                Reflect.set(element, <string>propertyTest.property, propertyTest.changeValue);

                // Ensure we reflect the changed value.
                expect(element[<never>propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });

    [
        {
            quantitySelectorProperty: 'minimum',
            defaultValue: null,
            quantityRuleChangeValue: { minimum: '10' },
            changeValue: '10',
        },
        {
            quantitySelectorProperty: 'maximum',
            defaultValue: null,
            quantityRuleChangeValue: { maximum: '100' },
            changeValue: '100',
        },
        {
            quantitySelectorProperty: 'step',
            defaultValue: null,
            quantityRuleChangeValue: { increment: '5' },
            changeValue: '5',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.quantitySelectorProperty}" property of the quantity selector`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                const quantitySelector = <HTMLElement>element.querySelector('commerce-quantity-selector');

                expect(quantitySelector[<never>propertyTest.quantitySelectorProperty]).toBe(propertyTest.defaultValue);
            });

            it('changes when quantityRule property is changed', () => {
                // Change the value.
                element.quantityRule = <never>propertyTest.quantityRuleChangeValue;

                return Promise.resolve().then(() => {
                    const quantitySelector = <HTMLElement>element.querySelector('commerce-quantity-selector');

                    // Ensure we reflect the changed value.
                    expect(quantitySelector[<never>propertyTest.quantitySelectorProperty]).toBe(
                        propertyTest.changeValue
                    );
                });
            });
        });
    });

    it('renders an add to cart button', () => {
        expect(element.querySelector('commerce_product_details-add-to-cart-button')).toBeTruthy();
    });

    it('add to cart button is enabled when the quantity is valid', () => {
        const qs = <HTMLElement>element.querySelector('commerce-quantity-selector');
        qs.dispatchEvent(
            new CustomEvent(VALUE_CHANGED_EVENT, {
                bubbles: true,
                composed: true,
                detail: {
                    isValid: true,
                },
            })
        );

        return Promise.resolve().then(() => {
            const button = <HTMLButtonElement>element.querySelector('commerce_product_details-add-to-cart-button');
            expect(button.disabled).toBeFalsy();
        });
    });

    it('add to cart button is disabled when the quantity is invalid', () => {
        const qs = <HTMLElement>element.querySelector('commerce-quantity-selector');
        qs.dispatchEvent(
            new CustomEvent(VALUE_CHANGED_EVENT, {
                bubbles: true,
                composed: true,
                detail: {
                    isValid: false,
                },
            })
        );

        return Promise.resolve().then(() => {
            const button = <HTMLButtonElement>element.querySelector('commerce_product_details-add-to-cart-button');
            expect(button.disabled).toBeTruthy();
        });
    });

    describe("'addproducttocart' custom event", () => {
        let handler: jest.Mock;
        let button: HTMLButtonElement;
        beforeEach(() => {
            handler = jest.fn();
            element.addEventListener(ADD_PRODUCT_TO_CART_EVT, handler);
            button = <HTMLButtonElement>element.querySelector('commerce_product_details-add-to-cart-button');
        });

        it("is fired in response to a click event from the 'add to cart' button", () => {
            button.click();
            return Promise.resolve().then(() => {
                expect(handler).toHaveBeenCalled();
            });
        });

        it('has a quantity property in the detail payload', () => {
            button.click();
            return Promise.resolve().then(() => {
                expect(handler.mock.calls[0][0].detail).toHaveProperty('quantity');
            });
        });
    });
});
