import type { EntityField } from 'commerce/orderApiInternal';
import type { FieldMapping } from '../orderProducts/types';

export function getFieldsIfDefined(fieldsMapping: FieldMapping[], fieldsData: EntityField[] = []): EntityField[] {
    const fieldsDataIndexedByDataName = fieldsData.reduce(
        (fieldsDataAccumulator: Record<string, EntityField>, entityFieldData) => {
            if (entityFieldData.dataName) {
                fieldsDataAccumulator[entityFieldData.dataName] = entityFieldData;
            }
            return fieldsDataAccumulator;
        },
        {}
    );

    return fieldsMapping
        .filter((fieldMapping) => fieldMapping.name in fieldsDataIndexedByDataName)
        .map((fieldMapping) => ({ ...fieldsDataIndexedByDataName[fieldMapping.name], label: fieldMapping.label }));
}
