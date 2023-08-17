/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api, wire } from 'lwc';
import { getFormFactor } from 'experience/clientApi';
import { Labels } from './labels';
/**
 * @typedef {import('../searchResults/searchResults').SearchFacet} SearchFacet
 */

/**
 * @typedef {import('../searchResults/searchResults').FiltersPanelDetail} FiltersPanelDetail
 */

/**
 * @typedef {import('../searchResults/searchResults').ProductSearchResultSummary} ProductSearchResultSummary
 */

/**
 * The search facets values check map. This is to keep track of the facets
 *  values that has been checked to create refinements for the search query.
 * @typedef {object} SearchFacetValuesCheckMap
 * @property {SearchFacet} searchFacet
 *  The search facet display-data.
 * @property {Map<string, boolean>} valuesCheckMap
 *  A map of facet-value-id with its check/uncheck state.
 */
export default class SearchFilters extends LightningElement {
    static renderMode = 'light';
    @wire(getFormFactor)
    formFactor;
    get isDesktop() {
        return this.formFactor === 'Large';
    }

    /**
     * The title for the mobile button
     * @type {string}
     * @readonly
     */
    filterHeaderLabel = Labels.filterHeader;

    /**
     * Search Results data passed down by the wrapper component
     * @type {?ProductSearchResultSummary}
     */
    @api
    searchResults;

    /**
     * Ensure Search Results data has needed property
     * @type {FiltersPanelDetail}
     * @readonly
     * @private
     */
    get normalizedSearchFilters() {
        return this.searchResults?.filtersPanel ?? {};
    }

    /**
     * Handles opening the filters modal while on mobile only
     * @param {CustomEvent} event click event
     * @fires SearchFilters#openmodal
     */
    handleOpenSearchFiltersModal(event) {
        event.preventDefault();
        this.dispatchEvent(
            new CustomEvent('openmodal', {
                bubbles: true,
                composed: true,
                cancelable: true,
            })
        );
    }
}
