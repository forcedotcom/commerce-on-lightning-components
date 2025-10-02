/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

/*
 * @description Group all Custom Labels for commonCarousel in one place
 */

import { LABEL_DATA } from './labels';

// Helper function to get translated label using shared utility
/**
 * Gets a translated label for the given key and locale
 * @param {string} labelKey - The key to look up in the label data
 * @param {string} locale - The locale code (e.g., 'en-US', 'es-ES', 'fr-FR')
 * @returns {string} The translated label or fallback value
 */
function getTranslatedLabel(labelKey, locale = 'en_US') {
    const label = LABEL_DATA[labelKey];
    if (label && label[locale]) {
        return label[locale];
    }
    if (label && label.en_US) {
        return label.en_US;
    }
    return labelKey;
}

/**
 * Gets a translated label with parameter substitution
 * @param {string} labelKey - The key to look up in the label data
 * @param {string} locale - The locale code
 * @param {...any} params - Parameters to substitute in the label (e.g., {0}, {1})
 * @returns {string} The translated label with parameters substituted
 */
function getTranslatedLabelWithParams(labelKey, locale = 'en_US', ...params) {
    let label = getTranslatedLabel(labelKey, locale);
    params.forEach((param, index) => {
        label = label.replace(`{${index}}`, param);
    });
    return label;
}

// Export individual label functions
export const previousImage = (locale) => getTranslatedLabel('previousImage', locale);
export const nextImage = (locale) => getTranslatedLabel('nextImage', locale);
export const previousProduct = (locale) => getTranslatedLabel('previousProduct', locale);
export const nextProduct = (locale) => getTranslatedLabel('nextProduct', locale);
export const productPrice = (locale) => getTranslatedLabel('productPrice', locale);
export const outOfStock = (locale) => getTranslatedLabel('outOfStock', locale);
export const viewImageAriaLabel = (locale, current, total) =>
    getTranslatedLabelWithParams('viewImageAriaLabel', locale, current, total);
export const viewProductAriaLabel = (locale, current, total) =>
    getTranslatedLabelWithParams('viewProductAriaLabel', locale, current, total);
