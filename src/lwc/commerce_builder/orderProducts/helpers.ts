import type { FieldMapping } from './types';

/* 
* returns the names of entities + fields for the shipping and product builder properties 
  example: entity: orderItemSummary, name: Quantity 
  return: orderItemSummary.Quantity
*/
export function getEntityFieldNames(fields: FieldMapping[]): string[] {
    return fields.map((field) => {
        return field.entity + '.' + field.name;
    });
}
