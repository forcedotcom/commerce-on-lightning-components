import type { OrderAdjustmentAggregatesData } from 'commerce/orderApi';

export type FieldData = {
    name: string;
    label: string;
    value: unknown;
};

export type FieldValue = {
    name: string;
    label: string;
    value: string;
    type: string;
};

export type TotalsData = {
    /**
     * @description Order Summary Id
     */
    orderSummaryId: string;

    /**
     * @description  Currency ISO code of the prices
     */
    currencyIsoCode: string;

    /**
     * @description Owner Id of the Order Summary
     */
    ownerId: string;

    /**
     * @description Key-value pairs of field name and it's value object.
     */
    fields: FieldValue[];

    /**
     * @description Adjustment Aggregates data for order summary.
     */
    adjustmentAggregates: OrderAdjustmentAggregatesData;
};

export type IterableField = {
    cssClasses: string;
    name: string;
    label: string;
};
