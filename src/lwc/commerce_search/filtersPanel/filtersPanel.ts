import { LightningElement, api } from 'lwc';
import labels from './labels';
//@ts-ignore
import { debounce } from 'community_runtime/utils';
import { refinementsFromFacetsMap } from './dataConverter';

import { EVENT } from './constants';
import type {
    CategoryInfoTree,
    FiltersPanelDetail,
    SearchFacet,
    SearchFacetValuesCheckMap,
} from 'commerce/searchApiInternal';

/**
 * Representation for the Filters Panel which shows the category tree and facets
 *
 * @fires FiltersPanel#facetvalueupdate
 * @fires FiltersPanel#clearallfilters
 */
export default class FiltersPanel extends LightningElement {
    static renderMode = 'light';
    /**
     * An event fired when the facet value been updated.
     *
     * @event FiltersPanel#facetvalueupdate
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
     * A logging event fired when the user indicates a desire to
     *      - Filter through facets ()
     *      - Clear the filters (no logging parameters)
     *      - refiring if any child component has loggin event
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *
     * @event FiltersPanel#searchmetricslogging
     * @type {CustomEvent}
     *
     * @property {string} detail.target
     *   The name of the component that initiated this logging.
     *
     * @property {string} detail.eventSource
     *   The logging event source. Possible values are predefined by LOGGING.EVENT_SOURCE.
     *
     *
     * Filter through facets logging parameters
     * @property {Integer} detail.logging.refinementsCount
     *   The count of selected filters
     *
     * @property {Boolean} detail.logging.recentFacetPresent
     *   Whether or not recent facets present.
     *
     * @property {Boolean} detail.logging.standardAttributeCount
     *   Count of the standard attributes in the refinements.
     *
     * @property {Boolean} detail.logging.customAttributeCount
     *   Count of the custom attributes in the refinements.
     *
     * @property {Boolean} detail.logging.productAttributeCount
     *   Count of the product attributes in the refinements.
     *
     * @export
     */

    /**
     * The category tree display-data.
     *
     * @typedef {Object} CategoryInfoTree
     *
     * @property {CategoryInfoTreeNode[]} ancestorCategories
     *  The list of categories that are ancestors to the current selected category.
     *
     * @property {CategoryInfoTreeNode} selectedCategory
     *  The category that is currently selected.
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
     * @property {CategoryInfoTreeNode[]} items
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
     * The search facets values check map. This is to keep track of the facets
     *  values that has been checked to create refinements for the search query.
     *
     * @typedef {Object} SearchFacetValuesCheckMap
     *
     * @property {SearchFacet} searchFacet
     *  The search faceet display-data.
     *
     * @property {Map<string, Boolean>} valuesCheckMap
     *  A map of facet-value-id with its check/uncheck state.
     */

    /**
     * The refinement display-data.
     *
     * @typedef {Object} Refinement
     *
     * @property {string} id
     *  The client-side generated unique identifier
     *
     * @property {string} type
     *  Type of the refinement.
     *  Supported values: "DistinctValue". "Range" value may come in later releases.
     *
     * @property {string} nameOrId
     *  Internal/developer name of the attribute to refine search on.
     *
     * @property {string} attributeType
     *  Type of the search attribute underlying the refinement.
     *  Supported values: (STANDARD, CUSTOM, PRODUCT_ATTRIBUTE or PRODUCT_CATEGORY).
     *
     * @property {string[]} values
     *  The list of facet values.
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

    /**
     * Gets or sets the filters panel display-data.
     * @type {FiltersPanelDetail}
     */
    @api
    get displayData(): FiltersPanelDetail | null | undefined {
        return this._displayData;
    }

    set displayData(value: FiltersPanelDetail | null | undefined) {
        this._displayData = value;

        const facets = (value || {}).facets;

        this._facetsMap = facets?.reduce(
            (facetAccumulator: Map<string | undefined, SearchFacetValuesCheckMap>, searchFacet: SearchFacet) => {
                return facetAccumulator.set(searchFacet.id, {
                    searchFacet,
                    // map the values of the facet
                    valuesCheckMap: new Map(
                        searchFacet.values?.map((facetValue) => [facetValue.id, facetValue.checked])
                    ),
                });
            },
            new Map()
        );
    }

