/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */

/**
 * @file Shared label utility service for all components
 * @description This module provides centralized label translation functionality
 * that eliminates duplication across multiple components. It handles locale fallback
 * and provides a consistent interface for retrieving localized labels.
 *
 * Usage:
 * ```javascript
 * import { getTranslatedLabel } from 'c/labelService';
 * import { LABEL_DATA } from './labels';
 *
 * const label = getTranslatedLabel('myLabelKey', LABEL_DATA, 'fr');
 * ```
 */

/**
 * Gets a translated label for the given key and locale with fallback logic.
 *
 * Lookup order:
 * 1. Requested locale (e.g., 'fr')
 * 2. Default locale 'en_US'
 * 3. Return the labelKey itself if no translation found
 * @param {string} labelKey - The key to look up in the label data
 * @param {object} LABEL_DATA - The label data object containing translations
 *                              Format: { labelKey: { locale: 'translated text', ... }, ... }
 * @param {string} [locale] - The locale code (e.g., 'en_US', 'es', 'fr', 'de')
 * @returns {string} The translated label, or fallback value
 * @example
 * const LABEL_DATA = {
 *     welcomeMessage: {
 *         en_US: 'Welcome',
 *         es: 'Bienvenido',
 *         fr: 'Bienvenue'
 *     }
 * };
 *
 * getTranslatedLabel('welcomeMessage', LABEL_DATA, 'fr');  // Returns: 'Bienvenue'
 * getTranslatedLabel('welcomeMessage', LABEL_DATA, 'de');  // Returns: 'Welcome' (fallback)
 * getTranslatedLabel('unknownKey', LABEL_DATA, 'fr');      // Returns: 'unknownKey'
 */
export function getTranslatedLabel(labelKey, LABEL_DATA, locale = 'en_US') {
    // Validate inputs
    if (!labelKey || typeof labelKey !== 'string') {
        return '';
    }

    if (!LABEL_DATA || typeof LABEL_DATA !== 'object') {
        return labelKey;
    }

    // Get the label object for the requested key
    const label = LABEL_DATA[labelKey];

    // If label doesn't exist, return the key itself
    if (!label || typeof label !== 'object') {
        return labelKey;
    }

    // Try to get translation for requested locale
    if (label[locale]) {
        return label[locale];
    }

    // Fallback to en_US if available
    if (label.en_US) {
        return label.en_US;
    }

    // Last resort: return the key
    return labelKey;
}
