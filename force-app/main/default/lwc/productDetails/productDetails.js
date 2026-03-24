/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { api, LightningElement } from 'lwc';
import * as Labels from './labelUtils';

export default class ProductDetails extends LightningElement {
    static renderMode = 'light';

    // Global registry to track the latest component instance
    static _latestInstance = null;
    static _instanceCounter = 0;

    // Instance-specific ID
    _instanceId = null;

    _productData;
    _originalProductData; // Store original product data to preserve base price

    @api
    get product() {
        return this._productData;
    }

    set product(value) {
        this._productData = value;
        // Preserve original product data when first set
        if (value && !this._originalProductData) {
            this._originalProductData = { ...value };
        }
    }

    /**
     * Get the original base product price before any variant pricing
     * @returns {number|null} The original base product price
     */
    get originalPrice() {
        return this._originalProductData?.pr || null;
    }

    @api entryId = '';

    /**
     * @description Configuration object that may contain language settings
     * @type {object}
     */
    @api configuration = {};

    /**
     * @description Tracks whether the express payment component has finished loading
     * @type {boolean}
     */
    isExpressLoaded = false;

    /**
     * @description Tracks whether the express payment is available
     * @type {boolean}
     */
    isExpressAvailable = false;

    /**
     * Get the current language for translations.
     * Falls back to English ('en_US') if no language is configured.
     * @returns {string} The current language code (e.g., 'en_US', 'es', 'fr')
     */
    @api
    get language() {
        return this.configuration?.language || 'en_US';
    }

    /**
     * Get translated labels based on current language
     * @returns {object} Object with translated label strings
     */
    @api
    get i18n() {
        const language = this.language;
        return {
            addToCartAssistiveText: Labels.addToCartAssistiveText(language),
            quantityLabelAssistiveText: Labels.quantityLabelAssistiveText(language),
            currentPriceAssistiveText: Labels.currentPriceAssistiveText(language),
            originalPriceAssistiveText: Labels.originalPriceAssistiveText(language),
            pricingSectionAssistiveText: Labels.pricingSectionAssistiveText(language),
            featuresSectionAssistiveText: Labels.featuresSectionAssistiveText(language),
            variantsSectionAssistiveText: Labels.variantsSectionAssistiveText(language),
            quantitySectionAssistiveText: Labels.quantitySectionAssistiveText(language),
            quantityControlsAssistiveText: Labels.quantityControlsAssistiveText(language),
            decreaseQuantityAssistiveText: Labels.decreaseQuantityAssistiveText(language),
            increaseQuantityAssistiveText: Labels.increaseQuantityAssistiveText(language),
            loadingSpinnerAltText: Labels.loadingSpinnerAltText(language),
            // Additional labels
            quantityLabelText: Labels.quantityLabelText(language),
            originalPriceLabelText: Labels.originalPriceLabelText(language),
            currentPriceLabelText: Labels.currentPriceLabelText(language),
            strikethroughAssistiveText: Labels.strikethroughAssistiveText(language),
        };
    }

    _selectedVariants = {};

    get selectedVariants() {
        return this._selectedVariants;
    }

    set selectedVariants(value) {
        const previousSku = this.sku;
        this._selectedVariants = value;
        const newSku = this.sku;

        // Update SKU in express payment iframe if it changed
        if (previousSku !== newSku) {
            this.updateExpressPaymentSku(newSku);
        }
    }

    // This is used to determine if "ANY" variant and its option is orderable.
    isAnyVariantOrderable = false;

    get productImageLinks() {
        return this.getFilteredImages();
    }

    get productVariants() {
        return this._productData?.vattr || [];
    }

    /**
     * Initializes the selected variants object with default values from vattr.
     * If a variant has a 'selected' property, it will be used as the default value.
     * @returns {object} Object containing the initial selected variants
     */
    get initialSelectedVariants() {
        if (!this.productVariants?.length) {
            return {};
        }

        return this.productVariants.reduce((accSelectedVariants, variant) => {
            if (variant?.selected) {
                accSelectedVariants[variant.id] = variant.selected;
            }
            if (variant?.opts?.length === 1 && this.isVariantOrderable(variant.id, variant.opts[0].val)) {
                accSelectedVariants[variant.id] = variant.opts[0].val;
            }
            return accSelectedVariants;
        }, {});
    }

