/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createElement } from 'lwc';
import type ProductSetItem from 'commerce_product_details/productSetItem';
import type { ProductDetailData } from 'commerce/productApiInternal';
import { ProductAdapter, ProductPricingAdapter } from 'commerce/productApiInternal';
import type { DeepPartial } from 'types/util';
import type { MockWireAdapter } from 'types/wire-adapter';
import ProductSetItemContainer from 'commerce_product_details/productSetItemContainer';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { getSessionContext } from 'commerce/context';
import type { SessionContext } from 'commerce/contextApi';
import type ProductDataProvider from 'commerce_data_provider/productDataProvider';
import { DataProviderActionEvent } from 'experience/dataProvider';
import { NavigationContext, navigate } from 'lightning/navigation';
import Toast from 'lightning/toast';
import { IMAGE_SELECTED_EVENT_NAME } from 'commerce_product_details/productSetItem';

const DATA_PROVIDER_EVENT_NAME = new DataProviderActionEvent('noop', {}).type;

jest.mock(
    'commerce/productApiInternal',
    () =>
        Object.assign({}, jest.requireActual('commerce/productApiInternal') as object, {
            ProductAdapter: jest.requireActual('@salesforce/wire-service-jest-util').createTestWireAdapter(),
            ProductPricingAdapter: jest.requireActual('@salesforce/wire-service-jest-util').createTestWireAdapter(),
        }),
    { virtual: true }
)
    .mock('lightning/navigation', () => ({
        NavigationContext: jest.requireActual('@salesforce/wire-service-jest-util').createTestWireAdapter(),
        navigate: jest.fn(),
    }))
    .mock('commerce/contextApi', () =>
        Object.assign({}, jest.requireActual('commerce/contextApi'), {
            SessionContextAdapter: jest.requireActual('@salesforce/wire-service-jest-util').createTestWireAdapter(),
            AppContextAdapter: jest.requireActual('@salesforce/wire-service-jest-util').createTestWireAdapter(),
        })
    )
    .mock('commerce/context', () =>
        Object.assign({}, jest.requireActual('commerce/context'), {
            getSessionContext: jest.fn(),
            getAppContext: (): Promise<unknown> => Promise.resolve({}),
        })
    )
    .mock('commerce/activitiesApi', () => ({
        trackViewProduct: (): void => undefined,
        trackAddProductToCart: (): void => undefined,
    }))
    .mock('lightning/toast', () => ({
        show: jest.fn(),
    }));

