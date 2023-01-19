export declare type VariationInfo = {
    id: string;
    label: string;
    sequence: number;
    options: { label: string; value: string }[];
};

export declare type VariationValidityState = {
    valueMissing: boolean;
    badInput: boolean;
    valid: boolean;
};

export declare type VariationProductIdMap = {
    productId: string;
    attributes: string[];
};

export declare type NormalizedVariant = {
    id: string;
    label: string;
    value: string;
    options: { label: string; value: string; selected: boolean; disabled: boolean }[];
};

export declare interface VariantSelectedEventDetail {
    isValid: boolean;
    options: string[];
    productId?: string;
}
