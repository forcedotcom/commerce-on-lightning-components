/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';
import { ADD_PRODUCT_TO_CART_EVT, DEFAULT_QUANTITY, OUT_OF_STOCK_EVT } from './constants';

/**
 * An event fired when the user indicates a desire to add a quantity of an item to their cart.
 * @event ProductQuantityAdd#addproducttocart
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {number} detail.quantity
 *   The quantity of the product to add to the cart
 */

/**
 * An event fired when the inventory validation takes place
 * @event ProductQuantityAdd#outofstock
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {boolean} detail.isOutOfStock
 *   The boolean flag to indicate availability of the product
 */

/**
 * @typedef {('primary' | 'secondary' | 'tertiary')} ButtonVariant
 */

/**
 * @typedef {object} PurchaseQuantityRule
 * @property {?string} minimum The minimum purchase quantity
 * @property {?string} maximum The maximum purchase quantity
 * @property {?string} increment
 *   The stepping interval used to increment the purchase quantity
 *   when clicking the up and down spinner buttons
 */

/**
 * A UI control to add N number of product to the cart
 * @fires ProductQuantityAdd#addproducttocart
 * @fires ProductQuantityAdd#outofstock
 */
export default class ProductQuantityAdd extends LightningElement {
    static renderMode = 'light';

    /**
     * Whether the quantity provided is invalid
     * @type {boolean}
     * @private
     */
    isQuantityInvalid = false;

    /**
     * In PQR mode, the inventory count is validated against the PQR rule.
     * When the inventory is invalid, we show out of stock label and disable the button.
     * @type {boolean}
     * @private
     */
    isInventoryInvalid = false;

    /**
     * Quantity that is currently set in the input field
     * @type {number}
     * @private
     */
    currentQuantity = DEFAULT_QUANTITY;

    /**
     * Gets or sets the text of the button that triggers the addition of items.
     * @type {?string}
     */
    @api
    buttonText;

    /**
     * The style of the add to cart button (primary/secondary/tertiary)
     * @type {?ButtonVariant}
     */
    @api
    buttonVariant;

    /**
     * Rule which constrains what quantities of a product may be purchased.
     * @type {?PurchaseQuantityRule}
     * @example
     *   {
     *      minimum : '10.0',
     *      maximum : '100.0',
     *      increment : '5.0'
     *  }
     */
    @api
    quantityRule;

    /**
     * Label for Inventory Information: Out of Stock
     * @type {?string}
     */
    @api
    outOfStockText;

    /**
     * Inventory count for a productId
     * @type {?number}
     */
    @api
    availableQuantity;

    /**
     * The quantity to set the quantity selector to.
     * @type {?number}
     */
    @api
    set quantity(value) {
        if (value !== undefined) {
            this.currentQuantity = value;
        }
    }
    get quantity() {
        return this.currentQuantity;
    }

    /**
     * Whether the component should be disabled
     * @type {boolean}
     */
    @api
    disabled = false;

    /**
     * Gets or sets the name of the optional SLDS icon (e.g. "utility:success") to be displayed alongside the button text.
     * If no value is provided (i.e. the value is null, undefined, or an empty string), no icon is displayed.
     * @type {?string}
     */
    @api
    iconName;

    /**
     * Gets or sets the Quantity Rules Minimum Text
     * @type {?string}
     */
    @api
    minimumText;

    /**
     * Gets or sets the Quantity Rules Maximum Text
     * @type {?string}
     */
    @api
    maximumText;

    /**
     * Gets or sets the Quantity Rules Increment Text
     * @type {?string}
     */
    @api
    incrementText;

    /**
     * Gets or sets the label for Quantity Rules
     * @type {?string}
     */
    @api
    quantitySelectorLabel;

    /**
     * Gets the text of the button based on inversion of the product.
     * Do not compute the logic for inventory check here. Let the quantity selector handle the logic.
     * @type {?string}
     * @readonly
     * @private
     */
    get computedAddToCartButtonText() {
        return this.isInventoryInvalid ? this.outOfStockText : this.buttonText;
    }

    /**
     * The increment quantity of the product that is allowed to be be purchased
     * @type {?string}
     * @readonly
     * @private
     */
    get quantityRuleIncrement() {
        return this.quantityRule?.increment ?? null;
    }

    /**
     * The minimum quantity of the product that may be purchased
     * @type {?string}
     * @readonly
     * @private
     */
    get quantityRuleMinimum() {
        return this.quantityRule?.minimum ?? null;
    }

    /**
     * The maximum quantity of the product that may be purchased
     * @type {?string}
     * @readonly
     * @private
     */
    get quantityRuleMaximum() {
        return this.quantityRule?.maximum ?? null;
    }

    /**
     * Gets whether the 'add to cart' button is disabled
     * @type {boolean}
     * @readonly
     * @private
     */
    get buttonDisabled() {
        return this.disabled || this.isQuantityInvalid || this.isInventoryInvalid;
    }

    /**
     * Whether to show a button icon
     * @type {boolean}
     * @readonly
     * @private
     */
    get hasIcon() {
        return Boolean(this.iconName);
    }

    /**
     * Gets the button icon's variant
     * @type {?'inverse'}
     * @readonly
     * @private
     */
    get buttonIconVariant() {
        return this.buttonVariant === 'primary' ? 'inverse' : undefined;
    }

    /**
     * Handler for the 'valuechanged' event fired from the
     * 'quantity-selector'
     * @param {CustomEvent} event the event object
     * @private
     */
    handleValueChanged(event) {
        const value = event?.detail?.value;
        this.isQuantityInvalid = false;
        this.currentQuantity = value !== undefined && value !== null ? value : DEFAULT_QUANTITY;
    }

    /**
     * Handler for the 'validitychanged' event fired from the
     * 'quantity-selector'
     * @param {CustomEvent} event the event object
     * @private
     */
    handleValidityChanged(event) {
        this.isQuantityInvalid = !event.detail?.isValid;
    }

    /**
     * Handler for the 'outofstock' event fired from the
     * 'quantity-selector'
     * @param {CustomEvent} event the event object
     * @private
     */
    handleOutOfStock(event) {
        event.stopPropagation();
        this.isInventoryInvalid = event.detail?.isOutOfStock;
        this.dispatchEvent(
            new CustomEvent(OUT_OF_STOCK_EVT, {
                detail: {
                    isOutOfStock: this.isInventoryInvalid,
                },
            })
        );
    }

    /**
     * Handler for the 'click' event fired from the 'add-to-cart'
     * @param {CustomEvent} event the event object
     * @private
     */
    handleAddToCart(event) {
        event.stopPropagation();
        this.dispatchEvent(
            new CustomEvent(ADD_PRODUCT_TO_CART_EVT, {
                bubbles: true,
                composed: true,
                detail: {
                    quantity: this.currentQuantity,
                },
            })
        );
    }
}
