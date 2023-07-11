/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api, track, wire } from 'lwc';
import { isCmsResource, resolve } from 'experience/resourceResolver';
import { generateUrl, navigate, NavigationContext } from 'lightning/navigation';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { createImageDataMap } from 'experience/picture';
import { calculateImageSizes, imageSizesDefined } from 'c/productGalleryUtils';
import { CartStatusAdapter } from 'commerce/cartApi';
import { EVENT, PRODUCT_CLASS, QUANTITY_RULES } from './constants';
import { i18n } from './labels';
/**
 * An event fired when the add to cart button is clicked.
 * @event SearchProductCard#addproducttocart
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {string} detail.productId
 *   The unique identifier of the product to be added to the cart.
 * @property {number} detail.quantity
 *   The quantity of the product to be added to the cart.
 */

/**
 * An event fired when the user indicates a desire to view the details of a product.
 * @event SearchProductCard#showproduct
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {string} detail.productId
 *   The unique identifier of the product.
 * @property {string} detail.productName
 *   The name of the product.
 */

/**
 * The product card display-data.
 * @typedef {object} ProductCardData
 * @property {string} id
 *  The ID of the card item.
 * @property {string} name
 *  The name of the card item.
 * @property {(FieldValueData & FieldValueDetailData[])} fields
 *  The fields belonging to the card item.
 * @property {ProductSearchMediaData} image
 *  The image display-data.
 * @property {ProductSearchPricesData} prices
 *  The prices display-data.
 * @property {?string} productClass
 *  Type of the product(Variation, VariationParent or Simple).
 * @property {?PurchaseQuantityRuleData} purchaseQuantityRule
 *  Represents a rule that restricts the quantity of a product that may be purchased.
 * @property {?ProductAttributeSetSummary} variationAttributeSet
 *  A product variation attribute set
 * @property {?ProductSellingModelInformationData} productSellingModelInformation
 *  A product's selling model information.
 */

/**
 * @typedef {object} ProductSellingModelInformationData
 * @property {boolean} isSubscriptionProduct
 *  Whether the product is a subscription product.
 */

/**
 * The field value display-data.
 * @typedef {object} FieldValueData
 * @property {?string} value
 *  Value of the field.
 */

/**
 * The image display-data.
 * @typedef {object} ProductSearchMediaData
 * @property {string} url
 *  The URL of the card image.
 * @property {string} alternateText
 *  Alternative text for the card image.
 */

/**
 * @typedef {object} ProductMediaData
 * @augments ProductSearchMediaData
 * @property {Array<ImageData>} images
 *  An array of (sub)images, typically used for defining different resources
 *  for different form factors.
 */

/**
 * @typedef {object} ImageData
 * @property {string} sizes
 *  defines a set of source sizes, each containing a media condition and a size value
 * @property {string} srcSet
 *  defines image sources containing an url followed by a whitespace and either a width descriptor or pixel density
 * @property {string} [media]
 *  media condition that defines breakpoint
 *  optional - if unset the SLDS default can be used by setting the _`formFactor`_
 * @property {('mobile' | 'tablet' | 'desktop')} [formFactor]
 *  the SLDS breakpoints for different screen sizes
 */

/**
 * The prices display-data.
 * @typedef {object} ProductSearchPricesData
 * @property {string} [listingPrice]
 *  The list price for the card item.
 * @property {string} [negotiatedPrice]
 *  The negotiated price for the card item.
 * @property {string} [currencyIsoCode]
 *  The ISO 4217 currency code of all card item prices in the search result.
 * @property {boolean} isLoading
 *  Whether the price is in the loading state.
 */

/**
 * Representation of Builder Field Item
 * @typedef {object} BuilderFieldItem
 * @property {string} name
 *  The name of the field.
 * @property {string} label
 *  The display label of the field.
 * @property {string} type
 *  The type of the field.
 * @property {boolean} showLabel
 *  Whether to show the field label.
 * @property {string} fontSize
 *  The font size of the field.
 *  Accepted values are: "small", "medium", and "large"
 * @property {string} fontColor
 *  Font color for the field, as 'rgb', 'rgba' or 'hex' CSS value.
 */

