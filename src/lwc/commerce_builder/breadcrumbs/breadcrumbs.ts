import { api, LightningElement, wire } from 'lwc';
import type { Breadcrumb } from 'commerce/breadcrumbs';
import type { LightningNavigationContext, PageReference } from 'types/common';
import { navigate, NavigationContext } from 'lightning/navigation';
import homelabel from '@salesforce/label/LwcComponent:commerce_builder:breadcrumbs.homelabel';
import { BreadcrumbsAdapter } from './breadcrumbsAdapter';

export { BreadcrumbsAdapter };

const MAX_DEPTH = 5;
const MEDIA_QUERY_MOBILE = '(max-width: 47.9375em)';
const HOME_PAGE: Breadcrumb = {
    label: homelabel,
    pageReference: {
        type: 'comm__namedPage',
        attributes: {
            name: 'Home',
        },
    },
};

/**
 * The breadcrumbs component is a common component that can be used on pages whose context contains a breadcrumb
 * provider. Such a breadcrumb providers are the {@link ProductDataProvider} or the {@link SearchDataProvider},
 * i.e. the breadcrumbs component can safely be used on pages that contain such a data provider (e.g. Product
 * Detail Page, Product List Page, and Search Page).
 */
export default class Breadcrumbs extends LightningElement {
    public static renderMode = 'light';

    private readonly _mqlMobile: MediaQueryList = window.matchMedia(MEDIA_QUERY_MOBILE);

    private readonly _handleMediaQueryListChange = this.calculateLayout.bind(this);

    private _isMobile = false;

    private _calculateLayoutTimeout: number | null = null;

    private _breadcrumbs: Breadcrumb[] = [];

    /**
     * Whether to display a link to the home page as the first entry in the breadcrumbs.
     */
    @api public showHomeLink = false;

    /**
     * Whether to display an anchor around the last breadcrumb.
     */
    @api public showLastItemAsLink = false;

    /**
     * Whether to hide the breadcrumbs on mobile devices.
     */
    @api public hideOnMobile = false;

    /**
     * The number of the allowed link nesting/depth on mobile devices.
     */
    @api public maxDepthOnMobile?: string;

    /**
     * A breadcrumb's text size.
     */
    @api public textSize?: string;

    /**
     * A breadcrumb's text color.
     */
    @api public textColor?: string;

    /**
     * A breadcrumb's link/anchor color.
     */
    @api public linkColor?: string;

    /**
     * A breadcrumb's link/anchor color on hover.
     */
    @api public linkHoverColor?: string;

    /**
     * The name of the character to use as divider/separator between breadcrumbs.
     */
    @api public divider?: 'chevron' | 'slash';

    /**
     * A breadcrumb divider's text color.
     */
    @api public dividerColor?: string;

    @wire(NavigationContext)
    private navContext!: LightningNavigationContext;

    // eslint-disable-next-line @lwc/lwc/no-unknown-wire-adapters
    @wire(BreadcrumbsAdapter)
    private wiredBreadcrumbs(breadcrumbs: Breadcrumb[]): void {
        this._breadcrumbs = Array.isArray(breadcrumbs) ? breadcrumbs : [];
    }

    public connectedCallback(): void {
        this.calculateLayout();
        this._mqlMobile.addEventListener('change', this._handleMediaQueryListChange);
    }

    public disconnectedCallback(): void {
        this._mqlMobile.removeEventListener('change', this._handleMediaQueryListChange);

        this._calculateLayoutTimeout && clearTimeout(this._calculateLayoutTimeout);
        this._calculateLayoutTimeout = null;
    }

    get normalizedBreadcrumbs(): Breadcrumb[] {
        const breadcrumbs = this.showHomeLink ? [HOME_PAGE, ...this._breadcrumbs] : this._breadcrumbs;
        const mobileDepthLevels = Math.max(0, Math.min(MAX_DEPTH, Number(this.maxDepthOnMobile)));
        return this._isMobile && mobileDepthLevels > 0
            ? breadcrumbs.slice(0, mobileDepthLevels)
            : breadcrumbs.slice(0, MAX_DEPTH);
    }

    get normalizedDivider(): '>' | '/' {
        switch (this.divider) {
            case 'slash':
                return '/';
            default:
                return '>';
        }
    }

    /**
     * Handler for the 'breadcrumbsclick' event emitted by the `commerce/breadcrumbs` component.
     * This component ensures a redirection to the desired/selected page reference.
     */
    handleNavigateToPage(event: CustomEvent<PageReference>): void {
        event.stopPropagation();
        navigate(this.navContext, event.detail);
    }

    private calculateLayout(): void {
        // This tiny little hack (i.e. using a timeout) is required to prevent issues due to multiple (script-based)
        // media queries taking effect simultaneously. This timeout then tries to make sure that we operate on a
        // settled component tree/rendering state.
        this._calculateLayoutTimeout && clearTimeout(this._calculateLayoutTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._calculateLayoutTimeout = window.setTimeout(() => {
            this._calculateLayoutTimeout = null;
            this._isMobile = window.matchMedia(MEDIA_QUERY_MOBILE).matches;
        });
    }
}
