/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { LightningElement, api } from 'lwc';
import { MOBILE_OS_REGEX } from './constants';
import * as Labels from './labelUtils';

/**
 * CommonCarousel is a flexible carousel component for displaying either product images or product cards.
 * - Image carousel mode: for product detail image galleries.
 * - Product cards carousel mode: for horizontally scrolling product recommendations.
 *
 * Accessibility and SLDS best practices are followed. Emits 'productselected' event for card selection.
 * @fires CommonCarousel#productselected
 */
export default class CommonCarousel extends LightningElement {
    static renderMode = 'light';

    // Track dots state and observer
    dots = [];
    activeImageIndex = 0;
    _observer = null;

    /**
     * Configuration object containing language and other settings
     * @type {object}
     */
    @api configuration = {};

    /**
     * Optional heading for the carousel (not rendered by default).
     * @type {string}
     */
    @api heading;

    /**
     * @description Whether the component is rendering on a mobile device
     * @type {boolean}
     */
    get isMobile() {
        return MOBILE_OS_REGEX.test(navigator.userAgent);
    }
    // Private property for product data
    _productData = [];

    /**
     * Array of product card data objects for product card carousel mode.
     * @type {Array}
     */
    @api
    get productData() {
        return this._productData;
    }

    set productData(value) {
        this._productData = value || [];
        // Initialize dots array when product data changes
        this.updateDots();
    }

    /**
     * Determines carousel mode: 'productDetailImageCarousel' or 'productSearchRecommendations'.
     * @type {string}
     */
    @api displayMode;

    /**
     * Getter for the current language/locale
     * @returns {string} The current language/locale (defaults to 'en_US')
     */
    @api
    get language() {
        return this.configuration?.language || 'en_US';
    }

    // Private properties for product image links
    _productImageLinks = [];

    // API property with setter to trigger reactive updates
    @api
    get productImageLinks() {
        return this._productImageLinks;
    }

    set productImageLinks(value) {
        this._productImageLinks = value || [];
        // Initialize dots array when image links change
        this.updateDots();
    }

    /**
     * Get translated labels based on current language
     * @returns {object} Object with translated label strings
     */
    get i18n() {
        const language = this.language;
        return {
            previousImage: Labels.previousImage(language),
            nextImage: Labels.nextImage(language),
            previousProduct: Labels.previousProduct(language),
            nextProduct: Labels.nextProduct(language),
            productPrice: Labels.productPrice(language),
            outOfStock: Labels.outOfStock(language),
            showMoreProducts: Labels.showMoreProducts(language),
        };
    }

    // private property for showMoreProducts flag
    _showMoreProducts = false;

    /**
     * Sets the showMoreProducts property.
     * @param {boolean} value - The value to set for showMoreProducts.
     */
    @api
    set showMoreProducts(value) {
        this._showMoreProducts = value || false;
        // Initialize dots array when showMoreProducts changes
        if (this._showMoreProducts) {
            // calling update dots to render the additional dot for the "Show More" card
            this.updateDots();
        }
    }

    /**
     * Gets the showMoreProducts property. This is a flag to show the "Show More" card.
     * @returns {boolean} The value of showMoreProducts.
     */
    get showMoreProducts() {
        return this.hasProductData && this._showMoreProducts;
    }

    /**
     * Updates the dots array based on the number of images
     */
    updateDots() {
        if (this.isImageCarousel) {
            this.dots = this.filteredProductImageLinks?.map((imageLink, index) => ({
                url: imageLink.url,
                id: `image-${index}`,
                isActive: index === this.activeImageIndex,
            }));
        } else if (this.isProductCardsCarousel && this.hasProductData) {
            this.dots = this.productData?.map((_, index) => ({
                id: `product-${index}`,
                isActive: index === this.activeImageIndex,
            }));
            // Add an additional dot for the "Show More" card if needed
            if (this.showMoreProducts) {
                this.dots.push({
                    id: `show-more-card`,
                    isActive: this.activeImageIndex === this.productData.length,
                });
            }
        }
    }

    // Computed getter for filtered product images - updates reactively
    get filteredProductImageLinks() {
        if (Array.isArray(this._productImageLinks)) {
            return this._productImageLinks
                ?.filter((imageObj) => imageObj && imageObj.url && imageObj.url.trim() !== '')
                ?.map((imageObj, index) => ({
                    ...imageObj,
                    uniqueKey: `image-panel-${index}`,
                }));
        }
        return [];
    }

