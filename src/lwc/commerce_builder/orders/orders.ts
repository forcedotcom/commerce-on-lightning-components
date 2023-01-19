import { LightningElement, api, wire, track } from 'lwc';
import { NavigationContext, generateUrl, navigate } from 'lightning/navigation';
import { filterDate, sortByNewToOld, sortByOldToNew, startReorderAssistiveText } from './labels';
import type { OrderData, OrderAction, SortOption, OrderField } from 'commerce_my_account/orders';
import type { LightningNavigationContext } from 'types/common';
import type { EntityField, OrderCollectionData, OrderSummaryData } from 'commerce/orderApi';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import { OrdersAdapter } from 'commerce/orderApi';
import type { InputField } from './types';
import getOrderFieldNames, { getDefaultOrderFields } from './orderRequestPreprocessors';
import getAddressValues, { getErrorMessage, getCoordinate, getCoordinateValues } from './orderResponseProcessors';
import { getUTCDate, createDate, getStandardDateFormat, setTime } from './dateUtility';
import type { SessionContext } from 'commerce/contextApi';
import { SessionContextAdapter } from 'commerce/contextApi';
import ReorderModal from 'commerce_my_account/reorderModal';
import type { PageReference } from 'types/common';
import { finishReorder } from 'commerce/orderApiInternal';

export const BILLING_ADDRESS = 'BillingAddress';
export const LOCATION = 'location';
export const GEO_LOCATION = 'Geolocation';
export const ADDRESS_INNER_FIELDS = [
    'BillingCity',
    'BillingCountry',
    'BillingState',
    'BillingPostalCode',
    'BillingStreet',
    'BillingLatitude',
    'BillingLongitude',
];
const ORDERED_DATE_ASC = 'OrderedDateAsc';
const ORDERED_DATE_DESC = 'OrderedDateDesc';
const SORT_BY_NEW_TO_OLD = 'sortByNewToOld';
const SORT_BY_OLD_TO_NEW = 'sortByOldToNew';

const CART_PAGE_REF: PageReference = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Current_Cart',
    },
};

const ORDER_PAGE_REF: PageReference = {
    type: 'standard__objectPage',
    attributes: {
        objectApiName: 'OrderSummary',
        actionName: 'list',
    },
    state: {
        filterName: 'Default',
    },
};

export default class Orders extends LightningElement {
    static renderMode = 'light';

    /**
     * accountId will be used to retrieve order summaries in builder context only
     */
    @api public accountId: string | undefined;

    /**
     * The text displayed for the No Order List
     */
    @api public noOrderMessageText: string | undefined;

    /**
     * The stringified, unparsed JSON string of the net ordersSummary fields mapping attribute
     */
    @api orderSummaryFieldMapping: string | undefined;

    /**
     * count of Orders to be shown on component
     */
    @api public ordersListCount: number | undefined;

    /**
     * Previous number of months for which the component will fetch the order summaries by default
     */
    @api
    public get numberOfMonthsForFilter(): number | undefined {
        return this._numberOfMonthsForFilter;
    }
    public set numberOfMonthsForFilter(months: number | undefined) {
        this._numberOfMonthsForFilter = months;
        this.assignDefaultDates();
    }

    /**
     * Flag whether to Show SortBy functionality for orders list component
     */
    @api public showOrdersListSortBy: boolean | undefined = false;

    /**
     * Flag whether to show FilterBy functionality for show component
     */
    @api public showOrdersListFilter: boolean | undefined = false;

    /**
     * The text displayed for the No results filtered
     */
    @api public noResultsText: string | undefined;

    /**
     * ViewMore button behaviour Orders List component
     */
    @api public viewMoreOrderBehaviour: string | undefined;

    /**
     * Show More label on OrdersList component
     */
    @api public showMoreLabel: string | undefined;

    /**
     * Reorder radio button action on each Order summary in the ordersList component to show Reorder action
     */
    @api public showReorder: boolean | undefined = false;

    /**
     * Label for Reorder Button
     */
    @api public reorderLabel: string | undefined;

