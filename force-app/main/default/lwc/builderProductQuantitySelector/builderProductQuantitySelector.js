/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';
import { createCommonQuantityUpdateAction, dispatchAction } from 'commerce/actionApi';

/**
 * The QuantitySelector component is a common component that can be used on all pages to show a number input field
 * optionally with quantity rules and +/- buttons.
 *
 * Parameters:
 *  minimum - The minimal allowed value
 *  maximum - The maximum allowed value
 *  step - The allowed increments
 *
 *  hideLabel - boolean to hide the label for the inout field
 *  hideButtons - boolean to hide the +/- buttons
 *
 *  label - The label for the input field
 *  minimumValueGuideText - text that shows up in a quantity rules popover; takes '{minimum}' as a replaceable parameter
 *  maximumValueGuideText - text that shows up in a quantity rules popover; takes '{maximum}' as a replaceable parameter
 *  stepValueGuideText - text that shows up in a quantity rules popover; takes '{step}' as a replaceable parameter
 */
export default class BuilderProductQuantitySelector extends LightningElement {
    static renderMode = 'light';

    @api
    minimum;

    @api
    maximum;

    @api
    step;

    @api
    hideLabel = false;

    @api
    hideButtons = false;

    @api
    label;

    @api
    minimumValueGuideText;

    @api
    maximumValueGuideText;

    @api
    stepValueGuideText;

    handleQuantityChanged({ detail }) {
        if (detail && typeof detail.value === 'number') {
            dispatchAction(this, createCommonQuantityUpdateAction(detail.value));
        }
    }
}
