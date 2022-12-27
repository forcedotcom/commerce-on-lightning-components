/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';
import {
    generateButtonSizeClass,
    generateButtonStretchClass,
    generateButtonStyleClass,
    generateElementAlignmentClass,
} from 'experience/styling';

export default class CommonLink extends LightningElement {
    static renderMode = 'light';
    @api
    disabled = false;

    /**
     * Hyperlink URL.
     * @type {?string}
     */
    @api
    href;

    /**
     * The assistive text for the anchor element (or button element in disabled state).
     * @type {?string}
     */
    @api
    assistiveText;

    /**
     * The anchor/button variant.
     * @type {?('primary' | 'secondary' | 'tertiary')}
     */
    @api
    variant;

    /**
     * The anchor/button size.
     * @type {?('small' | 'large')}
     */
    @api
    size;

    /**
     * The anchor/button width.
     * @type {?('stretch' | 'standard')}
     */
    @api
    width;

    /**
     * The alignment of the content inside the anchor/button.
     * @type {?('center' | 'left' | 'right')}
     */
    @api
    alignment;

    @api
    focus() {
        this.querySelector('a')?.focus();
    }
    get anchorClasses() {
        return [
            'slds-button',
            generateButtonStyleClass(this.variant ?? null),
            generateButtonSizeClass(this.size ?? null),
            generateButtonStretchClass(this.width ?? null),
            generateElementAlignmentClass(this.alignment ?? null),
        ].join(' ');
    }

    /**
     * Makes sure that {@link Event.prototype.preventDefault} gets called when
     * the `href` attribute is either `undefined` or blank.
     * @param {Event} event The caught event
     */
    handleClick(event) {
        if (typeof this.href !== 'string' || this.href.trim().length === 0) {
            event.preventDefault();
        }
    }
}
