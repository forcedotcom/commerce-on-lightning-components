import { LightningElement, wire, api } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { DataProviderActionEvent } from 'experience/dataProvider';
import { transformDataWithConfiguration, computeConfiguration } from 'commerce/searchApiInternal';
import type { LightningNavigationContext } from 'types/common';
import type { LwcCustomEventTargetOf } from 'types/common';
import type { ProductSearchResultSummary } from 'commerce/productApiInternal';
import type {
    BuilderCardConfiguration,
    ResultsConfiguration,
    CardContentMappingItem,
} from 'commerce/searchApiInternal';
import { Labels } from './labels';
import type Dialog from 'lightning/dialog';
import { createStyleString } from 'community_styling/inlineStyles';

function selectStyles(
    styleCollection: Record<string, string | number>,
    matchingPrefix: string
): Record<string, string | number> {
    return Object.entries(styleCollection).reduce(
        (filteredCollection: Record<string, string | number>, keyValuePair) => {
            if (keyValuePair[0].startsWith(matchingPrefix)) {
                keyValuePair = [keyValuePair[0].slice(matchingPrefix.length), keyValuePair[1]];
                filteredCollection[keyValuePair[0]] = keyValuePair[1];
            }
            return filteredCollection;
        },
        {}
    );
}

const DEFAULTS = {
    cardAlignment: 'center',
    cardBorderRadius: '1',
    gridColumnSpacing: 'small',
    gridMaxColumnsDisplayed: 3,
    gridRowSpacing: 'small',
    listRowSpacing: 'small',
    negotiatedPriceTextSize: 'medium',
    originalPriceTextSize: 'medium',
    pageTitleFontSize: 'large',
    resultsLayout: 'grid',
};

export default class SearchResults extends LightningElement {
    static renderMode = 'light';

    /**
     * * The layout of the results tiles.
     * Accepts values 'grid' or 'list'.
     */
    @api
    resultsLayout?: string;

    private get _resultsLayout(): string {
        return this.resultsLayout || DEFAULTS.resultsLayout;
    }

    /**
     * Font color for the card background field, as 'rgb', 'rgba' or 'hex' CSS value.
     */
    @api
    cardBackgroundColor?: string;

    private get _cardBackgroundColor(): string {
        return this.cardBackgroundColor || 'var(--dxp-g-root)';
    }

    /**
     * The font size of the page title field.
     * Accepted values are: "small", "medium", and "large"
     */
    @api
    negotiatedPriceTextSize?: string;

    private get _negotiatedPriceTextSize(): string {
        return this.negotiatedPriceTextSize || DEFAULTS.negotiatedPriceTextSize;
    }

    /**
     * Font color for the negotiated price text field, as 'rgb', 'rgba' or 'hex' CSS value.
     */
    @api
    negotiatedPriceTextColor?: string;

    private get _negotiatedPriceTextColor(): string {
        return this.negotiatedPriceTextColor || 'var(--dxp-g-root-contrast)';
    }

    /**
     * The font size of the page title field.
     * Accepted values are: "small", "medium", and "large"
     */
    @api
    originalPriceTextSize?: string;

    private get _originalPriceTextSize(): string {
        return this.originalPriceTextSize || DEFAULTS.originalPriceTextSize;
    }

    /**
     * Font color for the original price text field, as 'rgb', 'rgba' or 'hex' CSS value.
     */
    @api
    originalPriceTextColor?: string;

    private get _originalPriceTextColor(): string {
        return this.originalPriceTextColor || 'var(--dxp-g-root-contrast)';
    }

    /**
     * The alignment of the results cards.
     * Accepted values are 'right', 'center', or 'left'.
     */
    @api
    cardAlignment?: string;

    private get _cardAlignment(): string {
        return this.cardAlignment || DEFAULTS.cardAlignment;
    }

    /**
     * Font color for the card border field, as 'rgb', 'rgba' or 'hex' CSS value.
     */
    @api
    cardBorderColor?: string;

    private get _cardBorderColor(): string {
        return this.cardBorderColor || 'var(--dxp-g-root)';
    }

    /**
     * The value of the border radius for the results card.
     */
    @api
    cardBorderRadius?: string;

    private get _cardBorderRadius(): string {
        return this.cardBorderRadius || DEFAULTS.cardBorderRadius;
    }

    /**
     * The size of the spacing between the grid columns.
     * Accepted values are: "small", "medium", and "large"
     */
    @api
    gridColumnSpacing?: string;

    private get _gridColumnSpacing(): string {
        return this.gridColumnSpacing || DEFAULTS.gridColumnSpacing;
    }

    /**
     * The size of the spacing between the grid rows.
     * Accepted values are: "small", "medium", and "large"
     */
    @api
    gridRowSpacing?: string;

