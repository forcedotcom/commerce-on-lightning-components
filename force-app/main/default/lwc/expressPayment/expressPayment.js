/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';

// Global listener management to ensure only one active listener at a time
let globalMessageListener = null;
let activeComponent = null;

export default class ExpressPayment extends LightningElement {
    windowMessageListener = null;
    loadTimeout = null;
    static LOAD_TIMEOUT_MS = 5000; // 5 seconds

    /**
     * Conversation entry data.
     * @type {string}
     */
    @api entryId;

    /**
     * Express payment URL domain.
     * @type {string}
     */
    @api expressPaymentUrl;

    /**
     * PDP flag to indicate if this is a product detail page.
     * @type {boolean}
     */
    @api pdp;

    /**
     * Flag to disable the express payment component.
     * @type {boolean}
     */
    @api disabled = false;

    /**
     * Product total price (unit price × quantity) to pre-populate the payment sheet.
     * Passed as &price=<value> in the iframe URL so the server can display the correct
     * initial amount in the Apple Pay / Google Pay sheet.
     * Note: this value is a placeholder for display purposes only and does not dictate
     * the actual charge. The authoritative amount is set once the basket is created.
     * @type {number}
     */
    @api price;

    /**
     * Dynamic height for the express payment iframe.
     * @type {number}
     */
    _dynamicHeight = 0; // Default height

    /**
     * Sendds basket data via postMessage to the express payment iframe
     * @param {object} basketData - The basket data to send
     * @param {number} basketData.orderTotal - The total order amount
     * @param {string} basketData.currency - The currency code (e.g., 'USD')
     * @param {string} basketData.id - The basket/order ID
     * @param {object} authData - The auth data to send
     * @param {string} authData.customerId - The customer ID
     * @param {string} authData.authToken - The auth token for the customer
     */
    @api
    sendCheckoutData(basketData, authData) {
        if (!basketData && !authData) {
            console.warn('Cannot send basket or authentication data - missing required data');
            return;
        }

        try {
            // Try to target the express payment iframe directly
            const iframe = this.template.querySelector('iframe');

            if (iframe && iframe.contentWindow && basketData) {
                iframe.contentWindow.postMessage(
                    {
                        type: 'basketDataAvailable',
                        data: { basketData, authData },
                    },
                    '*'
                );
            } else if (iframe && iframe.contentWindow && authData) {
                iframe.contentWindow.postMessage(
                    {
                        type: 'authDataAvailable',
                        data: { authData },
                    },
                    '*'
                );
            }
        } catch (error) {
            console.warn('Failed to send basket data postMessage:', error);
        }
    }

    /**
     * Returns the URL for the express iframe
     * @returns {string} URL for iframe
     */
    get expressUrl() {
        if (!this.expressPaymentUrl || !this.entryId) {
            return '';
        }
        let url = `${this.expressPaymentUrl}?id=${this.entryId}`;
        if (this.pdp) {
            url += `&pdp=true`;
        }
        if (typeof this.price === 'number' && this.price > 0) {
            url += `&price=${this.price}`;
        }
        return url;
    }

    /**
     * Returns the CSS classes for the container div
     * @returns {string} CSS classes for container
     */
    get containerClass() {
        return this.disabled ? 'express-container disabled' : 'express-container';
    }

    connectedCallback() {
        // Set initial iframe height
        this._updateIframeHeight(this._dynamicHeight);

        // Check if express payment URL is empty or invalid
        if (
            !this.expressPaymentUrl ||
            this.expressPaymentUrl.trim() === '' ||
            this.expressPaymentUrl.trim() === 'null'
        ) {
            this.dispatchEvent(
                new CustomEvent('expressloaded', {
                    detail: { available: false, reason: 'no_url' },
                })
            );
            return; // Don't set up listeners or timeout if no valid express URL
        }

        // Remove any existing global listener before setting up a new one
        this._removeGlobalListener();

        // Set up the global listener and track this component as active
        this.windowMessageListener = (evt) => this._handleWindowMessage(evt);
        globalMessageListener = this.windowMessageListener;
        activeComponent = this;
        window.addEventListener('message', globalMessageListener);

        // Start timeout when component connects
        this.startLoadTimeout();
    }

