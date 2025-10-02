/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

/*
 * @description Label functions and helper utilities for dynamicContentRenderer
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
export const categoryRecommendationTextMessageLabel = (locale) =>
    getTranslatedLabel('TextMessage_categoryRecommendations', locale);
export const productSelectionTextMessageLabel = (locale) => getTranslatedLabel('TextMessage_productSelection', locale);
export const addToCartMessageLabel = (locale) => getTranslatedLabel('TextMessage_addProductToCart', locale);
export const addToCartMessageWithNoVariationsLabel = (locale) =>
    getTranslatedLabel('TextMessage_addProductToCartWithNoVariations', locale);
export const invalidResponseMessageLabel = (locale) => getTranslatedLabel('TextMessage_invalidResponseMessage', locale);

export const paymentCompletedLabel = (locale) => getTranslatedLabel('Common_Payment_Completed', locale);
export const paymentFailedLabel = (locale) => getTranslatedLabel('Common_Payment_Failed', locale);
export const paymentCanceledLabel = (locale) => getTranslatedLabel('Common_Payment_Canceled', locale);
export const fallbackPaymentSucceededLabel = (locale) =>
    getTranslatedLabel('Common_Payment_Succeeded_NoPaymentMethod', locale);
export const fallbackPaymentFailedLabel = (locale) =>
    getTranslatedLabel('Common_Payment_Failed_NoPaymentMethod', locale);
export const dynamicContentRegionAriaLabel = (locale) =>
    getTranslatedLabel('Common_DynamicContent_Region_Aria_Label', locale);
export const richTextMessageContentAriaLabel = (locale) =>
    getTranslatedLabel('Common_DynamicContent_RichText_Region_Aria_Label', locale);
export const contextualDescriptionLabel = (locale) =>
    getTranslatedLabel('Common_DynamicContent_Contextual_Description', locale);
// Apple Pay specific labels
export const applePayPaymentFailedLabel = (locale) => getTranslatedLabel('Common_ApplePay_paymentFailed', locale);
export const applePayPaymentCanceledLabel = (locale) => getTranslatedLabel('Common_ApplePay_paymentCanceled', locale);
export const applePayPaymentCompletedLabel = (locale) => getTranslatedLabel('Common_ApplePay_paymentCompleted', locale);
