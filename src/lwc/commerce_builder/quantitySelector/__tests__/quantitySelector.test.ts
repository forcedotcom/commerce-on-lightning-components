import { createElement } from 'lwc';
import type { DataProviderActionEvent } from 'experience/dataProvider';
import QuantitySelector from '../quantitySelector';
import type NumberInput from 'commerce/numberInput';
import type { QuantityChangedActionPayload } from 'commerce_data_provider/shared';
import { ERROR_RANGE_UNDERFLOW, VALUE_CHANGED_EVT } from 'commerce/numberInput';

describe('commerce_builder/quantitySelector', () => {
    let element: HTMLElement & QuantitySelector;

    beforeEach(() => {
        element = createElement('commerce_builder-quantity-selector', {
            is: QuantitySelector,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
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
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(Reflect.get(element, property)).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            Reflect.set(element, property, changeValue);
            expect(Reflect.get(element, property)).toBe(changeValue);
        });
    });

    describe('DataProviderAction', () => {
        let dispatchSpy: jest.SpyInstance<boolean, Event[]>;
        let commerceQuantitySelector: HTMLElement & NumberInput;
        beforeEach(() => {
            dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            commerceQuantitySelector = <HTMLElement & NumberInput>element.querySelector('commerce-quantity-selector');
        });
        it('should dispatch data provider action event', async () => {
            const detail = {
                currentValue: 1.0,
                last: 0.5,
                isValid: false,
                reason: ERROR_RANGE_UNDERFLOW,
                entered: 1.0,
            };
            commerceQuantitySelector.dispatchEvent(
                new CustomEvent(VALUE_CHANGED_EVT, {
                    detail,
                })
            );
            await Promise.resolve();

            // Validate DataProviderActionEvent dispatched with appropriate payload
            expect(dispatchSpy).toHaveBeenCalledTimes(1);
            const eventDetail = (<DataProviderActionEvent<QuantityChangedActionPayload>>dispatchSpy.mock.calls[0][0])
                .detail;
            expect(eventDetail.payload).toEqual(detail);
        });
        it('should not dispatch data provider action event when event detail is not set', async () => {
            commerceQuantitySelector.dispatchEvent(new CustomEvent(VALUE_CHANGED_EVT, {}));
            await Promise.resolve();

            // Validate DataProviderActionEvent dispatched with appropriate payload
            expect(dispatchSpy).not.toHaveBeenCalled();
        });
    });
});
