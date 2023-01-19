import type { Field } from 'commerce_my_account/itemFields';
export const mockItemFields: Field[] = [
    {
        label: 'sku#',
        text: 'K002',
        type: 'STRING',
        dataName: 'ProductSKU',
    },
    {
        label: 'Status',
        text: 'in fulfillment',
        type: 'STRING',
        dataName: 'Status',
    },
    {
        label: 'price',
        text: '1024',
        type: 'CURRENCY',
        dataName: 'Amount',
    },
];

export const mockItemFieldsWithNoFieldName: Field[] = [
    {
        dataName: 'ghi',
        label: '',
        text: 'K002',
        type: 'STRING',
    },
    {
        dataName: 'def',
        text: 'K002',
        label: '',
        type: 'string',
    },
    {
        dataName: 'abc',
        text: `{
            "latitude": "23.45",
            "longitude": "34.67"
        }`,
        label: '',
        type: 'Geolocation',
    },
];

export const mockItemFieldsWithTotalLineAdj: Field[] = [
    {
        label: 'sku#',
        text: 'K002',
        type: 'STRING',
        dataName: 'ProductSKU',
    },
    {
        label: 'Status',
        text: 'in fulfillment',
        type: 'STRING',
        dataName: 'Status',
    },
    {
        label: 'price',
        text: '1024',
        type: 'CURRENCY',
        dataName: 'Amount',
    },
    {
        label: 'TotalLineAdjustmentAmount',
        text: '100',
        type: 'CURRENCY',
        dataName: 'TotalLineAdjustmentAmount',
    },
    {
        label: 'discount',
        text: '100',
        type: 'CURRENCY',
        dataName: 'LineAdjustmentSubtotal',
    },
];
