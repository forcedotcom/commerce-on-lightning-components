import { LightningElement, api } from 'lwc';
import generateLabel from './resultsLabelGenerator';
import { EVENT, ResultType } from './constants';
import { prepareRefinementsForRequest } from 'commerce_search/facetsLib';
import type FiltersPanel from 'commerce_search/filtersPanel';
import type { FiltersPanelDetail, CategoryInfoTree, SearchFacet } from 'commerce/searchApiInternal';

/**
 * Modal body for the Filters Panel component and Results footer button
 * @fires FacetsModal#closefacetsmodal
 * @fires FacetsModal#facetvalueupdate
 *
 */
export default class FacetsModal extends LightningElement {
    static renderMode = 'light';
    /**
     * An event fired when closing the modal.
     *
     * Properties:
     *   - Bubbles: true
     *   - Composed: true
     *   - Cancelable: false
     *
     * @event FacetsModal#closefacetsmodal
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * An event fired when the facet value been updated.
     *
     * Properties:
     *   - Bubbles: true
     *   - Composed: true
     *   - Cancelable: false
     *
     * @event FacetsModal#facetvalueupdate
     * @type {CustomEvent}
     *
     * @property {SearchFacet} detail.mruFacet
     *   The most recent facet that the user has selected.
     *
     * @property {Refinement[]} detail.refinements
     *   The selected filter id and it's values.
     *
     * @export
     */

    /**
     * UI Representation for the category tree
     *
     * @typedef {Object} CategoryInfoTree
     *
     * @property {CategoryInfoTreeNode[]} ancestorCategories
     *  The list of categories that are ancestors to the current selected category
     *
     * @property {CategoryInfoTreeNode} selectedCategory
     *   The category that is currently selected
     */

    /**
     * Tree node representation for a single category and its sub-categories.
     *
     * @typedef {Object} CategoryInfoTreeNode
     *
     * @property {string} id
     *  The id of the tree node
     *
     * @property {string} label
     *   The label of the tree node.
     *
     * @property {List<CategoryInfoTreeNode>} items
     *   The child nodes of the tree node
     */

    /**
     * The search facet display-data.
     *
     * @typedef {Object} SearchFacet
     *
     * @property {string} id
     *  The client-side generated unique identifier
     *
     * @property {string} facetType
     *  Type of the facet (so far we have DISTINCT_VALUE).
     *
     * @property {string} nameOrId
     *  ID or internal name of the facet.
     *
     * @property {string} attributeType
     *  Type of the search attribute underlying the facet
     *  (STANDARD, CUSTOM, PRODUCT_ATTRIBUTE or PRODUCT_CATEGORY).
     *
     * @property {string} displayName
     *  Display name of the facet.
     *
     * @property {string} displayType
     *  Display name of the facet. (SINGLE_SELECT, MULTI_SELECT, CATEGORY_TREE or
     *  DATE_PICKER)
     *
     * @property {Number} displayRank
     *  Display rank for the facet.
     *
     * @property {DistinctFacetValue[]} values
     *  The values of the facet
     */

    /**
     * The facet display-data for checkbox.
     *
     * @typedef {Object} DistinctFacetValue
     *
     * @property {string} id
     *  ID or internal name of the facet value.
     *
     * @property {string} name
     *  Display Name of the facet value with product count.
     *
     * @property {Boolean} checked
     *  Whether or not the value is selected.
     *
     * @property {Boolean} focusOnInit
     *  Whether or not to show the focus when initially displayed.
     *
     * @property {Number} productCount
     *  Number of products in search results under this category
     */

    /**
     * The filters panel display-data.
     *
     * @typedef {Object} FiltersPanelDetail
     *
     * @property {CategoryInfoTree} categories
     *  The category tree display-data.
     *
     * @property {SearchFacet[]} facets
     *  The search facet display-data.
     */

    private _displayMode: string = ResultType.SearchResult;
    private _displayCount = 0;
    private _facets: SearchFacet[] = [];

    /**
     * The category tree
     *
     * @param {CategoryInfoTree}
     *
     */
    @api
    category?: CategoryInfoTree | null;

    /**
     * Gets or sets a list of facets.
     *
     * @type {SearchFacet[]}
     */
    @api
    get facets(): SearchFacet[] {
        return this._facets;
    }
    set facets(facets: SearchFacet[]) {
        this._facets = facets;
    }

    /**
     * Gets or sets the result type.
     *
     * @type {string}
     */
    @api
    get displayMode(): string {
        return this._displayMode;
    }

    set displayMode(mode: string) {
        this._displayMode = mode;
    }

    /**
     * Gets or sets the results display count.
     *
     * @type {number}
     */
    @api
    get displayCount(): number {
        return this._displayCount;
    }

    set displayCount(count: number) {
        this._displayCount = count;
    }

    /**
     * Gets the filters panel display-data.
     *
     * @type {FiltersPanelDetail}
     */
    get filterPanelDisplayData(): FiltersPanelDetail {
        return {
            facets: this.facets,
            categories: this.category ?? undefined,
        };
    }

    /**
     * Gets the display count label for the results footer button.
     *
     * @returns {string} the generated label from count, keyword and result type.
     * @private
     */
    get displayCountLabel(): string | undefined {
        return generateLabel(this.displayCount, this.displayMode);
    }

    /**
     * Handler for the 'click' event fired from facetsModal
     * @fires FacetsModal#closefacetsmodal
     */
    handleCloseModal(): void {
        this.dispatchEvent(
            new CustomEvent(EVENT.CLOSE_FACETS_MODAL_EVT, {
                bubbles: true,
                composed: true,
                cancelable: false,
            })
        );
    }

    /**
     * Handler for the 'facetvalueupdate' event fired from filtersPanel
     * TODO: Once the facetModal is initated from ResultsTiles (LWC component),
     *  these handlers has to be merged with ResultsTiles.
     *  Trust story: W-7866234
     * @param {Object} evt the event object
     */
    handleFacetValueUpdate(evt: CustomEvent): void {
        evt.stopPropagation();

        const { mruFacet, refinements } = evt.detail;

        this.dispatchEvent(
            new CustomEvent(EVENT.FACETVALUE_UPDATE_EVT, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    refinements: prepareRefinementsForRequest(refinements),
                    mruFacet: { ...mruFacet },
                },
            })
        );
    }

    /**
     * Clears all selected filters
     */
    @api
    clearFilters(): void {
        const filtersPanel = <(HTMLElement & FiltersPanel) | null>this.querySelector('commerce_search-filters-panel');
        filtersPanel?.clearAll();
    }
}