    disconnectedCallback() {
        this._removeGlobalListener();
        this.clearLoadTimeout();
    }

    /**
     * Update the SKU in the iframe via postMessage
     * @param {string} sku - The product SKU to update to
     * @public
     */
    @api
    updateSku(sku) {
        const iframe = this.template.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
            if (sku) {
                iframe.contentWindow.postMessage(
                    {
                        type: 'UPDATE_SKU',
                        sku: sku,
                    },
                    '*'
                );
            } else {
                iframe.contentWindow.postMessage(
                    {
                        type: 'CLEAR_SKU',
                    },
                    '*'
                );
            }
        }
    }

    /**
     * Update the quantity in the iframe via postMessage
     * @param {number} quantity - The quantity to update to
     * @public
     */
    @api
    updateQuantity(quantity) {
        const iframe = this.template.querySelector('iframe');
        if (iframe && iframe.contentWindow && typeof quantity === 'number' && quantity > 0) {
            iframe.contentWindow.postMessage(
                {
                    type: 'UPDATE_QUANTITY',
                    quantity: quantity,
                },
                '*'
            );
        }
    }

    /**
     * Update the CSS custom property for iframe height
     * @param {number} height - The new height in pixels
     * @private
     */
    _updateIframeHeight(height) {
        const container = this.template.querySelector('.express-container');
        if (container) {
            container.style.setProperty('--iframe-height', `${height}px`);
        }
    }

    /**
     * Remove the global message listener if this component is the active one
     * @private
     */
    _removeGlobalListener() {
        if (activeComponent === this && globalMessageListener) {
            window.removeEventListener('message', globalMessageListener);
            globalMessageListener = null;
            activeComponent = null;
        }
        this.windowMessageListener = null;
    }

    startLoadTimeout() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.loadTimeout = setTimeout(() => {
            // Remove the message listener to prevent further events
            this._removeGlobalListener();

            // Dispatch event to indicate timeout
            this.dispatchEvent(
                new CustomEvent('expressloaded', {
                    detail: { available: false, timeout: true },
                })
            );
        }, ExpressPayment.LOAD_TIMEOUT_MS);
    }

    clearLoadTimeout() {
        if (this.loadTimeout) {
            clearTimeout(this.loadTimeout);
            this.loadTimeout = null;
        }
    }

    _handleWindowMessage(event) {
        // Only process events if this component is still the active one
        if (activeComponent !== this) {
            return;
        }

        // Only clear timeout for expected express payment message types
        const expectedMessageTypes = [
            'express.payment.available',
            'express.payment.unavailable',
            'express.payment.success',
            'express.payment.failure',
            'express.payment.cancel',
        ];

        if (expectedMessageTypes.includes(event.data.type)) {
            this.clearLoadTimeout();
        }

        if (event.data.type === 'express.payment.available') {
            const payload = event.data.payload;

            // Set dynamic height if provided in payload
            if (payload && typeof payload.height === 'number' && payload.height > 0) {
                this._dynamicHeight = payload.height;
                this._updateIframeHeight(payload.height);
            }

            this.dispatchEvent(
                new CustomEvent('expressloaded', {
                    detail: { available: true, payload },
                })
            );
        }

        if (event.data.type === 'express.payment.unavailable') {
            this.dispatchEvent(
                new CustomEvent('expressloaded', {
                    detail: { available: false },
                })
            );
        }

        if (event.data.type === 'express.payment.success') {
            this.dispatchEvent(
                new CustomEvent('payment', {
                    bubbles: true,
                    detail: {
                        orderId: event.data.payload.orderId,
                        paymentMethod: event.data.payload.PAYMENT_METHOD,
                    },
                })
            );
        }

        if (event.data.type === 'express.payment.failure') {
            this.dispatchEvent(
                new CustomEvent('payment', {
                    bubbles: true,
                    detail: {
                        status: 'failure',
                        paymentMethod: event.data.payload.PAYMENT_METHOD,
                    },
                })
            );
        }

        if (event.data.type === 'express.payment.cancel' && !this.pdp) {
            this.dispatchEvent(
                new CustomEvent('payment', {
                    bubbles: true,
                    detail: {
                        status: 'cancel',
                        paymentMethod: event.data.payload.PAYMENT_METHOD,
                    },
                })
            );
        }
    }
}
