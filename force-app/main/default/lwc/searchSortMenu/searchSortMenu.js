/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';
import { EVENT_SORT_ORDER_CHANGED } from './constants';
import { computeSortOptions } from './utils';

/**
 * @typedef {object} SortRuleData
 * @property {string} sortRuleId Sort rule ID
 * @property {string} nameOrId Sort rule name or ID
 * @property {string} type Sort rule type
 * @property {string} label Sort rule label
 * @property {string} direction Sort direction
 * @property {string} [sortOrder] Sort order
 * @property {string} [labelSuffix] Sort rule label suffix
 */

/**
 * @typedef {object} LabelValuePair
 * @property {string} label Label
 * @property {string} value Value
 */

/**
 * An event fired when the user changes the sort rule/order.
 * @event SortMenu#SearchSortEvent
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {string} [detail.sortRuleId] The selected sort rule ID
 */

/**
 * A UI control for user to select the sort order for search result
 * @fires SortMenu#SearchSortEvent event
 */
export default class SortMenu extends LightningElement {
    static renderMode = 'light';

    /**
     * @private
     * @type {?SortRuleData[]}
     */
    _sortRules;

    /**
     * Normalized sort options computed from the sort rules data list
     * @private
     * @type {LabelValuePair[]}
     */
    _options = [];

    /**
     * The currently select sort rule ID
     * @type {?string}
     */
    @api
    sortRuleId;

    /**
     * All sort rules/options
     * @type {?SortRuleData[] = []}
     */
    @api
    set sortRules(value) {
        this._sortRules = value;
        this._options = computeSortOptions(value);
    }
    get sortRules() {
        return this._sortRules;
    }

    /**
     * @private
     * @returns {LabelValuePair} The current sort option. If no sort option is selected, returns the first option available.
     */
    get activeOption() {
        const selectedOption = this._options.find((sortOption) => sortOption.value === this.sortRuleId);
        return (
            selectedOption ||
            this._options.at(0) || {
                label: '',
                value: '',
            }
        );
    }

    /**
     * Handler for the "change" event fired if the user selects a new sort option.
     * If it's the same as current one, no further actions; otherwise, fire a customer event
     * @private
     * @param {CustomEvent<{ value: string }>} event The change event object
     * @fires SortMenu#SearchSortEvent
     */
    handleChange({ detail: { value } }) {
        if (value && value !== this.sortRuleId) {
            this.dispatchEvent(
                new CustomEvent(EVENT_SORT_ORDER_CHANGED, {
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    detail: {
                        sortRuleId: value,
                    },
                })
            );
        }
    }
}
