import { LightningElement, api } from 'lwc';
import { DynamicStyleMap, StyleStringGenerator } from 'community_styling/inlineStyles';
import { EVENT, KEY_CODE } from './constants';
import { i18n } from './labels';
import selectStyles from 'community_styling/styleSelector';
import type { ProductCard } from 'commerce/productApiInternal';
import type { ProductGridConfiguration, ProductCardConfiguration } from 'commerce/searchApiInternal';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createLayoutStyleStringGenerator() {
    // Build up the dynamic styles the product layout uses
    const dynamicLayoutStyles = new DynamicStyleMap({
        'border-bottom-color': DynamicStyleMap.createStatefulStyleSelector(
            'no-value-is-set',
            'list-divider-color', // The list divider is only applied for the list layout.
            'isList'
        ),
        'flex-basis': DynamicStyleMap.createStatefulStyleSelector(
            'no-value-is-set',
            'card-basis', // Flex-basis is only applied for the grid layout
            'isGrid'
        ),
    });

    return new StyleStringGenerator([dynamicLayoutStyles]);
}
const layoutStyleStringGenerator = createLayoutStyleStringGenerator();

/**
 * Generates an SLDS CSS class representing margin of a given spacing.
 */
function generateClassForSpacing(spacing: string | number, isVertical: boolean): string | undefined {
    const direction = isVertical ? 'vertical' : 'horizontal';
    const cssClass =
        spacing === 'none' || spacing === 'small' || spacing === 'medium' || spacing === 'large'
            ? `slds-m-${direction}_${spacing}`
            : undefined;

    return cssClass;
}

/**
 * @fires ProductGrid#showproduct
 * @fires ProductGrid#addproducttocart
 */
export default class ProductGrid extends LightningElement {
    static renderMode = 'light';
    /**
     * An event fired when the user indicates a desire to view the details of a product.
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *
     * @event ProductGrid#showproduct
     * @type {CustomEvent}
     *
     * @property {string} detail.productId
     *   The unique identifier of the product.
     *
     * @property {string} detail.productName
     *   The name of the product.
     *
     * @export
     */

    /**
     * The card display-data.
     *
     * @typedef {Object} CardDetail
     *
     * @property {string} id
     *  The ID of the card item.
     *
     * @property {string} name
     *  The name of the card item.
     *
     * @property {FieldValue[]} fields
     *  The fields belongs to the card item.
     *
     * @property {Image} image
     *  The image display-data.
     *
     * @property {Prices} prices
     *  The prices display-data.
     *
     * @property {string} productClass
     *  Type of the product(Variation, VariationParent or Simple).
     */

    /**
     * The field value display-data.
     *
     * @typedef {Object} FieldValue
     *
     * @property {string} value
     *  Value of the field.
     */

    /**
     * The image display-data.
     *
     * @typedef {Object} Image
     *
     * @property {string} url
     *  The URL of the card image.
     *
     * @property {string} alternateText
     *  Alternative text for the card image.
     */

    /**
     * The prices display-data.
     *
     * @typedef {Object} Prices
     *
     * @property {string} [listingPrice]
     *  The the list price for the card item.
     *
     * @property {string} [negotiatedPrice]
     *  The the negotiated price for the card item.
     *
     * @property {string} [currencyIsoCode]
     *  The ISO 4217 currency code of all card item prices in the search result.
     *
     * @property {Boolean} isLoading
     *  Whether the price is in the loading state.
     */

    /**
     * The layout UI configuration.
     *
     * @typedef {Object} LayoutConfiguration
     *
     * @property {string} layout
     *  The layout for the card collection.
     *  Supported (case-sensitive) values are:
     *  - "grid"
     *      The products will be displayed in grid column layout.
     *      The property gridMaxColumnsDisplayed defines the max no. of columns.
     *  - "list"
     *      The products will be displayed as a list.
     *
     * @property {Number} gridMaxColumnsDisplayed
     *  The maximum columns to be displyed in the grid.
     *
     * @property {CardConfiguration} cardConfiguration
     *  The card layout configuration.
     */

