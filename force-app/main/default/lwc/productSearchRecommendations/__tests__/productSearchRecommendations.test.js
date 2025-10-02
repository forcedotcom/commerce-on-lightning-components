/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { createElement } from 'lwc';
import ProductSearchRecommendations from 'c/productSearchRecommendations';

const mockProducts = [
    {
        id: '1',
        name: 'Test Product 1',
        imageUrl: 'https://example.com/image1.jpg',
        price: 29.99,
        currencyCode: 'USD',
        url: 'https://example.com/product1',
        inStock: true,
    },
    {
        id: '2',
        name: 'Test Product 2',
        imageUrl: 'https://example.com/image2.jpg',
        price: 39.99,
        currencyCode: 'USD',
        url: 'https://example.com/product2',
        inStock: true,
    },
];

const mockTransformedProducts = [
    {
        id: '1',
        name: 'Test Product 1',
        imageUrl: 'https://example.com/image1.jpg',
        price: 29.99,
        currencyCode: 'USD',
        url: 'https://example.com/product1',
        inStock: true,
        outOfStock: false,
    },
    {
        id: '2',
        name: 'Test Product 2',
        imageUrl: 'https://example.com/image2.jpg',
        price: 39.99,
        currencyCode: 'USD',
        url: 'https://example.com/product2',
        inStock: true,
        outOfStock: false,
    },
];

const mockCategories = [
    { id: '1', name: 'Category 1' },
    { id: '2', name: 'Category 2' },
];

