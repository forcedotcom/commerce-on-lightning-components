/**
 * Transforms the additional product fields for display within the product detail summary.
 *
 * @param {additionalFields} productDetailSummaryFieldMapping the additional fields selected from the builder
 * @example [{"name":"ProductCode","label":"Product Code","type":"STRING"},{"name":"Name","label":"Product Name","type":"STRING"},{"name":"Description","label":"Product Description","type":"TEXTAREA"}]
 * @param {ProductField[]} allProductFields all product data
 * @return {Field[]} the transformed array of product fields
 */
export function transformProductFields(
    productDetailSummaryFieldMapping: string,
    allProductFields: Record<string, string | unknown> | undefined,
    skuFieldLabel: string | undefined
): Field[] | undefined {
    let fieldMappingData = [];
    if (allProductFields === undefined) {
        return undefined;
    }
    if (productDetailSummaryFieldMapping?.length > 0) {
        fieldMappingData = JSON.parse(productDetailSummaryFieldMapping);
    }
    const fieldData = fieldMappingData
        .filter(function (field: IterableField) {
            // @ts-ignore
            return (allProductFields[field.name] || '').length > 0;
        })
        .map(function (field: IterableField) {
            return {
                name: field.label,
                value: allProductFields[field.name],
                type: field.type,
            };
        });
    // Incorporate the StockKeepingUnit as the first additional field displayed
    return [
        {
            name: skuFieldLabel,
            value: allProductFields.StockKeepingUnit,
            type: 'STRING',
        },
    ].concat(fieldData);
}

export interface Field {
    name: string | unknown;
    value: string | unknown;
    type: string | unknown;
}

interface IterableField {
    name: string;
    label: string | unknown;
    type: string | unknown;
}
