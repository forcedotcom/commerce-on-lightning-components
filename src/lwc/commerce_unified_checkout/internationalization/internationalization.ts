import countryLabels from './countryLabels';
import { getStates } from './countryStateList';
import countryStateLabels from './countryStateLabels';
import type { LabelValuePair } from 'types/common';
import locale from '@salesforce/i18n/locale';

/**
 * Gets the ship-to countries' labels and values
 *
 * @param countryList an array of country codes
 * @returns {LabelValuePair[]} the ship-to countries with appropriate labels and values
 */
export function getShipToCountries(countryList: string[]): LabelValuePair[] {
    const shipToCountries = countryList.map((countryCode) => {
        return {
            label: countryLabels[countryCode],
            value: countryCode,
        };
    });

    return shipToCountries;
}

/**
 * Gets the all countries' labels and values
 *
 * @returns {LabelValuePair[]} all countries with appropriate labels and values
 */
export function getAllCountries(): LabelValuePair[] {
    const allCountries = Object.keys(countryLabels).map((countryCode) => {
        return {
            label: countryLabels[countryCode],
            value: countryCode,
        };
    });

    return allCountries;
}

/**
 * Gets the states/provinces for a given country
 *
 * @param countryCode country code for a single country
 * @returns {LabelValuePair[]} the states/provinces of a country with appropriate labels and values
 */
export function getCountryStates(countryCode: string): LabelValuePair[] {
    const statesCodeList = getStates(countryCode);
    const states = statesCodeList.map((stateCode) => {
        const codeForLabel = countryCode + '_' + stateCode;
        return {
            label: countryStateLabels[codeForLabel],
            value: stateCode,
        };
    });
    return states;
}

/**
 * Informs whether a country has the order where Last Name comes before First Name
 *
 * @param country country code for a single country
 * @returns {boolean} whether the country has Last Name before First Name
 */
export function isLastNameFirstCountry(country: string | undefined): boolean {
    /**
     * Countries with Last Name first display order:
     * China, Hungary, Japan, Republic of Korea, Macao, Malaysia, Singapore, Taiwan, Vietnam.
     */
    const lastNameFirstCountries = ['CN', 'HU', 'JP', 'KR', 'MO', 'MY', 'SG', 'TW', 'VN'];
    return country ? lastNameFirstCountries.includes(country) : false;
}

/**
 * Creates a custom locale primarily to override the site locale
 * for addresses in checkout where country for addresses could be
 * different from the site locale.
 *
 * @param country country code for a single country
 * @returns {string} concatenated language code and country code as custom locale
 */
export function getCustomLocale(country: string): string {
    const languageCode = locale.split('-')[0];
    return `${languageCode}-${country}`;
}

/**
 * Gets label for a single country code
 *
 * @param countryCode country code for a single country
 * @returns {string} label for the country code
 */
export function getCountryLabel(countryCode: string): string {
    return countryLabels[countryCode] || countryCode;
}
