/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { LightningElement, api } from 'lwc';

/**
 * ProductSearchRecommendations displays a horizontally scrolling carousel of product recommendations.
 * Used in conversational commerce flows for product recommendations.
 *
 * Emits 'showproduct' events for parent handling.
 */
export default class productSearchRecommendations extends LightningElement {
    static renderMode = 'light';

    /**
     * Configuration object containing language and other settings
     * @type {object}
     */
    @api configuration = {};

    /**
     * Array of product data objects to display in the carousel.
     * @type {Array}
     */
    _productData = [];

    @api
    get productData() {
        return this._productData;
    }

    set productData(value) {
        this._productData = value || [];
    }
    /**
     * Description text shown above the product carousel.
     * @type {string}
     */
    @api productsDescription = '';

    /**
     * Controls whether show more products should be displayed.
     * Defaults to false (show more products hidden by default).
     * @type {boolean}
     */
    @api
    showMoreProducts = false;

    /**
     * Configuration object containing suggested action description and options.
     * @type {object}
     */
    @api suggestedActions = {};

    /**
     * Determines if there are product recommendations to display.
     * @returns {boolean} True if there are product recommendations.
     */
    get hasProductRecommendations() {
        return Array.isArray(this.productData) && this.productData.length > 0;
    }

    /**
     * Determines if there are any recommendations to display (products).
     * @returns {boolean} True if there are product.
     */
    get hasRecommendations() {
        return this.hasProductRecommendations;
    }

    /**
     * Determines if there are suggested actions to display.
     * @returns {boolean} True if there are suggested actions with description and options.
     */
    @api
    get hasSuggestedActions() {
        return (
            this.suggestedActions &&
            typeof this.suggestedActions === 'object' &&
            this.suggestedActions.description &&
            Array.isArray(this.suggestedActions.options) &&
            this.suggestedActions.options.length > 0
        );
    }

    /**
     * Returns product data with transformed image URLs (large -> medium).
     * Note: This getter is only called when hasProductRecommendations is true,
     * which already validates that productData is a non-empty array.
     * @returns {Array} Array of product objects with transformed imageUrl properties
     */
    get transformedProductData() {
        return this._productData.map((product) => {
            // Create a new product object with transformed imageUrl
            const transformedProduct = { ...product, outOfStock: !product?.inStock };

            if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.includes('/large/')) {
                transformedProduct.imageUrl = product.imageUrl.replace('/large/', '/medium/');
            }

            return transformedProduct;
        });
    }

    /**
     * Handles product card selection from the carousel, emitting 'showproduct' with name, id, and optionally url.
     * @param {CustomEvent} event - The custom event from the carousel with product details.
     */
    handleShowProduct(event) {
        const { productName, productId, productUrl } = event.detail;

        if (productName && productId) {
            const eventDetail = {
                name: productName,
                id: productId,
            };

            // Include URL if provided
            if (productUrl) {
                eventDetail.url = productUrl;
            }

            this.dispatchEvent(
                new CustomEvent('showproduct', {
                    detail: eventDetail,
                })
            );
        }
    }

    /**
     * Handles option button click, emitting 'selectoption' with displayValue and utterance.
     * @param {Event} event - The click event from the option button.
     */
    handleSelectOption(event) {
        const optionDisplayValue = event.target.name;
        const utterance = event.target.dataset.utterance;

        if (optionDisplayValue && utterance) {
            const eventDetail = {
                displayValue: optionDisplayValue,
                utterance: utterance,
            };

            this.dispatchEvent(new CustomEvent('selectoption', { detail: eventDetail }));
        }
    }
}
