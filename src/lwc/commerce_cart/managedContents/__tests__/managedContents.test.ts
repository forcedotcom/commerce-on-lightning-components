import { createElement } from 'lwc';
import ManagedContents from 'commerce_cart/managedContents';

import type Footer from 'commerce_cart/footer';

describe('Cart Managed Contents', () => {
    let element: HTMLElement & ManagedContents;

    beforeEach(() => {
        jest.clearAllMocks();
        console.warn = jest.fn();

        element = createElement('commerce_cart-managed-contents', {
            is: ManagedContents,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should not display the cart footer when "showFooter" value is "false"', async () => {
        element.showFooter = false;

        await Promise.resolve();

        const footer: (HTMLElement & Footer) | null = element.querySelector('commerce_cart-footer');
        expect(footer).toBeNull();
    });

    it('should not display the cart footer when "showFooter" value is not set', () => {
        const footer: (HTMLElement & Footer) | null = element.querySelector('commerce_cart-footer');
        expect(footer).toBeNull();
    });

    it('displays the footer when showFooter is: true', async () => {
        element.showFooter = true;

        await Promise.resolve();

        const footer: (HTMLElement & Footer) | null = element.querySelector('commerce_cart-footer');
        expect(footer).not.toBeNull();
    });

    describe('a11y', () => {
        it('is accessible', () => {
            // Assert that the element is accessible
            return Promise.resolve().then(async () => {
                await expect(element).toBeAccessible();
            });
        });
    });
});
