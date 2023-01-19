import { transformFields } from '../transformField';
import type { Adjustment, Field } from 'commerce_my_account/itemFields';
import type { TransformedField } from '../types';
describe('commerce_my_account-item-fields/transformField', () => {
    const adjustments: Adjustment[] = [
        {
            id: 1,
            type: 'Promotion',
            name: '5% off on exercise equipments',
            discountAmount: '-100',
            currencyIsoCode: 'USD',
        },
        {
            id: 2,
            type: 'Others',
            name: '10$ off on exercise equipments',
            discountAmount: '-85',
            currencyIsoCode: 'USD',
        },
    ];

    const itemFieldWithTotalLineAdj: Field[] = [
        {
            label: 'TotalLineAdjustmentAmount',
            text: '100',
            type: 'CURRENCY',
            dataName: 'TotalLineAdjustmentAmount',
        },
    ];
    const itemField: Field[] = [
        {
            label: 'sku#',
            text: 'K002',
            type: 'STRING',
            dataName: 'ProductSKU',
        },
    ];
    const itemFieldWithGeolocation: Field[] = [
        {
            label: 'geolocation',
            text: `{
                "latitude": "23.45",
                "longitude": "34.67"
            }`,
            type: 'Geolocation',
            dataName: 'GEO',
        },
    ];
    const updatedField: TransformedField[] = [
        {
            assistiveText: 'K002',
            cssClass: '',
            dataName: 'ProductSKU',
            id: 0,
            label: 'sku#',
            showFieldName: true,
            showInfoIcon: false,
            text: 'K002',
            type: 'STRING',
        },
    ];

    const updatedFieldWithTotalLineAdj: TransformedField[] = [
        {
            assistiveText: '100',
            cssClass: 'adjustments-amount-text',
            dataName: 'TotalLineAdjustmentAmount',
            id: 0,
            label: 'TotalLineAdjustmentAmount',
            showFieldName: true,
            showInfoIcon: true,
            text: '100',
            type: 'CURRENCY',
        },
    ];

    it('returns updated field with show icon false and no adjustments amount related styling', () => {
        const result = transformFields(itemField, adjustments);
        expect(result).toStrictEqual(updatedField);
        expect(result[0].showInfoIcon).toBe(false);
    });
    it('returns updated field with show icon set to true and adjustments amount related styling', () => {
        const result = transformFields(itemFieldWithTotalLineAdj, adjustments);
        expect(result).toStrictEqual(updatedFieldWithTotalLineAdj);
        expect(result[0].showInfoIcon).toBe(true);
        expect(result[0].cssClass).toBe('adjustments-amount-text');
    });
    it('parses geo location data and sets the assistive text', () => {
        const result = transformFields(itemFieldWithGeolocation, adjustments);
        expect(result[0].assistiveText).toBe('23.45 34.67');
    });
    it('returns empty array when fields is undefined', () => {
        const result = transformFields(undefined, adjustments);
        expect(result).toStrictEqual([]);
    });
});
