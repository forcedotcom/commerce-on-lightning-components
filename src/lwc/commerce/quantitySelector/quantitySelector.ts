import { api, LightningElement } from 'lwc';
import { defaultRules, errorLabels } from './constants';
import { stringOnlyHasNumbers } from 'commerce/numberInput';
import type { ChangeEventDetail, ErrorState } from 'commerce/numberInput';
import type { Rules } from './types';

/**
 * The QuantitySelector component is a common component that can be used on all pages to show a number input field
 * optionally with quantity rules and +/- buttons.
 *
 * Parameters:
 *  minimum - The minimal allowed value
 *  maximum - The maximum allowed value
 *  step - The allowed increments
 *
 *  hideLabel - boolean to hide the label for the inout field
 *  hideButtons - boolean to hide the +/- buttons
 *
 *  label - The label for the input field
 *  minimumValueGuideText - text that shows up in a quantity rules popover; takes '{0}' as a replaceable parameter
 *  maximumValueGuideText - text that shows up in a quantity rules popover; takes '{0}' as a replaceable parameter
 *  stepValueGuideText - text that shows up in a quantity rules popover; takes '{0}' as a replaceable parameter
 *
 */
export default class QuantitySelector extends LightningElement {
    public static renderMode = 'light';

    _isValid = true;
    _validationFailureReason: ErrorState | '' = '';

    @api
    minimum?: string;

    @api
    maximum?: string;

    @api
    step?: string;

    @api
    hideLabel = false;

    @api
    hideButtons = false;

    @api
    disabled = false;

    @api
    label?: string;

    @api
    minimumValueGuideText?: string;

    @api
    maximumValueGuideText?: string;

    @api
    stepValueGuideText?: string;

    @api
    value: number | undefined;

    handleQuantityChanged({ detail }: CustomEvent<ChangeEventDetail>): void {
        if (detail) {
            this._isValid = detail.isValid;
            this._validationFailureReason = detail.reason ?? '';
        }
    }

    get inputValue(): number | undefined {
        // If a value is provided from a parent use that value or else use the minimum.
        return this.value == null ? this.rulesAsNumbers.minimum : this.value;
    }

    /**
     * The numberInput does expect to get a number or undefined, therefore transforming the value here.
     */
    get rulesAsNumbers(): Rules {
        return {
            minimum: this.minimum && stringOnlyHasNumbers(this.minimum) ? +this.minimum : defaultRules.minimum,
            maximum: this.maximum && stringOnlyHasNumbers(this.maximum) ? +this.maximum : defaultRules.maximum,
            step: this.step && stringOnlyHasNumbers(this.step) ? +this.step : defaultRules.step,
        };
    }

    get minimumText(): string {
        return this.minimum && this.minimumValueGuideText
            ? this.minimumValueGuideText?.replace('{0}', this.minimum)
            : '';
    }

    get maximumText(): string {
        return this.maximum && this.maximumValueGuideText
            ? this.maximumValueGuideText?.replace('{0}', this.maximum)
            : '';
    }

    get stepText(): string | undefined {
        return this.step && this.stepValueGuideText ? this.stepValueGuideText?.replace('{0}', this.step) : '';
    }

    get showRulePopover(): boolean {
        return [this.minimumText, this.maximumText, this.stepText].some((text) => text && text.length > 0);
    }

    hasError(): boolean {
        return !this._isValid && !!this._validationFailureReason;
    }

    get computedClasses(): string {
        const classes = 'slds-p-top_x-small slds-text-align_left slds-m-right_small';
        return this.hasError() ? `${classes} slds-text-color_error` : `${classes} slds-hide`;
    }

    get notificationText(): string {
        if (this.hasError()) {
            const errorLabel = errorLabels[this._validationFailureReason];
            return errorLabel
                .replace('{min}', `${this.rulesAsNumbers.minimum}`)
                .replace('{max}', `${this.rulesAsNumbers.maximum}`)
                .replace('{step}', `${this.rulesAsNumbers.step}`);
        }

        /** This is the default return value to reserve space in the template to avoid jumping elements on the page
         *  when a notification is shown.
         */
        return Object.values(errorLabels)[1];
    }
}
