/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import {
    numberFormattedValue,
    isNumberType,
    isLessThanOrEqual,
    stringOnlyHasNumbers,
    findReason,
    first,
} from '../utils';

describe('commonNumberInput utils', () => {
    describe('numberFormattedValue', () => {
        it('should handle decimal values with dot separator', () => {
            expect(numberFormattedValue('123.45', '.', ',')).toBe(123.45);
        });

        it('should handle decimal values with comma separator', () => {
            expect(numberFormattedValue('123,45', ',', '.')).toBe(123.45);
        });

        it('should handle values with grouping separators', () => {
            expect(numberFormattedValue('1,234.56', '.', ',')).toBe(1234.56);
            expect(numberFormattedValue('1.234,56', ',', '.')).toBe(1234.56);
        });

        it('should handle values starting with decimal separator', () => {
            expect(numberFormattedValue('.45', '.', ',')).toBe(0.45);
            expect(numberFormattedValue(',45', ',', '.')).toBe(0.45);
        });

        it('should handle values ending with decimal separator', () => {
            expect(numberFormattedValue('123.', '.', ',')).toBe(123.0);
            expect(numberFormattedValue('123,', ',', '.')).toBe(123.0);
        });

        it('should handle negative values', () => {
            expect(numberFormattedValue('-123.45', '.', ',')).toBe(-123.45);
            expect(numberFormattedValue('-123,45', ',', '.')).toBe(-123.45);
        });

        it('should return NaN for invalid values', () => {
            expect(Number.isNaN(numberFormattedValue('abc', '.', ','))).toBe(true);
        });
    });

    describe('isNumberType', () => {
        it('should return true for numbers', () => {
            expect(isNumberType(123)).toBe(true);
            expect(isNumberType(0)).toBe(true);
            expect(isNumberType(-123)).toBe(true);
            expect(isNumberType(123.45)).toBe(true);
        });

        it('should return false for non-numbers', () => {
            expect(isNumberType('123')).toBe(false);
            expect(isNumberType(null)).toBe(false);
            expect(isNumberType(undefined)).toBe(false);
            expect(isNumberType({})).toBe(false);
            expect(isNumberType([])).toBe(false);
        });
    });

    describe('isLessThanOrEqual', () => {
        it('should return true when number2 is less than or equal to number1', () => {
            expect(isLessThanOrEqual(10, 5)).toBe(true);
            expect(isLessThanOrEqual(10, 10)).toBe(true);
            expect(isLessThanOrEqual(-5, -10)).toBe(true);
        });

        it('should return false when number2 is greater than number1', () => {
            expect(isLessThanOrEqual(5, 10)).toBe(false);
            expect(isLessThanOrEqual(-10, -5)).toBe(false);
        });

        it('should return false for non-number inputs', () => {
            expect(isLessThanOrEqual(null, 5)).toBe(false);
            expect(isLessThanOrEqual(5, null)).toBe(false);
            expect(isLessThanOrEqual(undefined, 5)).toBe(false);
            expect(isLessThanOrEqual(5, undefined)).toBe(false);
            expect(isLessThanOrEqual('5', 10)).toBe(false);
            expect(isLessThanOrEqual(10, '5')).toBe(false);
        });
    });

    describe('stringOnlyHasNumbers', () => {
        it('should return true for valid number strings', () => {
            expect(stringOnlyHasNumbers('123')).toBe(true);
            expect(stringOnlyHasNumbers('0')).toBe(true);
            expect(stringOnlyHasNumbers('-123')).toBe(true);
            expect(stringOnlyHasNumbers('123.45')).toBe(true);
        });

        it('should return false for invalid number strings', () => {
            expect(stringOnlyHasNumbers('abc')).toBe(false);
            expect(stringOnlyHasNumbers('')).toBe(false);
            expect(stringOnlyHasNumbers('123abc')).toBe(false);
            expect(stringOnlyHasNumbers(null)).toBe(false);
            expect(stringOnlyHasNumbers(undefined)).toBe(false);
        });
    });

    describe('findReason', () => {
        it('should return first true validity state', () => {
            const state = {
                valid: false,
                badInput: true,
                customError: false,
                patternMismatch: false,
                rangeOverflow: false,
                rangeUnderflow: false,
                stepMismatch: false,
                tooLong: false,
                tooShort: false,
                typeMismatch: false,
                valueMissing: false,
            };
            expect(findReason(state)).toEqual(['badInput', true]);
        });

        it('should return valid state when no issues found', () => {
            const state = {
                valid: true,
                badInput: false,
                customError: false,
                patternMismatch: false,
                rangeOverflow: false,
                rangeUnderflow: false,
                stepMismatch: false,
                tooLong: false,
                tooShort: false,
                typeMismatch: false,
                valueMissing: false,
            };
            expect(findReason(state)).toEqual(['valid', true]);
        });

        it('should return valid state when there is not a valid key in the state object', () => {
            const state = {
                badInput: false,
                customError: false,
                patternMismatch: false,
                rangeOverflow: false,
                rangeUnderflow: false,
                stepMismatch: false,
                tooLong: false,
                tooShort: false,
                typeMismatch: false,
                valueMissing: false,
            };
            expect(findReason(state)).toEqual(['valid', true]);
        });
    });

    describe('first', () => {
        it('should return first element of array', () => {
            expect(first([1, 2, 3])).toBe(1);
            expect(first(['a', 'b', 'c'])).toBe('a');
        });

        it('should return fallback for empty array', () => {
            expect(first([], 'fallback')).toBe('fallback');
        });

        it('should return null for empty array with no fallback', () => {
            expect(first([])).toBe(null);
        });

        it('should return fallback for non-array input', () => {
            expect(first(null, 'fallback')).toBe('fallback');
            expect(first(undefined, 'fallback')).toBe('fallback');
            expect(first('not an array', 'fallback')).toBe('fallback');
        });

        it('should return null for non-array input with no fallback', () => {
            expect(first(null)).toBe(null);
            expect(first(undefined)).toBe(null);
            expect(first('not an array')).toBe(null);
        });
    });
});
