/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api } from 'lwc';
import * as Labels from './labelUtils';

export default class CouponInput extends LightningElement {
    static renderMode = 'light';

    /**
     * Configuration object containing language and other settings
     * @type {object}
     */
    @api configuration = {};

    /**
     * The current value of the coupon input
     * @type {string}
     */
    _couponCode = '';

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
            couponPlaceholder: Labels.couponPlaceholder(language),
            applyButtonLabel: Labels.applyButtonLabel(language),
            applyButtonAriaLabel: Labels.applyButtonAriaLabel(language),
            couponInputAriaLabel: Labels.couponInputAriaLabel(language),
        };
    }

    /**
     * Gets the coupon code value
     * @returns {string} The current coupon code
     */
    @api
    get couponCode() {
        return this._couponCode;
    }

    /**
     * Sets the coupon code value
     * @param {string} value - The coupon code to set
     */
    set couponCode(value) {
        this._couponCode = value || '';
    }

    /**
     * Determines if the Apply button should be disabled
     * @returns {boolean} True if the coupon code is empty or only whitespace
     */
    get isApplyDisabled() {
        return !this._couponCode || this._couponCode.trim().length === 0;
    }

    /**
     * Gets the CSS classes for the Apply button based on its state
     * @returns {string} CSS classes for the Apply button
     */
    get applyButtonClasses() {
        return this.isApplyDisabled ? 'apply-button disabled' : 'apply-button enabled';
    }

    /**
     * Handles input changes in the coupon code field
     * @param {Event} event - The input event
     */
    handleInputChange(event) {
        this._couponCode = event.target.value;
    }

    /**
     * Handles the Apply button click
     * Dispatches a custom event with the coupon code
     */
    handleApply() {
        if (!this.isApplyDisabled) {
            const applyCouponEvent = new CustomEvent('applycoupon', {
                detail: {
                    couponCode: this._couponCode.trim(),
                },
                bubbles: true,
                composed: true,
            });
            this.dispatchEvent(applyCouponEvent);
        }
    }

    /**
     * Handles Enter key press in the input field
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.handleApply();
        }
    }
}
