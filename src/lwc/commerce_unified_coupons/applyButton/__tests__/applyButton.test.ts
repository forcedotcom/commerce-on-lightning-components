import { createElement } from 'lwc';
import ApplyButton from '../applyButton';

describe('commerce_unified_coupons/applyButton: Apply Button', () => {
    let element: ApplyButton & HTMLElement;

    type applyButton = 'disabled' | 'text';

    beforeEach(() => {
        element = createElement('commerce_unified_coupons-apply-button', {
            is: ApplyButton,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe.each`
        property      | defaultValue | changeValue
        ${'disabled'} | ${false}     | ${true}
        ${'text'}     | ${undefined} | ${''}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(element[<applyButton>property]).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            expect(element[<applyButton>property]).not.toBe(changeValue);
            // eslint-disable-next-line
            (element as any)[<applyButton>property] = changeValue;
            expect(element[<applyButton>property]).toBe(changeValue);
        });
    });

    it('should be accessible', () => {
        element.text = 'Apply';

        return Promise.resolve().then(async () => {
            await expect(element).toBeAccessible();
        });
    });
});
