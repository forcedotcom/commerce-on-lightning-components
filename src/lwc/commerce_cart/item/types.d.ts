import type { CartProductAttributeSummaryData } from 'commerce/cartApi';

export declare type CartProductAttributeSummaryInternal = CartProductAttributeSummaryData & {
    name: string;
};

export type InputField = {
    name: string;
    label: string;
    type: string;
};

export type FieldData = {
    name: string;
    label: string;
    type: string;
    value: unknown;
};
