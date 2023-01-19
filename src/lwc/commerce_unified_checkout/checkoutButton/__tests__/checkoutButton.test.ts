import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
import type { LightningElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
// @ts-ignore
import CheckoutButton from 'commerce_unified_checkout/checkoutButton';
import { navigate } from 'lightning/navigation';
import { NavigationContext } from 'lightning/navigation';

import { CartSummaryAdapter } from 'commerce/cartApi';

const START_CHECKOUT = 'startcheckout';

jest.mock(
    'lightning/navigation',
    () => {
        const Navigate = Symbol('Navigate');
        const GenerateUrl = Symbol('GenerateUrl');
        const NavigationMixin = (Base: LightningElement): LightningElement => {
            // @ts-ignore
            return class extends Base {
                [Navigate](): void {
                    throw new Error('Imperative use is not supported. Use @wire(adapterId)');
                }
                [GenerateUrl](_cartId: string): string {
                    throw new Error('Imperative use is not supported. Use @wire(adapterId)');
                }
            };
        };

        return {
            NavigationMixin,
            navigate: jest.fn(),
            NavigationContext: mockCreateTestWireAdapter(),
        };
    },
    { virtual: true }
);

jest.mock('commerce/cartApi', () =>
    Object.assign({}, jest.requireActual('commerce/cartApi'), {
        CartSummaryAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

describe('commerce_unified_checkout/checkoutButton: CheckoutButton', () => {
    let element: HTMLElement & CheckoutButton;

    beforeEach(() => {
        (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({});
        (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({});

        element = createElement('commerce_unified_checkout-checkout-button', {
            is: CheckoutButton,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    describe('Checkout Button on Cart Page', () => {
        it('button is enabled when there are items in cart', async () => {
            (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({
                data: { totalProductCount: '10' },
            });
            await Promise.resolve();

            const commerceCheckout = <HTMLElement>element.querySelector('commerce_checkout-checkout-button');
            const checkoutButton = <HTMLButtonElement>commerceCheckout.shadowRoot?.querySelector('.slds-button');

            expect(checkoutButton.disabled).toBe(false);
        });

        it('button is disabled when no items in cart', async () => {
            (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({
                data: { totalProductCount: '0' },
            });
            await Promise.resolve();

            const commerceCheckout = <HTMLElement>element.querySelector('commerce_checkout-checkout-button');
            const checkoutButton = <HTMLButtonElement>commerceCheckout.shadowRoot?.querySelector('.slds-button');
            checkoutButton.click();

            expect(checkoutButton.disabled).toBe(true);
        });

        it('button is disabled when cart summary adapter returns error', async () => {
            (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({
                status: 500,
                error: 'Error',
            });
            await Promise.resolve();

            const commerceCheckout = <HTMLElement>element.querySelector('commerce_checkout-checkout-button');
            const checkoutButton = <HTMLButtonElement>commerceCheckout.shadowRoot?.querySelector('.slds-button');
            checkoutButton.click();

            expect(checkoutButton.disabled).toBe(true);
        });

        it('triggers navigation on click', async () => {
            (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({
                data: { totalProductCount: '10' },
            });
            await Promise.resolve();

            const commerceCheckout = <HTMLElement>element.querySelector('commerce_checkout-checkout-button');
            const checkoutButton = <HTMLButtonElement>commerceCheckout.shadowRoot?.querySelector('.slds-button');
            checkoutButton.click();

            expect(navigate).toHaveBeenCalledWith(undefined, {
                type: 'comm__namedPage',
                attributes: {
                    name: 'Current_Checkout',
                },
            });
        });

        it(`triggers the '${START_CHECKOUT}' event on click`, async () => {
            (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({
                data: { totalProductCount: '10' },
            });
            await Promise.resolve();

            const handler = jest.fn();

            const commerceCheckout = <HTMLElement>element.querySelector('commerce_checkout-checkout-button');

            element.addEventListener(START_CHECKOUT, handler);
            commerceCheckout.dispatchEvent(
                new CustomEvent('checkoutbuttonclicked', {
                    bubbles: false,
                    composed: false,
                })
            );

            return Promise.resolve().then(() => {
                expect(handler).toHaveBeenCalled();
            });
        });
    });
});
