import type { OrderAdjustmentsCollectionData } from 'commerce/orderApi';
export const adjustments: OrderAdjustmentsCollectionData = {
    adjustments: [
        {
            type: 'Promotion',
            displayName: '5% off on exercise equipments',
            amount: '-100',
            currencyIsoCode: 'USD',
        },
        {
            type: 'Promotion',
            displayName: '10$ off on exercise equipment',
            amount: '-85',
            currencyIsoCode: 'USD',
        },
        {
            type: 'Other',
            displayName: 'This will get filtered out',
            amount: '-85',
            currencyIsoCode: 'USD',
        },
    ],
};
