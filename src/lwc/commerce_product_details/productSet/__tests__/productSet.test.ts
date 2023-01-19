/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createElement } from 'lwc';
import ProductSet from 'commerce_product_details/productSet';
import type { DeepPartial } from 'types/util';
import type ProductSetItem from 'commerce_product_details/productSetItemContainer';
import type AddToCartButton from 'commerce_product_details/addToCartButton';
import { QUANTITY_CHANGED_EVENT_NAME, VARIANT_CHANGED_EVENT_NAME } from 'commerce_product_details/productSetItem';
import type { ProductSetItemQuantityChangedEventDetails } from 'commerce_product_details/productSetItem';
import type { ProductDetailData } from 'commerce/productApiInternal';

jest.mock(
    'commerce/productApiInternal',
    () =>
        Object.assign({}, jest.requireActual('commerce/productApiInternal') as object, {
            ProductSetAdapter: jest.requireActual('@salesforce/wire-service-jest-util').createTestWireAdapter(),
        }),
    { virtual: true }
)
    .mock('lightning/navigation', () => ({
        NavigationContext: jest.requireActual('@salesforce/wire-service-jest-util').createTestWireAdapter(),
    }))
    .mock('commerce/activitiesApi', () => ({}))
    .mock('commerce/cartApiInternal', () => ({}));

