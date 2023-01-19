import type { ProductPricingResult, ProductPricingResultData } from 'commerce/productApi';

export const getProductPricingData = (partial: Partial<ProductPricingResult> = {}): ProductPricingResult =>
    Object.assign(
        {},
        {
            error: null,
            success: true,
            currencyIsoCode: 'EUR',
            listPrice: '1000',
            pricebookEntryId: 'someID',
            unitPrice: '1000',
            priceAdjustment: {
                priceAdjustmentTiers: [
                    {
                        id: '123',
                        adjustmentType: 'PercentageBasedAdjustment',
                        adjustmentValue: '50',
                        lowerBound: '20',
                        upperBound: '60',
                        tierUnitPrice: '10',
                    },
                ],
            },
            negotiatedPrice: '1000',
            quantity: 1,
        },
        partial
    );

export const getProductPricingDataWithCalculatedNegotiatedPrice = (
    partial: Partial<ProductPricingResult> = {}
): ProductPricingResult =>
    Object.assign(
        {},
        {
            error: null,
            success: true,
            currencyIsoCode: 'EUR',
            listPrice: '1000',
            pricebookEntryId: 'someID',
            unitPrice: '1000',
            priceAdjustment: {
                priceAdjustmentTiers: [
                    {
                        id: '123',
                        adjustmentType: 'PercentageBasedAdjustment',
                        adjustmentValue: '50',
                        lowerBound: '20',
                        upperBound: '60',
                        tierUnitPrice: '10',
                    },
                ],
            },
            negotiatedPrice: '10',
            quantity: 30,
        },
        partial
    );

export const getProductPricingResultData = (
    partial: Partial<ProductPricingResultData> = {}
): ProductPricingResultData =>
    Object.assign(
        {},
        {
            error: null,
            success: true,
            currencyIsoCode: 'EUR',
            listPrice: '1000',
            pricebookEntryId: 'someID',
            unitPrice: '1000',
            priceAdjustment: {
                priceAdjustmentTiers: [
                    {
                        id: '123',
                        adjustmentType: 'PercentageBasedAdjustment',
                        adjustmentValue: '50',
                        lowerBound: '20',
                        upperBound: '60',
                        tierUnitPrice: '10',
                    },
                ],
            },
        },
        partial
    );

export const getProductPricingResultDataWithoutPricingTiers = (
    partial: Partial<ProductPricingResultData> = {}
): ProductPricingResultData =>
    Object.assign(
        {},
        {
            error: null,
            success: true,
            currencyIsoCode: 'EUR',
            listPrice: '1000',
            pricebookEntryId: 'someID',
            unitPrice: '1000',
            priceAdjustment: null,
        },
        partial
    );

export const getProductPricingResultWithoutPricingTiers = (
    partial: Partial<ProductPricingResultData> = {}
): ProductPricingResultData =>
    Object.assign(
        {},
        {
            error: null,
            success: true,
            currencyIsoCode: 'EUR',
            listPrice: '1000',
            pricebookEntryId: 'someID',
            unitPrice: '1000',
            priceAdjustment: null,
            negotiatedPrice: '1000',
            quantity: 1,
        },
        partial
    );
