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
            expect(iframe.style.width).toBe('100%');
            expect(iframe.style.height).toBe('40px');
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
                    payload: { orderId: 'test-order-123' },
                },
            };

            window.dispatchEvent(new MessageEvent('message', mockEvent));

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'payment',
                    bubbles: true,
                    detail: 'test-order-123',
                })
            );
        });

        it('should dispatch payment event when failure message received', () => {
            const mockDispatchEvent = jest.fn();
            element.dispatchEvent = mockDispatchEvent;

            const mockEvent = {
                data: {
                    type: 'express.payment.failure',
                },
            };

            window.dispatchEvent(new MessageEvent('message', mockEvent));

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'payment',
                    bubbles: true,
                    detail: { status: 'failure' },
                })
            );
        });

        it('should dispatch payment event when cancel message received', () => {
            const mockDispatchEvent = jest.fn();
            element.dispatchEvent = mockDispatchEvent;

            const mockEvent = {
                data: {
                    type: 'express.payment.cancel',
                },
            };

            window.dispatchEvent(new MessageEvent('message', mockEvent));

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'payment',
                    bubbles: true,
                    detail: { status: 'cancel' },
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
});
