/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { getTranslatedLabel } from 'c/labelService';
import { LABEL_DATA } from './labels';

export const couponPlaceholder = (locale) => getTranslatedLabel('couponPlaceholder', LABEL_DATA, locale);
export const applyButtonLabel = (locale) => getTranslatedLabel('applyButtonLabel', LABEL_DATA, locale);
export const applyButtonAriaLabel = (locale) => getTranslatedLabel('applyButtonAriaLabel', LABEL_DATA, locale);
export const couponInputAriaLabel = (locale) => getTranslatedLabel('couponInputAriaLabel', LABEL_DATA, locale);
