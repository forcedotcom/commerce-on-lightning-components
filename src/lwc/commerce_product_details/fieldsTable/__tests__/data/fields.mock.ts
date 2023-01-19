import type { Field } from 'commerce_product_details/fieldsTable';

export function getField(): Field[] {
    return [
        {
            name: 'ProductCode',
            label: 'Product Code',
            value: '00000001',
            type: 'STRING',
        },
        {
            name: 'ProductDescription',
            label: 'Description',
            value: 'Coffee Bean',
            type: 'STRING',
        },
    ];
}
