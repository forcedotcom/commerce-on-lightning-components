import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import type { TestWireAdapter } from 'types/testing';
import CheckoutButton from 'commerce_builder/checkoutButton';
import { CartSummaryAdapter } from 'commerce/cartApi';
import { CartActionsStatusAdapter } from 'commerce/cartApiInternal';
import { apiData } from '../../cartSummary/__tests__/data/cartSummaryData';

const cartActionsAdapter = <typeof CartActionsStatusAdapter & typeof TestWireAdapter>CartActionsStatusAdapter;
const cartSummaryAdapter = <typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter;

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => 'current_cart'),
    NavigationContext: mockCreateTestWireAdapter(),
    navigate: jest.fn(),
    CurrentPageReference: mockCreateTestWireAdapter(),
}));

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(),
    }),
    { virtual: true }
);

jest.mock(
    '@app/isPreviewMode',
    () => ({
        __esModule: true,
        default: false,
    }),
    { virtual: true }
);

jest.mock('commerce/cartApi', () =>
    Object.assign({}, jest.requireActual('commerce/cartApi'), {
        CartSummaryAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock('commerce/cartApiInternal', () =>
    Object.assign({}, jest.requireActual('commerce/cartApiInternal'), {
        CartActionsStatusAdapter: mockCreateTestWireAdapter(),
    })
);
describe('Checkout Button', () => {
    let element: HTMLElement & CheckoutButton;

    beforeEach(() => {
        jest.clearAllMocks();

        element = createElement('commerce_builder-checkout-button', {
            is: CheckoutButton,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe.each`
        property                | defaultValue | changeValue
        ${'buttonBorderRadius'} | ${undefined} | ${'10'}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(element[<'buttonBorderRadius'>property]).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            // Ensure the value isn't already set to the target value.
            expect(element[<'buttonBorderRadius'>property]).not.toBe(changeValue);

            // Change the value.
            element[<'buttonBorderRadius'>property] = changeValue;

            // Ensure we reflect the changed value.
            expect(element[<'buttonBorderRadius'>property]).toBe(changeValue);
        });
    });

    it('button is enabled when there are items in cart', async () => {
        (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({
            data: { totalProductCount: '10' },
        });
        await Promise.resolve();

        const checkoutButton = <HTMLButtonElement>element.querySelector('.slds-button');
        expect(checkoutButton.disabled).toBe(false);
    });

    it('button is hidden when no items in cart', async () => {
        (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({
            data: { totalProductCount: '0' },
        });
        await Promise.resolve();

        const checkoutButton = <HTMLButtonElement>element.querySelector('.slds-button');
        expect(checkoutButton).toBeNull();
    });

    it('button is disabled when cart summary adapter returns error', async () => {
        cartSummaryAdapter.emit({
            data: apiData.cartSummaryNetTax,
            error: 'Error',
            status: '500',
        });
        await Promise.resolve();

        const checkoutButton = <HTMLButtonElement>element.querySelector('.slds-button');
        checkoutButton.click();

        expect(checkoutButton.disabled).toBe(true);
    });

    it('button is disabled when cart is processing', async () => {
        // Populate cart
        cartSummaryAdapter.emit({
            data: apiData.cartSummaryNetTax,
            error: undefined,
            loading: true,
        });
        await Promise.resolve();

        // Mock cart action
        cartActionsAdapter.emit({
            data: apiData.cartSummaryNetTax,
            error: undefined,
            loading: true,
        });
        await Promise.resolve();

        const checkoutButton = <HTMLButtonElement>element.querySelector('.slds-button');
        expect(checkoutButton.disabled).toBe(true);
    });

    it('button is disabled when CartActionsStatusAdapter returns an error', async () => {
        // Populate cart
        cartSummaryAdapter.emit({
            data: apiData.cartSummaryNetTax,
            error: undefined,
        });
        await Promise.resolve();

        // Mock cart action
        cartActionsAdapter.emit({
            data: apiData.cartSummaryNetTax,
            error: 'Error',
        });
        await Promise.resolve();

        const checkoutButton = <HTMLButtonElement>element.querySelector('.slds-button');

        expect(checkoutButton.disabled).toBe(true);
    });

    it('Test buttonStyle', async () => {
        (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({
            data: { totalProductCount: '10' },
        });

        await Promise.resolve();

        const checkoutButton = <HTMLButtonElement>element.querySelector('.slds-button');

        element.buttonBackgroundHoverColor = '#FF0000';
        element.buttonTextColor = '#000000';
        element.buttonTextHoverColor = '#0000FF';
        element.buttonBackgroundColor = '#00FF00';
        element.buttonBorderRadius = '10';
        element.buttonBorderColor = '#00F00F';

        await Promise.resolve();

        expect(checkoutButton?.style.cssText).toBe(
            '--com-c-cart-checkout-button-text-color: #000000; ' +
                '--com-c-cart-checkout-button-text-hover-color: #0000FF; ' +
                '--com-c-cart-checkout-button-background-color: #00FF00; ' +
                '--com-c-cart-checkout-button-background-hover-color: #FF0000; ' +
                '--com-c-cart-checkout-button-border-radius: 10px; ' +
                '--com-c-cart-checkout-button-border-color: #00F00F;'
        );
    });
});
