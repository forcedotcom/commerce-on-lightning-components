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
        it('accepts suggestedActions as an object with description and options (backward compatibility)', async () => {
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

            // Backward compatibility: single object is converted to array
            expect(Array.isArray(element.suggestedActions)).toBe(true);
            expect(element.suggestedActions).toHaveLength(1);
            expect(element.suggestedActions[0].description).toBe('What type of jacket are you looking for?');
            expect(Array.isArray(element.suggestedActions[0].options)).toBe(true);
            expect(element.suggestedActions[0].options).toHaveLength(1);
        });

        it('accepts suggestedActions as an array of questions', async () => {
            const actions = [
                {
                    description: 'First question?',
                    options: [{ displayValue: 'Option 1', utterance: 'utterance1' }],
                },
                {
                    description: 'Second question?',
                    options: [{ displayValue: 'Option 2', utterance: 'utterance2' }],
                },
            ];

            element.suggestedActions = actions;

            await Promise.resolve();

            expect(Array.isArray(element.suggestedActions)).toBe(true);
            expect(element.suggestedActions).toHaveLength(2);
            expect(element.suggestedActions[0].description).toBe('First question?');
            expect(element.suggestedActions[1].description).toBe('Second question?');
        });

        it('defaults to empty array when not set', async () => {
            await Promise.resolve();

            expect(element.suggestedActions).toBeDefined();
            expect(Array.isArray(element.suggestedActions)).toBe(true);
            expect(element.suggestedActions).toHaveLength(0);
        });

        it('handles empty options array (filters out question)', async () => {
            const actions = {
                description: 'What type of jacket?',
                options: [],
            };

            element.suggestedActions = actions;

            await Promise.resolve();

            // Questions with empty options are filtered out
            expect(Array.isArray(element.suggestedActions)).toBe(true);
            expect(element.suggestedActions[0].options).toHaveLength(0);
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

    describe('Option Selection Handlers', () => {
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

        it('should handle event from bottomSheet and close bottom sheet', async () => {
            const selectOptionHandler = jest.fn();
            element.addEventListener('selectoption', selectOptionHandler);

            element.suggestedActions = {
                description: 'What size are you looking for?',
                options: [
                    { displayValue: 'XS', utterance: 'Size XS' },
                    { displayValue: 'S', utterance: 'Size S' },
                    { displayValue: 'M', utterance: 'Size M' },
                    { displayValue: 'L', utterance: 'Size L' },
                    { displayValue: 'XL', utterance: 'Size XL' },
                    { displayValue: 'XXL', utterance: 'Size XXL' },
                ],
            };

            await Promise.resolve();

            // Open bottom sheet first by clicking See More button
            const seeMoreButton = element.querySelector('.suggested-actions-see-more');
            expect(seeMoreButton).not.toBeNull();
            seeMoreButton.click();
            await Promise.resolve();

            // Verify bottom sheet is open
            let bottomSheet = element.querySelector('c-bottom-sheet');
            expect(bottomSheet).not.toBeNull();

            // Simulate event from bottomSheet by dispatching through the component
            bottomSheet.dispatchEvent(
                new CustomEvent('selectoption', {
                    detail: {
                        displayValue: 'S',
                        utterance: 'Size S',
                        questionIndex: 0,
                    },
                    bubbles: true,
                })
            );
            // Dispatch close event from bottom sheet
            bottomSheet.dispatchEvent(
                new CustomEvent('close', {
                    detail: { questionIndex: 0 },
                    bubbles: true,
                })
            );
            await Promise.resolve();

            // Verify event was dispatched
            expect(selectOptionHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        displayValue: 'S',
                        utterance: 'Size S',
                    },
                })
            );

            // Verify bottom sheet was closed (check through DOM)
            await Promise.resolve();
            bottomSheet = element.querySelector('c-bottom-sheet');
            expect(bottomSheet).toBeNull();
        });

        it('should not dispatch event when utterance is missing (button click)', async () => {
            const selectOptionHandler = jest.fn();
            element.addEventListener('selectoption', selectOptionHandler);

            // Set up suggestedActions with an option that has an empty utterance
            element.suggestedActions = {
                description: 'Choose an option',
                options: [{ displayValue: 'Test Option', utterance: '' }],
            };

            await Promise.resolve();

            // Click the button - event should not be dispatched because utterance is empty
            const optionButton = element.querySelector('.suggested-actions-button');
            expect(optionButton).not.toBeNull();
            optionButton.click();
            await Promise.resolve();

            // Event should not be dispatched
            expect(selectOptionHandler).not.toHaveBeenCalled();
        });

        it('should not dispatch event when bottomSheet event has missing displayValue', async () => {
            const selectOptionHandler = jest.fn();
            element.addEventListener('selectoption', selectOptionHandler);

            // Set up suggestedActions with enough options to trigger the bottom sheet
            element.suggestedActions = {
                description: 'Choose a size',
                options: [
                    { displayValue: 'XS', utterance: 'Size XS' },
                    { displayValue: 'S', utterance: 'Size S' },
                    { displayValue: 'M', utterance: 'Size M' },
                    { displayValue: 'L', utterance: 'Size L' },
                    { displayValue: 'XL', utterance: 'Size XL' },
                    { displayValue: 'XXL', utterance: 'Size XXL' },
                ],
            };

            await Promise.resolve();

            // Open bottom sheet first
            const seeMoreButton = element.querySelector('.suggested-actions-see-more');
            expect(seeMoreButton).not.toBeNull();
            seeMoreButton.click();
            await Promise.resolve();

            const bottomSheet = element.querySelector('c-bottom-sheet');
            expect(bottomSheet).not.toBeNull();

            // Dispatch selectoption with an empty displayValue
            bottomSheet.dispatchEvent(
                new CustomEvent('selectoption', {
                    detail: { displayValue: '', utterance: 'test utterance', questionIndex: 0 },
                    bubbles: true,
                })
            );
            await Promise.resolve();

            // Event should not be dispatched
            expect(selectOptionHandler).not.toHaveBeenCalled();
        });

        it('should not dispatch event when bottomSheet event has missing utterance', async () => {
            const selectOptionHandler = jest.fn();
            element.addEventListener('selectoption', selectOptionHandler);

            // Set up suggestedActions with enough options to trigger the bottom sheet
            element.suggestedActions = {
                description: 'Choose a size',
                options: [
                    { displayValue: 'XS', utterance: 'Size XS' },
                    { displayValue: 'S', utterance: 'Size S' },
                    { displayValue: 'M', utterance: 'Size M' },
                    { displayValue: 'L', utterance: 'Size L' },
                    { displayValue: 'XL', utterance: 'Size XL' },
                    { displayValue: 'XXL', utterance: 'Size XXL' },
                ],
            };

            await Promise.resolve();

            // Open bottom sheet first
            const seeMoreButton = element.querySelector('.suggested-actions-see-more');
            expect(seeMoreButton).not.toBeNull();
            seeMoreButton.click();
            await Promise.resolve();

            const bottomSheet = element.querySelector('c-bottom-sheet');
            expect(bottomSheet).not.toBeNull();

            // Dispatch selectoption with an empty utterance
            bottomSheet.dispatchEvent(
                new CustomEvent('selectoption', {
                    detail: { displayValue: 'Test Option', utterance: '', questionIndex: 0 },
                    bubbles: true,
                })
            );
            await Promise.resolve();

            // Event should not be dispatched
            expect(selectOptionHandler).not.toHaveBeenCalled();
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

        it('renders multiple questions when suggestedActions is an array', async () => {
            const actions = [
                {
                    description: 'First question?',
                    options: [
                        { displayValue: 'Option A', utterance: 'A' },
                        { displayValue: 'Option B', utterance: 'B' },
                    ],
                },
                {
                    description: 'Second question?',
                    options: [
                        { displayValue: 'Option 1', utterance: '1' },
                        { displayValue: 'Option 2', utterance: '2' },
                    ],
                },
            ];

            element.suggestedActions = actions;

            await Promise.resolve();

            // Should render both questions
            const descriptions = element.querySelectorAll('.suggested-actions-description');
            expect(descriptions).toHaveLength(2);
            expect(descriptions[0].textContent).toBe('First question?');
            expect(descriptions[1].textContent).toBe('Second question?');

            // Each question should have its own option buttons
            const allButtons = element.querySelectorAll('.suggested-actions-button:not(.suggested-actions-see-more)');
            expect(allButtons.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Bottom Sheet Functionality', () => {
        const mockSuggestedActions = {
            description: 'What size are you looking for?',
            utterance: 'size question',
            options: [
                { displayValue: 'S', utterance: "I'm looking for shirts in size S." },
                { displayValue: 'M', utterance: "I'm looking for shirts in size M." },
                { displayValue: 'L', utterance: "I'm looking for shirts in size L." },
                { displayValue: 'XL', utterance: "I'm looking for shirts in size XL." },
                { displayValue: 'XXL', utterance: "I'm looking for shirts in size XXL." },
                { displayValue: 'XXXL', utterance: "I'm looking for shirts in size XXXL." },
            ],
        };

        beforeEach(() => {
            element.suggestedActions = mockSuggestedActions;
        });

        describe('isBottomSheetOpen method', () => {
            it('should return false initially', async () => {
                await Promise.resolve();
                // Test indirectly through DOM - bottom sheet should not be rendered
                const bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).toBeNull();
            });

            it('should return true when bottom sheet is open for question index 0', async () => {
                await Promise.resolve();
                // Open bottom sheet through handleSeeMore
                const seeMoreButton = element.querySelector('.suggested-actions-see-more');
                expect(seeMoreButton).not.toBeNull();
                seeMoreButton.click();
                await Promise.resolve();
                // Test indirectly through DOM - bottom sheet should be rendered
                const bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).not.toBeNull();
            });
        });

        describe('handleSeeMore', () => {
            it('should open bottom sheet when hasSuggestedActions is true', async () => {
                await Promise.resolve();
                // Test initially - bottom sheet should not be rendered
                let bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).toBeNull();

                const seeMoreButton = element.querySelector('.suggested-actions-see-more');
                expect(seeMoreButton).not.toBeNull();
                seeMoreButton.click();
                await Promise.resolve();

                // Test that bottom sheet is now rendered
                bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).not.toBeNull();
            });

            it('should open correct bottom sheet for multiple questions', async () => {
                // Set up multiple questions
                element.suggestedActions = [
                    {
                        description: 'First question?',
                        options: [
                            { displayValue: 'A', utterance: 'A' },
                            { displayValue: 'B', utterance: 'B' },
                            { displayValue: 'C', utterance: 'C' },
                            { displayValue: 'D', utterance: 'D' },
                            { displayValue: 'E', utterance: 'E' },
                            { displayValue: 'F', utterance: 'F' },
                        ],
                    },
                    {
                        description: 'Second question?',
                        options: [
                            { displayValue: '1', utterance: '1' },
                            { displayValue: '2', utterance: '2' },
                            { displayValue: '3', utterance: '3' },
                            { displayValue: '4', utterance: '4' },
                            { displayValue: '5', utterance: '5' },
                            { displayValue: '6', utterance: '6' },
                        ],
                    },
                ];
                await Promise.resolve();

                // Click See More for first question
                const seeMoreButtons = element.querySelectorAll('.suggested-actions-see-more');
                expect(seeMoreButtons).toHaveLength(2);
                seeMoreButtons[0].click();
                await Promise.resolve();

                // First question's bottom sheet should be open
                const bottomSheets = element.querySelectorAll('c-bottom-sheet');
                expect(bottomSheets).toHaveLength(1);
                expect(bottomSheets[0].title).toBe('First question?');

                // Close and open second question's bottom sheet
                bottomSheets[0].dispatchEvent(new CustomEvent('close', { bubbles: true }));
                await Promise.resolve();
                seeMoreButtons[1].click();
                await Promise.resolve();

                // Second question's bottom sheet should be open
                const bottomSheets2 = element.querySelectorAll('c-bottom-sheet');
                expect(bottomSheets2).toHaveLength(1);
                expect(bottomSheets2[0].title).toBe('Second question?');
            });

            it('should not open bottom sheet when hasSuggestedActions is false', async () => {
                element.suggestedActions = {
                    description: '',
                    options: [],
                };
                await Promise.resolve();
                // Bottom sheet should not be rendered
                const bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).toBeNull();
            });

            it('should call stopPropagation and preventDefault on event', async () => {
                await Promise.resolve();
                // Test through DOM interaction - click the See More button
                const seeMoreButton = element.querySelector('.suggested-actions-see-more');
                expect(seeMoreButton).not.toBeNull();
                // Create a spy to track if stopPropagation is called
                const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
                const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
                const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

                seeMoreButton.dispatchEvent(clickEvent);
                await Promise.resolve();

                // Verify stopPropagation and preventDefault were called
                expect(stopPropagationSpy).toHaveBeenCalled();
                expect(preventDefaultSpy).toHaveBeenCalled();
            });
        });

        describe('handleBottomSheetClose', () => {
            it('should close the bottom sheet', async () => {
                await Promise.resolve();
                // Open bottom sheet by clicking See More button
                const seeMoreButton = element.querySelector('.suggested-actions-see-more');
                expect(seeMoreButton).not.toBeNull();
                seeMoreButton.click();
                await Promise.resolve();
                let bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).not.toBeNull();

                // Close by dispatching close event from bottom sheet (invokes handleBottomSheetClose)
                bottomSheet.dispatchEvent(
                    new CustomEvent('close', {
                        detail: { questionIndex: 0 },
                        bubbles: true,
                    })
                );
                await Promise.resolve();
                bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).toBeNull();
            });

            it('should close the bottom sheet when close event is dispatched from bottom sheet component', async () => {
                element.suggestedActions = {
                    description: 'What size are you looking for?',
                    options: [
                        { displayValue: 'XS', utterance: 'Size XS' },
                        { displayValue: 'S', utterance: 'Size S' },
                        { displayValue: 'M', utterance: 'Size M' },
                        { displayValue: 'L', utterance: 'Size L' },
                        { displayValue: 'XL', utterance: 'Size XL' },
                        { displayValue: 'XXL', utterance: 'Size XXL' },
                    ],
                };

                await Promise.resolve();

                // Open bottom sheet by clicking See More button
                const seeMoreButton = element.querySelector('.suggested-actions-see-more');
                expect(seeMoreButton).not.toBeNull();
                seeMoreButton.click();
                await Promise.resolve();

                // Verify bottom sheet is open
                let bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).not.toBeNull();

                // Dispatch close event from bottom sheet
                bottomSheet.dispatchEvent(
                    new CustomEvent('close', {
                        bubbles: true,
                    })
                );
                await Promise.resolve();

                // Verify bottom sheet was closed
                bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).toBeNull();
            });
        });

        describe('handleBottomSheetProceed', () => {
            it('should close the bottom sheet on proceed action', async () => {
                await Promise.resolve();
                // Open bottom sheet by clicking See More button
                const seeMoreButton = element.querySelector('.suggested-actions-see-more');
                expect(seeMoreButton).not.toBeNull();
                seeMoreButton.click();
                await Promise.resolve();
                let bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).not.toBeNull();

                // Simulate the bottom sheet's handleProceed by dispatching selectoption event
                // The bottom sheet includes questionIndex in the event detail when it dispatches
                bottomSheet.dispatchEvent(
                    new CustomEvent('selectoption', {
                        detail: { displayValue: 'S', utterance: 'Size S', questionIndex: 0 },
                        bubbles: true,
                    })
                );
                await Promise.resolve();
                bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).toBeNull();
            });
        });

        describe('Bottom Sheet Component Rendering', () => {
            it('should not render bottom sheet when isBottomSheetOpen is false', async () => {
                await Promise.resolve();

                const bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).toBeNull();
            });

            it('should render bottom sheet when isBottomSheetOpen is true', async () => {
                await Promise.resolve();
                // Open bottom sheet through See More button click
                const seeMoreButton = element.querySelector('.suggested-actions-see-more');
                expect(seeMoreButton).not.toBeNull();
                seeMoreButton.click();
                await Promise.resolve();

                const bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).not.toBeNull();
            });

            it('should pass correct props to bottom sheet component', async () => {
                element.configuration = { language: 'en_US' };
                await Promise.resolve();
                // Open bottom sheet through See More button click
                const seeMoreButton = element.querySelector('.suggested-actions-see-more');
                expect(seeMoreButton).not.toBeNull();
                seeMoreButton.click();
                await Promise.resolve();

                const bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).not.toBeNull();
                expect(bottomSheet.title).toBe('What size are you looking for?');
                expect(bottomSheet.isOpen).toBe(true);
                expect(bottomSheet.configuration).toEqual({ language: 'en_US' });
                expect(bottomSheet.questionIndex).toBe(0);
                expect(Array.isArray(bottomSheet.options)).toBe(true);
                expect(bottomSheet.options.length).toBe(6);
            });

            it('should pass empty options array when suggestedActions has no options', async () => {
                element.suggestedActions = {
                    description: 'Test',
                    options: [],
                };
                await Promise.resolve();

                // Bottom sheet should not be open when hasSuggestedActions is false (empty options)
                const bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).toBeNull();
            });
        });

        describe('multiSelect plumbing', () => {
            it('should pass multi-select=true to bottom sheet when selectionType is MULTI_SELECT', async () => {
                element.suggestedActions = {
                    description: 'What activity?',
                    selectionType: 'MULTI_SELECT',
                    options: [
                        { displayValue: 'Hiking', utterance: 'hiking' },
                        { displayValue: 'Running', utterance: 'running' },
                        { displayValue: 'Skiing', utterance: 'skiing' },
                        { displayValue: 'Climbing', utterance: 'climbing' },
                        { displayValue: 'Camping', utterance: 'camping' },
                        { displayValue: 'Swimming', utterance: 'swimming' },
                    ],
                };
                await Promise.resolve();

                const seeMoreButton = element.querySelector('.suggested-actions-see-more');
                seeMoreButton.click();
                await Promise.resolve();

                const bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).not.toBeNull();
                expect(bottomSheet.multiSelect).toBe(true);
            });

            it('should pass multi-select=false to bottom sheet when selectionType is absent', async () => {
                element.suggestedActions = mockSuggestedActions;
                await Promise.resolve();

                const seeMoreButton = element.querySelector('.suggested-actions-see-more');
                seeMoreButton.click();
                await Promise.resolve();

                const bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).not.toBeNull();
                expect(bottomSheet.multiSelect).toBe(false);
            });

            it('should show only "Options" pill with no inline options for multi-select', async () => {
                element.suggestedActions = {
                    description: 'Select your preferred activities',
                    selectionType: 'MULTI_SELECT',
                    options: [
                        { displayValue: 'Hiking', utterance: 'hiking' },
                        { displayValue: 'Running', utterance: 'running' },
                        { displayValue: 'Skiing', utterance: 'skiing' },
                    ],
                };
                await Promise.resolve();

                const inlineButtons = element.querySelectorAll(
                    '.suggested-actions-button:not(.suggested-actions-see-more)'
                );
                expect(inlineButtons).toHaveLength(0);

                const optionsPill = element.querySelector('.suggested-actions-see-more');
                expect(optionsPill).not.toBeNull();
                expect(optionsPill.textContent.trim()).toBe('Options');
            });

            it('should show "Options" pill for multi-select regardless of option count', async () => {
                element.suggestedActions = {
                    description: 'Pick one or more',
                    selectionType: 'MULTI_SELECT',
                    options: [{ displayValue: 'Only One', utterance: 'one' }],
                };
                await Promise.resolve();

                const optionsPill = element.querySelector('.suggested-actions-see-more');
                expect(optionsPill).not.toBeNull();
                expect(optionsPill.textContent.trim()).toBe('Options');
            });

            it('should open bottom sheet with all options when "Options" pill is clicked for multi-select', async () => {
                const multiSelectOptions = [
                    { displayValue: 'Hiking', utterance: 'hiking' },
                    { displayValue: 'Running', utterance: 'running' },
                    { displayValue: 'Skiing', utterance: 'skiing' },
                ];
                element.suggestedActions = {
                    description: 'Select activities',
                    selectionType: 'MULTI_SELECT',
                    options: multiSelectOptions,
                };
                await Promise.resolve();

                const optionsPill = element.querySelector('.suggested-actions-see-more');
                optionsPill.click();
                await Promise.resolve();

                const bottomSheet = element.querySelector('c-bottom-sheet');
                expect(bottomSheet).not.toBeNull();
                expect(bottomSheet.options).toHaveLength(3);
                expect(bottomSheet.multiSelect).toBe(true);
            });

            it('should render inline options for single-select and "Options" pill for multi-select in mixed questions', async () => {
                element.suggestedActions = [
                    {
                        description: 'Single-select question?',
                        options: [
                            { displayValue: 'A', utterance: 'A' },
                            { displayValue: 'B', utterance: 'B' },
                        ],
                    },
                    {
                        description: 'Multi-select question?',
                        selectionType: 'MULTI_SELECT',
                        options: [
                            { displayValue: 'X', utterance: 'X' },
                            { displayValue: 'Y', utterance: 'Y' },
                        ],
                    },
                ];
                await Promise.resolve();

                const allInlineButtons = element.querySelectorAll(
                    '.suggested-actions-button:not(.suggested-actions-see-more)'
                );
                expect(allInlineButtons).toHaveLength(2);
                expect(allInlineButtons[0].textContent.trim()).toBe('A');
                expect(allInlineButtons[1].textContent.trim()).toBe('B');

                const seeMoreButtons = element.querySelectorAll('.suggested-actions-see-more');
                expect(seeMoreButtons).toHaveLength(1);
                expect(seeMoreButtons[0].textContent.trim()).toBe('Options');
            });
        });

        describe('See More Button Integration', () => {
            it('should show See More button when options exceed MAX_DISPLAYED_OPTIONS', async () => {
                // MAX_DISPLAYED_OPTIONS is 5, and we have 5 options, so it should show
                // Let's add one more to ensure it shows
                element.suggestedActions = {
                    description: 'What size?',
                    options: [
                        { displayValue: 'S', utterance: 'S' },
                        { displayValue: 'M', utterance: 'M' },
                        { displayValue: 'L', utterance: 'L' },
                        { displayValue: 'XL', utterance: 'XL' },
                        { displayValue: 'XXL', utterance: 'XXL' },
                        { displayValue: 'XXXL', utterance: 'XXXL' },
                    ],
                };
                await Promise.resolve();

                const seeMoreButton = element.querySelector('.suggested-actions-see-more');
                expect(seeMoreButton).not.toBeNull();
            });

            it('should not show See More button when options are less than or equal to MAX_DISPLAYED_OPTIONS', async () => {
                element.suggestedActions = {
                    description: 'What size?',
                    options: [
                        { displayValue: 'S', utterance: 'S' },
                        { displayValue: 'M', utterance: 'M' },
                        { displayValue: 'L', utterance: 'L' },
                    ],
                };
                await Promise.resolve();

                const seeMoreButton = element.querySelector('.suggested-actions-see-more');
                expect(seeMoreButton).toBeNull();
            });
        });
    });
});
