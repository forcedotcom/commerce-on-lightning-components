import fieldValueProcessor from '../fieldValueProcessor';

const addressField = {
    label: 'Billing Address',
    text: 'API address [ 415 Mission Street (Shipping), San Francisco, CA, 94105, US, null, null, null, null]',
    type: 'address',
};

const addressFieldWithInvalidText = {
    label: 'Billing Address',
    text: 'API address',
    type: 'address',
};

const geolocationField = {
    label: 'Custom Geo',
    text: 'API geolocation [77.4235 41.9000]',
    type: 'geolocation',
};

const geolocationFieldWithInvalidText = {
    label: 'Custom Geo',
    text: 'API geolocation',
    type: 'geolocation',
};

const addressValue = {
    city: ' San Francisco',
    country: ' 94105',
    postalcode: ' US',
    state: ' CA',
    street: ' 415 Mission Street (Shipping)',
};

const geolocationValue = {
    latitude: '77.4235',
    longitude: '41.9000',
};

describe('commerce_my_account-order-details-display: Fields Value Processor', () => {
    [
        {
            label: 'Account ID',
            text: '001xx000003GZeFAAW',
            type: 'reference',
        },
        {
            label: 'Ordered Date',
            text: '2022-06-23T16:16:23.000Z',
            type: 'datetime',
        },
        {
            label: 'Owner ID',
            text: '005xx000001XBSrAAO',
            type: 'reference',
        },
    ].forEach((field) => {
        it(`returns the field value according to the field type`, () => {
            const fieldValue = fieldValueProcessor(field, field.type);
            expect(fieldValue).toEqual(field.text);
        });
    });

    it('returns the address field value for the billing address field type', () => {
        const fieldValue = fieldValueProcessor(addressField, addressField.type);
        expect(fieldValue).toEqual(addressValue);
    });
    it('returns the geolocation field value for the geolocation field type', () => {
        const fieldValue = fieldValueProcessor(geolocationField, geolocationField.type);
        expect(fieldValue).toEqual(geolocationValue);
    });

    it('returns the address field value in the condition where address field text is invalid', () => {
        const fieldValue = fieldValueProcessor(addressFieldWithInvalidText, addressFieldWithInvalidText.type);
        expect(fieldValue).toEqual({
            city: '',
            country: '',
            postalcode: '',
            state: '',
            street: '',
        });
    });

    it('returns the geolocation field value in the condition where geolocation field text is invalid', () => {
        const fieldValue = fieldValueProcessor(geolocationFieldWithInvalidText, geolocationFieldWithInvalidText.type);
        expect(fieldValue).toEqual({
            latitude: '',
            longitude: '',
        });
    });
});
