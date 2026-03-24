/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api } from 'lwc';
import * as Labels from './labelUtils';

/**
 * BottomSheet component displays a bottom sheet modal with single-select (radio) or multi-select (checkbox) functionality.
 * Used for displaying suggested action options when "See More" is clicked.
 * @class
 * @augments LightningElement
 */
export default class BottomSheet extends LightningElement {
    /**
     * Specifies the render mode for the component.
     * Setting this to 'light' means the component's content is rendered directly into the host element,
     * making it accessible to global CSS and standard DOM APIs.
     * @type {string}
     */
    static renderMode = 'light';

    /**
     * Configuration object containing language and other settings
     * @type {object}
     */
    @api configuration = {};

    /**
     * Title to display in the bottom sheet header
     * @type {string}
     */
    @api title = '';

    /**
     * Array of option objects to display in the bottom sheet.
     * Each option should have: { displayValue: string, utterance: string }
     * @type {Array}
     */
    _options = [];

    /**
     * Index of the question this bottom sheet belongs to.
     * Used to track which question's bottom sheet is open.
     * @type {number|null}
     */
    @api questionIndex = null;

    @api
    get options() {
        return this._options;
    }

    set options(value) {
        this._options = Array.isArray(value) ? value : [];
        this._selectedValues = [];
    }

    /**
     * Controls whether the bottom sheet allows multi-select (checkboxes) or single-select (radio buttons).
     * @type {boolean}
     */
    @api multiSelect = false;

    /**
     * Controls whether the bottom sheet is open
     * @type {boolean}
     */
    @api isOpen = false;

    /**
     * Tracks selected option values. Always an array.
     * Single-select mode keeps at most one entry; multi-select mode allows many.
     * @type {Array<string>}
     * @private
     */
    _selectedValues = [];

    /**
     * Get current language for translations.
     * Falls back to English ('en_US') if no language is configured.
     * @returns {string} The current language code
     */
    get language() {
        return this.configuration?.language || 'en_US';
    }

    /**
     * Get translated labels based on current language
     * @returns {object} Object with translated label strings
     */
    get i18n() {
        const language = this.language;
        return {
            clearLabel: Labels.clearLabel(language),
            continueLabel: Labels.continueLabel(language),
        };
    }

    /**
     * Returns options with isSelected property computed for each option.
     * This allows the template to access option.isSelected without calling a method.
     * The getter automatically re-evaluates when _selectedValue changes due to LWC reactivity.
     * @returns {Array} Array of option objects with isSelected property and unique key
     */
    get processedOptions() {
        // Read _selectedValue to establish reactive dependency
        const selectedValues = this._selectedValues;
        // Read _options to establish reactive dependency
        const options = this._options;
        // Create a new array with new object references to ensure template re-renders
        return options.map((option, index) => {
            // Compare selectedValue with option.displayValue, handling null/undefined cases
            // Use String() comparison to handle type coercion
            const isSelected =
                selectedValues.length > 0 &&
                option.displayValue != null &&
                selectedValues.includes(option.displayValue);
            // Return a new object to ensure reference equality triggers re-render
            return {
                ...option,
                isSelected: isSelected,
                // Create a unique key by combining displayValue with index to ensure uniqueness
                // This handles cases where displayValue might be undefined, empty, or duplicated
                uniqueKey: `option-${index}-${option.displayValue || ''}`,
            };
        });
    }

    /**
     * Returns the label for the Proceed button
     * @returns {string} Proceed button label
     */
    get continueButtonLabel() {
        return this.i18n.continueLabel;
    }

    /**
     * Returns whether there is a selection
     * @returns {boolean} True if something is selected
     */
    get hasSelection() {
        return this._selectedValues.length > 0;
    }

