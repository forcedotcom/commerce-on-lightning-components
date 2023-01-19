import type { OrderCollectionData } from 'commerce/orderApi';

export const mockStoreAdapterResponseWithNextPageToken: OrderCollectionData = {
    count: 1,
    currentPageToken: null,
    currentPageUrl:
        '/services/data/v57.0/commerce/webstores/0ZExx0000000001/order-summaries?effectiveAccountId=001xx000003GYih&includeAdjustmentDetails=false&ownerScoped=true&pageSize=1&sortOrder=OrderedDateDesc',
    nextPageToken: 'eyJkIjoxNjY1NDkwODMwMDAwLCJpIjoiMU9zeHgwMDAwMDA0RERBQ0EyIiwicSI6Ik9yZGVyZWREYXRlRGVzYyJ9',
    nextPageUrl:
        '/services/data/v57.0/commerce/webstores/0ZExx0000000001/order-summaries?effectiveAccountId=001xx000003GYih&includeAdjustmentDetails=false&ownerScoped=true&pageSize=1&pageToken=eyJkIjoxNjY1NDkwODMwMDAwLCJpIjoiMU9zeHgwMDAwMDA0RERBQ0EyIiwicSI6Ik9yZGVyZWREYXRlRGVzYyJ9&sortOrder=OrderedDateDesc',
    orderSummaries: [
        {
            adjustmentAggregates: null,
            createdDate: '2022-10-11T12:20:31.000Z',
            currencyIsoCode: 'USD',
            fields: {},
            orderNumber: '7B36P-6RI5N-3EEHV-XSDA5',
            orderSummaryId: '1Osxx0000004DDACA2',
            orderedDate: '2022-10-11T12:20:30.000Z',
            ownerId: '005xx000001X8efAAC',
            status: 'Created',
            totalAmount: '67.49',
        },
    ],
    previousPageToken: null,
    previousPageUrl: null,
    sortOrder: 'OrderedDateDesc',
};
