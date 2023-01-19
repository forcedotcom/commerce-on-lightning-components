import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import CheckoutTest from 'commerce_unified_checkout/checkoutTest';
import { CurrentPageReference } from 'lightning/navigation';
import { CheckoutInformationAdapter } from 'commerce/checkoutApi';
import { CheckoutStatus } from 'commerce_unified_checkout/checkoutApiInternal';

// These mocks cover aspects of interaction with the server that we don't want to be testing
jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => 'current_cart'),
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
    CurrentPageReference: mockCreateTestWireAdapter(),
}));

jest.mock('commerce/checkoutApi', () =>
    Object.assign({}, jest.requireActual('commerce/checkoutApi'), {
        CheckoutInformationAdapter: mockCreateTestWireAdapter(),
    })
);

function delay(milliseconds) {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// We reuse the same `proceed` and `editstep` events in a few scenarios
//
async function proceed(element) {
    const step = element.querySelector('[data-step-key="step1"]');
    const shipping = step.querySelector('[data-child="shipping"]');
    shipping.forceException = true;
    jest.spyOn(shipping, 'checkoutSave');
    step.dispatchEvent(
        new CustomEvent('proceed', {
            detail: {
                step: 'step1',
            },
            bubbles: true,
            composed: true,
        })
    );
    await Promise.resolve();
    expect(shipping.checkoutSave).toHaveBeenCalled();
}

async function editstep(element) {
    await Promise.resolve();
    const step2 = element.querySelector('[data-step-key="step2"]');
    const delivery = step2.querySelector('[data-child="delivery"]');
    step2.dispatchEvent(
        new CustomEvent('editstep', {
            detail: {
                step: 'step2',
            },
            bubbles: true,
            composed: true,
        })
    );
    await Promise.resolve();
    expect(delivery.checkoutMode).toBe(1);
}

async function proceedAndEdit(element) {
    await proceed(element);
    await Promise.resolve();
    await editstep(element);
}

describe('Unified Checkout Test', () => {
    let element;

    beforeEach(() => {
        CurrentPageReference.emit({
            state: {
                app: 'commeditor',
            },
        });

        element = createElement('commerce_unified_checkout-test', {
            is: CheckoutTest,
        });

        document.body.appendChild(element);

        CheckoutInformationAdapter.emit({
            data: {
                checkoutStatus: CheckoutStatus.Ready,
            },
        });
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('Checkout mode changes', () => {
        it('should set api "checkoutMode" on step and child component', () => {
            const step = element.shadowRoot.querySelector('[data-step-key="step1"]');
            const shipping = step.querySelectorAll('[data-child="shipping"]')[0];
            expect(step.checkoutMode).toBe(1);
            expect(shipping.checkoutMode).toBe(1);
        });

        it('should inspect api "checkoutSave" on child component', () => {
            const step = element.shadowRoot.querySelector('[data-step-key="step1"]');
            const shipping = step.querySelectorAll('[data-child="shipping"]')[0];
            expect(shipping.checkoutSave).not.toBeNull();
        });
    });

    describe('checkout mode changes for summary mode', () => {
        it('should set checkout SUMMARY mode on step and child component', () => {
            const step = element.shadowRoot.querySelector('[data-step-key="step1"]');
            const shipping = step.querySelectorAll('[data-child="shipping"]')[0];
            step.summaryMode = true;
            expect(step.checkoutMode).toBe(1);
            expect(shipping.checkoutMode).toBe(1);
        });

        it('should set checkout EDIT mode on step and child component on edit button click event', async () => {
            const step = element.shadowRoot.querySelector('[data-step-key="step1"]');
            const shipping = step.querySelectorAll('[data-child="shipping"]')[0];
            step.summaryMode = true;
            step.dispatchEvent(
                new CustomEvent('editstep', {
                    detail: {
                        step: 'step1',
                    },
                    bubbles: true,
                    composed: true,
                })
            );
            await Promise.resolve();
            expect(shipping.checkoutMode).toBe(3);
        });
    });

    describe('Checkout events', () => {
        it('should handle "proceed" event successfully with no exception', async () => {
            const step = element.shadowRoot.querySelector('[data-step-key="step1"]');
            const genericCheckoutComponent = step.querySelector('[data-child="shipping"]');
            jest.spyOn(genericCheckoutComponent, 'checkoutSave');
            step.dispatchEvent(
                new CustomEvent('proceed', {
                    detail: {
                        step: 'step1',
                    },
                    bubbles: true,
                    composed: true,
                })
            );
            await Promise.resolve();
            expect(genericCheckoutComponent.checkoutSave).toHaveBeenCalled();
        });

        it('should handle "proceed" event with and exception thrown', async () => {
            const step = element.shadowRoot.querySelector('[data-step-key="step1"]');
            const genericCheckoutComponent = step.querySelector('[data-child="shipping"]');
            genericCheckoutComponent.forceException = true;
            jest.spyOn(genericCheckoutComponent, 'checkoutSave');
            step.dispatchEvent(
                new CustomEvent('proceed', {
                    detail: {
                        step: 'step1',
                    },
                    bubbles: true,
                    composed: true,
                })
            );

            await Promise.resolve();
            expect(genericCheckoutComponent.checkoutSave).toHaveBeenCalled();
        });

        it('should handle one page layout mode "proceed" event followed by "editstep" event', async () => {
            const checkoutComponent = element?.shadowRoot.querySelector('[data-checkout]');
            expect(checkoutComponent.isOnePageLayout).toBe(true);

            await proceedAndEdit(checkoutComponent);
        });

        it('should handle one page layout place order event', async () => {
            const checkoutComponent = element?.shadowRoot.querySelector('[data-checkout]');
            expect(checkoutComponent.isOnePageLayout).toBe(true);
            const step = element.shadowRoot.querySelector('[data-step-key="step3-one-page"]');
            const genericCheckoutComponent = step.querySelector('[data-child="payment"]');
            genericCheckoutComponent.placeOrder = jest.fn();
            const clickHandler = jest.fn();
            element.addEventListener('click', clickHandler);
            const placeOrderButton = checkoutComponent?.shadowRoot.querySelector('[data-placeorder]');
            placeOrderButton.click();
            await Promise.resolve();
            expect(placeOrderButton.disabled).toBe(true);
            expect(clickHandler).toHaveBeenCalled();
        });

        it('should handle one page layout place order event with an exception', async () => {
            const checkoutComponent = element?.shadowRoot.querySelector('[data-checkout]');
            const step = element.shadowRoot.querySelector('[data-step-key="step3-one-page"]');
            const genericCheckoutComponent = step.querySelector('[data-child="payment"]');
            //genericCheckoutComponent.placeOrder = jest.fn();
            genericCheckoutComponent.forceException = true;
            const clickHandler = jest.fn();
            element.addEventListener('click', clickHandler);
            const placeOrderButton = checkoutComponent?.shadowRoot.querySelector('[data-placeorder]');
            placeOrderButton.click();
            await Promise.resolve();
            expect(clickHandler).toHaveBeenCalled();
        });

        it('should handle one page layout data ready events for autosave', async () => {
            const checkoutComponent = element?.shadowRoot.querySelector('[data-checkout]');
            const step = element.shadowRoot.querySelector('[data-step-key="step1"]');
            const shipping = step.querySelector('[data-child="shipping"]');
            shipping.checkValidity = true;
            shipping.dispatchEvent(
                new CustomEvent('dataready', {
                    bubbles: true,
                    composed: true,
                })
            );
            await Promise.resolve();
            expect(checkoutComponent.isOnePageLayout).toBe(true);
        });

        it('should handle accordion layout mode "proceed" event followed by "editstep" event', async () => {
            const checkoutComponent = element?.shadowRoot.querySelector('[data-checkout-accordion]');
            expect(checkoutComponent.isOnePageLayout).toBe(false);

            await proceedAndEdit(checkoutComponent);
        });

        it('should handle accordion "proceed" event successfully with no exception', async () => {
            const checkoutComponent = element?.shadowRoot.querySelector('[data-checkout-accordion]');
            expect(checkoutComponent.isOnePageLayout).toBe(false);

            const step = checkoutComponent.querySelector('[data-step-key="step1"]');
            const shipping = step.querySelector('[data-child="shipping"]');
            jest.spyOn(shipping, 'checkoutSave');
            step.dispatchEvent(
                new CustomEvent('proceed', {
                    detail: {
                        step: 'step1',
                    },
                    bubbles: true,
                    composed: true,
                })
            );
            await delay(500); // flaky way to wait until checkout.ts#handleProceed empties its queue
            expect(shipping.checkoutSave).toHaveBeenCalledTimes(1);
        });

        it('should queue "proceed" event successfully with no exception', async () => {
            const checkoutComponent = element?.shadowRoot.querySelector('[data-checkout-accordion]');
            expect(checkoutComponent.isOnePageLayout).toBe(false);

            const step = checkoutComponent.querySelector('[data-step-key="step1"]');
            const shipping = step.querySelector('[data-child="shipping"]');
            jest.spyOn(shipping, 'checkoutSave');
            step.dispatchEvent(
                new CustomEvent('proceed', {
                    detail: {
                        step: 'step1',
                    },
                    bubbles: true,
                    composed: true,
                })
            );
            step.dispatchEvent(
                new CustomEvent('proceed', {
                    detail: {
                        step: 'step1',
                    },
                    bubbles: true,
                    composed: true,
                })
            );
            await delay(500); // flaky way to wait until checkout.ts#handleProceed empties its queue
            expect(shipping.checkoutSave).toHaveBeenCalledTimes(2);
        });
    });
});
