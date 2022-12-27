/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';
import { decrementAltText, incrementAltText, inputAriaLabel } from './labels';
import { getLocale, getDecimalSeparator, getGroupingSeparator } from './locale';
import { numberFormattedValue, findReason, first, isLessThanOrEqual } from './utils';
export const VALUE_CHANGED_EVT = 'valuechanged';
export const VALIDITY_CHANGED_EVT = 'validitychanged';
export const ERROR_RANGE_OVERFLOW = 'rangeOverflow';
export const ERROR_RANGE_UNDERFLOW = 'rangeUnderflow';
export const STEP_MISMATCH = 'stepMismatch';
export const PATTERN_MISMATCH = 'patternMismatch';
export { stringOnlyHasNumbers } from './utils';
const generateRandomId = (() => {
    let lastId = 0;
    return () => crypto?.randomUUID?.() || String(++lastId);
})();

/**
 * @typedef {('rangeOverflow' | 'rangeUnderflow' | 'stepMismatch' | 'patternMismatch' | 'valid')} ErrorState
 */

/**
 * @typedef {object} ChangeEventDetail
 * @property {number} [value]
 *  This always contains the value that was entered by the user, *even* if
 *  that value is incorrect and violates the rules defined for this field.
 * @property {number} [lastValue]
 *  The last correct value that was either entered or enforced.
 * @property {boolean} isValid
 *  Represents the validity of _`value`_. If this is `false`, then the entered value is invalid.
 */

/**
 * @typedef {object} ValidityEventDetail
 * @property {boolean} isValid
 *  Represents the validity of _`value`_. If this is `false`, then the entered value is invalid.
 * @property {ErrorState} reason
 *  The reason why the entered Value was not considered valid.
 */

/**
 * An event fired whenever the value is increased, decreased or manually changed.
 * @event SortMenu#ValueChangedEvent
 * @type {CustomEvent}
 * @property {ChangeEventDetail} detail CustomEvent details
 */

/**
 * The component takes min, max and step-size as attributes and controls what values are displayed in the
 * input field. Pressing the add-button will increase the value by the given step-size until maximum is reached.
 * Pressing the subtract button will decrease the value by the given step-size until min is reached. The value can
 * also be typed directly into the inputField field.
 *
 * The 'valuechanged' event is fired whenever the value is increased, decreased or manually changed.
 *
 * The event has a `detail` property that conforms to the 'ChangeEventDetail'. Consumers of the event can learn if
 * the value entered into the component is valid, what the value is and why it is not valid. The detail also has a
 * field that contains the last value before the field was changed.
 *
 * In addition, the component accepts a value that shows/hides the buttons or the label using the 'hide-label' and
 * 'hide-button' attributes.
 * @fires SortMenu#ValueChangedEvent
 */
export default class CommonNumberInput extends LightningElement {
    static renderMode = 'light';
    _min;
    _max;
    _step;
    _isValid = true;
    _validationFailureReason = '';
    _displayedInput = null;
    _hiddenInput = null;
    _internalValue;

    _displayValue;
    _randomId = generateRandomId();
    _customValidity;
    i18n = {
        decrementAltText,
        incrementAltText,
        inputAriaLabel,
    };
    @api
    hideButtons = false;
    @api
    hideLabel = false;
    @api
    disabled = false;
    @api
    fieldLabel;
    @api
    fieldDescribedBy;
    @api
    get customValidity() {
        return this._customValidity;
    }
    set customValidity(val) {
        this._customValidity = val;
        this.displayedInput?.setCustomValidity(val || '');
        this.displayedInput?.reportValidity();
    }

    /**
     * The configurable minimum-size of the field. It defaults to MIN_SAFE_INTEGER but can be set to
     * any whole number or decimal value.
     * @type {?(string | number)}
     */
    @api
    get min() {
        return this._min;
    }
    set min(value) {
        this._min = value;
        if ((value === 0 || value) && this._internalValue && this.hiddenInput) {
            this.hiddenInput.min = value.toString();
            this.validateAndDispatch(this._internalValue);
        }
    }

    /**
     * The configurable maximum-size of the field. It defaults to MAX_SAFE_INTEGER but can be set to
     * any whole number or decimal value.
     * @type {?(string | number)}
     */
    @api
    get max() {
        return this._max;
    }
    set max(value) {
        this._max = value;
        if ((value === 0 || value) && this._internalValue && this.hiddenInput) {
            this.hiddenInput.max = value.toString();
            this.validateAndDispatch(this._internalValue);
        }
    }

