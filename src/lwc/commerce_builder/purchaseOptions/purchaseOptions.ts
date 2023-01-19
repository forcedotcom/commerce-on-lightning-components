import { api, LightningElement, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { DataProviderActionEvent } from 'experience/dataProvider';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type { ProductDetailData, PurchaseQuantityRule } from 'commerce/productApi';
import type { SessionContext } from 'commerce/contextApi';
import { SessionContextAdapter } from 'commerce/contextApi';
import type { ChangeEventDetail } from 'commerce/numberInput';
import type { AddItemToCartActionPayload } from 'commerce_data_provider/productDataProvider';
import type { LightningNavigationContext } from 'types/common';
import type { LightningDialog, SelectedVariant, QuantityGuides } from './types';
import importedLabels from './labels';
import { computePurchaseRuleSet } from './utils';
import type { SelectedQuantityChangedPayload } from 'src/lwc/commerce_data_provider/productDataProvider/types';
import { handleAddToCartErrorWithToast } from 'commerce_product_details/addToCartUtils';
import type { StoreActionError } from 'experience/store';
import type { CommerceError } from 'commerce/cartApi';

/**
 * @slot combinedPurchaseQuantityRuleInfo ({defaultContent: [ { descriptor: "dxp_base/textBlock", attributes: { "textDisplayInfo": "{\"headingTag\": \"h3\", \"textStyle\": \"heading-small\"}", text: "Minimum Quantity is {!Product.Details.purchaseQuantityRule.minimumNumber} • Maximum Quantity is {!Product.Details.purchaseQuantityRule.maximumNumber} • Sold in increments of {!Product.Details.purchaseQuantityRule.incrementNumber}"} }]})
 */
export default class PurchaseOptions extends LightningElement {
    static renderMode = 'light';

    /**
     * Product detail data binding from Data Provider
     * @type { ProductDetailData | Record<string, never> | null }
     */
    @api
    product?: ProductDetailData | Record<string, never> | null;

    /**
     * See SelectedVariant in ProductDataProvider
     */
    @api
    productVariant?: SelectedVariant;

    /**
     * Background color of Add to Cart Button
     *
     * @type {Color}
     */
    @api
    addToCartButtonBackgroundColor?: string;

    /**
     * Background color of Add to Cart Button on hover
     *
     * @type {Color}
     */
    @api
    addToCartButtonBackgroundHoverColor?: string;

    /**
     * Border color of Add to Cart Button
     *
     * @type {Color}
     */
    @api
    addToCartButtonBorderColor?: string;

    /**
     * Border Radius of Add to Cart Button
     *
     * @type {number}
     */
    @api
    addToCartButtonBorderRadius?: number;

    /**
     * Text of Add to Cart Button
     *
     * @type {string}
     */
    @api
    addToCartButtonText?: string;

    /**
     * Text color of Add to Cart Button on hover
     *
     * @type {Color}
     */
    @api
    addToCartButtonTextColor?: string;

    /**
     * Text color of Add to Cart Button on hover
     *
     * @type {Color}
     */
    @api
    addToCartButtonTextHoverColor?: string;

    /**
     * Label for Quantity Selector ("QTY")
     */
    @api
    quantitySelectorLabel?: string;

    @api
    minimumValueGuideText?: string;

    @api
    maximumValueGuideText?: string;

    @api
    incrementValueGuideText?: string;

    /**
     * Rule which constrains what quantities of a product may be purchased.
     *
     */
    private get quantityRule(): PurchaseQuantityRule | null | undefined {
        return this.product?.purchaseQuantityRule;
    }

    /**
     * Gets or sets the quantity selection guide configuration.
     *
     * If not specified (undefined or null), a default label will be displayed for the quantity selector.
     *
     * @type {QuantityGuides}
     * @example
     *   {
     *      showGuides : true,
     *      minimumValueGuideText : 'minimum number is {0}',
     *      maximumValueGuideText : 'maximum number is {0}',
     *      incrementValueGuideText :'increment number is {0}',
     *  }
     */
    get quantityGuides(): QuantityGuides {
        return {
            minimumValueGuideText: this.minimumValueGuideText,
            maximumValueGuideText: this.maximumValueGuideText,
            incrementValueGuideText: this.incrementValueGuideText,
        };
    }

    /**
     * Handler for the 'quantitychanged' event fired from the
     * 'quantity-selector'
     *
     * @param {CustomEvent} event the event object which has quantity
     */
    handleQuantityChanged({ detail }: CustomEvent<ChangeEventDetail>): void {
        this.dispatchEvent(
            new DataProviderActionEvent<SelectedQuantityChangedPayload>('product:selectedQuantityChanged', {
                quantity: Number(detail.value),
            })
        );
    }

    @wire(NavigationContext)
    private navContext!: LightningNavigationContext;

    @wire(SessionContextAdapter)
    sessionContextEntry?: StoreAdapterCallbackEntry<SessionContext>;

    /**
     * Labels from Core
     */
    private get labels(): Record<string, string> {
        return importedLabels;
    }

    /**
     * Shows a modal after an item is added to the cart.
     * @readonly
     * @private
     * @returns {Object}
     */
    get itemAddedModal(): (LightningDialog & Element) | null {
        return this.querySelector('lightning-dialog');
    }

    /**
     * Sets the custom CSS properties for the Add To Cart Button
     * @returns {string}
     * @readonly
     */
    private get addToCartButtonCssStyles(): string {
        return `
            --com-c-product-details-add-to-cart-button-background-color: ${
                this.addToCartButtonBackgroundColor || 'initial'
            };
            --com-c-product-details-add-to-cart-button-border-color: ${this.addToCartButtonBorderColor || 'initial'};
            --com-c-product-details-add-to-cart-button-border-radius: ${
                this.addToCartButtonBorderRadius ? this.addToCartButtonBorderRadius + 'px' : 'initial'
            };
            --com-c-product-details-add-to-cart-button-text-color: ${this.addToCartButtonTextColor || 'initial'};
            --com-c-product-details-add-to-cart-button-background-hover-color: ${
                this.addToCartButtonBackgroundHoverColor || 'initial'
            };
            --com-c-product-details-add-to-cart-button-text-hover-color: ${
                this.addToCartButtonTextHoverColor || 'initial'
            };`;
    }

    /**
     * Whether the 'Add to Cart' button is disabled
     */
    get isAddToCartButtonDisabled(): boolean {
        return this.productVariant?.isValid === false || this.product?.productClass === 'VariationParent';
    }

    /**
     * If add to cart is enabled based on guest permission.
     */
    private get isAddToCartApiEnabled(): boolean {
        return this.sessionContextEntry?.data?.isLoggedIn === true;
    }

    /**
     * Handles the 'addtocart' event.
     *
     * @param {CustomEvent} event the event object
     */
    handleAddToCart({ detail }: CustomEvent<{ quantity: number }>): void {
        if (!this.isAddToCartApiEnabled) {
            this.navigateToLogin();
            return;
        }

        this.dispatchEvent(
            new DataProviderActionEvent<AddItemToCartActionPayload>(
                'product:addItemToCart',
                {
                    quantity: detail.quantity,
                },
                {
                    onSuccess: (): void => {
                        this.itemAddedModal?.showModal();
                    },
                    onError: (error: unknown): void => {
                        handleAddToCartErrorWithToast((error as StoreActionError)?.error as CommerceError, this);
                    },
                }
            )
        );
    }

    /**
     * Handler for the 'click' event fired from the clear cart button
     * which should show the clear cart modal (Mobile & Desktop)
     */
    private navigateToCart(): void {
        navigate(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Current_Cart',
            },
        });
    }

    /**
     * Handler for the 'click' event fired from the add to cart button
     * which should redirect the user to the login page
     */
    private navigateToLogin(): void {
        navigate(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Login',
            },
        });
    }

    /**
     * Handler for the 'click' event fired from the 'continue shopping' button, (item added modal)
     * which should close the item added modal (Mobile & Desktop)
     */
    private closeModal(): void {
        this.itemAddedModal?.close();
    }
    /**
     * Gets computed purchase rule set
     * @returns {PurchaseRuleSet}
     * @private
     */
    get purchaseRuleSet(): { incrementText: string; minimumText: string; maximumText: string; combinedText: string } {
        return computePurchaseRuleSet(this.quantityRule, this.quantityGuides);
    }

    /**
     * Gets computed purchase rule set
     * @returns {displayCombinedPurchaseQuantityRule}
     */
    get displayCombinedPurchaseQuantityRule(): boolean {
        if (
            typeof this.product?.purchaseQuantityRule?.incrementNumber === 'number' &&
            typeof this.product?.purchaseQuantityRule?.maximumNumber === 'number' &&
            typeof this.product?.purchaseQuantityRule?.minimumNumber === 'number'
        ) {
            return true;
        }
        return false;
    }

    /**
     * Should render product_details-add-quantity if
     * product data is loaded.
     *
     * @returns { boolean }
     */
    get displayAddQuantity(): boolean {
        return this.product !== undefined && this.product !== null;
    }
}
