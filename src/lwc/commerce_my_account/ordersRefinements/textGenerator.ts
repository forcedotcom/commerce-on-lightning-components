import { totalResults, oneResult } from './labels';

/**
 * Generates a localized String to show the number of records on the page
 *
 * @param {number} count
 * Number of records on the page
 *
 * @returns {string}
 * returns a localized String with number of records on the page
 */
export default function generateTextForTotalResults(count: number): string {
    return count > 1 ? totalResults.replace('{count}', count.toString()) : oneResult;
}
