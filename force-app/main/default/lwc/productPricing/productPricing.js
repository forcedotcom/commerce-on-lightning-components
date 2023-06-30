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
     * The desired layout of price text.
     * horizontal will display on single line, with original/list price first (if visible)
     * vertical will display on 2 lines, with original/list price last (if visible)
     * @type {?('horizontal' | 'vertical')}
     */
    @api
    layout;

    /**
     * The localized negotiated price label for the item.
     * @type {?string}
     */
    @api
    negotiatedPriceLabel;

    /**
     * The localized original price label for the item.
     * @type {?string}
     */
    @api
    originalPriceLabel;

    /**
     * The localized label to display when no pricing is available
     * @type {?string}
     */
    @api
    unavailablePriceLabel;

    /**
     * The localized negotiated price of the item.
     * @type {?string}
     */
    @api
    negotiatedPrice;

    /**
     * The localized original price of the item.
     * @type {?string}
     */
    @api
    originalPrice;

    /**
     * The ISO 4217 currency code for the product detail page
     * @type {?string}
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
     * @type {?string}
     */
    @api
    taxIncludedLabel;

    /**
     * Tax locale type for the product.
     * Possible values are "Gross" and "Net"
     * @type {?('Gross' | 'Net')}
     */
    @api
    taxLocaleType;

    /**
     * Tax rate for the product.
     * When a given product is exempt, taxRate will be 0
     * @type {?number}
     */
    @api
    taxRate;

    /**
     * Assistive text, required because screen-readers do not read out strikethrough styling
     * @type {string}
     * @private
     * @readonly
     */
    get strikethroughAssistiveText() {
        return Labels.strikethroughAssistiveText;
    }

    /**
     * Gets whether Tax Information can be shown. Will only be true
     * when taxLocaleType is "Gross", showTaxIndication is configured to be shown and
     * taxRate is not 0 or when taxRate is undefined (this scenario occurs when CommerceTax perm is not enabled)
     * @type {boolean}
     * @readonly
     * @private
     */
    get taxInfoVisible() {
        return this.showTaxIndication && this.isPriceAvailable && this.taxLocaleType === 'Gross' && this.taxRate !== 0;
    }

    /**
     * Whether to display the original price
     * @returns {boolean} true if the original (list) price should be displayed, otherwise false
     * @readonly
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
     * @readonly
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
     * @readonly
     */
    get displayAssistiveText() {
        return this.displayNegotiatedPrice && this.displayOriginalPrice;
    }

    /**
     * Whether the pricing information is available
     * @returns {boolean}
     * true if negotiated price exists and needs to be shown, otherwise false
     * @private
     * @readonly
     */
    get isPriceAvailable() {
        return this.showNegotiatedPrice && !!this.negotiatedPrice;
    }

    /**
     * Whether there is a negotiated price label to display.
     * @returns {boolean}
     * true if a negotiated price label has been supplied, otherwise false
     * @private
     * @readonly
     */
    get hasNegotiatedPriceLabel() {
        return !!this.negotiatedPriceLabel;
    }

    /**
     * Whether there is an original price label to display.
     * @returns {boolean}
     * true if an original (list) price label has been supplied, otherwise false
     * @private
     * @readonly
     */
    get hasOriginalPriceLabel() {
        return !!this.originalPriceLabel;
    }

    /**
     * Gets classes based on horizontal or vertical layout.
     * Note: for horizontal it reverses display so that originalPrice is first.
     * @type {string}
     * @private
     * @readonly
     */
    get layoutClass() {
        return `slds-grid price-container ${
            this.layout === 'horizontal' ? 'slds-grid_reverse slds-grid_align-end' : 'slds-grid_vertical'
        }`;
    }
}
