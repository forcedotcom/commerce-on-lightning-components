export const netTaxFields = [
    {
        entity: 'OrderSummary',
        name: 'TotalProductAmount',
        label: 'Product Subtotal',
        type: 'Currency',
    },
    {
        entity: 'OrderSummary',
        name: 'TotalAdjustedDeliveryAmount',
        label: 'Shipping',
        type: 'Currency',
    },
    {
        entity: 'OrderSummary',
        name: 'TotalTaxAmount',
        label: 'Tax',
        type: 'Currency',
    },
    {
        entity: 'OrderSummary',
        name: 'GrandTotalAmount',
        label: 'Total',
        type: 'Currency',
    },
    {
        entity: 'OrderAdjustmentAggregateSummary',
        name: 'TotalProductPromotionDistAmount',
        label: 'Order Level Promotions',
        type: 'Currency',
    },
];
