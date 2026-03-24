/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */

/*
 * @description Label functions and helper utilities for bottomSheet
 * Uses shared labelService for translation logic
 */

import { getTranslatedLabel } from 'c/labelService';
import { LABEL_DATA } from './labels';

// Export individual label functions
export const clearLabel = (locale) => getTranslatedLabel('BottomSheet_Clear', LABEL_DATA, locale);
export const continueLabel = (locale) => getTranslatedLabel('BottomSheet_Continue', LABEL_DATA, locale);