    /**
     * The Card UI configuration.
     *
     * @typedef {Object} CardConfiguration
     *
     * @property {Boolean} addToCartDisabled
     *  Whether or not the add to cart button is disabled.
     *
     * @property {string} addToCartButtonText
     *  The text for the Add to Cart button, a type of Call to Action button.
     *
     * @property {string} layout
     *  The layout for the card collection. Card also requires this field for
     *  grid/list layout generation.
     *
     * @property {Boolean} showCallToActionButton
     *  Whether or not to show the Call to Action button.
     *
     * @property {Boolean} showProductImage
     *  Whether or not to show the product image.
     *
     * @property {string} viewOptionsButtonText
     *  The text for the View Options button, a type of of Call to Action button.
     *
     * @property {Boolean} showQuantityRules
     *  Whether or not to show the quantity rule text in product card.
     *
     * @property {string} minimumQuantityGuideText
     *  The text showing the minimum quantity value of a product.
     *
     * @property {string} maximumQuantityGuideText
     *  The text showing the maximum quantity value of a product.
     *
     * @property {string} incrementQuantityGuideText
     *  The text showing the increment quantity value of a product.
     *
     * @property {Boolean} showQuantityRulesText
     *  Whether or not to show the quantity rules text in product card.
     *
     * @property {string} quantitySelectorLabelText
     *  The text showing label next to inline quantity selector
     *
     * @property {Map<string, FieldConfiguration>} fieldConfiguration
     *  The field UI configuration as a map with the field name as key.
     *
     * @property {PriceConfiguration} priceConfiguration
     *  The price UI configuration.
     */

    /**
     * The field UI configuration.
     *
     * @typedef {Object} FieldConfiguration
     *
     * @property {Boolean} showLabel
     *  Whether or not to show the field label.
     *
     * @property {string} fontSize
     *  The font size of the field.
     *  Accepted values are: "small", "medium", and "large"
     *
     * @property {string} fontColor
     *  Font color for the field, as 'rgb', 'rgba' or 'hex' CSS value.
     */

    /**
     * The price UI configuration.
     *
     * @typedef {Object} PriceConfiguration
     *
     * @property {Boolean} showNegotiatedPrice
     *  Whether or not to show the negotiated price.
     *
     * @property {Boolean} showListingPrice
     *  Whether or not to show the original/list price.
     */

    /**
     * Representation of Builder Field Item
     *
     * @typedef {Object} BuilderFieldItem
     *
     * @property {string} name
     *  The name of the field.
     *
     * @property {string} fontSize
     *  The font size of the field.
     *  Accepted values are: "small", "medium", and "large"
     *
     * @property {string} fontColor
     *  Font color for the field, as 'rgb', 'rgba' or 'hex' CSS value.
     *
     */

