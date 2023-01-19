/**
 *  TO-DO: still needs to be peer reviewed
 */
import { createElement } from 'lwc';
// @ts-ignore
import CheckoutTabset from 'commerce_unified_checkout/checkoutTabset';

describe('CheckoutTabset', () => {
    let element: HTMLElement & CheckoutTabset;

    beforeEach(() => {
        element = createElement('commerce_unified_checkout-checkout-tabset', {
            is: CheckoutTabset,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should check if stepsConfig json string is defined on initial rendering of component', () => {
        expect(element.stepsConfig).toBeDefined();
    });

    it('should have desired number of checkout steps generated and displayed', () => {
        const checkoutSteps = element.checkoutSteps;
        const listItems = element.querySelectorAll('li.step');
        expect(listItems).toHaveLength(checkoutSteps.length);
    });

    it('should have all inactive checkout steps hidden', async () => {
        const checkoutStepsList = element.checkoutSteps;
        checkoutStepsList[0].isActive = false;
        element.stepsConfig = JSON.stringify(checkoutStepsList);
        await Promise.resolve();
        const div1 = element.querySelector('li.step > div');
        expect(div1.classList.contains('slds-is-active')).toBeFalsy();

        checkoutStepsList[0].isActive = true;
        element.stepsConfig = JSON.stringify(checkoutStepsList);
        await Promise.resolve();
        const div = element.querySelector('li.step > div');
        expect(div.classList.contains('slds-is-active')).toBeTruthy();
    });
});
