/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';
import {
    addToCartAssistiveText,
    quantityLabelAssistiveText,
    currentPriceAssistiveText,
    originalPriceAssistiveText,
    pricingSectionAssistiveText,
    featuresSectionAssistiveText,
    variantsSectionAssistiveText,
    quantitySectionAssistiveText,
    quantityControlsAssistiveText,
    decreaseQuantityAssistiveText,
    increaseQuantityAssistiveText,
    loadingSpinnerAltText,
} from './labels';

export default class ProductDetails extends LightningElement {
    static renderMode = 'light';

    _productData;
    @api
    get product() {
        return this._productData;
    }

    set product(value) {
        this._productData = value;
    }

    @api entryId = '';

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

    i18n = {
        addToCartAssistiveText,
        quantityLabelAssistiveText,
        currentPriceAssistiveText,
        originalPriceAssistiveText,
        pricingSectionAssistiveText,
        featuresSectionAssistiveText,
        variantsSectionAssistiveText,
        quantitySectionAssistiveText,
        quantityControlsAssistiveText,
        decreaseQuantityAssistiveText,
        increaseQuantityAssistiveText,
        loadingSpinnerAltText,
    };

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
            return defaultImages.map((img) => ({
                ...img,
                url: baseUrl + (img.url || ''),
            }));
        }

        const filteredGroups = this._productData.imgGroups.filter((imageGroup) => {
            return (
                imageGroup?.viewType === viewType &&
                imageGroup?.vattr?.some((attr) => attr?.id === 'color' && attr?.vals?.some((val) => val === colorValue))
            );
        });

        // If we found filtered groups, return their images with baseUrl prepended
        if (filteredGroups?.[0]?.imgs && baseUrl) {
            return filteredGroups[0].imgs.map((img) => ({
                ...img,
                url: baseUrl + (img.url || ''),
            }));
        }

        // Fallback: for large view type, return default images with baseUrl prepended; otherwise return empty array
        return viewType === 'large'
            ? defaultImages.map((img) => ({
                  ...img,
                  url: baseUrl + (img.url || ''),
              }))
            : [];
    }

    connectedCallback() {
        this.selectedVariants = this.initialSelectedVariants;
    }

    /**
     * Generates the CSS class string for variant buttons based on their state.
     * Includes classes for color variants, selected state, and disabled state.
     * @param {object} variant - The variant object containing id and other properties
     * @param {boolean} disabled - Whether the variant button is disabled based on orderability
     * @param {object} option - The option object containing value and isOrderable status
     * @returns {string} CSS class string for the variant button
     */
    getVariantClass(variant, disabled = false, option) {
        return `variant-button ${variant.id === 'color' ? 'color-button' : ''} ${disabled ? 'disabled' : ''} ${
            this.selectedVariants[variant.id] === option.val ? 'selected' : ''
        }`;
    }

    /**
     * Checks if a specific variant option is available for ordering.
     * Verifies if the variant exists in the matrix and is marked as orderable.
     * @param {string} variantId - The ID of the variant type (e.g., 'color', 'size')
     * @param {string} optionValue - The value of the specific option to check
     * @returns {boolean} True if the variant option is orderable, false otherwise
     */
    isVariantOrderable(variantId, optionValue) {
        if (!this._productData?.vmat?.length || !variantId || !optionValue) {
            return false;
        }
        return this._productData.vmat.some((matrixVariant) => {
            return (
                matrixVariant?.vars?.[variantId] === optionValue &&
                (matrixVariant?.ord === undefined || matrixVariant?.ord === null || matrixVariant?.ord !== false)
            );
        });
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
            return this._productData?.id || null;
        }

        // Variant product → find the matching row in vmat
        const matches = this.getFilteredVariants();
        const chosen = matches.find((m) => m?.ord !== false) || matches[0];

        return chosen?.pid || this._productData?.id || null;
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
        const variantName = event.currentTarget.dataset.variantName;
        const variantValue = event.currentTarget.dataset.value;
        // Use a new object for reactivity
        this.selectedVariants = { ...this.selectedVariants, [variantName]: variantValue };
        const filteredVariants = this.getFilteredVariants();
        if (filteredVariants.length > 0) {
            this._productData = {
                ...this._productData,
                pr: filteredVariants[0].pr || this._productData.pr,
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
        this._quantity = Number(value) || this.quantityConfig.minQuantity;
    }

    increment() {
        if (this._quantity < this.quantityConfig.maxQuantity) {
            this._quantity = this._quantity + this.quantityConfig.increment;
        }
    }

    decrement() {
        if (this._quantity > this.quantityConfig.minQuantity) {
            this._quantity = this._quantity - this.quantityConfig.increment;
        }
    }

    get isIncrementDisabled() {
        return this._quantity >= this.quantityConfig.maxQuantity;
    }

    get isDecrementDisabled() {
        return this._quantity <= this.quantityConfig.minQuantity;
    }

    get isAddToCartDisabled() {
        return Object.keys(this.selectedVariants).length !== this.productVariants.length;
    }

    get expressPaymentUrl() {
        return this.product?.expressPaymentUrl || '';
    }

    /**
     * @description Handles the expressLoaded event from c-express-payment component
     * @param {CustomEvent} event - The expressloaded event containing availability detail
     */
    handleExpressLoaded(event) {
        this.isExpressLoaded = true;
        this.isExpressAvailable = event.detail?.available || false;

        // Send initial SKU to the iframe once it's loaded
        if (this.isExpressAvailable) {
            this.updateExpressPaymentSku(this.sku);
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
        // Find the variant that matches all selected variants
        const matchingVariant = this._productData?.vmat?.find((variant) => {
            return Object.entries(this.selectedVariants).every(([key, value]) => {
                return variant?.vars?.[key] === value;
            });
        });

        // Return the product ID (pid) for the matching variant, or null if no match
        return matchingVariant?.pid || null;
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
}
