/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api } from 'lwc';
import { closeButtonText, quantityHelpLabel } from './labels';

/**
 * @param {string} [text] The text/value to check
 * @returns {boolean} Whether the given text is neither `undefined`, `null`, nor empty.
 */
function isNotBlank(text) {
    return typeof text === 'string' && text.trim().length > 0;
}
export default class ProductQuantitySelectorPopover extends LightningElement {
    static renderMode = 'light';

    /**
     * Gets or sets the Minimum Text
     * @type {string}
     */
    @api
    minimumText;

    /**
     * Gets or sets the Maximum Text
     * @type {string}
     */
    @api
    maximumText;

    /**
     * Gets or sets the Increment Text
     * @type {string}
     */
    @api
    incrementText;

    /**
     * Shows/opens the popup.
     * @private
     */
    openPopup() {
        this.popup?.open({
            alignment: 'top',
            autoFlip: true,
            size: 'small',
        });
    }

    /**
     * Closes/hides the popup.
     * @private
     */
    closePopup() {
        this.popup?.close();
    }

    /**
     * Gets the popup-source
     * @returns {?HTMLElement} The popup source element
     * @readonly
     * @private
     */
    get popup() {
        return this.querySelector('experience-popup-source');
    }

    /**
     * Whether to display the increment text.
     * @type {boolean}
     * @readonly
     * @private
     */
    get showIncrementText() {
        return isNotBlank(this.incrementText);
    }

    /**
     * Whether to display the maximum text.
     * @type {boolean}
     * @readonly
     * @private
     */
    get showMaxText() {
        return isNotBlank(this.maximumText);
    }

    /**
     * Whether to display the minimum text.
     * @type {boolean}
     * @readonly
     * @private
     */
    get showMinText() {
        return isNotBlank(this.minimumText);
    }

    /**
     * Gets the i18n labels to display in the template
     * @type {object}
     * @readonly
     * @private
     */
    get i18n() {
        return {
            closeButtonText,
            quantityHelpLabel,
        };
    }
}
