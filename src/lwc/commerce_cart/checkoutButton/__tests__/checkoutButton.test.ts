import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import type { TestWireAdapter } from 'types/testing';
import CheckoutButton from 'commerce_cart/checkoutButton';
import { navigate, NavigationContext } from 'lightning/navigation';

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => 'current_cart'),
    NavigationContext: mockCreateTestWireAdapter(),
    navigate: jest.fn(),
    CurrentPageReference: mockCreateTestWireAdapter(),
}));

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

describe('checkout Button', () => {
    let element: HTMLButtonElement & CheckoutButton;

    beforeEach(() => {
        (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({});

        element = createElement('commerce_cart-checkout-button', {
            is: CheckoutButton,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });
    describe('Checkout Button on Cart Page', () => {
        it('displays the correct button text when the text property is set', () => {
            const text = 'Test Button Text';
            element.text = text;

            return Promise.resolve().then(() => {
                const checkoutButton = <HTMLButtonElement>element.querySelector('button');
                expect(checkoutButton.textContent).toBe(text);
            });
        });

        it('triggers navigation on click', () => {
            const checkoutButton = <HTMLButtonElement>element.querySelector('button');
            checkoutButton.click();

            expect(navigate).toHaveBeenCalledWith(undefined, {
                type: 'comm__namedPage',
                attributes: {
                    name: 'Current_Checkout',
                },
            });
        });

        [
            {
                disabled: undefined,
                expectedValue: false,
            },
            {
                disabled: false,
                expectedValue: false,
            },
            {
                disabled: true,
                expectedValue: true,
            },
            {
                disabled: null,
                expectedValue: false,
            },
        ].forEach((propertyTest) => {
            it(`When disabled is '${propertyTest.disabled}'
            the button property should be '${propertyTest.disabled}':
                '${propertyTest.disabled}'`, () => {
                // @ts-ignore
                element.disabled = propertyTest.disabled;
                return Promise.resolve().then(() => {
                    const checkoutButton = <HTMLButtonElement>element.querySelector('button');
                    expect(checkoutButton.disabled).toBe(propertyTest.expectedValue);
                });
            });
        });
    });
});