    /**
     * Filters the variant matrix to find variants that match all currently selected variant values.
     * Used to determine available combinations and their prices.
     * @returns {Array} Array of matching variants from the variant matrix
     */
    getFilteredVariants() {
        if (!this._productData?.vmat?.length || !Object.keys(this.selectedVariants).length) {
            return [];
        }

        return this._productData.vmat.filter((variant) => {
            return Object.entries(this.selectedVariants).every(([key, value]) => {
                return variant?.vars?.[key] === value;
            });
        });
    }

    /**
     * Filters product images based on the selected color variant.
     * If a color is selected, returns images for that color variant.
     * If no color is selected or no matching images found, returns default images.
     * @param {string} viewType - The image group view type to filter by (e.g., 'large', 'swatch'). Defaults to 'large'.
     * @param {string} optionvalue - The variant value (e.g., color) to filter images for. Defaults to undefined.
     * @returns {Array} Array of image objects for the selected color variant with baseUrl prepended to url values
     */
    getFilteredImages(viewType = 'large', optionvalue = undefined) {
        if (!this._productData?.imgGroups?.length) {
            return [];
        }

        const colorValue = optionvalue || this.selectedVariants?.color;
        const baseUrl = this._productData?.baseUrl;

        const defaultImages = this._productData?.imgGroups?.[0]?.imgs || [];
        // If no color is selected, return default images with baseUrl prepended
        if (!colorValue) {
            return defaultImages.map((img) => {
                let processedUrl = img.url || '';
                // Always substitute 'large' with 'medium' in the URL for better performance
                if (processedUrl.includes('/large/')) {
                    processedUrl = processedUrl.replace('/large/', '/medium/');
                }
                return {
                    ...img,
                    url: baseUrl + processedUrl,
                };
            });
        }

        const filteredGroups = this._productData.imgGroups.filter((imageGroup) => {
            return (
                imageGroup?.viewType === viewType &&
                imageGroup?.vattr?.some((attr) => attr?.id === 'color' && attr?.vals?.some((val) => val === colorValue))
            );
        });

        // If we found filtered groups, return their images with baseUrl prepended
        if (filteredGroups?.[0]?.imgs && baseUrl) {
            return filteredGroups[0].imgs.map((img) => {
                let processedUrl = img.url || '';
                // Always substitute 'large' with 'medium' in the URL for better performance
                if (processedUrl.includes('/large/')) {
                    processedUrl = processedUrl.replace('/large/', '/medium/');
                }
                return {
                    ...img,
                    url: baseUrl + processedUrl,
                };
            });
        }

        // Fallback: return default images with baseUrl prepended for any viewType
        return defaultImages.map((img) => {
            let processedUrl = img.url || '';
            // Always substitute 'large' with 'medium' in the URL for better performance
            if (processedUrl.includes('/large/')) {
                processedUrl = processedUrl.replace('/large/', '/medium/');
            }
            return {
                ...img,
                url: baseUrl + processedUrl,
            };
        });
    }

    /**
     * Handle all postMessage events
     * @param {Event} event - The window message event
     * @returns {void}
     */
    handleWindowMessage(event) {
        // Handle customer data from PWA (always process)
        if (event?.data?.type === 'express.actualCustomerData') {
            localStorage.setItem('expressPaymentCustomerId', event?.data?.payload?.customerId);
            localStorage.setItem('expressPaymentAuthToken', event?.data?.payload?.authToken);
            return;
        }

        // Handle basket data requests (only process if this is the latest instance)
        if (event?.data?.type === 'basketDataRequested') {
            // Only respond if this is the latest instance
            if (ProductDetails._latestInstance !== this) {
                return;
            }
            this.sendAuthData();
        }
    }

    connectedCallback() {
        // Register this instance as the latest
        this._instanceId = ++ProductDetails._instanceCounter;
        ProductDetails._latestInstance = this;

        this.selectedVariants = this.initialSelectedVariants;

        // Set up single message listener for all message types (bind this context)
        this._boundMessageHandler = this.handleWindowMessage.bind(this);
        window.addEventListener('message', this._boundMessageHandler);
        window.parent.postMessage(
            {
                type: 'lwc.getCustomerData',
                timestamp: Date.now(),
            },
            '*'
        );
    }

