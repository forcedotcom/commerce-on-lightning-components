import { LightningElement, api, track, wire } from 'lwc';
import { OrderItemsAdapter, OrderItemsAdjustmentsAdapter } from 'commerce/orderApi';
import { effectiveAccount } from 'commerce/effectiveAccountApi';
import type {
    OrderItemsAdjustmentsCollectionData,
    OrderItemAdjustmentInput,
    OrderItemSummaryCollectionData,
} from 'commerce/orderApi';
import type { TextDisplayInfo } from 'commerce_my_account/orderItemInfo';
import type { OrderDeliveryGroup, TransformedOrderItemAdjustments } from './types';
import type { FieldMapping } from 'commerce_builder/orderProducts';
export type { OrderItem, OrderDeliveryGroup } from './types';

import { processOrderItemData, formatOrderItems, orderItemIds } from './processOrderItemDataResponse';
import { processOrderItemDataWithNoItemsError, processOrderItemError } from './processOrderItemDataError';
import { processOrderItemAdjustmentsData } from './processOrderItemAdjustmentsData';
const ADJ_AGGR_FIELD_NAMES = [
    'OrderAdjustmentAggregateSummary.TotalLinePromotionAmount',
    'OrderAdjustmentAggregateSummary.TotalPromotionDistAmount',
];
export default class OrderDeliveryGroupContainer extends LightningElement {
    static renderMode = 'light';
    /**
     * @description The record Id for the orderSummaryDetails page
     */
    @api
    orderSummaryId: string | undefined;

    /**
     * @description Currency Code to be used on the Order Summary Detail page
     */

    @api
    currencyCode: string | undefined;

    /**
     * @description The OrderItemSummary Id which needs to be on focus when show more is clicked
     */
    _focusOrderItemId: string | undefined;

    /**
     * @description An array of strings used to specify which product fields to fetch
     */
    @api
    fieldNames: string[] | undefined;

    /**
     * @description An array of strings used to specify which product fields to fetch with orderAdjustmentAggregate fields filtered out
     */
    get filteredFieldNames(): string[] | undefined {
        return this.fieldNames?.filter((fieldName) => !ADJ_AGGR_FIELD_NAMES.includes(fieldName));
    }

    /**
     * @description  The product field mapping attribute
     */
    @api
    productFieldMapping: FieldMapping[] = [];

    /**
     * @description Whether there are multiple orderDeliveryGroups assosciated with this orderSummaryId
     */
    @api
    isMultipleGroups = false;

    /**
     * @description Representation of the orderDeliveryGroup
     */
    @api
    orderDeliveryGroup: OrderDeliveryGroup | undefined;

    @track
    _orderDeliveryGroup: OrderDeliveryGroup | undefined;

    @api
    orderDeliveryGroupSummaryId: string | undefined;

    /**
     * @description  List of OrderSummaryItemIds to fetch adjustments data
     */
    @track
    _orderItemIds: OrderItemAdjustmentInput[] = [];

    /**
     * @description  A map of orderSummaryItemId to adjustments
     */
    @track
    _orderSummaryItemAdjustments: TransformedOrderItemAdjustments | undefined;

    /**
     * @description label to show on adjustments with type `other` in the popup component.
     */
    @api
    otherAdjustmentsLabel: string | undefined;

    /**
     * @description text for show more button
     */
    @api
    showMoreProductLabel: string | undefined;

    /**
     * @description Prefix to the shipping address of the orderDeliveryGroup for example (Ship To)
     */
    @api
    prefixToShippingGroup: string | undefined;

    /**
     * @description The message to display incase product is not available
     */
    @api
    productUnavailableMessage: string | undefined;

    /**
     * @description  The number of products to show before load more is seen (if more products are available)
     */
    @api pageSize: number | undefined;

    /**
     * @description Whether to show product images
     */
    @api showProductImage = false;

    /**
     * @description Whether to show the  adjustmented line subtotal field
     */
    @api showTotal = false;

    /**
     * @description style properties for the  adjusted line subtotal amount
     */
    @api
    textDisplayInfo: TextDisplayInfo | undefined;

    /**
     * Total Price Text Color
     */
    @api
    totalPriceTextColor: string | undefined;

    /**
     * @description  A string used by the orderItem api to determine which products to fetch next
     */
    _nextPageToken: string | undefined;

    @wire(OrderItemsAdapter, {
        orderSummaryId: '$orderSummaryId',
        effectiveAccountId: effectiveAccount.accountId,
        fields: '$filteredFieldNames',
        orderDeliveryGroupSummaryId: '$orderDeliveryGroupSummaryId',
        includeAdjustmentDetails: true,
        pageSize: '$pageSize',
        page: '$_nextPageToken',
    })
    handleOrderItemResponse({
        data,
        error,
    }: {
        data: OrderItemSummaryCollectionData;
        error: { message: string | null; code: string | null };
    }): void {
        if (data) {
            if (data.items.length === 0 && this.orderDeliveryGroup && this.prefixToShippingGroup) {
                this._orderDeliveryGroup = processOrderItemDataWithNoItemsError(
                    this._orderDeliveryGroup || this.orderDeliveryGroup,
                    this.prefixToShippingGroup
                );
                return;
            }
            if (data.items.length > 0 && this.orderDeliveryGroup) {
                //update the focusItemId to the first item in the newly fetched items.
                if (this._orderItemIds?.length > 0) {
                    this._focusOrderItemId = data.items?.[0]?.orderItemSummaryId.slice(0, 15);
                }
                //update the orderDeliveryGroup items and nextPageToken
                this._orderDeliveryGroup = processOrderItemData(
                    this._orderDeliveryGroup || this.orderDeliveryGroup,
                    formatOrderItems(data.items, this.productFieldMapping, this.showTotal),
                    data.nextPageToken
                );

                //update the orderSummaryItemsIds which will trigger the adjustments data fetch
                this._orderItemIds = this._orderItemIds.concat(orderItemIds(data.items));
            }
        } else if (error) {
            if (this.orderDeliveryGroup && this.prefixToShippingGroup) {
                this._orderDeliveryGroup = processOrderItemError(
                    error,
                    this._orderDeliveryGroup || this.orderDeliveryGroup,
                    this.prefixToShippingGroup
                );
            }
        }
    }

    @wire(OrderItemsAdjustmentsAdapter, {
        orderSummaryId: '$orderSummaryId',
        orderItemSummaryIds: '$_orderItemIds',
        effectiveAccountId: effectiveAccount.accountId,
    })
    handleOrderItemsAdjustmentsResponse({ data }: { data: OrderItemsAdjustmentsCollectionData }): void {
        if (data && this._orderDeliveryGroup) {
            this._orderSummaryItemAdjustments = processOrderItemAdjustmentsData(data, this.otherAdjustmentsLabel || '');
            this._orderDeliveryGroup.orderItems = this._orderDeliveryGroup.orderItems?.map((orderItem) => ({
                ...orderItem,
                adjustments: this._orderSummaryItemAdjustments?.[orderItem.orderItemSummaryId],
            }));
        }
    }

    handleShowMoreItems(
        event: CustomEvent<{ orderDeliveryGroupSummaryId: string; nextPageToken: string | undefined }>
    ): void {
        if (this.orderDeliveryGroupSummaryId === event.detail.orderDeliveryGroupSummaryId) {
            this._nextPageToken = event.detail.nextPageToken;
        }
    }
}
