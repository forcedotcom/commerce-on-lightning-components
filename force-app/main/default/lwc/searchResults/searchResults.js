/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';
import { generateStyleProperties, generateThemeTextSizeProperty } from 'experience/styling';
import { computeConfiguration, transformDataWithConfiguration } from './searchResultsUtils';
import { EVENT, DEFAULTS } from './constants';
/**
 * Gets the associated dxp CSS font size property for the given text size.
 * @param {string} textSize
 *  The size of heading to be reflected by the returned CSS class.
 *  Valid values are: "small", "medium", and "large"
 * @returns {string}
 *  The dxp CSS property matching the requested size, if one exists; 'initial' otherwise.
 */
function dxpTextSize(textSize) {
    const themeSize = generateThemeTextSizeProperty(`heading-${textSize}`);
    return themeSize ? `var(${themeSize}-font-size)` : 'initial';
}

/**
 * @typedef {import('../searchProductCard/searchProductCard').FieldValueData} FieldValueData
 */

/**
 * @typedef {import('../searchProductCard/searchProductCard').FieldValueDetailData} FieldValueDetailData
 */

/**
 * @typedef {import('../searchProductCard/searchProductCard').ProductSearchMediaData} ProductSearchMediaData
 */

/**
 * @typedef {import('../searchProductCard/searchProductCard').PurchaseQuantityRuleData} PurchaseQuantityRuleData
 */

/**
 * @typedef {import('../searchProductCard/searchProductCard').ProductSearchPricesData} ProductSearchPricesData
 */

/**
 * @typedef {import('../searchProductCard/searchProductCard').ProductAttributeSetSummary} ProductAttributeSetSummary
 */

/**
 * @typedef {import('../searchProductCard/searchProductCard').ProductSellingModelInformationData} ProductSellingModelInformationData
 */

/**
 * @typedef {import('../searchProductGrid/searchProductGrid').ProductGridConfiguration} ProductGridConfiguration
 */

/**
 * @typedef {object} ProductSearchResultSummary
 * @property {FiltersPanelDetail} filtersPanel
 *  The UI representation of the filters panel.
 * @property {ProductCardDetail[]} cardCollection
 *  The UI representation of a product card's details.
 * @property {?string} locale
 *  The locale of the search results.
 * @property {number} pageSize
 *  The current page size of the search results.
 * @property {number} total
 *  The total number of search results.
 * @property {?string} categoryName
 *  The product category name, if this is not an actual search
 *  result, but a category listing.
 * @property {?string} description
 *  A search result description for UI display purposes.
 */

/**
 * @typedef {object} FiltersPanelDetail
 * @property {?CategoryInfoTree} categories
 *  The UI representation of the category tree.
 * @property {?SearchFacet[]} facets
 *  The search facet display-data.
 */

/**
 * UI Representation for the category tree
 * @typedef {object} CategoryInfoTree
 * @property {?CategoryInfoTreeAncestorNode[]} ancestorCategories
 *  The list of categories that are ancestors to the current selected category
 * @property {?CategoryInfoTreeNode} selectedCategory
 *   The category that is currently selected
 */

/**
 * Tree node representation for a single category and its sub-categories.
 * @typedef {object} CategoryInfoTreeNode
 * @property {?string} id
 *  The id of the tree node
 * @property {?string} label
 *  The label of the tree node.
 * @property {?string} categoryName
 *  The category name of the tree node.
 * @property {?Array<CategoryInfoTreeNode>} items
 *  The child nodes of the tree node
 */

/**
 * @typedef {object} CategoryInfoTreeAncestorNode
 * @property {?string} id
 *  The id of the tree node
 * @property {?string} label
 *   The label of the tree node.
 * @property {?string} categoryName
 *   The category name of the tree node.
 * @property {?string} backActionAssistiveText
 *   The assistive text of the tree node's back action.
 */

