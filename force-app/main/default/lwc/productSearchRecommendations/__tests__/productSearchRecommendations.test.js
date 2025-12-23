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

    describe('suggestedActions property', () => {
        it('accepts suggestedActions as an object with description and options', async () => {
            const actions = {
                description: 'What type of jacket are you looking for?',
                options: [
                    {
                        displayValue: 'Hiking',
                        utterance: 'Suggest me more in jackets for hiking.',
                        type: 'UTTERANCE_SUGGESTIONS',
                    },
                ],
            };

            element.suggestedActions = actions;

            await Promise.resolve();

            expect(element.suggestedActions).toEqual(actions);
            expect(typeof element.suggestedActions).toBe('object');
            expect(element.suggestedActions.description).toBe('What type of jacket are you looking for?');
            expect(Array.isArray(element.suggestedActions.options)).toBe(true);
            expect(element.suggestedActions.options).toHaveLength(1);
        });

        it('defaults to empty object when not set', async () => {
            await Promise.resolve();

            expect(element.suggestedActions).toBeDefined();
            expect(typeof element.suggestedActions).toBe('object');
        });

        it('handles empty options array', async () => {
            const actions = {
                description: 'What type of jacket?',
                options: [],
            };

            element.suggestedActions = actions;

            await Promise.resolve();

            expect(element.suggestedActions).toBeDefined();
            expect(element.suggestedActions.description).toBe('What type of jacket?');
            expect(Array.isArray(element.suggestedActions.options)).toBe(true);
            expect(element.suggestedActions.options).toHaveLength(0);
        });
    });

    describe('hasSuggestedActions getter', () => {
        it('returns true when suggestedActions has description and options', async () => {
            const actions = {
                description: 'What type of jacket are you looking for?',
                options: [
                    {
                        displayValue: 'Hiking',
                        utterance: 'Suggest me more in jackets for hiking.',
                        type: 'UTTERANCE_SUGGESTION',
                    },
                ],
            };

            element.suggestedActions = actions;

            await Promise.resolve();

            expect(element.hasSuggestedActions).toBe(true);
        });

        it('returns false when suggestedActions has no description', async () => {
            const actions = {
                description: '',
                options: [
                    {
                        displayValue: 'Hiking',
                        utterance: 'Suggest me more in jackets for hiking.',
                        type: 'UTTERANCE_SUGGESTION',
                    },
                ],
            };

            element.suggestedActions = actions;

            await Promise.resolve();

            // Check that suggested actions section is not rendered
            const descriptionElement = element.querySelector('.suggested-actions-description');
            expect(descriptionElement).toBeNull();
        });

        it('returns false when suggestedActions has empty options array', async () => {
            const actions = {
                description: 'What type of jacket are you looking for?',
                options: [],
            };

            element.suggestedActions = actions;

            await Promise.resolve();

            // Check that suggested actions section is not rendered
            const descriptionElement = element.querySelector('.suggested-actions-description');
            expect(descriptionElement).toBeNull();
        });

        it('returns false when suggestedActions is null', async () => {
            element.suggestedActions = null;

            await Promise.resolve();

            // Check that suggested actions section is not rendered
            const descriptionElement = element.querySelector('.suggested-actions-description');
            expect(descriptionElement).toBeNull();
        });

        it('returns false when suggestedActions is undefined', async () => {
            element.suggestedActions = undefined;

            await Promise.resolve();

            // Check that suggested actions section is not rendered
            const descriptionElement = element.querySelector('.suggested-actions-description');
            expect(descriptionElement).toBeNull();
        });

        it('returns false when suggestedActions is not an object', async () => {
            element.suggestedActions = 'not an object';

            await Promise.resolve();

            // Check that suggested actions section is not rendered
            const descriptionElement = element.querySelector('.suggested-actions-description');
            expect(descriptionElement).toBeNull();
        });

        it('returns false when options is not an array', async () => {
            const actions = {
                description: 'What type of jacket are you looking for?',
                options: 'not an array',
            };

            element.suggestedActions = actions;

            await Promise.resolve();

            // Check that suggested actions section is not rendered
            const descriptionElement = element.querySelector('.suggested-actions-description');
            expect(descriptionElement).toBeNull();
        });
    });

    describe('handleSelectOption', () => {
        it('dispatches selectoption event with correct detail', async () => {
            const selectOptionHandler = jest.fn();
            element.addEventListener('selectoption', selectOptionHandler);

            const mockOption = {
                displayValue: 'Hiking',
                utterance: 'Suggest me more in jackets for hiking.',
            };

            // Set up suggestedActions
            element.suggestedActions = {
                description: 'What type of jacket are you looking for?',
                options: [mockOption],
            };

            await Promise.resolve();

            // Find and click the option button
            const optionButton = element.querySelector('.suggested-actions-button');
            expect(optionButton).not.toBeNull();
            optionButton.click();

            await Promise.resolve();

            expect(selectOptionHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        displayValue: 'Hiking',
                        utterance: 'Suggest me more in jackets for hiking.',
                    },
                })
            );
        });

        it('handles multiple option buttons correctly', async () => {
            const selectOptionHandler = jest.fn();
            element.addEventListener('selectoption', selectOptionHandler);

            const mockOptions = [
                {
                    displayValue: 'Hiking',
                    utterance: 'Suggest me more in jackets for hiking.',
                },
                {
                    displayValue: 'Skiing',
                    utterance: 'Suggest me more in jackets for skiing.',
                },
                {
                    displayValue: 'Running',
                    utterance: 'Suggest me more in jackets for running.',
                },
            ];

            element.suggestedActions = {
                description: 'What type of jacket are you looking for?',
                options: mockOptions,
            };

            await Promise.resolve();

            // Find all option buttons
            const optionButtons = element.querySelectorAll('.suggested-actions-button');
            expect(optionButtons).toHaveLength(3);

            // Click the second button
            optionButtons[1].click();

            await Promise.resolve();

            expect(selectOptionHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        displayValue: 'Skiing',
                        utterance: 'Suggest me more in jackets for skiing.',
                    },
                })
            );
        });
    });

    describe('Suggested Actions rendering', () => {
        it('renders suggested actions section when hasSuggestedActions is true', async () => {
            const actions = {
                description: 'What type of jacket are you looking for?',
                options: [
                    {
                        displayValue: 'Hiking',
                        utterance: 'Suggest me more in jackets for hiking.',
                    },
                ],
            };

            element.suggestedActions = actions;

            await Promise.resolve();

            const descriptionElement = element.querySelector('.suggested-actions-description');
            expect(descriptionElement).not.toBeNull();
            expect(descriptionElement.textContent).toBe('What type of jacket are you looking for?');

            const optionButton = element.querySelector('.suggested-actions-button');
            expect(optionButton).not.toBeNull();
            expect(optionButton.textContent.trim()).toBe('Hiking');
        });

        it('does not render suggested actions section when hasSuggestedActions is false', async () => {
            element.suggestedActions = {
                description: '',
                options: [],
            };

            await Promise.resolve();

            const descriptionElement = element.querySelector('.suggested-actions-description');
            expect(descriptionElement).toBeNull();
        });

        it('renders all option buttons', async () => {
            const actions = {
                description: 'What type of jacket are you looking for?',
                options: [
                    { displayValue: 'Hiking', utterance: 'hiking' },
                    { displayValue: 'Skiing', utterance: 'skiing' },
                    { displayValue: 'Running', utterance: 'running' },
                    { displayValue: 'Climbing', utterance: 'climbing' },
                    { displayValue: 'Bike Commuting', utterance: 'biking' },
                ],
            };

            element.suggestedActions = actions;

            await Promise.resolve();

            const optionButtons = element.querySelectorAll('.suggested-actions-button');
            expect(optionButtons).toHaveLength(5);
            expect(optionButtons[0].textContent.trim()).toBe('Hiking');
            expect(optionButtons[1].textContent.trim()).toBe('Skiing');
            expect(optionButtons[2].textContent.trim()).toBe('Running');
            expect(optionButtons[3].textContent.trim()).toBe('Climbing');
            expect(optionButtons[4].textContent.trim()).toBe('Bike Commuting');
        });
    });
});