    /**
     * The configurable step-size of the field. It defaults to 1 but can be set to
     * any whole number or decimal value greater than 0.
     * @type {?(string | number)}
     */
    @api
    get step() {
        return this._step;
    }
    set step(value) {
        this._step = value;
        if ((value === 0 || value) && this._internalValue && this.hiddenInput) {
            this.hiddenInput.step = value.toString();
            this.validateAndDispatch(this._internalValue);
        }
    }

    /**
     * The value field only accepts numbers. It will throw an error if a string is passed.
     * If nullish or falsy values are passed, it will do nothing.
     * @type {?(string | number)}
     */
    @api
    get value() {
        return this._internalValue;
    }
    set value(value) {
        if (typeof value === 'number' && !isNaN(value) && value !== this._internalValue) {
            this._displayValue = this.formatValue(value);
            this._internalValue = Number(value);
            if (this.hiddenInput) {
                this.validateAndDispatch(value);
            }
        }
    }
    renderedCallback() {
        if (!this._hiddenInput) {
            this._hiddenInput = this.querySelector('input.hidden-input');
            if (this._hiddenInput) {
                const params = [
                    [this.min, 'min'],
                    [this.max, 'max'],
                    [this.step, 'step'],
                    [this._internalValue, 'value'],
                ];
                params.forEach(([param, name]) => {
                    if ((param === 0 || param) && this._hiddenInput && name) {
                        this._hiddenInput[name] = param.toString();
                    }
                });
                this.validateAndDispatch(this._internalValue);
            }
        }
    }

    /**
     * Returns the defined minimum or an implicit default.
     * @type {(string | number)}
     * @private
     */
    get minOrDefault() {
        return this.min ?? Number.MIN_SAFE_INTEGER;
    }

    /**
     * Returns the defined maximum or an implicit default.
     * @type {(string | number)}
     * @private
     */
    get maxOrDefault() {
        return this.max ?? Number.MAX_SAFE_INTEGER;
    }

    /**
     * This pattern is used by the displayedInput to validate entered strings as numbers.
     * @type {string}
     * @private
     */
    get pattern() {
        // eslint-disable-next-line no-useless-escape
        return `[+\-]?(\\d*[${getGroupingSeparator()}]?)*[${getDecimalSeparator()}]?\\d*`;
    }
    get isIncrementButtonDisabled() {
        return this.disabled || isLessThanOrEqual(Number(this.value), Number(this.maxOrDefault));
    }
    get isDecrementButtonDisabled() {
        return this.disabled || isLessThanOrEqual(Number(this.minOrDefault), Number(this.value));
    }

    /**
     * Visible input field type="text" that allows grouping and decimal separators to be entered
     * @type {?HTMLInputElement}
     * @private
     */
    get displayedInput() {
        if (!this._displayedInput) {
            this._displayedInput = this.querySelector('input.number-input__input');
        }
        return this._displayedInput;
    }

    /**
     * Hidden input field type="number" to validate all number related cases
     * @type {?HTMLInputElement}
     * @private
     */
    get hiddenInput() {
        return this._hiddenInput;
    }

    /**
     * This is the value that should be used in the template.
     * @type {string}
     * @private
     */
    get formattedValue() {
        return this._displayValue ?? '';
    }
    get labelOrAriaLabel() {
        return this.fieldLabel ?? this.i18n.inputAriaLabel;
    }
    get ariaDescribedByLabel() {
        return this.fieldDescribedBy ?? generateRandomId();
    }
    get randomId() {
        return `displayed-input-${this._randomId}`;
    }

    /**
     * Classes of the displayed input element
     * @type {string}
     * @private
     */
    get spanClasses() {
        const classes = ['slds-grid'];
        if (!this.disabled && (this.isInvalid || this.customValidity)) {
            classes.push('error');
        }
        return classes.join(' ');
    }
    get isInvalid() {
        return !this._isValid;
    }

    /**
     * Modifies the value in case the increment/decrement button is clicked
     * @param {?((n?: number) => void)} modifier The modifier function
     * @private
     */
    modifyValue(modifier) {
        const lastValue = this.value;
        if (modifier) {
            modifier();
        }
        this._internalValue = Number(this.hiddenInput?.value);
        this._displayValue = this.formatValue(Number(this.hiddenInput?.value));
        const detail = {
            isValid: true,
            reason: undefined,
            value: Number(this._internalValue),
            lastValue: Number(lastValue),
        };
        this.dispatchEvents(detail);
        this._isValid = true;
    }

    /**
     * Modifies value in case of the decrement button is clicked
     * @private
     */
    decrement() {
        const modifier = this.hiddenInput?.stepDown.bind(this.hiddenInput);
        this.modifyValue(modifier);
    }

