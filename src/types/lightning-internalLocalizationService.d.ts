declare function formatAddressAllFields(
    langCode: string,
    countryCode: string,
    values: {
        address: string  | undefined,
        country: string  | undefined,
        city: string  | undefined,
        state: string  | undefined,
        zipCode: string  | undefined
    },
    lineBreak: string
): string;

export const addressFormat = {
    formatAddressAllFields
};
