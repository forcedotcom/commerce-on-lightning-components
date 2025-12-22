/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

/*
 * @description Group all Custom Labels for commerceHeader in one place
 * Uses shared labelService for translation logic
 */

import { getTranslatedLabel } from 'c/labelService';
import { LABEL_DATA } from './labels';

// Export individual label functions
export const menu = (locale) => getTranslatedLabel('menu', LABEL_DATA, locale);
export const requestTranscript = (locale) => getTranslatedLabel('requestTranscript', LABEL_DATA, locale);
export const endChat = (locale) => getTranslatedLabel('endChat', LABEL_DATA, locale);
export const minimize = (locale) => getTranslatedLabel('minimize', LABEL_DATA, locale);
export const minimizeAssistive = (locale) => getTranslatedLabel('minimizeAssistive', LABEL_DATA, locale);
export const logoAlt = (locale) => getTranslatedLabel('logoAlt', LABEL_DATA, locale);
export const closeButtonAssistiveText = (locale) => getTranslatedLabel('closeButtonAssistiveText', LABEL_DATA, locale);
export const defaultHeaderText = (locale) => getTranslatedLabel('defaultHeaderText', LABEL_DATA, locale);
