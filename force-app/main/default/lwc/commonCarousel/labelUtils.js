/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

/*
 * @description Group all Custom Labels for commonCarousel in one place
 * Uses shared labelService for translation logic
 */

import { getTranslatedLabel } from 'c/labelService';
import { LABEL_DATA } from './labels';

/**
 * Gets a translated label with parameter substitution
 * @param {string} labelKey - The key to look up in the label data
 * @param {string} locale - The locale code
 * @param {...any} params - Parameters to substitute in the label (e.g., {0}, {1})
 * @returns {string} The translated label with parameters substituted
 */
function getTranslatedLabelWithParams(labelKey, locale = 'en_US', ...params) {
    let label = getTranslatedLabel(labelKey, LABEL_DATA, locale);
    params.forEach((param, index) => {
        label = label.replace(`{${index}}`, param);
    });
    return label;
}

// Export individual label functions
export const previousImage = (locale) => getTranslatedLabel('previousImage', LABEL_DATA, locale);
export const nextImage = (locale) => getTranslatedLabel('nextImage', LABEL_DATA, locale);
export const previousProduct = (locale) => getTranslatedLabel('previousProduct', LABEL_DATA, locale);
export const nextProduct = (locale) => getTranslatedLabel('nextProduct', LABEL_DATA, locale);
export const productPrice = (locale) => getTranslatedLabel('productPrice', LABEL_DATA, locale);
export const outOfStock = (locale) => getTranslatedLabel('outOfStock', LABEL_DATA, locale);
export const viewImageAriaLabel = (locale, current, total) =>
    getTranslatedLabelWithParams('viewImageAriaLabel', locale, current, total);
export const viewProductAriaLabel = (locale, current, total) =>
    getTranslatedLabelWithParams('viewProductAriaLabel', locale, current, total);
export const showMoreProducts = (locale) => getTranslatedLabel('showMoreProducts', LABEL_DATA, locale);
