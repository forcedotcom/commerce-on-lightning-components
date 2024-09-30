/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api } from 'lwc';
import { createSearchFiltersUpdateAction, dispatchAction } from 'commerce/actionApi';

/**
 * A builder pagination UI control for any record visualization controls.
 */
export default class BuilderSearchPagingControl extends LightningElement {
    static renderMode = 'light';

    /**
     * Current page number.
     */
    @api
    currentPageNumber;

    /**
     * Number of items per page.
     */
    @api
    pageSize;

    /**
     * Total number of items.
     */
    @api
    totalItemCount;

    /**
     * The maximum quantity of numbered pages displayed to the user.
     * This includes numbers and range symbol.
     */
    @api
    maximumPagesDisplayed;

    /**
     * Handles the `pageprevious` event.
     * @param {CustomEvent} event A 'pageprevious' received from a paging control
     * @private
     */
    handlePreviousPageEvent(event) {
        event.stopPropagation();
        const previousPageNumber = Number(this.currentPageNumber) - 1;
        this.dispatchUpdateCurrentPageEvent(previousPageNumber);
    }

    /**
     * Handles the `pagenext` event which
     * @param {CustomEvent} event A 'pagenext' received from a paging control
     * @private
     */
    handleNextPageEvent(event) {
        event.stopPropagation();
        const nextPageNumber = Number(this.currentPageNumber) + 1;
        this.dispatchUpdateCurrentPageEvent(nextPageNumber);
    }

    /**
     * Handles the `pagegoto` event which
     * @param {CustomEvent} event A 'pagegoto' received from a paging control
     * @private
     */
    handleGotoPageEvent(event) {
        event.stopPropagation();
        const pageNumber = event.detail.pageNumber;
        this.dispatchUpdateCurrentPageEvent(pageNumber);
    }

    /**
     * Dispatch filterChange action on search data provider.
     * @param {number} newPageNumber page number
     */
    dispatchUpdateCurrentPageEvent(newPageNumber) {
        dispatchAction(this, createSearchFiltersUpdateAction({ page: newPageNumber }));
    }
}
