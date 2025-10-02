/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

/*
 * @description Label functions and helper utilities for productDetails
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
export const addToCartAssistiveText = (locale) => getTranslatedLabel('Product_addToCartAssistiveText', locale);
export const quantityLabelAssistiveText = (locale) => getTranslatedLabel('Product_quantityLabelAssistiveText', locale);
export const currentPriceAssistiveText = (locale) => getTranslatedLabel('Product_currentPriceAssistiveText', locale);
export const originalPriceAssistiveText = (locale) => getTranslatedLabel('Product_originalPriceAssistiveText', locale);
export const pricingSectionAssistiveText = (locale) =>
    getTranslatedLabel('Product_pricingSectionAssistiveText', locale);
export const featuresSectionAssistiveText = (locale) =>
    getTranslatedLabel('Product_featuresSectionAssistiveText', locale);
export const variantsSectionAssistiveText = (locale) =>
    getTranslatedLabel('Product_variantsSectionAssistiveText', locale);
export const quantitySectionAssistiveText = (locale) =>
    getTranslatedLabel('Product_quantitySectionAssistiveText', locale);
export const quantityControlsAssistiveText = (locale) =>
    getTranslatedLabel('Product_quantityControlsAssistiveText', locale);
export const decreaseQuantityAssistiveText = (locale) =>
    getTranslatedLabel('Product_decreaseQuantityAssistiveText', locale);
export const increaseQuantityAssistiveText = (locale) =>
    getTranslatedLabel('Product_increaseQuantityAssistiveText', locale);
export const loadingSpinnerAltText = (locale) => getTranslatedLabel('Product_loadingSpinnerAltText', locale);

// Additional labels that might be useful
export const quantityLabelText = (locale) => getTranslatedLabel('Product_quantityLabelText', locale);
export const originalPriceLabelText = (locale) => getTranslatedLabel('Product_originalPriceLabelText', locale);
export const currentPriceLabelText = (locale) => getTranslatedLabel('Product_currentPriceLabelText', locale);
export const strikethroughAssistiveText = (locale) =>
    getTranslatedLabel('Product_Pricing_strikethroughAssistiveText', locale);