    /**
     * Modifies value in case of the increment button is clicked
     * @private
     */
    increment() {
        const modifier = this.hiddenInput?.stepUp.bind(this.hiddenInput);
        this.modifyValue(modifier);
    }

    /**
     * Modifies values typed into the displayed input. Every entered value is validated to
     * assure that only numbers are entered. Grouping separators and decimal separators are
     * allowed, if they agree with the step size and locale. The input assumes that all
     * values entering here are typed in good faith in a certain locale. This means that
     * only those separators are allowed that also occur in the current locale. For example,
     * if the locale is de-DE a dot is a valid character but not a thin space (which is a
     * thousand separator in some locales).
     *
     * It's also possible to enter several grouping separators, even in places where it
     * would not make sense. The input will then try to make sense of the number by removing
     * those characters that are in places where they shouldn't occur. For example, if
     * the entered value is "1.1" in de-DE the dot is in a place where it usually wouldn't
     * occur. As a result, the input will remove the dot and the number will be interpreted
     * as "11".
     * @param {InputEvent} event The received `InputEvent`
     * @private
     */
    handleInputChange(event) {
        const lastValue = this._internalValue;
        const value = event?.target.value;
        const detail = {};
        let { reason, isValid } = this.validate(value, this.displayedInput);
        this._displayValue = value;

        if (!isValid) {
            detail.reason = reason;
            detail.isValid = isValid;
            detail.value = NaN;
            detail.lastValue = Number(lastValue);
        }

        if (isValid) {
            const numberValue = numberFormattedValue(value, getDecimalSeparator(), getGroupingSeparator());
            this._displayValue = this.formatValue(Number(numberValue));
            this._internalValue = numberValue;
            ({ reason, isValid } = this.validate(numberValue, this.hiddenInput));
            detail.reason = reason;
            detail.isValid = isValid;
            detail.value = Number(numberValue);
            detail.lastValue = Number(lastValue);
        }
        this.dispatchEvents(detail);
        this._isValid = isValid;
        this._validationFailureReason = reason;
    }

    /**
     * The method fires the 'valuechange' event and/or the 'validitychanged' depending on whether 'isValid' has changed
     * @param {Partial<ChangeEventDetail & ValidityEventDetail>} detail The details to emit
     */
    dispatchEvents(detail) {
        const isValidChanged = detail.isValid !== this._isValid;
        const reasonChanged = detail.reason !== this._validationFailureReason;
        if (isValidChanged || reasonChanged) {
            this.dispatch(VALIDITY_CHANGED_EVT, {
                isValid: detail.isValid,
                reason: detail.reason,
            });
        }
        this.dispatch(VALUE_CHANGED_EVT, {
            value: detail.value,
            lastValue: detail.lastValue,
            isValid: detail.isValid,
        });
    }

    /**
     * This method fires the 'valuechanged' event.
     * @param {string} event The name of the event to fire
     * @param {ChangeEventDetail} detail The details to emit
     * @private
     */
    dispatch(event, detail) {
        this.dispatchEvent(
            new CustomEvent(event, {
                bubbles: true,
                composed: true,
                detail,
            })
        );
    }

    /**
     * This method validates the given input. This will return 'valid' for ±Infinity.
     * @param {(number | string)} [value] The value to parse
     * @param {?HTMLInputElement} inputField The input field to use
     * @returns {{reason: ErrorState; isValid: boolean}} The validation result
     * @private
     */
    validate(value, inputField) {
        if (value === 0 || value) {
            inputField.value = value.toString();
        }

        const reason = first(findReason(inputField?.validity), 'valid');
        const isValid = reason === 'valid';
        return {
            reason,
            isValid,
        };
    }

    /**
     * This method should be used to validate number values only. This happens, for example,
     * when the value setter is used. It dispatches the change event after validation.
     * @param {number} [value] The value to validate
     * @private
     */
    validateAndDispatch(value) {
        const { isValid, reason } = this.validate(value, this.hiddenInput);
        if (isValid !== this._isValid) {
            this.dispatch(VALIDITY_CHANGED_EVT, {
                value,
                reason,
                isValid,
            });
        }
        this._isValid = isValid;
    }

    /**
     * This method formats number value to localized values with grouping and decimal separator.
     * @param {number} unformatted The value to format
     * @returns {string} The formatted representation of the value
     * @private
     */
    formatValue(unformatted) {
        const stepAsNum = Number(this.step);
        const maxFractionsDigits = stepAsNum < 1 ? stepAsNum?.toString().length - 2 : 20;
        return unformatted.toLocaleString(getLocale(), {
            maximumFractionDigits: maxFractionsDigits,
        });
    }
}
