import { api, LightningElement } from 'lwc';

import type { LabelValuePair, LwcCustomEventTargetOf } from 'types/common';
import type { SearchSortEvent, SortRuleData } from 'commerce/searchApiInternal';
import { computeSortOptions } from 'commerce/searchApiInternal';
import { EVENT_SORT_ORDER_CHANGED } from './constants';

export type { SortMenu };

/**
 * A UI control for user to select the sort order for search result
 * @fires SearchSortEvent event
 */
export default class SortMenu extends LightningElement {
    /**
     * An event fired when user changes the sort order
     *
     * @event SearchSortEvent
     * @type {CustomEvent}
     *
     * @property {string} detail.sortRuleId The new selected sort rule Id
     *
     * @export
     */

    /**
     * Defines the component as light DOM
     */
    public static renderMode = 'light';

    /**
     * The label value sort options computed from the sort rules data list
     */
    get _options(): LabelValuePair[] {
        return computeSortOptions(this.sortRules || []);
    }

    /**
     * The current select sort rule Id
     */
    @api
    sortRuleId?: string | null;

    /**
     * The sort rules options
     */
    @api
    sortRules?: SortRuleData[] | null = [];

    /**
     * The current sort option. If not sort option is selected, returns the first option available.
     */
    get activeOption(): LabelValuePair {
        const firstOption: LabelValuePair | undefined = this._options?.[0];
        const selectedOption: LabelValuePair | undefined = this._options.find(
            (sortOption: LabelValuePair) => sortOption.value === this.sortRuleId
        );
        return selectedOption || firstOption || { label: '', value: '' };
    }

    /**
     * Handler for the "change" event fired if the user selects a new sort option.
     * If it's the same as current one, no further actions; otherwise, fire a customer event
     * @param event The change event object
     */
    handleChange(event: LwcCustomEventTargetOf<HTMLSelectElement>): void {
        const selectedSortRuleId = event.detail.value;
        if (selectedSortRuleId && selectedSortRuleId !== this.sortRuleId) {
            this.dispatchSortOrderChangeEvent(selectedSortRuleId);
        }
    }

    /**
     * Dispatches the sort order change event
     * @fires search:sort event
     */
    private dispatchSortOrderChangeEvent(sortRuleId?: string): void {
        // Fire an event after user changed sort order
        this.dispatchEvent(
            new CustomEvent<SearchSortEvent>(EVENT_SORT_ORDER_CHANGED, {
                bubbles: true,
                cancelable: true,
                composed: true,
                detail: { sortRuleId },
            })
        );
    }
}
