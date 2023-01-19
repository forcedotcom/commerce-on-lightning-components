import type { OrderDeliveryGroupCollectionData, EntityFields } from 'commerce/orderApiInternal';

const orderDeliveryGroupFields: EntityFields[] = [
    {
        'OrderDeliveryGroupSummary.Id': {
            dataName: 'Id',
            label: 'Order Delivery Group Summary ID',
            text: '0agxx000000004rAAA',
            type: 'id',
        },
        'OrderDeliveryGroupSummary.TotalAmount': {
            dataName: 'TotalAmount',
            label: 'Pretax Total',
            text: '11.99',
            type: 'currency',
        },

        'OrderDeliveryMethod.Name': {
            dataName: 'Name',
            label: 'Name',
            text: 'Order Delivery Method1',
            type: 'string',
        },
        'OrderDeliveryGroupSummary.DeliverToAddress': {
            dataName: 'DeliverToAddress',
            label: 'Shipping Address',
            text: 'API address [415 Mission Street (Shipping), San Francisco, CA, 94105, US, null, null, null, null, null]',
            type: 'address',
        },
    },
    {
        'OrderDeliveryGroupSummary.Id': {
            dataName: 'Id',
            label: 'Order Delivery Group Summary ID',
            text: '0000001',
            type: 'id',
        },
        'OrderDeliveryGroupSummary.TotalAmount': {
            dataName: 'TotalAmount',
            label: 'Pretax Total',
            text: '11.99',
            type: 'currency',
        },

        'OrderDeliveryMethod.Name': {
            dataName: 'Name',
            label: 'Name',
            text: 'Order Delivery Method1',
            type: 'string',
        },
        'OrderDeliveryGroupSummary.DeliverToAddress': {
            dataName: 'DeliverToAddress',
            label: 'Shipping Address',
            text: 'API address [415 Mission Street (Shipping), San Francisco, CA, 94105, US, null, null, null, null, null]',
            type: 'address',
        },
    },
];

export const orderDeliveryGroupDataResponse: OrderDeliveryGroupCollectionData = {
    orderDeliveryGroups: [
        {
            fields: orderDeliveryGroupFields[0],
        },
    ],
    currentPageToken: '123',
    currentPageUrl: 'abc',
};

export const multipleOrderDlieveryGroupsDataResponse: OrderDeliveryGroupCollectionData = {
    orderDeliveryGroups: [
        {
            fields: orderDeliveryGroupFields[0],
        },
        {
            fields: orderDeliveryGroupFields[1],
        },
    ],
    currentPageToken: '123',
    currentPageUrl: 'abc',
};
