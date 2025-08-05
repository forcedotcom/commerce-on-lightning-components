/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { LightningElement, api } from 'lwc';
import { addToCartAssistiveText } from './labels';

/**
 * ProductSearchRecommendations displays a horizontally scrolling carousel of product recommendations
 * and a set of category suggestion buttons. Used in conversational commerce flows.
 *
 * Emits 'selectcategory' and 'showproduct' events for parent handling.
 */
export default class productSearchRecommendations extends LightningElement {
    static renderMode = 'light';

    /**
     * Assistive text for add-to-cart actions (from custom labels).
     * @type {string}
     */
    i18n = { addToCartAssistiveText };

    /**
     * Array of product data objects to display in the carousel.
     * @type {Array}
     */
    @api productData = [];
    /**
     * Description text shown above the product carousel.
     * @type {string}
     */
    @api productsDescription = '';
    /**
     * Array of category data objects for suggestion buttons.
     * @type {Array}
     */
    @api categoryData = [];
    /**
     * Description text shown above the category buttons.
     * @type {string}
     */
    @api categoriesDescription = '';

    /**
     * Determines if there are product recommendations to display.
     * @returns {boolean} True if there are product recommendations.
     */
    get hasProductRecommendations() {
        return Array.isArray(this.productData) && this.productData.length > 0;
    }

    /**
     * Determines if there are category recommendations to display.
     * @returns {boolean} True if there are category recommendations.
     */
    get hasCategoryRecommendations() {
        return Array.isArray(this.categoryData) && this.categoryData.length > 0;
    }

    /**
     * Determines if there are any recommendations to display (products or categories).
     * @returns {boolean} True if there are product or category recommendations.
     */
    get hasRecommendations() {
        return this.hasProductRecommendations || this.hasCategoryRecommendations;
    }

    /**
     * Handles category button click, emitting 'selectcategory' with name and id.
     * @param {Event} event - The click event from the category button.
     */
    handleSelectCategory(event) {
        const categoryName = event.target.name;
        const categoryId = event.target.dataset.id;

        if (categoryName && categoryId) {
            this.dispatchEvent(
                new CustomEvent('selectcategory', {
                    detail: {
                        name: categoryName,
                        id: categoryId,
                    },
                })
            );
        }
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
}
