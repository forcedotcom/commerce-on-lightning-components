import { LightningElement, api } from 'lwc';
import generateTextForTotalResults from './textGenerator';
import type { SortOption } from 'commerce_my_account/orders';

/**
 * Display the header of a List.
 */
export default class OrdersRefinements extends LightningElement {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light';

    /**
     * Whether or not display filters
     */
    @api showFilter: boolean | null | undefined = false;

    /**
     * Text to show along with filtering options
     */
    @api filterText: string | null | undefined;

    /**
     * The Start Date
     */
    @api startDate: string | null | undefined;

    /**
     * The End Date
     */
    @api endDate: string | null | undefined;

    /**
     * Whether or not display sort by option
     */
    @api showSortBy: boolean | null | undefined = false;

    /**
     * An array of available Sorting options
     */
    @api sortOptions: SortOption[] | null | undefined;

    /**
     * Total number of records
     */
    @api count: number | null | undefined;

    /**
     * Whether or not it is small layout
     */
    @api smallLayout: boolean | null | undefined = false;

    /**
     * Whether or not focus needs to move after rendering.
     */
    _queuedFocus = false;

    /**
     * Sets the focus to the header, if the header can receive focus.
     */
    @api focus(): void {
        const target = <HTMLElement>this.querySelector('.record-count');
        if (target) {
            target.focus();
        } else {
            this._queuedFocus = true;
        }
    }

    renderedCallback(): void {
        if (this._queuedFocus) {
            this._queuedFocus = false;
            const element = <HTMLElement>this.querySelector('.record-count');
            if (element) {
                element.focus();
            }
        }
    }

    /**
     * Gets a localized String to show the number of records on the page
     */
    get _totalRecordsCount(): string {
        return generateTextForTotalResults(Number(this.count));
    }

    /**
     * Whether or not any record exists.
     */
    get _showTotalRecord(): boolean {
        return (this.count || 0) > 0;
    }

    /**
     * Whether or not display sort by options in large layout
     */
    get _showSortByForLargeLayout(): boolean {
        return this.displaySortBy() && !this.smallLayout;
    }

    /**
     * Whether or not display sort by options in small layout
     */
    get _showSortByForSmallLayout(): boolean {
        return this.displaySortBy() && !!this.smallLayout;
    }

    /**
     * Whether or not sort by options are present
     */
    displaySortBy(): boolean {
        return !!this.showSortBy && (this.sortOptions || []).length > 0;
    }
}
