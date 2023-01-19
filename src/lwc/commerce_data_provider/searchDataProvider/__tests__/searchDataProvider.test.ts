import { createElement } from 'lwc';
import type { TestWireAdapter } from '@salesforce/wire-service-jest-util';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { CurrentPageReference } from 'lightning/navigation';
import { createContextBoundary } from 'experience/context';
import { DataProviderActionEvent } from 'experience/dataProvider';
import type { Breadcrumb } from 'commerce/breadcrumbs';
import { ProductCategoryPathAdapter, ProductSearchAdapter } from 'commerce/productApi';
import { ProductPricingCollectionAdapter } from 'commerce/productApiInternal';
import {
    getProductSearchData,
    mockProductCategoryPathData,
    mockSearchResultsData,
    mockSearchResultsDataDefault,
    mockSortRulesSearchResultsData,
    mockProductPricingData,
    simpleSearchResultsData,
} from './data/search.mock';
import type {
    ProductSearchRefinement,
    ProductSearchResultsData,
    ProductSearchResultSummary,
} from 'commerce/productApiInternal';
import type { SearchSortEvent, SortRuleData, SortRulesSearchResultsData } from 'commerce/searchApiInternal';
import { SortRulesSearchAdapter } from 'commerce/searchApiInternal';
import { transformToBreadcrumbs } from 'commerce_data_provider/utils';
import SearchDataProvider from 'commerce_data_provider/searchDataProvider';

let mockAddItem = jest.fn();

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });
jest.mock('lightning/navigation', () => ({
    navigate: jest.fn(),
    NavigationContext: mockCreateTestWireAdapter(),
    CurrentPageReference: mockCreateTestWireAdapter(),
}));

jest.mock(
    '@salesforce/label/B2B_Search_Results.searchResults',
    () => ({ __esModule: true, default: 'Search Results' }),
    { virtual: true }
);