    disconnectedCallback() {
        // Clean up message listener
        if (this._boundMessageHandler) {
            window.removeEventListener('message', this._boundMessageHandler);
            this._boundMessageHandler = null;
        }

        // If this was the latest instance, clear the registry
        if (ProductDetails._latestInstance === this) {
            ProductDetails._latestInstance = null;
        }
    }

    /**
     * Generates the CSS class string for variant buttons based on their state.
     * Includes classes for color variants, selected state, and disabled state.
     * @param {object} variant - The variant object containing id and other properties
     * @param {boolean} disabled - Whether the variant button is disabled based on orderability
     * @param {object} option - The option object containing value and isOrderable status
     * @returns {string} CSS class string for the variant button
     */
    getVariantClass(variant, disabled, option) {
        return `variant-button ${variant.id === 'color' ? 'color-button' : ''} ${disabled ? 'disabled' : ''} ${
            this.selectedVariants[variant.id] === option.val ? 'selected' : ''
        }`;
    }

    /**
     * Checks if a specific variant option is available for ordering.
     * When variants are selected, it checks if the option is available in combination
     * with the currently selected variants. When no variants are selected, it checks
     * if the option exists in any matrix variant.
     * @param {string} variantId - The ID of the variant type (e.g., 'color', 'size')
     * @param {string} optionValue - The value of the specific option to check
     * @returns {boolean} True if the variant option is orderable, false otherwise
     */
    isVariantOrderable(variantId, optionValue) {
        if (!this._productData?.vmat?.length || !variantId || !optionValue) {
            return false;
        }

        const selectedVariants = this.selectedVariants;
        const hasSelectedVariants = Object.keys(selectedVariants).length > 0;

        return this._productData.vmat.some((matrixVariant) => {
            // Check if this matrix variant has the option we're looking for
            if (matrixVariant?.vars?.[variantId] !== optionValue) {
                return false;
            }

            // Check if the matrix variant is orderable
            if (matrixVariant?.ord === false) {
                return false;
            }

            // If no variants are selected, just check if the option exists and is orderable
            if (!hasSelectedVariants) {
                return true;
            }

            // If variants are selected, check if this matrix variant matches all selected variants
            return this._matchesSelectedVariants(matrixVariant, selectedVariants, variantId);
        });
    }

    /**
     * Helper method to check if a matrix variant matches the currently selected variants
     * @param {object} matrixVariant - The variant matrix entry to check
     * @param {object} selectedVariants - Currently selected variants
     * @param {string} excludeVariantId - Variant ID to exclude from matching (the one being checked)
     * @returns {boolean} True if the matrix variant matches all selected variants
     */
    _matchesSelectedVariants(matrixVariant, selectedVariants, excludeVariantId) {
        return Object.entries(selectedVariants).every(([key, value]) => {
            // Skip the variant we're currently checking
            if (key === excludeVariantId) {
                return true;
            }
            // Check if the matrix variant has the same value for this selected variant
            return matrixVariant?.vars?.[key] === value;
        });
    }

    toggleToOtherSelectedVariants(clickedVariant, clickedVariantValue) {
        const availableVariantForSelection = this._productData.vmat.find((variant) => {
            // Check if variant has vars property and it's not undefined
            if (!variant || !variant.vars) {
                return false;
            }
            return (
                variant.vars[clickedVariant] === clickedVariantValue &&
                variant.ord !== false &&
                Object.keys(variant.vars).length === this.productVariants.length
            );
        });
        if (availableVariantForSelection) {
            this.selectedVariants = { ...this.selectedVariants, ...availableVariantForSelection.vars };
        }
    }

