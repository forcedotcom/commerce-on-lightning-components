export const orderSummaryFields = [
    {
        entity: 'OrderSummary',
        label: 'Ordered Date',
        name: 'OrderedDate',
        type: 'Date/Time',
    },
    {
        entity: 'OrderSummary',
        label: 'Account',
        name: 'AccountId',
        type: 'Lookup(Account)',
    },
    {
        entity: 'OrderSummary',
        label: 'Owner Name',
        name: 'OwnerId',
        type: 'Lookup(User,Group)',
    },
    {
        entity: 'OrderSummary',
        label: 'Billing Address',
        name: 'BillingAddress',
        type: 'Address',
    },
    {
        entity: 'OrderSummary',
        label: 'Status',
        name: 'Status',
        type: 'Picklist',
    },
    {
        entity: 'Order',
        label: 'OrderSummaryId',
        name: 'OrderSummaryId',
        type: 'Id',
    },
    {
        entity: 'OrderAdjustmentAggregateSummary',
        name: 'TotalProductPromotionDistAmount',
        label: 'Order Level Promotions',
        type: 'Currency',
    },
];
