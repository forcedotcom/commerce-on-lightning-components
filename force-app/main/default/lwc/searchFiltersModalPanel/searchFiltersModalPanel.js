/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api, wire, track } from 'lwc';
import { ProductSearchAdapter, ProductCategoryPathAdapter } from 'commerce/productApi';
import { generateLabels, getDisplayMode } from './resultsLabelGenerator';
import { EVENT, DEFAULT_SEARCH_PAGE } from './constants';
import buttonLabels from './labels';
import {
    normalizeFacets,
    normalizeRefinements,
    createTreeFromCategory,
    transformInputFacetLabels,
    normalizeResultsWithAncestorCategoryTree,
    getRefinementsFromPageRef,
} from './utils';
/**
 * @typedef {{[key: string]: *}} ProductSearchResultsData
 */

/**
 * @typedef {import('../searchResults/searchResults').CategoryInfoTree} CategoryInfoTree
 */

/**
 * @typedef {import('../searchResults/searchResults').CategoryInfoTreeNode} CategoryInfoTreeNode
 */

/**
 * @typedef {import('../searchResults/searchResults').SearchFacet} SearchFacet
 */

/**
 * @typedef {import('../searchResults/searchResults').DistinctFacetValue} DistinctFacetValue
 */

/**
 * @typedef {import('../searchResults/searchResults').FiltersPanelDetail} FiltersPanelDetail
 */

/**
 * @typedef {import('../searchResults/searchResults').ProductSearchRefinement} ProductSearchRefinement
 */

/**
 * An event fired when the facet value been updated.
 * @event SearchFiltersModalPanel#facetvalueupdate
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {SearchFacet} detail.mruFacet
 *  The most recent facet that the user has selected.
 * @property {ProductSearchRefinement[]} detail.refinements
 *  The selected filter id and it's values.
 */

/**
 * An event fired when clearing all filters
 * @event SearchFiltersModalPanel#clearallfilters
 * @type {CustomEvent}
 */

/**
 * An event fired when clicking on a new category
 * @event SearchFiltersModalPanel#categoryupdate
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {string} detail.categoryId
 *  The most recently selected category
 */
/**
 * Modal body for the mobile filter
 * @fires SearchFiltersModalPanel#facetvalueupdate
 * @fires SearchFiltersModalPanel#clearallfilters
 * @fires SearchFiltersModalPanel#categoryupdate
 */
export default class SearchFiltersModalPanel extends LightningElement {
    static renderMode = 'light';

    /**
     * The filters panel display-data.
     * @type {?FiltersPanelDetail}
     * @private
     */
    @track
    _displayData;
    _refinements = [];
    _displayCount = 0;
    _mruFacet;
    _categoryId = '';
    _parentCategoryId;
    _searchTerm = '';
    _categoryPath = [];
    _searchQuery = {};
    _pageRef;
    clearButtonLabel = buttonLabels.clearButton;
    cancelButtonLabel = buttonLabels.cancelButton;

    /**
     * The current page reference
     * @type {?PageReference}
     */
    @api
    get pageRef() {
        return this._pageRef;
    }
    set pageRef(value) {
        this._pageRef = value;
        this.updatePageRefDetails(value);
    }

    /**
     * The search term entered
     * @type {string}
     */
    @api
    get searchTerm() {
        return this._searchTerm;
    }
    set searchTerm(val) {
        this._searchTerm = val;
        this.updateSearchQuery();
    }

    /**
     * The current view's category
     * @type {string}
     */
    @api
    get categoryId() {
        return this._categoryId;
    }
    set categoryId(val) {
        this._categoryId = val;
        this.updateSearchQuery();
    }

    /**
     * The current filter and it's values
     * @type {?ProductSearchRefinement[]}
     */
    @api
    get refinements() {
        return this._refinements;
    }
    set refinements(val) {
        this._refinements = val;
        this.updateSearchQuery();
    }

    /**
     * Gets or sets the results display count.
     * @type {number}
     */
    @api
    get displayCount() {
        return this._displayCount;
    }
    set displayCount(count) {
        this._displayCount = count;
    }

    /**
     * Gets or sets the display data
     * @type {?FiltersPanelDetail}
     */
    @api
    get displayData() {
        return this._displayData;
    }
    set displayData(value) {
        this._displayData = value;
    }
    updateSearchQuery() {
        const searchTerm = this._searchTerm;
        const categoryId = this._categoryId;
        const refinements = this._refinements ?? [];
        const page = DEFAULT_SEARCH_PAGE - 1;
        this._searchQuery = {
            searchTerm,
            categoryId,
            refinements,
            page,
            includePrices: false,
        };
    }
    @wire(ProductSearchAdapter, {
        searchQuery: '$_searchQuery',
    })
    updateProductSearch(result) {
        if (result.data) {
            this._displayCount = result.data.productsPage?.total ?? 0;
            this._transformCategoryAndFacetData(result.data);
        }
    }
    @wire(ProductCategoryPathAdapter, {
        categoryId: '$categoryId',
    })
    wiredCategoryPath({ data }) {
        this._categoryPath = data?.path ?? [];
        this._displayData = normalizeResultsWithAncestorCategoryTree(
            this._categoryPath,
            this.displayData,
            this.categoryId
        );
    }

