import { generateAlignmentClass } from '../buttonStyleUtils';

describe('generateAlignmentClass', () => {
    it.each`
        alignment    | expected
        ${''}        | ${''}
        ${null}      | ${''}
        ${undefined} | ${''}
        ${'left'}    | ${''}
        ${'center'}  | ${'slds-grid_align-center'}
        ${'right'}   | ${'slds-grid_align-end'}
    `('returns class corresponding to button alignment class $alignment', ({ alignment, expected }) => {
        expect(generateAlignmentClass(alignment)).toBe(expected);
    });
});
