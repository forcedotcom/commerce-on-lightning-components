import getFieldTypeAndValue from '../fieldTypeAndValueGenerator';
import { detailsData } from './data/detailsData';
import { orderSummaryFields } from './data/orderSummaryFields';

const geolocationVal = { latitude: '77.4235', longitude: '41.9000' };

describe('commerce_my_account-order-details-display: Fields Type and Value Generator', () => {
    it('returns the datetime field type and value for the datetime field', () => {
        const [fieldVal, fieldType] = getFieldTypeAndValue(detailsData, orderSummaryFields[0]);
        expect(fieldVal).toBe('2022-06-23T16:16:23.000Z');
        expect(fieldType).toBe('datetime');
    });

    it('returns the geolocation field type and value for the geolocation field', () => {
        const [fieldVal, fieldType] = getFieldTypeAndValue(detailsData, orderSummaryFields[3]);
        expect(fieldVal).toEqual(geolocationVal);
        expect(fieldType).toBe('geolocation');
    });
});
