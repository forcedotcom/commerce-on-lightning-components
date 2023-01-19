import type { OrderItemSummaryCollectionData, OrderItemSummaryData } from 'commerce/orderApi';

export const orderItemData: OrderItemSummaryData = {
    adjustmentAggregates: {
        available: true,
        status: '',
        totalLinePromotionAmount: '5.0',
        totalPromotionDistAmount: '0.0',
    },
    fields: {
        'OrderItemSummary.ListPrice': {
            dataName: 'ListPrice',
            label: 'List Price',
            text: '24.99',
            type: 'currency',
        },
        'OrderItemSummary.AdjustedLineAmount': {
            dataName: 'AdjustedLineAmount',
            label: 'Adjusted Line Subtotal',
            text: '45.0',
            type: 'currency',
        },
        'OrderItemSummary.StockKeepingUnit': {
            dataName: 'StockKeepingUnit',
            label: 'Product Sku',
            text: '6010003',
            type: 'string',
        },
        'OrderItemSummary.TotalAmtWithTax': {
            dataName: 'TotalAmtWithTax',
            label: 'Total with Tax',
            text: '48.6',
            type: 'currency',
        },
        'OrderItemSummary.Quantity': {
            dataName: 'Quantity',
            label: 'Quantity',
            text: '2.0',
            type: 'double',
        },
        'OrderItemSummary.OrderSummaryId': {
            dataName: 'OrderSummaryId',
            label: 'Order Summary ID',
            text: '1Osxx0000004C92CAE',
            type: 'reference',
        },
        'OrderItemSummary.Id': {
            dataName: 'Id',
            label: 'Order Product Summary ID',
            text: '10uxx0000004EInAAM',
            type: 'id',
        },
        'OrderItemSummary.OrderDeliveryGroupSummaryId': {
            dataName: 'OrderDeliveryGroupSummaryId',
            label: 'Order Delivery Group Summary ID',
            text: '0agxx0000000001AAA',
            type: 'reference',
        },
        'OrderItemSummary.Product2Id': {
            dataName: 'Product2Id',
            label: 'Product ID',
            text: '01txx0000006i7NAAQ',
            type: 'reference',
        },
    },
    orderItemSummaryId: '10uxx0000004EInAAM',
    orderSummaryId: '1Osxx0000004C92CAE',
    product: {
        canViewProduct: true,
        errorCode: null,
        errorMessage: null,
        fields: {
            'Product2.Name': {
                dataName: 'Name',
                label: 'Name',
                text: 'GoBar Hi Protein, 2oz 12 Pack',
                type: 'STRING',
            },
            'Product2.StockKeepingUnit': {
                dataName: 'StockKeepingUnit',
                label: 'StockKeepingUnit',
                text: '6010003',
                type: 'STRING',
            },
            'Product2.IsActive': {
                dataName: 'IsActive',
                label: 'IsActive',
                text: 'true',
                type: 'BOOLEAN',
            },
        },
        media: {
            alternateText: 'GoBar Cranberry Hi Protein, 2oz - 6 pack',
            contentVersionId: null,
            id: '2pmxx0000000085AAA',
            mediaType: null,
            sortOrder: 0,
            thumbnailUrl: null,
            title: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpine-energy-gobar-cranberryjpg',
            url: 'https://s3.amazonaws.com/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-energy-goBAR-cranberry.jpg',
        },
        productAttributes: null,
        productId: '01txx0000006i7NAAQ',
    },
};

export const orderItemSummariesResponse: OrderItemSummaryCollectionData = {
    currentPageToken: 'eyJzIjoiSWRBc2MiLCJwIjoxLCJvIjowfQ==',
    currentPageUrl:
        '/services/data/v55.0/commerce/webstores/0ZExx00000000Uf/order-summaries/1Osxx0000004C92/items?effectiveAccountId=001xx000003GYh5&fields=OrderItemSummary.Id%2COrderItemSummary.OrderSummaryId%2COrderItemSummary.Product2Id%2CProduct2.Id%2CProduct2.Name%2CProduct2.StockKeepingUnit%2COrderItemSummary.StockKeepingUnit%2COrderItemSummary.Quantity%2COrderItemSummary.TotalAmtWithTax%2COrderItemSummary.AdjustedLineAmount%2COrderItemSummary.ListPrice%2CProduct2.IsActive%2COrderItemSummary.OrderDeliveryGroupSummaryId&orderDeliveryGroupSummaryId=0agxx0000000001&page=eyJzIjoiSWRBc2MiLCJwIjoxLCJvIjowfQ%3D%3D',
    items: [{ ...orderItemData, product: { ...orderItemData.product, productId: 'differentfrombefore' } }],
    nextPageToken: '123456',
};

const newOrderItemData = Object.assign({}, orderItemData, { orderItemSummaryId: '123' });

export const anotherOrderItemSummariesResponse: OrderItemSummaryCollectionData = {
    currentPageToken: 'eyJzIjoiSWRBc2MiLCJwIjoxLCJvIjowfQ==',
    currentPageUrl:
        '/services/data/v55.0/commerce/webstores/0ZExx00000000Uf/order-summaries/1Osxx0000004C92/items?effectiveAccountId=001xx000003GYh5&fields=OrderItemSummary.Id%2COrderItemSummary.OrderSummaryId%2COrderItemSummary.Product2Id%2CProduct2.Id%2CProduct2.Name%2CProduct2.StockKeepingUnit%2COrderItemSummary.StockKeepingUnit%2COrderItemSummary.Quantity%2COrderItemSummary.TotalAmtWithTax%2COrderItemSummary.AdjustedLineAmount%2COrderItemSummary.ListPrice%2CProduct2.IsActive%2COrderItemSummary.OrderDeliveryGroupSummaryId&orderDeliveryGroupSummaryId=0agxx0000000001&page=eyJzIjoiSWRBc2MiLCJwIjoxLCJvIjowfQ%3D%3D',
    items: [newOrderItemData],
    nextPageToken: '1234567',
};
