/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api } from 'lwc';
export default class SearchSliderFacet extends LightningElement {
    static renderMode = 'light';

    /**
     * The id of the facet
     * @type {?string}
     */
    @api
    facetId;

    /**
     * The minimum value count for the slider
     * @type {?number}
     */
    @api
    min;

    /**
     * The maximum value count for the slider
     * @type {?number}
     */
    @api
    max;
}
