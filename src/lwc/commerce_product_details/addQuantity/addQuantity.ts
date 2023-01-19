import { LightningElement, api } from 'lwc';
import type { PurchaseQuantityRule } from 'commerce/productApi';
import { ADD_PRODUCT_TO_CART_EVT } from './constants';
import type { ChangeEventDetail } from 'commerce/numberInput';
import type { ButtonVariant } from 'commerce_product_details/addToCartButton';

/**
 * A UI control to add N number of product to the cart
 *
 * @fires AddQuantity#addproducttocart
 */
export default class AddQuantity extends LightningElement {
    static renderMode = 'light';

    /**
     * An event fired when the user indicates a desire to add a quantity of an item to their cart.
     *
     * Properties:
     *   - bubbles: true
     *   - cancelable: false
     *   - composed: true
     *
     * @event AddQuantity#addproducttocart
     * @type {CustomEvent}
     *
     * @property {Number} detail.quantity
     *   The quantity of the product to add to the cart
     *
     * @export
     */

    /**
     * Gets or sets the text of the button that triggers the addition of items.
     *
     * @type {String}
     */
    @api
    buttonText?: string;

    /**
     * Rule which constrains what quantities of a product may be purchased.
     *
     * @type {PurchaseQuantityRule}
     * @example
     *   {
     *      minimum : '10.0',
     *      maximum : '100.0',
     *      increment : '5.0'
     *  }
     */
    @api
    quantityRule?: PurchaseQuantityRule;

    /**
     * The quantity to set the quantity selector to.
     *
     * @type {number}
     */
    @api
    set quantity(value: number | undefined) {
        if (value !== undefined) {
            this.currentQuantity = value;
        }
    }

    get quantity(): number | undefined {
        return this.currentQuantity;
    }

    /**
     * The increment quantity of the product that is allowed to be be purchased
     *
     * @type {string}
     * @readonly
     */
    get quantityRuleIncrement(): string | null {
        return this.quantityRule?.increment ?? null;
    }

    /**
     * The minimum quantity of the product that may be purchased
     *
     * @type {string}
     * @readonly
     */
    get quantityRuleMinimum(): string | null {
        return this.quantityRule?.minimum ?? null;
    }

    /**
     * The maximum quantity of the product that may be purchased
     *
     * @type {string}
     * @readonly
     */
    get quantityRuleMaximum(): string | null {
        return this.quantityRule?.maximum ?? null;
    }

    /**
     * Whether the quantity provided is valid
     *
     * @type {Boolean}
     * @readonly
     */
    isQuantityValid = true;

    /**
     * Quantity that is currently set in the input field
     */
    currentQuantity?: number;

    /**
     * Whether the addquantity component is disabled
     * @type {Boolean}
     */
    @api disabled = false;

    /**
     * Gets or sets the name of the optional SLDS icon (e.g. "utility:success") to be displayed alongside the button text.
     * If no value is provided (i.e. the value is null, undefined, or an empty string), no icon is displayed.
     *
     * @type {String}
     */
    @api
    iconName?: string;

    /**
     * Gets or sets the Quantity Rules Minimum Text
     * @type {string}
     */
    @api
    minimumText?: string;

    /**
     * Gets or sets the Quantity Rules Maximum Text
     * @type {string}
     */
    @api
    maximumText?: string;

    /**
     * Gets or sets the Quantity Rules Increment Text
     * @type {string}
     */
    @api
    incrementText?: string;

    /**
     * Gets or sets the label for Quantity Rules
     * @type {string}
     */
    @api
    quantitySelectorLabel?: string;

    /**
     * The style of the add to cart button (primary/secondary/tertiary)
     */
    @api
    buttonVariant?: ButtonVariant;

    /**
     * Gets or sets whether the 'add to cart' button is disabled
     *
     * @type {Boolean}
     * @readonly
     */
    get buttonDisabled(): boolean {
        return this.disabled || !this.isQuantityValid;
    }

    /**
     * Handler for the 'valuechanged' event fired from the
     * 'quantity-selector'
     *
     * @param {Object} evt the event object
     */
    handleValueChanged(evt: { detail: ChangeEventDetail }): void {
        this.isQuantityValid = evt.detail?.isValid;
        this.currentQuantity = evt?.detail?.value;
    }

    /**
     * Handler for the 'click' event fired from the 'add-to-cart'
     *
     * @param {Object} evt the event object
     */
    handleAddToCart(evt: CustomEvent): void {
        evt.stopPropagation();
        const event = new CustomEvent(ADD_PRODUCT_TO_CART_EVT, {
            bubbles: true,
            composed: true,
            detail: { quantity: this.currentQuantity },
        });
        this.dispatchEvent(event);
    }
}
