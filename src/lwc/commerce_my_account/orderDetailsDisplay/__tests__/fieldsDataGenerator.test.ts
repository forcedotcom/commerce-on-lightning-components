import getFieldsData from '../fieldsDataGenerator';
import { detailsData } from './data/detailsData';
import { orderSummaryFields } from './data/orderSummaryFields';
import { FieldsData } from './data/fieldsData';

//Mock the labels with known values.
jest.mock('../labels', () => ({
    keyValueSeparatorWithSpace: ': ',
}));

describe('commerce_my_account-order-details-display: Fields Data Generator', () => {
    it('returns the field data for the corresponding order summary fields', () => {
        const fieldsData = getFieldsData(detailsData, orderSummaryFields);
        expect(fieldsData).toEqual(FieldsData);
    });
});