jest.mock('commerce/productApi', () =>
    Object.assign({}, jest.requireActual('commerce/productApi'), {
        ProductSearchAdapter: mockCreateTestWireAdapter(),
        ProductCategoryPathAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock('lightning/recordUtils', () =>
    Object.assign({}, jest.requireActual('lightning/recordUtils'), {
        normalizeRecordId(id: string): string {
            return id;
        },
    })
);

jest.mock(
    'commerce/cartApiInternal',
    () => ({
        addItemToCart: (): Promise<Record<string, unknown>> => mockAddItem(),
    }),
    { virtual: true }
);

jest.mock('commerce/searchApiInternal', () =>
    Object.assign({}, jest.requireActual('commerce/searchApiInternal'), {
        SortRulesSearchAdapter: mockCreateTestWireAdapter(),
    })
);

let mockBreadcrumbsContextSetter: ((breadcrumbs?: Breadcrumb[]) => void) | undefined;

jest.mock('experience/context', () => {
    const actual = jest.requireActual('experience/context');
    return Object.assign({}, actual, {
        createContextBoundary: jest.fn().mockImplementation(() => {
            mockBreadcrumbsContextSetter = jest.fn();
            return mockBreadcrumbsContextSetter;
        }),
    });
});

const selectors = {
    root: 'commerce_data_provider-search-data-provider',
};

function createComponentUnderTest(): SearchDataProvider & HTMLElement {
    const element = createElement(selectors.root, { is: SearchDataProvider });
    document.body.appendChild(element);
    return <SearchDataProvider & HTMLElement>element;
}

jest.mock('commerce/productApiInternal', () =>
    Object.assign({}, jest.requireActual('commerce/productApiInternal'), {
        ProductPricingCollectionAdapter: mockCreateTestWireAdapter(),
    })
);

const ProductSearchTestAdapter = <typeof ProductSearchAdapter & typeof TestWireAdapter>ProductSearchAdapter;
const ProductCategoryPathTestAdapter = <typeof ProductCategoryPathAdapter & typeof TestWireAdapter>(
    ProductCategoryPathAdapter
);
const SortRulesSearchTestAdapter = <typeof SortRulesSearchAdapter & typeof TestWireAdapter>SortRulesSearchAdapter;
const CurrentPageReferenceTest = <typeof CurrentPageReference & typeof TestWireAdapter>CurrentPageReference;
const ProductPricingCollectionTestAdapter = <typeof ProductPricingCollectionAdapter & typeof TestWireAdapter>(
    ProductPricingCollectionAdapter
);

describe('commerce_data_provider/searchDataProvider', () => {
    let element: SearchDataProvider & HTMLElement;

    beforeEach(() => {
        element = createElement('commerce_data_provider-search-data-provider', {
            is: SearchDataProvider,
        });
        document.body.appendChild(element);
    });

    // Clean up after each test
    afterEach(() => {
        jest.clearAllMocks();
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('Data Retrieval', () => {
        it('fetches all loaded product search results for search term', async () => {
            element.searchTerm = 'test';
            const results: ProductSearchResultsData = getProductSearchData();
            ProductSearchTestAdapter.emit({ data: results, loaded: true });
            await Promise.resolve();
            const expectedResultData = Object.assign({}, mockSearchResultsData, {
                description: 'B2B_Search_Results_Tiles.multipleResultSearchHeaderWithIndex',
            });
            expect(element.getData()).toHaveProperty<ProductSearchResultSummary>('Results', expectedResultData);
        });

        it('fetches all loaded product search results for category id', async () => {
            element.categoryId = 'primaryCategory';
            const results = getProductSearchData();
            ProductSearchTestAdapter.emit({ data: results, loaded: true });
            await Promise.resolve();
            expect(element.getData()).toHaveProperty<ProductSearchResultSummary>('Results', mockSearchResultsData);
        });

        it('fetches empty object if error occurs', async () => {
            element.searchTerm = 'xyz';
            ProductSearchTestAdapter.emit({ data: undefined, loaded: true });
            await Promise.resolve();
            expect(element.getData()?.Results).toEqual(mockSearchResultsDataDefault);
        });

        it('should be undefined if not loaded', async () => {
            element.searchTerm = 'xyz';
            ProductSearchTestAdapter.emit({ data: undefined, loaded: false });
            await Promise.resolve();
            expect(element.getData()?.Results).toEqual(mockSearchResultsDataDefault);
        });

        it('should update if currentPageNumber has changed', async () => {
            const currentPageNumber = 2;
            element['currentPageNumber'] = currentPageNumber;
            element.dispatchEvent(
                new DataProviderActionEvent('search:pageChange', {
                    currentPageNumber,
                })
            );
            await Promise.resolve();
            expect(element['currentPageNumber']).toBe(currentPageNumber);
        });

        describe('results description', () => {
            it('result description should be set when search is not loaded', async () => {
                // When
                ProductSearchTestAdapter.emit({ data: undefined, loaded: false });
                await Promise.resolve();

                // Then
                expect(element.getData()).toHaveProperty(
                    'Results.description',
                    'B2B_Search_Results_Tiles.multipleCategoryHeader'
                );
            });

            it('result description should store the generated search result title', async () => {
                // Given
                const sortRuleId = '0qUxx0000000001';
                const results = getProductSearchData();
                element.dispatchEvent(
                    new DataProviderActionEvent<SearchSortEvent>('search:changeSortOrder', { sortRuleId })
                );

                // When
                ProductSearchTestAdapter.emit({ data: results, loaded: true });
                await Promise.resolve();

                // Then
                expect(element.getData()).toHaveProperty(
                    'Results.description',
                    'B2B_Search_Results_Tiles.multipleResultSearchHeaderShortWithIndex'
                );
            });
        });

        describe('results category name', () => {
            it('should have the category name received on the search results', async () => {
                // Given
                const results = Object.assign({}, getProductSearchData(), {
                    categories: { category: { id: '0ZGR00000000XqpOAE', name: 'Cereal' } },
                });

                // When
                ProductSearchTestAdapter.emit({ data: results, loaded: true });
                await Promise.resolve();

                // Then
                expect(element.getData()).toHaveProperty('Results.categoryName', 'Cereal');
            });

            it('should be undefined when category name is undefined', async () => {
                // Given
                const results = Object.assign({}, getProductSearchData(), {
                    categories: { category: { id: undefined, name: undefined } },
                });

                // When
                ProductSearchTestAdapter.emit({ data: results, loaded: true });
                await Promise.resolve();

                // Then
                expect(element.getData()).toHaveProperty('Results.categoryName');
                expect(element.getData()?.Results?.categoryName).toBeUndefined();
            });
        });
    });

    describe('loading state', () => {
        it.each([
            {
                label: `should return true if all wire adapters are loaded`,
                adapters: [
                    [ProductSearchTestAdapter, true],
                    [SortRulesSearchTestAdapter, true],
                    [ProductPricingCollectionTestAdapter, true],
                ],
            },
            {
                label: `should return false if no wire adapter is loaded`,
                adapters: [
                    [ProductSearchTestAdapter, false],
                    [SortRulesSearchTestAdapter, false],
                    [ProductPricingCollectionTestAdapter, false],
                ],
            },
            {
                label: `should return false if only 'ProductSearchAdapter' adapter is loaded`,
                adapters: [
                    [ProductSearchTestAdapter, true],
                    [SortRulesSearchTestAdapter, false],
                    [ProductPricingCollectionTestAdapter, false],
                ],
            },
            {
                label: `should return false if only 'SortRulesSearchAdapter' adapter is loaded`,
                adapters: [
                    [ProductSearchTestAdapter, false],
                    [SortRulesSearchTestAdapter, true],
                    [ProductPricingCollectionTestAdapter, false],
                ],
            },
            {
                label: `should return false if only 'ProductPricingCollectionAdapter' adapter is loaded`,
                adapters: [
                    [ProductSearchTestAdapter, false],
                    [SortRulesSearchTestAdapter, false],
                    [ProductPricingCollectionTestAdapter, true],
                ],
            },
            {
                label: `should return false if only 'ProductSearchAdapter' and 'SortRulesSearchAdapter' adapter are loaded`,
                adapters: [
                    [ProductSearchTestAdapter, true],
                    [SortRulesSearchTestAdapter, true],
                    [ProductPricingCollectionTestAdapter, false],
                ],
            },
            {
                label: `should return false if only 'ProductSearchAdapter' and 'ProductPricingCollectionAdapter' adapter are loaded`,
                adapters: [
                    [ProductSearchTestAdapter, true],
                    [SortRulesSearchTestAdapter, false],
                    [ProductPricingCollectionTestAdapter, true],
                ],
            },
            {
                label: `should return false if only 'SortRulesSearchAdapter' and 'ProductPricingCollectionAdapter' adapter are loaded`,
                adapters: [
                    [ProductSearchTestAdapter, false],
                    [SortRulesSearchTestAdapter, true],
                    [ProductPricingCollectionTestAdapter, true],
                ],
            },
        ])('$label', async ({ adapters }: { adapters: unknown[] }) => {
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

        it('should update if filter properties has changed', () => {
            const refinements: ProductSearchRefinement[] = [],
                categoryId = '',
                page = 3,
                mruFacet = {},
                cachedCategoryTree = {};
            element['refinements'] = refinements;
            element.categoryId = categoryId;
            element['currentPageNumber'] = page;
            element['mruFacet'] = mruFacet;
            element['cachedCategoryTree'] = cachedCategoryTree;
            element.dispatchEvent(
                new DataProviderActionEvent('search:filterChange', {
                    refinements,
                    categoryId,
                    page,
                    mruFacet,
                    cachedCategoryTree,
                })
            );
            return Promise.resolve().then(() => {
                expect(element['refinements']).toBe(refinements);
                expect(element.categoryId).toBe(categoryId);
                expect(element['currentPageNumber']).toBe(page);
                expect(element['mruFacet']).toBe(mruFacet);
                expect(element['cachedCategoryTree']).toBe(cachedCategoryTree);
            });
        });

        it('should update if Root category filter properties is selected', () => {
            const categoryId = 'ROOT_CATEGORY_ID';
            element.categoryId = undefined;
            element.dispatchEvent(
                new DataProviderActionEvent('search:filterChange', {
                    categoryId,
                })
            );
            return Promise.resolve().then(() => {
                expect(element.categoryId).toBeUndefined();
            });
        });

        it('should update if filter properties is undefined', () => {
            element.dispatchEvent(new DataProviderActionEvent('search:filterChange', {}));
            return Promise.resolve().then(() => {
                expect(element['refinements']).toBeUndefined();
                expect(element.categoryId).toBe('');
                expect(element['currentPageNumber']).toBeUndefined();
                expect(element['mruFacet']).toBeUndefined();
                expect(element['cachedCategoryTree']).toBeUndefined();
            });
        });

        it('should update if clear filter properties has changed', () => {
            element['refinements'] = [];
            element.categoryId = '';
            element['currentPageNumber'] = 1;
            element['mruFacet'] = {};
            element['cachedCategoryTree'] = {};
            element.dispatchEvent(new DataProviderActionEvent('search:clearFilters'));
            return Promise.resolve().then(() => {
                expect(element['refinements']).toStrictEqual([]);
                expect(element.categoryId).toBe('');
                expect(element['currentPageNumber']).toBe(1);
                expect(element['mruFacet']).toStrictEqual({});
                expect(element['cachedCategoryTree']).toStrictEqual({});
            });
        });
    });

    describe('search:addItemToCart', () => {
        beforeEach(() => {
            element = createComponentUnderTest();
            mockAddItem = jest.fn(() => Promise.resolve({})).mockName('mockAddItem');
        });

        it('calls cart api and onSuccess hook on success when search:addItemToCart action dispatched', async () => {
            const actionPromise = new Promise((resolve, reject) => {
                element.dispatchEvent(
                    new DataProviderActionEvent(
                        'search:addItemToCart',
                        {
                            productId: 'abc',
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

        it('reports an error when an item cannot be added to the cart', async () => {
            const expectedError = { errorCode: 'FAILED' };
            mockAddItem = jest.fn(() => Promise.reject(expectedError)).mockName('mockAddItem');

            // Mock console.error to prevent it from failing the test
            global.console.error = jest.fn();

            const actionPromise = new Promise((resolve, reject) => {
                element.dispatchEvent(
                    new DataProviderActionEvent(
                        'search:addItemToCart',
                        {
                            productId: 'abc',
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

    describe('search:changeSortOrder', () => {
        it('should be undefined when the current sort rule id is empty', async () => {
            // Given
            const results = getProductSearchData();

            // When
            element.dispatchEvent(
                new DataProviderActionEvent<SearchSortEvent>('search:changeSortOrder', { sortRuleId: '' })
            );
            ProductSearchTestAdapter.emit({ data: results, loaded: true });
            await Promise.resolve();

            // Then
            const data = Object.assign({}, element.getData());
            expect(data.SortRules).toHaveProperty('currentSortRuleId');
            expect(data.SortRules?.currentSortRuleId).toBeUndefined();
        });

        [undefined, '0qUxx0000000001'].forEach((sortRuleId?: string): void => {
            it(`should update the current sort rule id to '${sortRuleId}'`, async () => {
                // Given
                const results = getProductSearchData();

                // When
                element.dispatchEvent(
                    new DataProviderActionEvent<SearchSortEvent>('search:changeSortOrder', { sortRuleId })
                );
                ProductSearchTestAdapter.emit({ data: results, loaded: true });
                await Promise.resolve();

                // Then
                const data = Object.assign({}, element.getData());
                expect(data.SortRules).toHaveProperty('currentSortRuleId', sortRuleId);
            });
        });
    });

    describe('search pagination data', () => {
        it('should be filled with the results pagination data', async () => {
            // Given
            const results = Object.assign({}, getProductSearchData());
            element.dispatchEvent(new DataProviderActionEvent('search:filterChange', { page: 1 }));

            // When
            ProductSearchTestAdapter.emit({ data: results, loaded: true });
            await Promise.resolve();

            // Then
            expect(element.getData()).toHaveProperty('Pagination', {
                totalPages: 2,
                currentPage: 1,
                startIndex: 1,
                endIndex: 20,
            });
        });
    });

    describe('sort rules', () => {
        it('fetches all sort rules', async () => {
            const expectedResult: SortRulesSearchResultsData = Object.assign({}, mockSortRulesSearchResultsData);
            SortRulesSearchTestAdapter.emit({ data: mockSortRulesSearchResultsData, loaded: true });
            await Promise.resolve();
            expect(element.getData()).toHaveProperty<SortRuleData[] | null>(
                'SortRules.rules',
                expectedResult.sortRules
            );
        });

        it('should be empty array when is loaded but no results are returned', async () => {
            SortRulesSearchTestAdapter.emit({ data: null, loaded: true });
            await Promise.resolve();
            expect(element.getData()).toHaveProperty<SortRuleData[]>('SortRules.rules', []);
        });

        it('should be null when an error occurs', async () => {
            SortRulesSearchTestAdapter.emit({ data: undefined, loaded: false, error: {} });
            await Promise.resolve();
            expect(element.getData()).toHaveProperty<SortRuleData[] | null>('SortRules.rules', null);
        });

        it('should be undefined if not loaded', async () => {
            SortRulesSearchTestAdapter.emit({ data: undefined, loaded: false });
            await Promise.resolve();
            expect(element.getData()).toHaveProperty<SortRuleData[]>('SortRules.rules', undefined);
        });
    });

    describe('product pricing', () => {
        it('fetches product pricing', async () => {
            const results = {
                locale: '',
                filtersPanel: {
                    facets: [],
                    categories: {
                        ancestorCategories: [],
                        selectedCategory: {},
                    },
                },
                cardCollection: [
                    {
                        id: '01txx0000006i63AAA',
                        name: 'Java Black Coffee Press',
                        image: { url: '', alternateText: '' },
                        prices: {
                            currencyIsoCode: 'USD',
                            listingPrice: '2843',
                            negotiatedPrice: '2199',
                            isLoading: false,
                        },
                        productClass: null,
                        purchaseQuantityRule: null,
                        variationAttributeSet: null,
                    },
                ],
                description: 'B2B_Search_Results_Tiles.multipleCategoryHeader',
                categoryName: undefined,
            };
            ProductSearchTestAdapter.emit({ data: simpleSearchResultsData, loaded: true });
            await Promise.resolve();
            ProductPricingCollectionTestAdapter.emit({ data: mockProductPricingData, loaded: true });
            await Promise.resolve();
            expect(element.getData()).toHaveProperty('Results', results);
        });

        it('should not have pricing data when no products', async () => {
            const results = {
                ...simpleSearchResultsData,
                productsPage: {
                    products: undefined,
                },
            };
            ProductSearchTestAdapter.emit({ data: results, loaded: true });
            await Promise.resolve();
            ProductPricingCollectionTestAdapter.emit({ data: mockProductPricingData, loaded: true });
            await Promise.resolve();
            expect(element.getData()).not.toHaveProperty('ProductPricing');
        });

        it('should not have pricing results is undefined', async () => {
            ProductSearchTestAdapter.emit({ data: undefined, loaded: true });
            await Promise.resolve();
            ProductPricingCollectionTestAdapter.emit({ data: mockProductPricingData, loaded: true });
            await Promise.resolve();
            expect(element.getData()).not.toHaveProperty('ProductPricing');
        });

        it('should not have pricing when pricing results are empty', async () => {
            const results = {
                locale: '',
                filtersPanel: {
                    facets: [],
                    categories: {
                        ancestorCategories: [],
                        selectedCategory: {},
                    },
                },
                cardCollection: [
                    {
                        id: '01txx0000006i63AAA',
                        name: 'Java Black Coffee Press',
                        image: { url: '', alternateText: '' },
                        prices: {
                            isLoading: false,
                        },
                        productClass: null,
                        purchaseQuantityRule: null,
                        variationAttributeSet: null,
                    },
                ],
                description: 'B2B_Search_Results_Tiles.multipleCategoryHeader',
                categoryName: undefined,
            };
            ProductSearchTestAdapter.emit({ data: simpleSearchResultsData, loaded: true });
            await Promise.resolve();
            ProductPricingCollectionTestAdapter.emit({ data: { pricingLineItemResults: undefined }, loaded: true });
            await Promise.resolve();
            expect(element.getData()).toHaveProperty('Results', results);
        });
    });

    describe('Breadcrumbs', () => {
        describe('Category Page', () => {
            it('should provide breadcrumbs to the contextual breadcrumbs adapters', async () => {
                // Verify that the context boundary gets created
                expect(createContextBoundary).toHaveBeenCalledTimes(1);
                expect(createContextBoundary).toHaveBeenCalledWith(
                    expect.any(SearchDataProvider),
                    expect.any(Function)
                );
                await Promise.resolve();

                // Verify that updated product category path data leads to an update of the breadcrumbs context
                ProductCategoryPathTestAdapter.emit({
                    data: mockProductCategoryPathData,
                    error: undefined,
                    loaded: true,
                    loading: false,
                });
                await Promise.resolve();

                expect(mockBreadcrumbsContextSetter).toBeDefined();
                expect(mockBreadcrumbsContextSetter).toHaveBeenCalledTimes(1);
                expect(mockBreadcrumbsContextSetter).toHaveBeenCalledWith(
                    transformToBreadcrumbs(mockProductCategoryPathData.path)
                );
            });

            it('should not provide breadcrumbs to the contextual breadcrumbs adapters', async () => {
                expect(createContextBoundary).toHaveBeenCalledTimes(1);
                expect(createContextBoundary).toHaveBeenCalledWith(
                    expect.any(SearchDataProvider),
                    expect.any(Function)
                );
                await Promise.resolve();

                ProductCategoryPathTestAdapter.emit({
                    data: undefined,
                    error: undefined,
                    loaded: true,
                    loading: false,
                });
                await Promise.resolve();

                expect(mockBreadcrumbsContextSetter).toBeDefined();
                expect(mockBreadcrumbsContextSetter).not.toHaveBeenCalled();
            });
        });

        describe('Search Page', () => {
            it('should provide breadcrumbs to the contextual breadcrumbs adapters', async () => {
                // Verify that the context boundary gets created
                expect(createContextBoundary).toHaveBeenCalledTimes(1);
                expect(createContextBoundary).toHaveBeenCalledWith(
                    expect.any(SearchDataProvider),
                    expect.any(Function)
                );
                await Promise.resolve();

                // Verify that an update of the current page reference to the search page leads to an update of the breadcrumbs context
                CurrentPageReferenceTest.emit({
                    type: 'standard__search',
                    state: {
                        term: '',
                    },
                });
                await Promise.resolve();

                expect(mockBreadcrumbsContextSetter).toBeDefined();
                expect(mockBreadcrumbsContextSetter).toHaveBeenCalledTimes(1);
                expect(mockBreadcrumbsContextSetter).toHaveBeenCalledWith([
                    {
                        label: 'Search Results',
                        pageReference: {
                            type: 'standard__search',
                            state: {
                                term: '',
                            },
                        },
                    },
                ]);
            });

            it('should not provide breadcrumbs to the contextual breadcrumbs adapters', async () => {
                expect(createContextBoundary).toHaveBeenCalledTimes(1);
                expect(createContextBoundary).toHaveBeenCalledWith(
                    expect.any(SearchDataProvider),
                    expect.any(Function)
                );
                await Promise.resolve();

                CurrentPageReferenceTest.emit({
                    type: 'comm__namedPage',
                    attributes: {
                        name: 'Home',
                    },
                });
                await Promise.resolve();

                expect(mockBreadcrumbsContextSetter).toBeDefined();
                expect(mockBreadcrumbsContextSetter).not.toHaveBeenCalled();
            });
        });
    });
});