    /**
     * Handles arrow-key navigation inside the radiogroup.
     * Native radio arrow-key behaviour is unreliable under LWC's re-render cycle,
     * so we manage focus and selection manually (WAI-ARIA radio-group pattern).
     * @param {KeyboardEvent} event - The keyboard event from the radio button
     */
    handleRadioKeyDown(event) {
        const { key } = event;
        const forward = key === 'ArrowDown' || key === 'ArrowRight';
        const backward = key === 'ArrowUp' || key === 'ArrowLeft';

        if (!forward && !backward) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const groupEl = event.target.closest('[role="radiogroup"]');
        const inputs = [...groupEl.querySelectorAll('input[type="radio"]')];
        if (inputs.length === 0) {
            return;
        }

        const currentIndex = inputs.indexOf(event.target);
        if (currentIndex === -1) {
            return;
        }

        const nextIndex = forward
            ? (currentIndex + 1) % inputs.length
            : (currentIndex - 1 + inputs.length) % inputs.length;

        const nextInput = inputs[nextIndex];
        nextInput.focus();
        nextInput.checked = true;
        this._selectedValues = [nextInput.value];
    }

    /**
     * Handles radio button click/change event
     * @param {Event} event - The click/change event from the radio button
     */
    handleRadioChange(event) {
        event.stopPropagation();
        const value = event.target.value;
        if (value && event.target.checked) {
            // Update selected value immediately
            // Ensure we store it as a string to match the comparison in processedOptions
            this._selectedValues = [value];
            // Force reactivity by creating a new array reference
            // This ensures processedOptions getter re-evaluates with the new _selectedValue
            this._options = [...this._options];
        }
    }

    handleCheckboxChange(event) {
        event.stopPropagation();
        const value = event.target.value;
        if (event.target.checked) {
            this._selectedValues = [...this._selectedValues, value];
        } else {
            this._selectedValues = this._selectedValues.filter((v) => v !== value);
        }
        this._options = [...this._options];
    }

    /**
     * Handles the Clear button click
     * @param {Event} event - The click event
     */
    handleClear(event) {
        event.stopPropagation();
        event.preventDefault();
        this._selectedValues = [];
        // Force reactivity by reassigning to trigger getter re-evaluation
        this._options = [...this._options];
    }

    /**
     * Handles the Proceed button click
     * Dispatches selectoption event directly if an option is selected.
     * The parent component will close the bottom sheet when it receives the selectoption event.
     * @param {Event} event - The click event
     */
    handleProceed(event) {
        event.stopPropagation();
        event.preventDefault();

        if (this._selectedValues.length > 0 && Array.isArray(this._options)) {
            const selectedOptions = this._options.filter(
                (option) =>
                    this._selectedValues.includes(option.displayValue) && option.displayValue && option.utterance
            );
            if (selectedOptions.length > 0) {
                const eventDetail = {
                    displayValue: selectedOptions.map((option) => option.displayValue).join(', '),
                    utterance: selectedOptions.map((option) => option.utterance).join(','),
                    questionIndex: this.questionIndex,
                };

                this.dispatchEvent(
                    new CustomEvent('selectoption', {
                        detail: eventDetail,
                        bubbles: true,
                    })
                );
            }
        }
    }

    /**
     * Handles the close button click
     * @param {Event} event - The click event
     */
    handleClose(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dispatchEvent(
            new CustomEvent('close', {
                detail: {
                    questionIndex: this.questionIndex,
                },
            })
        );
    }

    /**
     * Handles backdrop click to close the bottom sheet
     * @param {Event} event - The click event
     */
    handleBackdropClick(event) {
        event.stopPropagation();
        event.preventDefault();
        // Only close if clicking directly on the backdrop, not on the sheet content
        if (event.target === event.currentTarget) {
            this.dispatchEvent(
                new CustomEvent('close', {
                    detail: {
                        questionIndex: this.questionIndex,
                    },
                })
            );
        }
    }

    /**
     * Public API method to get selected value.
     * Returns the first selected value as a string (backward-compatible), or null if nothing is selected.
     * @returns {string|null} Selected option value or null if none selected
     */
    @api
    getSelectedValue() {
        return this._selectedValues.length > 0 ? this._selectedValues[0] : null;
    }

    /**
     * Public API method to set selected value.
     * Accepts a single string value (wraps in array internally) or null/falsy to clear.
     * @param {string|null} value - Option value to select, or null to clear selection
     */
    @api
    setSelectedValue(value) {
        this._selectedValues = value ? [String(value)] : [];
        this._options = [...this._options];
    }
}
