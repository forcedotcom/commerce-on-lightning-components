import { api, LightningElement } from 'lwc';
import type { LwcCustomEventTargetOf } from 'types/common';
import { applyCouponToCart } from 'commerce/cartApi';
import labels from './labels';
import type { ErrorLabels } from 'commerce_cart/types';
import { getErrorInfo } from 'commerce_cart/failedActionEvaluator';

/**
 * Maximum character limit for the coupon input.
 */
const COUPON_INPUT_CHAR_LIMIT = 255;

/**
 * The display for the apply coupon input form.
 */

export default class InputForm extends LightningElement {
    public static renderMode = 'light';

    /**
     * Gets or sets the reveal coupon input button text.
     * Clicking the reveal coupon input button displays the apply coupon input form.
     *
     * @type {string}
     */
    @api
    public revealCouponButtonText: string | undefined;

    /**
     * Gets or sets the apply coupon button text.
     *
     * @type {string}
     */
    @api
    public buttonText: string | undefined;

    /**
     * Gets or sets the input box placeholder text.
     *
     * @type {string}
     */
    @api
    public placeholderText: string | undefined;

    /**
     * Whether to show the reveal coupon input button
     *
     * @type {boolean}
     */
    @api
    public showRevealCouponInputButton: boolean | undefined;

    /**
     * Internal property to store the current coupon form input value.
     */
    private _couponInputValue = '';

    /**
     * Internal property to indicate whether the apply coupon should be disabled.
     */
    private _disableApplyButton = false;

    /**
     * Internal property to indicate whether to place focus on the input element.
     */
    private _focusOnInput = false;

    /**
     * Internal property to store the latest error message.
     */
    private _errorMessage: string | undefined;

    /**
     * Internal property to indicate whether the reveal coupon input button has been clicked.
     */
    private _revealCouponInputButtonClicked = false;

    /**
     * Focuses on the coupon input box if it exists and
     * if the reveal coupon input button has been clicked.
     */
    renderedCallback(): void {
        const inputBox = this.inputBox;
        if (this._focusOnInput && inputBox) {
            inputBox.focus();
            this._focusOnInput = false;
        }
    }

    /**
     * Resets the coupon input form.
     */
    @api
    public clear(): void {
        // Resets the input box value
        this.inputBox.value = '';
        // Resets the input box error message
        this.setCustomValidity('');
        // Resets the error message
        this._errorMessage = '';
        // Disables the apply coupon button
        this._couponInputValue = '';
    }

    /**
     * Sets whether the apply button should be disabled.
     *
     * @param {boolean} disable
     */
    @api get disable(): boolean {
        return this._disableApplyButton;
    }
    set disable(value: boolean) {
        this._disableApplyButton = value;
    }

    /**
     * Applies focus on the coupon input box.
     */
    @api
    public focusOnInputBox(): void {
        const inputBox = this.inputBox;
        if (inputBox) {
            inputBox.focus();
        }
    }

    /**
     * Displays the provided error message under the input box when apply coupon fails.
     *
     * @param {string} message
     */
    @api
    public setCustomValidity(message: string): void {
        const errorMessage = message || '';
        this._errorMessage = errorMessage;
        this.inputBox.setCustomValidity(errorMessage);
        this.inputBox.reportValidity();
    }

    /**
     * Whether to display the apply coupon input form
     *
     * @returns {boolean}
     */
    public get displayInputForm(): boolean {
        return (
            (this.showRevealCouponInputButton && this._revealCouponInputButtonClicked) ||
            !this.showRevealCouponInputButton
        );
    }

    /**
     * Whether or not to display the reveal coupon input button
     *
     * @returns {boolean}
     */
    public get displayRevealCouponButton(): boolean {
        return (
            undefined !== this.showRevealCouponInputButton &&
            this.showRevealCouponInputButton &&
            !this._revealCouponInputButtonClicked
        );
    }

    /**
     * Gets the lightning-input element
     *
     * @returns {HTMLInputElement}
     */
    private get inputBox(): HTMLInputElement {
        return <HTMLInputElement>this.querySelector('lightning-input');
    }

