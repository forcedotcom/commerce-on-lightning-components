/**
 * Result type enum based on the page type Search Result, Product Listing
 *
 * @enum {String}
 */
export const ResultType = {
    SearchResult: 'searchResults',
    ProductList: 'productList',
};

/**
 * The event name constants.
 */
export const EVENT = {
    /**
     * Custom event name for facet value update in a search
     */
    FACETVALUE_UPDATE_EVT: 'facetvalueupdate',
    /**
     * Custom event name for closing the modal
     */
    CLOSE_FACETS_MODAL_EVT: 'closefacetsmodal',
};
