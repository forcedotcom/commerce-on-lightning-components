/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { LightningElement, api } from 'lwc';

/**
 * ProductSearchRecommendations displays a horizontally scrolling carousel of product recommendations
 * and a set of category suggestion buttons. Used in conversational commerce flows.
 *
 * Emits 'selectcategory' and 'showproduct' events for parent handling.
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
     * Controls whether category recommendations should be displayed.
     * Defaults to false (categories hidden by default).
     * @type {boolean}
     */
    @api showCategoryRecommendations = false;

    /**
     * Controls whether show more products should be displayed.
     * Defaults to false (show more products hidden by default).
     * @type {boolean}
     */
    @api
    showMoreProducts = false;

    /**
     * Determines if there are product recommendations to display.
     * @returns {boolean} True if there are product recommendations.
     */
    get hasProductRecommendations() {
        return Array.isArray(this.productData) && this.productData.length > 0;
    }

    /**
     * Determines if there are category recommendations to display.
     * Checks both the presence of category data AND the showCategoryRecommendations flag.
     * @returns {boolean} True if there are category recommendations and they should be shown.
     */
    get hasCategoryRecommendations() {
        return this.showCategoryRecommendations && Array.isArray(this.categoryData) && this.categoryData.length > 0;
    }

    /**
     * Determines if there are any recommendations to display (products or categories).
     * @returns {boolean} True if there are product or category recommendations.
     */
    get hasRecommendations() {
        return this.hasProductRecommendations || this.hasCategoryRecommendations;
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
