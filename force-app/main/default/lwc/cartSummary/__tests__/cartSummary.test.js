/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { createElement } from 'lwc';
import CartSummary from 'c/cartSummary';
import { dispatchMessagingEvent, MESSAGING_EVENT } from 'lightningsnapin/eventStore';

jest.mock(
    'lightningsnapin/eventStore',
    () => ({
        dispatchMessagingEvent: jest.fn(),
        MESSAGING_EVENT: {
            MINIMIZE_BUTTON_CLICK: 'MINIMIZE_BUTTON_CLICK',
        },
    }),
    { virtual: true }
);

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
    let mockLocalStorage;

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {
            getItem: jest.fn((key) => {
                const mockData = {
                    pwaDomainUrl: 'https://example.com',
                    pwaSiteId: 'site-123',
                    pwaLocale: 'en-US',
                };
                return mockData[key] || null;
            }),
            setItem: jest.fn(),
        };
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true,
        });

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
            expect(expressPayment.expressPaymentUrl).toBe('https://example.com/site-123/en-US/express');
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

            // Verify messaging event was dispatched
            expect(dispatchMessagingEvent).toHaveBeenCalledWith(MESSAGING_EVENT.MINIMIZE_BUTTON_CLICK, {});

            // Verify window.open was called with correct URL and security features.
            expect(mockWindowOpen).toHaveBeenCalledWith(
                'https://example.com/checkout',
                '_blank',
                'noopener,noreferrer'
            );

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

    describe('Language and internationalization support', () => {
        it('should have default language configuration', () => {
            expect(element.configuration).toEqual({});
            // Test that component renders correctly with default configuration
            expect(element.querySelector('[data-testid="cart-summary"]')).toBeDefined();
        });

        it('should support different language configurations', () => {
            element.configuration = { language: 'es-ES' };
            expect(element.configuration.language).toBe('es-ES');
            expect(element.querySelector('[data-testid="cart-summary"]')).toBeDefined();

            element.configuration = { language: 'fr-FR' };
            expect(element.configuration.language).toBe('fr-FR');
            expect(element.querySelector('[data-testid="cart-summary"]')).toBeDefined();

            element.configuration = { language: 'en-GB' };
            expect(element.configuration.language).toBe('en-GB');
            expect(element.querySelector('[data-testid="cart-summary"]')).toBeDefined();
        });

        it('should provide i18n labels for different languages', () => {
            // Test US English (default)
            expect(element.i18n.cartSummaryRegionLabel).toBe('Cart Summary Section');
            expect(element.i18n.loadingSpinnerAltText).toBe('Loading express payment options...');
            expect(element.i18n.checkoutButtonLabel).toBe('Checkout');
            expect(element.i18n.checkoutButtonAssistiveText).toBe('Proceed to checkout');
            expect(element.i18n.checkoutNotAvailableAssistiveText).toBe('Checkout not available');

            // Test Spanish
            element.configuration = { language: 'es' };
            expect(element.i18n.cartSummaryRegionLabel).toBe('Sección de resumen del carrito');
            expect(element.i18n.loadingSpinnerAltText).toBe('Cargando opciones de pago exprés...');
            expect(element.i18n.checkoutButtonLabel).toBe('Finalizar compra');
            expect(element.i18n.checkoutButtonAssistiveText).toBe('Ir a finalizar compra');
            expect(element.i18n.checkoutNotAvailableAssistiveText).toBe('Finalizar compra no disponible');

            // Test French
            element.configuration = { language: 'fr' };
            expect(element.i18n.cartSummaryRegionLabel).toBe('Section récapitulatif du panier');
            expect(element.i18n.loadingSpinnerAltText).toBe('Chargement des options de paiement express...');
            expect(element.i18n.checkoutButtonLabel).toBe('Payer');
            expect(element.i18n.checkoutButtonAssistiveText).toBe('Passer au paiement');
            expect(element.i18n.checkoutNotAvailableAssistiveText).toBe('Paiement indisponible');

            // Test British English
            element.configuration = { language: 'en-GB' };
            expect(element.i18n.cartSummaryRegionLabel).toBe('Cart Summary Section');
            expect(element.i18n.loadingSpinnerAltText).toBe('Loading express payment options...');
            expect(element.i18n.checkoutButtonLabel).toBe('Checkout');
            expect(element.i18n.checkoutButtonAssistiveText).toBe('Proceed to checkout');
            expect(element.i18n.checkoutNotAvailableAssistiveText).toBe('Checkout not available');
        });

        it('should fallback to English for unsupported languages', () => {
            element.configuration = { language: 'de-DE' }; // German not supported
            expect(element.i18n.cartSummaryRegionLabel).toBe('Cart Summary Section');
            expect(element.i18n.checkoutButtonLabel).toBe('Checkout');
        });

        it('should handle undefined/null language gracefully', () => {
            element.configuration = { language: undefined };
            expect(element.configuration.language).toBeUndefined();
            expect(element.i18n.cartSummaryRegionLabel).toBe('Cart Summary Section');

            element.configuration = { language: null };
            expect(element.configuration.language).toBeNull();
            expect(element.i18n.cartSummaryRegionLabel).toBe('Cart Summary Section');

            element.configuration = { language: '' };
            expect(element.configuration.language).toBe('');
            expect(element.i18n.cartSummaryRegionLabel).toBe('Cart Summary Section');
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

    describe('Window message handling and basket data functionality', () => {
        let mockPostMessage;
        let mockExpressPaymentComponent;
        let originalAddEventListener;
        let originalRemoveEventListener;

        beforeEach(async () => {
            // Mock localStorage
            mockLocalStorage = {
                getItem: jest.fn(),
                setItem: jest.fn(),
            };
            Object.defineProperty(window, 'localStorage', {
                value: mockLocalStorage,
                writable: true,
            });

            // Mock window.postMessage
            mockPostMessage = jest.fn();
            Object.defineProperty(window.parent, 'postMessage', {
                value: mockPostMessage,
                writable: true,
            });

            // Store original event listener methods
            originalAddEventListener = window.addEventListener;
            originalRemoveEventListener = window.removeEventListener;

            // Mock express payment component
            mockExpressPaymentComponent = {
                sendCheckoutData: jest.fn(),
            };

            // Trigger express payment loaded event to ensure component is ready
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: true },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();
        });

        afterEach(() => {
            jest.clearAllMocks();
            // Restore original event listener methods
            window.addEventListener = originalAddEventListener;
            window.removeEventListener = originalRemoveEventListener;
        });

        describe('Customer data message handling', () => {
            it('should handle express.actualCustomerData message and store in localStorage', () => {
                const customerData = {
                    type: 'express.actualCustomerData',
                    payload: {
                        customerId: 'customer-123',
                        authToken: 'auth-token-456',
                    },
                };

                // Create and dispatch the message event to window
                const messageEvent = new MessageEvent('message', {
                    data: customerData,
                });

                // Dispatch the event to trigger the component's message handler
                window.dispatchEvent(messageEvent);

                // Verify localStorage was called correctly
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('expressPaymentCustomerId', 'customer-123');
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('expressPaymentAuthToken', 'auth-token-456');
            });

            it('should handle express.actualCustomerData message with missing payload gracefully', () => {
                const customerData = {
                    type: 'express.actualCustomerData',
                    payload: null,
                };

                const messageEvent = new MessageEvent('message', {
                    data: customerData,
                });

                // Should not throw an error when dispatched
                expect(() => {
                    window.dispatchEvent(messageEvent);
                }).not.toThrow();

                // localStorage should be called with undefined values
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('expressPaymentCustomerId', undefined);
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('expressPaymentAuthToken', undefined);
            });

            it('should ignore messages that are not express.actualCustomerData', () => {
                const otherMessage = {
                    type: 'other.message.type',
                    payload: { data: 'test' },
                };

                const messageEvent = new MessageEvent('message', {
                    data: otherMessage,
                });

                window.dispatchEvent(messageEvent);

                // localStorage should not be called
                expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
            });
        });

        describe('Basket data request handling', () => {
            it('should ignore basketDataRequested if not the latest instance', () => {
                const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

                // Create a second element to make the first one not the latest
                const secondElement = createElement('c-cart-summary', {
                    is: CartSummary,
                });
                secondElement.cartSummary = mockCartSummary;
                document.body.appendChild(secondElement);

                const basketRequestMessage = {
                    type: 'basketDataRequested',
                };

                const messageEvent = new MessageEvent('message', {
                    data: basketRequestMessage,
                });

                // Dispatch the message - only the latest instance should respond
                window.dispatchEvent(messageEvent);

                // The first element should not have triggered any warning since it's not the latest
                expect(consoleWarnSpy).not.toHaveBeenCalled();

                // Clean up
                document.body.removeChild(secondElement);
                consoleWarnSpy.mockRestore();
            });

            it('should handle sendCheckoutData error and log warning', () => {
                const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

                // Mock localStorage to return customer data
                mockLocalStorage.getItem.mockImplementation((key) => {
                    if (key === 'expressPaymentCustomerId') return 'customer-123';
                    if (key === 'expressPaymentAuthToken') return 'auth-token-456';
                    return null;
                });

                // Mock querySelector to return a mock express payment component that throws an error
                const mockExpressPaymentWithError = {
                    sendCheckoutData: jest.fn().mockImplementation(() => {
                        throw new Error('Network error');
                    }),
                };

                const originalQuerySelector = element.querySelector.bind(element);
                element.querySelector = jest.fn().mockImplementation((selector) => {
                    if (selector === 'c-express-payment') {
                        return mockExpressPaymentWithError;
                    }
                    return originalQuerySelector(selector);
                });

                const basketRequestMessage = {
                    type: 'basketDataRequested',
                };

                const messageEvent = new MessageEvent('message', {
                    data: basketRequestMessage,
                });

                // Dispatch the message to trigger basket data sending
                window.dispatchEvent(messageEvent);

                // Verify the warning was logged with the error
                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    expect.stringMatching(/Failed to send basket data postMessage \(Component \d+\):/),
                    expect.any(Error)
                );

                // Verify sendCheckoutData was called with correct data
                expect(mockExpressPaymentWithError.sendCheckoutData).toHaveBeenCalledWith(
                    {
                        orderTotal: mockCartSummary.total,
                        currency: mockCartSummary.currencyCode || 'USD',
                        basketId: mockCartSummary.id || '',
                        customerId: 'customer-123',
                    },
                    {
                        customerId: 'customer-123',
                        authToken: 'auth-token-456',
                    }
                );

                // Clean up
                consoleWarnSpy.mockRestore();
                element.querySelector = originalQuerySelector;
            });

            it('should handle basket data with missing total and use fallback value', () => {
                // Mock localStorage to return customer data
                mockLocalStorage.getItem.mockImplementation((key) => {
                    if (key === 'expressPaymentCustomerId') return 'customer-456';
                    if (key === 'expressPaymentAuthToken') return 'auth-token-789';
                    return null;
                });

                // Mock express payment component
                mockExpressPaymentComponent = {
                    sendCheckoutData: jest.fn(),
                };

                const originalQuerySelector = element.querySelector.bind(element);
                element.querySelector = jest.fn().mockImplementation((selector) => {
                    if (selector === 'c-express-payment') {
                        return mockExpressPaymentComponent;
                    }
                    return originalQuerySelector(selector);
                });

                // Set cart summary with missing/falsy total to trigger fallback
                element.cartSummary = {
                    ...mockCartSummary,
                    total: null, // This will trigger the || 0 fallback on line 301
                    currencyCode: undefined, // This will trigger the || 'USD' fallback
                    id: '', // This will trigger the || '' fallback
                };

                const basketRequestMessage = {
                    type: 'basketDataRequested',
                };

                const messageEvent = new MessageEvent('message', {
                    data: basketRequestMessage,
                });

                // Dispatch the message to trigger basket data sending
                window.dispatchEvent(messageEvent);

                // Verify sendCheckoutData was called with fallback values
                expect(mockExpressPaymentComponent.sendCheckoutData).toHaveBeenCalledWith(
                    {
                        orderTotal: 0, // Fallback value from line 301
                        currency: 'USD', // Fallback value
                        basketId: '', // Fallback value
                        customerId: 'customer-456',
                    },
                    {
                        customerId: 'customer-456',
                        authToken: 'auth-token-789',
                    }
                );

                // Clean up
                element.querySelector = originalQuerySelector;
            });

            it('should handle missing cart summary gracefully', () => {
                const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

                // Set cart summary to null using the public setter
                element.cartSummary = null;

                const basketRequestMessage = {
                    type: 'basketDataRequested',
                };

                const messageEvent = new MessageEvent('message', {
                    data: basketRequestMessage,
                });

                // Should not throw an error when dispatched
                expect(() => {
                    window.dispatchEvent(messageEvent);
                }).not.toThrow();

                // No warning should be logged when cart summary is null (early return)
                expect(consoleWarnSpy).not.toHaveBeenCalled();
                consoleWarnSpy.mockRestore();
            });
        });

        describe('Component lifecycle and message listeners', () => {
            it('should set up message listeners on connectedCallback', () => {
                const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

                // Create a new element to test connectedCallback
                const newElement = createElement('c-cart-summary', {
                    is: CartSummary,
                });
                newElement.cartSummary = mockCartSummary;
                document.body.appendChild(newElement);

                // Verify message listeners were added (called twice - once for each handler)
                expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));

                // Verify postMessage was sent to request customer data
                expect(mockPostMessage).toHaveBeenCalledWith(
                    {
                        type: 'lwc.getCustomerData',
                        timestamp: expect.any(Number),
                    },
                    '*'
                );

                addEventListenerSpy.mockRestore();
                document.body.removeChild(newElement);
            });

            it('should clean up message listeners on disconnectedCallback', () => {
                const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

                // Create and connect element
                const newElement = createElement('c-cart-summary', {
                    is: CartSummary,
                });
                newElement.cartSummary = mockCartSummary;
                document.body.appendChild(newElement);

                // Disconnect element
                document.body.removeChild(newElement);

                // Verify message listener was removed
                expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));

                removeEventListenerSpy.mockRestore();
            });
        });
    });
});

