import { createElement } from 'lwc';
import type { ProductImage } from 'commerce_product_details/gallery';
import ProductGallery from '../productGallery';
import { getProductDetailData } from './data/product.mock';

// Declaring Gallery type as the gallery component is in js
declare type Gallery = {
    expandable: boolean;
    images: ProductImage[];
};

describe('commerce_builder/productGallery', () => {
    let element: HTMLElement & ProductGallery;

    beforeEach(() => {
        element = createElement('commerce_builder-product-gallery', {
            is: ProductGallery,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });
    it('provides a collection of transformed images to the gallery', () => {
        element.product = getProductDetailData();
        element.carouselPosition = 'after';
        return Promise.resolve().then(() => {
            const galleryComponent = <HTMLElement & Gallery>element.querySelector('commerce_product_details-gallery');
            expect(galleryComponent.images).toHaveLength(2);
        });
    });

    it('makes the image gallery expandable when there are non-default images to display', () => {
        element.product = getProductDetailData();
        element.carouselPosition = 'after';
        return Promise.resolve().then(() => {
            const galleryComponent = <HTMLElement & Gallery>element.querySelector('commerce_product_details-gallery');
            expect(galleryComponent.expandable).toBeTruthy();
        });
    });

    it('Should not render gallery component if mediaGroups is not available', () => {
        const mockProductDetailData = getProductDetailData();
        mockProductDetailData.mediaGroups = null;
        element.product = mockProductDetailData;
        element.carouselPosition = 'after';
        return Promise.resolve().then(() => {
            const galleryComponent = <HTMLElement & Gallery>element.querySelector('commerce_product_details-gallery');
            expect(galleryComponent).toBeFalsy();
        });
    });

    [
        {
            property: 'carouselPageSize',
            defaultValue: undefined,
            changeValue: 2,
        },
        {
            property: 'imageBorderColor',
            defaultValue: undefined,
            changeValue: '#454545',
        },
        {
            property: 'showCarousel',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'carouselPosition',
            defaultValue: undefined,
            changeValue: 'below',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof ProductGallery]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof ProductGallery]).not.toBe(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[propertyTest.property as keyof ProductGallery] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof ProductGallery]).toBe(propertyTest.changeValue);
            });
        });
    });
});
