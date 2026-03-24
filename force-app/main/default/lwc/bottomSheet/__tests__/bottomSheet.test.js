/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { createElement } from 'lwc';
import BottomSheet from 'c/bottomSheet';

// Mock the labelService
jest.mock('c/labelService', () => ({
    getTranslatedLabel: jest.fn((key, data, locale) => {
        const labelData = data[key];
        return labelData?.[locale] || labelData?.en_US || key;
    }),
}));

const mockOptions = [
    {
        displayValue: 'Option 1',
        utterance: 'I want option 1',
    },
    {
        displayValue: 'Option 2',
        utterance: 'I want option 2',
    },
    {
        displayValue: 'Option 3',
        utterance: 'I want option 3',
    },
];

describe('c-bottom-sheet', () => {
    let element;

    beforeEach(() => {
        element = createElement('c-bottom-sheet', {
            is: BottomSheet,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    describe('Component Initialization', () => {
        it('should initialize with default values', () => {
            expect(element.title).toBe('');
            expect(element.isOpen).toBe(false);
            expect(element.options).toEqual([]);
            expect(element.configuration).toEqual({});
            expect(element.multiSelect).toBe(false);
        });

        it('should have light render mode', () => {
            expect(BottomSheet.renderMode).toBe('light');
        });
    });

    describe('Rendering', () => {
        it('should not render when isOpen is false', async () => {
            element.isOpen = false;
            element.title = 'Test Title';
            element.options = mockOptions;

            await Promise.resolve();

            const backdrop = element.querySelector('.bottom-sheet-backdrop');
            expect(backdrop).toBeNull();
        });

        describe('when isOpen is true', () => {
            beforeEach(async () => {
                element.isOpen = true;
                element.title = 'Test Title';
                element.options = mockOptions;
                await Promise.resolve();
            });

            it('should render backdrop', () => {
                const backdrop = element.querySelector('.bottom-sheet-backdrop');
                expect(backdrop).not.toBeNull();
            });

            it('should display title', () => {
                const titleElement = element.querySelector('.bottom-sheet-title');
                expect(titleElement).not.toBeNull();
                expect(titleElement.textContent).toBe('Test Title');
            });

            it('should render all options', () => {
                const optionItems = element.querySelectorAll('.bottom-sheet-option-item');
                expect(optionItems.length).toBe(3);
            });

            it('should render option display values correctly', () => {
                const optionTexts = Array.from(element.querySelectorAll('.bottom-sheet-radio-text')).map(
                    (el) => el.textContent
                );
                expect(optionTexts).toEqual(['Option 1', 'Option 2', 'Option 3']);
            });
        });
    });

    describe('Options Handling', () => {
        it('should set options correctly', () => {
            element.options = mockOptions;
            expect(element.options).toEqual(mockOptions);
        });

        it('should handle non-array options by converting to empty array', () => {
            element.options = null;
            expect(element.options).toEqual([]);

            element.options = undefined;
            expect(element.options).toEqual([]);

            element.options = 'not an array';
            expect(element.options).toEqual([]);
        });

        it('should reset selected values when options change', () => {
            element.options = mockOptions;
            element.setSelectedValue('Option 1');
            expect(element.getSelectedValue()).toBe('Option 1');

            element.options = [{ displayValue: 'New Option', utterance: 'new' }];
            expect(element.getSelectedValue()).toBeNull();
        });
    });

    describe('Radio Button Selection', () => {
        beforeEach(async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.options = mockOptions;
            await Promise.resolve();
        });

        it('should select an option when radio button is clicked', async () => {
            const radio = element.querySelector('input[value="Option 1"]');
            expect(radio).not.toBeNull();

            radio.checked = true;
            radio.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            await Promise.resolve();

            expect(element.getSelectedValue()).toBe('Option 1');
        });

        it('should change selection when another radio button is clicked', async () => {
            // First select an option
            const radio1 = element.querySelector('input[value="Option 1"]');
            radio1.checked = true;
            radio1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();

            expect(element.getSelectedValue()).toBe('Option 1');

            // Then select another option (radio buttons only allow one selection)
            const radio2 = element.querySelector('input[value="Option 2"]');
            radio2.checked = true;
            radio2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();

            expect(element.getSelectedValue()).toBe('Option 2');
            // Option 1 should no longer be selected
            const updatedRadio1 = element.querySelector('input[value="Option 1"]');
            expect(updatedRadio1.checked).toBe(false);
        });

        it('should allow only single selection', async () => {
            const radio1 = element.querySelector('input[value="Option 1"]');
            const radio2 = element.querySelector('input[value="Option 2"]');

            radio1.checked = true;
            radio1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();

            radio2.checked = true;
            radio2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();

            // Only the last selected option should be selected
            expect(element.getSelectedValue()).toBe('Option 2');
            const updatedRadio1 = element.querySelector('input[value="Option 1"]');
            expect(updatedRadio1.checked).toBe(false);
        });

        it('should update processedOptions with isSelected property', async () => {
            const radio = element.querySelector('input[value="Option 1"]');
            radio.checked = true;
            radio.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();

            // Check that the radio button is visually checked
            const updatedRadio = element.querySelector('input[value="Option 1"]');
            expect(updatedRadio.checked).toBe(true);
        });
    });

    describe('Clear Functionality', () => {
        beforeEach(async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.options = mockOptions;
            await Promise.resolve();

            // Select an option first
            element.setSelectedValue('Option 1');
        });

        it('should clear selection when clear button is clicked', async () => {
            expect(element.getSelectedValue()).toBe('Option 1');

            // Find the clear button
            const clearButton = element.querySelector('.bottom-sheet-button-clear');
            expect(clearButton).not.toBeNull();

            // Click the clear button
            clearButton.click();
            await Promise.resolve();

            // Verify selection is cleared
            expect(element.getSelectedValue()).toBeNull();
        });
    });

    describe('Proceed Functionality', () => {
        beforeEach(async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.options = mockOptions;
            await Promise.resolve();
        });

        it('should have proceed button rendered', async () => {
            const proceedButton = element.querySelector('.bottom-sheet-button-proceed');
            expect(proceedButton).not.toBeNull();
        });

        it('should dispatch selectoption event with displayValue and utterance when option selected and proceed clicked', async () => {
            element.questionIndex = 0;
            element.setSelectedValue('Option 1');
            await Promise.resolve();

            const selectOptionHandler = jest.fn();
            element.addEventListener('selectoption', selectOptionHandler);

            const proceedButton = element.querySelector('.bottom-sheet-button-proceed');
            proceedButton.click();

            expect(selectOptionHandler).toHaveBeenCalledTimes(1);
            const dispatchedEvent = selectOptionHandler.mock.calls[0][0];
            expect(dispatchedEvent.detail).toEqual({
                displayValue: 'Option 1',
                utterance: 'I want option 1',
                questionIndex: 0,
            });
            expect(dispatchedEvent.bubbles).toBe(true);
        });

        it('should not dispatch selectoption when no option selected and proceed clicked', async () => {
            const selectOptionHandler = jest.fn();
            element.addEventListener('selectoption', selectOptionHandler);

            const proceedButton = element.querySelector('.bottom-sheet-button-proceed');
            proceedButton.click();

            expect(selectOptionHandler).not.toHaveBeenCalled();
        });

        it('should not dispatch selectoption when selected option has no utterance', async () => {
            const optionsWithoutUtterance = [{ displayValue: 'No Utterance Option' }];
            element.options = optionsWithoutUtterance;
            element.setSelectedValue('No Utterance Option');
            await Promise.resolve();

            const selectOptionHandler = jest.fn();
            element.addEventListener('selectoption', selectOptionHandler);

            const proceedButton = element.querySelector('.bottom-sheet-button-proceed');
            proceedButton.click();

            expect(selectOptionHandler).not.toHaveBeenCalled();
        });
    });

    describe('Close Functionality', () => {
        beforeEach(async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.options = mockOptions;
            await Promise.resolve();
        });

        it('should dispatch close CustomEvent when close button is clicked', async () => {
            const closeHandler = jest.fn();
            element.addEventListener('close', closeHandler);

            const closeButton = element.querySelector('.bottom-sheet-close-button');
            expect(closeButton).not.toBeNull();

            closeButton.click();

            expect(closeHandler).toHaveBeenCalled();
        });

        it('should prevent default and stop propagation on close', async () => {
            const closeButton = element.querySelector('.bottom-sheet-close-button');
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            });
            const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
            const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

            closeButton.dispatchEvent(clickEvent);

            // The CustomEvent handlers should be called
            expect(stopPropagationSpy).toHaveBeenCalled();
            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('should dispatch close CustomEvent when backdrop is clicked', async () => {
            const closeHandler = jest.fn();
            element.addEventListener('close', closeHandler);

            const backdrop = element.querySelector('.bottom-sheet-backdrop');
            expect(backdrop).not.toBeNull();

            // Simulate clicking directly on the backdrop
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                target: backdrop,
                currentTarget: backdrop,
            });
            backdrop.dispatchEvent(clickEvent);

            expect(closeHandler).toHaveBeenCalled();
        });

        it('should not dispatch close CustomEvent when clicking on sheet content', async () => {
            const closeHandler = jest.fn();
            element.addEventListener('close', closeHandler);

            const container = element.querySelector('.bottom-sheet-container');

            // Click directly on the container (not the backdrop)
            // This should not trigger the backdrop click handler
            container.click();

            expect(closeHandler).not.toHaveBeenCalled();
        });
    });

    describe('Selection State Management', () => {
        it('should return null when no value is selected', () => {
            expect(element.getSelectedValue()).toBeNull();
        });

        it('should return selected value correctly', async () => {
            element.isOpen = true;
            element.options = mockOptions;
            await Promise.resolve();

            const radio = element.querySelector('input[value="Option 1"]');
            expect(radio).not.toBeNull();
            radio.checked = true;
            radio.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();

            expect(element.getSelectedValue()).toBe('Option 1');
        });

        it('should set selected value correctly', () => {
            element.options = mockOptions;
            element.setSelectedValue('Option 1');

            expect(element.getSelectedValue()).toBe('Option 1');
        });

        it('should handle setSelectedValue with null input', () => {
            element.options = mockOptions;
            element.setSelectedValue('Option 1');

            element.setSelectedValue(null);
            expect(element.getSelectedValue()).toBeNull();
        });

        it('should update radio buttons when setSelectedValue is called', async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.options = mockOptions;
            await Promise.resolve();

            element.setSelectedValue('Option 1');
            await Promise.resolve();

            const radio1 = element.querySelector('input[value="Option 1"]');
            const radio2 = element.querySelector('input[value="Option 2"]');
            const radio3 = element.querySelector('input[value="Option 3"]');

            expect(radio1.checked).toBe(true);
            expect(radio2.checked).toBe(false);
            expect(radio3.checked).toBe(false);
        });
    });

    describe('Internationalization', () => {
        it('should use default language when configuration is not provided', async () => {
            // Test by rendering the component and checking button labels
            element.isOpen = true;
            element.title = 'Test';
            element.options = mockOptions;
            await Promise.resolve();

            // Verify buttons are rendered (they use i18n internally)
            const buttons = element.querySelectorAll('.bottom-sheet-button');
            expect(buttons.length).toBeGreaterThan(0);
        });

        it('should use language from configuration', async () => {
            element.configuration = { language: 'es' };
            element.isOpen = true;
            element.title = 'Test';
            element.options = mockOptions;
            await Promise.resolve();

            // Verify buttons are rendered (they use i18n internally)
            const buttons = element.querySelectorAll('.bottom-sheet-button');
            expect(buttons.length).toBeGreaterThan(0);
        });

        it('should render buttons with labels', async () => {
            element.isOpen = true;
            element.title = 'Test';
            element.options = mockOptions;
            await Promise.resolve();

            // Verify buttons are rendered
            const buttons = element.querySelectorAll('.bottom-sheet-button');
            expect(buttons.length).toBe(2); // Clear and Proceed buttons
        });
    });

    describe('Footer Buttons', () => {
        beforeEach(async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.options = mockOptions;
            await Promise.resolve();
        });

        it('should show proceed and clear buttons when no selections', async () => {
            // Test by checking the buttons in the rendered DOM
            await Promise.resolve();
            const clearButton = element.querySelector('.bottom-sheet-button-clear');
            const proceedButton = element.querySelector('.bottom-sheet-button-proceed');
            expect(clearButton).not.toBeNull();
            expect(proceedButton).not.toBeNull();
        });

        it('should have data-has-selection attribute when selection exists', async () => {
            element.setSelectedValue('Option 1');
            await Promise.resolve();

            // Verify selection is set and button has correct attribute
            expect(element.getSelectedValue()).toBe('Option 1');
            const proceedButton = element.querySelector('.bottom-sheet-button-proceed');
            expect(proceedButton.getAttribute('data-has-selection')).toBe('true');
        });
    });

    describe('Processed Options', () => {
        it('should include isSelected property for each option', async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.options = mockOptions;
            await Promise.resolve();

            // Initially no options should be selected
            const radios = element.querySelectorAll('input[type="radio"]');
            radios.forEach((radio) => {
                expect(radio.checked).toBe(false);
            });
        });

        it('should update isSelected when option is selected', async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.options = mockOptions;
            await Promise.resolve();

            element.setSelectedValue('Option 1');
            await Promise.resolve();

            const radio1 = element.querySelector('input[value="Option 1"]');
            const radio2 = element.querySelector('input[value="Option 2"]');

            expect(radio1.checked).toBe(true);
            expect(radio2.checked).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty options array', async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.options = [];
            await Promise.resolve();

            const optionItems = element.querySelectorAll('.bottom-sheet-option-item');
            expect(optionItems.length).toBe(0);
        });

        it('should handle options with missing displayValue', async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.options = [
                { displayValue: 'Valid Option', utterance: 'test' },
                { utterance: 'missing displayValue' },
            ];
            await Promise.resolve();

            const optionItems = element.querySelectorAll('.bottom-sheet-option-item');
            expect(optionItems.length).toBe(2);
        });

        it('should handle rapid radio button selection', async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.options = mockOptions;
            await Promise.resolve();

            const radio1 = element.querySelector('input[value="Option 1"]');
            const radio2 = element.querySelector('input[value="Option 2"]');

            // Rapidly select different options
            radio1.checked = true;
            radio1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();

            radio2.checked = true;
            radio2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();

            radio1.checked = true;
            radio1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();

            expect(element.getSelectedValue()).toBe('Option 1');
        });
    });

    describe('Multi-Select Mode', () => {
        beforeEach(async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.multiSelect = true;
            element.options = mockOptions;
            await Promise.resolve();
        });

        it('should render checkboxes instead of radio buttons', () => {
            const checkboxes = element.querySelectorAll('input[type="checkbox"]');
            const radios = element.querySelectorAll('input[type="radio"]');
            expect(checkboxes.length).toBe(3);
            expect(radios.length).toBe(0);
        });

        it('should use checkboxgroup role', () => {
            const content = element.querySelector('.bottom-sheet-content');
            expect(content.getAttribute('role')).toBe('checkboxgroup');
        });

        it('should allow selecting multiple options', async () => {
            const cb1 = element.querySelector('input[value="Option 1"]');
            const cb2 = element.querySelector('input[value="Option 2"]');

            cb1.click();
            await Promise.resolve();

            expect(element.getSelectedValue()).toBe('Option 1');

            cb2.click();
            await Promise.resolve();

            expect(element.getSelectedValue()).toBe('Option 1');
            // Verify both are in the selection by proceeding and checking the event
            element.questionIndex = 0;
            const handler = jest.fn();
            element.addEventListener('selectoption', handler);
            element.querySelector('.bottom-sheet-button-proceed').click();

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler.mock.calls[0][0].detail.displayValue).toBe('Option 1, Option 2');
        });

        it('should remove option when checkbox is unchecked', async () => {
            const cb1 = element.querySelector('input[value="Option 1"]');

            cb1.click();
            await Promise.resolve();

            expect(element.getSelectedValue()).toBe('Option 1');

            element.querySelector('input[value="Option 1"]').click();
            await Promise.resolve();

            expect(element.getSelectedValue()).toBeNull();
        });

        it('should clear all selections when clear is clicked', async () => {
            element.querySelector('input[value="Option 1"]').click();
            element.querySelector('input[value="Option 2"]').click();
            await Promise.resolve();

            expect(element.getSelectedValue()).toBe('Option 1');

            const clearButton = element.querySelector('.bottom-sheet-button-clear');
            clearButton.click();
            await Promise.resolve();

            expect(element.getSelectedValue()).toBeNull();
        });

        it('should dispatch selectoption with comma-joined values on proceed', async () => {
            element.questionIndex = 0;

            element.querySelector('input[value="Option 1"]').click();
            await Promise.resolve();
            element.querySelector('input[value="Option 3"]').click();
            await Promise.resolve();

            const handler = jest.fn();
            element.addEventListener('selectoption', handler);

            element.querySelector('.bottom-sheet-button-proceed').click();

            expect(handler).toHaveBeenCalledTimes(1);
            const detail = handler.mock.calls[0][0].detail;
            expect(detail.displayValue).toBe('Option 1, Option 3');
            expect(detail.utterance).toBe('I want option 1,I want option 3');
            expect(detail.questionIndex).toBe(0);
        });

        it('should not dispatch selectoption on proceed when nothing is selected', async () => {
            const handler = jest.fn();
            element.addEventListener('selectoption', handler);

            const proceedButton = element.querySelector('.bottom-sheet-button-proceed');
            proceedButton.click();

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('Keyboard Arrow Navigation (Radio)', () => {
        beforeEach(async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.options = mockOptions;
            await Promise.resolve();
        });

        it('should move focus and selection to next radio on ArrowDown', async () => {
            const radios = element.querySelectorAll('input[type="radio"]');
            radios[0].focus();

            radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await Promise.resolve();

            expect(document.activeElement).toBe(radios[1]);
            expect(element.getSelectedValue()).toBe('Option 2');
        });

        it('should move focus and selection to previous radio on ArrowUp', async () => {
            const radios = element.querySelectorAll('input[type="radio"]');
            radios[1].focus();

            radios[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
            await Promise.resolve();

            expect(document.activeElement).toBe(radios[0]);
            expect(element.getSelectedValue()).toBe('Option 1');
        });

        it('should wrap from last to first radio on ArrowDown', async () => {
            const radios = element.querySelectorAll('input[type="radio"]');
            radios[2].focus();

            radios[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await Promise.resolve();

            expect(document.activeElement).toBe(radios[0]);
            expect(element.getSelectedValue()).toBe('Option 1');
        });

        it('should wrap from first to last radio on ArrowUp', async () => {
            const radios = element.querySelectorAll('input[type="radio"]');
            radios[0].focus();

            radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
            await Promise.resolve();

            expect(document.activeElement).toBe(radios[2]);
            expect(element.getSelectedValue()).toBe('Option 3');
        });

        it('should move focus on ArrowRight and ArrowLeft', async () => {
            const radios = element.querySelectorAll('input[type="radio"]');
            radios[0].focus();

            radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            await Promise.resolve();
            expect(document.activeElement).toBe(radios[1]);

            radios[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
            await Promise.resolve();
            expect(document.activeElement).toBe(radios[0]);
        });

        it('should not interfere with non-arrow keys', async () => {
            const radios = element.querySelectorAll('input[type="radio"]');
            radios[0].focus();

            radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
            await Promise.resolve();

            expect(document.activeElement).toBe(radios[0]);
        });

        it('should return early when radiogroup contains no radio inputs', async () => {
            const radio = element.querySelector('input[type="radio"]');
            expect(radio).not.toBeNull();
            // Override closest on this specific element so the handler sees an empty group
            const fakeGroup = { querySelectorAll: () => [] };
            Object.defineProperty(radio, 'closest', {
                value: () => fakeGroup,
                configurable: true,
                writable: true,
            });

            radio.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await Promise.resolve();

            // No navigation occurs; selection remains unchanged
            expect(element.getSelectedValue()).toBeNull();
        });

        it('should return early when event target is not found among radiogroup inputs', async () => {
            const radios = element.querySelectorAll('input[type="radio"]');
            // Override closest so the group's querySelectorAll returns inputs that exclude radios[0]
            const fakeGroup = { querySelectorAll: () => [radios[1], radios[2]] };
            Object.defineProperty(radios[0], 'closest', {
                value: () => fakeGroup,
                configurable: true,
                writable: true,
            });

            radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await Promise.resolve();

            // No navigation occurs; selection remains unchanged
            expect(element.getSelectedValue()).toBeNull();
        });
    });

    describe('Single-Select Mode (default)', () => {
        beforeEach(async () => {
            element.isOpen = true;
            element.title = 'Test Title';
            element.options = mockOptions;
            await Promise.resolve();
        });

        it('should render radio buttons when multiSelect is false', () => {
            const radios = element.querySelectorAll('input[type="radio"]');
            const checkboxes = element.querySelectorAll('input[type="checkbox"]');
            expect(radios.length).toBe(3);
            expect(checkboxes.length).toBe(0);
        });

        it('should use radiogroup role', () => {
            const content = element.querySelector('.bottom-sheet-content');
            expect(content.getAttribute('role')).toBe('radiogroup');
        });
    });
});
