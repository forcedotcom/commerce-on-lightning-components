/**
 * The event name constants.
 */
export const EVENT = {
    /**
     * Event to show a product detail page.
     */
    SHOW_PRODUCT_EVT: 'showproduct',
    /**
     * Event to add this product to cart.
     */
    ADD_PRODUCT_TO_CART_EVT: 'addproducttocart',
};

/**
 * The product class constants.
 */
export const PRODUCT_CLASS = {
    VARIATION: 'Variation',
    VARIATION_PARENT: 'VariationParent',
    SIMPLE: 'Simple',
    SET: 'Set',
};

/**
 * The dafault inline quantity selector constants
 */
export const QUANTITY_RULES = {
    DEFAULT_MIN: 1,
    DEFAULT_MAX: 1000000,
    DEFAULT_INCREMENT: 1,
};
