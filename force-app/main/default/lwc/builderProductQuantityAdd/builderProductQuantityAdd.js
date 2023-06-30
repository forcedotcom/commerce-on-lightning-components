/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { createCartItemAddAction, dispatchAction } from 'commerce/actionApi';
import { CartStatusAdapter } from 'commerce/cartApi';

const cartPage = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Current_Cart',
    },
};

export default class BuilderProductQuantityAdd extends LightningElement {
    static renderMode = 'light';

    @wire(CartStatusAdapter)
    cartStatus;

    @wire(NavigationContext)
    navContext;

    @api
    product;

    @api
    productInventory;

    @api
    productVariant;

    @api
    buttonText;

    @api
    buttonProcessingText;

    @api
    minimumValueGuideText;

    @api
    maximumValueGuideText;

    @api
    stepValueGuideText;

    @api
    quantitySelectorLabel;

    @api
    outOfStockText;

    /**
     * Gets whether the cart is processing or (still) loading.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isCartProcessing() {
        return Boolean(this.cartStatus?.data?.isProcessing) || Boolean(this.cartStatus?.loading);
    }

    /**
     * Whether the 'Add to Cart' button should be disabled.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isActionButtonDisabled() {
        return (
            this.isCartProcessing ||
            !this.product ||
            this.productVariant?.isValid === false ||
            this.product?.productClass === 'Set' ||
            this.product?.productClass === 'VariationParent'
        );
    }

    /**
     * Gets the total inventory count for the product.
     * @type {?number}
     * @readonly
     * @private
     */
    get availableQuantity() {
        return this.productInventory?.details?.availableToOrder ?? null;
    }

    get quantityRule() {
        return this.product?.purchaseQuantityRule;
    }

    get normalizedMinimumText() {
        const text = this.minimumValueGuideText;
        const value = this.quantityRule?.minimum;
        return text && value ? text?.replace('{0}', Number(value)) : null;
    }

    get normalizedMaximumGuideText() {
        const text = this.maximumValueGuideText;
        const value = this.quantityRule?.maximum;
        return text && value ? text?.replace('{0}', Number(value)) : null;
    }

    get normalizedIncrementText() {
        const text = this.stepValueGuideText;
        const value = this.quantityRule?.increment;
        return text && value ? text?.replace('{0}', Number(value)) : null;
    }

    get normalizedButtonText() {
        return this.isCartProcessing && this.buttonProcessingText ? this.buttonProcessingText : this.buttonText;
    }

    handleAddToCart({ detail }) {
        const productId = this.product?.id;
        productId &&
            dispatchAction(this, createCartItemAddAction(productId, detail.quantity), {
                onSuccess: () => {
                    navigate(this.navContext, cartPage);
                },
            });
    }
}
