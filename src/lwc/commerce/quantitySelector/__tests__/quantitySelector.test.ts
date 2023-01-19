import { createElement } from 'lwc';
import QuantitySelector from '../quantitySelector';
import type NumberInput from 'commerce/numberInput';
import type QuantitySelectorPopover from 'commerce/quantitySelectorPopover';
import { errorLabels } from '../constants';
import { ERROR_RANGE_UNDERFLOW, VALUE_CHANGED_EVT } from 'commerce/numberInput';
import type { ChangeEventDetail } from 'commerce/numberInput';

jest.mock('../labels', () => ({
    rangeOverflow: 'Enter a value between {min} and {max} in increments of {step}.',
    rangeUnderflow: 'Enter a value between {min} and {max} in increments of {step}.',
    stepMismatch: 'Enter a value between {min} and {max} in increments of {step}.',
}));

function defer(): Promise<void> {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    return new Promise((resolve) => setTimeout(resolve));
}

describe('commerce/quantitySelector', () => {
    let element: HTMLElement & QuantitySelector;

    beforeEach(() => {
        element = createElement('commerce-quantity-selector', {
            is: QuantitySelector,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('a11y', () => {
        it('should be accessible by default', async () => {
            await expect(element).toBeAccessible();
        });

        it('should be accessible when popover is shown', async () => {
            element.minimum = '2';
            element.minimumValueGuideText = 'The min is {0}';

            await Promise.resolve();
            await expect(element).toBeAccessible();
        });
    });

    describe.each`
        property                   | defaultValue | changeValue
        ${'minimum'}               | ${undefined} | ${'3'}
        ${'maximum'}               | ${undefined} | ${'500'}
        ${'step'}                  | ${undefined} | ${'0.25'}
        ${'hideLabel'}             | ${false}     | ${true}
        ${'hideButtons'}           | ${false}     | ${true}
        ${'disabled'}              | ${false}     | ${true}
        ${'label'}                 | ${undefined} | ${'Quantity'}
        ${'minimumValueGuideText'} | ${undefined} | ${'Value too small'}
        ${'maximumValueGuideText'} | ${undefined} | ${'Value exceeded max'}
        ${'stepValueGuideText'}    | ${undefined} | ${'Step size not correct'}
        ${'quantity'}              | ${undefined} | ${'10'}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(Reflect.get(element, property)).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            Reflect.set(element, property, changeValue);
            expect(Reflect.get(element, property)).toBe(changeValue);
        });
    });

    describe('quantity popover', () => {
        let quantityPopover: HTMLElement & QuantitySelectorPopover;
        beforeEach(() => {
            quantityPopover = <HTMLElement & QuantitySelectorPopover>(
                element.querySelector('commerce-quantity-selector-popover')
            );
        });
        it('should not show the popover when no rules exist', () => {
            expect(quantityPopover).toBeNull();
        });
        it('should hand over text for the rules min', async () => {
            element.minimum = '1';
            element.minimumValueGuideText = 'Min is {0}';
            await Promise.resolve();
            quantityPopover = <HTMLElement & QuantitySelectorPopover>(
                element.querySelector('commerce-quantity-selector-popover')
            );
            expect(quantityPopover).not.toBeNull();
            expect(quantityPopover.minimumText).toBe('Min is 1');
        });
        it('should hand over text for the rules max', async () => {
            element.maximum = '1';
            element.maximumValueGuideText = 'Max is {0}';
            await Promise.resolve();
            quantityPopover = <HTMLElement & QuantitySelectorPopover>(
                element.querySelector('commerce-quantity-selector-popover')
            );
            expect(quantityPopover).not.toBeNull();
            expect(quantityPopover.maximumText).toBe('Max is 1');
        });
        it('should hand over text for the rule step', async () => {
            element.step = '1';
            element.stepValueGuideText = 'Step is {0}';
            /**
             * No idea why this is needed but something weird happens with the popover component
             * in combination with the stepText property. Updating the value in the template
             * does not update the value in the component (only in the test setup!) while it's working
             * for other properties like maximumText and minimumText.
             */
            await defer();
            quantityPopover = <HTMLElement & QuantitySelectorPopover>(
                element.querySelector('commerce-quantity-selector-popover')
            );
            expect(quantityPopover).not.toBeNull();
            expect(quantityPopover.incrementText).toBe('Step is 1');
        });
    });

    describe('Errors', () => {
        beforeEach(async () => {
            await Promise.resolve();
        });
        it('should not show an error initially but reserve space for notifications', () => {
            const error = <HTMLElement>element.querySelector('p');
            expect(error.textContent).toEqual(Object.values(errorLabels)[1]);
            expect(error.getAttribute('class')).toContain(
                'slds-p-top_x-small slds-text-align_left slds-m-right_small slds-hide'
            );
        });
        it('should show an error for values out of range', async () => {
            const numberInput = <HTMLElement & NumberInput>element.querySelector('commerce-number-input');
            const detail: ChangeEventDetail = {
                lastValue: 0.5,
                isValid: false,
                reason: ERROR_RANGE_UNDERFLOW,
                value: 1.0,
            };
            numberInput.dispatchEvent(
                new CustomEvent(VALUE_CHANGED_EVT, {
                    detail,
                })
            );
            await Promise.resolve();
            const error = <HTMLElement>element.querySelector('p');
            expect(error.textContent).toContain('Enter a value between 1 and 9007199254740991 in increments of 1.');
        });
    });

    describe('when supplying the quantity', () => {
        it('should use the quantity provided', async () => {
            element.value = 55;

            await Promise.resolve();

            const input = element.querySelector('commerce-number-input') as NumberInput & HTMLElement;

            expect(input.value).toBe(55);
        });
    });
});
