import { api, LightningElement } from 'lwc';
import type { SortRuleData, SearchSortEvent } from 'commerce/searchApiInternal';
import { DataProviderActionEvent } from 'experience/dataProvider';

export type { SearchSortMenu };

/**
 * A UI control for user to select the sort order for search result
 * @slot sortMenuLabel ({ "locked": false, "defaultContent": [{ "descriptor": "dxp_base/textBlock", "attributes": { "text": "{!Label.B2B_Search_Results.sortBy}", "textAlign": "right", "paddingHorizontal": "small", "textDisplayInfo": "{\"headingTag\": \"p\", \"textStyle\": \"body-regular\"}" } }] })
 * @fires search:sortChange event
 */
export default class SearchSortMenu extends LightningElement {
    /**
     * An event fired when user changes the sort order
     *
     * @event search:sortChange
     * @type {DataProviderActionEvent<SearchSortEvent>}
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
     * The current select sort rule Id
     */
    @api
    sortRuleId?: string | null;

    /**
     * Gets and Sets the sort rules data list.
     * Computes the label value sort options from the sort rules data list
     */
    @api
    sortRules?: SortRuleData[] | null;

    /**
     * Handles the search sort event from the
     * Computes the label value sort options from the sort rules data list
     */
    handleSearchSortEvent({ detail }: CustomEvent<SearchSortEvent>): void {
        this.dispatchEvent(
            new DataProviderActionEvent<SearchSortEvent>('search:changeSortOrder', {
                sortRuleId: detail.sortRuleId,
            })
        );
    }
}
