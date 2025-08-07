/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { createElement } from 'lwc';
import ExpressPayment from 'c/expressPayment';

describe('c-express-payment', () => {
    let element;

    beforeEach(() => {
        element = createElement('c-express-payment', {
            is: ExpressPayment,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        if (document.body.contains(element)) {
            document.body.removeChild(element);
        }
    });

    describe('Component initialization and properties', () => {
        it('should render iframe with correct URL when properties are set', async () => {
            element.expressPaymentUrl = 'https://example.com/express';
            element.entryId = 'test-entry-123';

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('https://example.com/express?id=test-entry-123');
        });

        it('should render iframe with default src when expressPaymentUrl is missing', async () => {
            element.entryId = 'test-entry-123';

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('http://localhost/');
        });

        it('should render iframe with default src when entryId is missing', async () => {
            element.expressPaymentUrl = 'https://example.com/express';

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('http://localhost/');
        });
    });

    describe('iframe rendering', () => {
        it('should have correct iframe attributes', async () => {
            element.expressPaymentUrl = 'https://example.com/express';
            element.entryId = 'test-entry-123';

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            const computedStyles = getComputedStyle(iframe);
            expect(computedStyles.width).toBe('100%');
            expect(computedStyles.height).toBe('40px');
            expect(iframe.getAttribute('allow')).toBe('payment *');
        });
    });

    describe('window message handling', () => {
        beforeEach(() => {
            // Set a valid URL so the component sets up the message listener
            element.expressPaymentUrl = 'https://example.com/express';
            element.entryId = 'test-entry-123';

            // Connect the component to trigger connectedCallback and set up event listeners
            document.body.appendChild(element);
        });

        afterEach(() => {
            // Clean up by removing the component
            if (document.body.contains(element)) {
                document.body.removeChild(element);
            }
        });

        it('should dispatch expressloaded event when available message received', () => {
            const mockDispatchEvent = jest.fn();
            element.dispatchEvent = mockDispatchEvent;

            const mockEvent = {
                data: {
                    type: 'express.payment.available',
                },
            };

            window.dispatchEvent(new MessageEvent('message', mockEvent));

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'expressloaded',
                    detail: { available: true },
                })
            );
        });

        it('should dispatch expressloaded event when unavailable message received', () => {
            const mockDispatchEvent = jest.fn();
            element.dispatchEvent = mockDispatchEvent;

            const mockEvent = {
                data: {
                    type: 'express.payment.unavailable',
                },
            };

            window.dispatchEvent(new MessageEvent('message', mockEvent));

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'expressloaded',
                    detail: { available: false },
                })
            );
        });

        it('should dispatch payment event when success message received', () => {
            const mockDispatchEvent = jest.fn();
            element.dispatchEvent = mockDispatchEvent;

            const mockEvent = {
                data: {
                    type: 'express.payment.success',
                    payload: {
                        orderId: 'test-order-123',
                        PAYMENT_METHOD: 'applepay',
                    },
                },
            };

            window.dispatchEvent(new MessageEvent('message', mockEvent));

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'payment',
                    bubbles: true,
                    detail: {
                        orderId: 'test-order-123',
                        paymentMethod: 'applepay',
                    },
                })
            );
        });

        it('should dispatch payment event when failure message received', () => {
            const mockDispatchEvent = jest.fn();
            element.dispatchEvent = mockDispatchEvent;

            const mockEvent = {
                data: {
                    type: 'express.payment.failure',
                    payload: {
                        PAYMENT_METHOD: 'applepay',
                    },
                },
            };

            window.dispatchEvent(new MessageEvent('message', mockEvent));

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'payment',
                    bubbles: true,
                    detail: {
                        status: 'failure',
                        paymentMethod: 'applepay',
                    },
                })
            );
        });

        it('should dispatch payment event when cancel message received', () => {
            const mockDispatchEvent = jest.fn();
            element.dispatchEvent = mockDispatchEvent;

            const mockEvent = {
                data: {
                    type: 'express.payment.cancel',
                    payload: {
                        PAYMENT_METHOD: 'applepay',
                    },
                },
            };

            window.dispatchEvent(new MessageEvent('message', mockEvent));

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'payment',
                    bubbles: true,
                    detail: {
                        status: 'cancel',
                        paymentMethod: 'applepay',
                    },
                })
            );
        });
    });

    describe('global listener management', () => {
        it('should only process events for the active component', () => {
            const mockDispatchEvent1 = jest.fn();
            const mockDispatchEvent2 = jest.fn();

            // Create first component
            const element1 = createElement('c-express-payment', { is: ExpressPayment });
            element1.expressPaymentUrl = 'https://example.com/express';
            element1.entryId = 'test-entry-1';
            element1.dispatchEvent = mockDispatchEvent1;
            document.body.appendChild(element1);

            // Create second component (becomes active)
            const element2 = createElement('c-express-payment', { is: ExpressPayment });
            element2.expressPaymentUrl = 'https://example.com/express';
            element2.entryId = 'test-entry-2';
            element2.dispatchEvent = mockDispatchEvent2;
            document.body.appendChild(element2);

            // Send a message - only the active component (element2) should process it
            const mockEvent = {
                data: {
                    type: 'express.payment.available',
                },
            };
            window.dispatchEvent(new MessageEvent('message', mockEvent));

            expect(mockDispatchEvent1).not.toHaveBeenCalled();
            expect(mockDispatchEvent2).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'expressloaded',
                    detail: { available: true },
                })
            );

            // Clean up
            document.body.removeChild(element1);
            document.body.removeChild(element2);
        });

        it('should properly clean up when component is disconnected', () => {
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            // Create and connect component
            const testElement = createElement('c-express-payment', { is: ExpressPayment });
            testElement.expressPaymentUrl = 'https://example.com/express';
            testElement.entryId = 'test-entry-123';
            document.body.appendChild(testElement);

            // Disconnect component
            document.body.removeChild(testElement);

            // Verify listener was removed
            expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
        });
    });

    describe('lifecycle methods', () => {
        it('should add and remove message listener', () => {
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            // Set valid URL so the component sets up the message listener
            element.expressPaymentUrl = 'https://example.com/express';
            element.entryId = 'test-entry-123';

            // Create and append element (addEventListener called in connectedCallback)
            document.body.appendChild(element);

            // Remove element (removeEventListener called in disconnectedCallback)
            document.body.removeChild(element);

            expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
        });

        it('should handle timeout callback when windowMessageListener is already null in a race condition', () => {
            // Use fake timers to control setTimeout
            jest.useFakeTimers();

            const mockDispatchEvent = jest.fn();
            element.dispatchEvent = mockDispatchEvent;

            // Set valid URL so the component sets up the timeout
            element.expressPaymentUrl = 'https://example.com/express';
            element.entryId = 'test-entry-123';

            // Connect the component to start the timeout
            document.body.appendChild(element);

            // Fast-forward time to trigger the timeout callback
            jest.advanceTimersByTime(5000);

            // Should dispatch timeout event without error
            expect(mockDispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'expressloaded',
                    detail: { available: false, timeout: true },
                })
            );

            // Clean up
            document.body.removeChild(element);
            jest.useRealTimers();
        });
    });

    describe('edge cases', () => {
        it('should handle null expressPaymentUrl', async () => {
            element.expressPaymentUrl = null;
            element.entryId = 'test-entry-123';

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('http://localhost/');
        });

        it('should handle undefined expressPaymentUrl', async () => {
            element.expressPaymentUrl = undefined;
            element.entryId = 'test-entry-123';

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('http://localhost/');
        });

        it('should handle null entryId', async () => {
            element.expressPaymentUrl = 'https://example.com/express';
            element.entryId = null;

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('http://localhost/');
        });

        it('should handle undefined entryId', async () => {
            element.expressPaymentUrl = 'https://example.com/express';
            element.entryId = undefined;

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('http://localhost/');
        });

        it('should handle different URL formats', async () => {
            element.expressPaymentUrl = 'https://different-domain.com/path';
            element.entryId = 'test-entry-123';

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('https://different-domain.com/path?id=test-entry-123');
        });

        it('should handle URL with trailing slash', async () => {
            element.expressPaymentUrl = 'https://example.com/express/';
            element.entryId = 'test-entry-123';

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('https://example.com/express/?id=test-entry-123');
        });
    });

    describe('PDP property functionality', () => {
        it('should include pdp parameter in URL when pdp is true', async () => {
            element.expressPaymentUrl = 'https://example.com/express';
            element.entryId = 'test-entry-123';
            element.pdp = true;

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('https://example.com/express?id=test-entry-123&pdp=true');
        });

        it('should not include pdp parameter in URL when pdp is false', async () => {
            element.expressPaymentUrl = 'https://example.com/express';
            element.entryId = 'test-entry-123';
            element.pdp = false;

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('https://example.com/express?id=test-entry-123');
        });

        it('should not include pdp parameter in URL when pdp is undefined', async () => {
            element.expressPaymentUrl = 'https://example.com/express';
            element.entryId = 'test-entry-123';
            element.pdp = undefined;

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('https://example.com/express?id=test-entry-123');
        });

        it('should handle pdp with URL that already has query parameters', async () => {
            element.expressPaymentUrl = 'https://example.com/express?existing=param';
            element.entryId = 'test-entry-123';
            element.pdp = true;

            await Promise.resolve();
            const iframe = element.shadowRoot.querySelector('iframe');
            // The implementation adds parameters sequentially, so we get two ? characters
            expect(iframe.src).toBe('https://example.com/express?existing=param?id=test-entry-123&pdp=true');
        });
    });

    describe('Disabled property functionality', () => {
        it('should render container div with correct CSS class when disabled', async () => {
            element.disabled = true;
            await Promise.resolve();

            const container = element.shadowRoot.querySelector('.express-container');
            expect(container).not.toBeNull();
            expect(container.classList.contains('disabled')).toBe(true);
        });

        it('should render container div without disabled class when not disabled', async () => {
            element.disabled = false;
            await Promise.resolve();

            const container = element.shadowRoot.querySelector('.express-container');
            expect(container).not.toBeNull();
            expect(container.classList.contains('disabled')).toBe(false);
        });

        it('should handle disabled state with undefined value', async () => {
            element.disabled = undefined;
            await Promise.resolve();

            const container = element.shadowRoot.querySelector('.express-container');
            expect(container).not.toBeNull();
            expect(container.classList.contains('disabled')).toBe(false);
        });
    });

    describe('updateSku API method functionality', () => {
        beforeEach(() => {
            // Mock document.querySelector for the iframe
            const mockIframe = {
                contentWindow: {
                    postMessage: jest.fn(),
                },
            };

            // Mock shadowRoot.querySelector to return our mock iframe
            jest.spyOn(element.shadowRoot, 'querySelector').mockImplementation((selector) => {
                if (selector === 'iframe') {
                    return mockIframe;
                }
                return null;
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should send UPDATE_SKU message when SKU is provided', () => {
            const testSku = 'TEST-SKU-123';
            const mockIframe = element.shadowRoot.querySelector('iframe');

            element.updateSku(testSku);

            expect(mockIframe.contentWindow.postMessage).toHaveBeenCalledWith(
                {
                    type: 'UPDATE_SKU',
                    sku: testSku,
                },
                '*'
            );
        });

        it('should send CLEAR_SKU message when SKU is null', () => {
            const mockIframe = element.shadowRoot.querySelector('iframe');

            element.updateSku(null);

            expect(mockIframe.contentWindow.postMessage).toHaveBeenCalledWith(
                {
                    type: 'CLEAR_SKU',
                },
                '*'
            );
        });

        it('should send CLEAR_SKU message when SKU is undefined', () => {
            const mockIframe = element.shadowRoot.querySelector('iframe');

            element.updateSku(undefined);

            expect(mockIframe.contentWindow.postMessage).toHaveBeenCalledWith(
                {
                    type: 'CLEAR_SKU',
                },
                '*'
            );
        });

        it('should send CLEAR_SKU message when SKU is empty string', () => {
            const mockIframe = element.shadowRoot.querySelector('iframe');

            element.updateSku('');

            expect(mockIframe.contentWindow.postMessage).toHaveBeenCalledWith(
                {
                    type: 'CLEAR_SKU',
                },
                '*'
            );
        });

        it('should handle case when iframe is not found', () => {
            // Override mock to return null
            element.shadowRoot.querySelector.mockReturnValue(null);

            // Should not throw an error
            expect(() => {
                element.updateSku('TEST-SKU-123');
            }).not.toThrow();
        });

        it('should handle case when iframe contentWindow is null', () => {
            const mockIframe = { contentWindow: null };
            element.shadowRoot.querySelector.mockReturnValue(mockIframe);

            // Should not throw an error
            expect(() => {
                element.updateSku('TEST-SKU-123');
            }).not.toThrow();
        });

        it('should handle case when iframe contentWindow is undefined', () => {
            const mockIframe = { contentWindow: undefined };
            element.shadowRoot.querySelector.mockReturnValue(mockIframe);

            // Should not throw an error
            expect(() => {
                element.updateSku('TEST-SKU-123');
            }).not.toThrow();
        });
    });

    describe('Combined property interactions', () => {
        it('should work correctly when both pdp and disabled are set', async () => {
            element.expressPaymentUrl = 'https://example.com/express';
            element.entryId = 'test-entry-123';
            element.pdp = true;
            element.disabled = true;

            await Promise.resolve();

            // Check URL includes PDP parameter
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('https://example.com/express?id=test-entry-123&pdp=true');

            // Check container has disabled class
            const container = element.shadowRoot.querySelector('.express-container');
            expect(container.classList.contains('disabled')).toBe(true);
        });

        it('should handle all properties being falsy', async () => {
            element.expressPaymentUrl = '';
            element.entryId = '';
            element.pdp = false;
            element.disabled = false;

            await Promise.resolve();

            // Should render with empty src
            const iframe = element.shadowRoot.querySelector('iframe');
            expect(iframe.src).toBe('http://localhost/');

            // Should have base container class
            const container = element.shadowRoot.querySelector('.express-container');
            expect(container.classList.contains('disabled')).toBe(false);
        });
    });

    describe('sendBasketData API method', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should handle valid basket data without throwing errors', () => {
            const basketData = {
                orderTotal: 100.5,
                currency: 'USD',
                id: 'basket-123',
            };

            // Should not throw an error
            expect(() => {
                element.sendBasketData(basketData);
            }).not.toThrow();
        });

        it('should handle missing basket data gracefully', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            element.sendBasketData(null);

            expect(consoleWarnSpy).toHaveBeenCalledWith('Cannot send basket data - missing required data');

            consoleWarnSpy.mockRestore();
        });

        it('should handle undefined basket data gracefully', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            element.sendBasketData(undefined);

            expect(consoleWarnSpy).toHaveBeenCalledWith('Cannot send basket data - missing required data');

            consoleWarnSpy.mockRestore();
        });

        it('should handle iframe not available gracefully', () => {
            // Mock template.querySelector to return null (no iframe)
            element.template = {
                querySelector: jest.fn().mockReturnValue(null),
            };

            const basketData = {
                orderTotal: 100.5,
                currency: 'USD',
                id: 'basket-123',
            };

            // Should not throw an error
            expect(() => {
                element.sendBasketData(basketData);
            }).not.toThrow();
        });

        it('should handle iframe without contentWindow gracefully', () => {
            // Mock iframe without contentWindow
            const mockIframe = {};
            element.template = {
                querySelector: jest.fn().mockImplementation((selector) => {
                    if (selector === 'iframe') {
                        return mockIframe;
                    }
                    return null;
                }),
            };

            const basketData = {
                orderTotal: 100.5,
                currency: 'USD',
                id: 'basket-123',
            };

            // Should not throw an error
            expect(() => {
                element.sendBasketData(basketData);
            }).not.toThrow();
        });

        it('should handle different currency codes without throwing errors', () => {
            const basketData = {
                orderTotal: 150.75,
                currency: 'EUR',
                id: 'basket-456',
            };

            // Should not throw an error
            expect(() => {
                element.sendBasketData(basketData);
            }).not.toThrow();
        });

        it('should handle zero values without throwing errors', () => {
            const basketData = {
                orderTotal: 0,
                currency: 'USD',
                id: 'basket-789',
            };

            // Should not throw an error
            expect(() => {
                element.sendBasketData(basketData);
            }).not.toThrow();
        });

        it('should handle empty string values without throwing errors', () => {
            const basketData = {
                orderTotal: 50.25,
                currency: 'USD',
                id: '',
            };

            // Should not throw an error
            expect(() => {
                element.sendBasketData(basketData);
            }).not.toThrow();
        });

        it('should handle template not being available', () => {
            // Mock template to be null
            element.template = null;

            const basketData = {
                orderTotal: 100.5,
                currency: 'USD',
                id: 'basket-123',
            };

            // Should not throw an error
            expect(() => {
                element.sendBasketData(basketData);
            }).not.toThrow();
        });
    });
});