    /**
     * view Details radio button action on each Order summary in the ordersList component to show View Details action
     */
    @api public showViewDetailsLink: boolean | undefined = false;

    /**
     * Label for View Details Button
     */
    @api public viewDetailsLinkLabel: string | undefined;

    /**
     * URL for View Cart button in modal
     * @private
     * @type {string}
     */
    _cartUrl: string | undefined;

    _filterText: string = filterDate;

    _isLoadingMore = false;

    _ascending = false;

    @track _orders: OrderData[] | undefined;

    _ordersUrl: string | undefined;

    get _detailsLabel(): string {
        return this.showViewDetailsLink ? this.viewDetailsLinkLabel || '' : '';
    }

    get _sortOptions(): SortOption[] {
        return [
            {
                label: sortByNewToOld,
                value: SORT_BY_NEW_TO_OLD,
                selected: !this._ascending,
            },
            {
                label: sortByOldToNew,
                value: SORT_BY_OLD_TO_NEW,
                selected: this._ascending,
            },
        ];
    }

    get _actions(): OrderAction[] {
        const actions: OrderAction[] = [];
        if (this.showReorder) {
            actions.push({
                name: this.reorderLabel || '',
                eventName: 'reorder',
                assistiveText: startReorderAssistiveText,
            });
        }
        return actions;
    }

    /**
     * @description generates url and navigation context for "View Cart" button in ReorderModal
     */
    _navContext: LightningNavigationContext | undefined;

    @wire(NavigationContext)
    navigationContextHandler(navContext: LightningNavigationContext): void {
        if (navContext) {
            this._ordersUrl = generateUrl(navContext, ORDER_PAGE_REF);
            this._cartUrl = generateUrl(navContext, CART_PAGE_REF);
            this._navContext = navContext;
        }
    }

    handleViewCart(): void {
        navigate(<LightningNavigationContext>this._navContext, CART_PAGE_REF);
    }

    private _previewMode = false;
    /**
     * property which tells builder mode view or runtime
     */
    @wire(SessionContextAdapter)
    updateSessionContext({ data }: StoreAdapterCallbackEntry<SessionContext>): void {
        this._previewMode = data?.isPreview === true;
    }

    /**
     * whether or not the filter has been updated
     */
    _filterState: string | undefined;

    /**
     * whether or not sorting is being applied
     */
    _isSorting = false;

    /**
     * The text displayed for the No Orders
     */
    _noOrderMessageText: string | undefined;

    /**
     * determines the start date filter of orders
     */
    _startDate: string | null | undefined;

    /**
     * determines the end date filter of orders
     */
    _endDate: string | null | undefined;

    /**
     * Whether or not the orders has a next page
     */
    _hasNextPage = false;

    /**
     * The OrderSummary Id which needs to be on focus when show more is clicked
     */
    _focusOrderSummaryId: string | undefined;

    /**
     * The message in case of errors
     */
    _errorMessage: string | undefined;

    private _ownerScoped = false;
    private _pageToken: string | null | undefined;
    private _nextPageToken: string | null | undefined;
    private _numberOfMonthsForFilter: number | undefined;
    private _startDateInLocalTimeZone: Date | undefined;
    private _endDateInLocalTimeZone: Date | undefined;
    private _eventType: string | undefined;
    private _sortOrder: string | undefined;
    private _previousStartDate: string | null | undefined;
    private _previousEndDate: string | null | undefined;
    private _defaultStartDate: string | null | undefined;
    private _defaultEndDate: string | null | undefined;
    private _previousSortOrder: string | undefined;

    private get _normalizeNumberOfMonthsForFilter(): number {
        return this.numberOfMonthsForFilter ?? 0;
    }

    private get _orderFields(): InputField[] {
        if (this.orderSummaryFieldMapping && this.orderSummaryFieldMapping !== '[]') {
            return JSON.parse(this.orderSummaryFieldMapping);
        }
        return getDefaultOrderFields();
    }

    private get _orderFieldNames(): string[] {
        return getOrderFieldNames(this._orderFields).concat('OrderNumber');
    }

