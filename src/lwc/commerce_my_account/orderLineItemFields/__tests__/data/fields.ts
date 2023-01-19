import type { OrderField } from 'commerce_my_account/orders';
export const mockFields: OrderField[] = [
    {
        name: 'Order Number',
        value: '01oxx0000000001CAA',
        type: 'reference',
    },
    {
        name: 'Status',
        value: 'in fulfillment',
        type: 'STRING',
    },
    {
        name: 'price',
        value: '1000',
        type: 'CURRENCY',
    },
    {
        name: 'tax',
        value: '100',
        type: 'CURRENCY',
    },
    {
        name: 'total price',
        value: '1100',
        type: 'CURRENCY',
    },
    {
        name: 'order number',
        value: '1Osxx0000000001CAA',
        type: 'id',
    },
    {
        name: 'order number',
        value: '',
        type: 'id',
    },
];
