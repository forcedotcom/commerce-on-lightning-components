import type { OrderCollectionData } from 'commerce/orderApi';

export const mockStoreAdapterResponseWithLocation: OrderCollectionData = {
    count: 1,
    currentPageToken: null,
    currentPageUrl:
        '/services/data/v57.0/commerce/webstores/0ZExx0000000001/order-summaries?effectiveAccountId=001xx000003GYih&fields=OrderNumber%2CStatus%2COrderedDate%2CTotalAmount%2CTotalTaxAmount%2CGrandTotalAmount%2CCurrencyIsocode&includeAdjustmentDetails=false&ownerScoped=true&pageSize=25&sortOrder=OrderedDateDesc',
    nextPageToken: null,
    nextPageUrl: null,
    orderSummaries: [
        {
            adjustmentAggregates: null,
            createdDate: '2022-08-29T13:22:32.000Z',
            currencyIsoCode: 'USD',
            fields: {
                Status: {
                    label: 'Status',
                    text: 'Created',
                    type: 'picklist',
                },
                OrderedDate: {
                    label: 'Ordered Date',
                    text: '2022-08-29T13:22:31.000Z',
                    type: 'datetime',
                },
                TotalTaxAmount: {
                    label: 'Tax',
                    text: '0.0',
                    type: 'currency',
                },
                OrderNumber: {
                    label: 'Order Summary Number',
                    text: 'TQETT-R3IQ2-6DHXG-ZZ6PC',
                    type: 'string',
                },
                TotalAmount: {
                    label: 'Pretax Subtotal',
                    text: '56.99',
                    type: 'currency',
                },
                GrandTotalAmount: {
                    label: 'Total',
                    text: '56.99',
                    type: 'currency',
                },
                BillingCity: {
                    label: 'City',
                    text: 'San Francisco',
                    type: 'string',
                },
                BillingCountry: {
                    label: 'Country',
                    text: 'US',
                    type: 'string',
                },
                BillingState: {
                    label: 'State/Province',
                    text: 'CA',
                    type: 'string',
                },
                BillingPostalCode: {
                    label: 'Zip',
                    text: '94105',
                    type: 'string',
                },
                BillingStreet: {
                    label: 'Address',
                    text: '415 Mission Street (Shipping)',
                    type: 'textarea',
                },
                BillingLatitude: {
                    label: 'Latitude',
                    text: '40.7128',
                    type: 'double',
                },
                BillingLongitude: {
                    label: 'Longitude',
                    text: '74.0060',
                    type: 'double',
                },
                Location: {
                    label: 'Location',
                    text: '[40.7128 74.0060]',
                    type: 'location',
                },
            },
            orderNumber: 'TQETT-R3IQ2-6DHXG-ZZ6PC',
            orderSummaryId: '1Osxx0000004CtoCAE',
            orderedDate: '2022-08-29T13:22:31.000Z',
            ownerId: '005xx000001X8efAAC',
            status: 'Created',
            totalAmount: '56.99',
        },
    ],
    previousPageToken: null,
    previousPageUrl: null,
    sortOrder: 'OrderedDateDesc',
};
