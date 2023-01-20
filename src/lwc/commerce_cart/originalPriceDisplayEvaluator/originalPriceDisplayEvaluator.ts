/**
 * Determines whether the original (list) price should be displayed given available pricing information
 * @param {boolean} showNegotiatedPrice Whether negotiated price should be displayed
 * @param {boolean} showOriginalPrice Whether original (list) price should be displayed
 * @param {string} negotiatedPrice The negotiated price of an item
 * @param {string} originalPrice The original (list) price of an item
 * @returns {boolean} true if the original (list) price should be displayed, otherwise false
 */
export default function canDisplayOriginalPrice(
    showNegotiatedPrice: boolean,
    showOriginalPrice: boolean,
    negotiatedPrice: string | number | null | undefined,
    originalPrice: string | number | null | undefined
): boolean {
    const showBothNegotiatedPriceAndOriginalPrice = showOriginalPrice && showNegotiatedPrice;
    const originalPriceExists = originalPrice !== null && originalPrice !== undefined && Number(originalPrice) >= 0;
    const negotiatedPriceExists =
        negotiatedPrice !== null && negotiatedPrice !== undefined && Number(negotiatedPrice) >= 0;
    const originalPriceIsAvailableAndGreaterThanNegotiatedPrice =
        originalPriceExists && negotiatedPriceExists && Number(originalPrice) > Number(negotiatedPrice);

    // Display the original price if both the original and negotiated prices are available and need to be shown, and the original price is greater than the negotiated price
    return showBothNegotiatedPriceAndOriginalPrice && originalPriceIsAvailableAndGreaterThanNegotiatedPrice;
}
