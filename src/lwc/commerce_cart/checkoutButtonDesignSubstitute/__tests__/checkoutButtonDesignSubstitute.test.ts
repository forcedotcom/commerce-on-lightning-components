import { createElement } from 'lwc';
import CheckoutButton from 'commerce_cart/checkoutButtonDesignSubstitute';

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => ''),
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
}));

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

describe('commerce_cart/checkoutButtonDesignSubstitute', () => {
    let element: HTMLElement & CheckoutButton;
    type checkoutButton =
        | 'text'
        | 'variant'
        | 'size'
        | 'width'
        | 'alignment'
        | 'buttonTextColor'
        | 'buttonTextHoverColor'
        | 'buttonBackgroundColor'
        | 'buttonBackgroundHoverColor'
        | 'buttonBorderColor'
        | 'buttonBorderRadius';

    beforeEach(() => {
        jest.clearAllMocks();
        // Create element
        element = createElement('commerce_cart-checkout-button-design-substitute', {
            is: CheckoutButton,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        document.body.removeChild(element);
    });

    describe.each`
        property                        | defaultValue | changeValue
        ${'text'}                       | ${undefined} | ${'Checkout'}
        ${'variant'}                    | ${undefined} | ${'primary'}
        ${'size'}                       | ${undefined} | ${'standard'}
        ${'width'}                      | ${undefined} | ${'stretch'}
        ${'alignment'}                  | ${undefined} | ${'center'}
        ${'buttonTextColor'}            | ${undefined} | ${'#000000'}
        ${'buttonTextHoverColor'}       | ${undefined} | ${'#0004FF'}
        ${'buttonBackgroundColor'}      | ${undefined} | ${'#0004FF'}
        ${'buttonBackgroundHoverColor'} | ${undefined} | ${'#FFFFFF'}
        ${'buttonBorderColor'}          | ${undefined} | ${'#000000'}
        ${'buttonBorderRadius'}         | ${undefined} | ${'10'}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(element[<checkoutButton>property]).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            // Ensure the value isn't already set to the target value.
            expect(element[<checkoutButton>property]).not.toBe(changeValue);

            // Change the value.
            element[<checkoutButton>property] = changeValue;

            // Ensure we reflect the changed value.
            expect(element[<checkoutButton>property]).toBe(changeValue);
        });
    });
});
