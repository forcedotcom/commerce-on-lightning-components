import LOCALE from '@salesforce/i18n/locale';
import { addressFormat } from 'lightning/internalLocalizationService';

/*
 * Formats the address fields into a string to display as the orderDeliveryGroup title
 */
export function formatAddress(rawAddressValue: string): string {
    const addressString = rawAddressValue.replace(/]/gi, '');
    const addressValue = addressString.split('[').pop()?.split(',');
    let formattedAddress = ' ';
    if (addressValue) {
        const [address, city, state, country, zipCode] = addressValue;
        const [langCode, countryCode] = LOCALE.split('-');
        formattedAddress = addressFormat.formatAddressAllFields(
            langCode,
            countryCode,
            { address, city, state, country, zipCode },
            ', '
        );
    }
    return formattedAddress;
}
