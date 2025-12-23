/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

/*
 * @description Label functions and helper utilities for cartSummary
 * Uses shared labelService for translation logic
 */

import { getTranslatedLabel } from 'c/labelService';
import { LABEL_DATA } from './labels';

// Export individual label functions
export const cartSummaryRegionLabel = (locale) => getTranslatedLabel('cartSummaryRegionLabel', LABEL_DATA, locale);
export const loadingSpinnerAltText = (locale) => getTranslatedLabel('loadingSpinnerAltText', LABEL_DATA, locale);
export const checkoutButtonLabel = (locale) => getTranslatedLabel('checkoutButtonLabel', LABEL_DATA, locale);
export const checkoutButtonAssistiveText = (locale) =>
    getTranslatedLabel('checkoutButtonAssistiveText', LABEL_DATA, locale);
export const checkoutNotAvailableAssistiveText = (locale) =>
    getTranslatedLabel('checkoutNotAvailableAssistiveText', LABEL_DATA, locale);
