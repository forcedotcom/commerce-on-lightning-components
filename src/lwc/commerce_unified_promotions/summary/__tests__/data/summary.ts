import type { PromotionInformationDetail } from 'commerce_unified_promotions/cartAppliedPromotions';

export const transformedApiData: {
    withDetails: PromotionInformationDetail[];
    withMissingDetails: PromotionInformationDetail[];
} = {
    withDetails: [
        {
            id: '0c8xx0000000001',
            name: '10% off Coffee Grinders',
            discountAmount: '-76.59',
            termsAndConditions: null,
        },
        {
            id: '0c8xx0000000002',
            name: '10% off your entire cart',
            discountAmount: '-68.95',
            termsAndConditions: 'Valid until the end of time.',
        },
    ],
    withMissingDetails: [
        {
            id: '0c8xx0000000001',
            name: '10% off Coffee Grinders',
            discountAmount: null,
            termsAndConditions: null,
        },
    ],
};
