import currencyFormatter from 'commerce/currencyFormatter';

/**
 * @description Generate a label for text that will contain a currency value
 * @export
 * @param {(string | undefined)} labelTemplate Template string that contains a placeholder that will be replaced
 * @param {(string | number | undefined)} amount The currency amount
 * @param {(string | undefined)} currencyCode currency iso code
 * @param {(placeHolderText | undefined)} [placeHolderText='{0}'] the placeholder text within the labelTemplate that will be replaced
 * @returns {string}
 */
export function getPriceLabel(
    labelTemplate: string | undefined,
    amount: string | number | undefined,
    currencyCode: string | undefined,
    placeHolderText: string | undefined = '{0}'
): string {
    const currencyValue = currencyFormatter(currencyCode, amount, 'symbol');
    return labelTemplate?.replace(placeHolderText, currencyValue) ?? '';
}

/**
 * @description Generate a label from a template string and a generic text value
 * @export
 * @param {(string | undefined)} labelTemplate Template string that contains a placeholder that will be replaced
 * @param {(string | undefined)} name generic string that will be inserted into the templateLabel
 * @param {(string | undefined)} [placeHolderText='{name}'] the placeholder text within the labelTemplate that will be replaced
 * @return {*}  {string}
 */
export function getProductLabel(
    labelTemplate: string | undefined,
    name: string | undefined,
    placeHolderText: string | undefined = '{name}'
): string {
    return labelTemplate?.replace(placeHolderText, name ?? '').trim() ?? '';
}
