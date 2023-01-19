/**
 * A order representation. Properties are - \
 * 	id: Id of the order \
 * 	currencyCode: The ISO 4217 currency code for the currency fields \
 * 	fields: The fields of the order
 */
export type OrderData = {
    id?: string;
    currencyCode?: string;
    fields?: OrderField[];
    orderNumber: string;
};

export type OrderField = {
    name?: string;
    value: string | AddressValue;
    type: string;
};

export type AddressValue = {
    city?: string;
    country?: string;
    postalcode?: string;
    state?: string;
    street?: string;
    latitude?: string;
    longitude?: string;
};

export type OrderAction = {
    name: string;
    eventName: string;
    assistiveText: string;
};

export type SortOption = {
    label: string;
    value: string;
    selected: boolean;
};
