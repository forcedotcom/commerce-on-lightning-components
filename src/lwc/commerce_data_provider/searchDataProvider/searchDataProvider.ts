import { api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import type { PageReference } from 'types/common';
import { createContextBoundary, createContextProvider } from 'experience/context';
import { isPlainObject } from 'experience/util';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import DataProvider, { registerAction } from 'experience/dataProvider';
import searchResultsLabel from '@salesforce/label/B2B_Search_Results.searchResults';
import type { Breadcrumb } from 'commerce/breadcrumbs';
import { BreadcrumbsAdapter } from 'commerce_builder/breadcrumbs';
import type { ProductCategoryPathData } from 'commerce/productApi';
import { ProductCategoryPathAdapter, ProductSearchAdapter } from 'commerce/productApi';
import type { AddItemToCartActionPayload, PageChangeActionPayload, SearchData } from './types';
import type {
    PricingResultLineItemData,
    ProductPricingCollectionResultData,
    ProductSearchQuery,
    ProductSearchRefinement,
    ProductSearchResultsData,
    ProductSearchResultSummary,
} from 'commerce/productApiInternal';
import { ProductPricingCollectionAdapter } from 'commerce/productApiInternal';
import type {
    SearchFacet,
    SearchFiltersActionPayload,
    SortRuleData,
    SortRulesSearchResultsData,
    SearchSortEvent,
} from 'commerce/searchApiInternal';
import {
    SortRulesSearchAdapter,
    transformData,
    transformDataToSearchResultsPagination,
} from 'commerce/searchApiInternal';
import { addItemToCart } from 'commerce/cartApi';
import { isDataAvailable, transformToBreadcrumbs, updateDataAvailable } from 'commerce_data_provider/utils';
import { normalizeRecordId } from 'lightning/recordUtils';

const breadcrumbsContextProvider = createContextProvider(BreadcrumbsAdapter);
const DEFAULT_SEARCH_PAGE = 1;
const SEARCH_PAGE_REF: PageReference = {
    type: 'standard__search',
    state: {
        term: '',
    },
};
const SEARCH_PAGE_BREADCRUMBS: Breadcrumb[] = [
    {
        label: searchResultsLabel,
        pageReference: SEARCH_PAGE_REF,
    },
];

export default class SearchDataProvider extends DataProvider {
    static renderMode = 'light';

    /**
     * Data container
     */
    private data: SearchData = {};

    private readonly setBreadcrumbs: (breadcrumbs?: Breadcrumb[]) => void;
    private _searchQuery: ProductSearchQuery = {};
    private _searchTerm = '';
    private _categoryId: string | undefined = '';
    protected refinements: ProductSearchRefinement[] = [];
    protected currentPageNumber = DEFAULT_SEARCH_PAGE;
    protected sortRuleId?: string = undefined;
    protected mruFacet = {};
    protected cachedCategoryTree = {};
    private _productIds?: string[];

    @api sfdcExpressionKey!: string;

    /**
     * The search term url parameter.
     */
    @api
    get searchTerm(): string {
        return this._searchTerm;
    }
    set searchTerm(term: string) {
        this._searchTerm = term;
        this.updateSearchQuery();
    }

    /**
     * The category ID url parameter.
     */
    @api
    get categoryId(): string | undefined {
        return this._categoryId;
    }
    set categoryId(val: string | undefined) {
        this._categoryId = val;
        this.updateSearchQuery();
    }

    @api categoryPathId?: string;

    @api
    getData(): SearchData {
        return this.data;
    }

    @api
    hasData(): boolean {
        return isDataAvailable(this);
    }

    @wire(CurrentPageReference)
    private wiredPageReference(pageRef?: PageReference): void {
        if (pageRef?.type === SEARCH_PAGE_REF.type) {
            // Provide breadcrumbs to all consumers of the contextual breadcrumbs adapter
            this.setBreadcrumbs(SEARCH_PAGE_BREADCRUMBS);
        }
    }

    /**
     * get the list of products from the search results,
     * assign it to _productIds which will be used in wireProductPricingCollectionResults
     */
    updateProductIds(searchResult: ProductSearchResultsData): void {
        this._productIds = (searchResult.productsPage.products ?? [])
            .map((psd) => ({ id: psd.id }))
            .filter((p) => p.id !== null)
            .map((p) => p.id) as string[];
    }

    @wire(ProductSearchAdapter, {
        searchQuery: '$_searchQuery',
    })
    private wiredSearchResults({ data, loaded }: StoreAdapterCallbackEntry<ProductSearchResultsData>): void {
        updateDataAvailable(this, loaded, 'Results');

        const results = loaded ? data : undefined;
        this.data = {
            ...this.data,
            Results: transformData(
                this._searchQuery,
                results,
                this.refinements,
                <SearchFacet>this.mruFacet,
                this.cachedCategoryTree
            ),
            Pagination: transformDataToSearchResultsPagination(this._searchQuery, results),
            SortRules: Object.assign({}, this.data?.SortRules, { currentSortRuleId: this.sortRuleId || undefined }),
        };
        if (results?.productsPage) {
            this.updateProductIds(<ProductSearchResultsData>results);
        }

        this.updateComponents();
    }

    /**
     * update result with products' prices stored in pricesData
     * @param result : original search results without prices
     * @param pricesData : prices data for products in the result
     */
    public searchResultsNormalizedWithPricing(
        results: ProductSearchResultSummary,
        pricesData: ProductPricingCollectionResultData
    ): ProductSearchResultSummary {
        const pricesMap = this.computePricesMap(pricesData?.pricingLineItemResults);
        const res = { ...results };

        res.cardCollection = res.cardCollection.map((item) => {
            const product = Object.assign({}, item);
            if (product.id) {
                const id = product.id;
                product.prices.listingPrice = pricesMap[id]?.listPrice;
                product.prices.negotiatedPrice = pricesMap[id]?.unitPrice;
                product.prices.currencyIsoCode = pricesData?.currencyIsoCode;
                product.prices.isLoading = false;
            }
            return product;
        });
        return res;
    }

    /**
     * Computes a dictionary of prices with product ids as keys.
     * @param {PricingResultLineItemData[]} prices
     * @returns {Object} - a map of product prices with product id as keys
     */
    computePricesMap(
        prices: PricingResultLineItemData[] | undefined | null
    ): Record<string, PricingResultLineItemData> {
        const pricesMap = Object.create(null);

        (prices || []).forEach((price) => {
            const productId = normalizeRecordId(price.productId);
            pricesMap[productId] = price;
        });
        return pricesMap;
    }

    @wire(ProductPricingCollectionAdapter, {
        productIds: '$_productIds',
    })
    private wireProductPricingCollectionResults({
        data,
        loaded,
    }: StoreAdapterCallbackEntry<ProductPricingCollectionResultData>): void {
        //results has products' prices information that needs to be integrated into this.data/Results
        updateDataAvailable(this, loaded, 'ProductPricing');

        if (loaded && data) {
            const newSearchResult = this.searchResultsNormalizedWithPricing(
                <ProductSearchResultSummary>this.data.Results,
                <ProductPricingCollectionResultData>data
            );

            this.data = {
                ...this.data,
                Results: newSearchResult,
            };
        }

        this.updateComponents();
    }

    /**
     * Wire callback processor for the Sort Rules Search.
     * Exposes the returned {@link SortRulesSearchResultsData.sortRules} on {@link SearchData.SortRules}
     * @param param0 Callback data
     */
    @wire(SortRulesSearchAdapter)
    private wiredSortRules({ data, loaded, error }: StoreAdapterCallbackEntry<SortRulesSearchResultsData>): void {
        updateDataAvailable(this, loaded, 'SortRules');

        let sortRules: SortRuleData[] | undefined | null;
        if (error) {
            sortRules = null;
        } else if (loaded) {
            sortRules = data?.sortRules || [];
        }
        this.data = {
            ...this.data,
            SortRules: {
                rules: sortRules,
                currentSortRuleId: this.sortRuleId || undefined,
            },
        };
        this.updateComponents();
    }

    @wire(ProductCategoryPathAdapter, { categoryId: '$categoryPathId' }) // eslint-disable-line @lwc/lwc/no-unknown-wire-adapters
    private wiredCategoryPath({ data }: StoreAdapterCallbackEntry<ProductCategoryPathData>): void {
        // Provide breadcrumbs to all consumers of the contextual breadcrumbs adapter
        isPlainObject(data) && this.setBreadcrumbs(transformToBreadcrumbs(data.path));
    }

    constructor() {
        super();
        this.setBreadcrumbs = createContextBoundary(this, breadcrumbsContextProvider);
    }

    protected updateSearchQuery(): void {
        this._searchQuery = {
            searchTerm: this.searchTerm,
            categoryId: this.categoryId,
            refinements: this.refinements,
            page: this.currentPageNumber - 1,
            includePrices: false,
            ...(this.sortRuleId && { sortRuleId: this.sortRuleId }),
        };
    }

    /**
     * @type Promise<Record<string, unknown>
     *
     * @param {string} productId - the ID of the product being added
     * @param {number} quantity - the quantity of the product being added
     * @private
     */
    protected handleAddItemToCart(productId: string, quantity: number): Promise<Record<string, unknown>> {
        return addItemToCart(productId, quantity);
    }
}

registerAction(
    SearchDataProvider,
    'search:pageChange',
    function (this: SearchDataProvider, { currentPageNumber }: PageChangeActionPayload): void {
        this.currentPageNumber = currentPageNumber;
        this.updateSearchQuery();
    }
);

registerAction(
    SearchDataProvider,
    'search:changeSortOrder',
    function (this: SearchDataProvider, { sortRuleId }: SearchSortEvent): void {
        this.sortRuleId = sortRuleId;
        this.updateSearchQuery();
    }
);

registerAction(
    SearchDataProvider,
    'search:filterChange',
    function (
        this: SearchDataProvider,
        { refinements, categoryId, page, mruFacet, cachedCategoryTree }: SearchFiltersActionPayload
    ): void {
        this.refinements = refinements ?? this.refinements;
        this.categoryId = categoryId === 'ROOT_CATEGORY_ID' ? undefined : categoryId ?? this.categoryId;
        this.currentPageNumber = page ?? this.currentPageNumber;
        this.mruFacet = mruFacet ?? this.mruFacet;
        this.cachedCategoryTree = cachedCategoryTree ?? this.cachedCategoryTree;
        this.updateSearchQuery();
    }
);

registerAction(SearchDataProvider, 'search:clearFilters', function (this: SearchDataProvider): void {
    this.refinements = [];
    this.categoryId = '';
    this.currentPageNumber = DEFAULT_SEARCH_PAGE;
    this.mruFacet = {};
    this.cachedCategoryTree = {};
    this.updateSearchQuery();
});

registerAction(
    SearchDataProvider,
    'search:addItemToCart',
    function (
        this: SearchDataProvider,
        { productId, quantity }: AddItemToCartActionPayload
    ): Promise<Record<string, unknown>> {
        return this.handleAddItemToCart(productId, quantity);
    }
);

export type { AddItemToCartActionPayload } from './types';
