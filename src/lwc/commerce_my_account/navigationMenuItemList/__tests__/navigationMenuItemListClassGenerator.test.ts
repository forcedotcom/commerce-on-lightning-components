import { generateVerticalPaddingClass } from '../navigationMenuItemListClassGenerator';

describe('validate vertical padding classes', () => {
    ['none', 'xxx-small', 'xx-small', 'x-small', 'xx-large', 'medium', 'large', 'x-large'].forEach((padding) => {
        it(`when padding is set to ${padding}`, () => {
            const verticalPaddingClass = generateVerticalPaddingClass(padding);
            expect(verticalPaddingClass).toBe(`slds-p-vertical_${padding}`);
        });
    });

    ['', 'invalid', 'small'].forEach((padding) => {
        it(`when padding is set to ${padding}`, () => {
            const verticalPaddingClass = generateVerticalPaddingClass(padding);
            expect(verticalPaddingClass).toBe('slds-p-vertical_small');
        });
    });
});
