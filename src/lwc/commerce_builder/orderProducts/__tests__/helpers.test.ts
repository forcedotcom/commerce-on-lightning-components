import { getEntityFieldNames } from '../helpers';
const fieldMapping = [
    {
        entity: 'OrderDeliveryMethod',
        name: 'Name',
        label: 'Name',
        type: 'Text(255)',
    },
    {
        entity: 'OrderDeliveryGroupSummary',
        name: 'TotalAmount',
        label: 'Pretax Total',
        type: 'Currency(16, 2)',
    },
];
describe('getEntityFieldNames', () => {
    it('returns the expected field value for the billing address field type', () => {
        const expectedResult = ['OrderDeliveryMethod.Name', 'OrderDeliveryGroupSummary.TotalAmount'];
        const result = getEntityFieldNames(fieldMapping);
        expect(result).toEqual(expectedResult);
    });
});
