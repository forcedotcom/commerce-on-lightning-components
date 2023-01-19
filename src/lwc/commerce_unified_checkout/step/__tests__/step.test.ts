import { createElement } from 'lwc';
import Step from 'commerce_unified_checkout/step';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';

describe('checkout step', () => {
    let element: HTMLElement & Step;
    beforeEach(() => {
        element = createElement('commerce_unified_checkout-step', {
            is: Step,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('expanded', () => {
        it('can be expanded on component initialization', () => {
            element.expanded = true;
            expect(element.expanded).toBeTruthy();
        });

        it('can be contracted on component initialization', () => {
            element.expanded = false;
            expect(element.expanded).toBeFalsy();
        });

        it('should fire an event when edit is clicked', async () => {
            element.checkoutMode = CheckoutMode.SUMMARY;
            await Promise.resolve();

            let dispatched = false;
            element.addEventListener('editstep', () => {
                dispatched = true;
            });

            // @ts-ignore
            element?.shadowRoot?.querySelector('[data-edit]').click();
            await Promise.resolve();
            expect(dispatched).toBe(true);
        });

        it('can be toggled using public toggle method', () => {
            element.toggle(false);
            expect(element.expanded).toBeFalsy();

            element.toggle(true);
            expect(element.expanded).toBeTruthy();

            element.toggle();
            expect(element.expanded).toBeFalsy();
        });
    });

    describe('proceed', () => {
        it('should fire an event when proceed is clicked', async () => {
            let dispatched = false;
            element.addEventListener('proceed', () => {
                dispatched = true;
            });

            // @ts-ignore
            element?.shadowRoot?.querySelector('[data-proceed]').click();
            await Promise.resolve();

            expect(dispatched).toBe(true);
        });
    });

    describe('slotchange', () => {
        it('should handle an event when slotchange is fired', async () => {
            let dispatched = false;
            element.addEventListener('slotchange', () => {
                dispatched = true;
            });

            element.dispatchEvent(new CustomEvent('slotchange'));
            await Promise.resolve();

            expect(dispatched).toBe(true);
        });
    });

    describe('checkoutmode', () => {
        it('should set all checkout modes and expanded correctly', () => {
            [CheckoutMode.FUTURE, CheckoutMode.EDIT, CheckoutMode.SUMMARY, CheckoutMode.DISABLED].forEach((mode) => {
                element.checkoutMode = mode;
                expect(element.checkoutMode).toEqual(mode);
            });
        });

        it('should expand accordion when checkout mode value other than FUTURE', async () => {
            element.checkoutMode = CheckoutMode.EDIT;
            await Promise.resolve();
            // @ts-ignore
            expect(element?.shadowRoot?.querySelector('section').classList.contains('slds-is-open')).toBeTruthy();
            element.checkoutMode = CheckoutMode.FUTURE;
            await Promise.resolve();
            // @ts-ignore
            expect(element?.shadowRoot?.querySelector('section').classList.contains('slds-is-open')).toBeFalsy();
        });
    });

    describe('issummarymode', () => {
        it('can show summary mode and checkout mode summary on component initialization', async () => {
            // @ts-ignore
            const section = element?.shadowRoot?.querySelector('section');
            await Promise.resolve();
            section.dispatchEvent(new CustomEvent('showsummarymode', { bubbles: true, composed: true }));
            await Promise.resolve();
            expect(element.summaryMode).toBeTruthy();
            expect(element.checkoutMode).toBe(1);
        });

        it('should fire an event to show checkout mode: EDIT when edit button is clicked', async () => {
            element.summaryMode = true;
            element.checkoutMode = CheckoutMode.SUMMARY;
            await Promise.resolve();

            let dispatched = false;
            element.addEventListener('editstep', () => {
                dispatched = true;
            });

            // @ts-ignore
            element?.shadowRoot?.querySelector('[data-edit]').click();
            await Promise.resolve();
            expect(dispatched).toBe(true);
            expect(element.checkoutMode).toBe(3);
        });

        it('should fire an event to hide summary mode when edit button is clicked', async () => {
            element.summaryMode = true;
            element.checkoutMode = CheckoutMode.SUMMARY;
            await Promise.resolve();

            let dispatched = false;
            element.addEventListener('editstep', () => {
                dispatched = true;
            });

            // @ts-ignore
            element?.shadowRoot?.querySelector('[data-edit]').click();
            await Promise.resolve();
            expect(dispatched).toBe(true);
            expect(element.summaryMode).toBeFalsy();
            // @ts-ignore
            const section = element?.shadowRoot?.querySelector('section');
            await Promise.resolve();
            section.dispatchEvent(new CustomEvent('hidesummarymode', { bubbles: true, composed: true }));
            await Promise.resolve();
            expect(element.summaryMode).toBeFalsy();
        });
    });

    describe('edit button', () => {
        it('should handle hideeditbutton event when event listener gets it', async () => {
            element.checkoutMode = CheckoutMode.SUMMARY;
            await Promise.resolve();
            // @ts-ignore
            const section = element?.shadowRoot?.querySelector('section');
            // @ts-ignore
            expect(element.shadowRoot?.querySelector('[data-edit]')).toBeTruthy();
            await Promise.resolve();
            section.dispatchEvent(new CustomEvent('hideeditbutton', { bubbles: true, composed: true }));
            await Promise.resolve();
            // @ts-ignore
            expect(element.shadowRoot?.querySelector('[data-edit]')).toBeNull();
        });

        it('should handle showeditbutton event when event listener gets it', async () => {
            element.checkoutMode = CheckoutMode.SUMMARY;
            await Promise.resolve();
            // @ts-ignore
            const section = element?.shadowRoot?.querySelector('section');
            await Promise.resolve();
            section.dispatchEvent(new CustomEvent('hideeditbutton', { bubbles: true, composed: true }));
            await Promise.resolve();
            // @ts-ignore
            expect(element.shadowRoot?.querySelector('[data-edit]')).toBeNull();

            await Promise.resolve();
            section.dispatchEvent(new CustomEvent('showeditbutton', { bubbles: true, composed: true }));
            await Promise.resolve();
            // @ts-ignore
            expect(element.shadowRoot?.querySelector('[data-edit]')).toBeTruthy();
        });
    });
});
