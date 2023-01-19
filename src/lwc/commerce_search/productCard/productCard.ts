import { container, content, image } from './styleStringGenerators';
import { LightningElement, api, wire } from 'lwc';
import { EVENT, PRODUCT_CLASS, QUANTITY_RULES } from './constants';
import selectStyles from 'community_styling/styleSelector';
import { i18n } from './labels';
import { resolve } from 'experience/resourceResolver';
import type {
    ProductCard as ProductCardDetail,
    ProductSearchMediaData,
    ProductSearchPricesData,
    PurchaseQuantityRuleData,
} from 'commerce/productApiInternal';
import type { ProductCardConfiguration, ProductField } from 'commerce/searchApiInternal';
import { navigate, NavigationContext } from 'lightning/navigation';
import type { SessionContext, AppContext } from 'commerce/contextApi';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type { LightningNavigationContext } from 'types/common';

/**
 * A UI control to show a product card.
 *
 * @fires ProductCard#addproducttocart
 * @fires ProductCard#showproduct
 */
export default class ProductCard extends LightningElement {
    static renderMode = 'light';
    /**
     * An event fired when the add to cart button is clicked.
     *
     * Properties:
     *   - Bubbles: true
     *   - Composed: true
     *
     * @event ProductCard#addproducttocart
     * @type {CustomEvent}
     *
     * @property {string} detail.productId
     *   The unique identifier of the product to be added to the cart.
     *
     * @property {Integer} detail.quantity
     *   The quantity of the produt to be added to the cart.
     *
     * @export
     */

    /**
     * An event fired when the user indicates a desire to view the details of a product.
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *
     * @event ProductCard#showproduct
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
     *
     * @property {PurchaseQuantityRule} purchaseQuantityRule
     *  Represents a rule that restricts the quantity of a product that may be purchased.
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
     * Representation of Builder Field Item
     *
     * @typedef {Object} BuilderFieldItem
     *
     * @property {string} name
     *  The name of the field.
     *
     * @property {string} label
     *  The display label of the field.
     *
     * @property {string} type
     *  The type of the field.
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
     *
     */

    /**
     * The field display-dataValue. The relevant details are extracted from
     * {@see BuilderFieldItem} and {@see CardDetail}.
     *
     * @typedef {Object} FieldValueDetail
     *
     * @property {string} name
     *  The name of the field.
     *
     * @property {string} label
     *  The display label of the field.
     *
     * @property {string} type
     *  The type of the field.
     *
     * @property {string} value
     *  The value of the field.
     *
     * @property {Boolean} tabStoppable
     *  The tabStoppable will be assigned accordingly to make only one field in the
     *  card lot to be tab stoppable in keyboard navigation.
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
     *  Whether or not to show the quantity rules and inline quantity selector in product card.
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
     * @property {String} fontSize
     *  The font size of the field.
     *  Accepted values are: "small", "medium", and "large"
     *
     * @property {String} fontColor
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
     * Builder-customizable styling for product card and its child components
     * @typedef {Object} ComponentStyleProperties
     *
     * @property {string} ["container-background-color"]
     *  Background color for the product card, as 'rgb', 'rgba' or 'hex' CSS value
     *
     * @property {string} ["container-border-color"]
     *  Border color for the product card as 'rgb', 'rgba' or 'hex' CSS value
     *
     * @property {Integer} ["container-border-radius"]
     *  Border radius for the product card, in pixels
     *
     * @property {string} ["content-align-self"]
     * @property {string} ["content-justify-self"]
     *  CSS Grid style values specifying how to align and justify all the product card content
     *  Possible values are predefined by contentAlignmentEnum.
     *
     * @property {string} ["price-negotiated-font-size"]
     *  The size of the negotiated price, currently: 'small', 'medium', 'large'.
     *
     * @property {string} ["price-negotiated-color"]
     *  The color of the negotiated price, specified as a valid CSS color representation.
     *
     * @property {string} ["price-original-font-size"]
     *  The size of the list price, currently: 'small', 'medium', 'large'.
     *
     * @property {string} ["price-original-color"]
     *  The color of the original/list price, specified as a valid CSS color representation.
     *
     * @property {string} ["cta-button-background-color"]
     *  The background color of the button, specified as a valid CSS color representation.
     *
     * @property {string} ["cta-button-disabled-background-color"]
     *  The background color of the button when it is disabled, specified as a valid CSS color representation.
     *
     * @property {string} ["cta-button-background-hover-color"]
     *  The background color of the button when the user hovers over it, specified as a valid CSS color representation.
     *
     * @property {string} ["cta-button-border-color"]
     *  The color of the button text, specified as a valid CSS color representation.
     *
     * @property {string} ["cta-button-border-radius"]
     *  The radius of the button corner border, specified as a CSS length.
     *
     * @property {string} ["cta-button-text-color"]
     *  The color of the button text, specified as a valid CSS color representation.
     *
     * @property {string} ["cta-button-text-hover-color"]
     *  The color of the button text when the user hovers over it, specified as a valid CSS color representation.
     */

