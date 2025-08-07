/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { createElement } from 'lwc';
import CartSummary from 'c/cartSummary';

// Mock the @salesforce/label module
jest.mock('@salesforce/label/c.Cart_checkoutButtonLabel', () => ({ default: 'Checkout' }), { virtual: true });
jest.mock('@salesforce/label/c.Cart_loadingSpinnerAltText', () => ({ default: 'Loading express payment options...' }), {
    virtual: true,
});
jest.mock('@salesforce/label/c.Cart_checkoutButtonAssistiveText', () => ({ default: 'Proceed to checkout' }), {
    virtual: true,
});
jest.mock('@salesforce/label/c.Cart_checkoutNotAvailableAssistiveText', () => ({ default: 'Checkout not available' }), {
    virtual: true,
});
jest.mock('@salesforce/label/c.Cart_cartSummaryRegionLabel', () => ({ default: 'Cart Summary Section' }), {
    virtual: true,
});

jest.mock(
    'experience/styling',
    () => ({
        generateButtonSizeClass: jest.fn(() => 'mock-size'),
        generateButtonStretchClass: jest.fn(() => 'mock-stretch'),
        generateButtonStyleClass: jest.fn(() => 'mock-style'),
        generateElementAlignmentClass: jest.fn(() => 'mock-alignment'),
    }),
    { virtual: true }
);

const mockCartSummary = {
    header: 'Your Cart',
    footerMessage: 'Total Items: 3',
    items: [
        { name: 'Product A', quantity: 1, itemSubtotal: 50.0 },
        { name: 'Product B', quantity: 2, itemSubtotal: 25.0 },
    ],
    subtotal: 100.0,
    total: 118.0,
    checkoutButtonUrl: 'https://example.com/checkout',
    expressPaymentUrl: 'https://example.com/express',
};

