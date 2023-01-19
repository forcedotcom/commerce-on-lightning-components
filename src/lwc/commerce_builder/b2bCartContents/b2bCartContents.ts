import { api } from 'lwc';
import CartContents from 'commerce_builder/cartContents';

import type { CartItemData } from 'commerce_data_provider/cartDataProvider';
/**
 * @slot emptyHeaderLabel ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Cart", textDisplayInfo: "{\"headingTag\": \"h1\", \"textStyle\": \"heading-large\"}", "textDecoration": "{\"bold\": true}" }}] })
 * @slot emptyHeaderCount ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "0", textDisplayInfo: "{\"headingTag\": \"h1\", \"textStyle\": \"heading-large\"}", "textDecoration": "{\"bold\": false}" }}] })
 * @slot itemsHeaderLabel ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Cart", textDisplayInfo: "{\"headingTag\": \"h1\", \"textStyle\": \"heading-large\"}", "textDecoration": "{\"bold\": true}" }}] })
 * @slot itemsHeaderCount ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "{!Cart.Details.totalProductCount}", textDisplayInfo: "{\"headingTag\": \"h1\", \"textStyle\": \"heading-large\"}", "textDecoration": "{\"bold\": false}" }}] })
 * @slot intermediateHeaderLabel ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Cart", textDisplayInfo: "{\"headingTag\": \"h1\", \"textStyle\": \"heading-large\"}", "textDecoration": "{\"bold\": true}" }}] })
 * @slot intermediateHeaderCount
 * @slot footerClearCart ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: { text: "Clear Cart", textDisplayInfo: "{\"textStyle\": \"body-regular\"}" }}] })
 * @slot emptyBody ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Your cart is empty", textDisplayInfo: "{\"headingTag\": \"h1\", \"textStyle\": \"heading-large\"}", "textDecoration": "{\"bold\": true}", textAlign: "center" }}, { descriptor: "dxp_base/textBlock", attributes: {text: "Search or browse products, and add them to your cart.  Your selections appear here.", textDisplayInfo: "{\"headingTag\": \"p\", \"textStyle\": \"body-regular\"}", "textDecoration": "{\"bold\": false}", textAlign: "center" }}, { descriptor: "dxp_base/button", attributes: { text: "Continue Shopping", url: "/" }}] })
 * @slot itemsBody ({ locked: false, defaultContent: [{ descriptor: "commerce_builder/cartItems", attributes: { showRemoveItem: true, showProductImage: true, showProductVariants: true, showPricePerUnit: true, showTotalPrices: true, showOriginalPrice: true, showActualPrice: true, showPromotions: true, showSku: true }}] })
 * @slot intermediateBody
 */
export default class B2bCartContents extends CartContents {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light';

    /**
     * @description List of cart items as provided from the data provider;
     */
    @api get items(): CartItemData[] | undefined {
        return this._items;
    }

    set items(value: CartItemData[] | undefined) {
        if (value === undefined) {
            this.isLoadingData = true;
        } else if (!this.actionProcessing) {
            this.isLoadingData = false;
        }

        this._items = value;
    }
}
