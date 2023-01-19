import { LightningElement, api } from 'lwc';
import type { TextDisplayInfo } from 'commerce_my_account/orderItemInfo';
import type { OrderItem, OrderDeliveryGroup } from 'commerce_my_account/orderDeliveryGroupContainer';
import type { Field } from 'commerce_my_account/itemFields';
import type { TransformedShippingField } from './types';
import { transformShippingFields } from './transformShippingFields';
import ORDER_LABELS from './labels';

/**
 * @fires OrderDeliveryGroupDisplay#orderdeliverygroupshowmoreitems
 */
export default class OrderDeliveryGroupDisplay extends LightningElement {
    /**
     * An event fired when "show more" button is clicked triggering a fetch for more order items in the order delivery group.
     *
     * Properties:
     *   - Bubbles: true
     *   - Cancelable: false
     *   - Composed: true
     *
     * @event OrderDeliveryGroupDisplay#orderdeliverygroupshowmoreitems
     * @type {CustomEvent}
     *
     * @property {string} detail.orderDeliveryGroupSummaryId
     * The id of the orderDeliveryGroup that is currently being displayed in which to fetch more items..
     * @property {string} detail.nextPageToken
     *   The token specifying the next set of items for this orderDeliveryGroup. .
     *
     * @export
     */

    static renderMode = 'light';
    /**
     * The ISO 4217 currency code for the currency fields
     */
    @api
    currencyCode: string | undefined;

    /**
     * Gets or sets the unique id of the first new item added to the list that is given focus when it is initially displayed
     */
    @api
    initialFocusedItemId: string | undefined;

    /**
     * Whether there are multiple orderDeliveryGroups (to determine whether accordion is collapsed by default or expanded)
     */
    @api
    isMultipleOrderDeliveryGroups = false;

    /**
     * @description Representation of the orderDeliveryGroup
     */
    @api
    orderDeliveryGroup: OrderDeliveryGroup | undefined;

    /**
     * The label which needs to be displayed if buyer isn't entitled to buy a product. Example : (No More Available)
     */
    @api
    productUnavailableMessage: string | undefined;

    /**
     * Whether to show product image
     */
    @api
    showProductImage = false;

    /**
     * @description text for show more button
     */
    @api
    showMoreProductLabel: string | undefined;

    /**
     * Whether to show the total for a product
     */
    @api
    showTotal = false;

    /**
     * Contains style information for the total field (shown when show total is true)
     */
    @api
    textDisplayInfo: TextDisplayInfo | undefined;

    /**
     * Total Price Text Color
     */
    @api
    totalPriceTextColor: string | undefined;

    _lastFocusedItemId: string | undefined;

    renderedCallback(): void {
        if (Boolean(this.initialFocusedItemId?.length) && this.initialFocusedItemId !== this._lastFocusedItemId) {
            const element: HTMLElement | null = this.querySelector(`[item-id='${this.initialFocusedItemId}']`);
            if (element) {
                element.focus();
                this._lastFocusedItemId = this.initialFocusedItemId;
            }
        }
    }

    /**
     * Whether there is an orderDelivery Group to be displayed
     */
    get _hasOrderDeliveryGroup(): boolean {
        return Boolean(this.orderDeliveryGroup);
    }

    /**
     * Whether there is an error message
     */
    get _hasError(): boolean {
        return Boolean(this.orderDeliveryGroup?.orderItemsErrorMessage?.length);
    }

    /**
     * Whether there are orderItems to be displayed.
     */
    get _hasItems(): boolean {
        return Boolean(this.orderDeliveryGroup?.orderItems?.length);
    }

    /**
     * Gets orderItems list.
     */
    get _orderItems(): OrderItem[] {
        return <OrderItem[]>this.orderDeliveryGroup?.orderItems;
    }

    /**
     * Gets whether the items list state is indeterminate (e.g. in the process of being determined).
     */
    get _isItemListIndeterminate(): boolean {
        return !this._hasError && !Array.isArray(this.orderDeliveryGroup?.orderItems);
    }

    /**
     * Gets the required i18n labels
     */
    get _labels(): Record<string, string> {
        return ORDER_LABELS;
    }

    /**
     * Whether to show the order item fields
     */
    get _showShippingFields(): boolean {
        return Boolean(this.orderDeliveryGroup?.shippingFields?.length);
    }

    /**
     * Get the ordered sequence of shipping Field for display.
     */
    get _transformedShippingFields(): TransformedShippingField[] {
        return transformShippingFields(<Field[]>this.orderDeliveryGroup?.shippingFields);
    }

    /**
     * Fires an event to show more items on page
     */
    handleShowMoreItems(): void {
        this.dispatchEvent(
            new CustomEvent('orderdeliverygroupdisplayshowmoreitems', {
                bubbles: true,
                composed: true,
                detail: {
                    orderDeliveryGroupSummaryId: this.orderDeliveryGroup?.orderDeliveryGroupSummaryId,
                    nextPageToken: this.orderDeliveryGroup?.orderItemNextPageToken,
                },
            })
        );
    }
}
