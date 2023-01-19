import { createElement } from 'lwc';
import type { TestWireAdapter } from '@salesforce/wire-service-jest-util';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { createContextBoundary } from 'experience/context';
import { DataProviderActionEvent } from 'experience/dataProvider';
import ProductDataProvider from 'commerce_data_provider/productDataProvider';
import { transformToBreadcrumbs } from 'commerce_data_provider/utils';
import { ProductAdapter, ProductPricingAdapter, ProductTaxAdapter } from 'commerce/productApi';
import { trackAddProductToCart, trackViewProduct } from 'commerce/activitiesApi';
import type { Breadcrumb } from 'commerce/breadcrumbs';
import { getProductDetailData } from './data/product.mock';
import { pricingProductMock } from './data/pricingProduct.mock';
import { getProductTaxesData, getProductTaxes } from './data/productTax.mock';
import { selectedVariantMock } from './data/selectedVariant.mock';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock(
    'commerce/productApi',
    () => ({
        ProductAdapter: mockCreateTestWireAdapter(),
        ProductPricingAdapter: mockCreateTestWireAdapter(),
        ProductTaxAdapter: mockCreateTestWireAdapter(),
    }),
    { virtual: true }
);

const selectors = {
    root: 'commerce_data_provider-product-data-provider',
};

const ProductTestAdapter = <typeof ProductAdapter & typeof TestWireAdapter>ProductAdapter;
const ProductPricingTestAdapter = <typeof ProductPricingAdapter & typeof TestWireAdapter>ProductPricingAdapter;
const ProductTaxTestAdapter = <typeof ProductTaxAdapter & typeof TestWireAdapter>ProductTaxAdapter;

/**
 * Create a product data provider component and append to the DOM
 */
const createComponentUnderTest = (): ProductDataProvider & HTMLElement => {
    const element = createElement(selectors.root, { is: ProductDataProvider });
    document.body.appendChild(element);
    return <ProductDataProvider & HTMLElement>element;
};

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
});

let mockAddItem = jest.fn();
let mockAddAllToCart = jest.fn();
let mockBreadcrumbsContextSetter: ((breadcrumbs?: Breadcrumb[]) => void) | undefined;

jest.mock('lightning/navigation', () => ({
    navigate: jest.fn(),
    NavigationContext: jest.fn(),
}));

jest.mock('experience/context', () => {
    const actual = jest.requireActual('experience/context');
    return Object.assign({}, actual, {
        createContextBoundary: jest.fn().mockImplementation(() => {
            mockBreadcrumbsContextSetter = jest.fn();
            return mockBreadcrumbsContextSetter;
        }),
    });
});

jest.mock(
    'commerce/activitiesApi',
    () => ({
        trackAddProductToCart: jest.fn(),
        trackViewProduct: jest.fn(),
    }),
    { virtual: true }
);