/**
 * The field display data value.
 * @typedef {object} FieldValueDetailData
 * @property {string} name
 *  The name of the field.
 * @property {string} label
 *  The display label of the field.
 * @property {string} type
 *  The type of the field.
 * @property {string} value
 *  The value of the field.
 * @property {boolean} tabStoppable
 *  The tabStoppable will be assigned accordingly to make only one field in the
 *  card lot to be tab-stoppable in keyboard navigation.
 */

/**
 * The Card UI configuration.
 * @typedef {object} ProductCardConfiguration
 * @property {boolean} addToCartDisabled
 *  Whether the add to cart button is disabled.
 * @property {string} addToCartButtonText
 *  The text for the Add to Cart button, a type of "Call to Action" button.
 * @property {string} addToCartButtonProcessingText
 *  The text for the Add to Cart button when cart is processing, a type of "Call to Action" button.
 * @property {string} layout
 *  The layout for the card collection. Card also requires this field for
 *  grid/list layout generation.
 * @property {boolean} showCallToActionButton
 *  Whether to show the "Call to Action" button.
 * @property {boolean} showProductImage
 *  Whether to show the product image.
 * @property {string} viewOptionsButtonText
 *  The text for the View Options button, a type of "Call to Action" button.
 * @property {boolean} showQuantitySelector
 *  Whether to show the quantity rules and inline quantity selector in product card.
 * @property {string} minimumQuantityGuideText
 *  The text showing the minimum quantity value of a product.
 * @property {string} maximumQuantityGuideText
 *  The text showing the maximum quantity value of a product.
 * @property {string} incrementQuantityGuideText
 *  The text showing the increment quantity value of a product.
 * @property {boolean} showQuantityRulesText
 *  Whether to show the quantity rules text in product card.
 * @property {string} quantitySelectorLabelText
 *  The text showing label next to inline quantity selector
 * @property {ResultsFieldConfiguration} fieldConfiguration
 *  The field UI configuration as a map with the field name as key.
 * @property {ProductSearchPriceConfiguration} priceConfiguration
 *  The price UI configuration.
 */

/**
 * The field UI configuration.
 * @typedef {object} ResultsFieldConfiguration
 * @property {boolean} showLabel
 *  Whether to show the field label.
 * @property {string} fontSize
 *  The font size of the field.
 *  Accepted values are: "small", "medium", and "large"
 * @property {string} fontColor
 *  Font color for the field, as 'rgb', 'rgba' or 'hex' CSS value.
 */

/**
 * The price UI configuration.
 * @typedef {object} ProductSearchPriceConfiguration
 * @property {boolean} showNegotiatedPrice
 *  Whether to show the negotiated price.
 * @property {boolean} showListingPrice
 *  Whether to show the original/list price.
 */

/**
 * @typedef {object} ProductAttributeSetSummary
 * @property {?string} apiName
 *  The API name of the attribute set.
 * @property {?string} label
 *  The label of the attribute set.
 * @property {ProductAttributeSummary[]} attributes
 *  The attributes inside the attribute set.
 */

/**
 * @typedef {object} ProductAttributeSummary
 * @property {string} apiName
 *  The API name of the attribute.
 * @property {string} label
 *  The label of the attribute.
 * @property {number} sequence
 *  The attribute's sequence.
 *  @property {string} value
 *  The attribute value.
 */

/**
 * @typedef {object} ProductField
 * @property {(FieldValueData & FieldValueDetailData)} displayData
 *  The UI display data.
 * @property {ResultsFieldConfiguration} configuration
 *  The field UI configuration.
 */

/**
 * @typedef {object} PurchaseQuantityRuleData
 * @property {number} minimum The minimum allowed value
 * @property {number} maximum The maximum allowed value
 * @property {number} increment The allowed step/increment size
 */

/**
 * A UI control to show a product card.
 * @fires SearchProductCard#addproducttocart
 * @fires SearchProductCard#showproduct
 */
export default class SearchProductCard extends LightningElement {
    static renderMode = 'light';
    @track
    _imageSizes = {
        mobile: 0,
        tablet: 0,
        desktop: 0,
    };
    _displayData;
    _navigationContext;
    _productUrl;
    @wire(NavigationContext)
    wiredNavigationContext(context) {
        this._navigationContext = context;
        this.updateCallToActionButtonUrl();
    }
    @wire(SessionContextAdapter)
    sessionContext;
    @wire(AppContextAdapter)
    appContext;

    @wire(CartStatusAdapter)
    cartStatus;

