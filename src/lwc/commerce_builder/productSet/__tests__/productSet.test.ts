/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createElement, LightningElement } from 'lwc';
import type ProductSet from 'commerce_product_details/productSet';
import { ProductSetAdapter } from 'commerce/productApiInternal';
import type { DeepPartial } from 'types/util';
import type { MockWireAdapter } from 'types/wire-adapter';
import ProductSetBuilder from 'commerce_builder/productSet';
import { SessionContextAdapter } from 'commerce/contextApi';
import { getSessionContext } from 'commerce/context';
import { DataProviderActionEvent } from 'experience/dataProvider';
import { ADD_ALL_TO_CART_EVENT_NAME } from 'commerce_product_details/productSet';
import type { SessionContext } from 'commerce/context';
import Toast from 'lightning/toast';

const DATA_PROVIDER_EVENT_NAME = new DataProviderActionEvent('noop', {}).type;

jest.mock(
    'commerce/productApiInternal',
    () =>
        Object.assign({}, jest.requireActual('commerce/productApiInternal') as object, {
            ProductAdapter: jest.requireActual('@salesforce/wire-service-jest-util').createTestWireAdapter(),
            ProductSetAdapter: jest.requireActual('@salesforce/wire-service-jest-util').createTestWireAdapter(),
        }),
    { virtual: true }
)
    .mock('lightning/navigation', () => ({
        NavigationContext: jest.requireActual('@salesforce/wire-service-jest-util').createTestWireAdapter(),
    }))
    .mock('commerce/contextApi', () =>
        Object.assign({}, jest.requireActual('commerce/contextApi'), {
            SessionContextAdapter: jest.requireActual('@salesforce/wire-service-jest-util').createTestWireAdapter(),
        })
    )
    .mock('commerce/context', () =>
        Object.assign({}, jest.requireActual('commerce/context'), {
            getAppContext: (): Promise<unknown> => Promise.resolve({}),
            getSessionContext: jest.fn(),
        })
    )
    .mock('commerce/activitiesApi', () => ({
        trackViewProduct: (): void => undefined,
    }))
    .mock('lightning/toast', () => ({
        show: jest.fn(),
    }));

describe('commerce_builder/productSet', () => {
    let props: DeepPartial<ProductSetBuilder>;
    let onCleanup: (() => void) | null;
    let session: DeepPartial<SessionContext>;

    async function render(): Promise<{
        element: HTMLElement & ProductSetBuilder;
        productSet: (HTMLElement & ProductSet) | null;
    }> {
        const element = createElement<ProductSetBuilder>('commerce_builder-product-set', {
            is: ProductSetBuilder,
        });

        document.body.appendChild(element);

        Object.assign(element, props);

        (SessionContextAdapter as MockWireAdapter<typeof SessionContextAdapter>).emit({
            data: session,
            loaded: Boolean(session),
            loading: !session,
        });

        (ProductSetAdapter as MockWireAdapter<typeof ProductSetAdapter>).emit({ data: {}, loaded: true });

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
            productSet: element.querySelector('commerce_product_details-product-set'),
        };
    }

    beforeEach(() => {
        onCleanup = null;
        (getSessionContext as jest.Mock).mockImplementation(() => Promise.resolve(session));
        session = {
            isLoggedIn: true,
        };
        props = {
            product: {
                productClass: 'Set',
            },
            showAddAllToCartButton: true,
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
        onCleanup?.();
    });

    describe('when the product class is "Set"', () => {
        it('should display the product set components', async () => {
            const { productSet } = await render();

            expect(productSet).not.toBeNull();
        });
    });

    describe('when product set has not loaded', () => {
        it('should show product stencil', async () => {
            const { element } = await render();
            (ProductSetAdapter as MockWireAdapter<typeof ProductSetAdapter>).emit({ data: {}, loaded: false });
            await Promise.resolve();
            const productStencil = element.querySelector('commerce_product_details-product-stencil');
            expect(productStencil).not.toBeNull();
        });
    });

    describe('when the product class is not "Set"', () => {
        beforeEach(() => {
            props.product!.productClass = 'Simple';
        });

        it('should not display the product set components', async () => {
            const { productSet } = await render();

            expect(productSet).toBeNull();
        });
    });

    describe('when the user is logged in', () => {
        it('should not disable the add to cart button', async () => {
            const { productSet } = await render();

            expect(productSet!.addAllToCartDisabled).toBe(false);
        });
    });

    describe('when the user is not logged in', () => {
        beforeEach(() => {
            session.isLoggedIn = false;
        });

        it('should disable the add to cart button', async () => {
            const { productSet } = await render();

            expect(productSet!.addAllToCartDisabled).toBe(true);
        });
    });

    describe('when the add all to cart button event is emitted', () => {
        let providerSpy: jest.Mock;
        let eventSpy: jest.Mock;

        beforeEach(() => {
            eventSpy = jest.fn();
            providerSpy = jest.fn();
            document.body.addEventListener(ADD_ALL_TO_CART_EVENT_NAME, eventSpy);
            document.body.addEventListener(DATA_PROVIDER_EVENT_NAME, providerSpy);
        });

        afterEach(() => {
            document.body.removeEventListener(ADD_ALL_TO_CART_EVENT_NAME, eventSpy);
            document.body.removeEventListener(DATA_PROVIDER_EVENT_NAME, providerSpy);
        });

        it('should stop the propagation of the event', async () => {
            const { productSet } = await render();

            productSet!.dispatchEvent(new CustomEvent(ADD_ALL_TO_CART_EVENT_NAME, {}));

            expect(eventSpy).not.toHaveBeenCalled();
        });

        it('should emit a data provider event', async () => {
            const { productSet } = await render();

            productSet!.dispatchEvent(new CustomEvent(ADD_ALL_TO_CART_EVENT_NAME, {}));

            expect(providerSpy).toHaveBeenCalled();
        });

        describe('when the add all to cart event fails', () => {
            it('should display a toast notification', async () => {
                const { productSet } = await render();

                productSet!.dispatchEvent(new CustomEvent(ADD_ALL_TO_CART_EVENT_NAME, {}));

                const event = providerSpy.mock.calls[0][0] as DataProviderActionEvent<unknown>;

                event.detail.options.onError!(new Error(), false);

                expect(Toast.show).toHaveBeenCalledWith(
                    {
                        label: expect.any(String),
                        variant: 'error',
                    },
                    expect.any(LightningElement)
                );
            });
        });

        it('should show a toast message', async () => {
            const { productSet } = await render();

            productSet!.dispatchEvent(new CustomEvent(ADD_ALL_TO_CART_EVENT_NAME, {}));

            expect(Toast.show).toHaveBeenCalled();
        });
    });

    describe('after render', () => {
        describe('when the product is a product set', () => {
            it('should not hide the component', async () => {
                const { element } = await render();

                expect(element.classList.contains('slds-hide')).toBe(false);
            });
        });

        describe('when the product is not a product set', () => {
            beforeEach(() => {
                props.product!.productClass = 'Simple';
            });

            it('should not hide the component', async () => {
                const { element } = await render();

                expect(element.classList.contains('slds-hide')).toBe(true);
            });
        });
    });
});