describe('commerce_product_details/productSetItemContainer', () => {
    let props: Partial<ProductSetItemContainer>;
    let product: DeepPartial<ProductDetailData> | undefined;
    let onCleanup: (() => void) | null;
    let session: DeepPartial<SessionContext>;

    async function render(): Promise<{
        element: HTMLElement & ProductSetItemContainer;
        productSetItem: (HTMLElement & ProductSetItem) | null;
        dataProvider: (HTMLElement & ProductDataProvider) | null;
    }> {
        const element = createElement<ProductSetItemContainer>('commerce_product_details-product-set-container', {
            is: ProductSetItemContainer,
        });

        document.body.appendChild(element);

        Object.assign(element, props);

        (ProductAdapter as MockWireAdapter<typeof ProductAdapter>).emit({
            data: product,
            loaded: Boolean(product),
            loading: !product,
        });

        (SessionContextAdapter as MockWireAdapter<typeof SessionContextAdapter>).emit({
            data: session,
            loaded: Boolean(session),
            loading: !session,
        });

        (AppContextAdapter as MockWireAdapter<typeof AppContextAdapter>).emit({
            data: { isGuestCartCheckoutEnabled: false },
            loaded: true,
            loading: false,
        });

        (NavigationContext as MockWireAdapter<typeof NavigationContext>).emit({});

        onCleanup = (): void => {
            document.body.removeChild(element);
        };

        // Wait for connected
        await Promise.resolve();
        // Await for the session to resolve
        await getSessionContext();
        // Await for a rerender
        await Promise.resolve();
        // Component is settled

        return {
            element,
            productSetItem: element.querySelector('commerce_product_details-product-set-item'),
            dataProvider: element.querySelector('commerce_data_provider-product-data-provider'),
        };
    }

    beforeEach(() => {
        onCleanup = null;
        (getSessionContext as jest.Mock).mockImplementation(() => Promise.resolve(session));
        session = {
            isLoggedIn: true,
        };
        product = {
            id: '123',
            productClass: 'Simple',
        };
        props = {
            productId: '123',
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
        onCleanup?.();
    });

    describe('when the user is not logged in', () => {
        beforeEach(() => {
            session.isLoggedIn = false;
        });

        it('should disable the add to cart button', async () => {
            const { productSetItem } = await render();

            expect(productSetItem!.addToCartDisabled).toBe(true);
        });
    });

    describe('when product has not loaded', () => {
        it('should show product stencil', async () => {
            const { element } = await render();
            (ProductAdapter as MockWireAdapter<typeof ProductAdapter>).emit({
                data: null,
                loaded: false,
                loading: true,
            });
            await Promise.resolve();
            const productStencil = element.querySelector('commerce_product_details-product-stencil');
            expect(productStencil).not.toBeNull();
        });
    });

    describe('when the user is logged in', () => {
        it('should not disable the add to cart button', async () => {
            const { productSetItem } = await render();

            expect(productSetItem!.addToCartDisabled).toBe(false);
        });
    });

    describe('when a product image is selected', () => {
        it('should stop the propagation of the event', async () => {
            const spy = jest.fn();
            const event = new CustomEvent(IMAGE_SELECTED_EVENT_NAME);

            document.body.addEventListener(event.type, spy);

            const { productSetItem } = await render();

            productSetItem!.dispatchEvent(event);

            document.body.removeEventListener(event.type, spy);

            expect(spy).not.toHaveBeenCalled();
        });

        describe('when there is a product id', () => {
            it('should navigate to the product page', async () => {
                const { productSetItem } = await render();

                productSetItem!.dispatchEvent(new CustomEvent(IMAGE_SELECTED_EVENT_NAME));

                expect(navigate).toHaveBeenCalledWith(
                    {},
                    {
                        type: 'standard__recordPage',
                        attributes: {
                            objectApiName: 'Product2',
                            recordId: '123',
                            actionName: 'view',
                        },
                        state: {
                            recordName: 'Product2',
                        },
                    }
                );
            });
        });

        describe('when there is not a product id', () => {
            beforeEach(() => {
                props.productId = undefined;
            });

            it('should navigate to the product page', async () => {
                const { productSetItem } = await render();

                productSetItem!.dispatchEvent(new CustomEvent(IMAGE_SELECTED_EVENT_NAME));

                expect(navigate).not.toHaveBeenCalled();
            });
        });
    });

    describe('when adding a product to the cart', () => {
        describe('when the add to cart api is not enabled', () => {
            beforeEach(() => {
                session.isLoggedIn = false;
            });

            it('should navigate to the login page', async () => {
                const { productSetItem } = await render();

                productSetItem!.dispatchEvent(
                    new CustomEvent('addproducttocart', {
                        detail: {
                            quantity: 5,
                        },
                    })
                );

                expect(navigate).toHaveBeenCalledWith(
                    {},
                    {
                        type: 'comm__namedPage',
                        attributes: {
                            name: 'Login',
                        },
                    }
                );
            });
        });

        describe('when the add to cart api is enabled', () => {
            it('should emit a data provider event', async () => {
                const spy = jest.fn();
                const { productSetItem, dataProvider } = await render();

                dataProvider!.addEventListener(DATA_PROVIDER_EVENT_NAME, spy);

                productSetItem!.dispatchEvent(
                    new CustomEvent('addproducttocart', {
                        detail: {
                            quantity: 5,
                        },
                    })
                );

                expect(spy.mock.calls[0][0].detail).toEqual(
                    expect.objectContaining({
                        type: 'product:addItemToCart',
                        payload: {
                            quantity: 5,
                        },
                    })
                );
            });

            it('should show a toast message', async () => {
                const { productSetItem } = await render();

                productSetItem!.dispatchEvent(
                    new CustomEvent('addproducttocart', {
                        detail: {
                            quantity: 5,
                        },
                    })
                );

                expect(Toast.show).toHaveBeenCalled();
            });

            describe('when the data provider event errors', () => {
                it('should handle the add to cart error with a toast', async () => {
                    const { productSetItem, dataProvider } = await render();
                    const eventPromise = new Promise<DataProviderActionEvent<{ quantity: number }>>((resolve) =>
                        dataProvider!.addEventListener(DATA_PROVIDER_EVENT_NAME, (event: unknown) =>
                            resolve(event as DataProviderActionEvent<{ quantity: number }>)
                        )
                    );

                    productSetItem!.dispatchEvent(
                        new CustomEvent('addproducttocart', {
                            detail: {
                                quantity: 5,
                            },
                        })
                    );

                    (await eventPromise).detail.options.onError?.(new Error(), false);

                    expect(Toast.show).toHaveBeenCalled();
                });
            });
        });
    });

    describe('when wiring the product pricing', () => {
        it('should provide the product id and quantity', async () => {
            const { element } = await render();

            element.quantity = 5;

            await Promise.resolve();

            expect((ProductPricingAdapter as MockWireAdapter<typeof ProductPricingAdapter>).getLastConfig()).toEqual({
                productId: '123',
                quantity: 5,
            });
        });
    });
});
