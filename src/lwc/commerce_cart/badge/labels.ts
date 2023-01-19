import maximumCount from '@salesforce/label/Commerce_Cart_Badge.maximumCount';
import itemsInCart from '@salesforce/label/Commerce_Cart_Badge.itemsInCart';
import itemInCart from '@salesforce/label/Commerce_Cart_Badge.itemInCart';
import productTypesInCart from '@salesforce/label/Commerce_Cart_Badge.productTypesInCart';
import productTypeInCart from '@salesforce/label/Commerce_Cart_Badge.productTypeInCart';
import returnToCart from '@salesforce/label/Commerce_Cart_Badge.returnToCart';
import emptyCart from '@salesforce/label/Commerce_Cart_Badge.emptyCart';

export {
    /**
     * Label for the maximum item count to be displayed in cart badge, "{maximumCount}+"
     * @type {String}
     */
    maximumCount,
    /**
     * Label indicating how many items are in the cart (Plural), "Cart: {0} items"
     * @type {String}
     */
    itemsInCart,
    /**
     * Label indicating there is one item in the cart, "Cart: 1 item"
     * @type {String}
     */
    itemInCart,
    /**
     * Label indicating the types of the products in the cart, "Cart: {0} product types"
     * @type {String}
     */
    productTypesInCart,
    /**
     * Label indicating the type of the product in the cart, "Cart: 1 product type"
     * @type {String}
     */
    productTypeInCart,
    /**
     * Label for return to cart, "Return to cart"
     * @type {String}
     */
    returnToCart,
    /**
     * Label for empty cart, "Cart: empty"
     * @type {String}
     */
    emptyCart,
};
