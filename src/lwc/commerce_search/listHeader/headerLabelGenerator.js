import headerLabels from './labels.js';
import * as Constants from './constants';

/**
 * Generates a localized label header for a Search Result or Product List page.
 *
 * @param {Number} displayCount number of items displaying in the list
 * @param {Number} displayStartIndex the starting index of items displaying in the list
 * @param {Number} displayEndIndex the last index of items displaying in the list
 * @param {String} displayWord keyword or category that is listing. If displayWord is a category, expected to be a localized string.
 * @param {ResultType} displayMode result type
 *
 * @returns {String}
 *  If {@see displayCount} is a positive or a zero value, then a localized label representing the product list header;
 *  otherwise, undefined.
 */
export default function generateLabel(displayCount, displayStartIndex, displayEndIndex, displayWord, displayMode) {
    let label;
    let labelSrc;

    if (displayCount === 1) {
        if (displayMode === Constants.ResultType.SearchResult) {
            if (displayWord) {
                labelSrc = headerLabels.oneResultSearchHeader;
            } else {
                labelSrc = headerLabels.oneResultSearchHeaderShort;
            }
        } else {
            labelSrc = headerLabels.oneCategoryHeader;
        }
    } else if (displayCount === 0 || displayCount > 1) {
        // We expect indexes to be 1-based
        // Label with index is picked up only if both start and
        // end indexes are >= 1.
        const indexAvailable = displayStartIndex && displayEndIndex && displayStartIndex > 0 && displayEndIndex > 0;

        if (displayMode === Constants.ResultType.SearchResult) {
            if (displayWord) {
                labelSrc = headerLabels[`multipleResultSearchHeader${indexAvailable ? 'WithIndex' : ''}`];
            } else {
                labelSrc = headerLabels[`multipleResultSearchHeaderShort${indexAvailable ? 'WithIndex' : ''}`];
            }
        } else {
            labelSrc = headerLabels[`multipleCategoryHeader${indexAvailable ? 'WithIndex' : ''}`];
        }
    }

    if (labelSrc) {
        label = labelSrc
            .replace('{startIndex}', displayStartIndex)
            .replace('{endIndex}', displayEndIndex)
            .replace('{count}', displayCount)
            .replace('{keyword}', displayWord);
    }

    return label;
}
