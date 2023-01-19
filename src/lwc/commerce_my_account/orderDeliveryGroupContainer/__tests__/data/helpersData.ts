// raw response from data fetch to orderItemSummaries
export const OrderItemSummariesResponse = {
    currentPageToken: 'eyJzIjoiSWRBc2MiLCJwIjoxLCJvIjowfQ==',
    currentPageUrl:
        '/services/data/v55.0/commerce/webstores/0ZExx00000000Uf/order-summaries/1Osxx0000004CDs/items?effectiveAccountId=001xx000003GYh5&fields=OrderItemSummary.Id%2COrderItemSummary.OrderSummaryId%2COrderItemSummary.Product2Id%2CProduct2.Id%2CProduct2.Name%2CProduct2.StockKeepingUnit%2COrderItemSummary.StockKeepingUnit%2COrderItemSummary.Quantity%2COrderItemSummary.TotalAmtWithTax%2COrderItemSummary.AdjustedLineAmount%2COrderItemSummary.ListPrice%2CProduct2.IsActive%2COrderItemSummary.OrderDeliveryGroupSummaryId&orderDeliveryGroupSummaryId=0agxx000000004r&page=eyJzIjoiSWRBc2MiLCJwIjoxLCJvIjowfQ%3D%3D',
    items: [
        {
            adjustmentAggregates: {
                available: true,
                status: 'null',
                totalLinePromotionAmount: '0.0',
                totalPromotionDistAmount: '0.0',
            },
            fields: {
                'OrderItemSummary.ListPrice': {
                    dataName: 'ListPrice',
                    dataType: 'xsd:double',
                    label: 'List Price',
                    text: '9.99',
                    type: 'currency',
                },
                'OrderItemSummary.AdjustedLineAmount': {
                    dataName: 'AdjustedLineAmount',
                    dataType: 'xsd:double',
                    label: 'Adjusted Line Subtotal',
                    text: '9.99',
                    type: 'currency',
                },
                'OrderItemSummary.StockKeepingUnit': {
                    dataName: 'StockKeepingUnit',
                    dataType: 'xsd:string',
                    label: 'Product Sku',
                    text: '12345',
                    type: 'string',
                },
                'OrderItemSummary.TotalAmtWithTax': {
                    dataName: 'TotalAmtWithTax',
                    dataType: 'xsd:double',
                    label: 'Total with Tax',
                    text: '10.79',
                    type: 'currency',
                },
                'OrderItemSummary.Quantity': {
                    dataName: 'Quantity',
                    dataType: 'xsd:double',
                    label: 'Quantity',
                    text: '1.0',
                    type: 'double',
                },
                'OrderItemSummary.OrderSummaryId': {
                    dataName: 'OrderSummaryId',
                    dataType: 'tns:ID',
                    label: 'Order Summary ID',
                    text: '1Osxx0000004CDsCAM',
                    type: 'reference',
                },
                'OrderItemSummary.Id': {
                    dataName: 'Id',
                    dataType: 'tns:ID',
                    label: 'Order Product Summary ID',
                    text: '10uxx0000004ENdAAM',
                    type: 'id',
                },
                'OrderItemSummary.OrderDeliveryGroupSummaryId': {
                    dataName: 'OrderDeliveryGroupSummaryId',
                    dataType: 'tns:ID',
                    label: 'Order Delivery Group Summary ID',
                    text: '0agxx000000004rAAA',
                    type: 'reference',
                },
                'OrderItemSummary.Product2Id': {
                    dataName: 'Product2Id',
                    dataType: 'tns:ID',
                    label: 'Product ID',
                    text: '01txx0000006iDlAAI',
                    type: 'reference',
                },
            },
            orderItemSummaryId: '10uxx0000004ENdAAM',
            orderSummaryId: '1Osxx0000004CDsCAM',
            product: {
                canViewProduct: true,
                errorCode: null,
                errorMessage: null,
                fields: {
                    'Product2.Name': {
                        dataName: 'Name',
                        dataType: 'STANDARD',
                        label: 'Name',
                        text: 'Shirt',
                        type: 'STRING',
                    },
                    'Product2.StockKeepingUnit': {
                        dataName: 'StockKeepingUnit',
                        dataType: 'STANDARD',
                        label: 'StockKeepingUnit',
                        text: '12345',
                        type: 'STRING',
                    },
                    'Product2.IsActive': {
                        dataName: 'IsActive',
                        dataType: 'STANDARD',
                        label: 'IsActive',
                        text: 'true',
                        type: 'BOOLEAN',
                    },
                },
                media: {
                    alternateText: 'Alpine Energy CO2 Cartridge for Smart Dispenser - 24 Pack',
                    contentVersionId: null,
                    id: '2pmxx000000003FAAQ',
                    mediaType: null,
                    sortOrder: 1,
                    thumbnailUrl: null,
                    title: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpineenergyproductco2-cartridgejpg',
                    url: 'https://s3.amazonaws.com/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine_energy_product_co2-cartridge.jpg',
                },
                productAttributes: {
                    apiName: 'Color_of_shirt',
                    attributes: [
                        {
                            apiName: 'Color__c',
                            label: 'Color',
                            sequence: 0,
                            value: 'red',
                        },
                    ],
                    label: 'Color of shirt',
                },
                productId: '01txx0000006iDlAAI',
            },
        },
    ],
    nextPageToken: 'eyJzIjoiSWRBc2MiLCJwIjoxLCJvIjoxfQ==',
    nextPageUrl:
        '/services/data/v55.0/commerce/webstores/0ZExx00000000Uf/order-summaries/1Osxx0000004CDs/items?effectiveAccountId=001xx000003GYh5&fields=OrderItemSummary.Id%2COrderItemSummary.OrderSummaryId%2COrderItemSummary.Product2Id%2CProduct2.Id%2CProduct2.Name%2CProduct2.StockKeepingUnit%2COrderItemSummary.StockKeepingUnit%2COrderItemSummary.Quantity%2COrderItemSummary.TotalAmtWithTax%2COrderItemSummary.AdjustedLineAmount%2COrderItemSummary.ListPrice%2CProduct2.IsActive%2COrderItemSummary.OrderDeliveryGroupSummaryId&orderDeliveryGroupSummaryId=0agxx000000004r&page=eyJzIjoiSWRBc2MiLCJwIjoxLCJvIjoxfQ%3D%3D',
    previousPageToken: null,
    previousPageUrl: null,
};