describe('commerce_product_details/productSet', () => {
    let props: DeepPartial<ProductSet>;
    let onCleanup: (() => void) | null;
    let addAllToCartSpy: jest.Mock;

    async function render(): Promise<{
        element: HTMLElement & ProductSet;
        getItems: () => (ProductSetItem & HTMLElement)[];
        items: (ProductSetItem & HTMLElement)[];
        addAllToCartBtn: AddToCartButton & HTMLElement;
    }> {
        const element = createElement<ProductSet>('commerce_product_details-product-set', {
            is: ProductSet,
        });

        document.body.appendChild(element);

        Object.assign(element, props);

        onCleanup = (): void => {
            document.body.removeChild(element);
        };

        await Promise.resolve();

        const getItems = (): (ProductSetItem & HTMLElement)[] =>
            Array.from(element.querySelectorAll('commerce_product_details-product-set-item-container'));

        return {
            element,
            getItems,
            addAllToCartBtn: element.querySelector('commerce_product_details-add-to-cart-button')!,
            items: getItems(),
        };
    }

    beforeEach(() => {
        addAllToCartSpy = jest.fn();
        onCleanup = null;
        props = {
            productSet: {
                items: [
                    {
                        defaultQuantity: '10',
                        productInfo: {
                            id: 'id-1',
                        },
                    },
                    {
                        defaultQuantity: '2',
                        productInfo: {
                            id: 'id-2',
                        },
                    },
                ],
            },
            showAddAllToCartButton: true,
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
        onCleanup?.();
    });

    describe('when setting the product set', () => {
        beforeEach(() => {
            props.productSet = {};
        });

        it('should set the product set', async () => {
            const { element } = await render();

            expect(element.productSet).toEqual({});
        });
    });

    describe('when getting products', () => {
        it('should keep the product order', async () => {
            const { items } = await render();

            expect(items.map(({ productId }) => productId)).toEqual(['id-1', 'id-2']);
        });

        it('should set the quantity to the current product quantity', async () => {
            const { items } = await render();

            expect(items.map(({ quantity }) => quantity)).toEqual([10, 2]);
        });

        describe('when there is no default quantity', () => {
            beforeEach(() => {
                props.productSet!.items![1]!.defaultQuantity = undefined;
            });

            it('should default to 1', async () => {
                const { items } = await render();

                expect(items.map(({ quantity }) => quantity)).toEqual([10, 1]);
            });
        });

        describe('when there is no product data', () => {
            beforeEach(() => {
                props.productSet = undefined;
            });

            it('should default to empty products', async () => {
                const { items } = await render();

                expect(items).toHaveLength(0);
            });
        });

        describe('when the product is a variation', () => {
            beforeEach(() => {
                Object.assign(props.productSet!.items![1]!.productInfo!, {
                    productClass: 'Variation',
                    variationParentId: 'id-55',
                } as Partial<ProductDetailData>);
            });

            it('should set the selected variant id to the variation product id', async () => {
                const { items } = await render();

                expect(items[1].productId).toBe('id-2');
            });
        });
    });

    describe('when the user can not add to cart', () => {
        beforeEach(() => {
            props.addAllToCartDisabled = true;
        });

        it('should disable the add all to cart button', async () => {
            const { addAllToCartBtn } = await render();

            expect(addAllToCartBtn.disabled).toBe(true);
        });
    });

    describe('when the user can add to cart', () => {
        beforeEach(() => {
            props.addAllToCartDisabled = false;
        });

        it('should not disable the add all to cart button', async () => {
            const { addAllToCartBtn } = await render();

            expect(addAllToCartBtn.disabled).toBe(false);
        });

        describe('when all products are not valid', () => {
            beforeEach(() => {
                props.productSet!.items![1]!.productInfo!.productClass = 'VariationParent';
            });

            it('should disable the add all to cart button', async () => {
                const { addAllToCartBtn } = await render();

                expect(addAllToCartBtn.disabled).toBe(true);
            });
        });

        describe('when all products are valid', () => {
            it('should not disable the add all to cart button', async () => {
                const { addAllToCartBtn } = await render();

                expect(addAllToCartBtn.disabled).toBe(false);
            });
        });
    });

    describe('when adding all items to the cart', () => {
        it('should emit an event to the data provider with the products', async () => {
            const { element, addAllToCartBtn } = await render();

            element.addEventListener('addalltocart', (event) => addAllToCartSpy((event as CustomEvent).detail));

            addAllToCartBtn.click();

            expect(addAllToCartSpy).toHaveBeenCalledWith({
                'id-1': 10,
                'id-2': 2,
            });
        });

        describe('when a product is a product set', () => {
            beforeEach(() => {
                props.productSet!.items![1]!.productInfo!.productClass = 'Set';
            });

            it('should omit that product from the event', async () => {
                const { element, addAllToCartBtn } = await render();

                element.addEventListener('addalltocart', (event) => addAllToCartSpy((event as CustomEvent).detail));

                addAllToCartBtn.click();

                expect(addAllToCartSpy).toHaveBeenCalledWith({
                    'id-1': 10,
                });
            });
        });

        describe('when a product is a variation', () => {
            beforeEach(() => {
                Object.assign(props.productSet!.items![1]!.productInfo!, {
                    id: 'id-89',
                    productClass: 'Variation',
                } as Partial<ProductDetailData>);
            });

            it('should add the selected variation to the cart', async () => {
                const { element, addAllToCartBtn } = await render();

                element.addEventListener('addalltocart', (event) => addAllToCartSpy((event as CustomEvent).detail));

                addAllToCartBtn.click();

                expect(addAllToCartSpy).toHaveBeenCalledWith({
                    'id-1': 10,
                    'id-89': 2,
                });
            });

            it('should get sum of quantities when duplicate variant products are present in a set', async () => {
                props.productSet!.items![2] = {
                    defaultQuantity: '20',
                    productInfo: {
                        id: 'id-89',
                        productClass: 'Variation',
                    },
                };
                const { element, addAllToCartBtn } = await render();

                element.addEventListener('addalltocart', (event) => addAllToCartSpy((event as CustomEvent).detail));

                addAllToCartBtn.click();

                expect(addAllToCartSpy).toHaveBeenCalledWith({
                    'id-1': 10,
                    'id-89': 22,
                });
            });
        });
    });

    describe('when the quantity of a product changes', () => {
        it('should update the product quantity', async () => {
            const { items } = await render();

            items[0].dispatchEvent(
                new CustomEvent<ProductSetItemQuantityChangedEventDetails>(QUANTITY_CHANGED_EVENT_NAME, {
                    bubbles: true,
                    detail: {
                        productId: 'id-1',
                        quantity: 5,
                        isValid: true,
                    },
                })
            );

            await Promise.resolve();

            expect(items[0].quantity).toBe(5);
        });

        describe('when the quantity is not valid', () => {
            it('should disable the add to cart button', async () => {
                const { items, addAllToCartBtn } = await render();

                expect(addAllToCartBtn.disabled).toBe(false);

                items[0].dispatchEvent(
                    new CustomEvent<ProductSetItemQuantityChangedEventDetails>(QUANTITY_CHANGED_EVENT_NAME, {
                        bubbles: true,
                        detail: {
                            productId: 'id-1',
                            quantity: 5,
                            isValid: false,
                        },
                    })
                );

                await Promise.resolve();

                expect(addAllToCartBtn.disabled).toBe(true);
            });
        });
    });

    describe('when the variant of a product changes', () => {
        beforeEach(() => {
            Object.assign(props.productSet!.items![0]!.productInfo!, {
                productClass: 'Variation',
            } as Partial<ProductDetailData>);
        });

        it('should update product id with new variant product id', async () => {
            const { items, getItems } = await render();
            const variantChangedEvent = new CustomEvent(VARIANT_CHANGED_EVENT_NAME, {
                bubbles: true,
                detail: {
                    variantProductId: 'id-3',
                    isValid: true,
                },
            });

            items[0].dispatchEvent(variantChangedEvent);

            await Promise.resolve();

            const newItems = getItems();

            expect(newItems[0].productId).toBe('id-3');
        });

        it('should disable add all to cart button when variant product is undefined', async () => {
            const { items, addAllToCartBtn } = await render();

            const variantChangedEvent = new CustomEvent(VARIANT_CHANGED_EVENT_NAME, {
                bubbles: true,
                detail: {
                    variantProductId: undefined,
                    isValid: false,
                },
            });
            expect(addAllToCartBtn.disabled).toBe(false);

            items[0].dispatchEvent(variantChangedEvent);

            await Promise.resolve();

            expect(addAllToCartBtn.disabled).toBe(true);
        });
    });
});
