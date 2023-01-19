export const isNumberType = (n: unknown): n is number => typeof n === 'number';

/**
 * Will return true if number2 is less than or equal to number1. Will return false if either or both numbers are not numbers
 * e.g. null or undefined.
 */
export const isLessThanOrEqual = (number1: number | undefined, number2: number | undefined): boolean => {
    if (isNumberType(number1) && isNumberType(number2)) {
        return number2 <= number1;
    }

    return false;
};

export const stringOnlyHasNumbers = (value: string | null | undefined): boolean => {
    return typeof value === 'string' && !Number.isNaN(Number(value)) && value.length !== 0;
};
