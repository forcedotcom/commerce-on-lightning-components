import { createElement } from 'lwc';
import type { ChangeEventDetail, ErrorState } from '../numberInput';
import NumberInput, {
    STEP_MISMATCH,
    ERROR_RANGE_OVERFLOW,
    ERROR_RANGE_UNDERFLOW,
    VALUE_CHANGED_EVT,
} from '../numberInput';
import { stringOnlyHasNumbers } from '../utils';
import type { InputEventWithTarget } from '../types';

jest.mock('../utils', () => {
    const originalModule = jest.requireActual('../utils');

    // Mock only stringOnlyHasNumbers
    return Object.assign({}, originalModule, {
        __esModule: true,
        stringOnlyHasNumbers: jest.fn(),
    });
});

async function dispatchChangeEvent(input: HTMLInputElement | null, value: string): Promise<void> {
    if (input) {
        input.value = value;

        input.dispatchEvent(
            new CustomEvent('change', {
                bubbles: true,
                cancelable: true,
            })
        );
    } else {
        throw Error('No input field found');
    }

    return Promise.resolve();
}

const safeQuerySelector = (el: HTMLElement, selector: string): Element => {
    const found = el.querySelector(selector);
    if (found === null) {
        throw Error(`No element found using: ${selector}.`);
    }

    return found;
};

const ADD_SELECTOR = '.number-input__increment-button';
const SUBTRACT_SELECTOR = '.number-input__decrement-button';

