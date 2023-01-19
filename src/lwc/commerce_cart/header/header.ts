import { LightningElement, api } from 'lwc';
import { sortByLabelText } from './labels';
import { SORT_OPTIONS, CHANGE_SORT_ORDER_EVENT } from './constants';
import { defaultSortOrder } from 'commerce/config';

import type { SortOption } from './types';

export { CHANGE_SORT_ORDER_EVENT } from './constants';

/**
 * Header Component for Cart Managed Contents
 * @fires Header#cartchangesortorder
 */
export default class Header extends LightningElement {
    /**
     * An event fired the sort order combobox value changes
     *
     * Properties:
     *   - Bubbles: true
     *   - Cancelable: false
     *   - Composed: true
     *
     * @event Header#cartchangesortorder
     * @type {DataProviderActionEvent}
     *
     * @export
     */

    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light';

    /**
     * @description Determines whether the sort options combobox should show
     */
    @api showSortOptions = false;

    /**
     * @description Get the list of sorting options
     * @readonly
     * @private
     */
    private get sortingOptions(): SortOption[] {
        return SORT_OPTIONS;
    }

    /**
     * @description Get the sort by label
     * @readonly
     * @private
     */
    private get sortByLabel(): string {
        return sortByLabelText;
    }

    /**
     * @description This value gets passed down from cart contents.  the instance of this
     * component is reset after sorting is changed, so it won't remember what the combobox value should be
     */
    @api sortOrder: string | undefined;
    get _sortOrder(): SortOption | undefined {
        return SORT_OPTIONS.find((option) => option.value === (this.sortOrder ?? defaultSortOrder));
    }

    /**
     * @description Handles the change or select event triggered when a sort option is selected
     *
     * @param {Event} event the change/select event dispatched from
     * the underlying lightning component
     *
     * @fires Header#cart:cartchangesortorder
     */
    handleChangeSortSelection(event: CustomEvent): void {
        this.dispatchEvent(
            new CustomEvent(CHANGE_SORT_ORDER_EVENT, {
                detail: event.detail.value,
                composed: true,
                bubbles: true,
            })
        );
    }
}
