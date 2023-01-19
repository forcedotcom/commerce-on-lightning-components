/**
 * Symbol for page range
 */
export const PAGING_RANGE_SYMBOL = '...';

/**
 * The event name constants.
 */
export const EVENT = {
    /**
     * Custom event name for page change to previous
     */
    PAGE_CHANGE_PREVIOUS_EVT: 'pageprevious',

    /**
     * Custom event name for page change to next
     */
    PAGE_CHANGE_NEXT_EVT: 'pagenext',

    /**
     * Custom event name for page change to a specific page
     */
    PAGE_CHANGE_GOTOPAGE_EVT: 'pagegoto',

    /**
     * Custom event name for search metrics logging
     */
    SEARCH_METRICS_LOGGING: 'searchmetricslogging',
};

/**
 * The logging constants.
 */
export const LOGGING = {
    TARGET: {
        PAGE_GOTO: 'search-page-goto',
        PAGE_NEXT: 'search-page-next',
        PAGE_PREVIOUS: 'search-page-previous',
    },
    EVENT_SOURCE: {
        CLICK: 'synthetic-click',
    },
};

/**
 * The furthest in the search results we would start gathering results
 * Currently it's 5000
 */
export const MAX_RESULTS_OFFSET = 5000;
