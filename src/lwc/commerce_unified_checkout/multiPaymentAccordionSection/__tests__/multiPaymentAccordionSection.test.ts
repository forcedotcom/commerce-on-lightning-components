import { createElement } from 'lwc';
import MultiPaymentAccordionSection from '../multiPaymentAccordionSection';

const createComponentUnderTest = (): HTMLElement & MultiPaymentAccordionSection => {
    const element: HTMLElement & MultiPaymentAccordionSection = createElement(
        'commerce_unified_checkout-multi-payment-accordion-section',
        {
            is: MultiPaymentAccordionSection,
        }
    );
    element.sectionName = 'credit-card';
    element.sectionLabel = 'Credit Card';

    document.body.appendChild(element);
    return element;
};

describe('MultiPaymentAccordionSection', () => {
    let element: HTMLElement & MultiPaymentAccordionSection;
    beforeEach(() => {
        element = createComponentUnderTest();
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('is accessible', async () => {
        await expect(element).toBeAccessible();
    });

    describe('expanded', () => {
        it('is collapsed on component initialization', async () => {
            element.isExpanded = false;
            await Promise.resolve();
            const content = (element.shadowRoot as ShadowRoot | null)?.querySelector(
                '[data-accordion-section-content="credit-card"]'
            );
            expect(content).toBeNull();
        });

        it('is expanded when assigned as the selected section', async () => {
            element.isExpanded = true;
            await Promise.resolve();
            const content = (element.shadowRoot as ShadowRoot | null)?.querySelector(
                `[data-accordion-section-content="${element.sectionName}"]`
            );
            expect(content).not.toBeNull();
        });

        it('should fire an event when label is clicked', async () => {
            let dispatched = false;
            element.addEventListener('sectionselected', () => {
                dispatched = true;
            });
            const button = (element.shadowRoot as ShadowRoot | null)?.querySelector('[data-accordion-section-button]');
            (button as HTMLButtonElement)?.click();
            await Promise.resolve();
            expect(dispatched).toBe(true);
        });
    });
});
