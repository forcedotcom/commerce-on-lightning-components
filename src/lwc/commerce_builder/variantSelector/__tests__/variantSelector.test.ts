import { createElement } from 'lwc';
import VariantSelector from '../variantSelector';
import { getProductDetailData } from './data/product.mock';
import type { PageReference } from 'types/common';

const VARIANT_SELECTED_EVT = 'variantselected';
let exposedNavigationParams: PageReference | undefined;
jest.mock(
    'lightning/navigation',
    () => ({
        NavigationContext: jest.fn(),
        navigate: jest.fn((_, params) => {
            exposedNavigationParams = params;
        }),
    }),
    { virtual: true }
);

describe('commerce_builder/variantSelector', () => {
    let element: HTMLElement & VariantSelector;
    beforeEach(() => {
        element = createElement('commerce_builder-variant-selector', {
            is: VariantSelector,
        });
        document.body.appendChild(element);
        //      element.addEventListener(variantselected, variantOptionChangeHandler);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should display variant selector when it is variant parent or variant product', async () => {
        element.product = getProductDetailData();
        await Promise.resolve();

        // @ts-ignore
        const variantSection = element.querySelector('commerce_product_details-variant-selector');
        expect(variantSection).toBeTruthy();
    });

    it('should not display variant selector if product is not available', async () => {
        element.product = undefined;
        await Promise.resolve();

        // @ts-ignore
        const variantSection = element.querySelector('commerce_product_details-variant-selector');
        expect(variantSection).toBeFalsy();
    });

    it('should not display variant selector when productClass is simple', async () => {
        const mockProduct = getProductDetailData();
        mockProduct.productClass = 'Simple';
        element.product = mockProduct;
        await Promise.resolve();

        // @ts-ignore
        const variantSection = element.querySelector('commerce_product_details-variant-selector');
        expect(variantSection).toBeFalsy();
    });

    it('should not display variant selector when variantInfo is not available', async () => {
        const mockProduct = getProductDetailData();
        mockProduct.variationInfo = null;
        element.product = mockProduct;
        await Promise.resolve();

        // @ts-ignore
        const variantSection = element.querySelector('commerce_product_details-variant-selector');
        expect(variantSection).toBeFalsy();
    });

    it('should navigate to product variant if selection is valid', async () => {
        element.product = getProductDetailData();
        await Promise.resolve();

        const variantSection = element.querySelector('commerce_product_details-variant-selector');
        // @ts-ignore
        variantSection.dispatchEvent(
            new CustomEvent(VARIANT_SELECTED_EVT, {
                bubbles: false,
                cancelable: false,
                composed: false,
                detail: { productId: '01tR0000000maX0IAI', isValid: true, options: ['Blue', 'Medium', 'Cotton'] },
            })
        );

        expect(exposedNavigationParams).toEqual({
            type: 'standard__recordPage',
            attributes: {
                objectApiName: 'Product2',
                recordId: '01tR0000000maX0IAI',
                actionName: 'view',
            },
            state: {
                recordName: 'Product2',
            },
        });
    });

    it('should hide container component if variant selector is not displayed', async () => {
        const mockProduct = getProductDetailData();
        mockProduct.variationInfo = null;
        element.product = mockProduct;
        await Promise.resolve();

        expect(element.classList.contains('slds-hide')).toBeTruthy();
    });

    it('should not hide container component if variant selector is displayed', async () => {
        element.product = getProductDetailData();
        await Promise.resolve();

        expect(element.classList.contains('slds-hide')).toBeFalsy();
    });
});
