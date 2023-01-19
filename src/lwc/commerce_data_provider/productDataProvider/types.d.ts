import type { ProductDetailData, ProductPricingResult } from 'commerce/productApi';
import type { ProductTaxResult } from 'commerce/productApiInternal';

export declare interface ProductData {
    Details?: ProductDetailData | Record<string, never>;
    Pricing?: ProductPricingResult | Record<string, never>;
    Tax?: ProductTaxResult | Record<string, never>;
    SelectedVariant: {
        isValid?: boolean;
        options?: string[];
    };
}

export declare interface VariantChangedActionPayload {
    isValid: boolean;
    options: string[];
}

export declare interface AddItemToCartActionPayload {
    quantity: number;
}

export declare interface SelectedQuantityChangedPayload {
    quantity: number;
}
