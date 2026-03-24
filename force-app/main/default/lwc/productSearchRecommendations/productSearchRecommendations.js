/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { LightningElement, api } from 'lwc';
import * as Labels from './labelUtils';

/**
 * ProductSearchRecommendations displays a horizontally scrolling carousel of product recommendations.
 * Used in conversational commerce flows for product recommendations.
 *
 * Emits 'showproduct' events for parent handling.
 */
export default class productSearchRecommendations extends LightningElement {
    static renderMode = 'light';

    /**
     * Maximum number of options to display before showing "See More" button.
     * @type {number}
     */
    static MAX_DISPLAYED_OPTIONS = 5;

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
     * Array of suggested action questions, each containing description and options.
     * Supports multiple questions.
     * @type {Array<object>}
     */
    _suggestedActions = [];

    @api
    get suggestedActions() {
        return this._suggestedActions;
    }

    set suggestedActions(value) {
        // Handle array of questions
        if (Array.isArray(value) && value.length > 0) {
            // Validate each question has the required structure
            this._suggestedActions = value.filter(
                (question) =>
                    question &&
                    typeof question === 'object' &&
                    Array.isArray(question.options) &&
                    question.options.length > 0
            );
        } else if (value && typeof value === 'object' && Array.isArray(value.options)) {
            // Backward compatibility: handle single question object
            this._suggestedActions = [value];
        } else {
            this._suggestedActions = [];
        }
        // Reset bottom sheet tracking when suggested actions change
        this._openBottomSheetIndex = null;
    }

    /**
     * Tracks which question's bottom sheet is currently open.
     * Value is the index of the question, or null if no bottom sheet is open.
     * @type {number|null}
     * @private
     */
    _openBottomSheetIndex = null;

    /**
     * Get current language for translations.
     * @returns {string} The current language code
     */
    get language() {
        return this.configuration?.language || 'en_US';
    }

    /**
     * Get translated labels based on current language.
     * @returns {object} Object with translated label strings
     */
    get i18n() {
        return {
            moreOptionsLabel: Labels.moreOptionsLabel(this.language),
            optionsLabel: Labels.optionsLabel(this.language),
        };
    }

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
     * @returns {boolean} True if there are suggested actions with at least one question that has options.
     */
    @api
    get hasSuggestedActions() {
        return (
            Array.isArray(this.suggestedActions) &&
            this.suggestedActions.length > 0 &&
            this.suggestedActions.some(
                (question) => question && Array.isArray(question.options) && question.options.length > 0
            )
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
        // console.log('hasSuggestedActions', this.hasSuggestedActions());
    }

    /**
     * Returns processed suggested actions with displayed options and see more flags computed for each question.
     * Returns an array of processed question objects, each with displayedOptions and showSeeMore properties.
     * @returns {Array<object>} Array of processed question objects
     */
    get processedSuggestedActions() {
        const maxDisplayed = productSearchRecommendations.MAX_DISPLAYED_OPTIONS;
        return this.suggestedActions.map((question, index) => {
            const options = question.options;
            const displayedOptions = options.length > maxDisplayed ? options.slice(0, maxDisplayed) : options;
            const showSeeMore = options.length > maxDisplayed;
            const isBottomSheetOpen = this._openBottomSheetIndex === index;
            const isMultiSelect = question?.selectionType === 'MULTI_SELECT';

            return {
                ...question,
                index: index,
                displayedOptions,
                showSeeMore,
                isBottomSheetOpen,
                isMultiSelect,
                isSingleSelect: !isMultiSelect,
                questionIndex: index,
            };
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
     * Handles option selection from direct button clicks (inline options).
     * @param {Event} event - The click event from the option button.
     */
    handleSelectOptionFromButton(event) {
        const optionDisplayValue = event.target?.name;
        const utterance = event.target?.dataset?.utterance;
        this.processOptionSelection(optionDisplayValue, utterance, false);
    }

    /**
     * Handles option selection from bottom sheet CustomEvent.
     * @param {CustomEvent} event - The CustomEvent from the bottom sheet component.
     */
    handleSelectOptionFromBottomSheet(event) {
        // Stop propagation of the event from bottomSheet to prevent it from bubbling up
        event.stopPropagation();
        const optionDisplayValue = event.detail?.displayValue;
        const utterance = event.detail?.utterance;
        const questionIndex = event.detail?.questionIndex;
        this.processOptionSelection(optionDisplayValue, utterance, true, questionIndex);
    }

    /**
     * Processes the option selection and dispatches the selectoption event.
     * Closes the bottom sheet if the selection came from it.
     * @param {string} optionDisplayValue - The display value of the selected option.
     * @param {string} utterance - The utterance to send.
     * @param {boolean} isFromBottomSheet - Whether the selection came from the bottom sheet.
     * @param {number} questionIndex - The index of the question (for bottom sheet tracking).
     * @private
     */
    processOptionSelection(optionDisplayValue, utterance, isFromBottomSheet, questionIndex) {
        if (optionDisplayValue && utterance) {
            const eventDetail = {
                displayValue: optionDisplayValue,
                utterance: utterance,
            };

            this.dispatchEvent(new CustomEvent('selectoption', { detail: eventDetail }));

            // Close bottom sheet if the event came from it
            if (isFromBottomSheet && questionIndex !== undefined && questionIndex !== null) {
                this._openBottomSheetIndex = null;
            }
        }
    }

    /**
     * Handles the "See More" button click to open the bottom sheet with all options for a specific question.
     * @param {Event} event - The click event from the "See More" button.
     */
    handleSeeMore(event) {
        event.stopPropagation();
        event.preventDefault();
        const questionIndex = parseInt(event.target?.dataset?.questionIndex, 10);
        // Open the bottom sheet for the specific question
        if (this.hasSuggestedActions && questionIndex !== undefined && !isNaN(questionIndex)) {
            this._openBottomSheetIndex = questionIndex;
        }
    }

    /**
     * Handles the bottom sheet close event for a specific question.
     * @param {Event} event - The close event from the bottom sheet.
     */
    handleBottomSheetClose(event) {
        event.stopPropagation();
        event.preventDefault();
        // Get question index from the event detail or from the component that dispatched it
        const questionIndex = event.detail?.questionIndex;
        // Close the bottom sheet for the specific question
        if (questionIndex !== undefined && questionIndex !== null && this._openBottomSheetIndex === questionIndex) {
            this._openBottomSheetIndex = null;
        } else if (questionIndex === undefined || questionIndex === null) {
            // Fallback: close any open bottom sheet
            this._openBottomSheetIndex = null;
        }
    }
}
