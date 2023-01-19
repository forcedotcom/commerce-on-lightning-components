import { createElement } from 'lwc';
import type FieldsTable from 'commerce_product_details/fieldsTable';
import ProductFieldsTable from 'commerce_builder/productFieldsTable';
import { getProductDetailData } from './data/product.mock';

describe('commerce_builder/fieldsTable: Product Record Table Container', () => {
    let element: HTMLElement & ProductFieldsTable;

    const productMetadata =
        '[{"name":"ProductCode","label":"ProductCode","type":"STRING"},{"name":"Name","label":"ProductName","type":"STRING"}]';

    beforeEach(() => {
        element = createElement('commerce_builder-product-fields-table', {
            is: ProductFieldsTable,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should pass down currency code', () => {
        const productData = getProductDetailData();
        productData.fields.CurrencyIsoCode = 'USD';
        element.product = productData;
        element.productDetailDataContentMapping = productMetadata;
        const fieldsTable = <FieldsTable & HTMLElement>element.querySelector('commerce_product_details-fields-table');
        return Promise.resolve().then(() => {
            expect(fieldsTable.currencyCode).toBe('USD');
        });
    });

    it('should pass down Fields object', () => {
        element.product = getProductDetailData();
        element.productDetailDataContentMapping = productMetadata;
        const fieldsTable = <FieldsTable & HTMLElement>element.querySelector('commerce_product_details-fields-table');
        return Promise.resolve().then(() => {
            expect(fieldsTable.fields).toHaveLength(1);
        });
    });

    it('is accessible', async () => {
        element.product = getProductDetailData();
        element.productDetailDataContentMapping = productMetadata;

        await Promise.resolve();
        await expect(element).toBeAccessible();
    });
});
