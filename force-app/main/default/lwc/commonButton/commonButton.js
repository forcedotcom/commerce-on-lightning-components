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
export default class CommonButton extends LightningElement {
    static renderMode = 'light';
    @api
    disabled = false;

    /**
     * The assistive text for the button.
     * @type {?string}
     */
    @api
    assistiveText;

    /**
     * The button variant.
     * @type {?('primary' | 'secondary' | 'tertiary')}
     */
    @api
    variant;

    /**
     * The button size.
     * @type {?('small' | 'large')}
     */
    @api
    size;

    /**
     * The width of the button.
     * @type {?('stretch' | 'standard')}
     */
    @api
    width;

    /**
     * The alignment of the content inside the button.
     * @type {?('center' | 'left' | 'right')}
     */
    @api
    alignment;

    @api
    focus() {
        this.button.focus();
    }
    get button() {
        return this.querySelector('button');
    }
    get buttonClasses() {
        return [
            'slds-button',
            generateButtonStyleClass(this.variant ?? null),
            generateButtonSizeClass(this.size ?? null),
            generateButtonStretchClass(this.width ?? null),
            generateElementAlignmentClass(this.alignment ?? null),
        ].join(' ');
    }
}