/**
 * The search facet display-data.
 * @typedef {object} SearchFacet
 * @property {?string} id
 *  The client-side generated unique identifier
 * @property {?string} facetType
 *  Type of the facet (so far we have DISTINCT_VALUE).
 * @property {?string} nameOrId
 *  ID or internal name of the facet.
 * @property {?string} attributeType
 *  Type of the search attribute underlying the facet
 *  (STANDARD, CUSTOM, PRODUCT_ATTRIBUTE or PRODUCT_CATEGORY).
 * @property {?string} displayName
 *  Display name of the facet.
 * @property {?string} displayType
 *  Display name of the facet. (SINGLE_SELECT, MULTI_SELECT, CATEGORY_TREE or
 *  DATE_PICKER)
 * @property {?number} displayRank
 *  Display rank for the facet.
 * @property {DistinctFacetValue[]} values
 *  The values of the facet
 */

/**
 * The facet display-data for checkbox.
 * @typedef {object} DistinctFacetValue
 * @property {string} id
 *  ID or internal name of the facet value.
 * @property {string} name
 *  Display Name of the facet value with product count.
 * @property {boolean} checked
 *  Whether the value is selected.
 * @property {boolean} focusOnInit
 *  Whether to show the focus when initially displayed.
 * @property {number} productCount
 *  Number of products in search results under this category
 */

/**
 * The product card display-data.
 * @typedef {object} ProductCardDetail
 * @property {?string} id
 *  ID or internal name of the product card item.
 * @property {?string} name
 *  Name of the product card item.
 * @property {({[key: string]: FieldValueData} | Array<FieldValueDetailData>)} fields
 *  The fields belonging to the product card item.
 * @property {ProductSearchMediaData} image
 *  The image display-data.
 * @property {ProductSearchPricesData} prices
 *  The prices display-data.
 * @property {?string} productClass
 *  Type of the product, Variation, VariationParent, or Simple.
 * @property {?PurchaseQuantityRuleData} purchaseQuantityRule
 *  Represents a rule that restricts the quantity of a product that may be purchased.
 * @property {?ProductAttributeSetSummary} variationAttributeSet
 *  A product variation attribute set
 * @property {?ProductSellingModelInformationData} productSellingModelInformation
 *  A product's selling model information.
 * @property {?string} urlName
 *  The product's URL name.
 */

/**
 * @typedef {object} CardContentMappingItem
 * @property {string} name
 *  The product name property to card name property mapping.
 * @property {string} label
 *  The product label to card label property mapping.
 * @property {boolean} showLabel
 *  Whether to display the label property.
 * @property {?('small' | 'medium' | 'large')} fontSize
 *  The card's font size configuration.
 * @property {?string} fontColor
 *  The card's font color configuration.
 */

/**
 * @typedef {object} ResultsConfiguration
 * @property {ProductGridConfiguration} layoutConfiguration
 *  The product grid layout configuration.
 */

/**
 * @typedef {object} BuilderLayoutConfiguration
 * @property {?string} layout
 *  The layout for the card collection.
 *  Supported (case-sensitive) values are:
 *  - "grid"
 *      The products will be displayed in grid column layout.
 *      The property gridMaxColumnsDisplayed defines the max no. of columns.
 *  - "list"
 *      The products will be displayed as a list.
 * @property {?number} gridMaxColumnsDisplayed
 *  The maximum columns to be displayed in the grid.
 * @property {?boolean} addToCartDisabled
 *  Whether the "Add to Cart" action should be disabled.
 * @property {?BuilderCardConfiguration} builderCardConfiguration
 *  The card layout configuration.
 */

/**
 * @typedef {{[key: string]: *}} BuilderCardConfiguration
 */

/**
 * An event fired when the add to cart button is clicked.
 * @event SearchResults#addproducttocart
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {string} detail.productId
 *  The unique identifier of the product to be added to the cart.
 * @property {number} detail.quantity
 *  The quantity of the product to be added to the cart.
 */

/**
 * An event fired when the user indicates a desire to view the details of a product.
 * @event SearchResults#showproduct
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {string} detail.productId
 *  The unique identifier of the product.
 * @property {string} detail.productName
 *  The name of the product.
 */

/**
 * An event fired when the user indicates a desire change page.
 * @event SearchResults#updatecurrentpage
 * @type {CustomEvent}
 * @param {number} pageNumber
 *  The page to go to.
 */

/**
 * Presentational component for the search results.
 * @fires SearchResults#addproductotcart
 * @fires SearchResults#showproduct
 * @fires SearchResults#updatecurrentpage
 */
export default class SearchResults extends LightningElement {
    static renderMode = 'light';

