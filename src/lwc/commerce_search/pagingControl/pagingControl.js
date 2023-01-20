import { LightningElement, api } from 'lwc';
import * as helper from './pagingControlHelper';
import { EVENT, PAGING_RANGE_SYMBOL, LOGGING, MAX_RESULTS_OFFSET } from './constants';

import previous from '@salesforce/label/B2B_Search_Results_Tiles.previous';
import next from '@salesforce/label/B2B_Search_Results_Tiles.next';
import resultsLimitHitText from '@salesforce/label/B2B_Search_Results_Tiles.resultsLimitHitText';

/**
 * A simple pagination UI control for any record visualization controls.
 *
 * @fires PagingControl#pageprevious
 * @fires PagingControl#pagenext
 * @fires PagingControl#pagegoto
 * @fires PagingControl#searchmetricslogging
 */
export default class PagingControl extends LightningElement {
    /**
     * An event fired when the user indicates a desire to go to the previous page.
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *
     * @event PagingControl#pageprevious
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * An event fired when the user indicates a desire to go to the next page.
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *
     * @event PagingControl#pagenext
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * An event fired when the user indicates a desire to go to a spcific page.
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *
     * @event PagingControl#pagegoto
     * @type {CustomEvent}
     *
     * @property {Integer} detail.pageNumber
     *   The specific page number the user desired to go.
     *
     * @export
     */

    /**
     * A logging event fired when the user indicates a desire to go to
     *      - Previous page
     *      - Next page
     *      - A specific page
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *
     * @event FiltersPanel#searchmetricslogging
     * @type {CustomEvent}
     *
     * @property {String} detail.target
     *   The name of the component that initiated this logging.
     *
     * @property {String} detail.eventSource
     *   The logging event source. Possible values are predefined by LOGGING.EVENT_SOURCE.
     *
     * @property {Integer} detail.logging.pageNumber
     *   The specific page number the user desired to go.
     *
     * @export
     */

    /**
     * A page object to render the page item.
     *
     * @typedef {Object} PageItem
     *
     * @property {Number} id
     * Id used as the key for the rendering element.
     *
     * @property {Number} pageNumber
     * Page number
     *
     * @property {Boolean} isCurrentPage
     * Is this current page?
     *
     * @property {Boolean} isRange
     * Is this a range element?
     */

    /**
     * Current page number.
     *
     * @type {Number}
     * @required
     */
    @api
    currentPageNumber = 1;

    /**
     * Number of items per page. Set default to 1.
     *
     * @type {Number}
     * @required
     */
    @api
    pageSize = 1;

    /**
     * Total number of items.
     *
     * @type {Number}
     * @required
     */
    @api
    totalItemCount = 0;

    /**
     * The maximum quantity of numbered pages displayed to the user.
     * This includes numbers and range symbol.
     *
     * @type {Number}
     * @required
     */
    @api
    maximumPagesDisplayed = 5;

    /**
     * Handler for the 'click' event from the previous button.
     *
     * @fires PagingControl#pageprevious
     * @fires PagingControl#searchmetricslogging
     */
    firePreviousPageEvent() {
        this.dispatchEvent(
            new CustomEvent(EVENT.PAGE_CHANGE_PREVIOUS_EVT, {
                bubbles: false,
                composed: false,
            })
        );

        this.dispatchEvent(
            new CustomEvent(EVENT.SEARCH_METRICS_LOGGING, {
                bubbles: false,
                composed: false,
                detail: {
                    target: LOGGING.TARGET.PAGE_PREVIOUS,
                    eventSource: LOGGING.EVENT_SOURCE.CLICK,
                    logging: {
                        pageNumber: this.currentPageNumber - 1,
                    },
                },
            })
        );
    }

    /**
     * Handler for the 'click' event from the next button.
     *
     * @fires PagingControl#pagenext
     * @fires PagingControl#searchmetricslogging
     */
    fireNextPageEvent() {
        this.dispatchEvent(
            new CustomEvent(EVENT.PAGE_CHANGE_NEXT_EVT, {
                bubbles: false,
                composed: false,
            })
        );

        this.dispatchEvent(
            new CustomEvent(EVENT.SEARCH_METRICS_LOGGING, {
                bubbles: false,
                composed: false,
                detail: {
                    target: LOGGING.TARGET.PAGE_NEXT,
                    eventSource: LOGGING.EVENT_SOURCE.CLICK,
                    logging: {
                        pageNumber: this.currentPageNumber + 1,
                    },
                },
            })
        );
    }

    /**
     * Handler for the 'click' event from the page number button.
     *
     * @fires PagingControl#pagegoto
     * @fires PagingControl#searchmetricslogging
     */
    fireGotoPageEvent(evt) {
        const pageNumber = parseInt(evt.target.value, 10);

        this.dispatchEvent(
            new CustomEvent(EVENT.PAGE_CHANGE_GOTOPAGE_EVT, {
                bubbles: false,
                composed: false,
                detail: {
                    pageNumber,
                },
            })
        );

        this.dispatchEvent(
            new CustomEvent(EVENT.SEARCH_METRICS_LOGGING, {
                bubbles: false,
                composed: false,
                detail: {
                    target: LOGGING.TARGET.PAGE_GOTO,
                    eventSource: LOGGING.EVENT_SOURCE.CLICK,
                    logging: {
                        pageNumber,
                    },
                },
            })
        );
    }

    /**
     * Getter - disable previous page navigation?
     *
     * @type {Boolean}
     * @readonly
     */
    get disablePreviousPageNavigation() {
        return this.currentPageNumber === 1;
    }

    /**
     * Getter - disable next page navigation?
     *
     * @type {Boolean}
     * @readonly
     */
    get disableNextPageNavigation() {
        return this.currentPageNumber >= this.totalPages;
    }

    /**
     * only show a message if this is the last page we could possibly show while there are more results due to API limitation:
     * true if totalItemCount > 5000 + pageSize and this is the last page (aNumber to 5000+pageSize)
     *
     * @type {Boolean}
     * @readonly
     */
    get showMessageForResultsLimit() {
        return (
            this.totalItemCount > MAX_RESULTS_OFFSET + this.pageSize &&
            this.currentPageNumber === Math.ceil((MAX_RESULTS_OFFSET + this.pageSize) / this.pageSize)
        );
    }

    /**
     * Gets total number of pages.
     *
     * @type {Number}
     * @readonly
     */
    get totalPages() {
        return Math.ceil(this.totalItemCount / this.pageSize);
    }

    /**
     * Gets page numbers as an array of objects.
     *
     * @type {Array}
     * @readonly
     */
    get pageNumbers() {
        return helper.generatePagesForRange(this.currentPageNumber, this.totalPages, this.maximumPagesDisplayed);
    }

    /**
     * Gets the symbol for range symbol.
     *
     * @type {String}
     * @readonly
     */
    get rangeSymbol() {
        return PAGING_RANGE_SYMBOL;
    }

    /**
     * Gets the required i18n labels
     * @private
     */
    get label() {
        return {
            previous,
            next,
            resultsLimitHitText,
        };
    }
}