    private get _effectiveAccountId(): string | undefined {
        return this._previewMode ? this.accountId : '';
    }

    private get _utcStartDate(): string | undefined {
        return getUTCDate(this._startDateInLocalTimeZone);
    }

    private get _utcEndDate(): string | undefined {
        return getUTCDate(this._endDateInLocalTimeZone);
    }

    handleShowMoreOrders(event: CustomEvent): void {
        event.stopPropagation();
        if (this._nextPageToken) {
            this._isLoadingMore = true;
            this._pageToken = this._nextPageToken;
        }
    }

    handleDateFilter(event: CustomEvent): void {
        event.stopPropagation();
        this._startDate = event.detail.startDate ? event.detail.startDate : undefined;
        this._endDate = event.detail.endDate ? event.detail.endDate : undefined;

        if (this.checkIfFilterStateNeedsToBeUpdated()) {
            this.updateFilterOrResetState();
            this._pageToken = null;
            this._nextPageToken = null;
            if (this._startDate) {
                const startDate = new Date(this._startDate);
                this._startDateInLocalTimeZone = setTime(startDate, 0, 0, 0, 0);
            } else {
                this._startDateInLocalTimeZone = undefined;
            }

            if (this._endDate) {
                const endDate = new Date(this._endDate);
                this._endDateInLocalTimeZone = setTime(endDate, 23, 59, 59, 999);
            } else {
                this._endDateInLocalTimeZone = undefined;
            }
        }
    }

    handleDateResetFilter(event: CustomEvent): void {
        event.stopPropagation();
        if (this.checkIfResetDateStateNeedsToBeUpdated()) {
            this._pageToken = null;
            this._nextPageToken = null;
            this.updateFilterOrResetState();
            this.assignDefaultDates();
        }
    }

    handleSortOrders(event: CustomEvent): void {
        event.stopPropagation();
        const sortOrder = event.detail.sortingOption === SORT_BY_NEW_TO_OLD ? ORDERED_DATE_DESC : ORDERED_DATE_ASC;
        if (this.checkIfSortingStateNeedsToBeUpdated(sortOrder)) {
            this._pageToken = null;
            this._nextPageToken = null;
            this._sortOrder = sortOrder;
            this.updateSortingState();
        }
    }

    /**
     * @description Opens the ReorderModal
     */
    async handleReorder(event: CustomEvent): Promise<void> {
        await ReorderModal.open({
            size: 'small',
            orderSummaryId: event.detail.orderId,
            onviewcart: () => {
                this.handleViewCart();
            },
        });
        await finishReorder();
    }

    @wire(OrdersAdapter, {
        effectiveAccountId: '$_effectiveAccountId',
        fields: '$_orderFieldNames',
        pageSize: '$ordersListCount',
        pageToken: '$_pageToken',
        sortOrder: '$_sortOrder',
        earliestDate: '$_utcStartDate',
        latestDate: '$_utcEndDate',
        ownerScoped: '$_ownerScoped',
    })
    getOrders({ data, error }: { data: OrderCollectionData; error: Error }): void {
        if (data) {
            if (this._isLoadingMore) {
                const moreOrders = data.orderSummaries.map((order) => this._transformOrder(order));
                this._orders = this._orders?.concat(moreOrders);
                this.updateShowMoreState(moreOrders[0].id);
            } else {
                this._orders = data.count ? data.orderSummaries.map((order) => this._transformOrder(order)) : [];
                if (this._orders.length === 0) {
                    this.updateNoOrderMessageText();
                }
                if (this._eventType === 'FILTER') {
                    this._filterState = 'updated';
                }
                this._isSorting = false;
                this.storeCurrentState(data.sortOrder);
            }

            if (data.nextPageToken) {
                this._hasNextPage = true;
                this._nextPageToken = data.nextPageToken;
            } else {
                this._hasNextPage = false;
                this._nextPageToken = null;
            }

            this._errorMessage = '';
        }
        if (error) {
            this._errorMessage = getErrorMessage(this._previewMode, this.accountId);
            this.restoreDefaultState();
        }
    }

