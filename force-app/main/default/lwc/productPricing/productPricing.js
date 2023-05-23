/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api } from 'lwc';
import { Labels } from './labels';
import displayOriginalPriceEvaluator from './productPricingUtils';

export default class ProductPricing extends LightningElement {
    static renderMode = 'light';
    /**
     * Assistive text, required because screen-readers do not read out strikethrough styling
     * @returns {string} '(crossed out)'
     * @private
     */
    get strikethroughAssistiveText() {
        return Labels.strikethroughAssistiveText;
    }

    /**
     * The localized negotiated price label for the item.
     * @type {string}
     */
    @api
    negotiatedPriceLabel;

    /**
     * The localized original price label for the item.
     * @type {string}
     */
    @api
    originalPriceLabel;

    /**
     * The localized label to display when no pricing is available
     * @type {string}
     */
    @api
    unavailablePriceLabel;

    /**
     * The localized negotiated price of the item.
     * @type {string}
     */
    @api
    negotiatedPrice;

    /**
     * The localized original price of the item.
     * @type {string}
     */
    @api
    originalPrice;

    /**
     * The ISO 4217 currency code for the product detail page
     * @type {string}
     */
    @api
    currencyCode;

    /**
     * Whether to display the negotiated price
     * @type {boolean}
     */
    @api
    showNegotiatedPrice = false;

    /**
     * Whether to display the original price
     * @type {boolean}
     */
    @api
    showOriginalPrice = false;

    /**
     * Whether to display the tax included text
     * @type {boolean}
     */
    @api
    showTaxIndication = false;

    /**
     * The Tax Included label text.
     * @type {string}
     */
    @api
    taxIncludedLabel;

    /**
     * Tax locale type for the product.
     * Possible values are "Gross" and "Net"
     * @type {string}
     */
    @api
    taxLocaleType;

    /**
     * Tax rate for the product.
     * When a given product is exempt, taxRate will be 0
     * @type {number}
     */
    @api
    taxRate;

    /**
     * Gets whether Tax Information can be shown. Will only be true
     * when taxLocaleType is "Gross", showTaxIndication is configured to be shown and
     * taxRate is not 0 or when taxRate is undefined (this scenario occurs when CommerceTax perm is not enabled)
     * @type {boolean}
     */
    get taxInfoVisible() {
        if (this.showTaxIndication) {
            return this.isPriceAvailable && this.taxLocaleType === 'Gross' && this.taxRate !== 0;
        }
        return false;
    }

    /**
     * Whether to display the original price
     * @returns {boolean} true if the original (list) price should be displayed, otherwise false
     * @private
     */
    get displayOriginalPrice() {
        return displayOriginalPriceEvaluator(
            this.showNegotiatedPrice,
            this.showOriginalPrice,
            this.negotiatedPrice,
            this.originalPrice
        );
    }

    /**
     * Whether to display the negotiated price
     * @returns {boolean}
     * true if negotiated price is available and option to display it is also true
     * @private
     */
    get displayNegotiatedPrice() {
        return this.showNegotiatedPrice && !!this.negotiatedPrice;
    }

    /**
     * Whether to display the assistive text for strike-through text
     * @returns {boolean}
     * true if both negotiated and original prices are displayed
     * @private
     */
    get displayAssistiveText() {
        return this.displayNegotiatedPrice && this.displayOriginalPrice;
    }

    /**
     * Whether the pricing information is available
     * @returns {boolean}
     * true if negotiated price exists and needs to be shown, otherwise false
     * @private
     */
    get isPriceAvailable() {
        return this.showNegotiatedPrice && !!this.negotiatedPrice;
    }

    /**
     * Whether there is a negotiated price label to display.
     * @returns {boolean}
     * true if a negotiated price label has been supplied, otherwise false
     * @private
     */
    get hasNegotiatedPriceLabel() {
        return !!this.negotiatedPriceLabel;
    }

    /**
     * Whether there is an original price label to display.
     * @returns {boolean}
     * true if an original (list) price label has been supplied, otherwise false
     * @private
     */
    get hasOriginalPriceLabel() {
        return !!this.originalPriceLabel;
    }
}