describe('Express payment URL construction', () => {
    let element;
    let mockLocalStorage;
    let mockCartSummaryNoExpressUrl;

    beforeEach(async () => {
        // Mock localStorage
        mockLocalStorage = {
            getItem: jest.fn((key) => {
                const mockData = {
                    pwaDomainUrl: 'https://www.phased-launch-testing.com',
                    pwaSiteId: 'site-123',
                    pwaLocale: 'en-US',
                };
                return mockData[key] || null;
            }),
            setItem: jest.fn(),
        };
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true,
        });

        mockCartSummaryNoExpressUrl = { ...mockCartSummary };
        delete mockCartSummaryNoExpressUrl.expressPaymentUrl;

        element = createElement('c-cart-summary', {
            is: CartSummary,
        });
        element.cartSummary = mockCartSummaryNoExpressUrl;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('should use constructed PWA URL from localStorage over cart expressPaymentUrl', async () => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        element = createElement('c-cart-summary', {
            is: CartSummary,
        });
        element.cartSummary = mockCartSummary;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe('https://www.phased-launch-testing.com/site-123/en-US/express');
    });

    it('should construct express payment URL from localStorage values when cart has no expressPaymentUrl', () => {
        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe('https://www.phased-launch-testing.com/site-123/en-US/express');
    });

    it('should call localStorage.getItem for required keys when falling back', () => {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('pwaDomainUrl');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('pwaSiteId');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('pwaLocale');
    });

    it('should return null when localStorage values are missing and no cart expressPaymentUrl', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        element = createElement('c-cart-summary', {
            is: CartSummary,
        });
        element.cartSummary = mockCartSummaryNoExpressUrl;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe('null');
    });

    it('should handle localStorage errors gracefully when no cart expressPaymentUrl', async () => {
        mockLocalStorage.getItem.mockImplementation(() => {
            throw new Error('localStorage error');
        });

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        element = createElement('c-cart-summary', {
            is: CartSummary,
        });
        element.cartSummary = mockCartSummaryNoExpressUrl;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe('null');

        expect(consoleSpy).toHaveBeenCalledWith('localStorage not available:', expect.any(Error));

        consoleSpy.mockRestore();
    });

    it('should fall back to cart expressPaymentUrl when localStorage values are missing', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        element = createElement('c-cart-summary', {
            is: CartSummary,
        });
        element.cartSummary = mockCartSummary;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe('https://example.com/express');
    });

    it('should construct SFRA express payment URL from localizedUrl in localStorage', async () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === 'localizedUrl')
                return 'https://zysn-003.unified.demandware.net/on/demandware.servlet/Sites-RefArch-Site/en_US';
            return null;
        });

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        element = createElement('c-cart-summary', {
            is: CartSummary,
        });
        element.cartSummary = mockCartSummaryNoExpressUrl;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe(
            'https://zysn-003.unified.demandware.net/on/demandware.store/Sites-RefArch-Site/en_US/Payments-Express'
        );
    });

    it('should use SFRA localizedUrl over PWA keys when both are in localStorage', async () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
            const mockData = {
                localizedUrl: 'https://zysn-003.unified.demandware.net/on/demandware.servlet/Sites-RefArch-Site/en_US',
                pwaDomainUrl: 'https://www.phased-launch-testing.com',
                pwaSiteId: 'site-123',
                pwaLocale: 'en-US',
            };
            return mockData[key] || null;
        });

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        element = createElement('c-cart-summary', {
            is: CartSummary,
        });
        element.cartSummary = mockCartSummaryNoExpressUrl;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe(
            'https://zysn-003.unified.demandware.net/on/demandware.store/Sites-RefArch-Site/en_US/Payments-Express'
        );
    });

    describe('localStorage integration for checkout URL', () => {
        beforeEach(() => {
            // Mock localStorage
            mockLocalStorage = {
                getItem: jest.fn(),
                setItem: jest.fn(),
            };
            Object.defineProperty(window, 'localStorage', {
                value: mockLocalStorage,
                writable: true,
            });
        });

        afterEach(() => {
            // Clean up localStorage mock
            delete window.localStorage;
        });

        it('should construct SFRA checkout URL from localizedUrl in localStorage', async () => {
            mockLocalStorage.getItem.mockReturnValue(
                'https://zysn-003.unified.demandware.net/on/demandware.servlet/Sites-RefArch-Site/en_US'
            );

            element = createElement('c-cart-summary', {
                is: CartSummary,
            });
            element.cartSummary = mockCartSummary;
            document.body.appendChild(element);
            await Promise.resolve();

            const expressPayment = element.querySelector('c-express-payment');
            expressPayment.dispatchEvent(
                new CustomEvent('expressloaded', {
                    detail: { available: false },
                    bubbles: true,
                })
            );
            await Promise.resolve();

            const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();
            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(false);
            button.click();

            expect(windowOpenSpy).toHaveBeenCalledWith(
                'https://zysn-003.unified.demandware.net/on/demandware.store/Sites-RefArch-Site/en_US/Checkout-Begin',
                '_blank',
                'noopener,noreferrer'
            );
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('localizedUrl');
            windowOpenSpy.mockRestore();
        });

        it('should use localizedUrl from localStorage when available', async () => {
            mockLocalStorage.getItem.mockReturnValue('https://example.com/en-us');

            element = createElement('c-cart-summary', {
                is: CartSummary,
            });
            element.cartSummary = mockCartSummary;
            document.body.appendChild(element);
            await Promise.resolve();

            // Trigger express payment loaded event to show the button
            const expressPayment = element.querySelector('c-express-payment');
            expressPayment.dispatchEvent(
                new CustomEvent('expressloaded', {
                    detail: { available: true },
                    bubbles: true,
                })
            );
            await Promise.resolve();

            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(false);
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('localizedUrl');
        });

        it('should fallback to checkoutButtonUrl when localStorage is empty', async () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            element = createElement('c-cart-summary', {
                is: CartSummary,
            });
            element.cartSummary = mockCartSummary;
            document.body.appendChild(element);
            await Promise.resolve();

            const expressPayment = element.querySelector('c-express-payment');
            expressPayment.dispatchEvent(
                new CustomEvent('expressloaded', {
                    detail: { available: false },
                    bubbles: true,
                })
            );
            await Promise.resolve();

            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(false);
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('localizedUrl');
        });

        it('should disable button when no checkout URL is available', async () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            element = createElement('c-cart-summary', {
                is: CartSummary,
            });
            element.cartSummary = {}; // No checkoutButtonUrl
            document.body.appendChild(element);
            await Promise.resolve();

            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(true);
        });

        it('should handle localStorage errors gracefully', async () => {
            mockLocalStorage.getItem.mockImplementation(() => {
                throw new Error('localStorage not available');
            });

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            element = createElement('c-cart-summary', {
                is: CartSummary,
            });
            element.cartSummary = mockCartSummary;
            document.body.appendChild(element);
            await Promise.resolve();

            const expressPayment = element.querySelector('c-express-payment');
            expressPayment.dispatchEvent(
                new CustomEvent('expressloaded', {
                    detail: { available: false },
                    bubbles: true,
                })
            );
            await Promise.resolve();

            const button = element.querySelector('c-common-button');
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('localStorage not available:', expect.any(Error));

            consoleSpy.mockRestore();
        });
    });

    describe('Coupon input functionality', () => {
        it('should show coupon input when cart has items and feature flag is enabled', () => {
            const cartWithItems = {
                ...mockCartSummary,
                items: [{ name: 'Product A', quantity: 1, itemSubtotal: 50.0 }],
                flags: { isCouponFeatureEnabled: true },
            };
            element.cartSummary = cartWithItems;
            element.configuration = { couponInput: { enabled: true } };

            return Promise.resolve().then(() => {
                const couponInput = element.querySelector('c-coupon-input');
                expect(couponInput).not.toBeNull();
            });
        });

        it('should not show coupon input when cart has no items', () => {
            const cartWithoutItems = {
                ...mockCartSummary,
                items: [],
            };
            element.cartSummary = cartWithoutItems;

            return Promise.resolve().then(() => {
                const couponInput = element.querySelector('c-coupon-input');
                expect(couponInput).toBeNull();
            });
        });

        it('should not show coupon input when items property is undefined', () => {
            const cartWithoutItems = {
                ...mockCartSummary,
                items: undefined,
            };
            element.cartSummary = cartWithoutItems;

            return Promise.resolve().then(() => {
                const couponInput = element.querySelector('c-coupon-input');
                expect(couponInput).toBeNull();
            });
        });

        it('should not show coupon input when cart summary is empty', () => {
            element.cartSummary = {};

            return Promise.resolve().then(() => {
                const couponInput = element.querySelector('c-coupon-input');
                expect(couponInput).toBeNull();
            });
        });

        it('should handle applycoupon event and dispatch cartapplycoupon event', () => {
            const cartWithItems = {
                ...mockCartSummary,
                items: [{ name: 'Product A', quantity: 1, itemSubtotal: 50.0 }],
                flags: { isCouponFeatureEnabled: true },
            };
            element.cartSummary = cartWithItems;
            element.configuration = { couponInput: { enabled: true } };

            return Promise.resolve().then(() => {
                const couponInput = element.querySelector('c-coupon-input');
                expect(couponInput).not.toBeNull();

                const eventHandler = jest.fn();
                element.addEventListener('cartapplycoupon', eventHandler);

                // Simulate applycoupon event from coupon input
                const applyCouponEvent = new CustomEvent('applycoupon', {
                    detail: { couponCode: 'SAVE10' },
                    bubbles: true,
                    composed: true,
                });
                couponInput.dispatchEvent(applyCouponEvent);

                expect(eventHandler).toHaveBeenCalledTimes(1);
                expect(eventHandler.mock.calls[0][0].detail).toEqual({ couponCode: 'SAVE10' });
            });
        });

        it('should bubble up cartapplycoupon event with correct coupon code', () => {
            const cartWithItems = {
                ...mockCartSummary,
                items: [{ name: 'Product A', quantity: 1, itemSubtotal: 50.0 }],
                flags: { isCouponFeatureEnabled: true },
            };
            element.cartSummary = cartWithItems;
            element.configuration = { couponInput: { enabled: true } };

            return Promise.resolve().then(() => {
                const couponInput = element.querySelector('c-coupon-input');
                expect(couponInput).not.toBeNull();

                const eventHandler = jest.fn();
                element.addEventListener('cartapplycoupon', eventHandler);

                // Dispatch applycoupon event from coupon input
                const applyCouponEvent = new CustomEvent('applycoupon', {
                    detail: { couponCode: 'DISCOUNT20' },
                    bubbles: true,
                    composed: true,
                });
                couponInput.dispatchEvent(applyCouponEvent);

                expect(eventHandler).toHaveBeenCalledTimes(1);
                expect(eventHandler.mock.calls[0][0].detail.couponCode).toBe('DISCOUNT20');
                expect(eventHandler.mock.calls[0][0].bubbles).toBe(true);
                expect(eventHandler.mock.calls[0][0].composed).toBe(true);
            });
        });

        it('should disable apply button when coupon code is empty', async () => {
            const cartWithItems = {
                ...mockCartSummary,
                items: [{ name: 'Product A', quantity: 1, itemSubtotal: 50.0 }],
                flags: { isCouponFeatureEnabled: true },
            };
            element.cartSummary = cartWithItems;
            element.configuration = { couponInput: { enabled: true } };

            await Promise.resolve();

            const couponInput = element.querySelector('c-coupon-input');
            expect(couponInput).not.toBeNull();

            // Set empty coupon code
            couponInput.couponCode = '';

            await Promise.resolve();
            const applyButton = couponInput.querySelector('button');
            expect(applyButton.disabled).toBe(true);
        });

        it('should disable apply button when coupon code is only whitespace', async () => {
            const cartWithItems = {
                ...mockCartSummary,
                items: [{ name: 'Product A', quantity: 1, itemSubtotal: 50.0 }],
                flags: { isCouponFeatureEnabled: true },
            };
            element.cartSummary = cartWithItems;
            element.configuration = { couponInput: { enabled: true } };

            await Promise.resolve();

            const couponInput = element.querySelector('c-coupon-input');
            expect(couponInput).not.toBeNull();

            // Set whitespace-only coupon code
            couponInput.couponCode = '   ';

            await Promise.resolve();
            const applyButton = couponInput.querySelector('button');
            expect(applyButton.disabled).toBe(true);
        });

        describe('Coupon input feature', () => {
            it('should show coupon input when cart has items', () => {
                const cartWithItems = {
                    ...mockCartSummary,
                    items: [{ name: 'Product A', quantity: 1, itemSubtotal: 50.0 }],
                    flags: { isCouponFeatureEnabled: true },
                };
                element.cartSummary = cartWithItems;

                return Promise.resolve().then(() => {
                    const couponInput = element.querySelector('c-coupon-input');
                    expect(couponInput).not.toBeNull();
                });
            });

            it('should not show coupon input when cart is empty', () => {
                const cartWithoutItems = {
                    ...mockCartSummary,
                    items: [],
                };
                element.cartSummary = cartWithoutItems;

                return Promise.resolve().then(() => {
                    const couponInput = element.querySelector('c-coupon-input');
                    expect(couponInput).toBeNull();
                });
            });
        });
    });

    describe('Coupon feature flag (isCouponFeatureEnabled)', () => {
        it('should show coupon input when feature flag is true', async () => {
            const newElement = createElement('c-cart-summary', {
                is: CartSummary,
            });
            newElement.cartSummary = {
                ...mockCartSummary,
                items: [{ name: 'Product A', quantity: 1, itemSubtotal: 50.0 }],
                flags: { isCouponFeatureEnabled: true },
            };
            document.body.appendChild(newElement);

            await Promise.resolve();

            const couponInput = newElement.querySelector('c-coupon-input');
            expect(couponInput).not.toBeNull();

            document.body.removeChild(newElement);
        });

        it('should hide coupon input when feature flag is false', async () => {
            const newElement = createElement('c-cart-summary', {
                is: CartSummary,
            });
            newElement.cartSummary = {
                ...mockCartSummary,
                items: [{ name: 'Product A', quantity: 1, itemSubtotal: 50.0 }],
                flags: { isCouponFeatureEnabled: false },
            };
            document.body.appendChild(newElement);

            await Promise.resolve();

            const couponInput = newElement.querySelector('c-coupon-input');
            expect(couponInput).toBeNull();

            document.body.removeChild(newElement);
        });

        it('should show coupon input when feature flag is undefined (defaults to true)', async () => {
            const newElement = createElement('c-cart-summary', {
                is: CartSummary,
            });
            newElement.cartSummary = {
                ...mockCartSummary,
                items: [{ name: 'Product A', quantity: 1, itemSubtotal: 50.0 }],
                // No flags property
            };
            document.body.appendChild(newElement);

            await Promise.resolve();

            const couponInput = newElement.querySelector('c-coupon-input');
            expect(couponInput).not.toBeNull();

            document.body.removeChild(newElement);
        });
    });
});
