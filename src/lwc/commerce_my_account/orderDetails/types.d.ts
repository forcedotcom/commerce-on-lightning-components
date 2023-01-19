export type InputField = {
    entity: string;
    name: string;
    label: string;
    type: string;
};

export type FieldData = {
    name: string | null;
    label: string | null;
    value: unknown | null;
    type: string | null;
    isReference: boolean;
};

export type AddressField = {
    city?: string;
    country?: string;
    postalcode?: string;
    state?: string;
    street?: string;
};

export type GeolocationField = {
    latitude?: string;
    longitude?: string;
};
