/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { LightningElement, api } from 'lwc';
import * as labels from './labels';

export default class ProductSummaryComponent extends LightningElement {
    static renderMode = 'light';

    @api item;

    /**
     * Internationalized labels used throughout the component.
     * Automatically reflects all exports from `labels.js`.
     */
    i18n = labels;

    /**
     * Gets the product image URL
     * @returns {string} URL of the product image
     */
    get imageUrl() {
        return this.item?.imageUrl;
    }

    /**
     * Gets the product name
     * @returns {string} Name of the product
     */
    get name() {
        return this.item?.name;
    }

    /**
     * Gets the product variants (attributes/characteristics) with their labels
     * @returns {Array} Array of product variants with labels (limited to 2 items)
     */
    get facets() {
        const variationAttributesMap = new Map();
        if (Array.isArray(this.item.variationAttributes)) {
            this.item.variationAttributes.forEach((attr) => {
                variationAttributesMap.set(attr.id, attr.label);
            });
        }

        return (this.item.variants || [])
            .map((variant) => {
                // Added defensive check
                const label = variationAttributesMap.get(variant.type) || variant.type;
                // Capitalize first letter of the label
                const capitalizedLabel = label ? label.charAt(0).toUpperCase() + label.slice(1) : label;
                return {
                    ...variant,
                    label: capitalizedLabel,
                };
            })
            .slice(0, 2);
    }

    /**
     * Determines if the product has variants
     * @returns {boolean} True if product has variants array with items
     */
    get hasFacets() {
        return Array.isArray(this.item?.variants) && this.item.variants.length > 0;
    }

    /**
     * Gets the product quantity
     * @returns {number} Quantity of the product
     */
    get quantity() {
        return this.item?.quantity;
    }

    /**
     * Gets the formatted price of the product
     * @returns {string} Pre-formatted price string
     */
    get formattedPrice() {
        return this.item?.formattedPrice;
    }

    /**
     * Gets the standard price of the product
     * @returns {number} Standard price amount
     */
    get standardPrice() {
        return this.item?.originalSubtotal;
    }

    /**
     * Determines if the product has a valid standard price different from current price
     * @returns {boolean} True if standard price exists and differs from item subtotal
     */
    get hasStandardPrice() {
        return (
            this.standardPrice !== null &&
            this.standardPrice !== undefined &&
            this.standardPrice !== this.item?.itemSubtotal
        );
    }

    /**
     * Gets the formatted standard price for display
     * @returns {string} Formatted standard price string
     */
    get formattedStandardPrice() {
        const currencyCode = this.item?.currencyCode || 'USD';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
        }).format(this.standardPrice);
    }

    /**
     * Provides an ARIA label for the price display, especially for discounted items.
     * @returns {string} An ARIA label describing the price(s).
     */
    get priceAriaLabel() {
        if (this.hasStandardPrice) {
            return `${this.i18n.originalPriceLabel}: ${this.formattedStandardPrice}, ${this.i18n.currentPriceLabel}: ${this.formattedPrice}`;
        }
        return this.formattedPrice; // For non-discounted items, just the price
    }
}
