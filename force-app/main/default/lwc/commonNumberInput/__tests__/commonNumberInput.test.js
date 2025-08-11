/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { createElement } from 'lwc';
import CommonNumberInput from 'c/commonNumberInput';
import {
    VALUE_CHANGED_EVT,
    VALIDITY_CHANGED_EVT,
    ERROR_RANGE_OVERFLOW,
    ERROR_RANGE_UNDERFLOW,
    PATTERN_MISMATCH,
} from 'c/commonNumberInput';

describe('c-common-number-input', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('should create the component', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        document.body.appendChild(element);
        expect(element).toBeTruthy();
    });

    it('should render with default values', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const input = element.querySelector('input.number-input__input');
            const incrementButton = element.querySelector('.number-input__increment-button');
            const decrementButton = element.querySelector('.number-input__decrement-button');

            expect(input).toBeTruthy();
            expect(incrementButton).toBeTruthy();
            expect(decrementButton).toBeTruthy();
            expect(input.value).toBe('');
            expect(input.disabled).toBeFalsy();
            expect(incrementButton.disabled).toBeFalsy();
            expect(decrementButton.disabled).toBeFalsy();
        });
    });

    it('should render with label when fieldLabel is provided', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        element.fieldLabel = 'Test Label';
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const label = element.querySelector('label');
            expect(label).toBeTruthy();
            expect(label.textContent.trim()).toBe('Test Label');
        });
    });

    it('should hide label when hideLabel is true', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        element.fieldLabel = 'Test Label';
        element.hideLabel = true;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const label = element.querySelector('label');
            expect(label).toBeFalsy();
        });
    });

    it('should hide buttons when hideButtons is true', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        element.hideButtons = true;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const incrementButton = element.querySelector('.number-input__increment-button');
            const decrementButton = element.querySelector('.number-input__decrement-button');
            expect(incrementButton).toBeFalsy();
            expect(decrementButton).toBeFalsy();
        });
    });

    it('should show buttons when hideButtons is false', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        element.hideButtons = false;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const incrementButton = element.querySelector('.number-input__increment-button');
            const decrementButton = element.querySelector('.number-input__decrement-button');
            expect(incrementButton).toBeTruthy();
            expect(decrementButton).toBeTruthy();
        });
    });

    it('should disable input and buttons when disabled is true', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        element.disabled = true;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const input = element.querySelector('input.number-input__input');
            const incrementButton = element.querySelector('.number-input__increment-button');
            const decrementButton = element.querySelector('.number-input__decrement-button');

            expect(input.disabled).toBeTruthy();
            expect(incrementButton.disabled).toBeTruthy();
            expect(decrementButton.disabled).toBeTruthy();
        });
    });

    it('should increment value when increment button is clicked', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });

        document.body.appendChild(element);

        element.value = 5;
        element.step = 1;

        return Promise.resolve().then(() => {
            const incrementButton = element.querySelector('.number-input__increment-button');
            const handler = jest.fn();
            element.addEventListener(VALUE_CHANGED_EVT, handler);

            incrementButton.click();

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        value: 6,
                        lastValue: 5,
                        isValid: true,
                    }),
                })
            );
        });
    });

    it('should decrement value when decrement button is clicked', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        element.value = 5;
        element.step = 1;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const decrementButton = element.querySelector('.number-input__decrement-button');
            const handler = jest.fn();
            element.addEventListener(VALUE_CHANGED_EVT, handler);

            decrementButton.click();

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        value: 4,
                        lastValue: 5,
                        isValid: true,
                    }),
                })
            );
        });
    });

    it('should decrement value when decrement button is clicked with a fractional step', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        element.value = 5;
        element.step = 0.5;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const decrementButton = element.querySelector('.number-input__decrement-button');
            const handler = jest.fn();
            element.addEventListener(VALUE_CHANGED_EVT, handler);

            decrementButton.click();

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        value: 4.5,
                        lastValue: 5,
                        isValid: true,
                    }),
                })
            );
        });
    });

    it('should validate value against min and max constraints and emit event when value is less than the min', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        element.min = 0;
        element.max = 10;
        element.value = 5;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const handler = jest.fn();
            element.addEventListener(VALIDITY_CHANGED_EVT, handler);

            // Test value below min
            element.value = -1;
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        isValid: false,
                        reason: ERROR_RANGE_UNDERFLOW,
                    }),
                })
            );
        });
    });

    it('should validate value against min and max constraints and emit event when value is greater than the max', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });

        document.body.appendChild(element);

        element.value = 5;
        element.min = 1;
        element.max = 10;

        return Promise.resolve().then(() => {
            const handler = jest.fn();
            element.addEventListener(VALIDITY_CHANGED_EVT, handler);

            // Test value above max
            element.value = 11;
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        isValid: false,
                        reason: ERROR_RANGE_OVERFLOW,
                    }),
                })
            );
        });
    });

    it('should validate value against min and max constraints and emit event when value is valid', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        element.min = 0;
        element.max = 10;
        element.value = -1;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const handler = jest.fn();
            element.addEventListener(VALIDITY_CHANGED_EVT, handler);

            // Test valid value
            element.value = 6;
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        isValid: true,
                    }),
                })
            );
        });
    });

    it('should handle custom validity', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        element.customValidity = 'Custom error message';
        element.min = 0;
        element.max = 10;
        element.value = 5;

        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            expect(element.customValidity).toBe('Custom error message');
        });
    });

    it('should handle custom validity when given undefined', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });

        document.body.appendChild(element);

        element.value = 5;
        element.customValidity = undefined;

        return Promise.resolve().then(() => {
            expect(element.customValidity).toBeUndefined();
        });
    });

    it('should handle input change event with a valid value', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const input = element.querySelector('input.number-input__input');
            const handler = jest.fn();
            element.addEventListener(VALUE_CHANGED_EVT, handler);

            // Test valid number input
            input.value = '20';
            input.dispatchEvent(new CustomEvent('change'));
            expect(handler).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        value: 2,
                        isValid: true,
                    }),
                })
            );
        });
    });

    it('should handle validity change event with an invalid value', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const input = element.querySelector('input.number-input__input');
            const handler = jest.fn();
            element.addEventListener(VALIDITY_CHANGED_EVT, handler);

            // Test invalid input
            input.value = 'abc';
            input.dispatchEvent(new CustomEvent('change'));
            expect(handler).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        isValid: false,
                        reason: PATTERN_MISMATCH,
                    }),
                })
            );
        });
    });

    it('should format value according to locale', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        element.value = 1234.56;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const input = element.querySelector('input.number-input__input');
            // The actual format will depend on the locale, but we can verify it's not the raw number
            expect(input.value).not.toBe('1234.56');
        });
    });

    it('should disable increment button when value is at max', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        element.max = 10;
        element.value = 10;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const incrementButton = element.querySelector('.number-input__increment-button');
            expect(incrementButton.disabled).toBeTruthy();
        });
    });

    it('should disable decrement button when value is at min', () => {
        const element = createElement('c-common-number-input', {
            is: CommonNumberInput,
        });
        element.min = 0;
        element.value = 0;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const decrementButton = element.querySelector('.number-input__decrement-button');
            expect(decrementButton.disabled).toBeTruthy();
        });
    });

    describe('max property setter', () => {
        it('should handle max set to number', () => {
            const element = createElement('c-common-number-input', {
                is: CommonNumberInput,
            });
            element.value = 5;
            document.body.appendChild(element);

            return Promise.resolve().then(() => {
                const handler = jest.fn();
                element.addEventListener(VALIDITY_CHANGED_EVT, handler);

                element.max = 10;
                element.value = 11;
                expect(element.max).toBe(10);
                expect(handler).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        detail: expect.objectContaining({
                            isValid: false,
                        }),
                    })
                );
            });
        });

        it('should handle max set to string', () => {
            const element = createElement('c-common-number-input', {
                is: CommonNumberInput,
            });
            element.value = 5;
            document.body.appendChild(element);

            return Promise.resolve().then(() => {
                const handler = jest.fn();
                element.addEventListener(VALIDITY_CHANGED_EVT, handler);

                element.max = '10';
                expect(element.max).toBe('10');

                element.value = 11;
                expect(handler).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        detail: expect.objectContaining({
                            isValid: false,
                        }),
                    })
                );
            });
        });

        it('should handle max set to 0', () => {
            const element = createElement('c-common-number-input', {
                is: CommonNumberInput,
            });
            element.value = -1;
            document.body.appendChild(element);

            return Promise.resolve().then(() => {
                const handler = jest.fn();
                element.addEventListener(VALIDITY_CHANGED_EVT, handler);

                element.max = 0;
                expect(element.max).toBe(0);

                element.value = 1;

                expect(handler).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        detail: expect.objectContaining({
                            isValid: false,
                        }),
                    })
                );
            });
        });

        it('should validate value when max is set after value', () => {
            const element = createElement('c-common-number-input', {
                is: CommonNumberInput,
            });
            element.value = 15;
            document.body.appendChild(element);

            return Promise.resolve().then(() => {
                const handler = jest.fn();
                element.addEventListener(VALIDITY_CHANGED_EVT, handler);

                element.max = 10;
                expect(handler).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: expect.objectContaining({
                            isValid: false,
                            reason: ERROR_RANGE_OVERFLOW,
                        }),
                    })
                );
            });
        });

        it('should not validate when max is set before value', () => {
            const element = createElement('c-common-number-input', {
                is: CommonNumberInput,
            });
            document.body.appendChild(element);

            return Promise.resolve().then(() => {
                const handler = jest.fn();
                element.addEventListener(VALIDITY_CHANGED_EVT, handler);

                element.max = 10;
                expect(handler).not.toHaveBeenCalled();
            });
        });

        it('should update hidden input min attribute when max is set', () => {
            const element = createElement('c-common-number-input', {
                is: CommonNumberInput,
            });
            element.value = 5;
            document.body.appendChild(element);

            return Promise.resolve().then(() => {
                const hiddenInput = element.querySelector('input.hidden-input');
                element.max = 10;
                expect(hiddenInput.max).toBe('10');
            });
        });
    });
});