    private get _gridRowSpacing(): string {
        return this.gridRowSpacing || DEFAULTS.gridRowSpacing;
    }

    /**
     * The maximum number of grid columns to be displayed.
     * Accepted values are between 1 and 8.
     */
    @api
    gridMaxColumnsDisplayed?: number;

    private get _gridMaxColumnsDisplayed(): number {
        return this.gridMaxColumnsDisplayed || DEFAULTS.gridMaxColumnsDisplayed;
    }

    /**
     * Font color for the card divider field, as 'rgb', 'rgba' or 'hex' CSS value.
     */
    @api
    cardDividerColor?: string;

    private get _cardDividerColor(): string {
        return this.cardDividerColor || 'var(--dxp-g-neutral)';
    }

    /**
     * The size of the spacing between the list rows.
     * Accepted values are: "small", "medium", and "large"
     */
    @api
    listRowSpacing?: string;

    private get _listRowSpacing(): string {
        return this.listRowSpacing || DEFAULTS.listRowSpacing;
    }

    /**
     * Whether or not to display the product image.
     */
    @api
    showProductImage = false;

    @api
    cardContentMapping?: string;

    get _cardContentMapping(): CardContentMappingItem[] {
        return JSON.parse(this.cardContentMapping || '[]');
    }

    /**
     * Whether or not to display the product image.
     */
    @api
    showCallToActionButton = false;

    /**
     * The text for the add to cart button
     */
    @api
    addToCartButtonText?: string;

    /**
     * The text for the view option button
     */
    @api
    viewOptionsButtonText?: string;

    /**
     * The button style for add to cart button
     * Accepted values primary, secondary, tertiary
     */
    @api
    addToCartButtonStyle?: string;

    private get _addToCartButtonStyle(): string {
        return this.addToCartButtonStyle || '';
    }

    /**
     * Whether or not to display the negotiated price.
     */
    @api
    showNegotiatedPrice = false;

    /**
     * Whether or not to display the original price.
     */
    @api
    showOriginalPrice = false;

    /**
     * The current page number of the results.
     */
    private currentPageNumber = 1;

    /**
     * Maximum pages to be displayed on the paging control.
     */
    private _maximumPagesDisplayed = 5;

    @wire(NavigationContext)
    private navContext!: LightningNavigationContext;

    @api
    searchResults?: ProductSearchResultSummary;

    get normalizedSearchResults(): ProductSearchResultSummary {
        return transformDataWithConfiguration(this.searchResults as ProductSearchResultSummary, this.cardConfiguration);
    }

    /**
     * Creates a representation of the custom styles for the resultsTiles component.
     */
    get customStyles(): { [key: string]: string } {
        // Title Card
        const styles: { [key: string]: string } = {
            'grid-card-container-background-color': this._cardBackgroundColor,
            'grid-card-price-negotiated-font-size': this._negotiatedPriceTextSize,
            'grid-card-price-negotiated-color': this._negotiatedPriceTextColor,
            'grid-card-price-original-font-size': this._originalPriceTextSize,
            'grid-card-price-original-color': this._originalPriceTextColor,
            'grid-card-cta-button-variant': this._addToCartButtonStyle,
        };
        if (this._resultsLayout === 'grid') {
            styles['grid-card-content-align-self'] = this._cardAlignment;
            styles['grid-card-content-justify-self'] = this._cardAlignment;
            styles['grid-card-container-border-color'] = this._cardBorderColor;
            styles['grid-card-container-border-radius'] = this._cardBorderRadius;
            styles['grid-column-spacing'] = this._gridColumnSpacing;
            styles['grid-row-spacing'] = this._gridRowSpacing;
        } else {
            styles['grid-list-divider-color'] = this._cardDividerColor;
            styles['grid-row-spacing'] = this._listRowSpacing;
        }
        return styles;
    }

    /**
     * Sets the custom CSS properties for the Add To Cart Button
     * @returns {string}
     * @readonly
     */
    get addToCartButtonCssStyles(): string {
        return createStyleString({
            '--com-c-product-details-add-to-cart-button-background-color': 'var(--dxp-s-button-color)',
            '--com-c-product-details-add-to-cart-button-border-color': 'var(--dxp-s-button-color)',
            '--com-c-product-details-add-to-cart-button-text-color': 'var(--dxp-s-button-color-contrast)',
            '--com-c-product-details-add-to-cart-button-background-hover-color': 'var(--dxp-s-button-color-hover)',
            '--com-c-product-details-add-to-cart-button-text-hover-color': 'var(--dxp-s-button-color-contrast)',
        });
    }

