import { LightningElement, api, wire, track } from 'lwc';
import type { CouponSummaryCollectionData, CartSummaryData } from 'commerce/cartApi';
import { CartCouponsAdapter, CartSummaryAdapter } from 'commerce/cartApi';
import type { CouponInformationDetail } from './types';
import { transformCouponContents } from './transformations';
import type Summary from '../summary/summary';

/**
 * A display of cart applied coupons.
 */
export default class CartAppliedCoupons extends LightningElement {
    public static renderMode = 'light';

    /**
     * Gets or sets the background color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public backgroundColor: string | undefined;

    /**
     * Whether or not to display the reveal coupon form button.
     * @type {boolean}
     */
    @api public showRevealCouponFormButton = false;

    /**
     * Gets or sets the reveal coupon form button text.
     * @type {string}
     */
    @api public revealCouponFormButtonText: string | undefined;

    /**
     * Gets or sets the reveal coupon form button text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public revealCouponFormButtonTextColor: string | undefined;

    /**
     * Gets or sets the reveal coupon form button font size (small, medium, or large).
     * @type {string}
     */
    @api public revealCouponFormButtonFontSize: string | undefined;

    /**
     * Gets or sets the coupon form placeholder text.
     * @type {string}
     */
    @api public couponFormPlaceholderText: string | undefined;

    /**
     * Gets or sets the coupon input box border radius.
     * @type {string}
     */
    @api public couponInputBoxBorderRadius: string | undefined;

    /**
     * Gets or sets the coupon input box background color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public couponInputBoxBackgroundColor: string | undefined;

    /**
     * Gets or sets the coupon input box text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public couponInputBoxTextColor: string | undefined;

    /**
     * Gets or sets the apply coupon button text.
     * @type {string}
     */
    @api public applyCouponButtonText: string | undefined;

    /**
     * Gets or sets the apply coupon button text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public applyCouponButtonTextColor: string | undefined;

    /**
     * Gets or sets the apply coupon button hover text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public applyCouponButtonTextHoverColor: string | undefined;

    /**
     * Gets or sets the apply coupon button background color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public applyCouponButtonBackgroundColor: string | undefined;

    /**
     * Gets or sets the apply coupon button background hover color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public applyCouponButtonBackgroundHoverColor: string | undefined;

    /**
     * Gets or sets the apply coupon button border color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public applyCouponButtonBorderColor: string | undefined;

    /**
     * Gets or sets the apply coupon button border radius.
     * @type {string}
     */
    @api public applyCouponButtonBorderRadius: string | undefined;

    /**
     * Gets or sets the applied coupon font size (small, medium, or large).
     * @type {string}
     */
    @api public appliedCouponsFontSize: string | undefined;

    /**
     * Gets or sets the applied coupon text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public appliedCouponsTextColor: string | undefined;

    /**
     * Gets the summary of applied coupons.
     * @type {CouponSummaryCollectionData}
     */
    @api public cartAppliedCoupons: CouponSummaryCollectionData | undefined;

    /**
     * Whether or not to show applied coupon's terms and conditions.
     * @type {boolean}
     */
    @api public showTermsAndConditions = false;

    /**
     * Gets the title text that is displayed in the terms and conditions popup.
     * @type {string}
     */
    @api public termsAndConditionsTitleText: string | undefined;

    /**
     * Gets or sets the applied coupons.
     * @type {CouponInformationDetail[]}
     */
    @track private _appliedCoupons: CouponInformationDetail[] = [];

    /**
     * Whether or not a coupon has just been applied
     * @type {boolean}
     */
    private _isCouponApplied = false;

    /**
     * Whether or not to show a summary of applied coupons.
     * @type {boolean}
     */
    private _showAppliedCoupons = false;

    /**
     * Whether or not we need to set the focus
     * @private
     */
    private _applyFocus = false;

    /**
     * Whether or not a coupon is being added for focus purposes
     * @private
     */
    private _couponAdded = false;

    /**
     * Whether or not we have cart items
     * @type {boolean}
     * @private
     */
    private _hasCartItems = false;

    /**
     * Gets the list of applied coupons for display.
     * @returns {CouponInformationDetail[]} representation with all the applied promotions.
     */
    private get appliedCoupons(): CouponInformationDetail[] {
        if (this.cartAppliedCoupons) {
            this._showAppliedCoupons = true;
            return transformCouponContents(
                this.cartAppliedCoupons.cartCoupons,
                this.showTermsAndConditions,
                this._isCouponApplied
            );
        }
        return this._appliedCoupons;
    }

