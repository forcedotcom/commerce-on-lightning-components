/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { ERROR_RANGE_OVERFLOW, ERROR_RANGE_UNDERFLOW, STEP_MISMATCH, PATTERN_MISMATCH } from 'c/commonNumberInput';
import { patternMismatch, rangeOverflow, rangeUnderflow, stepMismatch } from './labels';
export const VALUE_CHANGED_EVT = 'valuechanged';
export const VALIDITY_CHANGED_EVT = 'validitychanged';
export const OUT_OF_STOCK_EVT = 'outofstock';
export const errorLabels = {
    [ERROR_RANGE_OVERFLOW]: rangeOverflow,
    [ERROR_RANGE_UNDERFLOW]: rangeUnderflow,
    [STEP_MISMATCH]: stepMismatch,
    [PATTERN_MISMATCH]: patternMismatch,
};
export const defaultRules = {
    minimum: 1,
    maximum: 100000000,
    step: 1,
};
