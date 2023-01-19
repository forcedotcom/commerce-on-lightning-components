/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createElement } from 'lwc';
import ProductSetItem, {
    IMAGE_SELECTED_EVENT_NAME,
    QUANTITY_CHANGED_EVENT_NAME,
    VARIANT_CHANGED_EVENT_NAME,
} from 'commerce_product_details/productSetItem';
import type { DeepPartial } from 'types/util';
import type ProductPricing from 'commerce/productPricing';
import type AddQuantity from 'commerce_product_details/addQuantity';
import type VariantSelector from 'commerce_product_details/variantSelector';
import type { ChangeEventDetail } from 'commerce/numberInput';
import type GalleryImage from 'commerce_product_details/galleryImage';
import type Heading from 'commerce_product_details/heading';

jest.mock('lightning/navigation', () => ({
    NavigationContext: jest.requireActual('@salesforce/wire-service-jest-util').createTestWireAdapter(),
}))
    .mock('commerce/activitiesApi', () => ({}))
    .mock('commerce/cartApiInternal', () => ({}));

describe('commerce_product_details/productSetItem', () => {
    let props: DeepPartial<ProductSetItem>;
    let onCleanup: (() => void) | null;

    async function render(): Promise<{
        element: HTMLElement & ProductSetItem;
        productPricing: (ProductPricing & HTMLElement) | null;
        addQuantity: (AddQuantity & HTMLElement) | null;
        variantSelector: (VariantSelector & HTMLElement) | null;
        image: (GalleryImage & HTMLElement) | null;
        heading: (Heading & HTMLElement) | null;
    }> {
        const element = createElement<ProductSetItem>('commerce_product_details-product-set-item', {
            is: ProductSetItem,
        });

        document.body.appendChild(element);

        Object.assign(element, props);

        onCleanup = (): void => {
            document.body.removeChild(element);
        };

        await Promise.resolve();

        return {
            element,
            productPricing: element.querySelector('commerce-product-pricing'),
            addQuantity: element.querySelector('commerce_product_details-add-quantity'),
            variantSelector: element.querySelector('commerce_product_details-variant-selector'),
            image: element.querySelector('commerce_product_details-gallery-image'),
            heading: element.querySelector('commerce_product_details-heading'),
        };
    }

    beforeEach(() => {
        onCleanup = null;
        props = {
            showProductImage: true,
            showProductDescription: true,
            product: {
                id: '123',
                mediaGroups: [
                    {
                        usageType: 'Listing',
                        mediaItems: [
                            {
                                id: '123',
                                alternateText: 'test',
                                thumbnailUrl: '/test/image',
                            },
                        ],
                    },
                ],
            },
            productPricing: {},
            quantity: 5,
            productTax: {
                taxPolicies: [{ taxRatePercentage: '2.5' }],
            },
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
        onCleanup?.();
    });

    describe('when there is a product', () => {
        it('should render', async () => {
            const results = await render();

            expect(results.addQuantity).not.toBeNull();
        });
    });

    describe('when price data is not loaded', () => {
        beforeEach(() => {
            props.productPricing = undefined;
        });

        it('should not render the product pricing', async () => {
            const { productPricing } = await render();

            expect(productPricing).toBeNull();
        });
    });

    describe('when price data is loaded', () => {
        beforeEach(() => {
            props.productPricing = {};
        });

        it('should render the product pricing', async () => {
            const { productPricing } = await render();

            expect(productPricing).not.toBeNull();
        });
    });

    describe('when the quantity is changed', () => {
        let spy: jest.Mock;

        beforeEach(() => {
            spy = jest.fn();
            document.body.addEventListener(QUANTITY_CHANGED_EVENT_NAME, spy);
        });

        afterEach(() => {
            document.body.removeEventListener(QUANTITY_CHANGED_EVENT_NAME, spy);
        });

        it('should emit an event with the quantity and product id', async () => {
            const { addQuantity } = await render();

            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0].detail).toEqual({
                isValid: true,
                quantity: 5,
                productId: '123',
            });

            addQuantity!.dispatchEvent(
                new CustomEvent('valuechanged', {
                    detail: {
                        value: 55,
                        isValid: true,
                        reason: null,
                        lastValue: 2,
                    } as ChangeEventDetail,
                })
            );

            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[1][0].detail).toEqual({
                isValid: true,
                quantity: 55,
                productId: '123',
            });
        });
    });

    describe('when the product variant is changed', () => {
        beforeEach(() => {
            props.product!.productClass = 'VariationParent';
            props.product!.variationInfo = {
                variationAttributeInfo: {
                    color: {
                        fieldEnumOrId: 'test',
                        label: 'test',
                        availableValues: ['blue'],
                    },
                },
            };
        });

        it('should emit an event', async () => {
            const spy = jest.fn();
            const { variantSelector, element } = await render();

            element.addEventListener(VARIANT_CHANGED_EVENT_NAME, (event) => spy((event as CustomEvent).detail));
            variantSelector!.dispatchEvent(
                new CustomEvent('variantselected', {
                    detail: {
                        isValid: true,
                        options: ['option 1', 'option 2'],
                        productId: '456',
                    },
                })
            );

            expect(spy).toHaveBeenCalledWith({
                isValid: true,
                variantProductId: '456',
            });
        });

        describe('when the product is a variation', () => {
            beforeEach(() => {
                props.product!.productClass = 'Variation';
                props.product!.variationParentId = '689';
            });

            it('should set the variation parent id to the parent product id', async () => {
                const spy = jest.fn();
                const { variantSelector, element } = await render();

                element.addEventListener(VARIANT_CHANGED_EVENT_NAME, (event) => spy((event as CustomEvent).detail));
                variantSelector!.dispatchEvent(
                    new CustomEvent('variantselected', {
                        detail: {
                            isValid: true,
                            options: ['option 1', 'option 2'],
                            productId: '456',
                        },
                    })
                );

                expect(spy).toHaveBeenCalledWith({
                    isValid: true,
                    variantProductId: '456',
                });
            });
        });
    });

    describe('when rendering the heading', () => {
        beforeEach(() => {
            props.product!.fields = {
                Name: 'test product set item name',
                Description: 'test product set item description',
                Other: 'test',
            };
        });

        it('should provide field mapping for name and description only', async () => {
            const { heading } = await render();

            expect(heading!.fields).toEqual([
                { value: 'test product set item name', type: 'STRING' },
                { value: 'test product set item description', type: 'TEXTAREA' },
            ]);
        });

        describe('when showProductDescription is false', () => {
            beforeEach(() => {
                props.showProductDescription = false;
            });
            it('should omit description field', async () => {
                const { heading } = await render();

                expect(heading!.fields).toEqual([{ value: 'test product set item name', type: 'STRING' }]);
            });
        });
    });

    describe('when getting the image url', () => {
        describe('when there is a product image', () => {
            describe('when there is a thumbnail url', () => {
                it('should provide the thumbnail url', async () => {
                    const { image } = await render();

                    expect(image!.url).toBe('/test/image');
                });
            });

            describe('when the showProductImage input is true', () => {
                it('should show the product image', async () => {
                    const { image } = await render();

                    expect(image).not.toBeNull();
                });
            });

            describe('when the showProductImage input is false', () => {
                beforeEach(() => {
                    props.showProductImage = false;
                });
                it('should show the product image', async () => {
                    const { image } = await render();

                    expect(image).toBeNull();
                });
            });

            describe('when there is not a thumbnail url', () => {
                beforeEach(() => {
                    props.product!.mediaGroups![0]!.mediaItems![0]!.thumbnailUrl = '';
                });

                describe('when there is a url', () => {
                    beforeEach(() => {
                        props.product!.mediaGroups![0]!.mediaItems![0]!.url = '/test/url';
                    });

                    it('should provide the url', async () => {
                        const { image } = await render();

                        expect(image!.url).toBe('/test/url');
                    });
                });

                it('should provide nothing', async () => {
                    const { image } = await render();

                    expect(image!.url).toBeFalsy();
                });
            });
        });

        describe('when there is a not a product image', () => {
            beforeEach(() => {
                props.product!.mediaGroups = [];
            });

            it('should not render the image', async () => {
                const { image } = await render();

                expect(image).toBeNull();
            });
        });
    });

    describe('when clicking on the image', () => {
        it('should emit an event', async () => {
            const spy = jest.fn();
            const { element, image } = await render();

            element.addEventListener(IMAGE_SELECTED_EVENT_NAME, spy);
            image!.dispatchEvent(new CustomEvent('selected'));

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('when determinig if the add to cart button is disabled', () => {
        describe('when disabled by a parent component', () => {
            beforeEach(() => {
                props.addToCartDisabled = true;
            });

            it('should should be disabled', async () => {
                const { addQuantity } = await render();

                expect(addQuantity!.disabled).toBe(true);
            });
        });
    });

    describe('when the tax rate is valid', () => {
        it('should provide the valid tax rate', async () => {
            const { productPricing } = await render();

            expect(productPricing!.taxRate).toBe(2.5);
        });
    });

    describe('when the tax rate is not valid', () => {
        beforeEach(() => {
            props.productTax = {};
        });

        it('should provide no value', async () => {
            const { productPricing } = await render();

            expect(productPricing!.taxRate).toBeUndefined();
        });
    });

    describe('when the product is a product set', () => {
        beforeEach(() => {
            props.product!.productClass = 'Set';
        });

        it('should not display the quantity or add to cart', async () => {
            const { addQuantity } = await render();

            expect(addQuantity).toBeNull();
        });

        it('should not display the price', async () => {
            const { productPricing } = await render();

            expect(productPricing).toBeNull();
        });
    });
});