    /**
     * Sets the custom background color and custom CSS properties for the cart coupons component.
     * @returns {string}
     * The css style overwrites for the cart coupons component.
     */
    private get cartAppliedCouponCssStyles(): string {
        const revealCouponFontDxpStyling = this.generateClassForSize(this.revealCouponFormButtonFontSize);
        const appliedCouponsFontDxpStyling = this.generateClassForSize(this.appliedCouponsFontSize);
        return `background-color:${this.backgroundColor};
             --com-c-cart-reveal-coupon-form-button-font-color: ${this.revealCouponFormButtonTextColor};
             --com-c-cart-reveal-coupon-form-button-font-size: ${revealCouponFontDxpStyling};
             --com-c-cart-coupon-input-box-border-radius: ${this.couponInputBoxBorderRadius};
             --com-c-cart-coupon-input-box-background-color: ${this.couponInputBoxBackgroundColor};
             --com-c-cart-coupon-input-box-font-color: ${this.couponInputBoxTextColor};
             --com-c-cart-apply-coupon-button-text-color: ${this.applyCouponButtonTextColor};
             --com-c-cart-apply-coupon-button-text-hover-color: ${this.applyCouponButtonTextHoverColor};
             --com-c-cart-apply-coupon-button-background-color: ${this.applyCouponButtonBackgroundColor};
             --com-c-cart-apply-coupon-button-background-hover-color: ${this.applyCouponButtonBackgroundHoverColor};
             --com-c-cart-apply-coupon-button-border-color: ${this.applyCouponButtonBorderColor};
             --com-c-cart-apply-coupon-button-border-radius: ${this.applyCouponButtonBorderRadius};
             --com-c-cart-applied-coupons-font-size: ${appliedCouponsFontDxpStyling};
             --com-c-cart-applied-coupons-font-color: ${this.appliedCouponsTextColor};`;
    }

    /**
     * Determines whether to display the applied coupons component or not.
     * @returns {boolean}
     */
    private get displayCartAppliedCoupons(): boolean {
        if (this.cartAppliedCoupons) {
            return this.cartAppliedCoupons.cartCoupons?.coupons?.length > 0;
        }
        return this._showAppliedCoupons;
    }

    /**
     * Determines whether to display the coupon component or not.
     * @returns {boolean}
     */
    private get displayCouponManagement(): boolean {
        //If we have any design time data, treat this as having cart items (which will render the component)
        if (this.cartAppliedCoupons) {
            return true;
        }
        return this._hasCartItems;
    }

    /**
     * Gets dxp styling heading text of a given size.
     * Valid values are: "small", "medium", and "large"
     *
     * @returns { string | undefined }
     *  The dxp css variable matching the requested size, if one exists; otherwise, undefined.
     */
    private generateClassForSize(fontSize: string | undefined): string | undefined {
        switch (fontSize) {
            case 'small':
                return 'var(--dxp-g-font-size-5)';
            case 'medium':
                return 'var(--dxp-g-font-size-7)';
            case 'large':
                return 'var(--dxp-g-font-size-10)';
            default:
                return undefined;
        }
    }

    /**
     * Retrieves the information for the current cart
     */
    @wire(CartSummaryAdapter)
    private cartSummary({ data }: { data: CartSummaryData }): void {
        if (data) {
            this._hasCartItems = data.uniqueProductCount !== undefined && data.uniqueProductCount > 0;
        } else {
            this._hasCartItems = false;
        }
    }

    /**
     * Retrieves cart coupons information.
     */
    @wire(CartCouponsAdapter)
    private couponsInfo({ data }: { data: CouponSummaryCollectionData }): void {
        if (data) {
            //TODO W-11032999 in future we should refactor _isCouponApplied
            this._isCouponApplied = data.cartCoupons.coupons.length > this._appliedCoupons.length;
            this._appliedCoupons = transformCouponContents(
                data.cartCoupons,
                this.showTermsAndConditions,
                this._isCouponApplied
            );
            this._showAppliedCoupons = this._appliedCoupons.length > 0;
            //if we got more coupons in the data, and we have recieved the event notice a coupon was added, then we want to set the applyFocus flag true
            this._applyFocus = this._isCouponApplied && this._couponAdded;
        } else {
            this._appliedCoupons = [];
        }
        //reset the flags now that the data was updated
        this._isCouponApplied = false;
        this._couponAdded = false;
    }

    /**
     * When couponapplied is fired from input form, sets the flag to indicate a coupon is added
     */
    handleApplyCouponFocus(): void {
        this._couponAdded = true;
    }

    renderedCallback(): void {
        if (this._applyFocus) {
            const summary = <Summary & HTMLElement>this.querySelector('commerce_unified_coupons-summary');
            summary.focus();
            this._applyFocus = false;
        }
    }
}
