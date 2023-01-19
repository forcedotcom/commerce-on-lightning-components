import { generateFieldLabelText } from '../fieldLabelGenerator';

//Mock the labels with known values.
jest.mock('../labels', () => ({
    fieldLabel: '{fieldLabel}:',
}));

describe('b2b_buyer_orders-totals-with-fields: field label Generator', () => {
    it('returns the string with field label to the format template( {fieldLabel}: )', () => {
        const labelStr = generateFieldLabelText('Total');
        expect(labelStr).toBe('Total:');
    });

    ['', null, undefined].forEach((fieldLabel) => {
        it(`returns the empty string if fieldLabel is ${fieldLabel}`, () => {
            const labelStr = generateFieldLabelText(fieldLabel);
            expect(labelStr).toBe('');
        });
    });
});
