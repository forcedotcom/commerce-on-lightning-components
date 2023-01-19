import type Order from 'commerce_my_account/order';
import type OrdersRefinements from 'commerce_my_account/ordersRefinements';
import { LightningElement, api } from 'lwc';
import { spinnerText } from './labels';
import type { OrderData, OrderField, OrderAction, SortOption, AddressValue } from './types';
export type { OrderData, OrderField, OrderAction, SortOption, AddressValue };

type FilterState = 'updating' | 'updated';

interface UpdatedOrderData extends OrderData {
    fieldsetTabIndex: number;
}

/**
 * Display a list of order
 * @fires Orders#showmoreorders
 */
export default class Orders extends LightningElement {
    static renderMode = 'light';

    /**
     * An event fired if showMoreBehaviour is SHOW_MORE and user clicks show more button.This event can bubble up through the DOM
     *
     * Properties:
     *	 - bubbles:true
     *   - composed: true
     *
     * @event Orders#showmoreorders
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * An array of orders
     */
    @api
    get orders(): OrderData[] | undefined {
        return this._orders;
    }
    set orders(orders: OrderData[] | undefined) {
        this._orders = orders;
        this._updateResizeObserver = true;
        const header = <(OrdersRefinements & HTMLElement) | null>(
            this.querySelector('commerce_my_account-orders-refinements')
        );
        if ((this.filterState || '') === 'updated' && header) {
            header.focus();
        }
    }
    /**
     * Gets the normalized orders
     */
    get _normalizedOrders(): UpdatedOrderData[] {
        //@ts-ignore
        return this.orders.map((order, index) => ({
            ...order,
            fieldsetTabIndex: index === 0 ? 0 : -1,
        }));
    }

    /**
     * An array of orders
     */
    private _orders?: OrderData[] = [];

    /**
     * An array of actions that can be performed on a order
     */
    @api actions?: OrderAction[];

    /**
     * Title of list
     */
    @api listTitle?: string;

    /**
     * Text for link which will redirect to order detail page.
     */
    @api detailsLabel?: string;

    /**
     * Text for show more button
     */
    @api showMoreLabel?: string;

    /**
     * Assistive Text for show more
     */
    @api showMoreAssistiveText?: string;

    /**
     * Behaviour of show more button, i.e. SHOW_MORE or GO_TO_LIST_UI
     */
    @api showMoreBehaviour?: string;

    /**
     * Gets or sets the unique id of the first new order added to the list that is given focus when it is initially displayed
     */
    @api focusedOrderId?: string;

    /**
     * Whether or not next set of orders are present
     */
    @api hasNextPage = false;

    /**
     * Whether or not display sort by option
     */
    @api showSortBy: boolean | null | undefined = false;

    /**
     * An array of available Sorting options
     */
    @api sortOptions: SortOption[] | null | undefined;

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
     *  undefined if no filter has been applied.
     * 'updating' if filter is being applied.
     * 'updated' if filter has been applied.
     */
    set filterState(filterState: FilterState | undefined) {
        this._filterState = filterState;
        const header = <(OrdersRefinements & HTMLElement) | null>(
            this.querySelector('commerce_my_account-orders-refinements')
        );
        if ((this._filterState || '') === 'updated' && header) {
            header.focus();
        }
    }
    @api get filterState(): FilterState | undefined {
        return this._filterState;
    }
    private _filterState?: FilterState;
    /**
     * Whether or not sorting is being applied.
     */
    @api isSorting = false;

    /**
     * Whether or not more orders is being loaded.
     */
    @api isLoadingMore = false;

    /**
     * Title text to show when no orders are present in the list
     */
    @api noOrderMessageTitle?: string;

    /**
     * Detail text to show when no orders are present in the list
     */
    @api noOrderMessageText?: string;

    /**
     * The error message
     */
    @api
    get errorMessage(): string | undefined {
        return this._errorMessage;
    }
    set errorMessage(errorMessage: string | undefined) {
        this._errorMessage = errorMessage;
        this._updateResizeObserver = true;
    }

    /**
     * The error message
     */
    private _errorMessage?: string;

    /**
     * The ResizeObserver instance
     */
    private _listResizeObserver?: ResizeObserver;

