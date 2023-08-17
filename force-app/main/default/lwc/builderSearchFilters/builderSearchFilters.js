/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { createSearchFiltersClearAction, createSearchFiltersUpdateAction, dispatchAction } from 'commerce/actionApi';
import SearchFiltersModal from 'c/searchFiltersModal';
import { Labels } from './labels';

const DEFAULT_SEARCH_FILTER_PAGE = 1;

/**
 * @typedef {import('../searchResults/searchResults').SearchFacet} SearchFacet
 */

/**
 * @typedef {import('../searchResults/searchResults').ProductSearchRefinement} ProductSearchRefinement
 */

/**
 * @typedef {import('../searchResults/searchResults').ProductSearchResultSummary} ProductSearchResultSummary
 */

/**
 * Component that displays the category tree and facets for search filters
 */
export default class BuilderSearchFilters extends LightningElement {
    static renderMode = 'light';

    /**
     * Retrieves the search term, categoryId and refinements
     * to pass to the modal component so that it can apply correct filter to results
     */
    @wire(CurrentPageReference)
    currentPageReference;

    /**
     * Results returned from the Search Data Provider
     * @type {?ProductSearchResultSummary}
     */
    @api
    searchResults;

    /**
     * Handles the category update event for category filtering.
     * @param {CustomEvent<{categoryId: string}>} event The event object
     */
    handleCategoryUpdateEvent(event) {
        event.stopPropagation();
        const categoryId = event.detail;

        const searchFiltersPayload = {
            page: DEFAULT_SEARCH_FILTER_PAGE, // Go back to the first page
            categoryId: categoryId,
        };

        dispatchAction(this, createSearchFiltersUpdateAction(searchFiltersPayload));
    }

    /**
     * Handles the facet updated event for filtering search results by facets.
     * @param {CustomEvent<{refinements: ProductSearchRefinement; mruFacet: SearchFacet}>} event The event object
     */
    handleFacetValueUpdateEvent(event) {
        event.stopPropagation();
        const { mruFacet, refinements } = event.detail;

        const searchFiltersPayload = {
            page: DEFAULT_SEARCH_FILTER_PAGE, // Go back to the first page
            refinements,
            mruFacet,
        };

        dispatchAction(this, createSearchFiltersUpdateAction(searchFiltersPayload));
    }

    /**
     * Handles the clear all filters event for resetting the search results.
     * @param {CustomEvent} event - the event object
     */
    handleClearAllFiltersEvent(event) {
        event.stopPropagation();
        dispatchAction(this, createSearchFiltersClearAction());
    }

    /**
     * Handles the open filters modal event on mobile.
     * Provides modal with initial display data and count information
     * @param {CustomEvent} evt - the event object
     */
    handleOpenFiltersModal(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        SearchFiltersModal.open({
            label: Labels.modalLabel,
            onfacetvalueupdate: (event) => this.handleFacetValueUpdateEvent(event),
            onclearallfilters: (event) => this.handleClearAllFiltersEvent(event),
            oncategoryupdate: (event) => this.handleCategoryUpdateEvent(event),
            displayData: this.searchResults,
            pageRef: this.currentPageReference,
        });
    }
}
