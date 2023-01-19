export declare interface AppliedCoupons {
    /**
     * @property id - The coupon id.
     */
    id: string | null;
    /**
     * @property isFocusable - Determines whether or not the coupon's remove button should have focus.
     */
    isFocusable?: boolean | null;
    /**
     * @property name - The coupon name.
     */
    name: string | null;
    /**
     * @property removeButtonAlternateText - The assistive text for the remove coupon button.
     */
    removeButtonAlternateText?: string | null;
    /**
     * @property termsAndConditions - The coupon's terms and conditions. Terms and conditions will not be displayed if no value is provided.
     */
    termsAndConditions?: string | null;
}
