import type { OrderDeliveryGroup } from 'commerce_my_account/orderDeliveryGroupContainer';
import type { Field } from 'commerce_my_account/itemFields';
export const fieldsDataWithoutName: Field[] = [
    {
        dataName: '',
        text: 'FedEx',
        type: 'STRING',
        label: '',
    },
    {
        dataName: '',
        text: '1000',
        type: 'CURRENCY',
        label: '',
    },
];

export const formattedGroup: OrderDeliveryGroup = {
    groupTitle: 'Ship To: 415 Mission Street, San Francisco, CA 94105 US',
    orderItemsHasNextPage: false,
    shippingFields: [
        {
            dataName: '',
            label: 'Name',
            type: 'string',
            text: 'Order Delivery Method1',
        },
    ],
    orderItems: [
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
            orderItemSummaryId: 'abc',
        },
    ],
    orderDeliveryGroupSummaryId: '0agxx0000000001AAA',
};

export const formattedGroupWithoutShippingFields: OrderDeliveryGroup = Object.assign({}, formattedGroup, {
    shippingFields: undefined,
});

export const formattedGroupWithShippingFieldsWithoutDataName: OrderDeliveryGroup = Object.assign({}, formattedGroup, {
    shippingFields: fieldsDataWithoutName,
});

export const formattedGroupWithoutItems: OrderDeliveryGroup = Object.assign({}, formattedGroup, {
    orderItems: undefined,
});

export const formattedGroupWithError: OrderDeliveryGroup = Object.assign({}, formattedGroup, {
    orderItemsErrorMessage: 'error',
});

export const formattedGroupWithNextPage: OrderDeliveryGroup = Object.assign({}, formattedGroup, {
    orderItemsHasNextPage: true,
});
