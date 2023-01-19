import { SimpleStyleMap, StyleStringGenerator } from 'community_styling/inlineStyles';

const defaultOrderAppliedPromotionsStyles = new SimpleStyleMap({
    '--com-c-cart-applied-promotions-background-color': 'default-background-color',
    '--com-c-cart-applied-promotions-font-color': 'default-text-color',
    '--com-c-cart-applied-promotions-heading-font-color': 'default-heading-text-color',
    '--com-c-cart-discount-amount-font-color': 'default-amount-text-color',
    '--com-c-cart-applied-promotions-border-color': 'default-border-color',
    '--com-c-cart-applied-promotions-border-radius': 'default-border-radius',
});

// Export the generators.
export default {
    defaultOrderAppliedPromotionsStyles: new StyleStringGenerator([defaultOrderAppliedPromotionsStyles]),
};
