/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
import { EVENT, KEY_CODE } from './constants';
import { i18n } from './labels';
/**
 * @typedef {import('../searchProductCard/searchProductCard').ProductCardConfiguration} ProductCardConfiguration
 */

/**
 * @typedef {import('../searchProductCard/searchProductCard').ProductCardData} ProductCardData
 */

/**
 * Generates an SLDS CSS class representing margin of a given spacing.
 * @param {string} spacing The defined spacing
 * @param {('vertical' | 'horizontal')} direction The direction to use
 * @returns {string} The margin class
 */
function generateClassForSpacing(spacing, direction) {
    return ['none', 'small', 'medium', 'large'].includes(spacing) ? `slds-m-${direction}_${spacing}` : '';
}

/**
 * An event fired when the add to cart button is clicked.
 * @event SearchProductGrid#addproducttocart
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {string} detail.productId
 *   The unique identifier of the product to be added to the cart.
 * @property {number} detail.quantity
 *   The quantity of the product to be added to the cart.
 */

/**
 * An event fired when the user indicates a desire to view the details of a product.
 * @event SearchProductGrid#showproduct
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {string} detail.productId
 *   The unique identifier of the product.
 * @property {string} detail.productName
 *   The name of the product.
 */

/**
 * The layout UI configuration.
 * @typedef {object} ProductGridConfiguration
 * @property {string} layout
 *  The layout for the card collection.
 *  Supported (case-sensitive) values are:
 *  - "grid"
 *      The products will be displayed in grid column layout.
 *      The property gridMaxColumnsDisplayed defines the max no. of columns.
 *  - "list"
 *      The products will be displayed as a list.
 * @property {number} gridMaxColumnsDisplayed
 *  The maximum columns to be displayed in the grid.
 * @property {ProductCardConfiguration} cardConfiguration
 *  The card layout configuration.
 */

/**
 * Representation of Builder Field Item
 * @typedef {object} BuilderFieldItem
 * @property {string} name
 *  The name of the field.
 * @property {string} fontSize
 *  The font size of the field.
 *  Accepted values are: "small", "medium", and "large"
 * @property {string} fontColor
 *  Font color for the field, as 'rgb', 'rgba' or 'hex' CSS value.
 */

/**
 * @fires SearchProductGrid#showproduct
 * @fires SearchProductGrid#addproducttocart
 */
export default class SearchProductGrid extends LightningElement {
    static renderMode = 'light';

    /**
     * Gets or sets the product layout configuration.
     * @type {?ProductGridConfiguration}
     */
    @api
    configuration;

    /**
     * Gets or sets the card collection display-data.
     * @type {?ProductCardData[]}
     */

    @api
    displayData;

    /**
     * Gets the normalized card collection display-data.
     * @type {ProductCardData[]}
     * @readonly
     * @private
     */
    get normalizedDisplayData() {
        return this.displayData ?? [];
    }

    /**
     * Gets the SLDS classes to apply the spacing for the product layout.
     * @type {string}
     * @readonly
     * @private
     */
    get layoutSpacingClasses() {
        const list = this?.querySelector('ul');
        const spacingRow = list && getComputedStyle(list).getPropertyValue('--ref-c-search-product-grid-spacing-row');
        const spacingCol =
            list && getComputedStyle(list).getPropertyValue('--ref-c-search-product-grid-spacing-column');
        const row = generateClassForSpacing(spacingRow || '', 'vertical');
        const col = generateClassForSpacing(spacingCol || '', 'horizontal');
        return `${row} ${col}`.trim();
    }

    /**
     * Gets the custom styles to apply to the elements of the product layout.
     * @type {string}
     * @readonly
     * @private
     */
    get layoutCustomStyles() {
        const gridMaxColumnsDisplayed = this.configuration?.gridMaxColumnsDisplayed || 4;
        const cardBasis = gridMaxColumnsDisplayed > 0 ? 100 / gridMaxColumnsDisplayed : 25;
        return generateStyleProperties({
            '--ref-c-search-product-grid-container-basis': `${Math.round(cardBasis * 100) / 100}%`,
        });
    }

