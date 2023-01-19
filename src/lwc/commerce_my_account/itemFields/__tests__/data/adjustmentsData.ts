import type { Adjustment } from 'commerce_my_account/itemFields';
export const adjustments: Adjustment[] = [
    {
        id: 1,
        type: 'Promotion',
        name: '5% off on exercise equipments',
        discountAmount: '-100',
        currencyIsoCode: 'USD',
    },
    {
        id: 2,
        type: 'Others',
        name: '10$ off on exercise equipments',
        discountAmount: '-85',
        currencyIsoCode: 'USD',
    },
];
