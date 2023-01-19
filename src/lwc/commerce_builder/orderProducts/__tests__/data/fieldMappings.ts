export const stringShippingAddressFieldMapping = JSON.stringify([
    {
        entity: 'OrderDeliveryMethod',
        name: 'Name',
        label: 'Name',
        type: 'Text(255)',
    },
    {
        entity: 'OrderDeliveryGroupSummary',
        name: 'TotalAmount',
        label: 'Pretax Total',
        type: 'Currency(16, 2)',
    },
    {
        entity: 'OrderDeliveryGroupSummary',
        name: 'EmailAddress',
        label: 'Email Address',
        type: 'Email',
    },
]);

export const parsedShippingAddressFieldMapping = [
    {
        entity: 'OrderDeliveryMethod',
        name: 'Name',
        label: 'Name',
        type: 'Text(255)',
    },
    {
        entity: 'OrderDeliveryGroupSummary',
        name: 'TotalAmount',
        label: 'Pretax Total',
        type: 'Currency(16, 2)',
    },
    {
        entity: 'OrderDeliveryGroupSummary',
        name: 'EmailAddress',
        label: 'Email Address',
        type: 'Email',
    },
];

export const stringProductFieldMapping = JSON.stringify([
    { entity: 'OrderItemSummary', name: 'StockKeepingUnit', label: 'Product Sku', type: 'Text(255)' },
    { entity: 'OrderItemSummary', name: 'Quantity', label: 'Quantity', type: 'Number(18, 0)' },
    { entity: 'OrderItemSummary', name: 'TotalAmtWithTax', label: 'Total with Tax', type: 'Formula (Currency)' },
    {
        entity: 'OrderItemSummary',
        name: 'AdjustedLineAmount',
        label: 'Adjusted Line Subtotal',
        type: 'Formula (Currency)',
    },
    { entity: 'OrderItemSummary', name: 'ListPrice', label: 'List Price', type: 'Currency(16, 2)' },
    {
        entity: 'OrderItemSummary',
        name: 'TotalLineAdjustmentAmount',
        label: 'Line Adjustments',
        type: 'Roll-Up Summary ( Order Product Adjustment Line Item Summary)',
    },
]);

export const groupFieldNames = [
    'OrderDeliveryMethod.Name',
    'OrderDeliveryGroupSummary.TotalAmount',
    'OrderDeliveryGroupSummary.EmailAddress',
    'OrderDeliveryGroupSummary.DeliverToPostalCode',
    'OrderDeliveryGroupSummary.DeliverToStreet',
    'OrderDeliveryGroupSummary.DeliverToState',
    'OrderDeliveryGroupSummary.DeliverToCountry',
    'OrderDeliveryGroupSummary.DeliverToCity',
    'OrderDeliveryGroupSummary.DeliverToLongitude',
    'OrderDeliveryGroupSummary.DeliverToLatitude',
    'OrderDeliveryGroupSummary.CurrencyIsoCode',
    'OrderDeliveryGroupSummary.DeliverToAddress',
];
export const fieldNames = [
    'OrderItemSummary.StockKeepingUnit',
    'OrderItemSummary.Quantity',
    'OrderItemSummary.TotalAmtWithTax',
    'OrderItemSummary.AdjustedLineAmount',
    'OrderItemSummary.ListPrice',
    'OrderItemSummary.TotalLineAdjustmentAmount',
    'Product2.IsActive',
    'OrderItemSummary.OrderDeliveryGroupSummaryId',
];
