import { createElement } from 'lwc';

import AddToCartButton from '../addToCartButton';

jest.mock(
    '@salesforce/label/B2B_Buyer_Cart.addToCart',
    () => {
        return { default: 'add to cart' };
    },
    { virtual: true }
);

const createComponentUnderTest = (): AddToCartButton & HTMLElement => {
    const element = createElement<AddToCartButton>('commerce_product_details-add-to-cart-button', {
        is: AddToCartButton,
    });
    document.body.appendChild(element);
    return element;
};

describe('Add to Cart Button', () => {
    let element: AddToCartButton & HTMLElement;

    beforeEach(() => {
        element = createComponentUnderTest();
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'ariaLabel',
            defaultValue: undefined,
            changeValue: null,
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
            property: 'text',
            defaultValue: undefined,
            changeValue: "I'm a button",
        },
        {
            property: 'variant',
            defaultValue: undefined,
            changeValue: 'primary',
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

    it('is NOT disabled by default', () => {
        expect(element.querySelector('button[disabled]')).toBeFalsy();
    });

    it('is NOT disabled when explicitly set to false', () => {
        element.disabled = false;
        expect(element.querySelector('button[disabled]')).toBeFalsy();
    });

    it('is disabled when disabled property is set to true', () => {
        element.disabled = true;
        return Promise.resolve().then(() => {
            expect(element.querySelector('button[disabled]')).toBeTruthy();
        });
    });

    it('displays an icon when provided an icon name', () => {
        element.iconName = 'utility:shopping_bag';

        return Promise.resolve().then(() => {
            const icon = element.querySelector('lightning-icon');
            expect(icon).toBeTruthy();
        });
    });

    [null, undefined, ''].forEach((emptyIconName) => {
        it(`does not display an icon when none (${JSON.stringify(emptyIconName)}) is provided icon name`, () => {
            element.iconName = <never>emptyIconName;

            return Promise.resolve().then(() => {
                const icon = element.querySelector('lightning-icon');
                expect(icon).toBeNull();
            });
        });
    });

    it('should focus button when the focus api is called', () => {
        element.iconName = 'utility:shopping_bag';

        return Promise.resolve().then(() => {
            element.focus();
            const buttonEl = element.querySelector('button');
            expect(document.activeElement).toBe(buttonEl);
        });
    });

    it('should set the correct class when variant is secondary', () => {
        element.variant = 'secondary';

        return Promise.resolve().then(() => {
            element.focus();
            const buttonEl = element.querySelector('button');
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            expect(buttonEl!.classList).toContain('slds-button_outline-brand');
        });
    });

    it('should set the correct class when variant is tertiary', () => {
        element.variant = 'tertiary';

        return Promise.resolve().then(() => {
            element.focus();
            const buttonEl = element.querySelector('button');
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            expect(buttonEl!.classList).not.toContain('slds-button_brand');
        });
    });
});
