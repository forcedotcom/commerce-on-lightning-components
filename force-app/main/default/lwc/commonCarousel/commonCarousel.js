/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { LightningElement, api } from 'lwc';
import { addToCartAssistiveText, productImageAltText } from './labels';

/**
 * CommonCarousel is a flexible carousel component for displaying either product images or product cards.
 * - Image carousel mode: for product detail image galleries.
 * - Product cards carousel mode: for horizontally scrolling product recommendations.
 *
 * Accessibility and SLDS best practices are followed. Emits 'productselected' event for card selection.
 * @fires CommonCarousel#productselected
 */
export default class CommonCarousel extends LightningElement {
    static renderMode = 'light';

    /**
     * Optional heading for the carousel (not rendered by default).
     * @type {string}
     */
    @api heading;
    /**
     * Array of product card data objects for product card carousel mode.
     * @type {Array}
     */
    @api productData = [];
    /**
     * Determines carousel mode: 'productDetailImageCarousel' or 'productSearchRecommendations'.
     * @type {string}
     */
    @api displayMode;

    // Private properties for product image links
    _productImageLinks = [];

    /**
     * Component labels
     */
    i18n = { addToCartAssistiveText, productImageAltText };

    // API property with setter to trigger reactive updates
    @api
    get productImageLinks() {
        return this._productImageLinks;
    }

    set productImageLinks(value) {
        this._productImageLinks = value || [];
    }

    // Computed getter for filtered product images - updates reactively
    get filteredProductImageLinks() {
        if (Array.isArray(this._productImageLinks)) {
            return this._productImageLinks.filter((imageObj) => imageObj && imageObj.url && imageObj.url.trim() !== '');
        }
        return [];
    }

    // Lifecycle methods
    renderedCallback() {
        // Initialize accessibility for both carousel types
        this.setupAccessibility();
    }

    setupAccessibility() {
        const scrollContainer = this.querySelector('.carousel-scroll-container');
        if (scrollContainer) {
            // Set appropriate aria-label based on carousel type
            if (this.isImageCarousel) {
                scrollContainer.setAttribute('role', 'region');
                scrollContainer.setAttribute('aria-label', 'Product Images');
            } else if (this.isProductCardsCarousel) {
                scrollContainer.setAttribute('role', 'region');
                scrollContainer.setAttribute('aria-label', 'Product Recommendations');
            }

            // Add single-item class for centering when there's only one item
            const carouselPanels = scrollContainer.querySelectorAll('.slds-carousel__panel');
            if (carouselPanels.length === 1) {
                scrollContainer.classList.add('single-item');
            } else {
                scrollContainer.classList.remove('single-item');
            }
        }
    }

    // Display mode getters
    get isImageCarousel() {
        // Backward compatibility: if no displayMode is set but productImageLinks exist, show image carousel
        if (!this.displayMode && Array.isArray(this._productImageLinks) && this._productImageLinks.length > 0) {
            return true;
        }
        return this.displayMode === 'productDetailImageCarousel';
    }

    get isProductCardsCarousel() {
        return this.displayMode === 'productSearchRecommendations';
    }

    get hasProductData() {
        return Array.isArray(this.productData) && this.productData.length > 0;
    }

    // Event handlers
    /**
     * Handles product card click, emitting 'productselected' with productName and productId.
     * @param {Event} event - The click event from the product card button.
     */
    handleShowProduct(event) {
        const productName = event.currentTarget.name;
        const productId = event.currentTarget.dataset.id;
        const productUrl = event.currentTarget.dataset.url;

        if (productName && productId) {
            this.dispatchEvent(
                new CustomEvent('productselected', {
                    detail: {
                        productName,
                        productId,
                        productUrl,
                    },
                    bubbles: true,
                    composed: true,
                })
            );
        }
    }
}
