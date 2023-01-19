import { maximumCount } from './labels';
import { NUMBER_FORMATTER } from './constants';

/**
 * Generates a localized description of number of items in a cart.
 *
 * @param {number} count
 * Number of product types or items counts in a cart.
 *
 * @param {number} maxLimit
 * Number of maximum badge count limit in a cart.
 *
 * @returns {string}
 * If {@see count} is a positive number
 *  - greater than {@see maxLimit} generates a localized string '999+'
 *  - less than or equal to {@see maxLimit} generates a localized string describing the number of items or product types in a cart.
 * Else return undefined if no viable label is available
 */
export default function badgeLabelGenerator(count: number | null | undefined, maxLimit: number): string | undefined {
    let returnValue;

    const countValueExists = count !== null && count !== undefined && count > 0;

    if (countValueExists) {
        returnValue =
            count > maxLimit
                ? maximumCount.replace('{maximumCount}', NUMBER_FORMATTER.format(maxLimit))
                : NUMBER_FORMATTER.format(count);
    }
    return returnValue;
}