    /**
     * Gets the normalized filters panel display-data.
     *
     * @type {FiltersPanelDetail}
     */
    get normalizedDisplayData(): FiltersPanelDetail {
        const displayData = this.displayData;

        return {
            facets: displayData?.facets ?? [],
            categories: displayData?.categories,
        };
    }

    /**
     * Gets the list of facets
     *
     * @type {SearchFacet[]}
     */
    get facets(): SearchFacet[] | null | undefined {
        return this.normalizedDisplayData.facets;
    }

    /**
     * Gets the categories tree
     *
     * @type {CategoryInfoTree}
     */
    get categories(): CategoryInfoTree | undefined | null {
        return this.normalizedDisplayData.categories;
    }

    /**
     * Gets the label for the filters header
     *
     * @returns {string} the label for the filters header
     * @private
     */
    private get filtersHeader(): string {
        return labels.filtersHeader;
    }

    /**
     * Gets the label for the clear all button
     *
     * @returns {string} the label for the clear all button
     * @private
     */
    private get clearAllLabel(): string {
        return labels.clearAllLabel;
    }

    /**
     * The map of all SearchFacetValuesCheckMap and all their possible facet values, regardless of selection or not.
     *
     * @type {Map<string, SearchFacetValuesCheckMap>}
     */
    private _facetsMap?: Map<string | undefined, SearchFacetValuesCheckMap> | null;

    /**
     * The most recent facet that the user has selected
     *
     * @type {SearchFacet}
     * @private
     */
    private _mruFacet = {};

    /**
     * The ID of the most recent facet that the user has selected
     *
     * @type {string}
     * @private
     */
    private _mruFacetId?: string = '';

    /**
     * The filters panel display-data.
     *
     * @type {FiltersPanelDetail}
     * @private
     */
    private _displayData?: FiltersPanelDetail | null;

    /**
     * Handler for the 'onfacetvaluetoggle' event fired from inputFacet
     *
     * @param {Object} evt the event object
     */
    handleFacetValueToggle(evt: CustomEvent): void {
        if (evt.target instanceof HTMLElement) {
            this._mruFacetId = evt.target?.dataset?.facetid;
            const facetValueId = evt.detail.id;
            const checked = evt.detail.checked;
            // update the facet map with the latest facet value toggle
            if (this._mruFacetId && this._facetsMap?.get(this._mruFacetId)) {
                this._facetsMap.get(this._mruFacetId)?.valuesCheckMap.set(facetValueId, checked);

                this._facetValueUpdated();
            }
        }
    }

    /**
     * The function called when we update the facets in the search
     *
     * @type {Function}
     * @private
     * @fires FiltersPanel#facetvalueupdate
     */
    private _facetValueUpdated = debounce(() => {
        // Store the MRU facet after debounce is done
        const mruFacetList = this.facets?.filter((facet: SearchFacet) => facet.id === this._mruFacetId);
        if (mruFacetList && mruFacetList.length === 1) {
            this._mruFacet = mruFacetList[0];
        }

        // Update the MRU facet with the new selected/unselected facet values
        const updatedMruFacet = <SearchFacet>Object.assign({}, this._mruFacet);
        updatedMruFacet.values = updatedMruFacet.values.map((item) => {
            return {
                ...item,
                checked: this._facetsMap?.get(this._mruFacetId)?.valuesCheckMap.get(item.id),
            };
        });
        this._mruFacet = updatedMruFacet;
        const refinements = refinementsFromFacetsMap(this._facetsMap);

        this.dispatchEvent(
            new CustomEvent(EVENT.FACETVALUE_UPDATE_EVT, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    mruFacet: this._mruFacet,
                    refinements,
                },
            })
        );
    }, 300);

    /**
     * Resets the facetsMap and triggers the "clearallfilters" event
     *
     * @param {Object} evt the event object
     * @fires FiltersPanel#clearallfilters
     */
    @api
    clearAll(): void {
        if (this._facetsMap) {
            this._facetsMap.clear();
            this._facetsMap = null;
        }
        this.dispatchEvent(
            new CustomEvent(EVENT.CLEAR_ALL_FILTERS_EVT, {
                bubbles: true,
                composed: true,
            })
        );
    }

    /**
     * Handler for the 'click' event fired from the Clear All button
     *
     * @param {Object} evt the event object
     */
    handleClearAll(evt: CustomEvent): void {
        evt.preventDefault();
        this.clearAll();
    }
}