    setupAccessibility() {
        const scrollContainer = this.querySelector('.carousel-scroll-container');
        if (scrollContainer) {
            // Set appropriate aria-label based on carousel type
            if (this.isImageCarousel) {
                scrollContainer.setAttribute('role', 'region');
                scrollContainer.setAttribute('aria-label', 'Product Images');
            } else if (this.isProductCardsCarousel) {
                scrollContainer.setAttribute('role', 'region');
                scrollContainer.setAttribute('aria-label', 'Product Recommendations');
            }

            // Add single-item class for centering when there's only one item
            const carouselPanels = scrollContainer.querySelectorAll('.slds-carousel__panel');
            if (carouselPanels.length === 1) {
                scrollContainer.classList.add('single-item');
            } else {
                scrollContainer.classList.remove('single-item');
            }
        }
    }

    // Display mode getters
    get isImageCarousel() {
        // Backward compatibility: if no displayMode is set but productImageLinks exist, show image carousel
        if (!this.displayMode && Array.isArray(this._productImageLinks) && this._productImageLinks.length > 0) {
            return true;
        }
        return this.displayMode === 'productDetailImageCarousel';
    }

    get isProductCardsCarousel() {
        if (!this.displayMode && Array.isArray(this._productData) && this._productData.length > 0) {
            return true;
        }
        return this.displayMode === 'productSearchRecommendations';
    }

    get hasProductData() {
        return Array.isArray(this._productData) && this._productData.length > 0;
    }

    // Event handlers
    /**
     * Handles product card click, emitting 'productselected' with productName and productId.
     * @param {Event} event - The click event from the product card button.
     */
    handleShowProduct(event) {
        const productName = event.currentTarget.name;
        const productId = event.currentTarget.dataset.id;
        const productUrl = event.currentTarget.dataset.url;

        if (productName && productId) {
            this.dispatchEvent(
                new CustomEvent('productselected', {
                    detail: {
                        productName,
                        productId,
                        productUrl,
                    },
                    bubbles: true,
                    composed: true,
                })
            );
        }
    }

