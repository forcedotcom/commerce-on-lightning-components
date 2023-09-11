/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api } from 'lwc';
import labels from './labels';
import { debounce } from 'experience/utils';
import { refinementsFromFacetsMap } from './dataConverter';
import { EVENT } from './constants';
/**
 * @typedef {import('../searchResults/searchResults').SearchFacet} SearchFacet
 */

/**
 * @typedef {import('../searchResults/searchResults').FiltersPanelDetail} FiltersPanelDetail
 */

/**
 * @typedef {import('../searchResults/searchResults').CategoryInfoTree} CategoryInfoTree
 */

/**
 * @typedef {import('../searchFilters/searchFilters').ProductSearchRefinement} ProductSearchRefinement
 */

/**
 * @typedef {import('../searchFilters/searchFilters').SearchFacetValuesCheckMap} SearchFacetValuesCheckMap
 */

/**
 * An event fired when the facet value been updated.
 * @event SearchFiltersPanel#facetvalueupdate
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {SearchFacet} detail.mruFacet
 *   The most recent facet that the user has selected.
 * @property {ProductSearchRefinement[]} detail.refinements
 *   The selected filter id and it's values.
 */

/**
 * An event fired to clear all filters
 * @event SearchFiltersPanel#clearallfilters
 * @type {CustomEvent}
 */
/**
 * Representation for the Filters Panel which shows the category tree and facets
 * @fires SearchFiltersPanel#facetvalueupdate
 * @fires SearchFiltersPanel#clearallfilters
 */
export default class SearchFiltersPanel extends LightningElement {
    static renderMode = 'light';

    /**
     * Gets or sets the filters panel display-data.
     * @type {?FiltersPanelDetail}
     */
    @api
    get displayData() {
        return this._displayData;
    }
    set displayData(value) {
        this._displayData = value;
        const facets = value?.facets ?? [];
        this._facetsMap = this._createFacetMap(facets);
    }

    /**
     * Gets the normalized filters panel display-data.
     * @type {FiltersPanelDetail}
     * @private
     */
    get normalizedDisplayData() {
        const displayData = this.displayData;
        return {
            facets: displayData?.facets ?? [],
            categories: displayData?.categories,
        };
    }

    /**
     * Gets the list of facets
     * @type {?SearchFacet[]}
     * @private
     */
    get facets() {
        return this.normalizedDisplayData.facets;
    }

    /**
     * Gets the categories tree
     * @type {?CategoryInfoTree}
     * @private
     */
    get categories() {
        return this.normalizedDisplayData.categories;
    }

    /**
     * Gets the label for the filters header
     * @type {string}
     * @private
     */
    get filtersHeader() {
        return labels.filtersHeader;
    }

    /**
     * Gets the label for the clear all button
     * @type {string}
     * @private
     */
    get clearAllLabel() {
        return labels.clearAllLabel;
    }

    /**
     * The map of all SearchFacetValuesCheckMap and all their possible facet values, regardless of selection or not.
     * @type {Map<string | undefined, SearchFacetValuesCheckMap> | null}
     */
    _facetsMap;

    /**
     * The most recent facet that the user has selected
     * @type {SearchFacet}
     * @private
     */
    _mruFacet = {};

    /**
     * The ID of the most recent facet that the user has selected
     * @type {?string}
     * @private
     */
    _mruFacetId;

    /**
     * The filters panel display-data.
     * @type {?FiltersPanelDetail}
     * @private
     */
    _displayData;

    /**
     * Handler for the 'onfacetvaluetoggle' event fired from inputFacet
     * @param {CustomEvent} evt the event object
     */
    handleFacetValueToggle(evt) {
        if (evt.target instanceof HTMLElement) {
            this._mruFacetId = evt.detail.facetId;
            const facetValueId = evt.detail.id;
            const checked = evt.detail.checked;
            if (this._mruFacetId && this._facetsMap?.get(this._mruFacetId)) {
                this._facetsMap.get(this._mruFacetId)?.valuesCheckMap.set(facetValueId, checked);
                this._facetValueUpdated();
            }
        }
    }
    _createFacetMap(facets) {
        return facets?.reduce((facetAccumulator, searchFacet) => {
            return facetAccumulator.set(searchFacet.id, {
                searchFacet,
                valuesCheckMap: new Map(searchFacet.values?.map((facetValue) => [facetValue.id, facetValue.checked])),
            });
        }, new Map());
    }

    /**
     * The function called when we update the facets in the search
     * @type {Function}
     * @private
     * @fires SearchFiltersPanel#facetvalueupdate
     */
    _facetValueUpdated = debounce(() => {
        const mruFacetList = this.facets?.filter((facet) => facet.id === this._mruFacetId);
        if (mruFacetList && mruFacetList.length === 1) {
            this._mruFacet = mruFacetList[0];
        }
        const updatedMruFacet = Object.assign({}, this._mruFacet);
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
     * Handler for the 'click' event fired from the Clear All button
     * Resets the facetsMap and triggers the 'clearallfilters' event
     * @param {CustomEvent} evt the event object
     * @fires SearchFiltersPanel#clearallfilters
     */
    handleClearAll(evt) {
        evt.preventDefault();
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
}
