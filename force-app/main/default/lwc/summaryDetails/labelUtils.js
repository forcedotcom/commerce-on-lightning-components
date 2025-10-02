/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
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

export const confirmationTitle = (locale) => getTranslatedLabel('confirmationTitle', locale);
export const subtotalLabel = (locale) => getTranslatedLabel('subtotalLabel', locale);
export const promotionsLabel = (locale) => getTranslatedLabel('promotionsLabel', locale);
export const shippingLabel = (locale) => getTranslatedLabel('shippingLabel', locale);
export const shippingDiscountLabel = (locale) => getTranslatedLabel('shippingDiscountLabel', locale);
export const taxesLabel = (locale) => getTranslatedLabel('taxesLabel', locale);
export const totalLabel = (locale) => getTranslatedLabel('totalLabel', locale);
export const tbdLabel = (locale) => getTranslatedLabel('tbdLabel', locale);
export const freeShippingLabel = (locale) => getTranslatedLabel('freeShippingLabel', locale);
export const defaultDeliveryMessage = (locale) => getTranslatedLabel('defaultDeliveryMessage', locale);
export const footerMessage = (locale) => getTranslatedLabel('footerMessage', locale);
export const orderSummaryAssistiveText = (locale) => getTranslatedLabel('orderSummaryAssistiveText', locale);
export const cartSummaryAssistiveText = (locale) => getTranslatedLabel('cartSummaryAssistiveText', locale);
export const toggleExpandAssistiveText = (locale) => getTranslatedLabel('toggleExpandAssistiveText', locale);
export const toggleCollapseAssistiveText = (locale) => getTranslatedLabel('toggleCollapseAssistiveText', locale);
export const toggleExpandCartAssistiveText = (locale) => getTranslatedLabel('toggleExpandCartAssistiveText', locale);
export const toggleCollapseCartAssistiveText = (locale) =>
    getTranslatedLabel('toggleCollapseCartAssistiveText', locale);
export const orderItemsAssistiveText = (locale) => getTranslatedLabel('orderItemsAssistiveText', locale);
export const cartItemsAssistiveText = (locale) => getTranslatedLabel('cartItemsAssistiveText', locale);
export const orderTotalsAssistiveText = (locale) => getTranslatedLabel('orderTotalsAssistiveText', locale);
export const cartTotalsAssistiveText = (locale) => getTranslatedLabel('cartTotalsAssistiveText', locale);
export const orderIdLabel = (locale) => getTranslatedLabel('orderIdLabel', locale);
