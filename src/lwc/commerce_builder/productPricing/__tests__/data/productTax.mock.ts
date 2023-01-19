import type { ProductTaxResult } from 'commerce/productApiInternal';

/**
 * Mock function to get products with tax information.
 * @param {string} productId ProductId
 * @param {boolean} hasTaxRate
 * @param {boolean} hasGrossLocaleType Gross | Net
 * @param {boolean} success
 * @returns Record<string, ProductTaxResult>
 */
export const getProductTaxes = (
    productId = '01txx0000006iTlAAI',
    hasTaxRate = true,
    hasGrossLocaleType = true,
    success = true
): ProductTaxResult => {
    return {
        productId,
        taxLocaleType: hasGrossLocaleType ? 'Gross' : 'Net',
        taxPolicies: success
            ? [
                  {
                      taxRatePercentage: hasTaxRate ? '20' : '0.00',
                      taxTreatmentName: 'ABCD',
                      taxTreatmentDescription: 'Lorem text',
                  },
              ]
            : [],
    };
};
