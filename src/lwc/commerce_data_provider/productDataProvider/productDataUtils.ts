import type { ProductDetailData } from 'commerce/productApi';
import type { ProductData } from './types';

/**
 * function to transform ProductDetailData
 * @param data the ProductDetailData
 * @type {ProductDetailData}
 * @returns {ProductDetailData}
 */
export function transformProductDetailData(data: ProductDetailData | undefined): ProductDetailData | undefined {
    if (data?.purchaseQuantityRule) {
        const tempData = JSON.parse(JSON.stringify(data));
        tempData.purchaseQuantityRule.incrementNumber = tempData.purchaseQuantityRule.increment
            ? Number(tempData.purchaseQuantityRule.increment)
            : null;
        tempData.purchaseQuantityRule.maximumNumber = tempData.purchaseQuantityRule.maximum
            ? Number(tempData.purchaseQuantityRule.maximum)
            : null;
        tempData.purchaseQuantityRule.minimumNumber = tempData.purchaseQuantityRule.minimum
            ? Number(tempData.purchaseQuantityRule.minimum)
            : null;
        return tempData;
    }
    return data;
}
/**
 * Gets the computed value for the quantity
 * default quantity to quantity Rule minimum if it exists otherwise 1.
 * @type {number}
 */
export function updateSelectedQuantity(data: ProductData | undefined): number {
    if (data?.Details?.purchaseQuantityRule?.minimum) {
        const minimumNumber = Number(data.Details.purchaseQuantityRule.minimum);
        if (minimumNumber > 0) {
            return minimumNumber;
        }
    }
    return 1;
}
