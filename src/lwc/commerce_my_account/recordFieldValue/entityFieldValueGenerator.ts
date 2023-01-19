import { getFieldValue } from 'lightning/uiRecordApi';
import type { Field, Record } from './types';

/**
 * @description return the value of field from record, If field isn't present, returns the recordId
 */
export function getValueOfNameFieldForEntity(
    field: Field | undefined | null,
    recordId: string | undefined,
    record: Record | undefined
): string | undefined {
    if (record && record.data && field) {
        const value = getFieldValue(record.data, field);
        if (value.toString().length > 0) {
            return value;
        }
    }
    return recordId;
}
