import getFieldLabel from '../fieldLabelGenerator';

//Mock the labels with known values.
jest.mock('../labels', () => ({
    keyValueSeparatorWithSpace: ': ',
}));

describe('commerce_my_account-order-details-display: Field Label Generator', () => {
    it('returns the string with field label to the format template( {fieldLabel}: )', () => {
        const labelStr = getFieldLabel('Total');
        expect(labelStr).toBe('Total: ');
    });

    ['', null, undefined].forEach((fieldLabel) => {
        it(`returns the empty string if fieldLabel is ${fieldLabel}`, () => {
            const labelStr = getFieldLabel(fieldLabel);
            expect(labelStr).toBe('');
        });
    });
});
