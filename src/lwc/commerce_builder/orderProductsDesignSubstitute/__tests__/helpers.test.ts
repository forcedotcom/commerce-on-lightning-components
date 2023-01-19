import { getFieldsIfDefined } from '../helpers';

const fieldsMapping = [
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
    {
        entity: 'OrderDeliveryGroupSummary',
        name: 'SomeRandomField',
        label: 'Pretax Total',
        type: 'Currency(16, 2)',
    },
];

const fieldsData = [
    {
        dataName: 'Name',
        label: 'Name',
        text: 'USPS',
        type: 'string',
    },
    {
        dataName: 'TotalAmount',
        label: 'Pretax Total',
        text: '20.0',
        type: 'currency',
    },
    {
        dataName: 'SomeOtherField',
        label: 'Some Other Field',
        text: '20.0',
        type: 'currency',
    },
];

describe('getFieldsIfDefined', () => {
    it('returns the list of fields that are defined in the field mapping', () => {
        const expected = [
            {
                dataName: 'Name',
                label: 'Name',
                text: 'USPS',
                type: 'string',
            },
            {
                dataName: 'TotalAmount',
                label: 'Pretax Total',
                text: '20.0',
                type: 'currency',
            },
        ];
        const actual = getFieldsIfDefined(fieldsMapping, fieldsData);
        expect(expected).toEqual(actual);
    });

    it('return empty list if the fieldsData is empty', () => {
        const actual = getFieldsIfDefined(fieldsMapping, undefined);
        expect(actual).toEqual([]);
    });
});
