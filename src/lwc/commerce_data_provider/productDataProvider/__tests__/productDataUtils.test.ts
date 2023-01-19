import { transformProductDetailData, updateSelectedQuantity } from '../productDataUtils';
import type { ProductDetailData } from 'commerce/productApi';
import { getProductDetailData } from './data/product.mock';
import type { ProductData } from '../types';

describe('transformProductDetailData', () => {
    it(`should transform string to number when purchaseQuantityRule valid string`, () => {
        let productData: ProductDetailData = getProductDetailData();
        productData = {
            ...getProductDetailData(),
            ...{ purchaseQuantityRule: { increment: '2', maximum: '200.0', minimum: '2.0' } },
        };
        const transformedProductDetailData = transformProductDetailData(productData);
        expect(transformedProductDetailData?.purchaseQuantityRule).toEqual({
            increment: '2',
            maximum: '200.0',
            minimum: '2.0',
            incrementNumber: 2,
            maximumNumber: 200,
            minimumNumber: 2,
        });
    });

    it(`should transform string to number when PQR is mix and match between empty and value'`, () => {
        let productData: ProductDetailData = getProductDetailData();
        productData = {
            ...getProductDetailData(),
            ...{ purchaseQuantityRule: { increment: null, maximum: '4000.0', minimum: '4.0' } },
        };

        const transformedProductDetailData = transformProductDetailData(productData);
        expect(transformedProductDetailData?.purchaseQuantityRule).toEqual({
            increment: null,
            maximum: '4000.0',
            minimum: '4.0',
            incrementNumber: null,
            maximumNumber: 4000,
            minimumNumber: 4,
        });
    });

    it(`should transform string to number when PQR is null`, () => {
        let productData: ProductDetailData = getProductDetailData();
        productData = {
            ...getProductDetailData(),
            ...{ purchaseQuantityRule: { increment: null, maximum: null, minimum: null } },
        };

        const transformedProductDetailData = transformProductDetailData(productData);
        expect(transformedProductDetailData?.purchaseQuantityRule).toEqual({
            increment: null,
            maximum: null,
            minimum: null,
            incrementNumber: null,
            maximumNumber: null,
            minimumNumber: null,
        });
    });

    it(`should transform string to number when PQR is decimal`, () => {
        let productData: ProductDetailData = getProductDetailData();
        productData = {
            ...getProductDetailData(),
            ...{ purchaseQuantityRule: { increment: '1.25', maximum: '1000.12', minimum: '4.0' } },
        };

        const transformedProductDetailData = transformProductDetailData(productData);
        expect(transformedProductDetailData?.purchaseQuantityRule).toEqual({
            increment: '1.25',
            maximum: '1000.12',
            minimum: '4.0',
            incrementNumber: 1.25,
            maximumNumber: 1000.12,
            minimumNumber: 4,
        });
    });

    it(`should transform string to number when PQR is empty`, () => {
        let productData: ProductDetailData = getProductDetailData();
        productData = { ...getProductDetailData() };
        const transformedProductDetailData = transformProductDetailData(productData);
        expect(transformedProductDetailData?.purchaseQuantityRule).toBeNull();
    });
});

describe('updateSelectedQuantity', () => {
    it(`should update the selected quantity when PQR minimum value is set`, () => {
        let quantity = 1;
        const details = {
            ...getProductDetailData(),
            ...{ purchaseQuantityRule: { increment: '2', maximum: '200.0', minimum: '2.0' } },
        };
        const productData: ProductData = {
            Details: details,
            SelectedVariant: {
                isValid: undefined,
                options: undefined,
            },
        };
        quantity = updateSelectedQuantity(productData);
        expect(quantity).toBe(2);
    });

    it(`should update the selected quantity when PQR minimum value less than 1`, () => {
        const details = {
            ...getProductDetailData(),
            ...{ purchaseQuantityRule: { increment: '0.1', maximum: '200.0', minimum: '0.1' } },
        };
        const productData: ProductData = {
            Details: details,
            SelectedVariant: {
                isValid: undefined,
                options: undefined,
            },
        };
        const quantity = updateSelectedQuantity(productData);
        expect(quantity).toBe(0.1);
    });

    it(`should update the selected quantity when PQR minimum value less than 0`, () => {
        const details = {
            ...getProductDetailData(),
            ...{ purchaseQuantityRule: { increment: '0.1', maximum: '200.0', minimum: '-1' } },
        };
        const productData: ProductData = {
            Details: details,
            SelectedVariant: {
                isValid: undefined,
                options: undefined,
            },
        };
        const quantity = updateSelectedQuantity(productData);
        expect(quantity).toBe(1);
    });

    it(`should update the selected quantity when PQR minimum value is minimum value = 0`, () => {
        const details = {
            ...getProductDetailData(),
            ...{ purchaseQuantityRule: { increment: '0.1', maximum: '200.0', minimum: '0' } },
        };
        const productData: ProductData = {
            Details: details,
            SelectedVariant: {
                isValid: undefined,
                options: undefined,
            },
        };
        const quantity = updateSelectedQuantity(productData);
        expect(quantity).toBe(1);
    });

    it(`should update the selected quantity when no PQR is set`, () => {
        const details = {
            ...getProductDetailData(),
        };
        const productData: ProductData = {
            Details: details,
            SelectedVariant: {
                isValid: undefined,
                options: undefined,
            },
        };
        const quantity = updateSelectedQuantity(productData);
        expect(quantity).toBe(1);
    });
});
