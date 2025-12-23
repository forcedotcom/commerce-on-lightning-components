/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { api, LightningElement, track } from 'lwc';
import { dispatchMessagingEvent, MESSAGING_EVENT } from 'lightningsnapin/eventStore';
import * as Labels from './labelUtils';

/**
 * @typedef {object} CartButton
 * @property {string} buttonLabel - The label of the button
 * @property {string} buttonLink - The URL the button links to
 * @property {string} class - The CSS class of the button
 * @property {string} variant - The variant of the button (primary/secondary)
 * @property {boolean} disabled - Whether the button is disabled
 * @property {string} assistiveText - Assistive text for accessibility
 */

/**
 * @typedef {object} CartSummaryData
 * @property {string} headerMessage - Rich text content for the header
 * @property {string} footerMessage - Rich text content for the footer
 * @property {string} checkoutButtonUrl - URL for the checkout button (used as fallback when localizedUrl is not available in localStorage)
 * @property {string} expressPaymentUrl - URL for the express payment domain
 * Note: Primary checkout URL is retrieved from localStorage (localizedUrl), with checkoutButtonUrl as fallback
 */

/**
 * @description CartSummary component displays cart summary information with checkout button
 * @example
 * <c-cart-summary cart-summary={cartSummaryData}></c-cart-summary>
 */
export default class CartSummary extends LightningElement {
    static renderMode = 'light';

    // Button class constant
    static BUTTON_CLASS = 'button-checkout';

    // Global registry to track the latest component instance
    static _latestInstance = null;
    static _instanceCounter = 0;

    // Instance-specific ID
    _instanceId = null;

    /**
     * Configuration object containing language and other settings
     * @type {object}
     */
    @api configuration = {};

    /**
     * Getter for the current language/locale
     * @returns {string} The current language/locale (defaults to 'en_US')
     */
    @api
    get language() {
        return this.configuration?.language || 'en_US';
    }

    /**
     * Getter for internationalized labels
     * @returns {object} Object containing all translated labels for the current language
     */
    @api
    get i18n() {
        const language = this.language;
        return {
            cartSummaryRegionLabel: Labels.cartSummaryRegionLabel(language),
            loadingSpinnerAltText: Labels.loadingSpinnerAltText(language),
            checkoutButtonLabel: Labels.checkoutButtonLabel(language),
            checkoutButtonAssistiveText: Labels.checkoutButtonAssistiveText(language),
            checkoutNotAvailableAssistiveText: Labels.checkoutNotAvailableAssistiveText(language),
        };
    }

    /**
     * Handle all postMessage events
     * @param {Event} event - The window message event
     * @returns {void}
     */
    _handleWindowMessage(event) {
        // Handle customer data from PWA (always process)
        if (event?.data?.type === 'express.actualCustomerData') {
            localStorage.setItem('expressPaymentCustomerId', event?.data?.payload?.customerId);
            localStorage.setItem('expressPaymentAuthToken', event?.data?.payload?.authToken);
            return;
        }

        // Handle basket data requests (only process if this is the latest instance)
        if (event?.data?.type === 'basketDataRequested') {
            // Only respond if this is the latest instance
            if (CartSummary._latestInstance !== this) {
                return;
            }
            this._sendBasketData();
        }
    }

    connectedCallback() {
        // Register this instance as the latest
        this._instanceId = ++CartSummary._instanceCounter;
        CartSummary._latestInstance = this;

        // Set up single message listener for all message types (bind this context)
        this._boundMessageHandler = this._handleWindowMessage.bind(this);
        window.addEventListener('message', this._boundMessageHandler);
        window.parent.postMessage(
            {
                type: 'lwc.getCustomerData',
                timestamp: Date.now(),
            },
            '*'
        );
    }

    disconnectedCallback() {
        // Clean up message listener
        if (this._boundMessageHandler) {
            window.removeEventListener('message', this._boundMessageHandler);
            this._boundMessageHandler = null;
        }

        // If this was the latest instance, clear the registry
        if (CartSummary._latestInstance === this) {
            CartSummary._latestInstance = null;
        }
    }

    /**
     * @description Cart summary data containing button information
     * @type {CartSummaryData}
     */
    _cartSummary = {};

