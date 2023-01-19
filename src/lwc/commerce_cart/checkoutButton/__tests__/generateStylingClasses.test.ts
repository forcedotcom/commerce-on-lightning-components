import { generateStyleClass } from '../generateStylingClasses';

describe('../checkoutButtonClassGenerator', () => {
    describe('generateStyleClass', () => {
        it.each`
            style          | expected
            ${''}          | ${'slds_button-tertiary'}
            ${null}        | ${'slds_button-tertiary'}
            ${undefined}   | ${'slds_button-tertiary'}
            ${'primary'}   | ${'slds-button_brand'}
            ${'secondary'} | ${'slds-button_outline-brand'}
            ${'tertiary'}  | ${'slds_button-tertiary'}
        `('returns class corresponding to button style $style', ({ style, expected }) => {
            expect(generateStyleClass(style)).toBe(expected);
        });
    });
});