    /**
     * Handles the "Show More Products" action.
     * It dispatches an event 'showmoreproducts' with the product ids, indicating that the user wants to see more products.
     * @param {CustomEvent} event - The click event from the show more button.
     */
    handleShowMoreProducts(event) {
        event.stopPropagation();
        const showMoreProducts = true;
        const productIds = this.productData.map((product) => product.id);
        this.dispatchEvent(
            new CustomEvent('showmoreproducts', {
                detail: {
                    showMoreProducts,
                    productIds,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    /**
     * Handles click on indicator dots to navigate to specific image
     * @param {Event} event - Click event from indicator dot
     */
    handleDotClick(event) {
        const index = parseInt(event.currentTarget.dataset.index, 10);
        this.activeImageIndex = index;

        // Update dots array
        this.updateDots();

        // Find and scroll to the corresponding item
        const selector = this.isImageCarousel ? '.slds-carousel__panel' : '.product-card';
        const items = this.querySelectorAll(selector);
        if (items[index]) {
            items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
    }

    /**
     * Returns ARIA label for image indicator buttons
     * @returns {string} Localized aria label for viewing current item
     */
    get getImageAriaLabel() {
        const total = this.isImageCarousel ? this.filteredProductImageLinks.length : this.productData.length;
        const current = this.activeImageIndex + 1;

        if (this.isImageCarousel) {
            return Labels.viewImageAriaLabel(this.language, current, total);
        }
        return Labels.viewProductAriaLabel(this.language, current, total);
    }

    /**
     * Computed property to check if we're on the first image
     * @returns {boolean} True if currently viewing the first image/card
     */
    get isFirstImage() {
        return this.activeImageIndex === 0;
    }

    /**
     * Computed property to check if we're on the last image
     * @returns {boolean} True if currently viewing the last image/card
     */
    get isLastImage() {
        const total = this.isImageCarousel ? this.filteredProductImageLinks.length : this.productData.length;
        if (this.showMoreProducts) {
            return this.activeImageIndex === total;
        }
        return this.activeImageIndex === total - 1;
    }

    /**
     * Computed property to check if this is a multi-image carousel
     * @returns {boolean} True if carousel has more than one image/card
     */
    get displayCarouselArrows() {
        return !this.isMobile && this.imagesLength > 1;
    }

    get displayDots() {
        return this.imagesLength > 1;
    }

    get imagesLength() {
        return this.isImageCarousel ? this.filteredProductImageLinks.length : this.productData.length;
    }

    /**
     * Navigate to the previous image/card
     */
    handlePreviousImage() {
        if (this.activeImageIndex > 0) {
            this.activeImageIndex--;
            this.updateDots();
            this.scrollToIndex(this.activeImageIndex);
        }
    }

    /**
     * Navigate to the next image/card
     */
    handleNextImage() {
        const total = this.isImageCarousel ? this.filteredProductImageLinks.length : this.productData.length;
        if (this.activeImageIndex < (this.showMoreProducts ? total : total - 1)) {
            this.activeImageIndex++;
            this.updateDots();
            this.scrollToIndex(this.activeImageIndex);
        }
    }

    /**
     * Scroll to a specific index in the carousel
     * @param {number} index - The index to scroll to
     */
    scrollToIndex(index) {
        const selector = this.isImageCarousel ? '.slds-carousel__panel' : '.product-card';
        const items = this.querySelectorAll(selector);
        if (items[index]) {
            items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
    }

    /**
     * Observe intersection of carousel panels to update active dot
     */
    disconnectedCallback() {
        // Cleanup observer when component is destroyed
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    }

    /**
     * Sets up the IntersectionObserver for carousel items
     * @private
     */
    setupIntersectionObserver() {
        const scrollContainer = this.querySelector('.carousel-scroll-container');

        // Wait for the container to be properly laid out
        if (!scrollContainer || !scrollContainer.offsetWidth) {
            // Container not ready yet
            return;
        }

        // The IntersectionObserver constructor creates a new IntersectionObserver object.
        // The callback function is called when the intersection of the target element with the root element changes.
        this._observer = new IntersectionObserver(
            (entries) => {
                // Find the most visible item
                let maxRatio = 0;
                let mostVisibleIndex = -1;

                entries.forEach((entry) => {
                    const currentIndex = parseInt(entry.target.dataset.index, 10);
                    const totalItems = this.isImageCarousel
                        ? this.filteredProductImageLinks.length
                        : this.productData.length;
                    const isLastItem = currentIndex === totalItems - 1;

                    if (entry.isIntersecting) {
                        // For the last item, we consider it most visible if it's more than 30% visible
                        if (isLastItem && entry.intersectionRatio >= 0.3) {
                            maxRatio = entry.intersectionRatio;
                            mostVisibleIndex = currentIndex;
                        }
                        // For other items, use normal comparison but require more visibility
                        else if (!isLastItem && entry.intersectionRatio > maxRatio && entry.intersectionRatio > 0.4) {
                            maxRatio = entry.intersectionRatio;
                            mostVisibleIndex = currentIndex;
                        }
                    }
                });

                // Only update if we found a visible item and it's different from current
                if (mostVisibleIndex !== -1 && mostVisibleIndex !== this.activeImageIndex) {
                    this.activeImageIndex = mostVisibleIndex;
                    this.updateDots();
                }
            },
            {
                root: scrollContainer, // The element that is used as the viewport for checking visibility of the target elements.
                rootMargin: '0px',
                threshold: [0, 0.25, 0.5, 0.75, 1.0], // The threshold at which the callback is invoked. The values are percentages of the target's size.
            }
        );

        // Select the appropriate elements to observe based on carousel type
        const selector = this.isImageCarousel ? '.slds-carousel__panel' : '.product-card';
        const items = this.querySelectorAll(selector);

        items.forEach((item, index) => {
            // Ensure each item has a data-index attribute
            item.dataset.index = index.toString();
            this._observer.observe(item); // The IntersectionObserver.observe() method is used to start observing a specified target element.
        });
    }

    // Lifecycle methods
    renderedCallback() {
        this.setupAccessibility();

        // Only set up observer if it hasn't been initialized yet and we have a carousel
        if (!this._observer && (this.isImageCarousel || this.isProductCardsCarousel)) {
            this.setupIntersectionObserver();
        }
    }
}