    /**
     * Setter for cart summary data that emits global postMessage when data changes
     * @param {CartSummaryData} value - The new cart summary data
     */
    @api
    set cartSummary(value) {
        this._cartSummary = value;
    }

    /**
     * Getter for cart summary data
     * @returns {CartSummaryData} The current cart summary data
     */
    get cartSummary() {
        return this._cartSummary;
    }

    /**
     * @description Conversation entry ID needed for express button generation
     * @type {string} Entry ID
     */
    _entryId = '';

    @api
    set entryId(value) {
        this._entryId = value;
    }

    get entryId() {
        return this._entryId;
    }

    /**
     * @description Tracks whether the express payment component has finished loading
     * @type {boolean}
     */
    @track isExpressLoaded = false;

    /**
     * @description Tracks whether the express payment is available
     * @type {boolean}
     */
    @track isExpressAvailable = false;

    /**
     * @description Determines if we should wait for express payment availability before showing the checkout button
     * @returns {boolean} True if express payment URL is available and we should wait
     */
    get shouldWaitForExpressPayment() {
        const shouldWait =
            !!this.expressPaymentUrl &&
            this.expressPaymentUrl.trim() !== '' &&
            this.expressPaymentUrl.trim() !== 'null';
        return shouldWait;
    }

    /**
     * @description Gets the express payment URL safely handling null cartSummary
     * @returns {string} Express payment URL
     */
    get expressPaymentUrl() {
        return this.cartSummary?.expressPaymentUrl === 'null'
            ? this.cartSummary?.expressPaymentUrl
            : this._constructExpressPaymentUrl();
    }

    /**
     * Constructs express payment URL from localStorage PWA context values.
     * Returns 'null' if any required values are missing from localStorage.
     * @returns {string} Constructed URL or 'null' if any values are missing
     * @private
     */
    _constructExpressPaymentUrl() {
        try {
            const pwaDomainUrl = localStorage.getItem('pwaDomainUrl');
            const pwaSiteId = localStorage.getItem('pwaSiteId');
            const pwaLocale = localStorage.getItem('pwaLocale');

            // Return 'null' if any of the required values are missing
            if (!pwaDomainUrl || !pwaSiteId || !pwaLocale) {
                return 'null';
            }

            return `${pwaDomainUrl}/${pwaSiteId}/${pwaLocale}/express`;
        } catch (error) {
            return 'null';
        }
    }

    /**
     * @description Gets the footer message safely handling null cartSummary
     * @returns {string} Footer message or empty string
     */
    get footerMessage() {
        return this.cartSummary?.footerMessage || '';
    }

    /**
     * @description Determines if the footer should be displayed based on content availability
     * @returns {boolean} True if footer message has content to display
     */
    get shouldShowFooter() {
        return !!this.footerMessage.trim();
    }

    /**
     * @description Handles the expressLoaded event from c-express-payment component
     * @param {CustomEvent} event - The expressloaded event containing availability detail
     */
    handleExpressLoaded(event) {
        this.isExpressLoaded = true;
        this.isExpressAvailable = event.detail?.available || false;
    }

    /**
     * @description Gets the CSS classes for the loading container that wraps express payment and buttons.
     * @returns {string} CSS classes based on loading state.
     */
    get loadingContainerClass() {
        const baseClasses = `loading-container slds-p-horizontal_medium ${
            this.shouldShowFooter ? 'slds-p-bottom_x-small' : 'slds-p-bottom_medium'
        }`;
        return this.isExpressLoaded ? `${baseClasses} loaded` : baseClasses;
    }

    /**
     * @description Gets the CSS classes for the express payment container.
     * @returns {string} CSS classes based on loading state and availability.
     */
    get expressContainerClass() {
        const baseClasses = 'express-container slds-col';
        return this.isExpressLoaded ? `${baseClasses} slds-p-bottom_x-small` : baseClasses;
    }

    /**
     * @description Gets the inline styles for the express container to visually hide it if not available.
     * This is necessary because the component needs to remain in the DOM to fire events.
     * @returns {string} CSS styles to hide/show the express container.
     */
    get expressContainerStyle() {
        return this.isExpressLoaded && !this.isExpressAvailable ? 'display: none;' : '';
    }

