import { LightningElement, api, wire } from 'lwc';
import { NavigationContext, generateUrl } from 'lightning/navigation';
import buttonStyleStringGenerator from './buttonStyleStringGenerator';
import type { LightningNavigationContext } from 'types/common';

/**
 * A UI control to show an anchor element styled as a Call to Action button
 */
export default class CallToActionAnchorButton extends LightningElement {
    public static renderMode = 'light';

    /**
     * Style customizations supported in Builder for CTA button.
     *
     * @typedef {Object} CustomStyles
     *
     * @property {string} ["background-color"]
     *  The background color of the button, specified as a valid CSS color representation.
     *
     * @property {string} ["background-hover-color"]
     *  The background color of the button when the user hovers over it, specified as a valid CSS color representation.
     *
     * @property {string} ["border-color"]
     *  The color of the button text, specified as a valid CSS color representation.
     *
     * @property {string} ["border-radius"]
     *  The radius of the button corner border, specified as a CSS length.
     *
     * @property {string} ["text-color"]
     *  The color of the button text, specified as a valid CSS color representation.
     *
     * @property {string} ["text-hover-color"]
     *  The color of the button text when the user hovers over it, specified as a valid CSS color representation.
     */

    /**
     * Gets or sets the optional ‘aria-label’ attribute for the button
     * If provided, assistive technologies would use this label instead of the button's text content.
     *
     * @type {string}
     */
    @api ariaLabel: string | null = null;

    /**
     * Gets or sets the optional custom styles applied to the button.
     * ['background-color', 'background-hover-color','border-color',
     * 'border-radius','text-color','text-hover-color']
     *
     * @type {CustomStyles}
     */
    @api customStyles?: Record<string, string>;

    /**
     * Gets or sets the localized text of the button.
     *
     * @type {string}
     */
    @api text?: string;

    /**
     * Grabs the focus on the button.
     */
    @api
    focus(): void {
        this.querySelector<HTMLElement>('a')?.focus();
    }

    /**
     * Gets or sets whether the button has focus.
     * This provides support for custom CSS styling of hover states via JS, since we can't use CSS for this (yet).
     *
     * @type {boolean}
     * @private
     */
    private isFocused = false;

    /**
     * Gets or sets whether the button is in a hover state.
     * This provides support for custom CSS styling of hover states via JS, since we can't use CSS for this (yet).
     *
     * @type {boolean}
     * @private
     */
    private isHovering = false;

    /**
     * Url of the product's detail page
     *
     * @type {string}
     * @private
     */
    private _productUrl = '';

    private _navContext?: LightningNavigationContext;

    /**
     * Gets the custom CSS styles to apply to the button.
     *
     * @returns {string}
     *
     * @readonly
     * @private
     */
    private get customButtonStyles(): string {
        return buttonStyleStringGenerator.createForStyles(this.customStyles, {
            isHovering: this.isHovering || this.isFocused,
        });
    }

    /**
     * Handles a "blur" event on the button.
     *
     * @private
     */
    private handleBlur(): void {
        this.isFocused = false;
    }

    /**
     * Handles a "focus" event on the button.
     *
     * @private
     */
    private handleFocus(): void {
        this.isFocused = true;
    }

    /**
     * Handles a "mouseenter" event from the button.
     *
     * @private
     */
    private handleMouseEnter(): void {
        this.isHovering = true;
    }

    /**
     * Handles a "mouseleave" event from the button.
     *
     * @private
     */
    private handleMouseLeave(): void {
        this.isHovering = false;
    }

    /**
     * Unique identifier of the product used to generate the url for the product detail page
     *
     * @type {string}
     */
    @api
    productId?: string;

    @wire(NavigationContext)
    navigationContextHandler(navContext: LightningNavigationContext): void {
        this._navContext = navContext;
        this.updateUrl();
    }

    updateUrl(): void {
        if (!this.productId) {
            return;
        }

        this._productUrl = generateUrl(<LightningNavigationContext>this._navContext, {
            type: 'standard__recordPage',
            attributes: {
                objectApiName: 'Product2',
                recordId: this.productId,
                actionName: 'view',
            },
        });
    }

    get productUrl(): string {
        return this._productUrl;
    }
}
