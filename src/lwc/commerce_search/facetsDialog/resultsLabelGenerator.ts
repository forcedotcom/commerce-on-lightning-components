import resultsLabels from './labels';
import { DISPLAY_MODE } from './constants';

/**
 * Generates a localized label header for a Search Result or Product List page.
 * @param {Number} displayCount number of items displaying in the list
 * @param {ResultType} displayMode result type

 *
 * @returns {String}
 *  If {@see displayCount} is a positive or a zero value, then a localized label representing the number of results;
 *  otherwise, undefined.
 */

export default function generateLabels(
    displayCount: number | undefined | null,
    displayMode: string | undefined
): string | undefined {
    let label;
    let labelSrc;

    if (displayCount === 1) {
        if (displayMode === DISPLAY_MODE.SEARCH_RESULTS) {
            labelSrc = resultsLabels.oneResultSearchHeaderShort;
        } else {
            labelSrc = resultsLabels.oneCategoryHeader;
        }
    } else if (displayCount != null && (displayCount === 0 || displayCount > 1)) {
        if (displayMode === DISPLAY_MODE.SEARCH_RESULTS) {
            labelSrc = resultsLabels.multipleResultSearchHeaderShort;
        } else {
            labelSrc = resultsLabels.multipleCategoryHeader;
        }
    }

    if (labelSrc && displayCount != null) {
        label = labelSrc.replace('{count}', displayCount.toString());
    }

    return label;
}