    /**
     * Gets or sets the card display-data.
     *
     * @type {ProductCardDetail}
     */
    @api
    displayData?: ProductCardDetail;

    /**
     * Gets or sets the card UI configuration.
     *
     * @type {ProductCardConfiguration}
     */
    @api
    configuration?: ProductCardConfiguration;

    /**
     * COMMUNITIES BUILDER-EXPOSED STYLING ATTRIBUTE
     * Gets or sets the component styles selected from the builder
     */
    @api
    customStyles?: Record<string, string | number>;

    /**
     * Grabs the focus on current card.
     *
     * If Call to Action button is available then it's focused
     * otherwise, first tab stoppable product field is focused.
     */
    @api
    focus(): void {
        // if Call to Action button available then focus it.
        if (this.normalizedConfiguration?.showCallToActionButton) {
            const focusTarget = <HTMLElement>(
                (this.querySelector('commerce_search-call-to-action-anchor-button') ||
                    this.querySelector('commerce_product_details-add-to-cart-button'))
            );
            focusTarget?.focus();
        } else {
            // Otherwise, find the first tab stoppable product field to focus.
            const index = this.fields?.findIndex((field) => field.displayData.tabStoppable) || 0;
            const focusTarget = <HTMLElement>Array.from(this.querySelectorAll('commerce_search-product-field'))[index];
            focusTarget?.focus();
        }
    }

    /**
     * Gets the card UI configuration.
     *
     * @type {ProductCardConfiguration}
     */
    get normalizedConfiguration(): ProductCardConfiguration | undefined {
        return this.configuration;
    }

    /**
     * Gets a normalized representation of the product information.
     *
     * @type {ProductCardDetail}
     */
    get normalizedDisplayData(): ProductCardDetail | undefined {
        return this.displayData;
    }

    /**
     * Gets the prices display-data.
     *
     * @type {ProductSearchPricesData}
     * @readonly
     */
    get pricingInfo(): ProductSearchPricesData | undefined {
        return this.normalizedDisplayData?.prices;
    }

    /**
     * Gets the aria-label for the Add to Cart button, a type of CTA button
     * @type {string}
     * @readonly
     */
    get addToCartButtonAriaLabel(): string {
        if (this.normalizedDisplayData?.name) {
            return i18n.addToCartAriaLabel.replace('{productTitle}', this.normalizedDisplayData.name);
        }
        return '';
    }

    /**
     * Gets the aria-label for the View Options button, a type of CTA button
     * @type {string}
     * @readonly
     */
    get viewOptionsButtonAriaLabel(): string {
        if (this.normalizedDisplayData?.name) {
            return i18n.viewOptionsAriaLabel.replace('{productTitle}', this.normalizedDisplayData.name);
        }
        return '';
    }

    /**
     * Gets the custom CSS styles to apply to the negotiated and original price.
     *
     * @returns {Object}
     *
     * @readonly
     * @private
     */
    private get priceCustomStyles(): Record<string, string | number> {
        return selectStyles(this.customStyles, 'price-');
    }

