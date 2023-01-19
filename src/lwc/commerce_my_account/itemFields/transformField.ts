import type { Adjustment, Field, TransformedField, Geolocation } from './types';
import TOTAL_LINE_ADJUSTMENT_AMOUNT from '@salesforce/schema/OrderItemSummary.TotalLineAdjustmentAmount';

export const transformFields = function (
    fields: Field[] = [],
    adjustments: Adjustment[] | undefined
): TransformedField[] {
    return fields.map((field, index) => {
        const showInfoIcon = Boolean(adjustments) && field.dataName === TOTAL_LINE_ADJUSTMENT_AMOUNT.fieldApiName;
        const cssClass = field.dataName === TOTAL_LINE_ADJUSTMENT_AMOUNT.fieldApiName ? 'adjustments-amount-text' : '';
        let assistiveText = field.text;
        const isGeolocation = field.type.toUpperCase() === 'GEOLOCATION';
        if (isGeolocation && field.text) {
            const value: Geolocation = JSON.parse(field.text);
            assistiveText = `${value.latitude} ${value.longitude}`;
        }
        const updatedFields: TransformedField = {
            ...field,
            id: index,
            showFieldName: (field.label || '').length > 0,
            assistiveText,
            showInfoIcon,
            cssClass,
        };
        return updatedFields;
    });
};
