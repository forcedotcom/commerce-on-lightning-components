import type { LwcCustomEventTargetOf } from 'types/common';

export type InputEventWithTarget = InputEvent & LwcCustomEventTargetOf<HTMLInputElement>;

export type ErrorState = 'rangeOverflow' | 'rangeUnderflow' | 'stepMismatch';

export interface ChangeEventDetail {
    /**
     * The last correct value that was either entered or enforced.
     */
    lastValue?: number;

    /**
     * Represents the validity of `enteredValue`. If this is false, then the entered
     * value is invalid.
     */
    isValid: boolean;

    /**
     * The reason why the entered Value was not considered valid. This
     */
    reason: ErrorState | null;

    /**
     * This always contains the value that was entered by the user, *even* if
     * that value is incorrect and violates the rules defined for this field.
     */
    value: number;
}
