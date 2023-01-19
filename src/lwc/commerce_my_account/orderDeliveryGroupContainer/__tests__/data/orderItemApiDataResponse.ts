export const orderItemData = [
    {
        adjustmentAggregates: {
            available: true,
            status: 'Submitted',
            totalLinePromotionAmount: '123.0',
            totalPromotionDistAmount: '0.0',
        },
        fields: {
            'OrderItemSummary.Id': {
                dataName: 'Id',
                label: 'Order Product Summary ID',
                text: '10uxx0000004EInAAM',
                type: 'id',
            },
            'OrderItemSummary.OrderSummaryId': {
                dataName: 'OrderSummaryId',
                label: 'Order Summary ID',
                text: '1Osxx0000004C92CAE',
                type: 'reference',
            },
            'OrderItemSummary.Tax': {
                dataName: 'Tax',
                label: 'Tax for the order item',
                text: '1234',
                type: 'number',
            },
            'OrderItemSummary.AdjustedLineAmount': {
                dataName: 'AdjustedLineAmount',
                label: 'Total',
                text: '10.79',
                type: 'currency',
            },
        },
        orderItemSummaryId: '10uxx0000004EInAAM',
        orderSummaryId: '1Osxx0000004C92CAE',
        product: {
            canViewProduct: true,
            errorCode: null,
            errorMessage: null,
            fields: {
                'Product2.IsActive': {
                    dataName: 'abc',
                    label: 'isactive',
                    text: 'true',
                    type: 'STRING',
                },
                'Product2.Name': {
                    dataName: 'Name',
                    label: 'Product Name',
                    text: 'GenWatt Diesel 1000kW',
                    type: 'STRING',
                },
                'Product2.SKU': {
                    dataName: 'SKU',
                    label: 'SKU',
                    text: '12345',
                    type: 'STRING',
                },
            },
            media: {
                alternateText: '',
                contentVersionId: null,
                id: null,
                mediaType: null,
                sortOrder: 0,
                thumbnailUrl: null,
                title: 'image',
                url: '/img/b2b/default-product-image.svg',
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
            productId: '01txx0000006iLwAAI',
        },
    },
];