    /**
     * Get whether or not to disable the apply coupon button.
     * The apply coupon button should be disabled when
     *     - the disable apply button property is true or
     *     - the input form is empty or
     *     - the max character limit has been reached
     *
     * @returns {boolean}
     */
    private get disableApplyCouponButton(): boolean {
        return this._disableApplyButton || this.inputFormIsEmpty || this.maxCharLimitReached;
    }

    /**
     * Get whether or not the input form is empty.
     *
     * @returns {boolean}
     */
    private get inputFormIsEmpty(): boolean {
        return this._couponInputValue ? !this._couponInputValue.trim() : !this._couponInputValue;
    }

    /**
     * Get whether the max character limit
     * for the input form has been reached.
     *
     * @returns {boolean}
     */
    private get maxCharLimitReached(): boolean {
        return (this._couponInputValue || '').length >= COUPON_INPUT_CHAR_LIMIT;
    }

    /**
     * Handler for 'click' event fired from the apply coupon button.
     */
    private handleApplyCoupon(): void {
        const couponCode = this.inputBox.value;
        this.applyCartCoupon(couponCode);
    }

    /**
     * Calls the cartApiInternal to actually apply the coupon code.
     *
     * @param couponCode {string}
     *
     * @fires couponapplied once the coupon has been applied successfully
     */
    applyCartCoupon(couponCode: string): void {
        applyCouponToCart(couponCode)
            .then(() => {
                // Clear the input form on success
                this.clear();
                const applyFocusEvent = new CustomEvent('couponapplied', {
                    bubbles: false,
                    cancelable: false,
                    composed: false,
                });

                this.dispatchEvent(applyFocusEvent);
            })
            .catch((cartErrorObject) => {
                // get the error code from the failedAction error
                // if there was an error, get the error code and set the error message
                const errorInfo = getErrorInfo(cartErrorObject?.error?.code, this.applyCouponLocalizedErrorMessages);
                const failureMessage = errorInfo.message.replace('{code}', couponCode);
                // Display the error message under the coupon input form.
                this.setCustomValidity(failureMessage);
                // Focus on the coupon input box
                this.focusOnInputBox();
            });
    }

    /**
     * Apply coupon localized error labels.
     *
     * @returns {Object}
     *  Object containg the localized error labels associated for the appropriate error code.
     */
    private get applyCouponLocalizedErrorMessages(): ErrorLabels {
        return {
            webstoreNotFound: labels.webstoreNotFound,
            effectiveAccountNotFound: labels.effectiveAccountNotFound,
            insufficientAccess: labels.insufficientAccess,
            maximumLimitExceeded: labels.maximumLimitExceeded,
            alreadyApplied: labels.alreadyApplied,
            blockedExclusive: labels.blockedExclusive,
            unqualifiedCart: labels.unqualifiedCart,
            defaultErrorMessage: labels.defaultErrorMessage,
            invalidInput: labels.invalidInput,
            limitExceeded: labels.maximumLimitExceeded,
            gateDisabled: '',
            tooManyRecords: '',
            itemNotFound: '',
            missingRecord: '',
            invalidBatchSize: '',
        };
    }

    /**
     * Checks input validity.
     * Displays the error message if the input character limit has been reached
     * else clears displayed error messages.
     */
    private checkInputValidity(): void {
        const errorMessage = this.maxCharLimitReached ? labels.inputFormCharacterLimitMessage : '';
        this._errorMessage = errorMessage;
        const input = this.inputBox;
        input.setCustomValidity(errorMessage);
        input.reportValidity();
    }

    /**
     * Handler for when the coupon input value changes.
     */
    private handleInputChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        this._couponInputValue = event.target.value;
        this.checkInputValidity();
    }

    /**
     * Handles the 'blur' event for coupon input box.
     * The lightning-input base component automatically clears the error message on blur,
     * but we want to continue displaying the error message.
     */
    private handleOnBlur(): void {
        if (this._errorMessage) {
            const input = this.inputBox;
            input.setCustomValidity(this._errorMessage);
            input.reportValidity();
        }
    }

    /**
     * Handles a 'click' event on the reveal coupon input button.
     */
    private handleRevealCouponButtonClick(): void {
        this._revealCouponInputButtonClicked = true;
        this._focusOnInput = true;
    }

    /**
     * Gets the available labels.
     *
     * @type {Object}
     *
     * @readonly
     * @private
     */
    private get labels(): Record<string, string> {
        return labels;
    }
}
