/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api } from 'lwc';
import { transformTierAdjustmentContents } from './utils';

/**
 * @typedef {{[key: string]: *}} JsonData
 */

export default class ProductPricingTiers extends LightningElement {
    static renderMode = 'light';

    /**
     * Gets or sets the text of the label text for the quantity row.
     * @type {string}
     */
    @api
    quantityRowLabel;

    /**
     * Gets or sets the text of the label text for the discount row.
     * @type {string}
     */
    @api
    discountRowLabel;

    /**
     * Product Pricing API response data
     * @type {?JsonData}
     */
    @api
    productPricing;

    /**
     * @returns {Array<JsonData>} Ensures an iterable price adjustments tiers format for the template
     */
    get normalizedAdjustmentTiers() {
        return transformTierAdjustmentContents(this.productPricing);
    }

    /**
     * @returns {?string} An ISO currency code
     */
    get currencyCode() {
        return this.productPricing?.currencyIsoCode ?? null;
    }
}