    /**
     * @description Gets the checkout URL, using localizedUrl from localStorage as primary and checkoutButtonUrl as fallback.
     * @returns {string|null} The checkout URL to use, or null if neither is available.
     */
    get checkoutUrl() {
        let domainCheckoutUrl = null;
        try {
            const localizedUrl = localStorage.getItem('localizedUrl');
            domainCheckoutUrl = localizedUrl ? `${localizedUrl}/checkout` : null;
        } catch (error) {
            console.warn('localStorage not available:', error);
        }
        return domainCheckoutUrl || this.cartSummary?.checkoutButtonUrl || null;
    }

    /**
     * @description Handles checkout button click events.
     * Opens the checkout URL in a new blank tab/window, using localizedUrl from localStorage as primary and checkoutButtonUrl as fallback.
     * @param {Event} event - The click event.
     */
    handleButtonClick(event) {
        const buttonElement = event.currentTarget;
        const buttonClass = buttonElement.dataset.buttonClass;

        if (buttonClass !== CartSummary.BUTTON_CLASS) {
            return;
        }

        const checkoutUrl = this.checkoutUrl;

        if (!checkoutUrl) {
            return;
        }

        try {
            dispatchMessagingEvent(MESSAGING_EVENT.MINIMIZE_BUTTON_CLICK, {});
            window.open(checkoutUrl, '_blank');
        } catch (error) {
            console.error('Failed to open checkout URL:', error);
        }
    }

    /**
     * @description Determines if the checkout button should be displayed.
     * @returns {boolean} True if the checkout button should be visible.
     */
    get shouldShowButton() {
        // If we have an express payment URL, wait for the express payment to load
        if (this.shouldWaitForExpressPayment) {
            const shouldShow = this.isExpressLoaded;
            return shouldShow;
        }
        // If no express payment URL, show the button immediately
        return true;
    }

    /**
     * @description Computed property that returns the checkout button configuration.
     * Uses localizedUrl from localStorage as primary and checkoutButtonUrl as fallback.
     * @returns {CartButton} Button object with properties for c-common-button.
     */
    get button() {
        const hasCheckoutUrl = !!this.checkoutUrl;

        return {
            buttonLabel: this.i18n.checkoutButtonLabel,
            buttonLink: this.checkoutUrl,
            class: CartSummary.BUTTON_CLASS,
            variant: this.isExpressAvailable ? 'secondary' : 'primary',
            disabled: !hasCheckoutUrl,
            assistiveText: hasCheckoutUrl
                ? this.i18n.checkoutButtonAssistiveText
                : this.i18n.checkoutNotAvailableAssistiveText,
        };
    }

    /**
     * Sends basket data via postMessage to the express payment iframe
     */
    _sendBasketData() {
        if (!this._cartSummary) {
            return;
        }

        const basketData = {
            orderTotal: this._cartSummary?.total || 0,
            currency: this._cartSummary?.currencyCode || 'USD',
            basketId: this._cartSummary?.id || '',
            customerId: localStorage.getItem('expressPaymentCustomerId'),
        };

        const authData = {
            customerId: localStorage.getItem('expressPaymentCustomerId'),
            authToken: localStorage.getItem('expressPaymentAuthToken'),
        };

        try {
            // Try to send basket data to the express payment component
            const expressPaymentComponent = this.querySelector('c-express-payment');
            if (expressPaymentComponent) {
                expressPaymentComponent.sendCheckoutData(basketData, authData);
            }
        } catch (error) {
            console.warn(`Failed to send basket data postMessage (Component ${this._instanceId}):`, error);
        }
    }

    /**
     * @description Determines if the coupon input should be displayed
     * @returns {boolean} True if cart summary has items and feature flag is enabled
     */
    get shouldShowCouponInput() {
        const hasItems = this._cartSummary && this._cartSummary.items && this._cartSummary.items.length > 0;
        const isCouponFeatureShown = this._cartSummary?.flags?.isCouponFeatureEnabled ?? false;
        return hasItems && isCouponFeatureShown;
    }

    /**
     * @description Handles the applycoupon event from the coupon input component
     * @param {CustomEvent} event - The applycoupon event containing coupon code
     */
    handleApplyCoupon(event) {
        const { couponCode } = event.detail;

        // Dispatch custom event to parent/container to handle coupon application
        const applyCouponEvent = new CustomEvent('cartapplycoupon', {
            detail: {
                couponCode,
            },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(applyCouponEvent);
    }
}
