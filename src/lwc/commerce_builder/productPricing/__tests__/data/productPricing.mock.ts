import type { ProductPricingResultData } from 'commerce/productApi';

export const pricingProductMock = (partial: Partial<ProductPricingResultData> = {}): ProductPricingResultData =>
    Object.assign(
        {},
        {
            success: true,
            currencyIsoCode: 'USD',
            listPrice: '82.23',
            priceAdjustment: null,
            pricebookEntryId: '01uxx0000008z9cAAA',
            unitPrice: '85.16186882970139',
            negotiatedPrice: '85.16186882970139',
            quantity: 1,
        },
        partial
    );
