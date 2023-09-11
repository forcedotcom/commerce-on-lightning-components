/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import resultsLabels from './labels';
import { DISPLAY_MODE } from './constants';
/**
 *
 * @param filtersDetails
 */
export function getDisplayMode(filtersDetails) {
    if (filtersDetails?.categories?.selectedCategory?.id) {
        return DISPLAY_MODE.PRODUCT_LIST;
    }
    return DISPLAY_MODE.SEARCH_RESULTS;
}

/**
 * Generates a localized label header for a Search Result or Product List page.
 * @param {?number} displayCount number of items displaying in the list
 * @param {?string} displayMode display mode
 * @returns {(string | undefined)}
 *  If {@see displayCount} is a positive or a zero value, then a localized label representing the number of results;
 *  otherwise, undefined.
 */
export function generateLabels(displayCount, displayMode) {
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
        return labelSrc.replace('{count}', displayCount.toString());
    }
    return undefined;
}
