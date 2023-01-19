import type { OrderItem } from 'commerce_my_account/orderDeliveryGroupContainer';

export const ItemWithErrorMessage: OrderItem = {
    errorMessage: 'Falied To load delivery groups',
    isValid: false,
    media: {
        alternateText: null,
        contentVersionId: null,
        id: null,
        mediaType: null,
        sortOrder: 0,
        thumbnailUrl: null,
        title: null,
        url: null,
    },
    name: null,
    productId: '',
    orderItemSummaryId: '',
};

export const ItemWithNoField: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: 'Kitten Two',
    isValid: true,
    orderItemSummaryId: '',
    media: {
        alternateText: null,
        contentVersionId: null,
        id: '2pmxx0000000085AAA',
        mediaType: null,
        sortOrder: 0,
        thumbnailUrl: null,
        title: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpine-energy-gobar-cranberryjpg',
        url: 'https://s3.amazonaws.com/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-energy-goBAR-cranberry.jpg',
    },
};

export const ItemWithNoName: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: null,
    isValid: true,
    orderItemSummaryId: '',
    media: {
        alternateText: null,
        contentVersionId: null,
        id: '2pmxx0000000085AAA',
        mediaType: null,
        sortOrder: 0,
        thumbnailUrl: null,
        title: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpine-energy-gobar-cranberryjpg',
        url: 'https://s3.amazonaws.com/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-energy-goBAR-cranberry.jpg',
    },
};

export const ItemWithFiveFields: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: 'Kitten Two',
    isValid: true,
    orderItemSummaryId: '',
    media: {
        alternateText: null,
        contentVersionId: null,
        id: null,
        mediaType: null,
        sortOrder: 0,
        thumbnailUrl: null,
        title: null,
        url: null,
    },
    fields: [
        {
            label: 'sku#',
            text: 'K002',
            type: 'STRING',
            dataName: 'ProductSKU',
        },
        {
            label: 'Status',
            text: 'in fulfillment',
            type: 'STRING',
            dataName: 'Status',
        },
        {
            label: 'price',
            text: '1000',
            type: 'CURRENCY',
            dataName: 'Amount',
        },
        {
            label: 'quantity',
            text: '10',
            type: 'INTEGER',
            dataName: 'Quantity',
        },
        {
            label: 'tax',
            text: '100',
            type: 'CURRENCY',
            dataName: 'Tax',
        },
    ],
};

export const ItemWithSixFields: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: 'Kitten Two',
    isValid: true,
    orderItemSummaryId: '',
    media: {
        alternateText: null,
        contentVersionId: null,
        id: null,
        mediaType: null,
        sortOrder: 0,
        thumbnailUrl: null,
        title: null,
        url: null,
    },
    variants: [
        {
            name: 'size',
            value: 'large',
        },
        {
            name: 'color',
            value: 'red',
        },
    ],
    fields: [
        {
            label: 'sku#',
            text: 'K002',
            type: 'STRING',
            dataName: 'ProductSKU',
        },
        {
            label: 'Status',
            text: 'in fulfillment',
            type: 'STRING',
            dataName: 'Status',
        },
        {
            label: 'price',
            text: '1000',
            type: 'CURRENCY',
            dataName: 'Amount',
        },
        {
            label: 'quantity',
            text: '10',
            type: 'INTEGER',
            dataName: 'Quantity',
        },
        {
            label: 'tax',
            text: '100',
            type: 'CURRENCY',
            dataName: 'Tax',
        },
        {
            label: 'total price',
            text: '1100',
            type: 'CURRENCY',
            dataName: 'TotalAmount',
        },
    ],
};

export const ItemWithTotalPriceAndQuantity: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: 'Kitten Two',
    isValid: true,
    orderItemSummaryId: '',
    totalPrice: 20,
    media: {
        alternateText: null,
        contentVersionId: null,
        id: null,
        mediaType: null,
        sortOrder: 0,
        thumbnailUrl: null,
        title: null,
        url: null,
    },
    adjustments: [
        {
            currencyIsoCode: 'USD',
            type: 'Promotion',
            name: 'DiSCOUNT!!!!',
            id: 0,
            discountAmount: '-10.0',
        },
    ],
    variants: [
        {
            name: 'size',
            value: 'large',
        },
        {
            name: 'color',
            value: 'red',
        },
    ],
    fields: [
        {
            label: 'sku#',
            text: 'K002',
            type: 'STRING',
            dataName: 'ProductSKU',
        },
        {
            label: 'Status',
            text: 'in fulfillment',
            type: 'STRING',
            dataName: 'Status',
        },
    ],
};

