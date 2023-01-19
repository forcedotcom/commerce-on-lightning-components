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
];