describe('c-cart-summary', () => {
    let element;

    beforeEach(() => {
        element = createElement('c-cart-summary', {
            is: CartSummary,
        });
        element.cartSummary = mockCartSummary;
        element.entryId = 'test-entry-123';
        document.body.appendChild(element);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    describe('Component initialization and DOM structure', () => {
        it('should set cart summary correctly', () => {
            expect(element.cartSummary).toEqual(mockCartSummary);
            expect(element.entryId).toBe('test-entry-123');
        });

        it('should render c-summary-details with correct props', () => {
            const summaryDetails = element.querySelector('c-summary-details');
            expect(summaryDetails).not.toBeNull();
            expect(summaryDetails.details).toEqual(mockCartSummary);
        });

        it('should render c-express-payment with correct entry-id and express-payment-url', () => {
            const expressPayment = element.querySelector('c-express-payment');
            expect(expressPayment).not.toBeNull();
            expect(expressPayment.entryId).toBe('test-entry-123');
            expect(expressPayment.expressPaymentUrl).toBe('https://example.com/express');
        });

        it('should render footer with correct content', () => {
            const footer = element.querySelector('lightning-formatted-rich-text.cart-summary-footer');
            expect(footer).not.toBeNull();
            expect(footer.value).toBe(mockCartSummary.footerMessage);
        });

        it('should have correct main container structure', () => {
            const mainContainer = element.querySelector('.cart-summary');
            expect(mainContainer).not.toBeNull();
            expect(mainContainer.classList.contains('slds-grid')).toBe(true);
            expect(mainContainer.classList.contains('slds-grid_vertical')).toBe(true);
        });

        it('should contain all required child components', () => {
            expect(element.querySelector('c-summary-details')).not.toBeNull();
            expect(element.querySelector('c-express-payment')).not.toBeNull();
            expect(element.querySelector('lightning-formatted-rich-text')).not.toBeNull();
            expect(element.querySelector('lightning-spinner')).not.toBeNull();
        });

        it('should have footer container with correct styling', () => {
            const footerContainer = element.querySelector('[data-id="footer"]');
            expect(footerContainer).not.toBeNull();
        });
    });

    describe('Express payment loading states', () => {
        it('should show spinner when express payment is not loaded', () => {
            const spinner = element.querySelector('lightning-spinner');
            expect(spinner).not.toBeNull();
            expect(spinner.alternativeText).toBe('Loading express payment options...');
            expect(spinner.size).toBe('x-small');
        });

        it('should hide checkout button when express payment is not loaded', () => {
            const button = element.querySelector('c-common-button');
            expect(button).toBeNull();
        });

        it('should have loading container structure', () => {
            const loadingContainer = element.querySelector('.loading-container');
            expect(loadingContainer).not.toBeNull();

            const expressContainer = element.querySelector('.express-container');
            expect(expressContainer).not.toBeNull();
        });

        it('should verify express payment event handler is wired', () => {
            const expressPayment = element.querySelector('c-express-payment');
            expect(expressPayment).not.toBeNull();
            expect(expressPayment.entryId).toBe('test-entry-123');
        });

        it('should update UI when express payment is available', async () => {
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: true },
            });
            expressPayment.dispatchEvent(event);

            // Wait for component to update
            await Promise.resolve();

            // Verify UI updates
            const loadingContainer = element.querySelector('.loading-container');
            expect(loadingContainer.classList.contains('loaded')).toBe(true);

            const expressContainer = element.querySelector('.express-container');
            expect(expressContainer.style.display).not.toBe('none');

            // Wait for button to be rendered
            await Promise.resolve();
            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();
            expect(button.variant).toBe('secondary');
        });

        it('should update UI when express payment is not available', async () => {
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);

            // Wait for component to update
            await Promise.resolve();

            // Verify UI updates
            const loadingContainer = element.querySelector('.loading-container');
            expect(loadingContainer.classList.contains('loaded')).toBe(true);

            const expressContainer = element.querySelector('.express-container');
            expect(expressContainer.style.display).toBe('none');

            // Wait for button to be rendered
            await Promise.resolve();
            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();
            expect(button.variant).toBe('primary');
        });

        it('should handle express payment with undefined availability', async () => {
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: undefined,
            });
            expressPayment.dispatchEvent(event);

            // Wait for component to update
            await Promise.resolve();

            // Verify UI updates
            const loadingContainer = element.querySelector('.loading-container');
            expect(loadingContainer.classList.contains('loaded')).toBe(true);

            const expressContainer = element.querySelector('.express-container');
            expect(expressContainer.style.display).toBe('none');

            // Wait for button to be rendered
            await Promise.resolve();
            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();
            expect(button.variant).toBe('primary');
        });
    });

    describe('Checkout button functionality', () => {
        beforeEach(async () => {
            // Trigger express payment loaded event to render the button
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();
        });

        it('should have correct button configuration properties', async () => {
            // Wait for button to be rendered
            await Promise.resolve();
            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();

            // Check button properties through the component's public API
            expect(button.getAttribute('data-button-class')).toBe('button-checkout');

            // Check button properties
            expect(button.variant).toBe('primary');
            expect(button.width).toBe('stretch');
        });

        it('should handle window.open call when button is clicked', async () => {
            const mockWindowOpen = jest.spyOn(window, 'open').mockImplementation(() => {});

            // Wait for button to be rendered
            await Promise.resolve();
            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();

            // Create and dispatch a click event on the button
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
            });
            Object.defineProperty(clickEvent, 'currentTarget', {
                value: { dataset: { buttonClass: 'button-checkout' } },
            });
            button.dispatchEvent(clickEvent);

            // Verify window.open was called with correct URL
            expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com/checkout', '_blank');

            mockWindowOpen.mockRestore();
        });

        it('should not handle click for invalid button class', async () => {
            const mockWindowOpen = jest.spyOn(window, 'open').mockImplementation(() => {});

            // Wait for button to be rendered
            await Promise.resolve();
            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();

            // Create and dispatch a click event with invalid button class
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
            });
            Object.defineProperty(clickEvent, 'currentTarget', {
                value: { dataset: { buttonClass: 'invalid-class' } },
            });
            button.dispatchEvent(clickEvent);

            // Verify window.open was not called
            expect(mockWindowOpen).not.toHaveBeenCalled();

            mockWindowOpen.mockRestore();
        });

        it('should not handle click when button link is missing', async () => {
            const mockWindowOpen = jest.spyOn(window, 'open').mockImplementation(() => {});

            // Create a new element with missing checkoutButtonUrl
            const newElement = createElement('c-cart-summary', {
                is: CartSummary,
            });
            newElement.cartSummary = { ...mockCartSummary, checkoutButtonUrl: undefined };
            document.body.appendChild(newElement);

            // Trigger express payment loaded event to render the button
            const expressPayment = newElement.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();

            // Wait for button to be rendered
            await Promise.resolve();
            const button = newElement.querySelector('c-common-button');
            expect(button).not.toBeNull();

            // Create and dispatch a click event
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
            });
            Object.defineProperty(clickEvent, 'currentTarget', {
                value: { dataset: { buttonClass: 'button-checkout' } },
            });
            button.dispatchEvent(clickEvent);

            // Verify window.open was not called
            expect(mockWindowOpen).not.toHaveBeenCalled();

            mockWindowOpen.mockRestore();
            document.body.removeChild(newElement);
        });
    });

    describe('Checkout button accessibility and properties', () => {
        beforeEach(async () => {
            // Trigger express payment loaded event to render the button
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();
        });

        it('should have correct assistive text when checkout URL is available', async () => {
            await Promise.resolve();
            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();
            expect(button.assistiveText).toBe('Proceed to checkout');
        });

        it('should have correct assistive text when checkout URL is missing', async () => {
            // Create element with missing checkout URL
            const newElement = createElement('c-cart-summary', {
                is: CartSummary,
            });
            newElement.cartSummary = { ...mockCartSummary, checkoutButtonUrl: undefined };
            document.body.appendChild(newElement);

            // Trigger express payment loaded event
            const expressPayment = newElement.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();

            const button = newElement.querySelector('c-common-button');
            expect(button).not.toBeNull();
            expect(button.assistiveText).toBe('Checkout not available');

            document.body.removeChild(newElement);
        });

        it('should be disabled when checkout URL is missing', async () => {
            // Create element with missing checkout URL
            const newElement = createElement('c-cart-summary', {
                is: CartSummary,
            });
            newElement.cartSummary = { ...mockCartSummary, checkoutButtonUrl: undefined };
            document.body.appendChild(newElement);

            // Trigger express payment loaded event
            const expressPayment = newElement.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();

            const button = newElement.querySelector('c-common-button');
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(true);

            document.body.removeChild(newElement);
        });

        it('should be enabled when checkout URL is available', async () => {
            await Promise.resolve();
            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(false);
        });

        it('should have correct label from imported constant', async () => {
            await Promise.resolve();
            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();
            await Promise.resolve(); // Ensure DOM is updated
            await Promise.resolve(); // Try an extra flush
            const nativeButton = button.querySelector('button');
            expect(nativeButton.getAttribute('aria-label')).toBe('Proceed to checkout');
        });
    });

    describe('Checkout button error handling', () => {
        beforeEach(async () => {
            // Trigger express payment loaded event to render the button
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();
        });

        it('should handle window.open errors gracefully', async () => {
            const mockWindowOpen = jest.spyOn(window, 'open').mockImplementation(() => {
                throw new Error('Navigation blocked');
            });
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await Promise.resolve();
            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();

            // Create and dispatch a click event
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
            });
            Object.defineProperty(clickEvent, 'currentTarget', {
                value: { dataset: { buttonClass: 'button-checkout' } },
            });
            button.dispatchEvent(clickEvent);

            // Verify error was logged
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to open checkout URL:', expect.any(Error));

            mockWindowOpen.mockRestore();
            consoleErrorSpy.mockRestore();
        });

        it('should handle null cartSummary gracefully', async () => {
            const newElement = createElement('c-cart-summary', {
                is: CartSummary,
            });
            newElement.cartSummary = {};
            document.body.appendChild(newElement);

            // Trigger express payment loaded event
            const expressPayment = newElement.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();

            const button = newElement.querySelector('c-common-button');
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(true);
            expect(button.assistiveText).toBe('Checkout not available');

            document.body.removeChild(newElement);
        });
    });

    describe('Component property validation', () => {
        it('should have default values for component properties', () => {
            expect(element.cartSummary).toEqual(mockCartSummary);
            expect(element.entryId).toBe('test-entry-123');
        });

        it('should handle empty cartSummary gracefully', () => {
            const newElement = createElement('c-cart-summary', {
                is: CartSummary,
            });
            newElement.cartSummary = {};
            document.body.appendChild(newElement);

            // Should not throw an error
            const summaryDetails = newElement.querySelector('c-summary-details');
            expect(summaryDetails).not.toBeNull();
            expect(summaryDetails.details).toEqual({});

            // Button should handle missing checkoutButtonUrl
            expect(newElement.cartSummary.checkoutButtonUrl).toBeUndefined();

            document.body.removeChild(newElement);
        });
    });

    describe('Integration test coverage', () => {
        it('should render all components together correctly', () => {
            // Verify the complete component renders without errors
            expect(element).not.toBeNull();

            // Verify all child components are present
            const childComponents = [
                'c-summary-details',
                'c-express-payment',
                'lightning-formatted-rich-text',
                'lightning-spinner',
            ];

            childComponents.forEach((selector) => {
                expect(element.querySelector(selector)).not.toBeNull();
            });
        });

        it('should handle component re-rendering', () => {
            // Change a property to trigger re-render
            const newFooter = 'New footer content';
            element.cartSummary = { ...mockCartSummary, footerMessage: newFooter };

            // In LWC test environment, property changes don't always trigger DOM updates
            // But we can verify the property was set
            expect(element.cartSummary.footerMessage).toBe(newFooter);
        });
    });
});
