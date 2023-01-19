import type { OrderAdjustment, OrderItemsAdjustmentsCollectionData } from 'commerce/orderApi';
export const transformAdjustmentFieldsForDisplayInputData: OrderAdjustment[] = [
    {
        amount: '-10.0',
        currencyIsoCode: 'USD',
        displayName: 'DiSCOUNT!!!!',
        type: 'Other',
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
    {
        amount: '-10.0',
        currencyIsoCode: 'USD',
        displayName: 'DiSCOUNT!!!!',
        id: 1,
        name: 'other',
        type: 'Other',
    },
];

export const adjustmentsAdapterResponse: OrderItemsAdjustmentsCollectionData = {
    orderItemSummaries: {
        '10uxx0000004EIn': {
            adjustments: [
                {
                    amount: '-10.0',
                    currencyIsoCode: 'USD',
                    displayName: 'DiSCOUNT!!!!',
                    type: 'Promotion',
                },
                {
                    amount: '-10.0',
                    currencyIsoCode: 'USD',
                    displayName: 'DiSCOUNT!!!!',
                    type: 'Other',
                },
            ],
        },
    },
};

export const transformedAdjustmentsAdapterData = {
    '10uxx0000004EIn': [
        {
            amount: '-10.0',
            currencyIsoCode: 'USD',
            discountAmount: '-10.0',
            displayName: 'DiSCOUNT!!!!',
            id: 0,
            name: 'DiSCOUNT!!!!',
            type: 'Promotion',
        },
        {
            amount: '-10.0',
            currencyIsoCode: 'USD',
            discountAmount: '-10.0',
            displayName: 'DiSCOUNT!!!!',
            id: 1,
            name: 'other',
            type: 'Other',
        },
    ],
};
