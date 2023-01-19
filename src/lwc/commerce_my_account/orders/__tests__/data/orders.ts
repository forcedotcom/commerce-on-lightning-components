import type { OrderData } from '../../types';

export const mockOrders: OrderData[] = [
    {
        id: '1Osxx0000006i45AAA',
        currencyCode: 'USD',
        orderNumber: 'TQETT-R3IQ2-6DHXG-ZZ6PC',
        fields: [
            {
                name: 'Order Number',
                value: '12345',
                type: 'STRING',
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
        ],
    },
    {
        id: '1Osxx0000006i45AAB',
        currencyCode: 'USD',
        orderNumber: 'TQETT-R3IQ2-6DHXG-ZZ6PC',
        fields: [
            {
                name: 'Order Number',
                value: '12345',
                type: 'STRING',
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
        ],
    },
];
