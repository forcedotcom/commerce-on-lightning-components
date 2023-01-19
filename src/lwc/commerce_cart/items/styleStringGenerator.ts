import { SimpleStyleMap, StyleStringGenerator } from 'community_styling/inlineStyles';

const cartItemsStyles = new SimpleStyleMap({
    '--com-c-cart-item-unit-price-font-color': 'unit-price-font-color',
    '--com-c-cart-item-unit-price-font-size': 'unit-price-font-size',
    '--com-c-cart-item-original-price-font-color': 'original-price-font-color',
    '--com-c-cart-item-original-price-font-size': 'original-price-font-size',
    '--com-c-cart-item-actual-price-font-color': 'actual-price-font-color',
    '--com-c-cart-item-actual-price-font-size': 'actual-price-font-size',
    '--com-c-cart-item-applied-savings-button-font-size': 'applied-savings-button-font-size',
    '--com-c-cart-applied-savings-button-text-color': 'applied-savings-button-text-color',
    '--com-c-cart-item-applied-savings-button-padding': 'applied-savings-button-padding',
    '--com-c-cart-item-applied-savings-button-background-color': 'applied-savings-button-background-color',
    '--com-c-cart-item-applied-savings-button-border-color': 'applied-savings-button-border-color',
    '--com-c-cart-item-applied-savings-button-border-radius': 'applied-savings-button-border-radius',
    '--com-c-cart-item-applied-savings-button-text-color': 'applied-savings-button-text-color',
    '--com-c-cart-item-applied-savings-button-background-hover-color': 'applied-savings-button-background-hover-color',
    '--com-c-cart-item-applied-savings-button-text-hover-color': 'applied-savings-button-text-hover-color',
});

// Export the generators.
export default {
    cartItemsStyles: new StyleStringGenerator([cartItemsStyles]),
};

export function getDxpFontSize(fontSize: 'small' | 'medium' | 'large' | undefined): string {
    switch (fontSize) {
        case 'small':
            return 'var(--dxp-g-font-size-4)';
        case 'medium':
            return 'var(--dxp-g-font-size-5)';
        case 'large':
            return 'var(--dxp-g-font-size-6)';
        default:
            return '';
    }
}

export function getDxpButtonFontSize(fontSize: 'small' | 'medium' | 'large' | undefined): string {
    switch (fontSize) {
        case 'small':
            return 'var(--dxp-s-button-small-font-size)';
        case 'medium':
            return 'var(--dxp-s-button-font-size)';
        case 'large':
            return 'var(--dxp-s-button-large-font-size)';
        default:
            return '';
    }
}
