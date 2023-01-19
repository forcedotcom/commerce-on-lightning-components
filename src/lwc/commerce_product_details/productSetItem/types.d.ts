export interface ProductSetItemQuantityChangedEventDetails {
    quantity: number;
    productId: string;
    isValid: boolean;
}

export interface VariantChangedEventDetails {
    isValid: boolean;
    variantProductId?: string;
}