    /**
     * Defaults to `'1'`
     * @type {string}
     * @private
     */
    _currentPage = '1';

    /**
     * Defaults to `1`
     * @type {number}
     * @private
     */
    _currentPageNumber = 1;

    /**
     * Results passed from the parent searchResults cmp
     * Transforms the data according to the card configuration.
     * @type {?ProductSearchResultSummary}
     */
    @api
    searchResults;

    /**
     * The layout of the results tiles.
     * @type {?('grid' | 'list')}
     */
    @api
    resultsLayout;

    /**
     * The size of the spacing between the grid columns.
     * @type {?('small' | 'medium' | 'large'| 'none')}
     */
    @api
    gridColumnSpacing;

    /**
     * The size of the spacing between the grid rows.
     * @type {?('small' | 'medium' | 'large'| 'none')}
     */
    @api
    gridRowSpacing;

    /**
     * The maximum number of grid columns to be displayed.
     * Accepted values are between 1 and 8.
     * @type {?number}
     */
    @api
    gridMaxColumnsDisplayed;

    /**
     * The size of the spacing between the list rows.
     * @type {?('small' | 'medium' | 'large'| 'none')}
     */
    @api
    listRowSpacing;

    /**
     * Whether to display the product image.
     * @type {boolean}
     * @default false
     */
    @api
    showProductImage = false;

    /**
     * Whether to display the negotiated price.
     * @type {boolean}
     * @default false
     */
    @api
    showNegotiatedPrice = false;

    /**
     * The font size of the page title field.
     * @type {?('small' | 'medium' | 'large')}
     */
    @api
    negotiatedPriceTextSize;

    /**
     * Font color for the negotiated price text field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     */
    @api
    negotiatedPriceTextColor;

    /**
     * Whether to display the original price.
     * @type {boolean}
     * @default false
     */
    @api
    showOriginalPrice = false;

    /**
     * The font size of the page title field.
     * @type {?('small' | 'medium' | 'large')}
     */
    @api
    originalPriceTextSize;

    /**
     * Font color for the original price text field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     */
    @api
    originalPriceTextColor;

    /**
     * Whether to display the action button.
     * @type {boolean}
     * @default false
     */
    @api
    showCallToActionButton = false;

    /**
     * The text for the add to cart button
     * @type {?string}
     */
    @api
    addToCartButtonText;

    /**
     * The button style for add to cart button
     * @type {?('primary' | 'secondary' | 'tertiary')}
     */
    @api
    addToCartButtonStyle;

    /**
     * The text for the add to cart button when cart is processing
     * @type {?string}
     */
    @api
    addToCartButtonProcessingText;

    /**
     * The text for the view options button
     * @type {?string}
     */
    @api
    viewOptionsButtonText;

    /**
     * The product fields to display in the product card component.
     * @type {?CardContentMappingItem}
     */
    @api
    cardContentMapping;

    /**
     * Font color for the card background field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     */
    @api
    cardBackgroundColor;

    /**
     * The alignment of the results cards.
     * @type {?('right' | 'center' | 'left')}
     */
    @api
    cardAlignment;

    /**
     * Font color for the card border field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     */
    @api
    cardBorderColor;

    /**
     * The value of the border radius for the results card.
     * @type {?string}
     */
    @api
    cardBorderRadius;

    /**
     * Font color for the card divider field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     */
    @api
    cardDividerColor;

    /**
     * The current page number of the results.
     * @type {?string}
     */
    @api
    set currentPage(newCurrentPage) {
        this._currentPage = newCurrentPage;
        const newPageAsNumber = parseInt(newCurrentPage, 10);
        if (!Number.isNaN(newPageAsNumber)) {
            this._currentPageNumber = newPageAsNumber;
        }
    }
    get currentPage() {
        return this._currentPage;
    }

    /**
     * @type {('small' | 'medium' | 'large'| 'none')}
     * @private
     * @readonly
     * @default
     */
    get _gridColumnSpacing() {
        return this.gridColumnSpacing ?? DEFAULTS.gridColumnSpacing;
    }

    /**
     * @type {('small' | 'medium' | 'large'| 'none')}
     * @readonly
     * @private
     * @default
     */
    get _gridRowSpacing() {
        return this.gridRowSpacing ?? DEFAULTS.gridRowSpacing;
    }

