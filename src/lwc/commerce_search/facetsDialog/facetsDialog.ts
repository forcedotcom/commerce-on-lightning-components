import { LightningElement, api } from 'lwc';
import generateLabels from './resultsLabelGenerator';
import { EVENT, DISPLAY_MODE } from './constants';
import buttonLabels from './labels';
import { prepareRefinementsForRequest } from 'commerce_search/facetsLib';
import type { FiltersPanelDetail } from 'commerce/searchApiInternal';
import type FiltersPanel from 'commerce_search/filtersPanel';

/**
 * Modal body for the mobile filter
 * @fires FacetsDialog#closefacetsdialog
 * @fires FacetsDialog#facetvalueupdate
 *
 */
export default class FacetsDialog extends LightningElement {
    static renderMode = 'light';
    /**
     * An event fired when closing the modal.
     *
     * Properties:
     *   - Bubbles: true
     *   - Composed: true
     *   - Cancelable: false
     *
     * @event FacetsDialog#closefacetsdialog
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
     * @event FacetsDialog#facetvalueupdate
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
     * @type {FiltersPanelDetail}
     * @private
     */
    private _displayData: FiltersPanelDetail | undefined;

    clearButtonLabel = buttonLabels.clearButton;

    cancelButtonLabel = buttonLabels.cancelButton;

    private _displayMode: string = DISPLAY_MODE.SEARCH_RESULTS;
    private _displayCount = 0;

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
     * Gets or sets the display data
     *
     * @type {FiltersPanelDetail | undefined}
     */
    @api
    get displayData(): FiltersPanelDetail | undefined {
        return this._displayData;
    }
    set displayData(value: FiltersPanelDetail | undefined) {
        this._displayData = value;
    }

    /**
     * Gets the normalized filters panel display-data.
     *
     * @type {FiltersPanelDetail}
     */
    get normalizedDisplayData(): FiltersPanelDetail {
        const displayData = this._displayData;
        return {
            facets: displayData?.facets ?? [],
            categories: displayData?.categories,
        };
    }

    /**
     * Gets the display count label for the results footer button.
     *
     * @returns{string | undefined} the generated label from count, keyword and result type.
     * @private
     */
    get displayCountLabel(): string | undefined {
        return generateLabels(this.displayCount, this.displayMode);
    }

    /**
     * Handles click on the close button
     * @fires FacetsDialog#closefacetsdialog
     */
    handleCloseDialog(): void {
        this.dispatchEvent(
            new CustomEvent(EVENT.CLOSE_FACETS_DIALOG_EVT, {
                bubbles: true,
                composed: true,
                cancelable: false,
            })
        );
    }

    /**
     * Clears all selected filters
     */
    handleClearFilters(): void {
        const filtersPanel = <(HTMLElement & FiltersPanel) | null>this.querySelector('commerce_search-filters-panel');
        filtersPanel?.clearAll();
    }

    /**
     * Handles facet value update
     * @fires FacetsDialog#facetvalueupdate
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
}
