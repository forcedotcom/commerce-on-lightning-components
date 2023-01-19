import type { PromotionSummaryCollectionData } from 'commerce/cartApi';
import type { PromotionInformationDetail } from 'commerce_unified_promotions/cartAppliedPromotions';

export const apiData: {
    withPromotions: PromotionSummaryCollectionData;
    withOutPromotions: PromotionSummaryCollectionData;
    withMissingPromotionDetails: PromotionSummaryCollectionData;
} = {
    withPromotions: {
        cartId: '0a6xxxxxxxxx',
        cartStatus: 'active',
        currencyIsoCode: 'USD',
        promotions: {
            promotions: [
                {
                    promotionId: 'x211nbsdfa',
                    targetType: 'Cart',
                    adjustmentAmount: '-1000',
                    couponCode: '25PERCENTOFF',
                    displayName: 'Premium Discount',
                    termsAndConditions: 'Terms and Conditions',
                },
            ],
        },
    },
    withOutPromotions: {
        cartId: '0a6xxxxxxxxx',
        cartStatus: 'active',
        currencyIsoCode: null,
        promotions: {
            promotions: [],
        },
    },
    withMissingPromotionDetails: {
        cartId: '0a6xxxxxxxxx',
        cartStatus: 'active',
        currencyIsoCode: null,
        promotions: {
            promotions: [
                {
                    promotionId: 'x211nbsdfa',
                    targetType: 'Cart',
                    adjustmentAmount: '',
                    couponCode: '',
                    displayName: '',
                    termsAndConditions: '',
                },
            ],
        },
    },
};

export const transformedApiData: {
    withDetails: PromotionInformationDetail[];
    withOutDetails: PromotionInformationDetail[];
    withMissingDetails: PromotionInformationDetail[];
} = {
    withDetails: [
        {
            id: 'x211nbsdfa',
            discountAmount: '-1000',
            name: '25PERCENTOFF - Premium Discount',
            termsAndConditions: 'Terms and Conditions',
        },
    ],
    withOutDetails: [],
    withMissingDetails: [
        {
            id: 'x211nbsdfa',
            discountAmount: '',
            name: '',
            termsAndConditions: '',
        },
    ],
};