    /**
     * Gets or sets the card display-data.
     * @type {?ProductCardData}
     */
    @api
    set displayData(data) {
        this._displayData = data;
        this.updateCallToActionButtonUrl();
    }
    get displayData() {
        return this._displayData;
    }

    /**
     * Gets or sets the card UI configuration.
     * @type {?ProductCardConfiguration}
     */
    @api
    configuration;

    @api
    focus() {
        if (this.configuration?.showCallToActionButton) {
            const focusTarget = this.querySelector('c-common-link') || this.querySelector('c-common-button');
            focusTarget?.focus();
        } else {
            const index = this.fields?.findIndex((field) => field.displayData.tabStoppable) || 0;
            const focusTarget = Array.from(this.querySelectorAll('c-search-product-field'))[index];
            focusTarget?.focus();
        }
    }

    /**
     * Gets the prices display-data.
     * @type {ProductSearchPricesData}
     * @readonly
     * @private
     */
    get pricingInfo() {
        const prices = this.displayData?.prices;
        return {
            negotiatedPrice: prices?.negotiatedPrice ?? '',
            listingPrice: prices?.listingPrice ?? '',
            currencyIsoCode: prices?.currencyIsoCode ?? '',
            isLoading: !!prices?.isLoading,
        };
    }

    /**
     * Gets the aria-label for the Add to Cart button, a type of CTA button
     * @type {string}
     * @readonly
     * @private
     */
    get addToCartButtonAriaLabel() {
        if (this.displayData?.name) {
            return i18n.addToCartAriaLabel.replace('{productTitle}', this.displayData.name);
        }
        return '';
    }

    /**
     * Gets the aria-label for the View Options button, a type of CTA button
     * @type {string}
     * @readonly
     * @private
     */
    get viewOptionsButtonAriaLabel() {
        if (this.displayData?.name) {
            return i18n.viewOptionsAriaLabel.replace('{productTitle}', this.displayData.name);
        }
        return '';
    }

    /**
     * Gets a value merged representations of BuilderFieldItem.
     * @type {ProductField[]}}
     * @readonly
     * @private
     */
    get fields() {
        return (this.displayData?.fields ?? []).map((field) => {
            return {
                displayData: field,
                configuration: this.configuration?.fieldConfiguration[field.name] ?? {},
            };
        });
    }

    /**
     * Gets the default image
     * @type {ProductMediaData}
     * @readonly
     * @private
     */
    get image() {
        calculateImageSizes(this.querySelector('.imageArea'), this._imageSizes);
        const img = this.displayData?.image;
        return {
            alternateText: img?.alternateText ?? '',
            url: resolve(img?.url ?? '', false, {
                height: 460,
                width: 460,
            }),
            images:
                img?.url && isCmsResource(img?.url) && imageSizesDefined(this._imageSizes)
                    ? createImageDataMap(img.url, this._imageSizes, [1, 2])
                    : [],
        };
    }

    /**
     * Gets the container class for the card. The container class will vary
     * depending upon the layout property.
     * @type {string}
     * @readonly
     * @private
     */
    get cardContainerClass() {
        return this.isGridLayout ? 'cardContainerGrid' : 'cardContainerList';
    }

    /**
     * Gets whether the layout is grid or not.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isGridLayout() {
        return this.configuration?.layout === 'grid';
    }

    /**
     * Gets the variant to apply to the action buttons.
     * @type {('primary' | 'secondary' | 'tertiary')}
     * @readonly
     * @private
     */
    get actionButtonVariant() {
        const section = this?.querySelector('section');
        const variant =
            section && getComputedStyle(section).getPropertyValue('--ref-c-search-product-card-button-variant');
        return ['primary', 'secondary', 'tertiary'].includes(variant) ? variant : 'primary';
    }

    /**
     * Get the text for minimum quantity guide
     * @type {?string}
     * @readonly
     * @private
     */
    get minimumText() {
        const min = Number.parseInt(this.quantityRules?.minimum ?? '', 10);
        return this.configuration?.minimumQuantityGuideText.replace('{0}', `${min}`);
    }

    /**
     * Get the text for maximum quantity guide
     * @type {?string}
     * @readonly
     * @private
     */
    get maximumText() {
        const max = Number.parseInt(this.quantityRules?.maximum ?? '', 10);
        return this.configuration?.maximumQuantityGuideText.replace('{0}', `${max}`);
    }

