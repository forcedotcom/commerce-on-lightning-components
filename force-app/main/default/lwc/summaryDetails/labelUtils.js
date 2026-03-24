/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */

import { getTranslatedLabel } from 'c/labelService';
import { LABEL_DATA } from './labels';

export const confirmationTitle = (locale) => getTranslatedLabel('confirmationTitle', LABEL_DATA, locale);
export const subtotalLabel = (locale) => getTranslatedLabel('subtotalLabel', LABEL_DATA, locale);
export const promotionsLabel = (locale) => getTranslatedLabel('promotionsLabel', LABEL_DATA, locale);
export const shippingLabel = (locale) => getTranslatedLabel('shippingLabel', LABEL_DATA, locale);
export const shippingDiscountLabel = (locale) => getTranslatedLabel('shippingDiscountLabel', LABEL_DATA, locale);
export const taxesLabel = (locale) => getTranslatedLabel('taxesLabel', LABEL_DATA, locale);
export const totalLabel = (locale) => getTranslatedLabel('totalLabel', LABEL_DATA, locale);
export const tbdLabel = (locale) => getTranslatedLabel('tbdLabel', LABEL_DATA, locale);
export const freeShippingLabel = (locale) => getTranslatedLabel('freeShippingLabel', LABEL_DATA, locale);
export const defaultDeliveryMessage = (locale) => getTranslatedLabel('defaultDeliveryMessage', LABEL_DATA, locale);
export const footerMessage = (locale) => getTranslatedLabel('footerMessage', LABEL_DATA, locale);
export const orderSummaryAssistiveText = (locale) =>
    getTranslatedLabel('orderSummaryAssistiveText', LABEL_DATA, locale);
export const cartSummaryAssistiveText = (locale) => getTranslatedLabel('cartSummaryAssistiveText', LABEL_DATA, locale);
export const toggleExpandAssistiveText = (locale) =>
    getTranslatedLabel('toggleExpandAssistiveText', LABEL_DATA, locale);
export const toggleCollapseAssistiveText = (locale) =>
    getTranslatedLabel('toggleCollapseAssistiveText', LABEL_DATA, locale);
export const toggleExpandCartAssistiveText = (locale) =>
    getTranslatedLabel('toggleExpandCartAssistiveText', LABEL_DATA, locale);
export const toggleCollapseCartAssistiveText = (locale) =>
    getTranslatedLabel('toggleCollapseCartAssistiveText', LABEL_DATA, locale);
export const orderItemsAssistiveText = (locale) => getTranslatedLabel('orderItemsAssistiveText', LABEL_DATA, locale);
export const cartItemsAssistiveText = (locale) => getTranslatedLabel('cartItemsAssistiveText', LABEL_DATA, locale);
export const orderTotalsAssistiveText = (locale) => getTranslatedLabel('orderTotalsAssistiveText', LABEL_DATA, locale);
export const cartTotalsAssistiveText = (locale) => getTranslatedLabel('cartTotalsAssistiveText', LABEL_DATA, locale);
export const orderIdLabel = (locale) => getTranslatedLabel('orderIdLabel', LABEL_DATA, locale);
export const couponsDiscountLabel = (locale) => getTranslatedLabel('couponsDiscountLabel', LABEL_DATA, locale);
export const couponsAppliedLabel = (locale) => getTranslatedLabel('couponsAppliedLabel', LABEL_DATA, locale);
export const couponsDiscountLabelPlural = (locale) =>
    getTranslatedLabel('couponsDiscountLabelPlural', LABEL_DATA, locale);
export const couponsAppliedLabelPlural = (locale) =>
    getTranslatedLabel('couponsAppliedLabelPlural', LABEL_DATA, locale);
export const addedCouponsAriaLabel = (locale) => getTranslatedLabel('addedCouponsAriaLabel', LABEL_DATA, locale);
export const appliedCouponsAriaLabel = (locale) => getTranslatedLabel('appliedCouponsAriaLabel', LABEL_DATA, locale);
