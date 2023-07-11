/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api } from 'lwc';
import { generatePagesForRange } from './pagingControlHelper';
import { EVENT, PAGING_RANGE_SYMBOL, MAX_RESULTS_OFFSET } from './constants';
import { previous, next, resultsLimitHitText } from './labels';

/**
 * @param {*} value The value to check.
 * @param {number} min The minimum value that _`value`_ needs to have.
 * @returns {boolean} Whether the given _`value`_ is a number greater than _`min`_.
 */
function isNumber(value, min) {
    return typeof value === 'number' && !Number.isNaN(value) && value > min;
}

/**
 * An event fired when the user indicates a desire to go to the previous page.
 * @event SearchPagingControl#pageprevious
 * @type {CustomEvent}
 */

/**
 * An event fired when the user indicates a desire to go to the next page.
 * @event SearchPagingControl#pagenext
 * @type {CustomEvent}
 */

/**
 * An event fired when the user indicates a desire to go to a specific page.
 * @event SearchPagingControl#pagegoto
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {number} detail.pageNumber
 *  The specific page number the user desires to go to.
 */

/**
 * A page object to render the page item.
 * @typedef {object} PageItem
 * @property {number} id
 *  Identifier used as the key for the rendering element.
 * @property {?number} pageNumber
 *  Page number
 * @property {boolean} isCurrentPage
 *  Whether this page is the current page.
 * @property {boolean} isRange
 *  Whether this page is a range element.
 */

/**
 * A simple pagination UI control for any record visualization controls.
 * @fires SearchPagingControl#pageprevious
 * @fires SearchPagingControl#pagenext
 * @fires SearchPagingControl#pagegoto
 */
export default class SearchPagingControl extends LightningElement {
    static renderMode = 'light';

    /**
     * Current page number.
     * @type {?number}
     */
    @api
    currentPageNumber;

    /**
     * Number of items per page.
     * @type {?number}
     */
    @api
    pageSize;

    /**
     * Total number of items.
     * @type {?number}
     */
    @api
    totalItemCount;

    /**
     * The maximum quantity of numbered pages displayed to the user.
     * This includes numbers and range symbol.
     * @type {?number}
     */
    @api
    maximumPagesDisplayed;

    /**
     * Gets the required i18n labels
     * @readonly
     * @private
     */
    label = {
        previous,
        next,
        resultsLimitHitText,
    };
    get normalizedPageNumber() {
        return isNumber(this.currentPageNumber, 1) ? this.currentPageNumber : 1;
    }
    get normalizedPageSize() {
        return isNumber(this.pageSize, 1) ? this.pageSize : 1;
    }
    get normalizedItemCount() {
        return isNumber(this.totalItemCount, 0) ? this.totalItemCount : 0;
    }

    /**
     * Disable previous page navigation?
     * @type {boolean}
     * @readonly
     * @private
     */
    get disablePaginationPrevious() {
        return this.normalizedPageNumber === 1;
    }

    /**
     * Disable next page navigation?
     * @type {boolean}
     * @readonly
     * @private
     */
    get disablePaginationNext() {
        return this.normalizedPageNumber >= this.totalPages;
    }

    /**
     * only show a message if this is the last page we could possibly show while there are more results due to API limitation:
     * true if totalItemCount > 5000 + pageSize and this is the last page (aNumber to 5000+pageSize)
     * @type {boolean}
     * @readonly
     * @private
     */
    get showMessageForResultsLimit() {
        const pageSize = this.normalizedPageSize;
        return (
            this.normalizedItemCount > MAX_RESULTS_OFFSET + pageSize &&
            this.normalizedPageNumber >= Math.ceil((MAX_RESULTS_OFFSET + pageSize) / pageSize)
        );
    }

    /**
     * Gets total number of pages.
     * @type {number}
     * @readonly
     * @private
     */
    get totalPages() {
        return Math.ceil(this.normalizedItemCount / this.normalizedPageSize);
    }

    /**
     * Gets page numbers as an array of objects.
     * @type {PageItem[]}
     * @readonly
     * @private
     */
    get pageNumbers() {
        const max = isNumber(this.maximumPagesDisplayed, 0) ? this.maximumPagesDisplayed : 5;
        return generatePagesForRange(this.normalizedPageNumber, this.totalPages, max);
    }

    /**
     * Gets the symbol for range symbol.
     * @type {string}
     * @readonly
     * @private
     */
    get rangeSymbol() {
        return PAGING_RANGE_SYMBOL;
    }

    /**
     * Handler for the 'click' event from the previous button.
     * @fires SearchPagingControl#pageprevious
     */
    handlePaginationPrevious() {
        this.dispatchEvent(new CustomEvent(EVENT.PAGE_CHANGE_PREVIOUS_EVT));
    }

    /**
     * Handler for the 'click' event from the next button.
     * @fires SearchPagingControl#pagenext
     */
    handlePaginationNext() {
        this.dispatchEvent(new CustomEvent(EVENT.PAGE_CHANGE_NEXT_EVT));
    }

    /**
     * Handler for the 'click' event from the page number button.
     * @param {Event} event The event object
     * @fires SearchPagingControl#pagegoto
     */
    handlePaginationPage(event) {
        this.dispatchEvent(
            new CustomEvent(EVENT.PAGE_CHANGE_GOTOPAGE_EVT, {
                detail: {
                    pageNumber: parseInt(event.target.value, 10),
                },
            })
        );
    }
}