    /**
     * Gets a value merged representations of BuilderFieldItem.
     *
     * @type {{FieldValue & FieldConfiguration}[]}}
     * @readonly
     * @private
     */
    private get fields(): ProductField[] {
        return (this.normalizedDisplayData?.fields ?? []).map((field) => {
            return {
                displayData: field,
                configuration: this.normalizedConfiguration?.fieldConfiguration[field.name] ?? {},
            } as ProductField;
        });
    }

    /**
     * Gets the default image
     *
     * @private
     */
    private get image(): ProductSearchMediaData {
        const img = this.normalizedDisplayData?.image;
        return {
            alternateText: img?.alternateText ?? '',
            url: resolve(img?.url ?? '', false, {
                height: 460,
                width: 460,
            }),
        };
    }

    /**
     * Gets the custom CSS styles for all of the inner content
     * @type {string}
     * @returns {string}
     *
     * @readonly
     * @private
     *
     */
    private get cardContainerStyling(): string {
        return container.createForStyles(this.customStyles);
    }

    /**
     * Gets the container class for the card. The container class will vary
     * depending upon the layout property.
     *
     * @type {string}
     * @returns {string}
     *
     * @readonly
     * @private
     *
     */
    private get cardContainerClass(): string {
        return this.isGridLayout ? 'cardContainerGrid' : 'cardContainerList';
    }

    /**
     * Gets whether the layout is grid or not.
     *
     * @returns {string}
     *
     * @readonly
     * @private
     */
    private get isGridLayout(): boolean {
        return this.normalizedConfiguration?.layout === 'grid';
    }

    /**
     * Gets the custom CSS styles for all of the inner content
     * @type {string}
     * @returns {string}
     *
     * @readonly
     * @private
     *
     */
    private get allContentCustomStyling(): string {
        return content.createForStyles(this.customStyles);
    }

    /** * Gets the custom CSS styles to provide to the button.
     *
     * @returns {Object}
     *
     * @readonly
     * @private
     * */
    private get callToActionButtonCustomStyles(): Record<string, string | number> {
        return selectStyles(this.customStyles, 'cta-button-');
    }

    /**
     * Gets the custom CSS styles to provide to the product card field.
     *
     * @returns {Object}
     *
     * @readonly
     * @private
     */
    private get contentCustomStyles(): Record<string, string | number> {
        return selectStyles(this.customStyles, 'content-');
    }

    /**
     * COMMUNITIES BUILDER-EXPOSED STYLING ATTRIBUTE
     * Gets the custom CSS styles for the image
     * @type {string}
     * @returns {string}
     *
     * @readonly
     * @private
     *
     */
    private get imageCustomStyling(): string {
        return image.createForStyles(this.customStyles);
    }

    /**
     * Get the text for minimum quantity guide
     *
     * @type {string}
     * @readonly
     */
    get minimumText(): string | undefined {
        const min = Number.parseInt(this.quantityRules?.minimum ?? '', 10);
        return this.normalizedConfiguration?.minimumQuantityGuideText.replace('{0}', `${min}`);
    }

    /**
     * Get the text for maximum quantity guide
     *
     * @type {string}
     * @readonly
     */
    get maximumText(): string | undefined {
        const max = Number.parseInt(this.quantityRules?.maximum ?? '', 10);
        return this.normalizedConfiguration?.maximumQuantityGuideText.replace('{0}', `${max}`);
    }

    /**
     * Get the text for increment quantity guide
     *
     * @type {string}
     * @readonly
     */
    get incrementText(): string | undefined {
        const increment = Number.parseInt(this.quantityRules?.increment ?? '', 10);
        return this.normalizedConfiguration?.incrementQuantityGuideText.replace('{0}', `${increment}`);
    }

    /**
     * Whether or not the quantity provided is valid
     *
     * @type {Boolean}
     * @readonly
     */
    isQuantityValid = true;

    /**
     * Gets or sets whether or not the 'add to cart' button is disabled
     *
     * @type {Boolean}
     * @readonly
     */
    get addToCartButtonDisabled(): boolean {
        return this.normalizedConfiguration?.addToCartDisabled || !this.isQuantityValid;
    }

