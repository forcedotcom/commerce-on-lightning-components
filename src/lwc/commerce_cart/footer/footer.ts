import { LightningElement } from 'lwc';

import { clearCartConfirmationHeader, cancelClearCart, confirmClearCart } from './labels';
import { CLEAR_CART_EVENT } from './constants';
import type Dialog from 'lightning/dialog';

export { CLEAR_CART_EVENT } from './constants';

/**
 * Footer Component for Cart Managed Contents
 * @fires Footer#cartclear
 */
export default class Footer extends LightningElement {
    /**
     * An event fired when the "Clear Cart" button is clicked
     *
     * Properties:
     *   - Bubbles: true
     *   - Cancelable: false
     *   - Composed: true
     *
     * @event Footer#cartclear
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light';

    /**
     * Gets the header text for the Clear Cart Confirmation Dialog.
     * @type {string}
     * @readonly
     * @private
     */
    get clearCartConfirmationHeaderText(): string {
        return clearCartConfirmationHeader;
    }

    /**
     * Gets the text for the confirm clear cart button.
     * @type {string}
     * @readonly
     * @private
     */
    get confirmClearCartButtonText(): string {
        return confirmClearCart;
    }

    /**
     * Gets the text for the cancel clear cart button.
     * @type {string}
     * @readonly
     * @private
     */
    get cancelClearCartButtonText(): string {
        return cancelClearCart;
    }

    /**
     * @description Gets the clear-cart dialog element ( clear cart )
     * @readonly
     * @private
     */
    get _clearCartModal(): (Element & Dialog) | null {
        return this.querySelector('lightning-dialog');
    }

    /**
     * @description Show the clear cart dialog when button is clicked, but ony when not in Experience Builder
     */
    handleClearCartButton(): void {
        this._clearCartModal?.showModal();
    }

    /**
     * @description Close the clear cart dialog without clearing the cart
     */
    handleModalCancelButton(): void {
        this._clearCartModal?.close();
    }

    /**
     * @description Confirm the clearing of the cart
     */
    handleModalClearCartButton(): void {
        this.dispatchEvent(
            new CustomEvent(CLEAR_CART_EVENT, {
                composed: true,
                bubbles: true,
            })
        );

        this._clearCartModal?.close();
    }
}