    connectedCallback(): void {
        this._listResizeObserver = new ResizeObserver((entries) => {
            const width = entries && entries[0] ? entries[0].contentRect.width : null;
            if (width) {
                if (width > 1025) {
                    this._columns = 4;
                } else if (width > 768) {
                    this._columns = 3;
                } else if (width > 600) {
                    this._columns = 2;
                } else {
                    this._columns = 1;
                }
            }
        });
    }

    disconnectedCallback(): void {
        this._listResizeObserver?.disconnect();
    }

    renderedCallback(): void {
        if ((this.focusedOrderId || '').length > 0 && this.focusedOrderId !== this._lastFocusedOrderId) {
            (<(Order & HTMLElement) | null>this.querySelector(`[data-order-id='${this.focusedOrderId}']`))?.focusCell(
                'orderInfo'
            );
        }
        this._lastFocusedOrderId = this.focusedOrderId;
        if (this._updateResizeObserver) {
            this._updateResizeObserver = false;
            this._listResizeObserver?.disconnect();
            const orders = this.querySelector('div:nth-of-type(1)');
            if (orders) {
                this._listResizeObserver?.observe(orders);
            }
        }
    }
    /**
     * Id of the previously focused order
     */
    private _lastFocusedOrderId?: string;

    /**
     * Whether or not update resize observer
     */
    private _updateResizeObserver = false;

    /**
     * number of columns
     */
    private _columns = 4;

    /**
     * Gets the required i18n labels
     */
    get _spinnerText(): string {
        return spinnerText;
    }

    /**
     * Gets the number of orders on the page
     */
    get _totalOrdersCount(): number {
        return this._showListOfOrders ? this.orders!.length : 0;
    }

    /**
     * Whether or not this is a small layout
     */
    get _smallLayout(): boolean {
        return this._columns === 1;
    }

    /**
     * Whether or not show more will redirect to List UI
     */
    get _showGotoList(): boolean {
        return this.showMoreBehaviour === 'GO_TO_LIST_UI';
    }

    /**
     * Whether or not error message is present
     */
    get _hasError(): boolean {
        return !!(this.errorMessage || '').length;
    }
    /**
     * Whether or not show the List or orders
     */
    get _showListOfOrders(): boolean {
        return Array.isArray(this.orders) && !!this.orders.length;
    }

    /**
     * Whether or not show the empty state.
     */
    get _showEmptyState(): boolean {
        return !this._hasError && !this._showListOfOrders;
    }

    /**
     * Whether or not show page level spinner.
     */
    get _showPageSpinner(): boolean {
        return (this.filterState || '') === 'updating' || this.isSorting || !Array.isArray(this.orders);
    }

    /**
     * Aria role for orders
     */
    get _ariaRoleForOrders(): string {
        return this._columns === 1 ? 'list' : 'grid';
    }

    /**
     * Aria role for a order
     */
    get _ariaRoleForOrder(): string {
        return this._ariaRoleForOrders === 'list' ? 'listitem' : 'row';
    }

    /**
     * Url of the order's list page
     */
    @api ordersUrl?: string;

    /**
     * fires and event to navigates to the order's list page
     *
     * @fires #navigatetoorders
     */
    handleNavigateToOrders(): void {
        this.dispatchEvent(
            new CustomEvent('navigatetoorders', {
                bubbles: true,
                composed: true,
            })
        );
    }
    /**
     * Fires an event to show more orders on page
     *
     * @fires #showmoreorders
     */
    handleShowMoreItems(): void {
        this.dispatchEvent(
            new CustomEvent('showmoreorders', {
                bubbles: true,
                composed: true,
            })
        );
    }

    /**
     * handler for the shiftfocus event.
     */
    handleShiftfocus(event: CustomEvent): void {
        const index = (<HTMLElement>event.currentTarget).dataset.index;
        if (index) {
            const row = event.detail.direction === 'up' ? parseInt(index, 10) - 1 : parseInt(index, 10) + 1;
            (<(Order & HTMLElement) | null>this.querySelector(`[data-index='${row}']`))?.focusCell(event.detail.cell);
        }
    }
}
