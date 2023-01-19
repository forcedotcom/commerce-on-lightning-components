export const grossTaxFields = [
    {
        entity: 'OrderSummary',
        name: 'TotalProductAmountWithTax',
        label: 'Product Subtotal with Tax',
        type: 'Formula (Currency)',
    },
    {
        entity: 'OrderSummary',
        name: 'TotalAdjDistAmountWithTax',
        label: 'Order Adjustments with Tax',
        type: 'Formula (Currency)',
    },
    {
        entity: 'OrderSummary',
        name: 'TotalAdjDeliveryAmtWithTax',
        label: 'Shipping with Tax',
        type: 'Formula (Currency)',
    },
    {
        entity: 'OrderSummary',
        name: 'GrandTotalAmount',
        label: '',
        type: 'Formula (Currency)',
    },
    {
        entity: 'OrderSummary',
        name: 'TotalTaxAmount',
        label: 'Tax',
        type: 'Roll-Up Summary (SUM Order Product Summary)',
    },
    {
        entity: 'OrderAdjustmentAggregateSummary',
        name: 'TotalProductPromotionDistAmount',
        label: 'Order Level Promotions',
        type: 'Currency',
    },
];
