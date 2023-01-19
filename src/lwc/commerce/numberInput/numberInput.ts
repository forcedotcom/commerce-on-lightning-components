import { api, LightningElement } from 'lwc';
import { decrementAltText, incrementAltText, inputAriaLabel } from './labels';

import type { ChangeEventDetail, ErrorState, InputEventWithTarget } from './types';
import { isLessThanOrEqual, isNumberType, stringOnlyHasNumbers } from './utils';

export const VALUE_CHANGED_EVT = 'valuechanged';
export const ERROR_RANGE_OVERFLOW: ErrorState = 'rangeOverflow';
export const ERROR_RANGE_UNDERFLOW: ErrorState = 'rangeUnderflow';
export const STEP_MISMATCH: ErrorState = 'stepMismatch';

export { stringOnlyHasNumbers } from './utils';
export type { ChangeEventDetail, ErrorState } from './types';

/**
 * The component takes min, max and step-size as attributes and controls what values are displayed in the
 * input field. Pressing the add-button will increase the value by the given step-size until maximum is reached.
 * Pressing the subtract button will decrease the value by the given step-size until min is reached. The value can
 * also be typed directly into the inputField field.
 *
 * The 'valuechanged' event is fired whenever the value is increased, decreased or manually changed.
 *
 * Important: This component will automatically correct values that are invalid, unless it is configured otherwise
 * using the 'allow-invalid-values' attribute.
 *
 * The event has a property that conforms to the 'ChangeEventDetail' type and contains the value that was entered,
 * the corrected value and a correction/error cause field, among other things.
 *
 * In addition, the component accepts a value that shows/hides the buttons or the label using the 'hide-label' and
 * 'hide-button' attributes.
 */
export default class NumberInput extends LightningElement {
    static renderMode = 'light';

    private _min: number | undefined;

    @api
    get min(): number | undefined {
        return this._min;
    }

    set min(value: number | undefined) {
        this._min = value;
        isNumberType(this._value) && this.commit(this._value, false);
    }

    get minOrDefault(): number {
        return isNumberType(this.min) ? this.min : Number.MIN_SAFE_INTEGER;
    }

    private _max: number | undefined;

    @api
    get max(): number | undefined {
        return this._max;
    }

    set max(value: number | undefined) {
        this._max = value;
        isNumberType(this._value) && this.commit(this._value, false);
    }

    get maxOrDefault(): number {
        return isNumberType(this.max) ? this.max : Number.MAX_SAFE_INTEGER;
    }

    private _step: number | undefined;

    /**
     * The configurable step-size of the field. It defaults to 1 but can be set to
     * any whole number or decimal value greater than 0.
     */
    @api
    set step(step: number | undefined) {
        this._step = step;
    }

    get step(): number | undefined {
        return this._step;
    }

    @api
    disabled = false;

    @api
    fieldLabel: string | undefined;

    get isIncrementButtonDisabled(): boolean {
        return this.disabled || isLessThanOrEqual(this._value, this.maxOrDefault);
    }

    get isDecrementButtonDisabled(): boolean {
        return this.disabled || isLessThanOrEqual(this.minOrDefault, this._value);
    }

    /**
     * This value might be overwritten by the value in the inputField field.
     * However, it's not at all times guaranteed to be identical to the  value
     * in the inputField field and might be used to overwrite the inputField field value.
     *
     * Do not use the original getter in the template. Use `formattedValue`
     * instead.
     *
     */
    _value: number | undefined = undefined; // This must be set to `undefined` explicitly because LWC. If not, updates of the value won't trigger a rerender (smh)

    @api
    get value(): number | undefined {
        return this._value;
    }

    set value(value: number | undefined) {
        this._value = value;
        /**
         * This is needed to validate values that are handed over from the outside. The commit is needed first as
         * handleAndDispatch relies on the value being set on the number field. commit is taking care of setting the
         * value to the state that is used in the number field.
         */
        this.commit(this._value, true);
        isNumberType(this._value) && this.handleAndDispatch(this._value);
    }

