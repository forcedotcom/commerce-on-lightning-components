/**
 * @description Ensures the sign of the provided value.
 * @param {string | undefined} value
 *  The value to check.
 *
 * @param {boolean} makePositive
 *  Whether the desired sign of the value is positive (true) or a negative (false).
 *
 * @returns {number | undefined}
 *  The value with the appropriate sign.
 *  The provided value if a non-numeric value is given.
 */
export function changeSign(value: number | undefined, makePositive: boolean): number | undefined {
    if (!value) {
        return value;
    }
    let returnValue = value;

    const isNegative = value < 0;

    // Switching signs logic
    if ((isNegative && makePositive) || (!isNegative && !makePositive)) {
        returnValue = value * -1;
    }

    return returnValue;
}