    private _transformOrder(order: OrderSummaryData): OrderData {
        const orderDataObj: OrderData = {
            id: order.orderSummaryId,
            currencyCode: order.currencyIsoCode,
            fields: [],
            orderNumber: order.orderNumber,
        };
        const orderFieldMap: Map<string, EntityField> = new Map(Object.entries(order.fields));
        this._orderFields.forEach((field: InputField) => {
            const orderFieldObj: OrderField = {
                name: field.label,
                value: '',
                type: '',
            };
            if (field.name === BILLING_ADDRESS) {
                orderFieldObj.type = 'Address';
                orderFieldObj.value = getAddressValues(orderFieldMap);
            } else {
                orderFieldObj.type = orderFieldMap.get(field.name)?.type || '';
                orderFieldObj.value = (orderFieldMap.get(field.name)?.text || '') as string;
                if (orderFieldObj.type === LOCATION) {
                    const coordinate = getCoordinate(orderFieldObj.value);
                    if (coordinate.length === 2) {
                        orderFieldObj.value = getCoordinateValues(coordinate);
                        orderFieldObj.type = GEO_LOCATION;
                    }
                }
            }
            if (field.name === BILLING_ADDRESS || orderFieldMap.has(field.name)) {
                orderDataObj.fields?.push(orderFieldObj);
            }
        });
        return orderDataObj;
    }

    private restoreDefaultState(): void {
        this._orders = [];
        this._nextPageToken = null;
        this._hasNextPage = false;
        this._isSorting = false;
        this._ascending = false;
        this._isLoadingMore = false;
        this._startDate = undefined;
        this._previousStartDate = undefined;
        this._endDate = undefined;
        this._previousEndDate = undefined;
        this._eventType = undefined;
        this._filterState = undefined;
        this._previousSortOrder = undefined;
        this._noOrderMessageText = undefined;
        this._focusOrderSummaryId = undefined;
    }

    private storeCurrentState(sortOrder: string | undefined): void {
        this._previousEndDate = this._endDate;
        this._previousStartDate = this._startDate;
        this._previousSortOrder = sortOrder;
    }

    private assignDefaultDates(): void {
        const endDate = createDate(0, 0, 0);
        this._endDate = getStandardDateFormat(endDate); // date displayed to user.
        this._defaultEndDate = this._endDate;
        this._endDateInLocalTimeZone = setTime(endDate, 23, 59, 59, 999);

        const startDate = createDate(0, -this._normalizeNumberOfMonthsForFilter, 0);
        this._startDate = getStandardDateFormat(startDate);
        this._defaultStartDate = this._startDate;
        this._startDateInLocalTimeZone = setTime(startDate, 0, 0, 0, 0);
    }

    private updateNoOrderMessageText(): void {
        if ((this._startDate || '').length > 0 || (this._endDate || '').length > 0) {
            this._noOrderMessageText = this.noResultsText;
        } else {
            this._noOrderMessageText = this.noOrderMessageText;
        }
    }

    private updateShowMoreState(focusOrderSummaryId: string | undefined): void {
        this._focusOrderSummaryId = focusOrderSummaryId;
        this._isLoadingMore = false;
        this._filterState = undefined;
    }

    private updateFilterOrResetState(): void {
        this._filterState = 'updating';
        this._eventType = 'FILTER';
        this._focusOrderSummaryId = undefined;
    }

    private updateSortingState(): void {
        this._ascending = this._sortOrder === ORDERED_DATE_ASC;
        this._eventType = 'SORT';
        this._isSorting = true;
        this._filterState = undefined;
        this._focusOrderSummaryId = undefined;
    }

    private checkIfFilterStateNeedsToBeUpdated(): boolean {
        return this._startDate !== this._previousStartDate || this._endDate !== this._previousEndDate;
    }

    private checkIfResetDateStateNeedsToBeUpdated(): boolean {
        return this._defaultStartDate !== this._previousStartDate || this._defaultEndDate !== this._previousEndDate;
    }

    private checkIfSortingStateNeedsToBeUpdated(sortOrder: string): boolean {
        return sortOrder !== this._sortOrder;
    }
}
