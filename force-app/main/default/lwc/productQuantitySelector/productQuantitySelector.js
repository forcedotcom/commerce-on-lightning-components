/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';
import { ERROR_RANGE_UNDERFLOW, stringOnlyHasNumbers } from 'c/commonNumberInput';
import { defaultRules, errorLabels, OUT_OF_STOCK_EVT, VALUE_CHANGED_EVT, VALIDITY_CHANGED_EVT } from './constants';
import { outOfStock as outOfStockDefaultLabel } from './labels';
export { defaultRules, OUT_OF_STOCK_EVT, VALUE_CHANGED_EVT };
const generateRandomId = (() => {
    let lastId = 0;
    return () => crypto?.randomUUID?.() || String(++lastId);
})();

/**
 * An event fired when the value in the field changed, e.g. due to a user interaction.
 * @event ProductQuantitySelector#valuechanged
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {number} detail.value
 *   The value that was entered by the user, *even* if that value
 *   is invalid and violates the rules defined for this field.
 * @property {number} detail.lastValue
 *   The last correct value that was either entered or enforced.
 */

/**
 * An event fired when the validity of the field changed, e.g. due to a user interaction.
 * @event ProductQuantitySelector#validitychanged
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {boolean} detail.isValid
 *  Represents the validity of the field's value.
 * @property {('rangeOverflow' | 'rangeUnderflow' | 'stepMismatch' | 'patternMismatch' | 'valid')} detail.reason
 *  The reason why the entered value is not considered valid.
 * @property {string} [detail.description]
 *  An optional description for the field's (in)validity.
 */

/**
 * An event fired when the inventory validation takes place.
 * @event ProductQuantitySelector#outofstock
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {boolean} detail.isOutOfStock
 *   The boolean flag to indicate availability of the product
 */

/**
 * @typedef {object} Rules
 * @property {number} minimum The minimum allowed value
 * @property {number} maximum The maximum allowed value
 * @property {number} step The allowed step size / increments
 */

/**
 * The QuantitySelector component is a common component that can be used on all pages to show a number input field
 * optionally with quantity rules and +/- buttons.
 *
 * Parameters:
 *  minimum - The minimal allowed value
 *  maximum - The maximum allowed value
 *  step - The allowed increments
 *  availableQuantity - The current availability of a product
 *
 *  hideLabel - boolean to hide the label for the inout field
 *  hideButtons - boolean to hide the +/- buttons
 *
 *  label - The label for the input field
 *  minimumValueGuideText - text that shows up in a quantity rules popover; takes '{0}' as a replaceable parameter
 *  maximumValueGuideText - text that shows up in a quantity rules popover; takes '{0}' as a replaceable parameter
 *  stepValueGuideText - text that shows up in a quantity rules popover; takes '{0}' as a replaceable parameter
 *
 *  outOfStockText - text that shows up in below the quantity selector when the product is out of stock; the selector
 *                 will be disabled as well
 *  hideOutOfStock - boolean to hide the out-of-stock text so that the selector is disabled but no text is shown
 *  customErrorMessage
 *      error message that will force the quantity selector to be in error state;
 *      the error message will be shown as long as the value is set;
 *      while the quantity selector validates product quantity rules and inventory count and shows the appropriate
 *      error message in case one is violated, this property can be used to show a custom error message with any content
 * @fires ProductQuantitySelector#valuechanged
 * @fires ProductQuantitySelector#validitychanged
 * @fires ProductQuantitySelector#outofstock
 */
export default class ProductQuantitySelector extends LightningElement {
    static renderMode = 'light';
    _minimum;
    _step;
    _isValid = true;
    _validationFailureReason = '';
    _ariaDescribedById = generateRandomId();
    _isOutOfStock = false;
    _availableQuantity;
    @api
    get minimum() {
        return this._minimum;
    }
    set minimum(value) {
        this._minimum = value;
        this.determineOutOfStock();
    }
    @api
    maximum;
    @api
    get step() {
        return this._step;
    }
    set step(value) {
        this._step = value;
        this.determineOutOfStock();
    }
    @api
    hideLabel = false;
    @api
    hideButtons = false;
    @api
    hideNotifications = false;
    @api
    disabled = false;
    @api
    label;
    @api
    minimumValueGuideText;
    @api
    maximumValueGuideText;
    @api
    stepValueGuideText;
    @api
    value;
    @api
    outOfStockText;
    @api
    hideOutOfStock = false;
    @api
    customErrorMessage;
    @api
    get availableQuantity() {
        return this._availableQuantity;
    }
    set availableQuantity(value) {
        this._availableQuantity = value;
        this.determineOutOfStock();
    }
    get inputValue() {
        return this.value == null ? this.rulesAsNumbers.minimum : this.value;
    }

