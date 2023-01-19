import { isLessThanOrEqual, isNumberType, stringOnlyHasNumbers } from '../utils';

describe('number input utils', () => {
    describe('keepDefinedLimit', () => {
        it('should return true if both are defined and 9 is less than or equal to 10', () => {
            expect(isLessThanOrEqual(10, 9)).toBe(true);
        });

        it('should return true if both are defined and 10 is equal to 10', () => {
            expect(isLessThanOrEqual(10, 10)).toBe(true);
        });

        it('should return false if either of the two values is undefined', () => {
            expect(isLessThanOrEqual(undefined, Number.POSITIVE_INFINITY)).toBe(false);
            expect(isLessThanOrEqual(Number.POSITIVE_INFINITY, undefined)).toBe(false);
        });

        it('should return false if both are defined and 11 is not less than or equal to 10', () => {
            expect(isLessThanOrEqual(10, 11)).toBe(false);
        });
    });

    describe('isNumberType', () => {
        it('should return true if the argument is a number', () => {
            expect(isNumberType(1)).toBe(true);
        });

        it('should return true if the argument is a NaN', () => {
            expect(isNumberType(1)).toBe(true);
        });

        it('should not return true for any other type', () => {
            const types = [
                null,
                undefined,
                '',
                {},
                [],
                new Set(),
                new Map(),
                (): number => 0,
                true,
                BigInt(0),
                Symbol(),
                new WeakMap(),
                new WeakSet(),
            ];

            for (const t of types) {
                expect(isNumberType(t)).toBe(false);
            }
        });
    });

    describe('stringOnlyHasNumbers', () => {
        it('should return true if a string only contains numbers', () => {
            expect(stringOnlyHasNumbers('384750893475')).toBe(true);
            expect(stringOnlyHasNumbers('0xffff')).toBe(true);
            expect(stringOnlyHasNumbers('Infinity')).toBe(true);
            expect(stringOnlyHasNumbers('0.1')).toBe(true);
        });

        it('should return false for non-numeric strings', () => {
            expect(stringOnlyHasNumbers('this is not a number')).toBe(false);
            expect(stringOnlyHasNumbers(null)).toBe(false);
            expect(stringOnlyHasNumbers(undefined)).toBe(false);
        });
    });
});