    /**
     * Get the text for increment quantity guide
     * @type {?string}
     * @readonly
     * @private
     */
    get incrementText() {
        const increment = Number.parseInt(this.quantityRules?.increment ?? '', 10);
        return this.configuration?.incrementQuantityGuideText.replace('{0}', `${increment}`);
    }

    /**
     * Whether the quantity provided is valid
     * @type {boolean}
     * @private
     */
    isQuantityValid = true;

    /**
     * Gets or sets whether the 'add to cart' button is disabled
     * @type {boolean}
     * @readonly
     * @private
     */
    get addToCartButtonDisabled() {
        return this.isCartProcessing || this.configuration?.addToCartDisabled || !this.isQuantityValid;
    }

    /**
     * The computed text for add to cart button.
     * @type {?string}
     * @readonly
     * @private
     */
    get addToCartButtonText() {
        return this.isCartProcessing && this.configuration?.addToCartButtonProcessingText
            ? this.configuration?.addToCartButtonProcessingText
            : this.configuration?.addToCartButtonText;
    }

    /**
     * Handler for the 'validationchanged' event fired from the
     * 'quantity-selector'
     * @param {CustomEvent} evt the event object
     * @private
     */
    handleValueChanged(evt) {
        this.isQuantityValid = evt.detail.isValid;
    }

    /**
     * Get all the quantity rules for quantity selector
     * @type {?PurchaseQuantityRuleData}
     * @readonly
     * @private
     */
    get quantityRules() {
        if (!this.displayData?.purchaseQuantityRule && this.configuration?.showQuantitySelector) {
            return {
                minimum: QUANTITY_RULES.DEFAULT_MIN.toString(),
                maximum: QUANTITY_RULES.DEFAULT_MAX.toString(),
                increment: QUANTITY_RULES.DEFAULT_INCREMENT.toString(),
            };
        }
        return this.displayData?.purchaseQuantityRule;
    }

    /**
     * The minimum quantity of the product that may be purchased
     * @type {?string}
     * @readonly
     * @private
     */
    get quantityRuleMinimum() {
        return this.quantityRules?.minimum;
    }

    /**
     * The maximum quantity of the product that may be purchased
     * @type {?string}
     * @readonly
     * @private
     */
    get quantityRuleMaximum() {
        return this.quantityRules?.maximum;
    }

    /**
     * The increment quantity of the product that is allowed to be purchased
     * @type {?string}
     * @readonly
     * @private
     */
    get quantityRuleIncrement() {
        return this.quantityRules?.increment;
    }

    /**
     * Get the label next to the inline quantity selector
     * @type {?string}
     * @readonly
     * @private
     */
    get quantitySelectorLabelText() {
        return this.configuration?.quantitySelectorLabelText;
    }

    /**
     * Gets all the quantity rules (merge min, max and increment text into one line)
     * @type {string}
     * @readonly
     * @private
     */
    get quantityRuleCombinedText() {
        const rules = [this.minimumText, this.maximumText, this.incrementText];
        return rules.filter((item) => item).join(' • ');
    }

    /**
     * Gets whether the "Call To Action" button is View Options button
     * @type {boolean}
     * @readonly
     * @private
     */
    get isCTAButtonViewOptions() {
        return (
            this.displayData?.productClass === PRODUCT_CLASS.VARIATION_PARENT ||
            this.displayData?.productClass === PRODUCT_CLASS.SET ||
            ((this.displayData?.productClass === PRODUCT_CLASS.SIMPLE ||
                this.displayData?.productClass === PRODUCT_CLASS.VARIATION) &&
                Boolean(this.quantityRules) &&
                !this.configuration?.showQuantitySelector) ||
            this.isSubscriptionProduct
        );
    }

    /**
     * Gets whether the "Call To Action" button is Add to cart button
     * @type {boolean}
     * @readonly
     * @private
     */
    get isCTAButtonAddToCart() {
        return (
            this.displayData?.productClass === PRODUCT_CLASS.SIMPLE ||
            this.displayData?.productClass === PRODUCT_CLASS.VARIATION
        );
    }

    /**
     * Whether the to show inline quantity selector
     * @type {boolean}
     * @readonly
     * @private
     */
    get showInlineQuantitySelector() {
        return !!(this.quantityRules && this.configuration?.showQuantitySelector);
    }

