/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

/*
 * @description Label functions and helper utilities for productDetails
 * Uses shared labelService for translation logic
 */

import { getTranslatedLabel } from 'c/labelService';
import { LABEL_DATA } from './labels';

// Export individual label functions
export const addToCartAssistiveText = (locale) =>
    getTranslatedLabel('Product_addToCartAssistiveText', LABEL_DATA, locale);
export const quantityLabelAssistiveText = (locale) =>
    getTranslatedLabel('Product_quantityLabelAssistiveText', LABEL_DATA, locale);
export const currentPriceAssistiveText = (locale) =>
    getTranslatedLabel('Product_currentPriceAssistiveText', LABEL_DATA, locale);
export const originalPriceAssistiveText = (locale) =>
    getTranslatedLabel('Product_originalPriceAssistiveText', LABEL_DATA, locale);
export const pricingSectionAssistiveText = (locale) =>
    getTranslatedLabel('Product_pricingSectionAssistiveText', LABEL_DATA, locale);
export const featuresSectionAssistiveText = (locale) =>
    getTranslatedLabel('Product_featuresSectionAssistiveText', LABEL_DATA, locale);
export const variantsSectionAssistiveText = (locale) =>
    getTranslatedLabel('Product_variantsSectionAssistiveText', LABEL_DATA, locale);
export const quantitySectionAssistiveText = (locale) =>
    getTranslatedLabel('Product_quantitySectionAssistiveText', LABEL_DATA, locale);
export const quantityControlsAssistiveText = (locale) =>
    getTranslatedLabel('Product_quantityControlsAssistiveText', LABEL_DATA, locale);
export const decreaseQuantityAssistiveText = (locale) =>
    getTranslatedLabel('Product_decreaseQuantityAssistiveText', LABEL_DATA, locale);
export const increaseQuantityAssistiveText = (locale) =>
    getTranslatedLabel('Product_increaseQuantityAssistiveText', LABEL_DATA, locale);
export const loadingSpinnerAltText = (locale) =>
    getTranslatedLabel('Product_loadingSpinnerAltText', LABEL_DATA, locale);

// Additional labels that might be useful
export const quantityLabelText = (locale) => getTranslatedLabel('Product_quantityLabelText', LABEL_DATA, locale);
export const originalPriceLabelText = (locale) =>
    getTranslatedLabel('Product_originalPriceLabelText', LABEL_DATA, locale);
export const currentPriceLabelText = (locale) =>
    getTranslatedLabel('Product_currentPriceLabelText', LABEL_DATA, locale);
export const strikethroughAssistiveText = (locale) =>
    getTranslatedLabel('Product_Pricing_strikethroughAssistiveText', LABEL_DATA, locale);