    /**
     * The numberInput does expect to get a number or undefined,
     * therefore normalizing the values here.
     * @type {Rules}
     */
    get rulesAsNumbers() {
        return {
            minimum: this._minimum && stringOnlyHasNumbers(this._minimum) ? +this._minimum : defaultRules.minimum,
            maximum: this.maximum && stringOnlyHasNumbers(this.maximum) ? +this.maximum : defaultRules.maximum,
            step: this._step && stringOnlyHasNumbers(this._step) ? +this._step : defaultRules.step,
        };
    }
    get ruleOrInventoryMaximum() {
        const { minimum, maximum, step } = this.rulesAsNumbers;
        return this._availableQuantity && this._availableQuantity < maximum
            ? this._availableQuantity - ((this._availableQuantity - minimum) % step)
            : maximum;
    }
    get minimumText() {
        return this._minimum && this.minimumValueGuideText
            ? this.minimumValueGuideText?.replace('{0}', this._minimum)
            : '';
    }
    get maximumText() {
        const maximum = this.ruleOrInventoryMaximum;
        return (this.maximum || this._availableQuantity) && this.maximumValueGuideText
            ? this.maximumValueGuideText?.replace('{0}', maximum.toString())
            : '';
    }
    get stepText() {
        return this._step && this.stepValueGuideText ? this.stepValueGuideText?.replace('{0}', this._step) : '';
    }
    get showRulePopover() {
        return (
            !this._isOutOfStock &&
            [this.minimumText, this.maximumText, this.stepText].some((text) => text && text.length > 0)
        );
    }
    get hasValidationError() {
        return !this._isValid && !!this._validationFailureReason;
    }
    get hasCustomError() {
        return !!this.customErrorMessage;
    }
    get showOutOfStock() {
        return this._isOutOfStock && !this.hideOutOfStock;
    }
    get showValidationError() {
        return this.hasValidationError && !this._isOutOfStock;
    }
    get isDisabled() {
        return this.disabled || this._isOutOfStock;
    }
    get showNotification() {
        return !this.hideNotifications;
    }
    get hasError() {
        return this.hasCustomError || this.showOutOfStock || this.showValidationError;
    }
    get computedClasses() {
        const classes = 'slds-p-top_x-small slds-text-align_left slds-m-right_small';
        if (this.hasError) {
            return `${classes} slds-text-color_error`;
        }
        return `${classes} slds-hide`;
    }
    get ariaDescribedByLabel() {
        return `quantity-selector-${this._ariaDescribedById}`;
    }
    get notificationText() {
        const errorLabel = this.hasValidationError
            ? errorLabels[this._validationFailureReason]
            : errorLabels[ERROR_RANGE_UNDERFLOW];
        if (this.customErrorMessage) {
            return this.customErrorMessage;
        }
        if (this._isOutOfStock) {
            return this.outOfStockText || outOfStockDefaultLabel;
        }
        return errorLabel
            .replace('{min}', `${this.rulesAsNumbers.minimum}`)
            .replace('{max}', `${this.ruleOrInventoryMaximum}`)
            .replace('{step}', `${this.rulesAsNumbers.step}`);
    }
    determineOutOfStock() {
        const inventory = this._availableQuantity;
        const min = this.rulesAsNumbers.minimum;
        const step = this.rulesAsNumbers.step;
        let newOutOfStock = false;
        if (inventory != null) {
            newOutOfStock = inventory === 0 || inventory < min || inventory < step;
        }
        if (newOutOfStock !== this._isOutOfStock) {
            this._isOutOfStock = newOutOfStock;
            this.dispatchOutOfStockEvent(newOutOfStock);
        }
    }
    dispatchOutOfStockEvent(value) {
        this.dispatchEvent(
            new CustomEvent(OUT_OF_STOCK_EVT, {
                detail: {
                    isOutOfStock: value,
                },
            })
        );
    }
    handleQuantityChanged(e) {
        e.stopPropagation();
        const detail = e.detail;
        if (detail && detail.isValid) {
            this.dispatchEvent(
                new CustomEvent(VALUE_CHANGED_EVT, {
                    bubbles: true,
                    composed: true,
                    detail: {
                        value: detail.value,
                        lastValue: detail.lastValue,
                    },
                })
            );
        }
    }
    handleValidityChanged(e) {
        e.stopPropagation();
        const detail = e.detail;
        if (detail) {
            this._isValid = detail.isValid;
            this._validationFailureReason = detail.reason;
        }
        this.dispatchEvent(
            new CustomEvent(VALIDITY_CHANGED_EVT, {
                bubbles: true,
                composed: true,
                detail: {
                    ...e.detail,
                    description: this.notificationText,
                },
            })
        );
    }
}
