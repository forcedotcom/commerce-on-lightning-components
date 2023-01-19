/**
 * Determines whether the discount (promotion) price should be displayed given available pricing information
 * @returns {boolean} true if the discount (promotion) price should be displayed, otherwise false
 */
export function displayDiscountPrice(showDiscountPrice: boolean, discountPrice: string | undefined | null): boolean {
    const discountPriceExists =
        typeof discountPrice === 'string' && !isNaN(parseFloat(discountPrice)) && Number(discountPrice) < 0;

    // Display the discount price if the discount price is available and need to be shown
    return showDiscountPrice && discountPriceExists;
}
