import type { ProductSearchResultSummary } from 'commerce/productApiInternal';
import type { SortRuleResult, SearchResultsPagination } from 'commerce/searchApiInternal';

export interface SearchData {
    Results?: ProductSearchResultSummary | Record<string, never>;
    SortRules?: SortRuleResult;
    Pagination?: SearchResultsPagination;
}

export interface PageChangeActionPayload {
    currentPageNumber: number;
}

export declare interface AddItemToCartActionPayload {
    productId: string;
    quantity: number;
}
