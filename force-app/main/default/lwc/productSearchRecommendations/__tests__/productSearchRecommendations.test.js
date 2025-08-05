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
    },
    {
        id: '2',
        name: 'Test Product 2',
        imageUrl: 'https://example.com/image2.jpg',
        price: 39.99,
        currencyCode: 'USD',
        url: 'https://example.com/product2',
    },
];

const mockCategories = [
    { id: '1', name: 'Category 1' },
    { id: '2', name: 'Category 2' },
];

describe('c-product-search-recommendations', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('displays product cards correctly', async () => {
        const element = createElement('c-product-search-recommendations', {
            is: ProductSearchRecommendations,
        });
        element.productData = mockProducts;
        document.body.appendChild(element);

        await Promise.resolve();

        // Product cards are now rendered inside the commonCarousel component
        const carousel = element.querySelector('c-common-carousel');
        expect(carousel).not.toBeNull();
        expect(carousel.productData).toEqual(mockProducts);
    });

    it('renders carousel component with correct properties', async () => {
        const element = createElement('c-product-search-recommendations', {
            is: ProductSearchRecommendations,
        });
        element.productData = mockProducts;
        document.body.appendChild(element);

        await Promise.resolve();

        const carousel = element.querySelector('c-common-carousel');
        expect(carousel).not.toBeNull();
        expect(carousel.displayMode).toBe('productSearchRecommendations');
    });

    it('displays categories description', async () => {
        const element = createElement('c-product-search-recommendations', {
            is: ProductSearchRecommendations,
        });
        element.categoriesDescription = 'Test categories description';
        element.categoryData = mockCategories;
        document.body.appendChild(element);

        await Promise.resolve();

        const description = element.querySelector('.categories-description');
        expect(description).not.toBeNull();
        expect(description.textContent).toBe('Test categories description');
    });

    it('displays categories correctly', async () => {
        const element = createElement('c-product-search-recommendations', {
            is: ProductSearchRecommendations,
        });
        element.categoryData = mockCategories;
        document.body.appendChild(element);

        await Promise.resolve();

        const categoryButtons = element.querySelectorAll('.category-button');
        expect(categoryButtons.length).toBe(mockCategories.length);

        categoryButtons.forEach((button, index) => {
            expect(button.textContent).toBe(mockCategories[index].name);
        });
    });

    it('handles product clicks correctly through carousel', async () => {
        const element = createElement('c-product-search-recommendations', {
            is: ProductSearchRecommendations,
        });
        element.productData = mockProducts;

        const showProductHandler = jest.fn();
        element.addEventListener('showproduct', showProductHandler);

        document.body.appendChild(element);

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

    it('handles category selection correctly', async () => {
        const element = createElement('c-product-search-recommendations', {
            is: ProductSearchRecommendations,
        });
        element.categoryData = mockCategories;

        const selectCategoryHandler = jest.fn();
        element.addEventListener('selectcategory', selectCategoryHandler);

        document.body.appendChild(element);

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
        const element = createElement('c-product-search-recommendations', {
            is: ProductSearchRecommendations,
        });
        element.productData = [];
        document.body.appendChild(element);

        await Promise.resolve();

        // Product carousel should not be rendered
        const carousel = element.querySelector('c-common-carousel');
        expect(carousel).toBeNull();
    });

    it('hides category recommendations when categoryData is empty', async () => {
        const element = createElement('c-product-search-recommendations', {
            is: ProductSearchRecommendations,
        });
        element.categoryData = [];
        document.body.appendChild(element);

        await Promise.resolve();

        // No category buttons should be rendered
        const categoryButtons = element.querySelectorAll('.category-button');
        expect(categoryButtons.length).toBe(0);
    });

    it('hides both product and category recommendations when both data arrays are empty', async () => {
        const element = createElement('c-product-search-recommendations', {
            is: ProductSearchRecommendations,
        });
        element.productData = [];
        element.categoryData = [];
        document.body.appendChild(element);

        await Promise.resolve();

        // Product carousel should not be rendered
        const carousel = element.querySelector('c-common-carousel');
        expect(carousel).toBeNull();
        // No category buttons should be rendered
        const categoryButtons = element.querySelectorAll('.category-button');
        expect(categoryButtons.length).toBe(0);
    });
});
