import { transformProductData } from '../productFieldsTableUtils';
import { getProductDetailData } from './data/product.mock';

describe('transformProductData', () => {
    it('should return empty array when product data is undefined', () => {
        const result = transformProductData('', undefined);
        expect(result).toEqual([]);
    });

    it('should return empty array when productDetailDataContentMapping is an empty string', () => {
        const product = getProductDetailData();
        const result = transformProductData('', product);
        expect(result).toEqual([]);
    });

    it('should return Field objects when the product data is valid', () => {
        const product = getProductDetailData();
        const productDetailDataContentMapping =
            '[{"name":"ProductCode","label":"ProductCode","type":"STRING"},{"name":"Name","label":"ProductName","type":"STRING"}]';
        const result = transformProductData(productDetailDataContentMapping, product);

        // The result should not contain ProductCode because the mock data value is null
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            name: 'Name',
            value: 'GoBar Cranberry Vegan, 2oz - 6 pack',
            type: 'STRING',
            label: 'ProductName',
        });
    });
});