export const updatedItemsIds = [
    {
        orderItemSummaryId: '10uxx0000004ENdAAM',
    },
];

//entity field name format ex entity OrderItemSummary, field name StockKeepingUnit
export const productFieldNames = [
    'OrderItemSummary.StockKeepingUnit',
    'OrderItemSummary.Quantity',
    'OrderItemSummary.TotalAmtWithTax',
    'OrderItemSummary.AdjustedLineAmount',
    'OrderItemSummary.ListPrice',
    'Product2.IsActive',
    'OrderItemSummary.OrderDeliveryGroupSummaryId',
];

export const formattedItems = [
    {
        product: {
            canViewProduct: true,
            errorCode: null,
            errorMessage: null,
            fields: [
                {
                    dataName: 'StockKeepingUnit',
                    dataType: 'xsd:string',
                    label: 'Product Sku',
                    text: '12345',
                    type: 'string',
                },
                {
                    dataName: 'Quantity',
                    dataType: 'xsd:double',
                    label: 'Quantity',
                    text: '1.0',
                    type: 'double',
                },
                {
                    dataName: 'TotalAmtWithTax',
                    dataType: 'xsd:double',
                    label: 'Total with Tax',
                    text: '10.79',
                    type: 'currency',
                },
                {
                    dataName: 'AdjustedLineAmount',
                    dataType: 'xsd:double',
                    label: 'Adjusted Line Subtotal',
                    text: '9.99',
                    type: 'currency',
                },
                {
                    dataName: 'ListPrice',
                    dataType: 'xsd:double',
                    label: 'List Price',
                    text: '9.99',
                    type: 'currency',
                },
            ],
            media: {
                alternateText: 'Alpine Energy CO2 Cartridge for Smart Dispenser - 24 Pack',
                contentVersionId: null,
                id: '2pmxx000000003FAAQ',
                mediaType: null,
                sortOrder: 1,
                thumbnailUrl: null,
                title: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpineenergyproductco2-cartridgejpg',
                url: 'https://s3.amazonaws.com/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine_energy_product_co2-cartridge.jpg',
            },
            productAttributes: {
                apiName: 'Color_of_shirt',
                attributes: [
                    {
                        apiName: 'Color__c',
                        label: 'Color',
                        sequence: 0,
                        value: 'red',
                    },
                ],
                label: 'Color of shirt',
            },
            productId: '01txx0000006iDlAAI',
            orderItemSummaryId: '10uxx0000004ENdAAM',
            name: 'Shirt',
        },
    },
];

export const transformAdjustmentFieldsForDisplayInputData = [
    {
        amount: '-10.0',
        basisReferenceDisplayName: null,
        currencyIsoCode: 'USD',
        displayName: 'DiSCOUNT!!!!',
        type: 'Promotion',
    },
];

export const transformAdjustmentFieldsForDisplayOutputData = [
    {
        amount: '-10.0',
        currencyIsoCode: 'USD',
        displayName: 'DiSCOUNT!!!!',
        type: 'Promotion',
        name: 'DiSCOUNT!!!!',
        id: 0,
        discountAmount: '-10.0',
    },
];
