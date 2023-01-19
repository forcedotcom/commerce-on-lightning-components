import { LightningElement, api, wire, track } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import currency from '@salesforce/i18n/currency';
import { OrderDeliveryGroupsAdapter } from 'commerce/orderApi';

import { getEntityFieldNames } from './helpers';
import { processODGData } from './processOrderDeliveryGroupsData';
import { processOrderDeliveryGroupsError } from './processOrderDeliveryGroupsError';
import { effectiveAccount } from 'commerce/effectiveAccountApi';

import type { LightningNavigationContext } from 'types/common';
import type { OrderDeliveryGroupCollectionData } from 'commerce/orderApi';
import type { TextDisplayInfo } from 'commerce_my_account/orderItemInfo';
import type { FieldMapping } from './types';
import type { OrderDeliveryGroup } from 'commerce_my_account/orderDeliveryGroupContainer';
import { genericErrorMessageLabel } from './labels';
import { getDefaultProductFields, getDefaultShippingFields } from './defaultOrderProductFields';

export type { FieldMapping } from './types';

const IS_ACTIVE_FIELD = 'Product2.IsActive';
const TOTAL_AMOUNT_FIELD = 'OrderItemSummary.AdjustedLineAmount';
const ORDER_DELIVERY_GROUP_ID_FIELD = 'OrderItemSummary.OrderDeliveryGroupSummaryId';
const DELIVER_TO_ADDRESS_FIELD = 'OrderDeliveryGroupSummary.DeliverToAddress';
const CURRENCY_FIELD = 'OrderDeliveryGroupSummary.CurrencyIsoCode';
export default class OrderProducts extends LightningElement {
    static renderMode = 'light';
    /**
     * @description The record Id for the orderSummaryDetails page
     */
    @api
    orderSummaryId: string | undefined;

    /**
     * @description Text color for the adjustment fields of orderSummaryItem
     */
    @api
    adjustmentsAmountTextColor: string | undefined;

    /**
     * @description Currency Code to be used on the Order Summary Detail page
     */
    _currencyCode: string | undefined;

    /**
     * @description The message in case of order delivery group api errors
     */
    _errorMessage = '';

    /**
     * @description Representation of the orderDeliveryGroup
     */
    @track
    _orderDeliveryGroups: OrderDeliveryGroup[] = [];

    /**
     * @description shipping fields we need the data for
     */
    _orderDeliveryGroupExtraFields = [CURRENCY_FIELD, DELIVER_TO_ADDRESS_FIELD];

    /**
     * @description label to show for other adjustments type on the adjustments Popup component
     */
    @api
    otherAdjustmentsLabel: string | undefined;

    /**
     * @description label to show more button
     */
    @api
    showMoreProductLabel: string | undefined;

    /**
     * @description Prefix to the shipping address of the orderDeliveryGroup for example (Ship To)
     */
    @api
    prefixToShippingGroup: string | undefined;

    /**
     * @description  The unparsed JSON string of the product field mapping attribute
     */
    @api
    productFieldMapping: string | undefined;

    /**
     * @description Text to show when a product is discontinued or the user is no longer entitled to it.
     */
    @api
    productUnavailableMessage: string | undefined;

    /**
     * @description product fields we need the data
     */
    _productExtraFields = [ORDER_DELIVERY_GROUP_ID_FIELD, IS_ACTIVE_FIELD];

    /**
     * @description  The number of products to show before load more is seen (if more products are available)
     */
    _pageSize = 15;

    /**
     * @description Whether to show the Line adjustments subtotal field
     */
    @api
    showTotal = false;

    /**
     * @description Whether to show the product images
     */
    @api
    showProductImage = false;

    /**
     * @description  The unparsed JSON string of the OrderDeliveryGroupSummary field mapping attribute
     */
    @api
    shippingGroupFieldMapping: string | undefined;

    /**
     * @description The header tag and text style for total price
     */
    @api
    textDisplayInfo: TextDisplayInfo | undefined;

    /**
     * @description Text color for the total price
     */
    @api
    totalPriceTextColor: string | undefined;

    /**
     * @description Whether there are multiple ODG
     */
    get isMultipleGroups(): boolean {
        return this._orderDeliveryGroups.length > 1;
    }

    /**
     * @description a flag that indicates whether the total field was already added to the fieldNames array
     */
    _showTotalFieldAddedFlag = false;

    /**
     * Custom styling for order products
     */
    get orderProductsCustomCssStyles(): string {
        return `
            --com-c-my-account-order-products-details-discount-amount-color: ${
                this.adjustmentsAmountTextColor || 'initial'
            };
            --com-c-my-account-order-products-total-price-text-color: ${this.totalPriceTextColor || 'initial'};
        `;
    }

    /**
     * @description  An array of strings used to specify which order delivery group fields to fetch
     **/
    get _groupFieldNames(): string[] {
        return getEntityFieldNames(this._shippingFieldMapping).concat(this._orderDeliveryGroupExtraFields);
    }

    /**
     * @description  An array of strings used to specify which order item fields to fetch
     *
     **/
    get _itemFieldNames(): string[] {
        if (this.showTotal && !this._showTotalFieldAddedFlag) {
            this._productExtraFields = this._productExtraFields.concat([TOTAL_AMOUNT_FIELD]);
            this._showTotalFieldAddedFlag = true;
        }
        return getEntityFieldNames(this._productFieldMapping).concat(this._productExtraFields);
    }
    /**
     * @description  An array of strings used to specify which order item fields to show
     **/
    get _productFieldMapping(): FieldMapping[] {
        return this.productFieldMapping ? JSON.parse(this.productFieldMapping) : getDefaultProductFields();
    }
    /**
     * @description  An array of strings used to specify which order delivery group fields to show
     **/
    get _shippingFieldMapping(): FieldMapping[] {
        return this.shippingGroupFieldMapping ? JSON.parse(this.shippingGroupFieldMapping) : getDefaultShippingFields();
    }

    @wire(OrderDeliveryGroupsAdapter, {
        orderSummaryId: '$orderSummaryId',
        fields: '$_groupFieldNames',
        effectiveAccountId: effectiveAccount.accountId,
    })
    handleOrderDeliveryGroupResponse({ data, error }: { data: OrderDeliveryGroupCollectionData; error: Error }): void {
        if (data) {
            //reset error message
            this._errorMessage = '';
            if (data.orderDeliveryGroups && this._shippingFieldMapping) {
                this._currencyCode = data.orderDeliveryGroups?.[0]?.fields?.currencyCode?.text ?? currency;
                this._orderDeliveryGroups = processODGData(
                    data.orderDeliveryGroups,
                    this._shippingFieldMapping,
                    this.prefixToShippingGroup || ''
                );
            } else {
                this._errorMessage = genericErrorMessageLabel;
            }
        } else if (error) {
            this._errorMessage = genericErrorMessageLabel;
            //reset odg state
            this._orderDeliveryGroups = processOrderDeliveryGroupsError(
                this._orderDeliveryGroups,
                this.prefixToShippingGroup || ''
            );
        }
    }

    @wire(NavigationContext)
    navContext!: LightningNavigationContext;

    /**
     * Navigates to the product detail page
     */
    handleProductDetailNavigation(event: CustomEvent<{ productId: string }>): void {
        navigate(this.navContext, {
            type: 'standard__recordPage',
            attributes: {
                objectApiName: 'Product2',
                recordId: event.detail.productId,
                actionName: 'view',
            },
        });
    }
}
