import { LightningElement, api } from 'lwc';
import type { ButtonVariant, ButtonSize, ButtonWidth, ButtonAlignment } from 'commerce_cart/checkoutButton';
import { createStyleString } from 'community_styling/inlineStyles';

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
     * @description The state of button disabled/enabled
     */
    @api public disabled = false;

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