    /**
     * Generates the variant options for the product.
     * @returns {Array} Array of variant options
     */
    get variantOptions() {
        if (!this.productVariants?.length) {
            return [];
        }
        return this.productVariants.map((variant) => {
            // Find the selected option to get its name
            const selectedOption = variant?.opts?.find((option) => option.val === this.selectedVariants[variant.id]);
            const selectedValue = selectedOption?.name || this.selectedVariants[variant.id] || '';
            return {
                ...variant,
                selectedValue: selectedValue,
                options: Array.isArray(variant?.opts)
                    ? variant.opts.reduce((acc, option) => {
                          if (!option?.val) {
                              return acc;
                          }
                          const isOrderable = this.isVariantOrderable(variant.id, option.val);
                          this.isAnyVariantOrderable = this.isAnyVariantOrderable || isOrderable;
                          const imageUrl = this.getFilteredImages('swatch', option.val)[0]?.url;
                          const isSelected = this.selectedVariants[variant.id] === option.val;
                          return [
                              ...acc,
                              {
                                  ...option,
                                  value: option.val, // Add value property for compatibility
                                  disabled: !isOrderable,
                                  isColor: variant.id === 'color',
                                  ariaPressed: isSelected,
                                  ariaLabel: this.generateAccessibleLabel(variant, option, isSelected),
                                  class: this.getVariantClass(variant, !isOrderable, { ...option }),
                                  style: `background-image: url(${imageUrl})`,
                              },
                          ];
                      }, [])
                    : [],
            };
        });
    }

    /**
     * Generates accessible labels for variant options
     * @param {object} variant - The variant object
     * @param {object} option - The option object
     * @param {boolean} isSelected - Whether the option is selected
     * @returns {string} Accessible label
     */
    generateAccessibleLabel(variant, option, isSelected) {
        const status = isSelected ? 'selected' : 'not selected';
        const availability = option.disabled ? 'unavailable' : 'available';
        return `${option.name} ${variant.lbl}, ${status}, ${availability}`;
    }

    /**
     * Resolves the correct product ID based on whether the product is a simple product
     * or a variant product.
     *
     * - For **simple products** (no variant attributes), returns the base product ID.
     * - For **variant products**, finds the matching variant in the variant matrix (`vmat`)
     *   based on currently selected variant values and returns its `pid`.
     * - If no match is found or the variant is not orderable, falls back to the first match
     *   or the base product ID.
     * @returns {string|null} The resolved product ID (variant `pid` or base product `id`), or `null` if unavailable.
     */
    _getResolvedProductId() {
        const hasVariants = Array.isArray(this._productData?.vattr) && this._productData.vattr.length > 0;

        if (!hasVariants) {
            // Simple product → use base id
            return this._productData?.id;
        }

        // Variant product → find the matching row in vmat
        const matches = this.getFilteredVariants();
        const chosen = matches.find((m) => m?.ord !== false) || matches[0];

        return chosen?.pid || this._productData?.id;
    }
    /**
     * Fires 'addtocart' event with the product name as detail.
     */
    handleAddToCart() {
        const variantDetails = Object.entries(this.selectedVariants).map(([variantId, variantValue]) => {
            const variantDef = this.productVariants.find((v) => v.id === variantId);
            const variantLabel = variantDef?.lbl || variantId;
            const option = variantDef?.opts?.find((opt) => opt.val === variantValue);
            const displayName = option?.name || variantValue;
            return {
                id: variantId,
                label: variantLabel,
                value: variantValue,
                displayName: displayName,
            };
        });

        const detail = {
            quantity: this.quantity,
            productName: this._productData.name,
            productId: this._getResolvedProductId(),
            variantDetails,
        };

        this.dispatchEvent(
            new CustomEvent('addtocart', {
                detail: detail,
            })
        );
    }

    handleVariantClick(event) {
        this.isAnyVariantOrderable = false;
        const variantName = event.currentTarget.dataset.variantName;
        const variantValue = event.currentTarget.dataset.value;
        const isOutOfStock = event.currentTarget.dataset.outOfStock;
        if (isOutOfStock && isOutOfStock === 'true') {
            this.toggleToOtherSelectedVariants(variantName, variantValue);
        } else {
            // Use a new object for reactivity
            this.selectedVariants = { ...this.selectedVariants, [variantName]: variantValue };
        }
        const filteredVariants = this.getFilteredVariants();
        if (filteredVariants.length > 0) {
            this._productData = {
                ...this._productData,
                pr: filteredVariants[0].pr || this.originalPrice,
            };
        }
    }

