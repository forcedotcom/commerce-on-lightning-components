import { createElement } from 'lwc';
import type { TestWireAdapter } from '@salesforce/wire-service-jest-util';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import type CommerceProductPricing from 'commerce/productPricing';
import { AppContextAdapter } from 'commerce/contextApi';
import ProductPricing from '../productPricing';
import { getProductDetailData } from './data/product.mock';
import { pricingProductMock } from './data/productPricing.mock';
import { getProductTaxes } from './data/productTax.mock';
import type { ProductPricingResult } from 'commerce/productApi';

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        AppContextAdapter: <TestWireAdapter>mockCreateTestWireAdapter(),
    })
);

describe('commerce_builder/productPricing', () => {
    let element: HTMLElement & ProductPricing;

    beforeEach(() => {
        element = createElement('commerce_builder-product-pricing', {
            is: ProductPricing,
        });
        document.body.appendChild(element);
        // @ts-ignore
        AppContextAdapter.emit({ data: { taxType: 'Gross' } });
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'showNegotiatedPrice',
            defaultValue: undefined,
            changeValue: true,
        },
        {
            property: 'negotiatedPriceTextColor',
            defaultValue: undefined,
            changeValue: '#454545',
        },
        {
            property: 'negotiatedPriceTextSize',
            defaultValue: undefined,
            changeValue: 'small',
        },
        {
            property: 'negotiatedPriceLabel',
            defaultValue: undefined,
            changeValue: 'Negotiated',
        },
        {
            property: 'originalPriceTextColor',
            defaultValue: undefined,
            changeValue: '#454545',
        },
        {
            property: 'originalPriceTextSize',
            defaultValue: undefined,
            changeValue: 'large',
        },
        {
            property: 'originalPriceLabel',
            defaultValue: undefined,
            changeValue: 'Original',
        },
        {
            property: 'unavailablePriceLabel',
            defaultValue: undefined,
            changeValue: 'Unavailable',
        },
        {
            property: 'showOriginalPrice',
            defaultValue: undefined,
            changeValue: true,
        },
        {
            property: 'showTaxIndication',
            defaultValue: undefined,
            changeValue: true,
        },
        {
            property: 'taxIncludedLabel',
            defaultValue: undefined,
            changeValue: 'Tax Included',
        },
        {
            property: 'taxLabelSize',
            defaultValue: undefined,
            changeValue: 'medium',
        },
        {
            property: 'taxLabelColor',
            defaultValue: undefined,
            changeValue: '#454545',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof ProductPricing]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                element.product = getProductDetailData(false);
                element.productPricing = pricingProductMock();
                element.productTax = getProductTaxes();
                element.productVariant = {
                    isValid: true,
                };
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof ProductPricing]).not.toBe(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[propertyTest.property as keyof ProductPricing] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof ProductPricing]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('should not show the pricing section when the product class is VariationParent and productVariant is not valid', () => {
        element.product = getProductDetailData();
        element.productPricing = pricingProductMock();
        element.productTax = getProductTaxes();
        element.productVariant = {
            isValid: false,
        };
        return Promise.resolve().then(() => {
            const productPricing = <HTMLElement & CommerceProductPricing>(
                element.querySelector('commerce-product-pricing')
            );
            expect(productPricing).toBeFalsy();
        });
    });

    it('should not show the pricing section when data has not been loaded', () => {
        element.product = undefined;
        element.productPricing = undefined;
        element.productVariant = {
            isValid: undefined,
        };
        return Promise.resolve().then(() => {
            const productPricing = <HTMLElement & ProductPricing>element.querySelector('commerce-product-pricing');
            expect(productPricing).toBeFalsy();
        });
    });

    it('should show the pricing component when error occurs', () => {
        element.product = {};
        element.productPricing = {};
        element.productVariant = {
            isValid: undefined,
        };
        return Promise.resolve().then(() => {
            const productPricing = <HTMLElement & ProductPricing>element.querySelector('commerce-product-pricing');
            expect(productPricing).toBeTruthy();
        });
    });

    it('should not show the pricing section when the product class is VariationParent and productVariant is valid', () => {
        element.product = getProductDetailData();
        element.productPricing = pricingProductMock();
        element.productTax = getProductTaxes();
        element.productVariant = {
            isValid: true,
        };
        return Promise.resolve().then(() => {
            const productPricing = <HTMLElement & CommerceProductPricing>(
                element.querySelector('commerce-product-pricing')
            );
            expect(productPricing).toBeFalsy();
        });
    });

    it('should not show the pricing section when the product class is not VariationParent and productVariant is not valid', () => {
        element.product = getProductDetailData(false);
        element.productPricing = pricingProductMock();
        element.productTax = getProductTaxes();
        element.productVariant = {
            isValid: false,
        };
        return Promise.resolve().then(() => {
            const productPricing = <HTMLElement & CommerceProductPricing>(
                element.querySelector('commerce-product-pricing')
            );
            expect(productPricing).toBeFalsy();
        });
    });

    it('shows the pricing section when the product class is not VariationParent and productVariant is valid', () => {
        element.product = getProductDetailData(false);
        element.productPricing = pricingProductMock();
        element.productTax = getProductTaxes();
        element.productVariant = {
            isValid: true,
        };
        return Promise.resolve().then(() => {
            const productPricing = <HTMLElement & CommerceProductPricing>(
                element.querySelector('commerce-product-pricing')
            );
            expect(productPricing).toBeTruthy();
        });
    });

    it('should not show the pricing section when the product api returns null', () => {
        element.product = null;
        element.productPricing = pricingProductMock();
        element.productTax = getProductTaxes();
        element.productVariant = {
            isValid: true,
        };
        return Promise.resolve().then(() => {
            const productPricing = <HTMLElement & CommerceProductPricing>(
                element.querySelector('commerce-product-pricing')
            );
            expect(productPricing).toBeFalsy();
        });
    });

    it('should not show the pricing section when the productPricing api returns null', () => {
        element.product = getProductDetailData(false);
        element.productPricing = null;
        element.productTax = getProductTaxes();
        element.productVariant = {
            isValid: true,
        };
        return Promise.resolve().then(() => {
            const productPricing = <HTMLElement & CommerceProductPricing>(
                element.querySelector('commerce-product-pricing')
            );
            expect(productPricing).toBeFalsy();
        });
    });

    it('should pass on correct computed values to the product pricing component', () => {
        element.product = getProductDetailData(false);
        element.productPricing = pricingProductMock();
        element.productTax = getProductTaxes();
        element.productVariant = {
            isValid: true,
        };
        return Promise.resolve().then(() => {
            const productPricing = <HTMLElement & CommerceProductPricing>(
                element.querySelector('commerce-product-pricing')
            );
            expect(productPricing.originalPrice).toBe((<ProductPricingResult>element.productPricing)?.listPrice);
            expect(productPricing.currencyCode).toBe((<ProductPricingResult>element.productPricing)?.currencyIsoCode);
            expect(productPricing.negotiatedPrice).toBe(
                (<ProductPricingResult>element.productPricing)?.negotiatedPrice
            );
            expect(productPricing.taxRate).toBe(20);
        });
    });

    it('should hide the container component when the product class is not VariationParent and productVariant is not valid', () => {
        element.product = getProductDetailData(false);
        element.productPricing = pricingProductMock();
        element.productTax = getProductTaxes();
        element.productVariant = {
            isValid: false,
        };
        return Promise.resolve().then(() => {
            expect(element.classList.contains('slds-hide')).toBeTruthy();
        });
    });

    it('should not hide the container component when the product class is not VariationParent and productVariant is not valid', () => {
        element.product = getProductDetailData(false);
        element.productPricing = pricingProductMock();
        element.productTax = getProductTaxes();
        element.productVariant = {
            isValid: true,
        };
        return Promise.resolve().then(() => {
            expect(element.classList.contains('slds-hide')).toBeFalsy();
        });
    });
});
