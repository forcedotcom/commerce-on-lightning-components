/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';
import { createSearchSortUpdateAction, dispatchAction } from 'commerce/actionApi';

/**
 * An event fired when the user changes the sort rule/order.
 * @event BuilderSortMenu#SearchSortEvent
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {string} [detail.type] The action ID
 * @property {string} [detail.payload] The action payload, i.e. selected sort rule ID
 */

/**
 * A UI control for user to select the sort order for search result
 * @slot sortMenuLabel
 * @fires BuilderSortMenu#SearchSortEvent
 */
export default class SearchSortMenu extends LightningElement {
    static renderMode = 'light';

    @api
    sortRuleId;

    @api
    sortRules;

    /**
     * @param {CustomEvent} detail CustomEvent details
     * @param {string} detail.sortRuleId The selected sort rule ID
     * @private
     * @fires BuilderSortMenu#SearchSortEvent
     */
    handleSearchSortEvent({ detail }) {
        dispatchAction(this, createSearchSortUpdateAction(detail.sortRuleId));
    }
}
