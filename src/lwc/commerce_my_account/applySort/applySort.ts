import { LightningElement, api } from 'lwc';
import type { SortOption } from 'commerce_my_account/orders';

/**
 * Display sort by options
 * @fires ApplySort#sortorders
 */
export default class ApplySort extends LightningElement {
    /**
     * An event fired if user clicks on sort by options. This event can bubble up through the DOM
     *
     * Properties:
     *	 - bubbles:true
     *   - composed: true
     *
     * @event ApplySort#sortorders
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * An array of available Sorting options
     */
    @api
    get sortOptions(): SortOption[] | null | undefined {
        return this._sortOptions;
    }

    set sortOptions(sortOptions: SortOption[] | null | undefined) {
        this._sortOptions = sortOptions;
        (this._sortOptions || []).forEach((sortOption: SortOption) => {
            if (sortOption.selected) {
                this._sortByText = sortOption.label;
            }
        });
    }

    /**
     * The list of sort options
     */
    private _sortOptions: SortOption[] | null | undefined;

    /**
     * The label for selected sort options
     */
    private _sortByText = '';

    /**
     * The label for selected sort option
     */
    get _sortByLabel(): string {
        return this._sortByText;
    }

    /**
     * handler for sorting the records
     */
    sortOrders(event: CustomEvent): void {
        const sortingOption = event.detail.value;
        this.dispatchEvent(
            new CustomEvent('sortorders', {
                bubbles: true,
                composed: true,
                detail: {
                    sortingOption,
                },
            })
        );
    }

    /**
     * Gets the normalized (always an array) sort options.
     * @readonly
     * @private
     */
    get normalizedSortOptions(): SortOption[] {
        return this.sortOptions || [];
    }
}
