export declare interface Totals {
    discountAmount: string | undefined;
    originalPrice: string | undefined;
    shippingPrice: string | undefined;
    subtotal: string | undefined;
    tax: string | undefined;
    total: string | undefined;
}

export declare interface CartSummaryInformation {
    currencyCode?: string;
    taxType?: string;
    totals?: Totals;
}