export const ItemWithTotalPriceAndOnlyOneQuantity: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: 'Kitten Two',
    isValid: true,
    orderItemSummaryId: '',
    totalPrice: 20,
    media: {
        alternateText: null,
        contentVersionId: null,
        id: null,
        mediaType: null,
        sortOrder: 0,
        thumbnailUrl: null,
        title: null,
        url: null,
    },
    variants: [
        {
            name: 'size',
            value: 'large',
        },
        {
            name: 'color',
            value: 'red',
        },
    ],
    fields: [
        {
            label: 'sku#',
            text: 'K002',
            type: 'STRING',
            dataName: 'ProductSKU',
        },
        {
            label: 'Status',
            text: 'in fulfillment',
            type: 'STRING',
            dataName: 'Status',
        },
    ],
};

export const ItemWithInvalidProduct: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: 'Kitten Two',
    isValid: false,
    orderItemSummaryId: '',
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
};

export const ItemWithLineAdjustmentsSubtotalField: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: 'Kitten Two',
    isValid: true,
    orderItemSummaryId: '',
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
    fields: [
        {
            dataName: 'Quantity',
            label: 'Quantity',
            text: '1.0',
            type: 'double',
        },
        {
            dataName: 'Something',
            label: 'else',
            text: '1.0',
            type: 'double',
        },
        {
            dataName: 'AdjustedLineAmount',
            label: 'Adjusted Line Subtotal',
            text: '9.99',
            type: 'currency',
        },
        {
            label: 'tax',
            text: '100',
            type: 'CURRENCY',
            dataName: 'Tax',
        },
    ],
};

export const ItemWithMedia: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: 'Kitten Two',
    isValid: true,
    orderItemSummaryId: '',
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
};

export const ItemWithoutMedia: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: 'Kitten Two',
    isValid: true,
    orderItemSummaryId: '',
    media: {
        alternateText: null,
        contentVersionId: null,
        id: null,
        mediaType: null,
        sortOrder: 0,
        thumbnailUrl: null,
        title: null,
        url: null,
    },
};

export const ItemWithMediaWithoutAltText: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: 'Kitten Two',
    isValid: true,
    orderItemSummaryId: '',
    media: {
        alternateText: null,
        contentVersionId: null,
        id: '2pmxx0000000085AAA',
        mediaType: null,
        sortOrder: 0,
        thumbnailUrl: null,
        title: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpine-energy-gobar-cranberryjpg',
        url: 'https://s3.amazonaws.com/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-energy-goBAR-cranberry.jpg',
    },
};

export const ItemWithoutMediaUrl: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: 'Kitten Two',
    isValid: true,
    orderItemSummaryId: '',
    media: {
        alternateText: null,
        contentVersionId: null,
        id: '2pmxx0000000085AAA',
        mediaType: null,
        sortOrder: 0,
        thumbnailUrl: null,
        title: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpine-energy-gobar-cranberryjpg',
        url: '',
    },
};

export const ItemWithoutVariants: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: 'Kitten Two',
    isValid: true,
    orderItemSummaryId: '',
    media: {
        alternateText: null,
        contentVersionId: null,
        id: '2pmxx0000000085AAA',
        mediaType: null,
        sortOrder: 0,
        thumbnailUrl: null,
        title: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpine-energy-gobar-cranberryjpg',
        url: 'https://s3.amazonaws.com/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-energy-goBAR-cranberry.jpg',
    },
};

export const ItemWithVariants: OrderItem = {
    productId: '01txx0000006i45AAA',
    name: 'Kitten Two',
    variants: [
        {
            name: 'size',
            value: 'large',
        },
        {
            name: 'color',
            value: 'red',
        },
    ],
    orderItemSummaryId: '',
    media: {
        alternateText: null,
        contentVersionId: null,
        id: '2pmxx0000000085AAA',
        mediaType: null,
        sortOrder: 0,
        thumbnailUrl: null,
        title: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpine-energy-gobar-cranberryjpg',
        url: 'https://s3.amazonaws.com/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-energy-goBAR-cranberry.jpg',
    },
    isValid: true,
};