    /**
     * Whether the to show inline quantity selector rules text
     * @type {boolean}
     * @readonly
     * @private
     */
    get showInlineQuantitySelectorText() {
        return !!(
            !this.isCTAButtonViewOptions &&
            this.configuration?.showQuantitySelector &&
            this.configuration?.showQuantityRulesText &&
            this.displayData?.purchaseQuantityRule
        );
    }

    /**
     * Click event handler for product card which navigates to the product detail page
     * @param {MouseEvent | KeyboardEvent} event The mouse event on click
     * @private
     * @fires SearchProductCard#showproduct
     */
    handleProductDetailPageNavigation(event) {
        event.preventDefault();
        const productId = this.displayData?.id;
        const productName = this.displayData?.name;

        this.dispatchEvent(
            new CustomEvent(EVENT.SHOW_PRODUCT_EVT, {
                detail: {
                    productId,
                    productName,
                },
            })
        );
    }

    /**
     * Whether the product is a subscription product
     * @type {boolean}
     * @readonly
     * @private
     */
    get isSubscriptionProduct() {
        return this.displayData?.productSellingModelInformation?.isSubscriptionProduct ?? false;
    }
    get subscriptionOptionsLabelText() {
        return i18n.subscriptionOptionLabel;
    }

    /**
     * Whether to show price information.
     * Don't show price if both show listing and negotiated prices are disabled.
     * @type {boolean}
     * @readonly
     * @private
     */
    get showPrice() {
        const { showListingPrice, showNegotiatedPrice } = this.configuration?.priceConfiguration || {};
        return !!(showListingPrice || showNegotiatedPrice);
    }
    get showNegotiatedPrice() {
        return !!this.configuration?.priceConfiguration?.showNegotiatedPrice;
    }
    get showOriginalPrice() {
        return !!this.configuration?.priceConfiguration?.showListingPrice;
    }

    /**
     * Gets the class list to apply to the internal div element
     * @type {string}
     * @readonly
     * @private
     */
    get quantitySelectorClassList() {
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
     * Whether to show the showProductImage
     * @type {boolean}
     * @readonly
     * @private
     */
    get showProductImage() {
        return this.configuration?.showProductImage ?? false;
    }

    /**
     * Whether to show the showCallToActionButton
     * @type {boolean}
     * @readonly
     * @private
     */
    get showCallToActionButton() {
        return this.configuration?.showCallToActionButton ?? false;
    }

    /**
     * Gets whether the cart is processing or still loading.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isCartProcessing() {
        return !!this.cartStatus?.data?.isProcessing || !!this.cartStatus?.loading;
    }

    /**
     * If add to cart is enabled based on guest permission.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isAddToCartEnabled() {
        const isLoggedIn = Boolean(this.sessionContext?.data?.isLoggedIn);
        const guestCartEnabled = Boolean(this.appContext?.data?.guestCartEnabled);
        return isLoggedIn || guestCartEnabled;
    }
    renderedCallback() {
        calculateImageSizes(this.querySelector('.imageArea'), this._imageSizes);
    }
    handleAddToCart() {
        if (!this.isAddToCartEnabled) {
            this.navigateToLogin();
            return;
        }
        if (this.isCartProcessing) {
            return;
        }
        const productId = this.displayData?.id;
        const quantity = this.quantityRules?.minimum || 1;
        this.dispatchEvent(
            new CustomEvent(EVENT.ADD_PRODUCT_TO_CART_EVT, {
                detail: {
                    productId,
                    quantity,
                },
            })
        );
    }

    /**
     * Handle the keydown event from product image and name.
     * @param {KeyboardEvent} evt the event object
     * @private
     */
    handleKeydown(evt) {
        if (evt.key === 'Enter') {
            this.handleProductDetailPageNavigation(evt);
        }
    }

    /**
     * Handler for the 'click' event fired from the add to cart button
     * which should redirect the user to the login page
     * @private
     */
    navigateToLogin() {
        navigate(this._navigationContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Login',
            },
        });
    }
    updateCallToActionButtonUrl() {
        if (this._navigationContext && this?._displayData?.id) {
            this._productUrl = generateUrl(this._navigationContext, {
                type: 'standard__recordPage',
                attributes: {
                    objectApiName: 'Product2',
                    recordId: this._displayData.id,
                    actionName: 'view',
                },
            });
        }
    }
}
