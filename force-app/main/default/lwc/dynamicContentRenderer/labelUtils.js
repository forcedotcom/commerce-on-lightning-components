/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

/*
 * @description Label functions and helper utilities for dynamicContentRenderer
 * Uses shared labelService for translation logic
 */

import { getTranslatedLabel } from 'c/labelService';
import { LABEL_DATA } from './labels';

// Export individual label functions
export const productSelectionTextMessageLabel = (locale) =>
    getTranslatedLabel('TextMessage_productSelection', LABEL_DATA, locale);
export const addToCartMessageLabel = (locale) => getTranslatedLabel('TextMessage_addProductToCart', LABEL_DATA, locale);
export const addToCartMessageWithNoVariationsLabel = (locale) =>
    getTranslatedLabel('TextMessage_addProductToCartWithNoVariations', LABEL_DATA, locale);
export const applyCouponCodeLabel = (locale) => getTranslatedLabel('TextMessage_applyCouponCode', LABEL_DATA, locale);
export const invalidResponseMessageLabel = (locale) =>
    getTranslatedLabel('TextMessage_invalidResponseMessage', LABEL_DATA, locale);

export const paymentCompletedLabel = (locale) => getTranslatedLabel('Common_Payment_Completed', LABEL_DATA, locale);
export const paymentFailedLabel = (locale) => getTranslatedLabel('Common_Payment_Failed', LABEL_DATA, locale);
export const paymentCanceledLabel = (locale) => getTranslatedLabel('Common_Payment_Canceled', LABEL_DATA, locale);
export const fallbackPaymentSucceededLabel = (locale) =>
    getTranslatedLabel('Common_Payment_Succeeded_NoPaymentMethod', LABEL_DATA, locale);
export const fallbackPaymentFailedLabel = (locale) =>
    getTranslatedLabel('Common_Payment_Failed_NoPaymentMethod', LABEL_DATA, locale);
export const dynamicContentRegionAriaLabel = (locale) =>
    getTranslatedLabel('Common_DynamicContent_Region_Aria_Label', LABEL_DATA, locale);
export const richTextMessageContentAriaLabel = (locale) =>
    getTranslatedLabel('Common_DynamicContent_RichText_Region_Aria_Label', LABEL_DATA, locale);
export const contextualDescriptionLabel = (locale) =>
    getTranslatedLabel('Common_DynamicContent_Contextual_Description', LABEL_DATA, locale);
// Apple Pay specific labels
export const applePayPaymentFailedLabel = (locale) =>
    getTranslatedLabel('Common_ApplePay_paymentFailed', LABEL_DATA, locale);
export const applePayPaymentCanceledLabel = (locale) =>
    getTranslatedLabel('Common_ApplePay_paymentCanceled', LABEL_DATA, locale);
export const applePayPaymentCompletedLabel = (locale) =>
    getTranslatedLabel('Common_ApplePay_paymentCompleted', LABEL_DATA, locale);
export const showMoreProductsLabel = (locale) => getTranslatedLabel('TextMessage_showMoreProducts', LABEL_DATA, locale);
