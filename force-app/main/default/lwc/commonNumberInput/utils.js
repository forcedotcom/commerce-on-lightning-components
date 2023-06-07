/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
const INTERNAL_DECIMAL_SEPARATOR = '.';

/**
 * Replace first value with zero in case values are added in form of '.<number>' or '<number>.'.
 * @param {string} value The value to normalize
 * @returns {string} The normalized value
 */
function appendZeroToDecimal(value) {
    const firstChar = value.charAt(0);
    if (firstChar === INTERNAL_DECIMAL_SEPARATOR) {
        return 0 + value;
    }
    const lastChar = value.charAt(value.length - 1);
    if (lastChar === INTERNAL_DECIMAL_SEPARATOR) {
        return value + 0;
    }
    return value;
}

/**
 * Removes all grouping separators.
 * @param {string} value The value to normalize
 * @param {string} groupingSeparator The grouping/thousands separator to remove, if needed
 * @returns {string} The normalized value
 */
function removeGroupingSeparator(value, groupingSeparator) {
    return value.replace(new RegExp(`[${groupingSeparator}]*`, 'g'), '');
}

/**
 * Add zero to decimal values, replaces the decimal separator and remove grouping separator.
 * If the value is a numeric value, parsed value will be returned, if not undefined.
 * @param {string} value The value to normalize
 * @param {string} decimalSeparator The decimal separator to replace, if needed
 * @param {string} groupingSeparator The grouping/thousands separator to remove, if needed
 * @returns {(string | undefined)} The normalized value, or undefined
 */
function parseValue(value, decimalSeparator, groupingSeparator) {
    const [left, right] = value.split(decimalSeparator);
    const cleanLeft = removeGroupingSeparator(left, groupingSeparator);

    const hasOnlyNumbers = cleanLeft.replace(/[+-]?\d*/, '').length === 0;
    if (hasOnlyNumbers) {
        const joinedValue = [cleanLeft, right].join('.');
        return appendZeroToDecimal(joinedValue);
    }
    return undefined;
}

/**
 * Returns any localized value and returns the corresponding JS number. Returns NaN if
 * the string contains characters that are not allowed for this locale. The specified
 * grouping separators are removed. Decimal separators are replaced by a dot.
 * @param {string} value The value to format
 * @param {string} decimalSeparator The decimal separator to replace, if needed
 * @param {string} groupingSeparator The grouping/thousands separator to remove, if needed
 * @returns {number} The JS version of the localized number string that was passed to the function
 */
export function numberFormattedValue(value, decimalSeparator, groupingSeparator) {
    return Number(parseValue(value, decimalSeparator, groupingSeparator));
}

/**
 * Checks whether the value is of type `Number`.
 * @param {*} n The value to verify
 * @returns {boolean} Whether the value is a `Number`
 */
export function isNumberType(n) {
    return typeof n === 'number';
}

/**
 * Will return true if number2 is less than or equal to number1. Will return false if either or both numbers are not numbers
 * e.g. null or undefined.
 * @param {number} [number1] The first number to compare
 * @param {number} [number2] The second number to compare
 * @returns {boolean} The result of the comparison
 */
export function isLessThanOrEqual(number1, number2) {
    if (isNumberType(number1) && isNumberType(number2)) {
        return number2 <= number1;
    }
    return false;
}

/**
 * Checks whether a (string) value represents a valid `Number`.
 * @param {?string} [value] The value to verify
 * @returns {boolean} The check result
 */
export function stringOnlyHasNumbers(value) {
    return typeof value === 'string' && !Number.isNaN(Number(value)) && value.length !== 0;
}

/**
 * Will return a reason for the validity state of an input.
 * @param {ValidityState} state The validity state of the input field
 * @returns {[string, boolean]} The generated result
 */
export function findReason(state) {
    for (const key in state) {
        if (state[key]) {
            return [key, state[key]];
        }
    }
    return ['valid', true];
}
/**
 * @param {*} arr An array value to extract the first element from
 * @param {*} [fallback] A fallback value to return in case the passed `arr` parameter is either not an `Array`, or has no first element
 * @returns {*} The value of the first `arr` element, the optional `fallback`, or `null`
 */
export function first(arr, fallback) {
    if (Array.isArray(arr) && arr[0]) {
        return arr[0];
    }
    return fallback ?? null;
}
