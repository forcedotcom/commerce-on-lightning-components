import { productNameWithUnavailableMessage } from './labels';

/**
 * Generates a localized title in case of invalid attribute
 *
 * @param productName
 * The name of product
 *
 * @param  productUnavailableMessage
 * Message stating product is unavailable
 *
 * returns a localized title with invalid label
 */
export default function generateProductTitle(productName: string, productUnavailableMessage: string): string {
    return productNameWithUnavailableMessage
        .replace('{productName}', productName)
        .replace('{productUnavailableMessage}', productUnavailableMessage);
}
