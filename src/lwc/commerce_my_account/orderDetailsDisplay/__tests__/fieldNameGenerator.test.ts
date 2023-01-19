import getFieldNameFromRecord from '../fieldNameGenerator';

describe('commerce_my_account-order-details-display: Entity Field Name Generator', () => {
    ['005000000001CAA', '005xx0000000001CAA'].forEach((recordId) => {
        it(`returns the details of the field for the record if the recordId is ${recordId}`, () => {
            const fieldValue = getFieldNameFromRecord(recordId);
            expect(fieldValue).toBeTruthy();
        });
    });

    ['', null, undefined, '123456', '00Axx0000000001CAA'].forEach((recordId) => {
        it(`returns undefined if the recordId is ${recordId}`, () => {
            const fieldValue = getFieldNameFromRecord(recordId);
            expect(fieldValue).toBeUndefined();
        });
    });
});