jest.mock(
    'commerce/cartApiInternal',
    () => ({
        addItemToCart: (): Promise<Record<string, unknown>> => mockAddItem(),
        addItemsToCart: (): Promise<Record<string, unknown>> => mockAddAllToCart(),
    }),
    { virtual: true }
);
describe('commerce_data_provider/productDataProvider', () => {
    describe('Data Retrieval', () => {
        it('fetches all loaded product detail, pricing data and tax data', async () => {
            const productId = '01txx0000006nQLAAY';
            const element = createComponentUnderTest();
            const product = getProductDetailData();
            element.recordId = productId;
            ProductTestAdapter.emit({ data: product, loaded: true });
            ProductPricingTestAdapter.emit({ data: pricingProductMock(), loaded: true });
            ProductTaxTestAdapter.emit({ data: getProductTaxesData(productId), loaded: true });
            await Promise.resolve();
            expect(JSON.stringify(element.getData())).toBe(
                JSON.stringify({
                    SelectedVariant: selectedVariantMock,
                    Details: product,
                    Pricing: pricingProductMock(),
                    Tax: getProductTaxes(productId),
                })
            );
        });

        it('fetches the product data for a pricing field', async () => {
            const element = createComponentUnderTest();
            ProductPricingTestAdapter.emit({ data: pricingProductMock(), loaded: true });
            await Promise.resolve();
            expect(element.getData()?.Pricing?.unitPrice).toBe('85.16186882970139');
        });

        it('Pricing data should be undefined if not loaded', async () => {
            const element = createComponentUnderTest();
            ProductPricingTestAdapter.emit({ data: pricingProductMock(), loaded: false });
            await Promise.resolve();
            expect(element.getData()?.Pricing).toBeUndefined();
        });

        it('Pricing data should be empty object if error occurs', async () => {
            const element = createComponentUnderTest();
            ProductPricingTestAdapter.emit({ data: undefined, loaded: true });
            await Promise.resolve();
            expect(element.getData()?.Pricing).toEqual({});
        });

        it('fetches the product data for a tax field', async () => {
            const productId = '01txx0000006nQLAAY';
            const element = createComponentUnderTest();
            element.recordId = productId;
            ProductTaxTestAdapter.emit({ data: getProductTaxesData(productId), loaded: true });
            await Promise.resolve();
            const taxLocaleType = element.getData()?.Tax?.taxLocaleType;
            expect(taxLocaleType).toBe('Gross');
        });

        it('Tax data should be undefined if not loaded', async () => {
            const productId = '01txx0000006nQLAAY';
            const element = createComponentUnderTest();
            element.recordId = productId;
            ProductTaxTestAdapter.emit({ data: getProductTaxesData(productId), loaded: false });
            await Promise.resolve();
            expect(element.getData()?.Tax).toBeUndefined();
        });

        it('Tax data should be empty object if error occurs', async () => {
            const productId = '01txx0000006nQLAAY';
            const element = createComponentUnderTest();
            element.recordId = productId;
            ProductTaxTestAdapter.emit({ data: undefined, loaded: true });
            await Promise.resolve();
            expect(element.getData()?.Tax).toEqual({});
        });

        it('fetches the product data for a detail field', async () => {
            const element = createComponentUnderTest();
            const product = getProductDetailData();
            ProductTestAdapter.emit({ data: product, loaded: true });
            await Promise.resolve();
            expect(element.getData()?.Details?.fields.Name).toBe('Oat Flakes');
        });

        it('Product detail data should be undefined if not loaded', async () => {
            const element = createComponentUnderTest();
            const product = getProductDetailData();
            ProductTestAdapter.emit({ data: product, loaded: false });
            await Promise.resolve();
            expect(element.getData()?.Details).toBeUndefined();
        });

        it('Product detail data should be empty object if error occurs', async () => {
            const element = createComponentUnderTest();
            ProductTestAdapter.emit({ data: undefined, loaded: true });
            await Promise.resolve();
            expect(element.getData()?.Details).toEqual({});
        });

        it('returns undefined when no product data is present for the field requested', () => {
            const element = createComponentUnderTest();
            expect(element.getData()?.Pricing?.unitPrice).toBeUndefined();
        });

        it('does not set productData when data from adapters is empty', async () => {
            const element = createComponentUnderTest();
            ProductTestAdapter.emit({ data: null, loaded: true });
            ProductPricingTestAdapter.emit({ data: null, loaded: true });
            ProductTaxTestAdapter.emit({ data: null, loaded: true });
            await Promise.resolve();
            expect(element.getData()?.Pricing?.unitPrice).toBeUndefined();
        });
    });

    describe('loading state', () => {
        it.each([
            {
                label: `should return true if all wire adapters are loaded`,
                adapters: [
                    [ProductTestAdapter, true],
                    [ProductPricingTestAdapter, true],
                    [ProductTaxTestAdapter, true],
                ],
            },
            {
                label: `should return false if no wire adapter is loaded`,
                adapters: [
                    [ProductTestAdapter, false],
                    [ProductPricingTestAdapter, false],
                    [ProductTaxTestAdapter, false],
                ],
            },
            {
                label: `should return false if only 'ProductAdapter' is loaded`,
                adapters: [
                    [ProductTestAdapter, true],
                    [ProductPricingTestAdapter, false],
                    [ProductTaxTestAdapter, false],
                ],
            },
            {
                label: `should return false if only 'ProductPricingAdapter' is loaded`,
                adapters: [
                    [ProductTestAdapter, false],
                    [ProductPricingTestAdapter, true],
                    [ProductTaxTestAdapter, false],
                ],
            },
            {
                label: `should return false if only 'ProductTaxAdapter' is loaded`,
                adapters: [
                    [ProductTestAdapter, false],
                    [ProductPricingTestAdapter, false],
                    [ProductTaxTestAdapter, true],
                ],
            },
            {
                label: `should return false if only 'ProductAdapter' and 'ProductPricingAdapter' are loaded`,
                adapters: [
                    [ProductTestAdapter, true],
                    [ProductPricingTestAdapter, true],
                    [ProductTaxTestAdapter, false],
                ],
            },
            {
                label: `should return false if only 'ProductAdapter' and 'ProductTaxAdapter' are loaded`,
                adapters: [
                    [ProductTestAdapter, true],
                    [ProductPricingTestAdapter, false],
                    [ProductTaxTestAdapter, true],
                ],
            },
            {
                label: `should return false if only 'ProductPricingAdapter' and 'ProductTaxAdapter' are loaded`,
                adapters: [
                    [ProductTestAdapter, false],
                    [ProductPricingTestAdapter, true],
                    [ProductTaxTestAdapter, true],
                ],
            },
        ])('$label', async ({ adapters }: { adapters: unknown[] }) => {
            const element = createComponentUnderTest();
            const expected = (<[TestWireAdapter, boolean][]>adapters).reduce(
                (result: boolean, [adapter, loaded]: [TestWireAdapter, boolean]) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (<any>adapter).emit({ data: null, loaded });
                    return result && loaded;
                },
                true
            );
            await Promise.resolve();
            expect(element.hasData()).toBe(expected);
        });
    });

    describe('tracking activity', () => {
        let element: ProductDataProvider & HTMLElement;
        beforeEach(() => {
            element = createComponentUnderTest();
            mockAddItem = jest.fn(() => Promise.resolve({})).mockName('mockAddItem');
            const product = getProductDetailData();
            ProductTestAdapter.emit({ data: product, loaded: true });
            ProductPricingTestAdapter.emit({
                data: pricingProductMock({
                    listPrice: '20',
                }),
                loaded: true,
            });
        });

        it('should call trackViewProduct on success of product api', () => {
            expect(trackViewProduct).toHaveBeenNthCalledWith(1, {
                id: '01tR0000000maWQIAY',
                sku: '0123456789',
            });
        });

        it('should call cart api, onSuccess hook and trackAddProductToCart api on success when product:addItemToCart action dispatched', async () => {
            const actionPromise = new Promise((resolve, reject) => {
                element.dispatchEvent(
                    new DataProviderActionEvent(
                        'product:addItemToCart',
                        {
                            quantity: '2',
                        },
                        {
                            onSuccess: resolve,
                            onError: reject,
                        }
                    )
                );
            });
            await expect(actionPromise).resolves.toEqual({});
            expect(trackAddProductToCart).toHaveBeenNthCalledWith(1, {
                quantity: '2',
                id: '01tR0000000maWQIAY',
                price: '85.16186882970139',
                sku: '0123456789',
                originalPrice: '20',
            });
        });

        it('should not trackAddProductToCart when the add to cart api fails', async () => {
            const expectedError = { errorCode: 'FAILED' };
            mockAddItem = jest.fn(() => Promise.reject(expectedError)).mockName('mockAddItem');
            // Mock console.error to prevent it from failing the test
            global.console.error = jest.fn();
            const actionPromise = new Promise((resolve, reject) => {
                element.dispatchEvent(
                    new DataProviderActionEvent(
                        'product:addItemToCart',
                        {
                            quantity: '2',
                        },
                        {
                            onSuccess: resolve,
                            onError: reject,
                        }
                    )
                );
            });
            await expect(actionPromise).rejects.toEqual(expectedError);
            expect(trackAddProductToCart).toHaveBeenCalledTimes(0);
        });
    });

    describe('Breadcrumbs', () => {
        it('should provide breadcrumbs to the contextual breadcrumbs adapters', async () => {
            // Verify that the context boundary gets created
            createComponentUnderTest();
            expect(createContextBoundary).toHaveBeenCalledTimes(1);
            expect(createContextBoundary).toHaveBeenCalledWith(expect.any(ProductDataProvider), expect.any(Function));
            await Promise.resolve();

            // Verify that updated product data leads to an update of the breadcrumbs context
            const data = getProductDetailData();
            ProductTestAdapter.emit({ data, loaded: true });
            await Promise.resolve();

            expect(mockBreadcrumbsContextSetter).toBeDefined();
            expect(mockBreadcrumbsContextSetter).toHaveBeenCalledTimes(1);
            expect(mockBreadcrumbsContextSetter).toHaveBeenCalledWith(
                transformToBreadcrumbs(data.primaryProductCategoryPath.path)
            );
        });
    });

    describe('Actions', () => {
        describe('product:addItemToCart', () => {
            let element: ProductDataProvider & HTMLElement;

            beforeEach(() => {
                element = createComponentUnderTest();
                mockAddItem = jest.fn(() => Promise.resolve({})).mockName('mockAddItem');
            });

            it('calls cart api and onSuccess hook on success when product:addItemToCart action dispatched', async () => {
                const actionPromise = new Promise((resolve, reject) => {
                    element.dispatchEvent(
                        new DataProviderActionEvent(
                            'product:addItemToCart',
                            {
                                quantity: '2',
                            },
                            {
                                onSuccess: resolve,
                                onError: reject,
                            }
                        )
                    );
                });
                await expect(actionPromise).resolves.toEqual({});
            });

            it('calls cart api and onError hook on addItemToCart failure when product:addItemToCart action dispatched', async () => {
                const expectedError = { errorCode: 'FAILED' };
                mockAddItem = jest.fn(() => Promise.reject(expectedError)).mockName('mockAddItem');

                // Mock console.error to prevent it from failing the test
                global.console.error = jest.fn();

                const actionPromise = new Promise((resolve, reject) => {
                    element.dispatchEvent(
                        new DataProviderActionEvent(
                            'product:addItemToCart',
                            {
                                quantity: '2',
                            },
                            {
                                onSuccess: resolve,
                                onError: reject,
                            }
                        )
                    );
                });
                await expect(actionPromise).rejects.toEqual(expectedError);
            });
        });

        describe('product:addItemsToCart', () => {
            let element: ProductDataProvider & HTMLElement;

            beforeEach(() => {
                element = createComponentUnderTest();
                mockAddAllToCart = jest.fn(() => Promise.resolve({})).mockName('mockAddAllToCart');
            });

            it('calls cart api and onSuccess hook on success when product:addItemsToCart action dispatched', async () => {
                const payload = { productId_1: 2, productId_2: 4 };
                const actionPromise = new Promise((resolve, reject) => {
                    element.dispatchEvent(
                        new DataProviderActionEvent(
                            'product:addItemsToCart',
                            {
                                payload,
                            },
                            {
                                onSuccess: resolve,
                                onError: reject,
                            }
                        )
                    );
                });
                await expect(actionPromise).resolves.toEqual({});
            });

            it('calls cart api and onError hook on addItemsToCart failure when product:addItemsToCart action dispatched', async () => {
                const expectedError = { errorCode: 'FAILED' };
                mockAddAllToCart = jest.fn(() => Promise.reject(expectedError)).mockName('mockAddAllToCart');

                // Mock console.error to prevent it from failing the test
                global.console.error = jest.fn();

                const actionPromise = new Promise((resolve, reject) => {
                    element.dispatchEvent(
                        new DataProviderActionEvent(
                            'product:addItemsToCart',
                            {
                                productId_1: 2,
                                productId_2: 4,
                            },
                            {
                                onSuccess: resolve,
                                onError: reject,
                            }
                        )
                    );
                });
                await expect(actionPromise).rejects.toEqual(expectedError);
            });
        });

        describe('product:variantChanged', () => {
            let element: ProductDataProvider & HTMLElement;

            const isValid = true;
            const options = ['blue', 'red'];

            beforeEach(() => {
                element = createComponentUnderTest();
                element.dispatchEvent(
                    new DataProviderActionEvent('product:variantChanged', {
                        isValid,
                        options,
                    })
                );
            });

            it('updates variant in case it has changed', () => {
                expect(element.getData()?.SelectedVariant.isValid).toBe(isValid);
                expect(element.getData()?.SelectedVariant.options).toEqual(options);
            });

            it('should do nothing in case variant has not changed', () => {
                element.dispatchEvent(
                    new DataProviderActionEvent('product:variantChanged', {
                        isValid,
                        options,
                    })
                );

                expect(element.getData()?.SelectedVariant.isValid).toBe(isValid);
                expect(element.getData()?.SelectedVariant.options).toEqual(options);
            });
        });

        describe('product:selectedQuantityChanged', () => {
            let element: ProductDataProvider & HTMLElement;
            it('should update quantity passed to pricing wireadaptor', async () => {
                const quantity = 3;
                element = createComponentUnderTest();
                element.dispatchEvent(
                    new DataProviderActionEvent('product:selectedQuantityChanged', {
                        quantity,
                    })
                );
                ProductPricingTestAdapter.emit({ data: pricingProductMock(), loaded: true });
                await Promise.resolve();
                expect(ProductPricingTestAdapter.getLastConfig()).toStrictEqual({
                    productId: undefined,
                    quantity: 3,
                });
            });
        });
    });
});
