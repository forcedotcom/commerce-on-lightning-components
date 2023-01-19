import { LightningElement, api } from 'lwc';
import type { ProductSearchResultSummary } from 'commerce/productApiInternal';
import type { FiltersPanelDetail, SearchFiltersActionPayload } from 'commerce/searchApiInternal';
import { DataProviderActionEvent } from 'experience/dataProvider';
import type { LwcCustomEventTargetOf } from 'types/common';
import { prepareRefinementsForRequest } from 'commerce_search/facetsLib';
import filterHeader from '@salesforce/label/B2B_Search_Facets.filtersHeader';
import type LightningDialog from 'types/lightning-dialog';

type Layout = 'mobile' | 'desktop';
const DEFAULT_SEARCH_FILTER_PAGE = 1;
const MEDIA_QUERY_DESKTOP = '(min-width: 64.0625em)';

/**
 * A component to handle search filter for the search results component.
 */
export default class SearchFilters extends LightningElement {
    static renderMode = 'light';
    private readonly mqlDesktop: MediaQueryList;
    private readonly handleMediaQueryListChange = this.calculateLayout.bind(this);
    layout: Layout = 'desktop';
    filterHeaderLabel = filterHeader;

    @api
    searchResults?: ProductSearchResultSummary;

    get normalizedSearchFilters(): FiltersPanelDetail | undefined {
        return (this.searchResults || {}).filtersPanel;
    }

    get isMobile(): boolean {
        return this.layout === 'mobile';
    }

    get isDesktop(): boolean {
        return this.layout === 'desktop';
    }

    constructor() {
        super();
        this.mqlDesktop = window.matchMedia(MEDIA_QUERY_DESKTOP);
    }

    connectedCallback(): void {
        this.calculateLayout();
        this.mqlDesktop.addEventListener('change', this.handleMediaQueryListChange);
    }

    disconnectedCallback(): void {
        this.mqlDesktop.removeEventListener('change', this.handleMediaQueryListChange);
    }

    private calculateLayout(): void {
        this.layout = this.mqlDesktop.matches ? 'desktop' : 'mobile';
    }

    /**
     * The total count of product items.
     */
    get totalItemCount(): number {
        const total = (this.searchResults || {}).total || 0;
        return total;
    }

    /**
     * Gets the available filter dialog on mobile
     */
    get facetsFilterDialog(): (LightningDialog & Element) | null {
        return this.querySelector('lightning-dialog');
    }

    /**
     * Dispatches the filter change event
     */
    private _dispatchDataProviderActionEvent(searchFiltersPayload: SearchFiltersActionPayload): void {
        const dataProviderActionEvent = new DataProviderActionEvent('search:filterChange', searchFiltersPayload);
        this.dispatchEvent(dataProviderActionEvent);
    }

    /**
     * Handles the category update event for category filtering.
     */
    handleCategoryUpdateEvent(event: LwcCustomEventTargetOf<HTMLElement>): void {
        event.stopPropagation();

        const searchFiltersPayload = {
            categoryId: event.detail.categoryId,
            page: DEFAULT_SEARCH_FILTER_PAGE, // Go back to the first page
            cachedCategoryTree: event.detail.cachedTree,
        };
        this._dispatchDataProviderActionEvent(searchFiltersPayload);
    }

    /**
     * Handles the facet updated event for filtering search results by facets.
     */
    handleFacetValueUpdateEvent(event: LwcCustomEventTargetOf<HTMLElement>): void {
        event.stopPropagation();
        const { mruFacet } = event.detail;
        let { refinements } = event.detail;
        refinements = prepareRefinementsForRequest(refinements);

        const searchFiltersPayload = {
            page: DEFAULT_SEARCH_FILTER_PAGE, // Go back to the first page
            refinements,
            mruFacet,
        };

        this._dispatchDataProviderActionEvent(searchFiltersPayload);
    }

    /**
     * Handles the clear all filters event for resetting the search results.
     */
    handleClearAllFiltersEvent(event: LwcCustomEventTargetOf<HTMLElement>): void {
        event.stopPropagation();
        this.dispatchEvent(new DataProviderActionEvent('search:clearFilters'));
    }

    /**
     * Handles the open filters dialog event on mobile
     */
    handleFilterDialogOpenEvent(): void {
        this.facetsFilterDialog?.showModal();
    }

    /**
     * Handles the close filters dilaog event on mobile
     */
    handleFiltersDialogCloseEvent(): void {
        this.facetsFilterDialog?.close();
    }
}
