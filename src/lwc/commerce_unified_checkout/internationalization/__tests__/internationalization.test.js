import {
    getShipToCountries,
    getAllCountries,
    getCountryStates,
    isLastNameFirstCountry,
    getCountryLabel,
    getCustomLocale,
} from 'commerce_unified_checkout/internationalization';

jest.mock(
    '@salesforce/i18n/locale',
    () => {
        return {
            default: 'en-US',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/AddressCountries.US',
    () => {
        return {
            default: 'United States',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/AddressCountries.CA',
    () => {
        return {
            default: 'Canada',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/AddressStates.AU_ACT',
    () => {
        return {
            default: 'Australian Capital Territory',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/AddressStates.AU_NSW',
    () => {
        return {
            default: 'New South Wales',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/AddressStates.AU_NT',
    () => {
        return {
            default: 'Northern Territory',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/AddressStates.AU_QLD',
    () => {
        return {
            default: 'Queensland',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/AddressStates.AU_SA',
    () => {
        return {
            default: 'South Australia',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/AddressStates.AU_TAS',
    () => {
        return {
            default: 'Tasmania',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/AddressStates.AU_VIC',
    () => {
        return {
            default: 'Victoria',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/AddressStates.AU_WA',
    () => {
        return {
            default: 'Western Australia',
        };
    },
    { virtual: true }
);

const mockCountryData = [
    {
        label: 'United States',
        value: 'US',
    },
    {
        label: 'Canada',
        value: 'CA',
    },
];

const mockStateData = [
    {
        label: 'Australian Capital Territory',
        value: 'ACT',
    },
    {
        label: 'New South Wales',
        value: 'NSW',
    },
    {
        label: 'Northern Territory',
        value: 'NT',
    },
    {
        label: 'Queensland',
        value: 'QLD',
    },
    {
        label: 'South Australia',
        value: 'SA',
    },
    {
        label: 'Tasmania',
        value: 'TAS',
    },
    {
        label: 'Victoria',
        value: 'VIC',
    },
    {
        label: 'Western Australia',
        value: 'WA',
    },
];

describe('Internationalization', () => {
    it('should get an array of all countries', () => {
        const allCountries = getAllCountries();
        expect(allCountries).toHaveLength(239);
    });
    it('should get an array of shipping countries with code and label', () => {
        const shipToCountries = getShipToCountries(['US', 'CA']);
        expect(shipToCountries).toEqual(mockCountryData);
    });
    it('should get a string label for a country code', () => {
        const countryLabel = getCountryLabel('CA');
        expect(countryLabel).toBe('Canada');
    });
    it('should just return the country code if no label found', () => {
        const countryLabel = getCountryLabel('ZZ');
        expect(countryLabel).toBe('ZZ');
    });
    it('should get array of states/provinces for countries that have states/provinces', () => {
        const countryStates = getCountryStates('AU');
        expect(countryStates).toEqual(mockStateData);
    });
    it('should return an empty array for country code with no state/province data', () => {
        const countryStates = getCountryStates('XY');
        expect(countryStates).toEqual([]);
    });
    it('should return an empty array if no list of shipping countries is passed in', () => {
        const shipToCountries = getShipToCountries([]);
        expect(shipToCountries).toEqual([]);
    });
    ['CN', 'HU', 'JP', 'KR', 'MO', 'MY', 'SG', 'TW', 'VN'].forEach((country) => {
        it(`should return true for "${country}", where last name comes before first name`, () => {
            const lastNameFirst = isLastNameFirstCountry(country);
            expect(lastNameFirst).toBe(true);
        });
    });
    it('should return false for a country where first name comes before last name', () => {
        const lastNameFirst = isLastNameFirstCountry('CA');
        expect(lastNameFirst).toBe(false);
    });
    it('should return a custom locale using country code and store locale', () => {
        const customLocale = getCustomLocale('CA');
        expect(customLocale).toBe('en-CA');
    });
});
