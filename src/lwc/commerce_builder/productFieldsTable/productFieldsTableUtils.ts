import type { ProductDetailData } from 'commerce/productApi';
import type { Field } from 'commerce_product_details/fieldsTable';

/**
 * Transform data into Field[] that the child component can consume
 * @param product
 * @param productDetailDataContentMapping
 * @returns
 */
export function transformProductData(productDetailDataContentMapping: string, product?: ProductDetailData): Field[] {
    const allProductFields = product?.fields;
    if (!!allProductFields && productDetailDataContentMapping?.length > 0) {
        const fieldMappingData = JSON.parse(productDetailDataContentMapping);
        const fieldData = fieldMappingData
            .filter(function (field: Field) {
                return !!field.name && !!allProductFields[field.name];
            })
            .map(function (field: Field) {
                return {
                    name: field.name,
                    label: field.label,
                    value: allProductFields[field.name],
                    type: field.type,
                };
            });
        return fieldData;
    }
    return [];
}