    /**
     * Handler for the 'validationchanged' event fired from the
     * 'quantity-selector'
     *
     * @param {Object} evt the event object
     */
    handleValueChanged(evt: CustomEvent): void {
        this.isQuantityValid = evt.detail.isValid;
    }

    /**
     * Get all the quantity rules for quantity selector
     *
     * @param {Object}
     */
    get quantityRules(): PurchaseQuantityRuleData | undefined {
        if (!this.normalizedDisplayData?.purchaseQuantityRule && this.normalizedConfiguration?.showQuantityRules) {
            return {
                minimum: QUANTITY_RULES.DEFAULT_MIN.toString(),
                maximum: QUANTITY_RULES.DEFAULT_MAX.toString(),
                increment: QUANTITY_RULES.DEFAULT_INCREMENT.toString(),
            };
        }
        return this.normalizedDisplayData?.purchaseQuantityRule;
    }

    /**
     * The minimum quantity of the product that may be purchased
     *
     * @type {string}
     * @readonly
     */
    get quantityRuleMinimum(): string | undefined {
        return this.quantityRules?.minimum;
    }

    /**
     * The maximum quantity of the product that may be purchased
     *
     * @type {string}
     * @readonly
     */
    get quantityRuleMaximum(): string | undefined {
        return this.quantityRules?.maximum;
    }

    /**
     * The increment quantity of the product that is allowed to be be purchased
     *
     * @type {string}
     * @readonly
     */
    get quantityRuleIncrement(): string | undefined {
        return this.quantityRules?.increment;
    }

    /**
     * Get the label next to the inline quantity selector
     *
     * @type {string}
     * @readonly
     */
    get quantitySelectorLabelText(): string | undefined {
        return this.normalizedConfiguration?.quantitySelectorLabelText;
    }

    /**
     * Gets all the quantity rules (merge min, max and increment text into one line)
     *
     * @returns {string}
     *
     * @readonly
     * @private
     */
    get quantityRuleCombinedText(): string {
        const rules = [this.minimumText, this.maximumText, this.incrementText];
        return rules.filter((item) => item).join(' • ');
    }

    /**
     * Gets whether the Call To Action button is View Options button
     *
     * @returns {Boolean}
     *
     * @readonly
     * @private
     */
    private get isCTAButtonViewOptions(): boolean | undefined | null {
        // Show view options button if and only if:
        // 1 - If it's a variation parent product
        // 2 - If it's a product set
        // 3 - If it's a simple product with purchase rule
        return (
            this.normalizedDisplayData?.productClass === PRODUCT_CLASS.VARIATION_PARENT ||
            this.normalizedDisplayData?.productClass === PRODUCT_CLASS.SET ||
            ((this.normalizedDisplayData?.productClass === PRODUCT_CLASS.SIMPLE ||
                this.normalizedDisplayData?.productClass === PRODUCT_CLASS.VARIATION) &&
                this.quantityRules &&
                !this.normalizedConfiguration?.showQuantityRules)
        );
    }

    /**
     * Gets whether the Call To Action button is Add to cart button
     *
     * @returns {Boolean}
     *
     * @readonly
     * @private
     */
    private get isCTAButtonAddToCart(): boolean {
        return (
            this.normalizedDisplayData?.productClass === PRODUCT_CLASS.SIMPLE ||
            this.normalizedDisplayData?.productClass === PRODUCT_CLASS.VARIATION
        );
    }

    /**
     * Whether the to show inline quantity selector
     *
     * @returns {Boolean}
     *
     * @readonly
     * @private
     */
    private get showInlineQuantitySelector(): boolean {
        return !!(this.quantityRules && this.normalizedConfiguration?.showQuantityRules);
    }

