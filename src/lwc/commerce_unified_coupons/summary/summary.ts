import { api, LightningElement } from 'lwc';
import type { LwcCustomEventTargetOf } from 'types/common';
import type { AppliedCoupons } from './types';
import { generateAssistiveText } from './assistiveTextGenerator';
import { deleteCouponFromCart } from 'commerce/cartApi';

/**
 * A display of a list of applied coupons.
 *
 * @fires Summary#deletecouponfromcart
 */
export default class Summary extends LightningElement {
    public static renderMode = 'light';

    /**
     * List of applied coupons.
     *
     * @type {AppliedCoupons[]}
     * @required
     */
    @api
    appliedCoupons: AppliedCoupons[] | undefined;

    /**
     * Text that is displayed in the terms and conditions popup header.
     *
     * @type {string}
     */
    @api
    termsAndConditionsHeaderText: string | undefined;

    private _couponDeleted = false;

    /**
     * Gets the list of applied coupons for display.
     *
     * @returns {AppliedCoupons[]} Representation of all the applied coupons.
     */
    private get appliedCouponsDisplayList(): AppliedCoupons[] {
        return (this.appliedCoupons || []).map((couponItem: AppliedCoupons) => {
            // Create a copy of the coupon object that we can safely mutate
            const newCouponItem = { ...couponItem };

            // Sets the alternate text for the remove button icon.
            newCouponItem.removeButtonAlternateText = generateAssistiveText(couponItem.name);

            return newCouponItem;
        });
    }

    /**
     * Delete a coupon from cart
     */
    private handleDeleteCoupon(event: LwcCustomEventTargetOf<HTMLElement>): void {
        const { couponId } = event.target.dataset;

        deleteCouponFromCart(<string>couponId).then(() => {
            this._couponDeleted = true;
        });
    }

    /**
     * Focuses on the last coupon control available.
     *
     * Note: As of 236 we are assuming the API returns a list of applied coupons
     * in the order of newest to oldest. If the sort order changes in the future
     * we will need to update this implementation to find the latest added coupon
     * by coupon id.
     */
    handleDeleteFocus(): void {
        const lastAppliedCouponRemoveBtns = this.querySelectorAll<HTMLElement>('lightning-button-icon');
        lastAppliedCouponRemoveBtns[lastAppliedCouponRemoveBtns.length - 1].focus();
        this._couponDeleted = false;
    }

    /**
     * Focuses on the first coupon control available.
     *
     * Note: As of 236 we are assuming the API returns a list of applied coupons
     * in the order of newest to oldest. If the sort order changes in the future
     * we will need to update this implementation to find the latest added coupon
     * by coupon id.
     */
    @api
    focus(): void {
        const lastAppliedCouponRemoveBtns = this.querySelectorAll<HTMLElement>('lightning-button-icon');

        if (lastAppliedCouponRemoveBtns.length > 0) {
            const lastAppliedCouponRemoveBtn = lastAppliedCouponRemoveBtns[0];
            lastAppliedCouponRemoveBtn.focus();
        }
    }

    /**
     * Focuses on the latest applied coupon's remove button.
     *
     * Note: As of 236 we are assuming the API returns a list of applied coupons
     * in the order of newest to oldest. If the sort order changes in the future
     * we will need to update this implementation to find the latest added coupon
     * by coupon id.
     */
    renderedCallback(): void {
        if (this._couponDeleted) {
            this.handleDeleteFocus();
        }
    }
}