    /**
     * Gets the grid specific class for the un-ordered list container if the
     * layout is 'grid', otherwise it returns empty string.
     * @type {string}
     * @readonly
     * @private
     */
    get layoutContainerClass() {
        return this.isGridLayout ? 'product-grid-container' : '';
    }

    /**
     * Gets whether the layout is grid or not.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isGridLayout() {
        return this.configuration?.layout === 'grid';
    }

    /**
     * Arial label for the list.
     * @type {string}
     * @readonly
     * @private
     */
    get ariaLabelForSearchResults() {
        return i18n.searchResults;
    }

    /**
     * Product card configuration.
     * @type {?ProductCardConfiguration}
     * @readonly
     * @private
     */
    get cardConfiguration() {
        return this.configuration?.cardConfiguration;
    }

    /**
     * Handles the `addproducttocart` event which adds the product to the cart.
     * @param {CustomEvent} event An "addproducttocart" received from a product card
     * @private
     * @fires SearchProductGrid#addproducttocart
     */
    handleAddToCart(event) {
        event.stopPropagation();
        this.dispatchEvent(
            new CustomEvent(EVENT.ADD_PRODUCT_TO_CART_EVT, {
                detail: event.detail,
            })
        );
    }

    /**
     * Handles the `showproduct` event which navigates to a product detail page.
     * @param {CustomEvent} event A "showproduct" received from a product card
     * @private
     * @fires SearchProductGrid#showproduct
     */
    handleNavigateToProductPage(event) {
        event.stopPropagation();
        this.dispatchEvent(
            new CustomEvent(EVENT.SHOW_PRODUCT_EVT, {
                detail: event.detail,
            })
        );
    }

    /**
     * Handles key downs on the list.
     *
     * - Home moves focus to first item.
     * - End moves focus to last item.
     * - Up arrow moves focus to previous item.
     * - Down arrow moves focus to next item.
     *
     * When the Add to Cart button is present, user can navigate
     * the list using the Home, End, and Tab (default behavior) keys.
     *
     * When the Add to Cart button isn’t present, user can navigate
     * the list using the Home, End, Tab (default behavior), Up and Down keys.
     * @param {KeyboardEvent} event The keyboard event
     * @private
     */
    handleKeyDown(event) {
        const { code } = event;
        if (event.target instanceof HTMLElement) {
            const id = event.target.dataset.id;
            const index = this.normalizedDisplayData.findIndex((product) => product.id === id);
            const callToActionButtonEnabled = this.configuration?.cardConfiguration.showCallToActionButton;
            switch (code) {
                case KEY_CODE.ARROW_DOWN:
                    if (!callToActionButtonEnabled) {
                        event.preventDefault();
                        this.focusListItem(index, +1);
                    }
                    break;
                case KEY_CODE.ARROW_UP:
                    if (!callToActionButtonEnabled) {
                        event.preventDefault();
                        this.focusListItem(index, -1);
                    }
                    break;
                case KEY_CODE.HOME:
                    event.preventDefault();
                    this.focusListItem(0, 0);
                    break;
                case KEY_CODE.END:
                    event.preventDefault();
                    this.focusListItem(0, -1);
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * Focuses a list item.
     * @param {number} baseIndex The base index position.
     * @param {number} steps The number of steps from the baseIndex position.
     * @private
     */
    focusListItem(baseIndex, steps) {
        const itemCount = this.normalizedDisplayData.length;
        let newActiveIndex = (baseIndex + steps) % itemCount;

        if (newActiveIndex < 0) {
            newActiveIndex = itemCount - 1;
        }
        Array.from(this.querySelectorAll('c-search-product-card')).at(newActiveIndex)?.focus();
    }
}