    /**
     * @type {number}
     * @readonly
     * @private
     * @default
     */
    get _gridMaxColumnsDisplayed() {
        return this.gridMaxColumnsDisplayed ?? DEFAULTS.gridMaxColumnsDisplayed;
    }

    /**
     * @type {('small' | 'medium' | 'large'| 'none')}
     * @readonly
     * @private
     * @default
     */
    get _listRowSpacing() {
        return this.listRowSpacing ?? DEFAULTS.listRowSpacing;
    }

    /**
     * @type {('small' | 'medium' | 'large')}
     * @private
     * @readonly
     * @default
     */
    get _negotiatedPriceTextSize() {
        return this.negotiatedPriceTextSize ?? DEFAULTS.negotiatedPriceTextSize;
    }

    /**
     * @type {string}
     * @private
     * @readonly
     * @default
     */
    get _negotiatedPriceTextColor() {
        return this.negotiatedPriceTextColor ?? DEFAULTS.negotiatedPriceTextColor;
    }

    /**
     * @type {('small' | 'medium' | 'large')}
     * @private
     * @readonly
     * @default
     */
    get _originalPriceTextSize() {
        return this.originalPriceTextSize ?? DEFAULTS.originalPriceTextSize;
    }

    /**
     * @type {string}
     * @private
     * @readonly
     * @default
     */
    get _originalPriceTextColor() {
        return this.originalPriceTextColor ?? DEFAULTS.originalPriceTextColor;
    }

    /**
     * If an empty array - don't show any fields.
     * @type {CardContentMappingItem[]}
     * @private
     * @readonly
     * @default
     */
    get _cardContentMapping() {
        return Array.isArray(this.cardContentMapping) ? this.cardContentMapping : [];
    }

    /**
     * @type {string}
     * @private
     * @readonly
     * @default
     */
    get _cardBackgroundColor() {
        return this.cardBackgroundColor ?? DEFAULTS.cardBackgroundColor;
    }

    /**
     * @type {'right' | 'center' | 'left'}
     * @private
     * @readonly
     * @default
     */
    get _cardAlignment() {
        return this.cardAlignment ?? DEFAULTS.cardAlignment;
    }

    /**
     * @type {string}
     * @private
     * @readonly
     * @default
     */
    get _cardBorderColor() {
        return this.cardBorderColor ?? DEFAULTS.cardBorderColor;
    }

    /**
     * The value of the border radius for the results card.
     * @type {string}
     * @private
     * @readonly
     * @default
     */
    get _cardBorderRadius() {
        return this.cardBorderRadius ?? DEFAULTS.cardBorderRadius;
    }
    get _cardDividerColor() {
        return this.cardDividerColor ?? DEFAULTS.cardDividerColor;
    }

    /**
     * Normalized search results
     * @type {ProductSearchResultSummary}
     * @readonly
     * @private
     */
    get normalizedSearchResults() {
        return transformDataWithConfiguration(this.searchResults, this.cardConfiguration);
    }

    /**
     * @type {('grid' | 'list')}
     * @private
     * @readonly
     * @default
     */
    get _resultsLayout() {
        return this.resultsLayout ?? DEFAULTS.resultsLayout;
    }

    /**
     * Object containing the configuration settings for the card layout
     * @type {BuilderCardConfiguration}
     * @readonly
     * @private
     */
    get cardConfiguration() {
        return {
            showProductImage: this.showProductImage,
            showNegotiatedPrice: this.showNegotiatedPrice,
            showOriginalPrice: this.showOriginalPrice,
            showCallToActionButton: this.showCallToActionButton,
            addToCartButtonText: this.addToCartButtonText,
            addToCartButtonProcessingText: this.addToCartButtonProcessingText,
            viewOptionsButtonText: this.viewOptionsButtonText,
            cardContentMapping: this._cardContentMapping,
        };
    }

    /**
     * Gets the computed results configuration.
     * @type {ResultsConfiguration}
     * @readonly
     * @private
     */
    get resultsConfiguration() {
        return computeConfiguration({
            layout: this._resultsLayout,
            gridMaxColumnsDisplayed: this._gridMaxColumnsDisplayed,
            builderCardConfiguration: this.cardConfiguration,
            addToCartDisabled: false,
        });
    }

