import LOCALE from '@salesforce/i18n/locale';
import originalPriceAssistiveText from '@salesforce/label/Commerce_Cart_Summary.originalPriceAssistiveText';

/**
 * Constructs the label for the orginal (strike through) price of a product or for the cart summary.
 * Specifically, this label is intented to be used for screen readers.
 *
 * @param {string} currencyCode an ISO 4217 representation of the currency code
 * @param {string} originalPrice the original price to add to the label
 * @returns {string} the label to assign to the original price of a product or cart summary.  Returns a
 *                   string in the form of: "Original price (crossed out): $240", or an empty string if
 *                   the currencyCode or originalPrice is invalid
 */
export function getLabelForOriginalPrice(
    currencyCode: string | null | undefined | unknown,
    originalPrice: string | null | undefined | unknown
): string {
    let result = '';
    if (typeof currencyCode !== 'string' || !originalPrice) {
        return result;
    }

    try {
        const formattedCurrency = new Intl.NumberFormat(LOCALE, {
            style: 'currency',
            currency: currencyCode,
        }).format(Number(originalPrice));
        result = originalPriceAssistiveText.replace('{0}', formattedCurrency);
    } catch (e) {
        // noop to swallow error if currency code is invalid
    }

    return result;
}
