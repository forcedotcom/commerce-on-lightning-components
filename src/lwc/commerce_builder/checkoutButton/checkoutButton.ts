import { LightningElement, api, wire } from 'lwc';
import { CartSummaryAdapter } from 'commerce/cartApi';
import { CartActionsStatusAdapter } from 'commerce/cartApiInternal';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import { createStyleString } from 'community_styling/inlineStyles';
import type { ButtonVariant, ButtonSize, ButtonWidth, ButtonAlignment } from './types';

export default class CheckoutButton extends LightningElement {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    public static renderMode = 'light';

    /**
     * @description Button text for the checkout Button component
     */
    @api text: string | undefined;

    /**
     * @description Button variant
     * @type {ButtonVariant | undefined}
     */
    @api variant: ButtonVariant | undefined;

    /**
     * @description Button size
     * @type {ButtonSize | undefined}
     */
    @api size: ButtonSize | undefined;

    /**
     * @description Button width
     * @type {ButtonWidth | undefined}
     */
    @api width: ButtonWidth | undefined;

    /**
     * @description Button alignment on the page
     * @type {ButtonAlignment | undefined}
     */
    @api alignment: ButtonAlignment | undefined;

    /**
     * @description checkout button text color
     */
    @api public buttonTextColor?: string;

    /**
     * @description checkout button text hover color
     */
    @api public buttonTextHoverColor?: string;

    /**
     * @description checkout button background color
     */
    @api public buttonBackgroundColor?: string;

    /**
     * @description checkout button background hover color
     */
    @api public buttonBackgroundHoverColor?: string;

    /**
     * @description checkout button border color
     */
    @api public buttonBorderColor?: string;

    /**
     * @description checkout button border radius
     */
    @api public buttonBorderRadius?: string;

    /**
     * Gets or sets whether there are products in cart or not
     *
     * @type {Boolean}
     */
    get hasProducts(): boolean {
        if (this.cartSummary?.data) {
            return Number(this.cartSummary.data.totalProductCount) > 0;
        }
        return false;
    }

    /**
     * Retrieves the cart summary to get totalProductCount.
     */
    @wire(CartSummaryAdapter)
    cartSummary: StoreAdapterCallbackEntry<Record<string, unknown>> | undefined;

    /**
     * Retrieves boolean value to enable or disable Checkout button
     * when cart actions are processing
     */
    @wire(CartActionsStatusAdapter)
    cartActionStatusHandler: StoreAdapterCallbackEntry<Record<string, unknown>> | undefined;

    /*
     * Gets or sets whether the cart is processing or not
     */
    get isCartProcessing(): boolean {
        return (
            !!this.cartActionStatusHandler?.data ||
            !!this.cartActionStatusHandler?.loading ||
            !!this.cartSummary?.loading
        );
    }

    get cartHasError(): boolean {
        return !!this.cartActionStatusHandler?.error || !!this.cartSummary?.error;
    }

    /**
     * Gets whether the button is disabled or not
     *
     * @type {Boolean}
     */
    get isDisabled(): boolean {
        return this.isCartProcessing || this.cartHasError;
    }

    get buttonStyle(): string {
        const styles = {
            '--com-c-cart-checkout-button-text-color': this.buttonTextColor,
            '--com-c-cart-checkout-button-text-hover-color': this.buttonTextHoverColor,
            '--com-c-cart-checkout-button-background-color': this.buttonBackgroundColor,
            '--com-c-cart-checkout-button-background-hover-color': this.buttonBackgroundHoverColor,
            '--com-c-cart-checkout-button-border-radius': this.buttonBorderRadius ? this.buttonBorderRadius + 'px' : '',
            '--com-c-cart-checkout-button-border-color': this.buttonBorderColor,
        };
        return createStyleString(styles);
    }
}