    /**
     * Builder-customizable styling for product grid and its child components
     *
     * @typedef {Object} CustomStyles
     *
     *
     * @property {string} ["row-spacing"]
     *  Spacing for the columns in product grid. Accepted values are: "none" "small", "medium", and "large".
     *
     * @property {string} ["column-spacing"]
     *  Spacing for the rows in product grid. Accepted values are: "none", "small", "medium", and "large".
     *
     * @property {string} ["card-container-background-color"]
     *  Background color for the product card, as 'rgb', 'rgba' or 'hex' CSS value
     *
     * @property {string} ["card-container-border-color"]
     *  Border color for the product card as 'rgb', 'rgba' or 'hex' CSS value
     *
     * @property {Integer} ["card-container-border-radius"]
     *  Border radius for the product card, in pixels
     *
     * @property {string} ["card-content-align-self"]
     * @property {string} ["card-content-justify-self"]
     *  CSS Grid style values specifying how to align and justify all the product card content
     *  Possible values are predefined by contentAlignmentEnum.
     *
     * @property {string} ["card-price-negotiated-font-size"]
     *  The size of the negotiated price, currently: 'small', 'medium', 'large'.
     *
     * @property {string} ["card-price-negotiated-color"]
     *  The color of the negotiated price, specified as a valid CSS color representation.
     *
     * @property {string} ["card-price-original-font-size"]
     *  The size of the list price, currently: 'small', 'medium', 'large'.
     *
     * @property {string} ["card-price-original-color"]
     *  The color of the original/list price, specified as a valid CSS color representation.
     *
     * @property {string} ["card-cta-button-background-color"]
     *  The background color of the button, specified as a valid CSS color representation.
     *
     * @property {string} ["card-cta-button-disabled-background-color"]
     *  The background color of the button when it is disabled, specified as a valid CSS color representation.
     *
     * @property {string} ["card-cta-button-background-hover-color"]
     *  The background color of the button when the user hovers over it, specified as a valid CSS color representation.
     *
     * @property {string} ["card-cta-button-border-color"]
     *  The color of the button text, specified as a valid CSS color representation.
     *
     * @property {string} ["card-cta-button-border-radius"]
     *  The radius of the button corner border, specified as a CSS length.
     *
     * @property {string} ["card-cta-button-text-color"]
     *  The color of the button text, specified as a valid CSS color representation.
     *
     * @property {string} ["card-cta-button-text-hover-color"]
     *  The color of the button text when the user hovers over it, specified as a valid CSS color representation.
     *
     * @property {string} ["list-divider-color"]
     *  The color of the divider between list items (applicable when in the 'list' layout), specified as a valid CSS color representation.
     *
     */

    /**
     * The styling properties that are configured for the Product Card in the Builder
     *
     * @type {CustomStyles}
     *
     */
    @api
    customStyles?: Record<string, string | number>;

    /**
     * Gets or sets the product layout configuration.
     * @type {ProductGridConfiguration}
     */
    @api
    configuration?: ProductGridConfiguration;

    /**
     * Gets or sets the card collection display-data.
     *
     * @type {ProductCard[]}
     */

    @api
    displayData?: ProductCard[];

    /**
     * Gets the normalized card collection display-data.
     *
     * @type {ProductCard[]}
     */
    get normalizedDisplayData(): ProductCard[] {
        return this.displayData ?? [];
    }

    /**
     * Gets the content mapping, ensuring the value is an object.
     *
     * @type {}
     * @private
     * @readonly
     */
    private get normalizedConfiguration(): ProductGridConfiguration | undefined {
        return this.configuration;
    }

    /**
     * Gets the slds classes to apply the spacing for the products layout.
     *
     * @returns {string}
     *
     * @readonly
     * @private
     */
    private get layoutSpacingClasses(): string {
        const cs = this.customStyles || {};
        const row = generateClassForSpacing(cs['row-spacing'], true);
        const col = generateClassForSpacing(cs['column-spacing'], false);

        return `${row} ${col}`.trim();
    }

    /**
     * Gets the normalized custom styles to apply to the elements of the product grid.
     *
     * @returns {CustomStyles}
     *
     * @readonly
     * @private
     */
    private get normalizedStyles(): Record<string, string | number> {
        // Incorporate the computed card basis size into the custom styles.
        // We default to 25%, but use any valid (i.e. positive) override value provided.
        let cardBasis = 25;
        const gridMaxColumnsDisplayed = this.normalizedConfiguration?.gridMaxColumnsDisplayed || 4;
        // ensure we are dividing by a positive number
        if (gridMaxColumnsDisplayed > 0) {
            cardBasis = 100 / gridMaxColumnsDisplayed;
        }

        return Object.assign({}, this.customStyles, {
            'card-basis': `${cardBasis}%`,
        });
    }

    /**
     * Gets the custom styles to apply to the elements of the product layout
     *
     * @returns {string}
     *
     * @readonly
     * @private
     */
    // eslint-disable-next-line  @typescript-eslint/explicit-function-return-type
    private get layoutCustomStyles() {
        return layoutStyleStringGenerator.createForStyles(this.normalizedStyles, {
            isGrid: this.isGridLayout,
            isList: !this.isGridLayout,
        });
    }

    /**
     * Gets the grid specific class for the un-orderded list container if the
     * layout is 'grid', otherwise it returns empty string.
     *
     * @returns {string}
     *
     * @readonly
     * @private
     */
    private get layoutContainerClass(): string {
        return this.isGridLayout ? 'product-grid-container' : '';
    }

