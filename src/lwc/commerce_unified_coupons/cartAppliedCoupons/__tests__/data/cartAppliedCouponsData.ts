import type { CouponSummaryCollectionData } from 'commerce/cartApi';
import type { CouponInformationDetail } from '../../types';
import type { CartSummaryData } from 'commerce/cartApi';

export const apiData: {
    withCoupons: CouponSummaryCollectionData;
    withoutCoupons: CouponSummaryCollectionData;
    withMissingCouponDetails: CouponSummaryCollectionData;
} = {
    withCoupons: {
        cartCoupons: {
            coupons: [
                {
                    cartCouponId: '4or0000000001GAA',
                    couponCode: '10OFFCART',
                    termsAndConditions: 'Terms and Conditions',
                },
            ],
        },
        cartId: '0a6xxxxxxxxx',
        cartStatus: 'active',
        ownerId: '005xx000001XB9VAAW',
    },
    withoutCoupons: {
        cartCoupons: {
            coupons: [],
        },
        cartId: '0a6xxxxxxxxx',
        cartStatus: 'active',
        ownerId: '005xx000001XB9VAAW',
    },
    withMissingCouponDetails: {
        cartCoupons: {
            coupons: [
                {
                    cartCouponId: '4or0000000001GAA',
                    couponCode: '',
                    termsAndConditions: '',
                },
            ],
        },
        cartId: '0a6xxxxxxxxx',
        cartStatus: 'active',
        ownerId: '005xx000001XB9VAAW',
    },
};

export const transformedApiData: {
    withDetails: CouponInformationDetail[];
    withoutDetails: CouponInformationDetail[];
    withDetailsAndFocusable: CouponInformationDetail[];
    withMissingDetails: CouponInformationDetail[];
} = {
    withDetails: [
        {
            id: '4or0000000001GAA',
            isFocusable: false,
            name: '10OFFCART',
            termsAndConditions: 'Terms and Conditions',
        },
    ],
    withoutDetails: [],
    withDetailsAndFocusable: [
        {
            id: '4or0000000001GAA',
            isFocusable: true,
            name: '10OFFCART',
            termsAndConditions: 'Terms and Conditions',
        },
    ],
    withMissingDetails: [
        {
            id: '4or0000000001GAA',
            isFocusable: false,
            name: '',
            termsAndConditions: '',
        },
    ],
};

export const summaryApiData: {
    withItems: CartSummaryData;
    withoutItems: CartSummaryData;
} = {
    withItems: {
        accountId: '001xx000003GYXPAA4',
        cartId: '0a6xx00000000KzAAI',
        currencyIsoCode: 'USD',
        grandTotalAmount: '306.47',
        isSecondary: undefined,
        messagesSummary: {
            errorCount: 0,
            hasErrors: false,
            limitedMessages: [],
            relatedEntityId: '0a6xx00000000KzAAI',
            totalLineItemsWithErrors: 0,
        },
        name: 'Cart',
        ownerId: '005xx000001X7vVAAS',
        purchaseOrderNumber: undefined,
        status: 'Active',
        taxType: 'Net',
        totalChargeAmount: '0.00',
        totalListPrice: '426.92',
        totalProductAmount: '306.47',
        totalProductAmountAfterAdjustments: '306.47',
        totalProductCount: '8.0',
        totalPromotionalAdjustmentAmount: '-100.00',
        totalTaxAmount: '0.00',
        type: 'Cart',
        uniqueProductCount: 4,
        webstoreId: '0ZExx0000000001GAA',
    },

    withoutItems: {
        accountId: '001xx000003GYXPAA4',
        cartId: '0a6xx00000000KzAAI',
        currencyIsoCode: 'USD',
        grandTotalAmount: '306.47',
        isSecondary: undefined,
        messagesSummary: {
            errorCount: 0,
            hasErrors: false,
            limitedMessages: [],
            relatedEntityId: '0a6xx00000000KzAAI',
            totalLineItemsWithErrors: 0,
        },
        name: 'Cart',
        ownerId: '005xx000001X7vVAAS',
        purchaseOrderNumber: undefined,
        status: 'Active',
        taxType: 'Net',
        totalChargeAmount: '0.00',
        totalListPrice: '426.92',
        totalProductAmount: '306.47',
        totalProductAmountAfterAdjustments: '306.47',
        totalProductCount: '8.0',
        totalPromotionalAdjustmentAmount: '-100.00',
        totalTaxAmount: '0.00',
        type: 'Cart',
        uniqueProductCount: 0,
        webstoreId: '0ZExx0000000001GAA',
    },
};