    /**
     * Whether the to show inline quantity selector rules text
     *
     * @returns {Boolean}
     *
     * @readonly
     * @private
     */
    get showInlineQuantitySelectorText(): boolean {
        return !!(
            !this.isCTAButtonViewOptions &&
            this.normalizedConfiguration?.showQuantityRules &&
            this.normalizedConfiguration?.showQuantityRulesText &&
            this.normalizedDisplayData?.purchaseQuantityRule
        );
    }

    /**
     * Click event handler for product card which navigates to the product detail page
     * @fires ProductCard#showproduct
     * @private
     */
    private handleProductDetailPageNavigation(event: KeyboardEvent): void {
        event.preventDefault(); //prevent default added to handle browser history navigation
        const productId = this.normalizedDisplayData?.id;
        const productName = this.normalizedDisplayData?.name; // Short term need for LWR navigation context.

        this.dispatchEvent(
            new CustomEvent(EVENT.SHOW_PRODUCT_EVT, {
                bubbles: false,
                composed: false,
                detail: {
                    productId: productId,
                    productName: productName,
                },
            })
        );
    }

    /**
     * Whether to show price information.
     * Don't show price if both show listing and negotiated prices are disabled.
     * @type {Boolean} showPrice
     */
    get showPrice(): boolean {
        const { showListingPrice, showNegotiatedPrice } = this.normalizedConfiguration?.priceConfiguration || {};
        return !!(showListingPrice || showNegotiatedPrice);
    }

    /**
     * Gets or sets the classlist to apply to the internal div element
     *
     * @type {string}
     * @readonly
     */
    get quantitySelectorClassList(): string {
        const classes = [];
        if (this.showInlineQuantitySelector) {
            classes.push('quantitySelectorContainer');

            if (this.isGridLayout) {
                classes.push('stacked');
            }
        }
        return classes.join(' ');
    }

    /**
     *  Whether the to show showProductImage
     *
     * @return {boolean}
     */
    get showProductImage(): boolean {
        return this.normalizedConfiguration?.showProductImage ?? false;
    }

    /**
     *  Whether the to show showCallToActionButton
     *
     * @return {boolean}
     */
    get showCallToActionButton(): boolean {
        return this.normalizedConfiguration?.showCallToActionButton ?? false;
    }

    get callToActionButtonVariant(): string | number {
        return selectStyles(this.customStyles, 'cta-button-').variant || '';
    }

    /**
     * Handles the 'ADD_TO_CART' event.
     *
     * @param {string} productId - the ID of the product being added
     * @param {number} quantity - the quantity of the product being added
     */
    handleAddToCart(): void {
        if (!this.isAddToCartEnabled) {
            this.navigateToHome();
            return;
        }
        const quantity = this.quantityRules?.minimum || 1;
        const productId = this.normalizedDisplayData?.id;
        this.dispatchEvent(
            new CustomEvent(EVENT.ADD_PRODUCT_TO_CART_EVT, {
                detail: { quantity, productId },
            })
        );
    }

    @wire(NavigationContext)
    navContext!: LightningNavigationContext;

    /**
     * Handle the keydown event from product image and name.
     *
     * @param {Object} evt the event object
     */
    handleKeydown(evt: KeyboardEvent): void {
        if (evt.key === 'Enter') {
            this.handleProductDetailPageNavigation(evt);
        }
    }

    /**
     * Handler for the 'click' event fired from the add to cart button
     * which should redirect the user to the login page
     *
     * @private
     */
    navigateToHome(): void {
        navigate(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Login',
            },
        });
    }

    @wire(SessionContextAdapter)
    private sessionContext?: StoreAdapterCallbackEntry<SessionContext>;

    @wire(AppContextAdapter)
    private appContext?: StoreAdapterCallbackEntry<AppContext>;

    /**
     * If add to cart is enabled based on guest permission.
     * @private
     * @returns {Boolean}
     */
    get isAddToCartEnabled(): boolean | undefined {
        const isLoggedIn = this.sessionContext?.data?.isLoggedIn;
        const isGuestCartCheckoutEnabled = this.appContext?.data?.isGuestCartCheckoutEnabled;
        return isLoggedIn || (!isLoggedIn && isGuestCartCheckoutEnabled);
    }
}
