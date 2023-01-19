import getFieldNameFromEntity from '../fieldNameGenerator';

describe('commerce_my_account/orderLineItemFields: Entity Field Name Generator', () => {
    ['005000000001CAA', '005xx0000000001CAA'].forEach((orderId) => {
        it(`returns the details of the field for the order if the orderId is ${orderId}`, () => {
            const fieldValue = getFieldNameFromEntity(orderId);
            expect(fieldValue).toBeTruthy();
        });
    });

    ['', null, undefined, '123456', '00Axx0000000001CAA'].forEach((orderId) => {
        it(`returns undefined if the orderId is ${orderId}`, () => {
            const fieldValue = getFieldNameFromEntity(orderId);
            expect(fieldValue).toBeUndefined();
        });
    });
});
