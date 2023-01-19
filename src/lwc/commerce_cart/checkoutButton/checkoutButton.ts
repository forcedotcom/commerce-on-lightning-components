import { LightningElement, wire, api } from 'lwc';
import { navigate, NavigationContext, generateUrl } from 'lightning/navigation';
import type { LightningNavigationContext } from 'types/common';
import { generateSizeClass, generateStretchClass, generateAlignmentClass } from 'dxp_styling/sldsButtonClassGenerator';
import { generateStyleClass } from './generateStylingClasses';
import type { ButtonVariant, ButtonSize, ButtonWidth, ButtonAlignment } from './types';
export type { ButtonVariant, ButtonSize, ButtonWidth, ButtonAlignment } from './types';

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
     * @type {ButtonVariant}
     */
    @api variant: ButtonVariant | undefined;

    /**
     * @description Button size
     * @type {ButtonSize}
     */
    @api size: ButtonSize | undefined;

    /**
     * @description Button width
     * @type {ButtonWidth}
     */
    @api width: ButtonWidth | undefined;

    /**
     * @description Button alignment on the page
     * @type {ButtonAlignment | undefined}
     */
    @api alignment: ButtonAlignment | undefined;

    /**
     * @description The state of button disabled/enabled
     */
    @api disabled: boolean | undefined;

    /**
     * @description Button style for the checkout button component
     */
    @api buttonStyle: string | undefined;

    /**
     * Sanitized content to be rendered
     *
     * @readonly
     * @type {string}
     * @memberof Button
     */
    get content(): string {
        return <string>this.text;
    }

    /**
     * @description generates class for checkout button styling
     * @type {string}
     */
    get customButtonClasses(): string {
        const classes = [
            'slds-button',
            generateAlignmentClass(this.alignment || 'center'),
            generateStyleClass(this.variant),
            generateSizeClass(this.size),
            generateStretchClass(this.width),
        ];
        return classes.join(' ');
    }

    @wire(NavigationContext)
    navContext!: LightningNavigationContext;

    /**
     * @description navigate the user to the Relative url for the active cart page when it's clicked
     */
    handleButtonClick(): void {
        navigate(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Current_Checkout',
            },
        });
    }

    /**
     * @description Relative url for the active cart
     * @private
     */
    computedUrl = '';

    connectedCallback(): void {
        this.computedUrl = generateUrl(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Current_Checkout',
            },
        });
    }
}
