/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

/*
 * @description Label functions and helper utilities for cartSummary
 */

import { LABEL_DATA } from './labels';

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

// Export individual label functions
export const cartSummaryRegionLabel = (locale) => getTranslatedLabel('cartSummaryRegionLabel', locale);
export const loadingSpinnerAltText = (locale) => getTranslatedLabel('loadingSpinnerAltText', locale);
export const checkoutButtonLabel = (locale) => getTranslatedLabel('checkoutButtonLabel', locale);
export const checkoutButtonAssistiveText = (locale) => getTranslatedLabel('checkoutButtonAssistiveText', locale);
export const checkoutNotAvailableAssistiveText = (locale) =>
    getTranslatedLabel('checkoutNotAvailableAssistiveText', locale);
