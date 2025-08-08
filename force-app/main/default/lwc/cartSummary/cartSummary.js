/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { api, LightningElement, track } from 'lwc';
import * as labels from './labels';

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
 * @property {string} checkoutButtonUrl - URL for the checkout button
 * @property {string} expressPaymentUrl - URL for the express payment domain
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

    // Expose internationalized labels
    i18n = labels;

    /**
     * @description Cart summary data containing button information
     * @type {CartSummaryData}
     */
    @api cartSummary = {};

    /**
     * @description Conversation entry ID needed for express button generation
     * @type {string} Entry ID
     */
    @api entryId = '';

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
     * @description Gets the express payment URL safely handling null cartSummary
     * @returns {string} Express payment URL or empty string
     */
    get expressPaymentUrl() {
        return this.cartSummary?.expressPaymentUrl || '';
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
        const baseClasses = `loading-container slds-p-horizontal_medium slds-p-top_xx-small ${
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
     * @description Handles checkout button click events.
     * Opens the checkout URL in a new blank tab/window.
     * @param {Event} event - The click event.
     */
    handleButtonClick(event) {
        const buttonElement = event.currentTarget;
        const buttonClass = buttonElement.dataset.buttonClass;

        if (buttonClass !== CartSummary.BUTTON_CLASS) {
            return;
        }

        const checkoutUrl = this.cartSummary?.checkoutButtonUrl;

        if (!checkoutUrl) {
            return;
        }

        try {
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
        return this.isExpressLoaded;
    }

    /**
     * @description Computed property that returns the checkout button configuration.
     * @returns {CartButton} Button object with properties for c-common-button.
     */
    get button() {
        const hasCheckoutUrl = !!this.cartSummary?.checkoutButtonUrl;

        return {
            buttonLabel: this.i18n.checkoutButtonLabel,
            buttonLink: this.cartSummary?.checkoutButtonUrl,
            class: CartSummary.BUTTON_CLASS,
            variant: this.isExpressAvailable ? 'secondary' : 'primary',
            disabled: !hasCheckoutUrl,
            assistiveText: hasCheckoutUrl
                ? this.i18n.checkoutButtonAssistiveText
                : this.i18n.checkoutNotAvailableAssistiveText,
        };
    }
}
