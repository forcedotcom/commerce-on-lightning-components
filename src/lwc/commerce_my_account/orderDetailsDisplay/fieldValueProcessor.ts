import type { AddressField, GeolocationField } from 'commerce_my_account/orderDetails';
import type { EntityField } from 'commerce/orderApiInternal';

/**
 * @description Helper method to process and fetch an address field value
 */
function addressValueProcessor(addressText: string): AddressField {
    const addressValue: AddressField = {
        city: '',
        country: '',
        postalcode: '',
        state: '',
        street: '',
    };

    const addressString = addressText.match(/\[(.*?)\]/);
    const address = addressString ? addressString[1].split(',') : null;
    if (address) {
        [addressValue.street, addressValue.city, addressValue.state, addressValue.country, addressValue.postalcode] =
            address;
    }
    return addressValue;
}
/**
 * @description Helper method to process and fetch a geolocation field value
 */
function geolocationValueProcessor(geolocationText: string): GeolocationField {
    const geolocationValue: GeolocationField = {
        latitude: '',
        longitude: '',
    };

    const geolocationString = geolocationText.match(/\[(.*?)\]/);
    const geolocation = geolocationString ? geolocationString[1].split(' ') : null;
    if (geolocation) {
        [geolocationValue.latitude, geolocationValue.longitude] = geolocation;
    }
    return geolocationValue;
}

/**
 * @description Helper method to fetch the field value according to the field type
 */
export default function fieldValueProcessor(field: EntityField, type: string): string | object | null {
    if (field.text && type === 'address') {
        return addressValueProcessor(field.text);
    }
    if (field.text && type === 'geolocation') {
        return geolocationValueProcessor(field.text);
    }
    return field.text;
}