    get quantityConfig() {
        return {
            minQuantity: this.product?.quantity?.minQuantity || 1,
            increment: this.product?.quantity?.increment || 1,
            maxQuantity: this.product?.quantity?.maxQuantity || 100000,
        };
    }

    _quantity;

    @api
    get quantity() {
        if (!this._quantity) {
            this._quantity = this.quantityConfig.minQuantity;
        }
        return this._quantity;
    }
    set quantity(value) {
        const newQuantity = Number(value) || this.quantityConfig.minQuantity;
        this._quantity = newQuantity;

        // Update express payment quantity if available
        if (this.isExpressAvailable) {
            this.updateExpressPaymentQuantity(newQuantity);
        }
    }

    increment() {
        if (this._quantity < this.quantityConfig.maxQuantity) {
            this._quantity = this._quantity + this.quantityConfig.increment;

            // Update express payment quantity if available
            if (this.isExpressAvailable) {
                this.updateExpressPaymentQuantity(this._quantity);
            }
        }
    }

    decrement() {
        if (this._quantity > this.quantityConfig.minQuantity) {
            this._quantity = this._quantity - this.quantityConfig.increment;

            // Update express payment quantity if available
            if (this.isExpressAvailable) {
                this.updateExpressPaymentQuantity(this._quantity);
            }
        }
    }

    get isIncrementDisabled() {
        const hasMaxQuantity = this.quantityConfig?.maxQuantity !== null;
        const atMaxQuantity = hasMaxQuantity && this._quantity >= this.quantityConfig.maxQuantity;
        const variantsUnavailable = this.productVariants?.length > 0 && !this.isAnyVariantOrderable;
        return atMaxQuantity || variantsUnavailable;
    }

    get isDecrementDisabled() {
        const hasMinQuantity = this.quantityConfig?.minQuantity !== null;
        const atMinQuantity = hasMinQuantity && this._quantity <= this.quantityConfig.minQuantity;
        const variantsUnavailable = this.productVariants?.length > 0 && !this.isAnyVariantOrderable;
        return atMinQuantity || variantsUnavailable;
    }

    get isAddToCartDisabled() {
        return Object.keys(this.selectedVariants).length !== this.productVariants.length;
    }

    /**
     * Gets the unit price for the express payment iframe URL.
     * The server reads this as the initial amount displayed in the Apple Pay / Google Pay sheet.
     * Quantity is communicated separately via UPDATE_QUANTITY postMessage.
     * @returns {number|null} Unit price, or null if unavailable
     */
    get expressPaymentPrice() {
        const unitPrice = this._productData?.pr?.cur;
        return typeof unitPrice === 'number' ? unitPrice : null;
    }

    /**
     * @description Gets the express payment URL safely handling null product
     * @returns {string} Express payment URL
     */
    get expressPaymentUrl() {
        const constructed = this._constructExpressPaymentUrl();
        if (constructed !== 'null') {
            return constructed;
        }
        return this.product?.expressPaymentUrl ?? 'null';
    }

    /**
     * Constructs express payment URL from localStorage context values.
     * Checks for SFRA site (localizedUrl) first, then PWA site (pwaDomainUrl, pwaSiteId, pwaLocale).
     * Returns 'null' if no valid context is found in localStorage.
     * @returns {string} Constructed URL or 'null' if no context is available
     * @private
     */
    _constructExpressPaymentUrl() {
        try {
            const localizedUrl = localStorage.getItem('localizedUrl');
            if (localizedUrl) {
                return localizedUrl.replace('demandware.servlet', 'demandware.store') + '/Payments-Express';
            }

            const pwaDomainUrl = localStorage.getItem('pwaDomainUrl');
            const pwaSiteId = localStorage.getItem('pwaSiteId');
            const pwaLocale = localStorage.getItem('pwaLocale');

            // Return 'null' if any of the required values are missing
            if (!pwaDomainUrl || !pwaSiteId || !pwaLocale) {
                return 'null';
            }

            return `${pwaDomainUrl}/${pwaSiteId}/${pwaLocale}/express`;
        } catch (error) {
            return 'null';
        }
    }

