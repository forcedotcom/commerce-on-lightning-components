import { getValueOfNameFieldForEntity } from '../entityFieldValueGenerator';
import { mockRecord } from './data/record';

const orderNumberField = {
    objectApiName: 'OrderSummary',
    fieldApiName: 'OrderNumber',
};

jest.mock('lightning/uiRecordApi', () => ({
    // Set a default mock implementation for this method.
    getFieldValue: jest.fn().mockImplementation((data, field) => {
        return data.fields[field.fieldApiName].value;
    }),
}));

describe('RecordFieldValue: Entity Field Value Generator', () => {
    it('returns the value of the field from the record', () => {
        const orderNumber = getValueOfNameFieldForEntity(orderNumberField, '1Osxx0000000001CAA', mockRecord);
        expect(orderNumber).toBe(12345);
    });

    [null, undefined].forEach((field) => {
        it(`returns the Id of the record if the field is ${field}`, () => {
            const fieldValue = getValueOfNameFieldForEntity(field, '1Osxx0000000001CAA', mockRecord);
            expect(fieldValue).toBe('1Osxx0000000001CAA');
        });
    });
});
