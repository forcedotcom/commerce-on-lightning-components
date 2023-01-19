export declare type AppliedPromotion = {
    id: number;
    name: string | null;
    termsAndConditions?: string | null;
    discountAmount: string;
};

export declare interface InternalAppliedPromotion extends AppliedPromotion {
    formattedDiscountAmount?: string;
}
