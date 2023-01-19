/**
 *  TO-DO: still needs to be peer reviewed
 */
import { createElement } from 'lwc';
// @ts-ignore
import CheckoutTab from 'commerce_unified_checkout/checkoutTab';

describe('CheckoutTab', () => {
    let element: HTMLElement & CheckoutTab;

    beforeEach(() => {
        element = createElement('commerce_unified_checkout-checkout-tab', {
            is: CheckoutTab,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should check if slot-container-div generated with correct class', () => {
        const div = element.querySelector('div');
        expect(div.classList).toContain('slds-p-around_medium');
        expect(div.classList.contains('slds-show')).toBeFalsy();
        expect(div.classList.contains('slds-hide')).toBeTruthy();
    });

    it('should have component slot generated', async () => {
        const slot = element.querySelector('[name="checkoutStep"]');
        expect(slot).toBeDefined();
        await Promise.resolve();
    });

    it('should have active checkout tab displayed', async () => {
        element.active = true;
        await Promise.resolve();
        const div = element.querySelector('div');
        expect(div.classList.contains('slds-show')).toBeTruthy();
        expect(div.classList.contains('slds-hide')).toBeFalsy();
    });

    it('should have inactive checkout tab hidden', async () => {
        element.active = false;
        await Promise.resolve();
        const div = element.querySelector('div');
        expect(div.classList.contains('slds-hide')).toBeTruthy();
        expect(div.classList.contains('slds-show')).toBeFalsy();
    });
});
