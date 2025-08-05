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
    });
});
