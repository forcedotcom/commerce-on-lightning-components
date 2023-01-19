import { emptyCart, itemInCart, itemsInCart, productTypeInCart, productTypesInCart } from './labels';
import type { CountType } from './types';

/**
 * Generates a localized description of the number of items in a cart.
 *
 * @param {string} countType
 *  The type of cart count description to generate. And supported values are "Total" and "Unique".
 * @param {number} count
 *  Number of items or product type counts exist in the cart.
 *
 * @returns {String}
 *  If {@see Number} is a positive or a zero value, a localized string describing the number of cart items,
 * or undefined if no viable label is available
 */
export default function generateLabel(
    countType: CountType | undefined | null,
    count: number | undefined | null
): string | undefined {
    let text;
    let textSrc;
    count = Math.max(count ?? 0, 0);
    if (count === 0) {
        return emptyCart;
    }
    if (countType === 'Total') {
        textSrc = count === 1 ? itemInCart : itemsInCart;
    } else if (countType === 'Unique') {
        textSrc = count === 1 ? productTypeInCart : productTypesInCart;
    }
    if (textSrc) {
        text = textSrc.replace('{0}', count.toString());
    }

    return text;
}
