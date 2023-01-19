import type { Field } from 'commerce_my_account/itemFields';
import type { TransformedShippingField } from './types';

export function transformShippingFields(fields: Field[]): TransformedShippingField[] {
    return fields.map((field, index: number) => {
        return {
            ...field,
            id: index,
            hasFieldName: Boolean(field.label.length),
        };
    });
}