describe('commerce/numberInput', () => {
    let numberInputComponent: NumberInput & HTMLElement;

    beforeEach(async () => {
        jest.restoreAllMocks();
        numberInputComponent = createElement('commerce-number-input', {
            is: NumberInput,
        });
        document.body.appendChild(numberInputComponent);

        /*
         There is only one test that needs this mock and the rest is fine. If you
          need different behavior for this function,
          change it at the single test level.
        */
        (<jest.Mock<boolean>>stringOnlyHasNumbers).mockReturnValue(true);

        await Promise.resolve();
    });

    afterEach(() => {
        document.body.removeChild(numberInputComponent);
    });

    describe('a11y', () => {
        it('should be accessible without setting properties', async () => {
            await expect(numberInputComponent).toBeAccessible();
        });
        it('should be accessible with buttons disabled', async () => {
            numberInputComponent.hideButtons = true;
            await Promise.resolve();
            await expect(numberInputComponent).toBeAccessible();
        });
        it('should be accessible with hidden label', async () => {
            numberInputComponent.hideLabel = true;
            await Promise.resolve();
            await expect(numberInputComponent).toBeAccessible();
        });
    });

    describe('buttons', () => {
        let subtractButton: HTMLButtonElement;
        let addButton: HTMLButtonElement;
        let handler: jest.Mock;

        beforeEach(async () => {
            subtractButton = safeQuerySelector(numberInputComponent, SUBTRACT_SELECTOR) as HTMLButtonElement;
            addButton = safeQuerySelector(numberInputComponent, ADD_SELECTOR) as HTMLButtonElement;
            handler = jest.fn();

            numberInputComponent.addEventListener(VALUE_CHANGED_EVT, handler as EventListener);
            numberInputComponent.max = Number.POSITIVE_INFINITY;
            numberInputComponent.min = 0;

            const inputElement = safeQuerySelector(numberInputComponent, 'input') as HTMLInputElement;
            await dispatchChangeEvent(inputElement, '10');
            handler.mockReset();
        });

        it('should send a change event when a button is pressed', () => {
            const buttons: HTMLButtonElement[] = [subtractButton, addButton];

            for (const b of buttons) {
                expect(b.disabled).toBe(false);
                b.click();
            }

            expect(handler).toHaveBeenCalledTimes(2);
        });

        it('should disable the buttons if the component is disabled', async () => {
            expect(addButton.disabled).toBe(false);
            expect(subtractButton.disabled).toBe(false);

            numberInputComponent.disabled = true;

            await Promise.resolve();

            expect(addButton.disabled).toBe(true);
            expect(subtractButton.disabled).toBe(true);
        });

        const suites = [
            { initial: 51, presses: 50, stepsize: 1 },
            { initial: 50, presses: 10, stepsize: 0.1 },
            { initial: 50, presses: 100, stepsize: 0.01 },
            { initial: 50, presses: 100, stepsize: 0.01 },
            { initial: 50, presses: 100, stepsize: 0.001 },
            { initial: 50, presses: 100, stepsize: 0.0001 },
            { initial: 50, presses: 100, stepsize: 0.00001 },
        ];

        for (const { initial, presses, stepsize } of suites) {
            // eslint-disable-next-line no-loop-func
            it(`should send the old value + ${stepsize} on add without precision errors`, async () => {
                let detail: Partial<ChangeEventDetail> = {};
                handler.mockImplementation(({ detail: d }) => {
                    detail = d;
                });

                numberInputComponent.value = initial;
                numberInputComponent.step = stepsize;

                await Promise.resolve();

                let p = presses;
                while (p > 0) {
                    addButton.click();
                    p = p - 1;
                }

                expect(detail.lastValue).toBe(initial + stepsize * (presses - 1));
                expect(detail.value).toBe(initial + stepsize * presses);
            });

            // eslint-disable-next-line no-loop-func
            it(`should send the old value - ${stepsize} on subtract without precision errors`, async () => {
                let detail: Partial<ChangeEventDetail> = {};
                handler.mockImplementation(({ detail: d }) => {
                    detail = d;
                });

                numberInputComponent.value = initial;
                numberInputComponent.step = stepsize;

                await Promise.resolve();

                let p = presses;
                while (p > 0) {
                    subtractButton.click();
                    p = p - 1;
                }

                expect(detail.lastValue).toBe(initial - stepsize * (presses - 1));
                expect(detail.value).toBe(initial - stepsize * presses);
            });
        }
    });

    describe('input field', () => {
        let inputElement: HTMLInputElement;
        let handler: jest.Mock;

        beforeEach(() => {
            inputElement = safeQuerySelector(numberInputComponent, 'input') as HTMLInputElement;
            handler = jest.fn();

            numberInputComponent.addEventListener(VALUE_CHANGED_EVT, handler as EventListener);
            numberInputComponent.max = Number.POSITIVE_INFINITY;
            numberInputComponent.min = 0;
        });

        it('should send an event if a value is entered into the inputField field', async () => {
            inputElement.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    cancelable: true,
                })
            );

            await Promise.resolve();

            expect(handler).toHaveBeenCalled();
        });

        it('should send that value is invalid if the entered value exceeds the maximum even if explicit max is not set', async () => {
            let detail: Partial<ChangeEventDetail> = {};
            handler.mockImplementation(({ detail: d }) => {
                detail = d;
            });

            numberInputComponent.max = undefined;
            numberInputComponent.value = 0;

            // Waiting here is necessary so that LWC can pass the max to the child input field.
            await Promise.resolve();

            await dispatchChangeEvent(inputElement, (Number.MAX_SAFE_INTEGER + 1).toString());

            expect(detail.isValid).toBe(false);
            expect(detail.reason).toBe(ERROR_RANGE_OVERFLOW);
        });

        it('should send that value is invalid if the entered value violates the minimum', async () => {
            let detail: Partial<ChangeEventDetail> = {};
            handler.mockImplementation(({ detail: d }) => {
                detail = d;
            });

            numberInputComponent.min = 0;
            numberInputComponent.value = 0;

            // Waiting here is necessary so that LWC can pass the max to the child input field.
            await Promise.resolve();

            await dispatchChangeEvent(inputElement, '-10');

            expect(detail.isValid).toBe(false);
            expect(detail.reason).toBe(ERROR_RANGE_UNDERFLOW);
        });

        const suites = [
            { initial: 51, value: '50', stepsize: 1 },
            { initial: 51, value: '50.1', stepsize: 0.1 },
            { initial: 51, value: '50.01', stepsize: 0.01 },
            { initial: 51, value: '50.001', stepsize: 0.001 },
        ];

        for (const { initial, value, stepsize } of suites) {
            // eslint-disable-next-line no-loop-func
            it(`should send ${value} when the input changes without precision errors`, async () => {
                let detail: Partial<ChangeEventDetail> = {};
                handler.mockImplementation(({ detail: d }) => {
                    detail = d;
                });

                numberInputComponent.value = initial;

                numberInputComponent.step = stepsize;

                await dispatchChangeEvent(inputElement as HTMLInputElement, value);

                await Promise.resolve();

                expect(detail.lastValue).toBe(initial);
                expect(detail.value).toBe(parseFloat(value));
            });
        }
    });

    describe('validation', () => {
        it('should disable the buttons if the next value would violate one of the limits', async () => {
            const addButton: HTMLButtonElement = safeQuerySelector(
                numberInputComponent,
                ADD_SELECTOR
            ) as HTMLButtonElement;
            const subtractButton: HTMLButtonElement | null = safeQuerySelector(
                numberInputComponent,
                SUBTRACT_SELECTOR
            ) as HTMLButtonElement;

            numberInputComponent.max = 6;
            numberInputComponent.min = 4;
            numberInputComponent.value = 5;

            await Promise.resolve();

            expect(addButton.disabled).toBe(false);
            expect(subtractButton.disabled).toBe(false);

            await Promise.resolve();

            expect(addButton.disabled).toBe(false);
            expect(subtractButton.disabled).toBe(false);

            numberInputComponent.value = 6;

            await Promise.resolve();
            expect(addButton.disabled).toBe(true);

            numberInputComponent.value = 4;

            await Promise.resolve();

            expect(addButton.disabled).toBe(false);
            expect(subtractButton.disabled).toBe(true);
        });

        it('should count through all the values without issue if everything is okay', async () => {
            const addButton: HTMLButtonElement = safeQuerySelector(
                numberInputComponent,
                ADD_SELECTOR
            ) as HTMLButtonElement;

            numberInputComponent.step = 0.5;
            numberInputComponent.max = 5;
            numberInputComponent.value = 0;

            await Promise.resolve();

            numberInputComponent.addEventListener(VALUE_CHANGED_EVT, (event) => {
                const detail: ChangeEventDetail = (event as CustomEvent).detail;
                if (!detail.isValid) {
                    throw new Error(
                        `All values should be valid! Received invalid for ${detail.value} with cause ${detail.reason}.`
                    );
                }
            });

            let counter = numberInputComponent.max;

            while (counter && numberInputComponent.value <= numberInputComponent.max) {
                const previous = numberInputComponent.value;
                addButton.click();
                expect(numberInputComponent.value).toBe(previous + numberInputComponent.step);
                counter = counter - numberInputComponent.step;
            }
        });

        it('should send the right value changes in the corresponding event', async () => {
            let enteredValue = 0;
            let isValid = true;
            let reason: ErrorState | null = null;
            let lastValue: number | undefined;
            const handler: jest.Mock<void> = jest.fn((event: InputEventWithTarget) => {
                const detail: ChangeEventDetail = event?.detail;
                enteredValue = detail.value;
                isValid = detail.isValid;
                reason = detail.reason;
                lastValue = detail.lastValue;
            });
            numberInputComponent.addEventListener(VALUE_CHANGED_EVT, handler as EventListener);

            numberInputComponent.max = 10;
            numberInputComponent.min = 0;
            numberInputComponent.step = 1;

            await Promise.resolve();

            const input: HTMLInputElement = safeQuerySelector(numberInputComponent, 'input') as HTMLInputElement;
            await dispatchChangeEvent(input, '11');

            expect(enteredValue).toBe(11);
            expect(isValid).toBe(false);
            expect(reason).toBe(ERROR_RANGE_OVERFLOW);

            await dispatchChangeEvent(input, '-1');

            expect(enteredValue).toBe(-1);
            expect(isValid).toBe(false);
            expect(reason).toBe(ERROR_RANGE_UNDERFLOW);
            expect(lastValue).toBe(11);

            await dispatchChangeEvent(input, '5.5');

            expect(enteredValue).toBe(5.5);
            expect(isValid).toBe(false);
            expect(reason).toBe(STEP_MISMATCH);
            expect(lastValue).toBe(-1);
        });

        it('should use the last value if a non-numeric string is entered', async () => {
            const inputElement: HTMLInputElement = safeQuerySelector(numberInputComponent, 'input') as HTMLInputElement;
            const initialValue = '55';

            numberInputComponent.max = 1000;

            await dispatchChangeEvent(inputElement, initialValue);

            await Promise.resolve();

            expect(inputElement.value).toBe(initialValue);
            expect(numberInputComponent.value).toBe(parseFloat(initialValue));

            (<jest.Mock<boolean>>stringOnlyHasNumbers).mockReturnValue(false);
            /*
             In JSDOM this doesn't actually hit the event handler, but it might. So, we'll act like the function that the
             function which checks if the input.value is a string of only numbers returns false.
            */
            await dispatchChangeEvent(inputElement, '15! Not good!');

            await Promise.resolve();

            expect(inputElement.value).toBe(initialValue);
            expect(numberInputComponent.value).toBe(parseFloat(initialValue));

            await dispatchChangeEvent(inputElement, 'Not good!');

            await Promise.resolve();

            expect(inputElement.value).toBe(initialValue);
            expect(numberInputComponent.value).toBe(parseFloat(initialValue));

            await dispatchChangeEvent(inputElement, '');

            await Promise.resolve();

            expect(inputElement.value).toBe(initialValue);
            expect(numberInputComponent.value).toBe(parseFloat(initialValue));
        });

        it('should add an error class if necessary and remove it if the value is valid again', async () => {
            const testValue = '1.23';

            numberInputComponent.step = 1;

            const input: HTMLInputElement = safeQuerySelector(numberInputComponent, 'input') as HTMLInputElement;

            await dispatchChangeEvent(input, testValue);

            await Promise.resolve();

            const span = safeQuerySelector(numberInputComponent, 'span');

            expect(span).not.toBeNull();
            expect(span.classList).toContain('error');

            await dispatchChangeEvent(input, '1');

            await Promise.resolve();

            expect(span.classList).not.toContain('error');
        });

        it('should not show/send a validation error just because the previous value was invalid', async () => {
            const addButton = safeQuerySelector(numberInputComponent, ADD_SELECTOR) as HTMLButtonElement;
            const handler = jest.fn();
            const testValue = '1.0';

            numberInputComponent.addEventListener(VALUE_CHANGED_EVT, handler as EventListener);
            let detail: Partial<ChangeEventDetail> = {};
            handler.mockImplementation(({ detail: d }) => {
                detail = d;
            });

            numberInputComponent.min = 0;
            numberInputComponent.step = 2;

            const input: HTMLInputElement = safeQuerySelector(numberInputComponent, 'input') as HTMLInputElement;

            await dispatchChangeEvent(input, testValue);

            await Promise.resolve();

            addButton.click();

            expect(detail.reason).toBeNull();
            expect(numberInputComponent.querySelector('span.error')).toBeNull();
        });

        it('should handle invalid value inputs and show an error', async () => {
            await Promise.resolve();
            numberInputComponent.step = 1;
            numberInputComponent.value = 0.5;

            await Promise.resolve();

            const input = <HTMLInputElement>numberInputComponent.querySelector('input');
            expect(input.value).toBe('0.5');

            const span = safeQuerySelector(numberInputComponent, 'span');
            expect(span).not.toBeNull();
            expect(span.classList).toContain('error');
        });

        it('should not add error class when initial value is allowed', async () => {
            await Promise.resolve();
            numberInputComponent.step = 1;
            numberInputComponent.value = 1;

            await Promise.resolve();

            const input = <HTMLInputElement>numberInputComponent.querySelector('input');
            expect(input.value).toBe('1');

            const span = safeQuerySelector(numberInputComponent, 'span');
            expect(span).not.toBeNull();
            expect(span.classList).not.toContain('error');
        });
    });
});
