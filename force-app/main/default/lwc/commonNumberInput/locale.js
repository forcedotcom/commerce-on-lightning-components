/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import locale from '@salesforce/i18n/locale';
import decimalSeparator from '@salesforce/i18n/number.decimalSeparator';
import groupingSeparator from '@salesforce/i18n/number.groupingSeparator';

export const getLocale = () => locale;
export const getDecimalSeparator = () => decimalSeparator;
export const getGroupingSeparator = () => groupingSeparator;
