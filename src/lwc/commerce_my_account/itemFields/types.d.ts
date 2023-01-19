export declare type Field = {
    dataName: string;
    label: string;
    text: string | null;
    type: string;
};

export declare interface TransformedField extends Field {
    id: number;
    showFieldName: boolean;
    assistiveText: string | null;
    showInfoIcon: boolean;
    cssClass: string;
}

export declare type Adjustment = {
    id: number;
    name: string | null;
    type: string | null;
    discountAmount: string;
    currencyIsoCode: string;
};

export declare type Geolocation = {
    latitude: string | null;
    longitude: string | null;
};
