import type { OrderItem } from 'commerce_my_account/orderDeliveryGroupContainer';
export const orderItems: OrderItem[] = [
    {
        fields: [
            {
                dataName: 'ListPrice',
                label: 'List Price',
                text: '24.99',
                type: 'currency',
            },
            {
                dataName: 'AdjustedLineAmount',
                label: 'Adjusted Line Subtotal',
                text: '45.0',
                type: 'currency',
            },
        ],
        orderItemSummaryId: '10uxx0000004EIn',
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
        isValid: true,
        productId: '01txx0000006i7NAAQ',
        name: 'GoBar Hi Protein, 2oz 12 Pack',
    },
];