describe('c-product-search-recommendations', () => {
    let element;

    beforeEach(() => {
        element = createElement('c-product-search-recommendations', {
            is: ProductSearchRecommendations,
        });
        element.productData = mockProducts;
        element.categoryData = mockCategories;
        document.body.appendChild(element);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('displays product cards correctly', async () => {
        await Promise.resolve();

        // Product cards are now rendered inside the commonCarousel component
        const carousel = element.querySelector('c-common-carousel');
        expect(carousel).not.toBeNull();
        expect(carousel.productData).toEqual(mockTransformedProducts);
    });

    it('renders carousel component with correct properties', async () => {
        await Promise.resolve();
        const carousel = element.querySelector('c-common-carousel');
        expect(carousel).not.toBeNull();
        expect(carousel.displayMode).toBe('productSearchRecommendations');
    });

    it('displays categories description when showCategoryRecommendations is true', async () => {
        element.showCategoryRecommendations = true;
        element.categoriesDescription = 'Test categories description';
        await Promise.resolve();

        const description = element.querySelector('.categories-description');
        expect(description).not.toBeNull();
        expect(description.textContent).toBe('Test categories description');
    });

    it('displays categories correctly when showCategoryRecommendations is true', async () => {
        element.showCategoryRecommendations = true;
        await Promise.resolve();

        const categoryButtons = element.querySelectorAll('.category-button');
        expect(categoryButtons.length).toBe(mockCategories.length);

        categoryButtons.forEach((button, index) => {
            expect(button.textContent).toBe(mockCategories[index].name);
        });
    });

    it('handles product clicks correctly through carousel', async () => {
        const showProductHandler = jest.fn();
        element.addEventListener('showproduct', showProductHandler);

        await Promise.resolve();

        // Simulate the carousel firing the productselected event
        const carousel = element.querySelector('c-common-carousel');
        expect(carousel).not.toBeNull();

        // Simulate carousel event
        carousel.dispatchEvent(
            new CustomEvent('productselected', {
                detail: {
                    productName: mockProducts[0].name,
                    productId: mockProducts[0].id,
                    productUrl: mockProducts[0].url,
                },
                bubbles: true,
            })
        );

        expect(showProductHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: {
                    name: mockProducts[0].name,
                    id: mockProducts[0].id,
                    url: mockProducts[0].url,
                },
            })
        );
    });

    it('handles category selection correctly when categories are shown', async () => {
        element.showCategoryRecommendations = true;
        const selectCategoryHandler = jest.fn();
        element.addEventListener('selectcategory', selectCategoryHandler);

        await Promise.resolve();

        const firstCategoryButton = element.querySelector('.category-button');
        expect(firstCategoryButton).not.toBeNull();

        firstCategoryButton.click();

        expect(selectCategoryHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: {
                    name: mockCategories[0].name,
                    id: mockCategories[0].id,
                },
            })
        );
    });

    it('hides product recommendations when productData is empty', async () => {
        element.productData = [];
        await Promise.resolve();

        // Product carousel should not be rendered
        const carousel = element.querySelector('c-common-carousel');
        expect(carousel).toBeNull();
    });

    it('hides category recommendations when categoryData is empty', async () => {
        element.categoryData = [];
        await Promise.resolve();

        // No category buttons should be rendered
        const categoryButtons = element.querySelectorAll('.category-button');
        expect(categoryButtons.length).toBe(0);
    });

    it('hides both product and category recommendations when both data arrays are empty', async () => {
        element.productData = [];
        element.categoryData = [];
        await Promise.resolve();

        // Product carousel should not be rendered
        const carousel = element.querySelector('c-common-carousel');
        expect(carousel).toBeNull();
        // No category buttons should be rendered
        const categoryButtons = element.querySelectorAll('.category-button');
        expect(categoryButtons.length).toBe(0);
    });

    it('hides category recommendations by default (showCategoryRecommendations defaults to false)', async () => {
        // Don't set showCategoryRecommendations - it should default to false
        await Promise.resolve();

        // No category buttons should be rendered even though categoryData has data
        const categoryButtons = element.querySelectorAll('.category-button');
        expect(categoryButtons.length).toBe(0);

        // Verify categoryData still has data (just not displayed)
        expect(element.categoryData.length).toBe(mockCategories.length);
    });

    it('shows category recommendations when showCategoryRecommendations is explicitly set to true', async () => {
        element.showCategoryRecommendations = true;
        await Promise.resolve();

        // Category buttons should be rendered when flag is true and data exists
        const categoryButtons = element.querySelectorAll('.category-button');
        expect(categoryButtons.length).toBe(mockCategories.length);
    });

    it('hides category recommendations and description when showCategoryRecommendations is false', async () => {
        element.showCategoryRecommendations = false;
        element.categoriesDescription = 'Test description';
        await Promise.resolve();

        // Description should not be rendered when categories are hidden
        const description = element.querySelector('.categories-description');
        expect(description).toBeNull();
    });

    describe('Image URL Transformation', () => {
        it('transforms large image URLs to medium in productData', async () => {
            const productsWithLargeUrls = [
                {
                    id: '1',
                    name: 'Test Product 1',
                    imageUrl: 'https://example.com/images/large/product1.jpg',
                    price: 29.99,
                    currencyCode: 'USD',
                },
                {
                    id: '2',
                    name: 'Test Product 2',
                    imageUrl: 'https://example.com/images/large/product2.jpg',
                    price: 39.99,
                    currencyCode: 'USD',
                },
            ];

            element.productData = productsWithLargeUrls;

            await Promise.resolve();

            // Check that the carousel receives transformed product data
            const carousel = element.querySelector('c-common-carousel');
            expect(carousel).not.toBeNull();

            const transformedData = carousel.productData;
            expect(transformedData).toHaveLength(2);
            expect(transformedData[0].imageUrl).toBe('https://example.com/images/medium/product1.jpg');
            expect(transformedData[1].imageUrl).toBe('https://example.com/images/medium/product2.jpg');
        });

        it('does not transform image URLs that do not contain large', async () => {
            const productsWithNonLargeUrls = [
                {
                    id: '1',
                    name: 'Test Product 1',
                    imageUrl: 'https://example.com/images/medium/product1.jpg',
                    price: 29.99,
                    currencyCode: 'USD',
                },
                {
                    id: '2',
                    name: 'Test Product 2',
                    imageUrl: 'https://example.com/images/small/product2.jpg',
                    price: 39.99,
                    currencyCode: 'USD',
                },
            ];

            element.productData = productsWithNonLargeUrls;

            await Promise.resolve();

            // Check that the carousel receives unchanged product data
            const carousel = element.querySelector('c-common-carousel');
            expect(carousel).not.toBeNull();

            const transformedData = carousel.productData;
            expect(transformedData).toHaveLength(2);
            expect(transformedData[0].imageUrl).toBe('https://example.com/images/medium/product1.jpg');
            expect(transformedData[1].imageUrl).toBe('https://example.com/images/small/product2.jpg');
        });

        it('handles mixed image URL types correctly', async () => {
            const mixedProducts = [
                {
                    id: '1',
                    name: 'Product with large URL',
                    imageUrl: 'https://example.com/images/large/product1.jpg',
                    price: 29.99,
                    currencyCode: 'USD',
                },
                {
                    id: '2',
                    name: 'Product with medium URL',
                    imageUrl: 'https://example.com/images/medium/product2.jpg',
                    price: 39.99,
                    currencyCode: 'USD',
                },
                {
                    id: '3',
                    name: 'Product with small URL',
                    imageUrl: 'https://example.com/images/small/product3.jpg',
                    price: 49.99,
                    currencyCode: 'USD',
                },
            ];

            element.productData = mixedProducts;

            await Promise.resolve();

            // Check that only the large URL is transformed
            const carousel = element.querySelector('c-common-carousel');
            expect(carousel).not.toBeNull();

            const transformedData = carousel.productData;
            expect(transformedData).toHaveLength(3);
            expect(transformedData[0].imageUrl).toBe('https://example.com/images/medium/product1.jpg');
            expect(transformedData[1].imageUrl).toBe('https://example.com/images/medium/product2.jpg');
            expect(transformedData[2].imageUrl).toBe('https://example.com/images/small/product3.jpg');
        });

        it('handles empty product data gracefully', async () => {
            element.productData = [];

            await Promise.resolve();

            // Should not render carousel when productData is empty
            const carousel = element.querySelector('c-common-carousel');
            expect(carousel).toBeNull();
        });

        it('handles null productData gracefully', async () => {
            element.productData = null;

            await Promise.resolve();

            // Should not render carousel when productData is null
            const carousel = element.querySelector('c-common-carousel');
            expect(carousel).toBeNull();
        });

        it('handles non-array productData gracefully', async () => {
            element.productData = 'not an array';

            await Promise.resolve();

            // Should not render carousel when productData is not an array
            const carousel = element.querySelector('c-common-carousel');
            expect(carousel).toBeNull();
        });
    });
});
