import { LightningElement, api } from 'lwc';
import { createStyleString } from 'community_styling/inlineStyles';

/**
 * A UI control to view promotion applied savings button.
 */
export default class AppliedSavingsButton extends LightningElement {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    public static renderMode = 'light';

    /**
     * @description applied savings button font size
     */
    @api public buttonFontSize?: 'small' | 'medium' | 'large';

    /**
     * @description applied savings button padding
     */
    @api public buttonPadding?: string;

    /**
     * @description applied savings button text color
     */
    @api public buttonTextColor?: string;

    /**
     * @description applied savings text hover color
     */
    @api public buttonTextHoverColor?: string;

    /**
     * @description applied savings background color
     */
    @api public buttonBackgroundColor?: string;

    /**
     * @description applied savings background hover color
     */
    @api public buttonBackgroundHoverColor?: string;

    /**
     * @description applied savings button border color
     */
    @api public buttonBorderColor?: string;

    /**
     * @description applied savings button border radius
     */
    @api public buttonBorderRadius?: string;

    /**
     * @description The state of button disabled/enabled.
     */
    @api
    disabled = false;

    /**
     * @description Gets or sets the localized text of the button.
     *
     * @type {string}
     */
    @api
    text?: string;

    /**
     * Grabs the focus on the button.
     */
    @api
    focus(): void {
        this.querySelector<HTMLButtonElement>('button')?.focus();
    }

    get customStyles(): string {
        const styles = {
            '--com-c-cart-applied-savings-button-font-size': this.buttonFontSize,
            '--com-c-cart-applied-savings-button-padding': this.buttonPadding,
            '--com-c-cart-applied-savings-button-text-color': this.buttonTextColor,
            '--com-c-cart-applied-savings-button-text-hover-color': this.buttonTextHoverColor,
            '--com-c-cart-applied-savings-button-background-color': this.buttonBackgroundColor,
            '--com-c-cart-applied-savings-button-background-hover-color': this.buttonBackgroundHoverColor,
            '--com-c-cart-applied-savings-button-border-radius': this.buttonBorderRadius,
            '--com-c-cart-applied-savings-button-border-color': this.buttonBorderColor,
        };
        return createStyleString(styles);
    }
}
