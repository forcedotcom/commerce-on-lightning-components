import { LightningElement, api } from 'lwc';
import { generateStyleClass } from 'dxp_styling/sldsButtonClassGenerator';
import type { ButtonVariant } from './types';

export type { ButtonVariant };

/**
 * A UI control to add product to cart
 */
export default class AddToCartButton extends LightningElement {
    static renderMode = 'light';

    /**
     * Gets or sets the optional 'aria-label' attribute for the button.
     * If provided, assistive technologies would use this label instead of the button's text content.
     *
     * @type {String}
     */
    @api
    ariaLabel!: string | null;

    /**
     * Gets or sets whether the button is disabled
     *
     * @type {Boolean}
     */
    @api
    disabled = false;

    /**
     * Gets or sets the name of the optional SLDS icon (e.g. "utility:success") to be displayed alongside the text.
     * If no value is provided (i.e. the value is null, undefined, or an empty string), no icon is displayed.
     *
     * @type {String}
     */
    @api
    iconName?: string;

    /**
     * Gets or sets the localized text of the button.
     *
     * @type {String}
     */
    @api
    text?: string;

    /**
     * The style of button (primary/secondary/tertiary)
     */
    @api variant?: ButtonVariant;

    /**
     * Grabs the focus on the button.
     */
    @api
    focus(): void {
        this.querySelector<HTMLButtonElement>('button')?.focus();
    }

    /**
     * Gets whether an icon has been specified.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get hasIcon(): boolean {
        return (this.iconName || '').length > 0;
    }

    /**
     * Gets SLDS classes to apply to button.
     *
     */
    get customButtonClasses(): string {
        return `slds-button ${generateStyleClass(this.variant)}`;
    }
}
