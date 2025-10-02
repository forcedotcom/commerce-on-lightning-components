/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

/*
 * @description Group all Custom Labels for commerceHeader in one place
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

// Export individual label functions
export const menu = (locale) => getTranslatedLabel('menu', locale);
export const requestTranscript = (locale) => getTranslatedLabel('requestTranscript', locale);
export const endChat = (locale) => getTranslatedLabel('endChat', locale);
export const minimize = (locale) => getTranslatedLabel('minimize', locale);
export const minimizeAssistive = (locale) => getTranslatedLabel('minimizeAssistive', locale);
export const logoAlt = (locale) => getTranslatedLabel('logoAlt', locale);
export const closeButtonAssistiveText = (locale) => getTranslatedLabel('closeButtonAssistiveText', locale);
export const defaultHeaderText = (locale) => getTranslatedLabel('defaultHeaderText', locale);