    /**
     * Sets the custom CSS properties for components in the subtree.
     * @type {string}
     * @readonly
     * @private
     */
    get customCssProperties() {
        const isGridLayout = this._resultsLayout === 'grid';
        return generateStyleProperties({
            '--ref-c-search-product-grid-spacing-row': isGridLayout ? this._gridRowSpacing : this._listRowSpacing,
            ...(isGridLayout
                ? {
                      '--ref-c-search-product-grid-spacing-column': this._gridColumnSpacing,
                  }
                : {}),
            ...(isGridLayout
                ? {}
                : {
                      '--ref-c-search-product-grid-list-color-border': this._cardDividerColor,
                  }),
            '--ref-c-search-product-card-button-variant': this.addToCartButtonStyle || 'primary',
            '--ref-c-search-product-card-container-color-background': this._cardBackgroundColor,
            '--ref-c-search-product-card-container-color-border': this._cardBorderColor,
            '--ref-c-search-product-card-container-radius-border': this._cardBorderRadius,
            ...(isGridLayout
                ? {
                      '--ref-c-search-product-card-content-align-self': this._cardAlignment,
                  }
                : {}),
            ...(isGridLayout
                ? {
                      '--ref-c-search-product-card-content-justify-self': this._cardAlignment,
                  }
                : {}),
            '--ref-c-product-pricing-negotiated-price-label-color': this._negotiatedPriceTextColor,
            '--ref-c-product-pricing-negotiated-price-label-size': dxpTextSize(this._negotiatedPriceTextSize),
            '--ref-c-product-pricing-original-price-label-color': this._originalPriceTextColor,
            '--ref-c-product-pricing-original-price-label-size': dxpTextSize(this._originalPriceTextSize),
        });
    }

    /**
     * The size of the page as per the results, otherwise default to 20.
     * @type {number}
     * @readonly
     * @private
     * @default
     */
    get pageSize() {
        return this.searchResults?.pageSize ?? 20;
    }

    /**
     * The total count of product items.
     * @type {number}
     * @readonly
     * @private
     * @default
     */
    get totalItemCount() {
        return this.searchResults?.total ?? 0;
    }

    /**
     * Checks if this paging control is valid to show
     * @type {boolean}
     * @readonly
     * @private
     */
    get showPagingControl() {
        const totalPages = Math.ceil(this.totalItemCount / this.pageSize);
        return totalPages > 1;
    }

    /**
     * Handles the `addproducttocart` event which adds the product to the cart.
     * @param {CustomEvent} event An 'addproducttocart' received from a product grid
     * @private
     * @fires SearchResults#addproducttocart
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
     * @param {CustomEvent} event A 'showproduct' received from a product grid
     * @private
     * @fires SearchResults#showproduct
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
     * Handles the `pageprevious` event.
     * @param {CustomEvent} event A 'pageprevious' received from a paging control
     * @private
     * @fires SearchResults#updatecurrentpage
     */
    handlePreviousPageEvent(event) {
        event.stopPropagation();
        const previousPageNumber = this._currentPageNumber - 1;
        this.dispatchUpdateCurrentPageEvent(previousPageNumber);
    }

    /**
     * Handles the `pagenext` event which
     * @param {CustomEvent} event A 'pagenext' received from a paging control
     * @private
     * @fires SearchResults#updatecurrentpage
     */
    handleNextPageEvent(event) {
        event.stopPropagation();
        const nextPageNumber = this._currentPageNumber + 1;
        this.dispatchUpdateCurrentPageEvent(nextPageNumber);
    }

    /**
     * Handles the `pagegoto` event which
     * @param {CustomEvent} event A 'pagegoto' received from a paging control
     * @private
     * @fires SearchResults#updatecurrentpage
     */
    handleGotoPageEvent(event) {
        event.stopPropagation();
        const pageNumber = event.detail.pageNumber;
        this.dispatchUpdateCurrentPageEvent(pageNumber);
    }
    dispatchUpdateCurrentPageEvent(newPageNumber) {
        this.dispatchEvent(
            new CustomEvent(EVENT.UPDATE_CURRENT_PAGE_EVT, {
                detail: {
                    newPageNumber,
                },
            })
        );
    }
}
