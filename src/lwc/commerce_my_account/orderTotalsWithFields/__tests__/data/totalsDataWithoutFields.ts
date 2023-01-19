import type { OrderData } from 'commerce/orderApi';

export const totalsDataWithoutFields: OrderData = {
    orderSummaryId: '1Osxx0000004DjQCAU',
    ownerId: '',
    adjustmentAggregates: {
        totalProductPromotionDistAmount: '-5.0',
        totalProductPromotionLineAmount: '-10.0',
        totalProductPromotionTotalAmount: '-15.0',
        totalDeliveryPromotionDistAmount: '-2.0',
        totalDeliveryPromotionLineAmount: '-3.0',
        totalDeliveryPromotionTotalAmount: '-5.0',
    },
    status: '',
    orderNumber: '',
    orderedDate: '',
    createdDate: '',
    totalAmount: '',
    fields: {},
};

export const totalsDataNoPromoWithoutFields: OrderData = {
    orderSummaryId: '1Osxx0000004DjQCAU',
    ownerId: '',
    adjustmentAggregates: {
        totalProductPromotionDistAmount: '0.0',
        totalProductPromotionLineAmount: '0.0',
        totalProductPromotionTotalAmount: '0.0',
        totalDeliveryPromotionDistAmount: '0.0',
        totalDeliveryPromotionLineAmount: '0.0',
        totalDeliveryPromotionTotalAmount: '0.0',
    },
    status: '',
    orderNumber: '',
    orderedDate: '',
    createdDate: '',
    totalAmount: '',
    fields: {},
};
