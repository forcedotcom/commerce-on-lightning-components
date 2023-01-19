import type { OrderDeliveryGroup } from 'commerce_my_account/orderDeliveryGroupContainer';
import { LightningElement, api } from 'lwc';
import { orderItems, shippingFieldsData, defaultItemFields, defaultShippingFields } from './data';
import type { TextDisplayInfo } from 'commerce_my_account/orderItemInfo';
import { getFieldsIfDefined } from './helpers';
import { createStyleString } from 'community_styling/inlineStyles';

export default class OrderProductsDesignSubstitute extends LightningElement {
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
     * @description Prefix to the shipping address of the orderDeliveryGroup for example (Ship To)
     */
    @api
    prefixToShippingGroup = '';

    /**
     * @description The message to display incase product is not available
     */
    @api
    productUnavailableMessage: string | undefined;

    /**
     * @description  The unparsed JSON string of the product field mapping attribute
     */
    @api
    productFieldMapping: string | undefined;

    /**
     * @description  The unparsed JSON string of the OrderDeliveryGroupSummary field mapping attribute
     */
    @api
    shippingGroupFieldMapping: string | undefined;

    /**
     * @description Whether to show product images
     */
    @api showProductImage = false;

    /**
     * @description Whether to show the  adjustmented line subtotal field
     */
    @api showTotal = false;

    /**
     * @description Text color for the total price
     */
    @api
    totalPriceTextColor: string | undefined;

    /**
     * @description heading tag and text style for the  adjusted line subtotal amount - this is fed to the dxp text block
     */
    @api
    textDisplayInfo: TextDisplayInfo | undefined;

    /**
     * Custom styling for order products
     */
    get orderProductsCustomCssStyles(): string {
        const customStylingProperties = {
            '--com-c-my-account-order-products-details-discount-amount-color': this.adjustmentsAmountTextColor,
            '--com-c-my-account-order-products-total-price-text-color': this.totalPriceTextColor,
        };
        return createStyleString(customStylingProperties);
    }

    get orderDeliveryGroupData(): OrderDeliveryGroup {
        const shippingFields = this.shippingGroupFieldMapping
            ? getFieldsIfDefined(JSON.parse(this.shippingGroupFieldMapping), shippingFieldsData)
            : defaultShippingFields;

        const TOTAL_AMOUNT_FIELD = 'AdjustedLineAmount';
        const totals = defaultItemFields.map((fields) => fields.find((field) => field.dataName === TOTAL_AMOUNT_FIELD));

        const orderItemData = orderItems.map((item, index) => {
            const fields = this.productFieldMapping
                ? getFieldsIfDefined(JSON.parse(this.productFieldMapping), item.fields)
                : defaultItemFields[index];

            return {
                ...item,
                fields,
                totalPrice: Number(totals[index]?.text),
            };
        });

        return {
            orderDeliveryGroupSummaryId: '123',
            groupTitle: this.prefixToShippingGroup + ' 121 Spear St, San Francisco,  CA  US, 94105',
            orderItemsHasNextPage: false,
            shippingFields: shippingFields,
            orderItems: orderItemData,
        };
    }
}