    /**
     * @description Handles the expressLoaded event from c-express-payment component
     * @param {CustomEvent} event - The expressloaded event containing availability detail
     */
    handleExpressLoaded(event) {
        this.isExpressLoaded = true;
        this.isExpressAvailable = event.detail?.available || false;

        // Send initial SKU and quantity to the iframe once it's loaded
        if (this.isExpressAvailable) {
            this.updateExpressPaymentSku(this.sku);
            this.updateExpressPaymentQuantity(this.quantity);
        }
    }

    /**
     * @description Gets the CSS classes for the loading container that wraps express payment and buttons.
     * @returns {string} CSS classes based on loading state.
     */
    get loadingContainerClass() {
        const baseClasses = 'loading-container';
        return this.isExpressLoaded ? `${baseClasses} loaded` : baseClasses;
    }

    /**
     * @description Gets the CSS classes for the express payment container.
     * @returns {string} CSS classes based on loading state and availability.
     */
    get expressContainerClass() {
        const baseClasses = 'express-container slds-col';
        return this.isExpressLoaded ? `${baseClasses} slds-p-bottom_x-small` : baseClasses;
    }

    /**
     * @description Gets the inline styles for the express container to visually hide it if not available.
     * This is necessary because the component needs to remain in the DOM to fire events.
     * @returns {string} CSS styles to hide/show the express container.
     */
    get expressContainerStyle() {
        return this.isExpressLoaded && !this.isExpressAvailable ? 'display: none;' : '';
    }

    /**
     * @description Determines if the add to cart button should be displayed.
     * @returns {boolean} True if the add to cart button should be visible.
     */
    get shouldShowAddToCartButton() {
        return this.isExpressLoaded;
    }

    /**
     * @description Gets the variant for the add to cart button based on express payment availability.
     * @returns {string} Button variant - 'secondary' if express payment is available, 'primary' otherwise.
     */
    get addToCartButtonVariant() {
        return this.isExpressAvailable ? 'secondary' : 'primary';
    }

    get sku() {
        const hasVariants = Array.isArray(this._productData?.vattr) && this._productData.vattr.length > 0;

        if (!hasVariants) {
            // Simple product → use base id
            return this._productData?.id || null;
        }

        // Variant product → find the matching variant in vmat
        const matchingVariant = this._productData?.vmat?.find((variant) => {
            return Object.entries(this.selectedVariants).every(([key, value]) => {
                return variant?.vars?.[key] === value;
            });
        });

        // Return the product ID (pid) for the matching variant, or null if no match
        return matchingVariant?.pid || null;
    }

    /**
     * Get the currency code from the product data
     * @returns {string} The currency code (e.g., 'USD')
     */
    get ccy() {
        return this._productData?.ccy || null;
    }

    /**
     * Update the SKU in the express payment iframe via postMessage
     * @param {string} sku - The product SKU to update to
     */
    updateExpressPaymentSku(sku) {
        if (!sku) {
            return;
        }
        const expressPaymentComponent = this.querySelector('c-express-payment');
        if (expressPaymentComponent) {
            expressPaymentComponent.updateSku(sku);
        }
    }

    /**
     * Update the quantity in the express payment iframe via postMessage
     * @param {number} quantity - The quantity to update to
     */
    updateExpressPaymentQuantity(quantity) {
        const expressPaymentComponent = this.querySelector('c-express-payment');
        if (expressPaymentComponent) {
            expressPaymentComponent.updateQuantity(quantity);
        }
    }

    /**
     * Sends basket data via postMessage to the express payment iframe
     */
    sendAuthData() {
        const authData = {
            customerId: localStorage.getItem('expressPaymentCustomerId'),
            authToken: localStorage.getItem('expressPaymentAuthToken'),
            currency: this.ccy,
        };

        try {
            // Try to send basket data to the express payment component
            const expressPaymentComponent = this.querySelector('c-express-payment');
            if (expressPaymentComponent) {
                expressPaymentComponent.sendCheckoutData(null, authData);
            }
        } catch (error) {
            console.warn(`Failed to send authentication data postMessage (Component ${this._instanceId}):`, error);
        }
    }
}