    /**
     * Creates a representation of the custom styles for the resultsTiles component.
     */
    get cardConfiguration(): BuilderCardConfiguration {
        return {
            showProductImage: this.showProductImage,
            showNegotiatedPrice: this.showNegotiatedPrice,
            showOriginalPrice: this.showOriginalPrice,
            showCallToActionButton: this.showCallToActionButton,
            addToCartButtonText: this.addToCartButtonText,
            viewOptionsButtonText: this.viewOptionsButtonText,
            cardContentMapping: this._cardContentMapping,
        };
    }

    /**
     * Page size
     */
    get pageSize(): number {
        return this.searchResults?.pageSize || 20;
    }

    /**
     * The total count of product items.
     * @readonly
     */
    get totalItemCount(): number {
        const total = this.searchResults?.total || 0;
        return total;
    }

    /**
     * Getter - is this paging control valid to show?
     * @readonly
     */
    get showPagingControl(): boolean {
        const totalPages = Math.ceil(this.totalItemCount / this.pageSize);
        return totalPages > 1;
    }

    /**
     * Gets the computed resutls configuration.
     */
    get resultsConfiguration(): ResultsConfiguration {
        return computeConfiguration({
            layout: this._resultsLayout,
            gridMaxColumnsDisplayed: this._gridMaxColumnsDisplayed,
            builderCardConfiguration: this.cardConfiguration,
            addToCartDisabled: false,
        });
    }

    /**
     * Gets the custom CSS styles to provide to the list header.
     */
    get layoutCustomStyles(): Record<string, string | number> {
        return selectStyles(this.customStyles, 'grid-');
    }

    /**
     * Handles navigating to the product detail page from the search results page.
     * @param event the navigation event
     */
    handleNavigateToProductPage(event: LwcCustomEventTargetOf<HTMLElement>): void {
        event.stopPropagation();
        navigate(this.navContext, {
            type: 'standard__recordPage',
            attributes: {
                objectApiName: 'Product2',
                recordId: event.detail.productId,
                actionName: 'view',
            },
            state: {
                recordName: event.detail.productName,
            },
        });
    }

    /**
     * Trigger an update of the page number at the closest `SearchDataProvider`
     * @param newPageNumber
     */
    private updateCurrentPage(newPageNumber: number): void {
        this.currentPageNumber = newPageNumber;
        this.dispatchEvent(
            new DataProviderActionEvent('search:pageChange', {
                currentPageNumber: newPageNumber,
            })
        );
    }

    /**
     * Handles the previous event for pagination.
     */
    handlePreviousPageEvent(event: LwcCustomEventTargetOf<HTMLElement>): void {
        event.stopPropagation();
        this.updateCurrentPage(this.currentPageNumber - 1);
    }

    /**
     * Handles the next event for pagination.
     */
    handleNextPageEvent(event: LwcCustomEventTargetOf<HTMLElement>): void {
        event.stopPropagation();
        this.updateCurrentPage(this.currentPageNumber + 1);
    }

    /**
     * Handles the go to event for pagination.
     */
    handleGotoPageEvent(event: LwcCustomEventTargetOf<HTMLElement>): void {
        event.stopPropagation();
        this.updateCurrentPage(event.detail.pageNumber);
    }

    /**
     * Handles the 'addtocart' event.
     *
     * @param {LwcCustomEventTargetOf<HTMLElement>} event the event object
     */
    handleAddToCart(evt: LwcCustomEventTargetOf<HTMLElement>): void {
        const productId = evt.detail.productId;
        const quantity = evt.detail.quantity;
        this.dispatchEvent(
            new DataProviderActionEvent(
                'search:addItemToCart',
                {
                    productId,
                    quantity,
                },
                {
                    onSuccess: (): void => {
                        this._itemAddedModal?.showModal();
                    },
                }
            )
        );
    }

    /**
     * Handler for the 'click' event fired from the 'continue shopping' button, (item added modal)
     * which should close the item added modal ( Mobile & Desktop )
     *
     * @private
     */
    closeModal(): void {
        this._itemAddedModal?.close();
    }

    /**
     * Shows a modal after an item is added to the cart.
     * @returns {Object}
     */
    get _itemAddedModal(): (Element & Dialog) | null {
        return this.querySelector('lightning-dialog');
    }

    /**
     * Handler for the 'click' event fired from the clear cart button
     * which should show the clear cart modal ( Mobile & Desktop )
     *
     */
    private navigateToCart(): void {
        navigate(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Current_Cart',
            },
        });
    }

    /**
     * Gets successfully added to cart label for the add to cart modal
     */
    get successfullyAddedToCartLabel(): string {
        return Labels.successfullyAddedToCart;
    }

    /**
     * Gets continue shopping label for the add to cart modal
     */
    get continueShoppingLabel(): string {
        return Labels.continueShopping;
    }

    /**
     * Gets view cart label for the add to cart modal
     */
    get viewCartLabel(): string {
        return Labels.viewCart;
    }
}
