import type { OrderData } from 'commerce/orderApi';

export const detailsData: OrderData = {
    orderSummaryId: '1Osxx0000004DjQCAU',
    ownerId: '',
    adjustmentAggregates: {
        available: null,
        status: null,
        totalProductPromotionDistAmount: null,
        totalProductPromotionLineAmount: null,
        totalProductPromotionTotalAmount: null,
        totalDeliveryPromotionDistAmount: null,
        totalDeliveryPromotionLineAmount: null,
        totalDeliveryPromotionTotalAmount: null,
    },
    status: '',
    orderNumber: '',
    orderedDate: '',
    createdDate: '',
    totalAmount: '',
    fields: {
        AccountId: {
            label: 'Account ID',
            text: '001xx000003GZeFAAW',
            type: 'reference',
        },
        OrderedDate: {
            label: 'Ordered Date',
            text: '2022-06-23T16:16:23.000Z',
            type: 'datetime',
        },
        OwnerId: {
            label: 'Owner ID',
            text: '005xx000001XBSrAAO',
            type: 'reference',
        },
        Custom_Geo__c: {
            label: 'Custom Geo',
            text: 'API geolocation [77.4235 41.9000]',
            type: 'location',
        },
        CurrencyIsoCode: {
            label: 'CurrencyIsoCode',
            text: 'INR',
            type: 'currency',
        },
    },
};
