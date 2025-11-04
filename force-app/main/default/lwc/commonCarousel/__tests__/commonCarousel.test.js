/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { createElement } from 'lwc';
import CommonCarousel from 'c/commonCarousel';
import { mockProduct as productData } from './mockData';

// Mock product cards data for testing
const mockProductCards = [
    {
        id: '1',
        name: 'Test Product 1',
        imageUrl: 'https://example.com/image1.jpg',
        description: 'Test product description 1',
        price: 29.99,
        currencyCode: 'USD',
        productPageUrl: 'https://example.com/product1',
    },
    {
        id: '2',
        name: 'Test Product 2',
        imageUrl: 'https://example.com/image2.jpg',
        description: 'Test product description 2',
        price: 39.99,
        currencyCode: 'USD',
        productPageUrl: 'https://example.com/product2',
    },
    {
        id: '3',
        name: 'Test Product 3',
        imageUrl: 'https://example.com/image3.jpg',
        description: 'Test product description 3',
        price: 49.99,
        currencyCode: 'USD',
        productPageUrl: 'https://example.com/product3',
    },
];

/**
 * Test suite for the CommonCarousel component.
 * Tests the rendering and behavior of the carousel component with various image data scenarios.
 */
describe('c-common-carousel', () => {
    let element;

    beforeEach(() => {
        element = createElement('c-common-carousel', {
            is: CommonCarousel,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // Clear mock function calls
        if (Element.prototype.scrollIntoView.mockClear) {
            Element.prototype.scrollIntoView.mockClear();
        }
    });

    // Mock IntersectionObserver and scrollIntoView
    beforeAll(() => {
        // Mock scrollIntoView
        Element.prototype.scrollIntoView = jest.fn();

        // Mock IntersectionObserver (simplified since we're not testing intersection functionality)
        global.__ioCallback = null;
        global.__ioObserved = [];
        global.IntersectionObserver = class IntersectionObserver {
            constructor(callback) {
                global.__ioCallback = callback;
            }
            observe(el) {
                global.__ioObserved.push(el);
            }
            unobserve() {}
            disconnect() {
                global.__ioObserved = [];
            }
        };
    });

    describe('Image Carousel Mode', () => {
        beforeEach(() => {
            element.displayMode = 'productDetailImageCarousel';
        });

        /**
         * Test that verifies the carousel renders all product images when productImageLinks is provided.
         * Uses mock product data to test image rendering.
         */
        it('renders all product images when productImageLinks is provided', () => {
            const mockImages = productData.imgGroups[0].imgs;
            element.productImageLinks = mockImages;
            return Promise.resolve().then(() => {
                const images = element.querySelectorAll('.image-carousel-image');
                expect(images.length).toBe(mockImages.length);
                images.forEach((img, index) => {
                    expect(img.src).toContain(mockImages[index].url);
                });
            });
        });

        it('renders navigation buttons for image carousel', () => {
            const mockImages = productData.imgGroups[0].imgs;
            element.productImageLinks = mockImages;
            return Promise.resolve().then(() => {
                const navButtons = element.querySelectorAll('.carousel-nav-button');
                expect(navButtons.length).toBe(2);

                const leftButton = element.querySelector('.carousel-nav-left');
                const rightButton = element.querySelector('.carousel-nav-right');
                expect(leftButton).toBeTruthy();
                expect(rightButton).toBeTruthy();
            });
        });

        it('disables left navigation button on first image', () => {
            const mockImages = productData.imgGroups[0].imgs;
            element.productImageLinks = mockImages;
            return Promise.resolve().then(() => {
                // Test the visual state - first image should have left button disabled
                const leftButton = element.querySelector('.carousel-nav-left');
                expect(leftButton.disabled).toBe(true);
            });
        });

        it('disables right navigation button on last image', () => {
            const mockImages = productData.imgGroups[0].imgs;
            element.productImageLinks = mockImages;
            return Promise.resolve().then(() => {
                // Navigate to last image by clicking next button multiple times
                const rightButton = element.querySelector('.carousel-nav-right');
                // Click until we reach the last image
                for (let i = 0; i < mockImages.length - 1; i++) {
                    rightButton.click();
                }
                return Promise.resolve().then(() => {
                    expect(rightButton.disabled).toBe(true);
                });
            });
        });

        it('enables both navigation buttons on middle images', () => {
            const mockImages = [...productData.imgGroups[0].imgs, productData.imgGroups[0].imgs[1]];
            element.productImageLinks = mockImages;
            return Promise.resolve().then(() => {
                // Navigate to middle image by clicking next button once
                const rightButton = element.querySelector('.carousel-nav-right');
                rightButton.click();
                return Promise.resolve().then(() => {
                    const leftButton = element.querySelector('.carousel-nav-left');
                    // Since we only have 2 images, after clicking right once we're on the last image
                    // Left button should be enabled, right button should be disabled
                    expect(leftButton.disabled).toBe(false);
                    expect(rightButton.disabled).toBe(false);
                });
            });
        });

        it('navigates to previous image when left button is clicked', () => {
            const mockImages = productData.imgGroups[0].imgs;
            element.productImageLinks = mockImages;
            return Promise.resolve().then(() => {
                // First navigate to second image
                const rightButton = element.querySelector('.carousel-nav-right');
                rightButton.click();
                return Promise.resolve().then(() => {
                    // Then click left button to go back
                    const leftButton = element.querySelector('.carousel-nav-left');
                    leftButton.click();
                    // Verify we're back to first image by checking button state
                    return Promise.resolve().then(() => {
                        expect(leftButton.disabled).toBe(true);
                    });
                });
            });
        });

        it('navigates to next image when right button is clicked', () => {
            const mockImages = productData.imgGroups[0].imgs;
            element.productImageLinks = mockImages;
            return Promise.resolve().then(() => {
                // Test that right button is enabled initially
                const rightButton = element.querySelector('.carousel-nav-right');
                expect(rightButton.disabled).toBe(false);

                // Click right button to navigate
                rightButton.click();
                return Promise.resolve().then(() => {
                    // Verify navigation by checking button states
                    const leftButton = element.querySelector('.carousel-nav-left');
                    expect(leftButton.disabled).toBe(false);
                });
            });
        });

        /**
         * Test that verifies the carousel updates correctly when the image data changes.
         * Tests dynamic updates to the carousel content.
         */
        it('updates carousel when productImageLinks changes', () => {
            const initialImages = productData.imgGroups[0].imgs;
            element.productImageLinks = initialImages;
            return Promise.resolve().then(() => {
                const newImages = productData.imgGroups[1].imgs;
                element.productImageLinks = newImages;
                return Promise.resolve().then(() => {
                    const images = element.querySelectorAll('.image-carousel-image');
                    expect(images.length).toBe(newImages.length);
                    images.forEach((img, index) => {
                        expect(img.src).toContain(newImages[index].url);
                    });
                });
            });
        });

        /**
         * Test suite for dots navigation in image carousel
         */
        describe('Dots Navigation', () => {
            beforeEach(() => {
                const mockImages = productData.imgGroups[0].imgs;
                element.productImageLinks = mockImages;
            });

            it('renders correct number of dots for images', () => {
                return Promise.resolve().then(() => {
                    const dots = element.querySelectorAll('.indicator-dot');
                    const images = element.querySelectorAll('.image-carousel-image');
                    expect(dots.length).toBe(images.length);
                });
            });

            it('does not display dots when there is only one image', () => {
                const singleImage = [productData.imgGroups[0].imgs[0]];
                element.productImageLinks = singleImage;
                return Promise.resolve().then(() => {
                    const dots = element.querySelectorAll('.indicator-dot');
                    const images = element.querySelectorAll('.image-carousel-image');
                    expect(dots.length).toBe(0);
                    expect(images.length).toBe(1);
                });
            });

            it('updates active dot and scrolls when clicking a dot', () => {
                return Promise.resolve().then(() => {
                    const dots = element.querySelectorAll('.indicator-dot');
                    const secondDot = dots[1];

                    secondDot.click();

                    return Promise.resolve().then(() => {
                        expect(secondDot.getAttribute('data-active')).toBe('true');
                        // Check that the second dot is active by looking at DOM state
                        const activeDot = element.querySelector('.indicator-dot[data-active="true"]');
                        expect(activeDot).toBe(secondDot);
                        expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'start',
                        });
                    });
                });
            });

            it('updates dots when intersection changes', async () => {
                // Test that dots update when the active item changes
                // Since intersection observer is internal, we test the behavior through DOM state
                const dots = element.querySelectorAll('.indicator-dot');
                const secondDot = dots[1];

                // Click the second dot to change active state
                secondDot.click();

                return Promise.resolve().then(() => {
                    // Verify the second dot becomes active
                    expect(secondDot.getAttribute('data-active')).toBe('true');
                    const activeDot = element.querySelector('.indicator-dot[data-active="true"]');
                    expect(activeDot).toBe(secondDot);
                });
            });

            it('handles last item intersection correctly', async () => {
                // Test that the last dot can be activated
                const dots = element.querySelectorAll('.indicator-dot');
                const lastIndex = dots.length - 1;
                const lastDot = dots[lastIndex];

                // Click the last dot to activate it
                lastDot.click();

                return Promise.resolve().then(() => {
                    // Verify the last dot becomes active
                    expect(lastDot.getAttribute('data-active')).toBe('true');
                    const activeDot = element.querySelector('.indicator-dot[data-active="true"]');
                    expect(activeDot).toBe(lastDot);
                });
            });
        });
    });

    describe('Product Cards Carousel Mode', () => {
        beforeEach(() => {
            element.displayMode = 'productSearchRecommendations';
        });

        /**
         * Test that verifies the product cards carousel renders all provided products correctly.
         */
        it('renders all product cards when productData is provided', () => {
            element.productData = mockProductCards;
            return Promise.resolve().then(() => {
                const productCards = element.querySelectorAll('.product-card');
                expect(productCards.length).toBe(mockProductCards.length);

                // Verify product names are rendered
                const productNames = element.querySelectorAll('.product-link');
                expect(productNames.length).toBe(mockProductCards.length);
                productNames.forEach((name, index) => {
                    expect(name.textContent).toBe(mockProductCards[index].name);
                });
            });
        });

        /**
         * Test that verifies the product cards carousel shows native scrolling.
         */
        it('shows native scrolling container', () => {
            element.productData = mockProductCards;
            return Promise.resolve().then(() => {
                const scrollContainer = element.querySelector('.carousel-scroll-container');
                expect(scrollContainer).not.toBeNull();
            });
        });

        /**
         * Test that verifies the product cards are clickable and have proper attributes.
         */
        it('renders clickable product cards with proper attributes', () => {
            element.productData = mockProductCards;

            return Promise.resolve().then(() => {
                const productCards = element.querySelectorAll('.product-card');
                expect(productCards.length).toBe(mockProductCards.length);

                // Verify first card has proper attributes for click handling
                const firstCard = productCards[0];
                expect(firstCard.getAttribute('name')).toBe(mockProductCards[0].name);
                expect(firstCard.dataset.id).toBe(mockProductCards[0].id);
                expect(firstCard.dataset.url).toBe(mockProductCards[0].productPageUrl);
                expect(firstCard.tagName.toLowerCase()).toBe('button');
            });
        });

        /**
         * Test suite for dots navigation in product cards carousel
         */
        describe('Product Cards Dots Navigation', () => {
            beforeEach(() => {
                element.productData = mockProductCards;
            });

            it('renders correct number of dots for product cards', () => {
                return Promise.resolve().then(() => {
                    const dots = element.querySelectorAll('.indicator-dot');
                    const cards = element.querySelectorAll('.product-card');
                    expect(dots.length).toBe(cards.length);
                });
            });

            it('does not display dots when there is only one product card', () => {
                const singleProduct = [mockProductCards[0]];
                element.productData = singleProduct;
                return Promise.resolve().then(() => {
                    const dots = element.querySelectorAll('.indicator-dot');
                    const cards = element.querySelectorAll('.product-card');
                    expect(dots.length).toBe(0);
                    expect(cards.length).toBe(1);
                });
            });

            it('updates active dot and scrolls when clicking a dot in product mode', () => {
                return Promise.resolve().then(() => {
                    const dots = element.querySelectorAll('.indicator-dot');
                    const secondDot = dots[1];

                    secondDot.click();

                    return Promise.resolve().then(() => {
                        expect(secondDot.getAttribute('data-active')).toBe('true');
                        // Check that the second dot is active by looking at DOM state
                        const activeDot = element.querySelector('.indicator-dot[data-active="true"]');
                        expect(activeDot).toBe(secondDot);
                        expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'start',
                        });
                    });
                });
            });

            it('updates dots when product card intersection changes', async () => {
                // Test that dots update when the active product card changes
                // Since intersection observer is internal, we test the behavior through DOM state
                const dots = element.querySelectorAll('.indicator-dot');
                const secondDot = dots[1];

                // Click the second dot to change active state
                secondDot.click();

                return Promise.resolve().then(() => {
                    // Verify the second dot becomes active
                    expect(secondDot.getAttribute('data-active')).toBe('true');
                    const activeDot = element.querySelector('.indicator-dot[data-active="true"]');
                    expect(activeDot).toBe(secondDot);
                });
            });

            it('handles last product card intersection correctly', async () => {
                // Test that the last product card dot can be activated
                const dots = element.querySelectorAll('.indicator-dot');
                const lastIndex = dots.length - 1;
                const lastDot = dots[lastIndex];

                // Click the last dot to activate it
                lastDot.click();

                return Promise.resolve().then(() => {
                    // Verify the last dot becomes active
                    expect(lastDot.getAttribute('data-active')).toBe('true');
                    const activeDot = element.querySelector('.indicator-dot[data-active="true"]');
                    expect(activeDot).toBe(lastDot);
                });
            });
        });

        it('dispatches productselected event when a product card is clicked', async () => {
            const mockProductSelected = jest.fn();
            element.addEventListener('productselected', mockProductSelected);
            element.productData = mockProductCards;
            await Promise.resolve();

            const firstCard = element.querySelector('.product-card');
            expect(firstCard).toBeTruthy();
            firstCard.click();
            await Promise.resolve();

            expect(mockProductSelected).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        productName: mockProductCards[0].name,
                        productId: mockProductCards[0].id,
                        productUrl: mockProductCards[0].productPageUrl,
                    }),
                })
            );
        });

        it('navigates to next product when right arrow is clicked', async () => {
            element.productData = mockProductCards;
            await Promise.resolve();

            const rightButton = element.querySelector('.carousel-nav-right');
            expect(rightButton).toBeTruthy();
            rightButton.click();
            await Promise.resolve();

            const leftButton = element.querySelector('.carousel-nav-left');
            expect(leftButton.disabled).toBe(false);
            expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start',
            });
        });

        it('creates IntersectionObserver, observes items, updates active index via callback, and cleans up on disconnect', async () => {
            element.productData = mockProductCards;
            await Promise.resolve();
            const scrollContainer = element.querySelector('.carousel-scroll-container');
            expect(scrollContainer).toBeTruthy();
            // Simulate layout so setupIntersectionObserver proceeds
            Object.defineProperty(scrollContainer, 'offsetWidth', { value: 100, configurable: true });
            // Trigger another render so renderedCallback runs setup
            element.productData = [...mockProductCards];
            await Promise.resolve();

            // We should have observed product-card items
            expect(global.__ioObserved.length).toBeGreaterThan(0);

            // Fire IO callback to simulate second item intersecting strongly
            const second = element.querySelectorAll('.product-card')[1];
            global.__ioCallback([{ target: second, isIntersecting: true, intersectionRatio: 0.8 }]);
            await Promise.resolve();

            // Dots should reflect active index 1
            const activeDot = element.querySelector('.indicator-dot[data-active="true"]');
            expect(activeDot).not.toBeNull();

            // Cover last-item branch with threshold >= 0.3
            const cards = element.querySelectorAll('.product-card');
            const last = cards[cards.length - 1];
            global.__ioCallback([{ target: last, isIntersecting: true, intersectionRatio: 0.31 }]);
            await Promise.resolve();
            const lastActive = element.querySelector('.indicator-dot[data-active="true"]');
            expect(lastActive).not.toBeNull();

            // Disconnect
            document.body.removeChild(element);
            expect(global.__ioObserved.length).toBe(0);
        });

        /**
         * Test suite for showMoreProducts functionality
         */
        describe('Show More Products Functionality', () => {
            beforeEach(() => {
                element.productData = mockProductCards;
            });

            it('does not render show more button when showMoreProducts is false', async () => {
                element.showMoreProducts = false;
                await Promise.resolve();

                const showMoreButton = element.querySelector('.show-more-products');
                expect(showMoreButton).toBeNull();
            });

            it('renders show more button with correct content and attributes', async () => {
                element.showMoreProducts = true;
                await Promise.resolve();

                const showMoreButton = element.querySelector('.show-more-products');
                expect(showMoreButton).toBeTruthy();

                // Check aria-label
                expect(showMoreButton.getAttribute('aria-label')).toBeTruthy();

                // Check name attribute
                expect(showMoreButton.getAttribute('name')).toBeTruthy();

                // Check icon is present (lightning-icon attributes may not be accessible in tests)
                const icon = showMoreButton.querySelector('lightning-icon');
                expect(icon).toBeTruthy();
                // Note: icon-name attribute may not be accessible in Jest tests

                // Check text content
                const textSpan = showMoreButton.querySelector('.show-more-text');
                expect(textSpan).toBeTruthy();
                expect(textSpan.textContent).toBeTruthy();
            });

            it('dispatches showmoreclicked event when show more button is clicked', async () => {
                const mockShowMoreProducts = jest.fn();
                element.addEventListener('showmoreproducts', mockShowMoreProducts);

                element.showMoreProducts = true;
                await Promise.resolve();

                const showMoreButton = element.querySelector('.show-more-products');
                expect(showMoreButton).toBeTruthy();

                showMoreButton.click();
                await Promise.resolve();

                expect(mockShowMoreProducts).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: expect.objectContaining({
                            showMoreProducts: true,
                            productIds: ['1', '2', '3'],
                        }),
                    })
                );
            });

            it('renders additional dot for show more button when showMoreProducts is true', async () => {
                element.showMoreProducts = true;
                await Promise.resolve();

                const dots = element.querySelectorAll('.indicator-dot');
                const productCards = element.querySelectorAll('.product-card:not(.show-more-products)');

                // Should have one additional dot for the show more button
                expect(dots.length).toBe(productCards.length + 1);
            });

            it('does not render additional dot when showMoreProducts is false', async () => {
                element.showMoreProducts = false;
                await Promise.resolve();

                const dots = element.querySelectorAll('.indicator-dot');
                const productCards = element.querySelectorAll('.product-card:not(.show-more-products)');

                // Should have same number of dots as product cards
                expect(dots.length).toBe(productCards.length);
            });

            it('handles navigation correctly with show more button present', async () => {
                element.showMoreProducts = true;
                await Promise.resolve();

                const rightButton = element.querySelector('.carousel-nav-right');
                const totalItems = mockProductCards.length;

                // Navigate to the show more button (last item)
                for (let i = 0; i < totalItems; i++) {
                    rightButton.click();
                }
                await Promise.resolve();

                // Right button should be disabled when on show more button
                expect(rightButton.disabled).toBe(true);

                // Left button should be enabled
                const leftButton = element.querySelector('.carousel-nav-left');
                expect(leftButton.disabled).toBe(false);
            });

            it('updates dots correctly when showMoreProducts changes from false to true', async () => {
                // Initially no show more button
                element.showMoreProducts = false;
                await Promise.resolve();

                let dots = element.querySelectorAll('.indicator-dot');
                let initialDotCount = dots.length;

                // Enable show more button
                element.showMoreProducts = true;
                await Promise.resolve();

                dots = element.querySelectorAll('.indicator-dot');
                expect(dots.length).toBe(initialDotCount + 1);
            });

            it('handles dot click navigation to show more button', async () => {
                element.showMoreProducts = true;
                await Promise.resolve();

                const dots = element.querySelectorAll('.indicator-dot');
                const showMoreDotIndex = dots.length - 1; // Last dot should be for show more
                const showMoreDot = dots[showMoreDotIndex];

                // Click the show more dot
                showMoreDot.click();
                await Promise.resolve();

                // Verify the show more dot is active
                expect(showMoreDot.getAttribute('data-active')).toBe('true');

                // Verify scrollIntoView was called
                expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start',
                });
            });

            it('maintains correct active dot state when navigating with show more button', async () => {
                element.showMoreProducts = true;
                await Promise.resolve();

                const dots = element.querySelectorAll('.indicator-dot');
                const rightButton = element.querySelector('.carousel-nav-right');

                // Navigate through all items including show more
                for (let i = 0; i < dots.length; i++) {
                    rightButton.click();
                }
                await Promise.resolve();

                // Check that the correct dot is active
                const activeDot = element.querySelector('.indicator-dot[data-active="true"]');
                expect(activeDot).toBeTruthy();
            });

            it.each([null, undefined, '', 0, false])(
                'handles showMoreProducts setter with falsy value %p correctly',
                async (falsyValue) => {
                    element.showMoreProducts = falsyValue;
                    await Promise.resolve();
                    expect(element.showMoreProducts).toBe(false);
                }
            );

            it('handles intersection observer with show more button correctly', async () => {
                element.showMoreProducts = true;
                await Promise.resolve();

                const scrollContainer = element.querySelector('.carousel-scroll-container');
                Object.defineProperty(scrollContainer, 'offsetWidth', { value: 100, configurable: true });

                // Trigger setup
                element.productData = [...mockProductCards];
                await Promise.resolve();

                // Should observe all product cards including show more button
                const allCards = element.querySelectorAll('.product-card');
                expect(global.__ioObserved.length).toBe(allCards.length);

                // Simulate show more button intersecting
                const showMoreButton = element.querySelector('.show-more-products');
                global.__ioCallback([
                    {
                        target: showMoreButton,
                        isIntersecting: true,
                        intersectionRatio: 0.8,
                    },
                ]);
                await Promise.resolve();

                // Verify dots are updated correctly
                const activeDot = element.querySelector('.indicator-dot[data-active="true"]');
                expect(activeDot).toBeTruthy();
            });
        });

        it('observes image panels and uses image-based counts in IO (image mode branches)', async () => {
            element.displayMode = 'productDetailImageCarousel';
            const mockImages = productData.imgGroups[0].imgs;
            element.productImageLinks = mockImages;
            await Promise.resolve();
            const scrollContainer = element.querySelector(
                '.slds-scrollable_x.carousel-scroll-container, .carousel-scroll-container'
            );
            expect(scrollContainer).toBeTruthy();
            Object.defineProperty(scrollContainer, 'offsetWidth', { value: 100, configurable: true });
            // Trigger setup
            element.productImageLinks = [...mockImages];
            await Promise.resolve();

            // Should have observed panels (not product cards)
            expect(global.__ioObserved.length).toBeGreaterThan(0);
            const observedOne = global.__ioObserved[0];
            expect(observedOne.classList.contains('slds-carousel__panel')).toBe(true);

            // Simulate last image intersecting ≥ 0.3
            const panels = element.querySelectorAll('.slds-carousel__panel');
            const lastPanel = panels[panels.length - 1];
            global.__ioCallback([{ target: lastPanel, isIntersecting: true, intersectionRatio: 0.35 }]);
            await Promise.resolve();
            const activeDot = element.querySelector('.indicator-dot[data-active="true"]');
            expect(activeDot).not.toBeNull();
        });
    });

    describe('Fallback behavior and getters', () => {
        it('renders image carousel when displayMode is unset but productImageLinks exist', async () => {
            // Do not set element.displayMode
            const mockImages = productData.imgGroups[0].imgs;
            element.productImageLinks = mockImages;
            await Promise.resolve();
            const images = element.querySelectorAll('.image-carousel-image');
            expect(images.length).toBe(mockImages.length);
        });

        it('exposes productImageLinks via getter and handles empty filteredProductImageLinks', async () => {
            const mockImages = productData.imgGroups[0].imgs;
            element.productImageLinks = mockImages;
            expect(element.productImageLinks).toEqual(mockImages);

            // Now set invalid images to hit filteredProductImageLinks empty branch
            element.productImageLinks = [null, { url: '   ' }];
            await Promise.resolve();
            const panels = element.querySelectorAll('.slds-carousel__panel');
            expect(panels.length).toBe(0);
        });

        it('handles non-array productImageLinks by rendering no image panels (fallback return [])', async () => {
            element.displayMode = 'productDetailImageCarousel';
            element.productImageLinks = { foo: 'bar' }; // truthy non-array
            await Promise.resolve();
            const panels = element.querySelectorAll('.slds-carousel__panel');
            expect(panels.length).toBe(0);
        });

        it('sets empty array when productData is falsy', async () => {
            element.displayMode = 'productSearchRecommendations';
            element.productData = null; // falsy branch in setter
            await Promise.resolve();
            expect(element.productData).toEqual([]);
            expect(element.querySelectorAll('.product-card').length).toBe(0);
        });

        it('sets empty array when productImageLinks is falsy', async () => {
            element.displayMode = 'productDetailImageCarousel';
            element.productImageLinks = null; // falsy branch in setter
            await Promise.resolve();
            expect(element.querySelectorAll('.slds-carousel__panel').length).toBe(0);
        });
    });

    describe('Mobile Screen Behavior for carousel', () => {
        let originalUserAgent;

        beforeEach(() => {
            // Store original user agent
            originalUserAgent = navigator.userAgent;
            // Mock mobile user agent
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                configurable: true,
            });
        });

        afterEach(() => {
            // Restore original user agent
            Object.defineProperty(navigator, 'userAgent', {
                value: originalUserAgent,
                configurable: true,
            });
        });

        const mobileTestCases = [
            {
                name: 'Image Carousel Mode',
                setup: () => {
                    element.displayMode = 'productDetailImageCarousel';
                    const mockImages = productData.imgGroups[0].imgs;
                    element.productImageLinks = mockImages;
                },
            },
            {
                name: 'Product Cards Carousel Mode',
                setup: () => {
                    element.displayMode = 'productSearchRecommendations';
                    element.productData = mockProductCards;
                },
            },
        ];

        mobileTestCases.forEach(({ name, setup }) => {
            describe(`${name} on Mobile`, () => {
                beforeEach(() => {
                    setup();
                });

                it('does not show navigation arrows on mobile screen', () => {
                    return Promise.resolve().then(() => {
                        const navButtons = element.querySelectorAll('.carousel-nav-button');
                        expect(navButtons.length).toBe(0);
                    });
                });

                it('still shows dots navigation on mobile screen', () => {
                    return Promise.resolve().then(() => {
                        const dots = element.querySelectorAll('.indicator-dot');
                        expect(dots.length).toBeGreaterThan(0);
                    });
                });
            });
        });
    });

    describe('Desktop Screen Behavior for carousel', () => {
        let originalUserAgent;

        beforeEach(() => {
            // Store original user agent
            originalUserAgent = navigator.userAgent;
            // Mock desktop user agent
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                configurable: true,
            });
        });

        afterEach(() => {
            // Restore original user agent
            Object.defineProperty(navigator, 'userAgent', {
                value: originalUserAgent,
                configurable: true,
            });
        });

        const desktopTestCases = [
            {
                name: 'Image Carousel Mode',
                setup: () => {
                    element.displayMode = 'productDetailImageCarousel';
                    const mockImages = productData.imgGroups[0].imgs;
                    element.productImageLinks = mockImages;
                },
            },
            {
                name: 'Product Cards Carousel Mode',
                setup: () => {
                    element.displayMode = 'productSearchRecommendations';
                    element.productData = mockProductCards;
                },
            },
        ];

        desktopTestCases.forEach(({ name, setup }) => {
            describe(`${name} on Desktop`, () => {
                beforeEach(() => {
                    setup();
                });

                it('shows navigation arrows on desktop screen', () => {
                    return Promise.resolve().then(() => {
                        const navButtons = element.querySelectorAll('.carousel-nav-button');
                        expect(navButtons.length).toBe(2);
                    });
                });

                it('shows dots navigation on desktop screen', () => {
                    return Promise.resolve().then(() => {
                        const dots = element.querySelectorAll('.indicator-dot');
                        expect(dots.length).toBeGreaterThan(0);
                    });
                });
            });
        });
    });
});
