/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement, wire } from 'lwc';
import { SessionContextAdapter } from 'commerce/contextApi';
// TODO: This is a temporary solution/import and should be replaced with `experience/styling`,
//  once this bundle is publicly available. The file `./styling` can then be removed!
import { generateStyleProperties } from './styling';
import { priceAdjustmentTiers } from './designTimeData'; // <-- design-time only

/**
 * @typedef {{[key: string]: *}} JsonData
 */

/**
 * Dedicated Building Block component which displays pricing tiers for a product with tiered discounts.
 *
 * **Important Note:**
 *
 * This example uses a technique that can have a minimal negative impact on the runtime behavior of the component.
 * Namely, this example loads component-specific mock data at design-time (when in the Experience Builder) so that
 * a user is not left without any visualization of the component during the declarative administration of a page.
 *
 * If you prefer to change this behavior, simply remove the places marked with "design-time only".
 * @slot title
 */
export default class BuilderPricingTiers extends LightningElement {
    static renderMode = 'light';

    /**
     * @type {?JsonData}
     * @private
     */
    _sessionContext; // <-- design-time only

    /**
     * @type {?JsonData}
     * @private
     */
    _productPricing;

    /**
     * @type {?JsonData}
     * @private
     */
    _designTimeData; // <-- design-time only

    /**
     * We need to show the pricing tiers during design-time / preview mode. So we're using
     * the session context to retrieve that information.
     * @param {object} response Wire adapter response
     * @param {JsonData} [response.data] The wired session context data
     * @private
     */
    @wire(SessionContextAdapter) // <-- design-time only
    wireSessionContext({ data }) {
        this._sessionContext = data;
        if (this._sessionContext?.isPreview && !this._designTimeData) {
            this._designTimeData = priceAdjustmentTiers();
        }
    }

    /**
     *  The row label text displayed for the second row of adjustment tiers where the quantities are displayed.
     *  @type {?string}
     */
    @api
    quantityRowLabel;

    /**
     *  The row label text displayed for the first row of adjustment tiers where the discounts per unit are displayed.
     *  @type {?string}
     */
    @api
    discountRowLabel;

    /**
     * Border radius of the price adjustment tiers
     * @type {?number}
     */
    @api
    borderRadius;

    /**
     * Background color of the price adjustment tiers
     * @type {?string}
     */
    @api
    backgroundColor;

    /**
     * Row title text for price adjustment tiers
     * @type {?string}
     */
    @api
    rowTitleTextColor;

    /**
     * Label text for price adjustment tiers
     * @type {?string}
     */
    @api
    labelTextColor;

    /**
     * Color for the price adjustment tiers
     * @type {?string}
     */
    @api
    textColor;

    /**
     * Border Color of the price adjustment tiers
     * @type {?string}
     */
    @api
    borderColor;

    /**
     * Product detail data
     * @type {?JsonData}
     */
    @api
    product;

    /**
     * Product variant data
     * @type {?JsonData}
     */
    @api
    productVariant;

    /**
     * Product pricing data
     * @type {?JsonData}
     */
    @api
    set productPricing(value) {
        this._productPricing = value;
    }

    get productPricing() {
        if (
            this.isPreviewMode &&
            this._productPricing &&
            !Array.isArray(this._productPricing.priceAdjustment?.priceAdjustmentTiers) &&
            this._designTimeData
        ) {
            // This whole condition is for the design-time only
            return { ...this._productPricing, priceAdjustment: { priceAdjustmentTiers: this._designTimeData } };
        }
        return this._productPricing;
    }

    /**
     * design-time only
     * @private
     * @returns {boolean} Whether we operate in the design-time / preview mode
     */
    get isPreviewMode() {
        return !!this._sessionContext?.isPreview;
    }

    /**
     * Whether the tier pricing is disabled
     * @private
     * @returns {boolean} true if tier pricing is disabled
     */
    get isTierPricingDisabled() {
        return (
            this.productVariant?.isValid === false ||
            this.product?.productClass === 'VariationParent' ||
            this.product?.productClass === 'Set'
        );
    }

    /**
     * @private
     * @returns {boolean} true if the pricing tier should be shown
     */
    get showPricingTiers() {
        return (
            // The `isPreviewMode` condition portion is for the design-time only
            this.isPreviewMode ||
            (this?.productPricing?.priceAdjustment?.priceAdjustmentTiers !== undefined && !this.isTierPricingDisabled)
        );
    }

    /**
     * @private
     * @returns {string} string of pricing tiers custom styles
     */
    get pricingTiersCustomStyles() {
        return generateStyleProperties({
            '--ref-c-product-pricing-tiers-border-radius:': this.borderRadius ? this.borderRadius + 'px' : 'initial',
            '--ref-c-product-pricing-tiers-background-color:': this.backgroundColor || 'initial',
            '--ref-c-product-pricing-tiers-row-title-text-color:': this.rowTitleTextColor || 'initial',
            '--ref-c-product-pricing-tiers-label-text-color:': this.labelTextColor || 'initial',
            '--ref-c-product-pricing-tiers-text-color:': this.textColor || 'initial',
            '--ref-c-product-pricing-tiers-border-color:': this.borderColor || 'initial',
        });
    }
}
