import type { PromotionInformationDetail } from 'commerce_unified_promotions/cartAppliedPromotions';

export const ORDER_APPLIED_PROMOTIONS_DESIGN_SUBSTITUTE_DATA = {
    currencyIsoCode: 'USD',
    adjustments: [
        <PromotionInformationDetail>{
            id: '0',
            name: '5% OFF Chai And Protein Products',
            discountAmount: '-2.86',
            termsAndConditions: null,
        },
        <PromotionInformationDetail>{
            id: '1',
            name: 'DRINKS5OFF - 5% OFF Coupon For Protein Product',
            discountAmount: '-1.03',
            termsAndConditions: null,
        },
        <PromotionInformationDetail>{
            id: '2',
            name: '5% OFF On Order',
            discountAmount: '-2.71',
            termsAndConditions: null,
        },
    ],
};
