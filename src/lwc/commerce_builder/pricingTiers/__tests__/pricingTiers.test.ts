import { createElement } from 'lwc';
import type { TestWireAdapter } from '@salesforce/wire-service-jest-util';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import PricingTiers from '../pricingTiers';
import { getProductPricingData } from './data/productPricing.mock';
import { getProductDetailData } from './data/product.mock';

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        AppContextAdapter: <TestWireAdapter>mockCreateTestWireAdapter(),
    })
);

describe('commerce_builder/pricingTiers', () => {
    let element: HTMLElement & PricingTiers;

    beforeEach(() => {
        element = createElement('commerce_builder-pricing-tiers', {
            is: PricingTiers,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe(`the border property`, () => {
        it('should pass down the css variable', async () => {
            element.productPricing = getProductPricingData();
            const mockProduct = getProductDetailData();
            mockProduct.productClass = 'Simple';
            element.product = mockProduct;
            element.productVariant = {
                isValid: true,
            };
            element.borderRadius = 4;
            await Promise.resolve();
            const pricingTiers = <HTMLElement>element.querySelector('commerce_product_details-pricing-tiers');
            expect(getComputedStyle(pricingTiers).getPropertyValue('--com-c-pricing-tiers-border-radius')).toBe('4px');
        });
    });

    [
        {
            property: 'quantityRowLabel',
            defaultValue: undefined,
            changeValue: 'Quantity Row',
        },
        {
            property: 'discountRowLabel',
            defaultValue: undefined,
            changeValue: 'Discount Row Label',
        },
        {
            property: 'backgroundColor',
            defaultValue: undefined,
            changeValue: '#454545',
        },
        {
            property: 'borderRadius',
            defaultValue: undefined,
            changeValue: '4px',
        },
        {
            property: 'rowTitleTextColor',
            defaultValue: undefined,
            changeValue: '#454545',
        },
        {
            property: 'labelTextColor',
            defaultValue: undefined,
            changeValue: '#454545',
        },
        {
            property: 'textColor',
            defaultValue: undefined,
            changeValue: '#454545',
        },
        {
            property: 'borderColor',
            defaultValue: undefined,
            changeValue: '#454545',
        },
        {
            property: 'productPricing',
            defaultValue: undefined,
            changeValue: 'pricing',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof PricingTiers]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof PricingTiers]).not.toBe(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[propertyTest.property as keyof PricingTiers] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof PricingTiers]).toBe(propertyTest.changeValue);
            });
        });
    });

    describe('pricingTiers sanity test', () => {
        it('should not display pricing tiers when productPricing is undefined', async () => {
            element.productPricing = undefined;
            await Promise.resolve();
            const pricingTiers = <HTMLElement>element.querySelector('commerce_product_details-pricing-tiers');
            expect(pricingTiers).toBeNull();
        });

        it('should not display pricing tiers when product class is VariationParent', async () => {
            element.productPricing = getProductPricingData();
            element.product = getProductDetailData();
            element.productVariant = {
                isValid: true,
            };
            await Promise.resolve();
            const pricingTiers = <HTMLElement>element.querySelector('commerce_product_details-pricing-tiers');
            expect(pricingTiers).toBeNull();
        });

        it('should not display pricing tiers when selected variant is invalid', async () => {
            element.productPricing = getProductPricingData();
            const mockProduct = getProductDetailData();
            mockProduct.productClass = 'Simple';
            element.product = mockProduct;
            element.productVariant = {
                isValid: false,
            };
            await Promise.resolve();
            const pricingTiers = <HTMLElement>element.querySelector('commerce_product_details-pricing-tiers');
            expect(pricingTiers).toBeNull();
        });

        it('should display pricing tiers when productPricing is valid', async () => {
            element.productPricing = getProductPricingData();
            const mockProduct = getProductDetailData();
            mockProduct.productClass = 'Simple';
            element.product = mockProduct;
            element.productVariant = {
                isValid: true,
            };
            await Promise.resolve();
            const pricingTiers = <HTMLElement>element.querySelector('commerce_product_details-pricing-tiers');
            expect(pricingTiers).toBeTruthy();
        });

        it('should have correct currency code', async () => {
            element.productPricing = getProductPricingData();
            const mockProduct = getProductDetailData();
            mockProduct.productClass = 'Simple';
            element.product = mockProduct;
            element.productVariant = {
                isValid: true,
            };
            await Promise.resolve();
            const pricingTiers = <HTMLElement>element.querySelector('commerce_product_details-pricing-tiers');
            //@ts-ignore
            expect(pricingTiers.currencyCode).toBe('EUR');
            //@ts-ignore
            expect(pricingTiers.adjustmentTiers).toBeTruthy();
        });

        it('should not have currency code set', async () => {
            element.productPricing = getProductPricingData({
                currencyIsoCode: null,
            });
            const mockProduct = getProductDetailData();
            mockProduct.productClass = 'Simple';
            element.product = mockProduct;
            element.productVariant = {
                isValid: true,
            };
            await Promise.resolve();
            const pricingTiers = <HTMLElement>element.querySelector('commerce_product_details-pricing-tiers');
            //@ts-ignore
            expect(pricingTiers.currencyCode).toBeNull();
        });

        it('should not display pricing tiers when variant is invalid', async () => {
            element.productPricing = getProductPricingData();
            const mockProduct = getProductDetailData();
            mockProduct.productClass = 'Simple';
            element.product = mockProduct;
            element.productVariant = {
                isValid: false,
            };
            await Promise.resolve();
            const pricingTiers = <HTMLElement>element.querySelector('commerce_product_details-pricing-tiers');
            expect(pricingTiers).toBeNull();
        });
    });

    describe('pricingTiers custom styles', () => {
        [
            {
                property: 'backgroundColor',
                value: '#454545',
                cssStyle: '--com-c-pricing-tiers-background-color',
            },
            {
                property: 'borderColor',
                value: '#454545',
                cssStyle: '--com-c-pricing-tiers-border-color',
            },
            {
                property: 'labelTextColor',
                value: '#454545',
                cssStyle: '--com-c-pricing-tiers-label-text-color',
            },
            {
                property: 'textColor',
                value: '#454545',
                cssStyle: '--com-c-pricing-tiers-text-color',
            },
            {
                property: 'rowTitleTextColor',
                value: '#454545',
                cssStyle: '--com-c-pricing-tiers-row-title-text-color',
            },
        ].forEach((propertyTest) => {
            describe(`the "${propertyTest.property}" property`, () => {
                it('should pass down the css variable', async () => {
                    element.productPricing = getProductPricingData();
                    const mockProduct = getProductDetailData();
                    mockProduct.productClass = 'Simple';
                    element.product = mockProduct;
                    element.productVariant = {
                        isValid: true,
                    };
                    // @ts-ignore
                    element[propertyTest.property] = propertyTest.value;
                    await Promise.resolve();
                    const pricingTiers = <HTMLElement>element.querySelector('commerce_product_details-pricing-tiers');
                    expect(getComputedStyle(pricingTiers).getPropertyValue(propertyTest.cssStyle)).toBe(
                        propertyTest.value
                    );
                });
            });
        });
    });
});
