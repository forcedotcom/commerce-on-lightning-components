import { LightningElement, api } from 'lwc';
import type { TextDisplayInfo } from 'commerce_my_account/orderItemInfo';
import type { OrderDeliveryGroup } from 'commerce_my_account/orderDeliveryGroupContainer';
import type { FieldMapping } from 'commerce_builder/orderProducts';
export default class OrderDeliveryGroups extends LightningElement {
    static renderMode = 'light';
    /**
     * @description The record Id for the orderSummaryDetails page
     */
    @api
    orderSummaryId: string | undefined;

    /**
     * @description Representation of the all the orderDeliveryGroups
     */
    @api
    orderDeliveryGroups: OrderDeliveryGroup[] | undefined;

    /**
     * @description Currency Code to be used on the Order Summary Detail page
     */

    @api
    currencyCode: string | undefined;

    /**
     * @description string containing the error message to be displayed for the orderDeliveryGroup level error
     */
    @api errorMessage: string | undefined;

    /**
     * @description An array of strings used to specify which product fields to fetch
     */
    @api
    fieldNames: string[] | undefined;

    /**
     * @description  The product field mapping attribute
     */
    @api
    productFieldMapping: FieldMapping[] | undefined;

    /**
     * @description Whether there are multiple orderDeliveryGroups assosciated with this orderSummaryId
     */
    @api
    isMultipleGroups = false;

    /**
     * @description label to show on adjustments with type `other` in the popup component.
     */
    @api
    otherAdjustmentsLabel: string | undefined;

    /**
     * @description text for show more button
     */
    @api showMoreProductLabel: string | undefined;

    /**
     * @description  The number of products to show before load more is seen (if more products are available)
     */
    @api pageSize: string | undefined;

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
     * @description Whether to show product images
     */
    @api showProductImage = false;

    /**
     * @description Whether to show the  adjustmented line subtotal field
     */
    @api showTotal = false;

    /**
     * @description heading tag and text style for the  adjusted line subtotal amount - this is fed to the dxp text block
     */
    @api
    textDisplayInfo: TextDisplayInfo | undefined;

    /**
     * Total Price Text Color
     */
    @api
    totalPriceTextColor: string | undefined;

    /**
     * Whether or not there is an orderDelivery Group to be displayed
     */
    get _hasOrderDeliveryGroup(): boolean {
        return Boolean(this.orderDeliveryGroups?.length);
    }
    /**
     * If multiple OrderDeliveryGroups collapse lists by default
     * If single orderDeliveryGroup expand list by default
     */
    get _activeSectionName(): string {
        return this.isMultipleGroups ? '' : 'groupHeader';
    }
}