    /**
     * This is the value that should be used in the template.
     */
    get formattedValue(): string | undefined {
        return this._value?.toString();
    }

    state: { value: number | undefined; formattedValue: string | undefined } = {
        value: this._value,
        formattedValue: this.formattedValue,
    };

    private _inputField: HTMLInputElement | null = null;

    get inputField(): HTMLInputElement | null {
        if (!this._inputField) {
            this._inputField = this.querySelector('input');
        }

        return this._inputField;
    }

    @api
    hideButtons = false;

    @api
    hideLabel = false;

    readonly i18n = {
        decrementAltText, // Decrease number of items
        incrementAltText, // Increase number of items
        inputAriaLabel, //Quantity
    };

    get labelOrAriaLabel(): string {
        return this.fieldLabel ?? this.i18n.inputAriaLabel;
    }

    spanClasses = 'slds-grid';

    _lastValue = this._value;

    handleAndDispatch(enteredValue: number): void {
        const isValid: boolean | undefined = !!this.inputField?.checkValidity();
        let reason: ErrorState | null = null;

        if (!isValid) {
            if (this.inputField?.validity[ERROR_RANGE_OVERFLOW]) {
                reason = ERROR_RANGE_OVERFLOW;
            }

            if (this.inputField?.validity[ERROR_RANGE_UNDERFLOW]) {
                reason = ERROR_RANGE_UNDERFLOW;
            }

            if (this.inputField?.validity[STEP_MISMATCH]) {
                reason = STEP_MISMATCH;
            }
        }

        const detail: ChangeEventDetail = {
            value: enteredValue,
            lastValue: this._lastValue,
            isValid,
            reason,
        };

        this.spanClasses = this.inputField?.value && !isValid ? this.spanClasses + ' error' : 'slds-grid';

        this.commit(enteredValue);

        this.dispatchEvent(
            new CustomEvent(VALUE_CHANGED_EVT, {
                bubbles: true,
                composed: true,
                detail,
            })
        );
    }

    handleDecrement(): void {
        this._lastValue = this._value;

        this.inputField?.stepDown();
        this._value = this.inputField?.valueAsNumber;

        isNumberType(this._value) && this.handleAndDispatch(this._value);
    }

    handleIncrement(): void {
        this._lastValue = this._value;

        this.inputField?.stepUp();
        this._value = this.inputField?.valueAsNumber;

        isNumberType(this._value) && this.handleAndDispatch(this._value);
    }

    handleInputChange(event: InputEventWithTarget | null): void {
        if (event) {
            this._lastValue = this._value;
            const value = event.target?.value as string;

            const onlyHasNumbers = stringOnlyHasNumbers(value);

            if (onlyHasNumbers) {
                this.handleAndDispatch(parseFloat(value));
            } else if (this._value) {
                this.commit(this._value);
            }
        }
    }

    private commit(value: number | undefined, force = false): void {
        this._value = value;

        /*
        Force setting the value is needed in case the buttons are used to change the value.
        The change needs to be reflected back to the input to be able to use the input validation afterwards.
         */
        if (this.inputField && this.formattedValue && force && this.inputField.value !== this.formattedValue) {
            this.inputField.value = this.formattedValue;
        }
        /*
        LWC won't trigger an update if the value doesn't change. This is fine in most cases. However, if
        you enter the same value twice in our input element without resetting the value, LWC won't
        notice that an update has happened. This results in unwanted behavior because it will allow
        invalid values in the inputField field while internally the correct value is stored.

        Steps to reproduce:
        1. Remove this line.
        2. Type an invalid value into the inputField field.
        3. Click outside. -> Value is adjusted to a valid one.
        4. Type the same invalid value again.
        5. Click outside the field again. -> Value is not adjusted. Invalid value remains in field.
        6. Do the same with this line intact. -> Value is adjusted after second+ attempts.
        */
        this.state = { value: this._value, formattedValue: this.formattedValue };
    }
}