    /**
     * Gets whether the layout is grid or not.
     *
     * @returns {string}
     *
     * @readonly
     * @private
     */
    private get isGridLayout(): boolean | undefined {
        return this.normalizedConfiguration?.layout === 'grid';
    }

    /**
     * Gets the custom CSS styles to provide to the product card.
     *
     * @returns {Object}
     *
     * @readonly
     * @private
     */
    private get cardCustomStyles(): Record<string, string | number> {
        return selectStyles(this.customStyles, 'card-');
    }

    /**
     * Arial label for the list.
     *
     * @returns {string}
     *
     * @private
     */
    private get ariaLabelForSearchResults(): string {
        return i18n.searchResults;
    }

    /**
     * Handles the `addproducttocart` event which navigates to a product detail page.
     */
    handleAddToCart(evt: CustomEvent): void {
        evt.stopPropagation();

        const { productId, quantity } = evt.detail;
        this.dispatchEvent(
            new CustomEvent(EVENT.ADD_PRODUCT_TO_CART_EVT, {
                bubbles: false,
                composed: false,
                detail: {
                    productId,
                    quantity,
                },
            })
        );
    }

    /**
     * Handles the `showProduct` event which navigates to a product detail page.
     * @fires ProductGrid#showproduct
     */
    handleNavigateToProductPage(event: CustomEvent): void {
        event.stopPropagation();

        const { productId, productName } = event.detail;

        this.dispatchEvent(
            new CustomEvent(EVENT.SHOW_PRODUCT_EVT, {
                bubbles: false,
                composed: false,
                detail: {
                    productId,
                    productName,
                },
            })
        );
    }
    /**
     * Handles key downs on the list.
     *
     * - Home moves focus to first item.
     * - End moves focus to last item.
     * - Up arrow moves focus to previous item.
     * - Down arrow moves focus to next item.
     *
     * When the Add to Cart button is present, user can navigate
     * the list using the Home, End, and Tab (default behavior) keys.
     *
     * When the Add to Cart button isn’t present, user can navigate
     * the list using the Home, End, Tab (default behavior), Up and Down keys.
     * @private
     */
    private handleKeyDown(event: KeyboardEvent): void {
        const { code } = event;
        if (event.target instanceof HTMLElement) {
            const id = event.target.dataset.id;
            const index = this.normalizedDisplayData.findIndex((product) => product.id === id);
            const callToActionButtonEnabled = this.normalizedConfiguration?.cardConfiguration.showCallToActionButton;

            switch (code) {
                case KEY_CODE.ARROW_DOWN:
                    if (!callToActionButtonEnabled) {
                        event.preventDefault();
                        this.focusListItem(index, +1);
                    }
                    break;
                case KEY_CODE.ARROW_UP:
                    if (!callToActionButtonEnabled) {
                        event.preventDefault();
                        this.focusListItem(index, -1);
                    }
                    break;
                case KEY_CODE.HOME:
                    event.preventDefault();
                    this.focusListItem(0, 0);
                    break;
                case KEY_CODE.END:
                    event.preventDefault();
                    this.focusListItem(0, -1);
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * Focuses a list item.
     *
     * @param {Number} baseIndex - The base index position.
     * @param {Number} steps - The number of steps from the baseIndex position.
     * @private
     */
    private focusListItem(baseIndex: number, steps: number): void {
        // Compute a new active index.
        const itemCount = this.normalizedDisplayData.length;
        let newActiveIndex = (baseIndex + steps) % itemCount;

        // If new active index is negative then focus the last item.
        if (newActiveIndex < 0) {
            newActiveIndex = itemCount - 1;
        }

        Array.from(this.querySelectorAll<HTMLElement>('commerce_search-product-card'))[newActiveIndex].focus();
    }

    /**
     * Product card configuration.
     *
     */
    get cardConfiguration(): ProductCardConfiguration | undefined {
        return this.normalizedConfiguration?.cardConfiguration;
    }
}
