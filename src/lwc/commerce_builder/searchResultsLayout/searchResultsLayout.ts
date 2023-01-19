import { LightningElement } from 'lwc';

type Layout = 'mobile' | 'desktop';
const MEDIA_QUERY_DESKTOP = '(min-width: 64.0625em)';

/**
 * @slot categoryHeader
 * @slot searchHeader
 * @slot sortingMenu
 * @slot searchFilters
 * @slot searchResult
 */
export default class SearchResultsLayout extends LightningElement {
    public static renderMode = 'light';
    private readonly mqlDesktop: MediaQueryList;
    private readonly handleMediaQueryListChange = this.calculateLayout.bind(this);
    layout: Layout = 'desktop';

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
}
