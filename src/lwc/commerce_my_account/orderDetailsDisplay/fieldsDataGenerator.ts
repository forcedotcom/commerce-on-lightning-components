import type { OrderData } from 'commerce/orderApi';
import type { InputField, FieldData } from 'commerce_my_account/orderDetails';
import getFieldLabel from './fieldLabelGenerator';
import getFieldTypeAndValue from './fieldTypeAndValueGenerator';
import getFieldNameFromRecord from './fieldNameGenerator';

/**
 * @description List of fields with displayable data.
 * @param {OrderData} data
 */
export default function getFieldsData(data: OrderData, fieldMapping: InputField[] | undefined): FieldData[] {
    return (fieldMapping || [])
        .map((field) => {
            const [fieldVal, fieldType] = getFieldTypeAndValue(data, field);
            return {
                name: field.name,
                label: getFieldLabel(field.label),
                value: fieldVal,
                type: fieldType,
                isReference: fieldType === 'reference' || fieldType === 'id',
                field: getFieldNameFromRecord(String(fieldVal)),
            };
        })
        .filter((fieldData) => Boolean(fieldData.value));
}
