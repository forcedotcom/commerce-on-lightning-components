import { ERROR_RANGE_OVERFLOW, ERROR_RANGE_UNDERFLOW, STEP_MISMATCH } from 'commerce/numberInput';
import { rangeOverflow, rangeUnderflow, stepMismatch } from './labels';

export const errorLabels = {
    [ERROR_RANGE_OVERFLOW]: rangeOverflow,
    [ERROR_RANGE_UNDERFLOW]: rangeUnderflow,
    [STEP_MISMATCH]: stepMismatch,
};

export const defaultRules = {
    minimum: 1,
    maximum: Number.MAX_SAFE_INTEGER,
    step: 1,
};
