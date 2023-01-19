// Note: All references for this component have been removed from the codebase.
// The component is being retained through 242 to allow STEAM environments to continue functioning, but the component has never been customer-facing.
// This component code can be safely deleted in 244 or later with no impact to customers.

/**
 * @deprecated
 */

import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { CartSummaryAdapter } from 'commerce/cartApi';
import { CartActionsStatusAdapter } from 'commerce/cartApiInternal';
import checkout from '@salesforce/label/B2C_Lite_CheckoutButton.checkout';
import type { LightningNavigationContext } from 'types/common';
import type { StoreAdapterCallbackEntry } from 'experience/store';

/**
 * Checkout button that begins the checkout process.
 * @author yoseph.elaameir
 */
const DEFAULTS = {
    buttonText: checkout,
    disabled: true,
    buttonBorderRadius: 0,
    buttonMaxWidth: 100,
    buttonAlignItems: 'left',
};
const START_CHECKOUT = 'startcheckout';

/**
 * @fires CheckoutButton#startcheckout
 */

export default class CheckoutButton extends LightningElement {
    public static renderMode = 'light';

    /**
     * An event fired when the checkout button is clicked.
     *
     * Properties:
     *   - bubbles: true
     *   - composed: true
     *
     * @event CheckoutButton#startcheckout
     * @type {CustomEvent}
     *
     * @export
     *
     */

    /**
     * Gets or sets the text of the button for checkout.
     *
     * @type {string}
     */
    @api
    buttonText = DEFAULTS.buttonText;

    /**
     * Style customizations supported by the checkout Button.
     *
     * @typedef {Object} CustomStyles
     *
     * @property {string} ["button-text-color"]
     *  The color of the button text, specified as a valid CSS color representation.
     *
     * @property {string} ["button-text-hover-color"]
     *  The color of the button text when the user hovers over it, specified as a valid CSS color representation.
     *
     * @property {string} ["button-background-color"]
     *  The background color of the button, specified as a valid CSS color representation.
     *
     * @property {string} ["button-background-hover-color"]
     *  The background color of the button when the user hovers over it, specified as a valid CSS color representation.
     *
     * @property {string} ["button-border-color"]
     *  The color of the button's border, specified as a valid CSS color representation.
     *
     * @property {string} ["button-border-radius"]
     *  The radius of the button corner border, specified as a CSS length.
     *
     * @property {string} ["button-max-width"]
     *  The width of the button, specified as a CSS length.
     *
     * @property {string} ["button-align-items"]
     *  The alignment of the button.
     *  Accepted values are: "center", "left", and "right".
     */

    /**
     * The color of the button text, specified as a valid CSS color representation.
     * @type {string}
     */
    @api buttonTextColor: string | undefined;
    get _buttonTextColor(): string {
        return this.buttonTextColor || 'var()';
    }

    /**
     * The color of the button text when the user hovers over it, specified as a valid CSS color representation.
     * @type {string}
     */
    @api buttonTextHoverColor: string | undefined;
    get _buttonTextHoverColor(): string {
        return this.buttonTextHoverColor || 'var()';
    }

    /**
     * The background color of the button, specified as a valid CSS color representation.
     * @type {string}
     */
    @api buttonBackgroundColor: string | undefined;
    get _buttonBackgroundColor(): string {
        return this.buttonBackgroundColor || 'var()';
    }

    /**
     * The background color of the button when the user hovers over it, specified as a valid CSS color representation.
     * @type {string}
     */
    @api buttonBackgroundHoverColor: string | undefined;
    get _buttonBackgroundHoverColor(): string {
        return this.buttonBackgroundHoverColor || 'var()';
    }

    /**
     * The color of the button's border, specified as a valid CSS color representation.
     * @type {string}
     */
    @api buttonBorderColor: string | undefined;
    get _buttonBorderColor(): string {
        return this.buttonBorderColor || 'var()';
    }

    /**
     * The radius of the button corner border, specified as a CSS length.
     * @type {string}
     */
    @api buttonBorderRadius = DEFAULTS.buttonBorderRadius;

    /**
     * The width of the button, specified as a CSS length.
     * @type {string}
     */
    @api buttonMaxWidth = DEFAULTS.buttonMaxWidth;

    /**
     *  The alignment of the button.
     * @type {string}
     */
    @api buttonAlignItems = DEFAULTS.buttonAlignItems;

    /**
     * Gets or sets whether or not there are products in cart
     *
     * @type {Boolean}
     */
    hasProducts = false;

    /**
     * Gets or sets whether or not the cart is processing
     *
     * @type {Boolean}
     */
    isCartProcessing = false;

    @wire(NavigationContext)
    navContext!: LightningNavigationContext;

    /**
     * Retrieves the cart summary to get totalProductCount.
     * @param {string}
     */
    @wire(CartSummaryAdapter)
    cartSummaryHandler(response: StoreAdapterCallbackEntry<Record<string, unknown>>): void {
        if (response.data) {
            // @ts-ignore
            this.hasProducts = response.data.totalProductCount > 0;
        }
    }

    /**
     * Retrieves boolean value to enable or disable Checkout button
     * when cart actions are processing
     * @param {string}
     */
    @wire(CartActionsStatusAdapter)
    CartActionsStatusHandler(response: StoreAdapterCallbackEntry<Record<string, unknown>>): void {
        this.isCartProcessing = !!response.data;
    }

    /**
     * Gets whether or not the button is disabled
     *
     * @type {Boolean}
     */
    get isDisabled(): boolean {
        return !this.hasProducts || this.isCartProcessing;
    }

    /**
     * Gets or sets the optional custom styles applied to the summary.
     *
     * @type {CustomStyles}
     */
    get customStyles(): Record<string, string> {
        const styles = {
            'button-text-color': this._buttonTextColor,
            'button-text-hover-color': this._buttonTextHoverColor,
            'button-background-color': this._buttonBackgroundColor,
            'button-background-hover-color': this._buttonBackgroundHoverColor,
            'button-border-color': this._buttonBorderColor,
            'button-border-radius': this.buttonBorderRadius + 'px',
            'button-max-width': this.buttonMaxWidth + '%',
            'button-align-items': this.alignToMargin(this.buttonAlignItems),
        };

        return styles;
    }

    /**
     * Returns the proper command for aligning the button as a string.
     *
     * @param {string} str
     *  The desired alignment of the button.
     *
     * @returns {string}
     *  The string representation of the desired alignment.
     */
    alignToMargin(alignment: string): string {
        const alignmentToMargin: { [index: string]: string } = { left: '0', center: 'auto', right: 'auto 0 auto auto' };
        return alignmentToMargin[alignment];
    }

    /**
     * Create an event to monitor if the checkout process starts
     */
    startCheckout(): void {
        this.dispatchEvent(
            new CustomEvent(START_CHECKOUT, {
                bubbles: true,
                composed: true,
            })
        );
    }

    /**
     * Navigates to the checkout page
     *
     * @private
     */
    navigateToCheckout(): void {
        navigate(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Current_Checkout',
            },
        });
    }

    /**
     * Handles the 'checkoutbuttonclicked' event.
     */
    handleCheckoutButtonClick(): void {
        this.startCheckout();
        this.navigateToCheckout();
    }
}
