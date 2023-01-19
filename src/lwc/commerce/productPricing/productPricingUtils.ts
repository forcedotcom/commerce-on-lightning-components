/**
 * Determines whether the original (list) price should be displayed given available pricing information
 * @param {Boolean} showNegotiatedPrice Whether negotiated price should be displayed
 * @param {Boolean} showOriginalPrice Whether original (list) price should be displayed
 * @param {string} negotiatedPrice The negotiated price of an item
 * @param {string} originalPrice The original (list) price of an item
 * @returns {Boolean} true if the original (list) price should be displayed, otherwise false
 */
export default function displayOriginalPrice(
    showNegotiatedPrice: boolean,
    showOriginalPrice: boolean,
    negotiatedPrice: string | undefined,
    originalPrice: string | undefined
): boolean {
    const showBothPrices = showOriginalPrice && showNegotiatedPrice;
    const originalPriceExists = !!originalPrice && Number(originalPrice) >= 0;
    const negotiatedPriceExists = !!negotiatedPrice && Number(negotiatedPrice) >= 0;
    const originalPriceIsAvailableAndGreaterThanNegotiatedPrice =
        originalPriceExists && negotiatedPriceExists && Number(originalPrice) > Number(negotiatedPrice);

    // Display the original price if both the original and negotiated prices are available and need to be shown, and the original price is greater than the negotiated price (W-6847766)
    return showBothPrices && originalPriceIsAvailableAndGreaterThanNegotiatedPrice;
}
