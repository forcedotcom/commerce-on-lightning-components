import TotalProductAmount from '@salesforce/label/udd_OrderSummary.TotalProductAmount';
import TotalAdjustedDeliveryAmount from '@salesforce/label/udd_OrderSummary.TotalAdjustedDeliveryAmount';
import TotalTaxAmount from '@salesforce/label/udd_OrderSummary.TotalTaxAmount';
import GrandTotalAmount from '@salesforce/label/udd_OrderSummary.GrandTotalAmount';

import TotalProductAmountWithTax from '@salesforce/label/udd_OrderSummary.TotalProductAmountWithTax';
import TotalAdjDeliveryAmtWithTax from '@salesforce/label/udd_OrderSummary.TotalAdjDeliveryAmtWithTax';
import TotalProductPromotionDistAmount from '@salesforce/label/Adjustment_Aggregate_Fields.TotalProductPromotionDistAmount';
import TotalProductPromotionAmount from '@salesforce/label/Adjustment_Aggregate_Fields.TotalProductPromotionAmount';

export {
    /**
     * Label for Order Summary TotalProductAmount
     * Label text - Product Subtotal
     *
     * @type {string}
     */
    TotalProductAmount,
    /**
     * Label for Order Summary TotalAdjustedDeliveryAmount
     * Label text - Shipping
     *
     * @type {string}
     */
    TotalAdjustedDeliveryAmount,
    /**
     * Label for Order Summary TotalTaxAmount
     * Label text - Tax
     *
     * @type {string}
     */
    TotalTaxAmount,
    /**
     * Label for Order Summary GrandTotalAmount
     * Label text - Total
     *
     * @type {string}
     */
    GrandTotalAmount,
    /**
     * Label for Order Summary TotalProductAmountWithTax
     * Label text - Product Subtotal with Tax
     *
     * @type {string}
     */
    TotalProductAmountWithTax,
    /**
     * Label for Order Summary TotalAdjDeliveryAmountWithTax
     * Label text - Shipping with Tax
     *
     * @type {string}
     */
    TotalAdjDeliveryAmtWithTax,
    /**
     * Label for Order Adjustment Aggregate Summary TotalProductPromotionDistAmount
     * Label text - Order Level Promotions
     *
     * @type {string}
     */
    TotalProductPromotionDistAmount,
    /**
     * Label for Order Adjustment Aggregate Summary TotalProductPromotionAmount
     * Label text - Total Promotions
     *
     * @type {string}
     */
    TotalProductPromotionAmount,
};
