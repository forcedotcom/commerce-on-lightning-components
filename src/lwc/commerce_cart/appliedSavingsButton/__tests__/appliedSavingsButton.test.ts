import { createElement } from 'lwc';

import AppliedSavingsButton from '../appliedSavingsButton';

describe('checkout Button', () => {
    let element: HTMLButtonElement & AppliedSavingsButton;

    beforeEach(() => {
        element = createElement('commerce_cart-applied-savings-button', {
            is: AppliedSavingsButton,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'ariaLabel',
            defaultValue: null,
            changeValue: "I'm a applied savings button",
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
            property: 'text',
            defaultValue: undefined,
            changeValue: "I'm a applied savings button",
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect.assertions(1);
                expect(element[propertyTest.property as keyof AppliedSavingsButton]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof AppliedSavingsButton]).not.toBe(propertyTest.changeValue);

                // Change the value.
                //@ts-ignore
                element[propertyTest.property as keyof AppliedSavingsButton] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof AppliedSavingsButton]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('should focus button when the focus api is called', () => {
        return Promise.resolve().then(() => {
            element.focus();
            const buttonEl = element.querySelector('button');
            expect(document.activeElement).toBe(buttonEl);
        });
    });
});