    /**
     * Translate category/facet API data into UI representations
     * @param {ProductSearchResultsData} res - Response returned from the ProductSearchAdapter
     */
    _transformCategoryAndFacetData(res) {
        const { categories, facets } = res;
        if (categories && facets) {
            const processedCategories = createTreeFromCategory(categories, this._pageRef, this._categoryPath);
            const processedFacets = transformInputFacetLabels(
                normalizeFacets(facets),
                normalizeRefinements(this._refinements),
                this._mruFacet
            );
            this._displayData = {
                categories: processedCategories,
                facets: processedFacets,
            };
        }
    }

    /**
     * Updates the categoryId, searchTerm and refinements based on the pageReference object
     * @param {?(SearchPageReference | CategoryPageReference)} pageRef
     */
    updatePageRefDetails(pageRef) {
        if (pageRef) {
            this._searchTerm = pageRef.state?.term ?? '';
            if (pageRef.type === 'standard__recordPage') {
                const categoryId = pageRef.attributes?.recordId ?? '';
                this._categoryId = this._parentCategoryId = categoryId;
            }
            if (pageRef.state?.category) {
                this._categoryId = pageRef.state.category;
            }
            this._refinements = getRefinementsFromPageRef(pageRef);
            this.updateSearchQuery();
        }
    }

    /**
     * Gets the normalized filters panel display-data.
     * @type {FiltersPanelDetail}
     */
    get normalizedDisplayData() {
        const displayData = this._displayData;
        return {
            facets: displayData?.facets,
            categories: displayData?.categories,
        };
    }

    /**
     * Gets the type of display we currently on, search or category
     * @type {string}
     * @private
     * @readonly
     */
    get displayMode() {
        return getDisplayMode(this._displayData);
    }

    /**
     * Gets the display count label for the filters footer button.
     * @type {?string} the generated label from count, keyword and displayMode.
     * @private
     */
    get displayCountLabel() {
        return generateLabels(this._displayCount, this.displayMode);
    }

    /**
     * Clears all selected filters
     * @param {CustomEvent} event The event object
     * @fires SearchFiltersModalPanel#clearallfilters
     */
    handleClearAllFilters(event) {
        event.preventDefault();
        event.stopPropagation();
        this._mruFacet = null;
        this._refinements = [];
        this._categoryId = this._parentCategoryId ?? '';
        this.updateSearchQuery();
        this.dispatchEvent(
            new CustomEvent(EVENT.CLEAR_ALL_FILTERS_EVT, {
                bubbles: true,
                composed: true,
            })
        );
    }

    /**
     * Handles facet value update
     * @param {CustomEvent} event The event object
     * @fires SearchFiltersModalPanel#facetvalueupdate
     */
    handleFacetValueUpdate(event) {
        event.stopPropagation();
        const { mruFacet, refinements } = event.detail;
        this._mruFacet = mruFacet;
        this._refinements = refinements;
        this.updateSearchQuery();
        this.dispatchEvent(
            new CustomEvent(EVENT.FACETVALUE_UPDATE_EVT, {
                bubbles: true,
                composed: true,
                detail: {
                    mruFacet,
                    refinements,
                },
            })
        );
    }

    /**
     * Handles category update event
     * @param {CustomEvent} event The event object
     * @fires SearchFiltersModalPanel#categoryupdate
     */
    handleCategoryUpdate(event) {
        event.stopPropagation();
        const categoryId = event.detail;
        this._categoryId = categoryId === 'ROOT_CATEGORY_ID' ? '' : categoryId;
        this.updateSearchQuery();
        this.dispatchEvent(
            new CustomEvent(EVENT.CATEGORY_UPDATE_EVT, {
                bubbles: true,
                composed: true,
                detail: categoryId,
            })
        );
    }

    /**
     * Handles click on the close button
     * @fires SearchFiltersModalPanel#closesearchfiltersmodal
     */
    handleCloseModal() {
        this.dispatchEvent(
            new CustomEvent(EVENT.CLOSE_FILTERS_MODAL_EVT, {
                bubbles: true,
                composed: true,
                cancelable: false,
            })
        );
    }
}
