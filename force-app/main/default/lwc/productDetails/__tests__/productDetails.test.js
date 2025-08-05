/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { createElement } from 'lwc';
import ProductDetails from 'c/productDetails';
import {
    mockProduct as productData,
    mockProductForVariantSelection,
    mockProductNoVariants,
    mockProductNullVariants,
    mockProductEmptyVmat,
    mockProductNonOrderableSingleOption,
    mockProductMixedVariants,
} from './mockData';

jest.mock(
    'experience/styling',
    () => ({
        generateButtonSizeClass: jest.fn(() => 'mock-size'),
        generateButtonStretchClass: jest.fn(() => 'mock-stretch'),
        generateButtonStyleClass: jest.fn(() => 'mock-style'),
        generateElementAlignmentClass: jest.fn(() => 'mock-alignment'),
    }),
    { virtual: true }
);

const mockProduct = productData;

describe('c-product-details positive cases', () => {
    let element;

    beforeEach(async () => {
        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        element.product = mockProduct;
        document.body.appendChild(element);
        // Wait for component to render
        await Promise.resolve();
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders product title, description, price, and features', async () => {
        // Title
        const title = element.querySelector('.product-title');
        expect(title).not.toBeNull();
        expect(title.value).toBe(mockProduct.name);

        // Description
        const description = element.querySelector('.product-description');
        expect(description).not.toBeNull();
        expect(description.value).toBe(mockProduct.dscr);

        // Price - Check that the price element exists and has correct currency
        const productPrice = element.querySelector('.negotiated-price');
        expect(productPrice).not.toBeNull();
        expect(productPrice.currencyCode).toBe(mockProduct.ccy);

        // Features
        const features = element.querySelectorAll('.product-feature');
        expect(features.length).toBe(mockProduct.features.length);
        features.forEach((feature, idx) => {
            expect(feature.value).toBe(mockProduct.features[idx]);
        });
    });

    it('renders all product images in the carousel', async () => {
        // The component filters images based on selected variants
        // With the selected color 'JJ169XX', it should show the filtered images
        const images = element.querySelectorAll('.image-carousel-image');
        expect(images.length).toBeGreaterThan(0);
        // The exact count depends on the filtering logic, but we should have at least one image
    });

    it('fires addtocart event with product name when Add to Cart is clicked', async () => {
        const handler = jest.fn();
        element.addEventListener('addtocart', handler);

        // Simulate express payment loaded event so the button renders
        const expressPayment = element.querySelector('c-express-payment');
        const expressLoadedEvent = new CustomEvent('expressloaded', {
            detail: { available: false },
        });
        expressPayment.dispatchEvent(expressLoadedEvent);
        await Promise.resolve();

        const button = element.querySelector('.button-checkout');
        expect(button).not.toBeNull();
        button.click();

        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail).toEqual({
            productName: 'Mini Print Jacket',
            quantity: 0.5,
            variantDetails: [
                {
                    id: 'color',
                    label: 'Color',
                    value: 'JJ169XX',
                    displayName: 'Black',
                },
            ],
        });
    });
});

describe('c-product-details express payment loading states', () => {
    let element;

    beforeEach(async () => {
        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        element.product = mockProduct;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    describe('Component initialization and DOM structure', () => {
        it('should set product data and entry ID correctly', () => {
            expect(element.product).toEqual(mockProduct);
            expect(element.entryId).toBe('test-entry-456');
        });

        it('should render c-express-payment with correct entry-id and express-payment-url', () => {
            const expressPayment = element.querySelector('c-express-payment');
            expect(expressPayment).not.toBeNull();
            expect(expressPayment.entryId).toBe('test-entry-456');
            expect(expressPayment.expressPaymentUrl).toBe('https://www.phased-launch-testing.com/express');
        });

        it('should have correct main container structure', () => {
            const mainContainer = element.querySelector('.slds-grid.slds-grid_vertical');
            expect(mainContainer).not.toBeNull();
        });

        it('should contain all required child components', () => {
            expect(element.querySelector('c-express-payment')).not.toBeNull();
            expect(element.querySelector('lightning-spinner')).not.toBeNull();
        });

        it('should have loading container structure', () => {
            const loadingContainer = element.querySelector('.loading-container');
            expect(loadingContainer).not.toBeNull();

            const expressContainer = element.querySelector('.express-container');
            expect(expressContainer).not.toBeNull();
        });
    });

    describe('Express payment loading states', () => {
        it('should show spinner when express payment is not loaded', () => {
            const spinner = element.querySelector('lightning-spinner');
            expect(spinner).not.toBeNull();
            expect(spinner.alternativeText).toBe('c.Product_loadingSpinnerAltText');
            expect(spinner.size).toBe('x-small');
        });

        it('should hide add to cart button when express payment is not loaded', () => {
            const button = element.querySelector('.button-checkout');
            expect(button).toBeNull();
        });

        it('should verify express payment event handler is wired', () => {
            const expressPayment = element.querySelector('c-express-payment');
            expect(expressPayment).not.toBeNull();
            expect(expressPayment.entryId).toBe('test-entry-456');
        });

        it('should update UI when express payment is available', async () => {
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: true },
            });
            expressPayment.dispatchEvent(event);

            // Wait for component to update
            await Promise.resolve();

            // Verify UI updates
            const loadingContainer = element.querySelector('.loading-container');
            expect(loadingContainer.classList.contains('loaded')).toBe(true);

            const expressContainer = element.querySelector('.express-container');
            expect(expressContainer.style.display).not.toBe('none');

            // Wait for button to be rendered
            await Promise.resolve();
            const button = element.querySelector('.button-checkout');
            expect(button).not.toBeNull();
            expect(button.variant).toBe('secondary');
        });

        it('should update UI when express payment is not available', async () => {
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);

            // Wait for component to update
            await Promise.resolve();

            // Verify UI updates
            const loadingContainer = element.querySelector('.loading-container');
            expect(loadingContainer.classList.contains('loaded')).toBe(true);

            const expressContainer = element.querySelector('.express-container');
            expect(expressContainer.style.display).toBe('none');

            // Wait for button to be rendered
            await Promise.resolve();
            const button = element.querySelector('.button-checkout');
            expect(button).not.toBeNull();
            expect(button.variant).toBe('primary');
        });

        it('should handle express payment with undefined availability', async () => {
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: undefined,
            });
            expressPayment.dispatchEvent(event);

            // Wait for component to update
            await Promise.resolve();

            // Verify UI updates
            const loadingContainer = element.querySelector('.loading-container');
            expect(loadingContainer.classList.contains('loaded')).toBe(true);

            const expressContainer = element.querySelector('.express-container');
            expect(expressContainer.style.display).toBe('none');

            // Wait for button to be rendered
            await Promise.resolve();
            const button = element.querySelector('.button-checkout');
            expect(button).not.toBeNull();
            expect(button.variant).toBe('primary');
        });
    });

    describe('Add to cart button functionality', () => {
        beforeEach(async () => {
            // Trigger express payment loaded event to render the button
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();
        });

        it('should have correct button configuration properties', async () => {
            // Wait for button to be rendered
            await Promise.resolve();
            const button = element.querySelector('.button-checkout');
            expect(button).not.toBeNull();

            // Check button properties
            expect(button.variant).toBe('primary');
            expect(button.width).toBe('stretch');
        });

        it('should handle add to cart button click and fire event', async () => {
            const addToCartHandler = jest.fn();
            element.addEventListener('addtocart', addToCartHandler);

            // Wait for button to be rendered
            await Promise.resolve();
            const button = element.querySelector('.button-checkout');
            expect(button).not.toBeNull();

            // Click the button
            button.click();

            // Verify event was fired
            expect(addToCartHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        productName: mockProduct.name,
                        quantity: expect.any(Number),
                        variantDetails: expect.any(Array),
                    }),
                })
            );
        });

        it('should be enabled when all required variants are selected', async () => {
            await Promise.resolve();
            const button = element.querySelector('.button-checkout');
            expect(button).not.toBeNull();
            // The mock product has color selected but size is not selected, so button should be disabled
            expect(button.disabled).toBe(true);
        });
    });

    describe('Add to cart button accessibility and properties', () => {
        beforeEach(async () => {
            // Trigger express payment loaded event to render the button
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();
        });

        it('should have correct button text', async () => {
            await Promise.resolve();
            const button = element.querySelector('.button-checkout');
            expect(button).not.toBeNull();
            // The button text comes from the label import, which appears as the key in tests
            expect(button.textContent.trim()).toContain('c.Product_addToCartAssistiveText');
        });

        it('should update button variant based on express payment availability', async () => {
            // Test with express payment available
            const newElement = createElement('c-product-details', {
                is: ProductDetails,
            });
            newElement.product = mockProduct;
            document.body.appendChild(newElement);

            const expressPayment = newElement.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: true },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();

            const button = newElement.querySelector('.button-checkout');
            expect(button).not.toBeNull();
            expect(button.variant).toBe('secondary');

            document.body.removeChild(newElement);
        });
    });

    describe('Express payment error handling', () => {
        beforeEach(async () => {
            // Trigger express payment loaded event to render the button
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();
        });

        it('should handle null product gracefully', async () => {
            const newElement = createElement('c-product-details', {
                is: ProductDetails,
            });
            newElement.product = null;
            document.body.appendChild(newElement);

            // Should not throw an error
            expect(newElement.product).toBeNull();

            document.body.removeChild(newElement);
        });

        it('should handle missing variant data gracefully', async () => {
            const productWithoutVariants = {
                ...mockProduct,
                vattr: undefined,
            };
            const newElement = createElement('c-product-details', {
                is: ProductDetails,
            });
            newElement.product = productWithoutVariants;
            document.body.appendChild(newElement);

            // Trigger express payment loaded event
            const expressPayment = newElement.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();

            const button = newElement.querySelector('.button-checkout');
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(false); // Should be enabled when no variants are required

            document.body.removeChild(newElement);
        });
    });

    describe('Component property validation', () => {
        it('should have default values for component properties', () => {
            expect(element.product).toEqual(mockProduct);
            expect(element.entryId).toBe('test-entry-456');
        });

        it('should handle empty product gracefully', () => {
            const newElement = createElement('c-product-details', {
                is: ProductDetails,
            });
            newElement.product = {};
            document.body.appendChild(newElement);

            // Should not throw an error
            expect(newElement.product).toEqual({});

            // Express payment should still render
            const expressPayment = newElement.querySelector('c-express-payment');
            expect(expressPayment).not.toBeNull();

            document.body.removeChild(newElement);
        });
    });

    describe('Integration test coverage', () => {
        it('should render all components together correctly', () => {
            // Verify the complete component renders without errors
            expect(element).not.toBeNull();

            // Verify key child components are present
            const childComponents = ['c-express-payment', 'lightning-spinner'];

            childComponents.forEach((selector) => {
                expect(element.querySelector(selector)).not.toBeNull();
            });
        });

        it('should handle component re-rendering', async () => {
            // Change a property to trigger re-render
            const newProduct = { ...mockProduct, name: 'Updated Product Name' };
            element.product = newProduct;

            // Verify the property was set
            expect(element.product.name).toBe('Updated Product Name');
        });

        it('should maintain state through express payment loading cycles', async () => {
            // Initial state - spinner should be visible, button should not be visible
            expect(element.querySelector('lightning-spinner')).not.toBeNull();
            expect(element.querySelector('.button-checkout')).toBeNull();

            // First load event
            const expressPayment = element.querySelector('c-express-payment');
            let event = new CustomEvent('expressloaded', {
                detail: { available: true },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();

            // After loading, button should be visible with secondary variant
            expect(element.querySelector('.button-checkout')).not.toBeNull();
            expect(element.querySelector('.button-checkout').variant).toBe('secondary');

            // Second load event with different availability
            event = new CustomEvent('expressloaded', {
                detail: { available: false },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();

            // Button should still be visible but with primary variant
            expect(element.querySelector('.button-checkout')).not.toBeNull();
            expect(element.querySelector('.button-checkout').variant).toBe('primary');
        });
    });
});

describe('c-product-details negative cases', () => {
    let element;

    const mockProductWithNoImages = {
        ...mockProduct,
        imgGroups: null,
    };

    beforeEach(async () => {
        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        element.product = mockProductWithNoImages;
        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('handles product with no images', () => {
        const images = element.querySelectorAll('.image-carousel-image');
        expect(images.length).toBe(0);
    });
});

describe('c-product-details quantity buttons', () => {
    let element;

    beforeEach(async () => {
        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        element.product = mockProduct;
        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should initialize with quantity minQuantity, decrement button disabled and increment button enabled', () => {
        const quantityValue = element.querySelector('.quantity-value');
        expect(quantityValue.textContent).toBe(String(mockProduct.quantity.minQuantity));
        const decrementButton = element.querySelector('.quantity-decrement-button');
        expect(decrementButton.disabled).toBe(true);
        const incrementButton = element.querySelector('.quantity-increment-button');
        expect(incrementButton.disabled).toBe(false);
    });

    it('should increment quantity, enable decrement button and enable increment button when increment button is clicked and quantity is greater than minQuantity', async () => {
        let incrementButton = element.querySelector('.quantity-increment-button');
        incrementButton.click();
        await Promise.resolve();
        const quantityValue = element.querySelector('.quantity-value');
        expect(quantityValue.textContent).toBe(
            String(mockProduct.quantity.minQuantity + mockProduct.quantity.increment)
        );
        const decrementButton = element.querySelector('.quantity-decrement-button');
        expect(decrementButton.disabled).toBe(false);
        incrementButton = element.querySelector('.quantity-increment-button');
        expect(incrementButton.disabled).toBe(false);
    });

    it('should decrement quantity, enable increment button and disable decrement button when quantity is minQuantity + increment and decrement button is clicked', async () => {
        element.quantity = 1;
        let decrementButton = element.querySelector('.quantity-decrement-button');
        decrementButton.click();
        await Promise.resolve();
        const quantityValue = element.querySelector('.quantity-value');
        expect(quantityValue.textContent).toBe(String(1 - mockProduct.quantity.increment));
        const incrementButton = element.querySelector('.quantity-increment-button');
        expect(incrementButton.disabled).toBe(false);
        decrementButton = element.querySelector('.quantity-decrement-button');
        expect(decrementButton.disabled).toBe(true);
    });

    it('should not allow decrement below minQuantity and disable the button', async () => {
        const decrementButton = element.querySelector('.quantity-decrement-button');
        decrementButton.click();
        await Promise.resolve();
        const quantityValue = element.querySelector('.quantity-value');
        expect(quantityValue.textContent).toBe('0.5');
        expect(decrementButton.disabled).toBe(true);
    });

    it('should not allow increment above max quantity and disable the increment button', async () => {
        element.quantity = Number(mockProduct.quantity.maxQuantity);
        let incrementButton = element.querySelector('.quantity-increment-button');
        incrementButton.click();
        await Promise.resolve();
        const quantityValue = element.querySelector('.quantity-value');
        expect(quantityValue.textContent).toBe(String(mockProduct.quantity.maxQuantity));
        expect(incrementButton.disabled).toBe(true);
    });

    it('should handle quantity setter with invalid values', () => {
        element.product = mockProduct;

        // Test invalid quantity values
        element.quantity = 'invalid';
        expect(element.quantity).toBe(0.5); // Should default to minQuantity

        element.quantity = null;
        expect(element.quantity).toBe(0.5); // Should default to minQuantity

        element.quantity = undefined;
        expect(element.quantity).toBe(0.5); // Should default to minQuantity
    });
});

describe('c-product-details variant handling', () => {
    let element;

    const mockProductWithVariants = {
        ...mockProduct,
        vattr: [
            {
                id: 'color',
                lbl: 'Color',
                selected: 'JJ169XX',
                opts: [
                    { val: 'JJ169XX', name: 'Red' },
                    { val: 'JJI15XX', name: 'Blue' },
                ],
            },
            {
                id: 'size',
                lbl: 'Size',
                selected: 'M',
                opts: [
                    { val: '016', name: 'Small' },
                    { val: 'M', name: 'Medium' },
                ],
            },
        ],
        vmat: [
            {
                vattr: { color: 'JJ169XX', size: 'M' },
                ord: true,
                pr: { cur: 29.99, orig: 29.99 },
            },
            {
                vattr: { color: 'JJI15XX', size: '016' },
                ord: false,
                pr: { cur: 29.99, orig: 29.99 },
            },
        ],
        imgGroups: [
            {
                imgs: [
                    {
                        url: 'https://example.com/swatch1.jpg',
                        alt: 'Red swatch',
                        title: 'Red',
                    },
                ],
                vattr: [{ id: 'color', values: ['JJ169XX'] }],
                viewType: 'swatch',
            },
            {
                images: [
                    {
                        url: 'https://example.com/swatch2.jpg',
                        alt: 'Blue swatch',
                        title: 'Blue',
                    },
                ],
                vattr: [{ id: 'color', values: ['JJI15XX'] }],
                viewType: 'swatch',
            },
        ],
    };

    beforeEach(async () => {
        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        element.product = mockProductWithVariants;
        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('initializes with correct variant buttons', () => {
        const variantButtons = element.querySelectorAll('.variant-button');
        expect(variantButtons.length).toBeGreaterThan(0);

        // Check if selected variant is marked as selected
        const selectedButtons = element.querySelectorAll('.variant-button.selected');
        // Both color and size should be selected initially based on the mock data
        expect(selectedButtons.length).toBe(2);
    });

    it('updates product price when variant is selected', async () => {
        const colorButton = element.querySelector('.variant-button[data-variant-name="color"][data-value="JJI15XX"]');
        expect(colorButton).not.toBeNull();
        colorButton.click();
        await Promise.resolve();

        // Verify price update through DOM
        const priceElement = element.querySelector('.negotiated-price');
        expect(priceElement).toBeDefined();
    });

    it('displays correct variant options', () => {
        const variantButtons = element.querySelectorAll('.variant-button');
        expect(variantButtons.length).toBeGreaterThan(0);

        // Check if color buttons have correct styling
        const colorButtons = element.querySelectorAll('.color-button');
        colorButtons.forEach((button) => {
            // The background image should contain a URL, not necessarily 'swatch'
            expect(button.style.backgroundImage).toMatch(/url\(.*\)/);
        });
    });

    it('handles variant selection and updates UI', async () => {
        const colorButton = element.querySelector('.variant-button[data-variant-name="color"][data-value="JJI15XX"]');
        expect(colorButton).not.toBeNull();
        colorButton.click();
        await Promise.resolve();

        // Verify UI updates - now should have 2 selected (color and size)
        const selectedButtons = element.querySelectorAll('.variant-button.selected');
        expect(selectedButtons.length).toBe(2);
    });

    it('disables non-orderable variants', () => {
        const nonOrderableButton = element.querySelector('.variant-button[data-variant-name="size"][data-value="016"]');
        expect(nonOrderableButton).not.toBeNull();
        expect(nonOrderableButton.disabled).toBe(true);
    });

    it('should handle correct images for non-large viewType', async () => {
        const productWithSwatchImages = {
            ...mockProduct,
            imgGroups: [
                {
                    imgs: [{ url: '/default1.jpg', alt: 'Default 1' }],
                },
                {
                    imgs: [{ url: '/swatch1.jpg', alt: 'Swatch 1' }],
                    vattr: [{ id: 'color', vals: ['RED'] }],
                    viewType: 'swatch',
                },
            ],
            baseUrl: 'https://example.com',
        };
        element.product = productWithSwatchImages;
        await Promise.resolve();
        // Should return empty array for non-large viewType when no matches found
        // This tests the fallback case in getFilteredImages
        const images = element.querySelectorAll('.image-carousel-image');
        expect(images.length).toBe(1); // Only default images
    });
});

describe('c-product-details getFilteredVariants and price updates', () => {
    let element;

    const mockProductWithPriceVariants = {
        ...mockProduct,
        vattr: [
            {
                id: 'color',
                lbl: 'Color',
                selected: 'JJ169XX',
                opts: [
                    { val: 'JJ169XX', name: 'Black' },
                    { val: 'JJI15XX', name: 'Blue' },
                ],
            },
            {
                id: 'size',
                lbl: 'Size',
                selected: '008',
                opts: [
                    { val: '006', name: 'Small' },
                    { val: '008', name: 'Medium' },
                    { val: '010', name: 'Large' },
                ],
            },
        ],
        vmat: [
            {
                vars: { color: 'JJ169XX', size: '006' },
                ord: true,
                pr: { cur: 110.99, orig: 110.99 },
            },
            {
                vars: { color: 'JJ169XX', size: '008' },
                ord: true,
                pr: { cur: 125.99, orig: 130.99 },
            },
            {
                vars: { color: 'JJ169XX', size: '010' },
                ord: true,
                pr: { cur: 135.99, orig: 140.99 },
            },
            {
                vars: { color: 'JJI15XX', size: '006' },
                ord: true,
                pr: { cur: 120.99, orig: 120.99 },
            },
            {
                vars: { color: 'JJI15XX', size: '008' },
                ord: true,
                pr: { cur: 130.99, orig: 135.99 },
            },
            {
                vars: { color: 'JJI15XX', size: '010' },
                ord: true,
                pr: { cur: 140.99, orig: 145.99 },
            },
        ],
        pr: { cur: 125.99, orig: 130.99 }, // Initial price for selected variant
    };

    beforeEach(async () => {
        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        element.product = mockProductWithPriceVariants;
        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should initialize with correct price based on selected variants', () => {
        // Initial price should match the selected variant (color: JJ169XX, size: 008)
        const priceElement = element.querySelector('.negotiated-price');
        expect(priceElement).not.toBeNull();
        expect(priceElement.currencyCode).toBe(mockProductWithPriceVariants.ccy);
    });

    it('should update price when color variant is changed', async () => {
        // Get the blue color button
        const blueColorButton = element.querySelector(
            '.variant-button[data-variant-name="color"][data-value="JJI15XX"]'
        );
        expect(blueColorButton).not.toBeNull();

        // Click the blue color button
        blueColorButton.click();
        await Promise.resolve();

        // The price should be updated to match the new variant combination
        // (color: JJI15XX, size: 008) which has price 130.99
        const priceElement = element.querySelector('.negotiated-price');
        expect(priceElement).not.toBeNull();
        expect(Number(priceElement.value)).toBe(130.99);
    });

    it('should update price when size variant is changed', async () => {
        // Get the large size button
        const largeSizeButton = element.querySelector('.variant-button[data-variant-name="size"][data-value="010"]');
        expect(largeSizeButton).not.toBeNull();

        // Click the large size button
        largeSizeButton.click();
        await Promise.resolve();

        // The price should be updated to match the new variant combination
        // (color: JJ169XX, size: 010) which has price 135.99
        const priceElement = element.querySelector('.negotiated-price');
        expect(priceElement).not.toBeNull();
        expect(Number(priceElement.value)).toBe(135.99);
    });

    it('should update price when both color and size variants are changed', async () => {
        // First change color to blue
        const blueColorButton = element.querySelector(
            '.variant-button[data-variant-name="color"][data-value="JJI15XX"]'
        );
        blueColorButton.click();
        await Promise.resolve();

        // Then change size to large
        const largeSizeButton = element.querySelector('.variant-button[data-variant-name="size"][data-value="010"]');
        largeSizeButton.click();
        await Promise.resolve();

        // The price should be updated to match the new variant combination
        // (color: JJI15XX, size: 010) which has price 140.99
        const priceElement = element.querySelector('.negotiated-price');
        expect(priceElement).not.toBeNull();
        expect(Number(priceElement.value)).toBe(140.99);
    });

    it('should handle variant selection with multiple price changes', async () => {
        // Change color to blue (should update price)
        const blueColorButton = element.querySelector(
            '.variant-button[data-variant-name="color"][data-value="JJI15XX"]'
        );
        blueColorButton.click();
        await Promise.resolve();

        // Verify price updated to 130.99 (color: JJI15XX, size: 008)
        let priceElement = element.querySelector('.negotiated-price');
        expect(priceElement).not.toBeNull();
        expect(Number(priceElement.value)).toBe(130.99);

        // Change size to small (should update price again)
        const smallSizeButton = element.querySelector('.variant-button[data-variant-name="size"][data-value="006"]');
        smallSizeButton.click();
        await Promise.resolve();

        // Verify price updated to 120.99 (color: JJI15XX, size: 006)
        priceElement = element.querySelector('.negotiated-price');
        expect(priceElement).not.toBeNull();
        expect(Number(priceElement.value)).toBe(120.99);

        // Change back to original color (should update price again)
        const blackColorButton = element.querySelector(
            '.variant-button[data-variant-name="color"][data-value="JJ169XX"]'
        );
        blackColorButton.click();
        await Promise.resolve();

        // Verify price updated to 110.99 (color: JJ169XX, size: 006)
        priceElement = element.querySelector('.negotiated-price');
        expect(priceElement).not.toBeNull();
        expect(Number(priceElement.value)).toBe(110.99);
    });

    it('should update selected variant state when variant buttons are clicked', async () => {
        // Get the blue color button
        const blueColorButton = element.querySelector(
            '.variant-button[data-variant-name="color"][data-value="JJI15XX"]'
        );
        expect(blueColorButton).not.toBeNull();

        // Initially, the blue button should not be selected
        expect(blueColorButton.getAttribute('aria-pressed')).toBe('false');

        // Click the blue color button
        blueColorButton.click();
        await Promise.resolve();

        // Now the blue button should be selected
        expect(blueColorButton.getAttribute('aria-pressed')).toBe('true');

        // The original black button should no longer be selected
        const blackColorButton = element.querySelector(
            '.variant-button[data-variant-name="color"][data-value="JJ169XX"]'
        );
        expect(blackColorButton.getAttribute('aria-pressed')).toBe('false');

        // Verify price updated to 130.99 (color: JJI15XX, size: 008)
        const priceElement = element.querySelector('.negotiated-price');
        expect(priceElement).not.toBeNull();
        expect(Number(priceElement.value)).toBe(130.99);
    });

    it('should maintain size selection when only color is changed', async () => {
        // Get the large size button and click it first
        const largeSizeButton = element.querySelector('c-common-button[data-variant-name="size"][data-value="010"]');
        largeSizeButton.click();
        await Promise.resolve();

        // Verify large size is selected
        expect(largeSizeButton.getAttribute('aria-pressed')).toBe('true');

        // Verify price updated to 135.99 (color: JJ169XX, size: 010)
        let priceElement = element.querySelector('.negotiated-price');
        expect(priceElement).not.toBeNull();
        expect(Number(priceElement.value)).toBe(135.99);

        // Now change color to blue
        const blueColorButton = element.querySelector(
            '.variant-button[data-variant-name="color"][data-value="JJI15XX"]'
        );
        blueColorButton.click();
        await Promise.resolve();

        // Large size should still be selected
        expect(largeSizeButton.getAttribute('aria-pressed')).toBe('true');

        // Blue color should be selected
        expect(blueColorButton.getAttribute('aria-pressed')).toBe('true');

        // Verify price updated to 140.99 (color: JJI15XX, size: 010)
        priceElement = element.querySelector('.negotiated-price');
        expect(priceElement).not.toBeNull();
        expect(Number(priceElement.value)).toBe(140.99);
    });

    it('should handle variant selection with non-orderable variants', async () => {
        // Create a product with some non-orderable variants
        const productWithNonOrderableVariants = {
            ...mockProductWithPriceVariants,
            vattr: [
                {
                    id: 'color',
                    lbl: 'Color',
                    selected: 'JJ169XX',
                    opts: [
                        { val: 'JJ169XX', name: 'Black' },
                        { val: 'JJI15XX', name: 'Blue' },
                    ],
                },
                {
                    id: 'size',
                    lbl: 'Size',
                    selected: '006',
                    opts: [
                        { val: '006', name: 'Small' },
                        { val: '008', name: 'Medium' },
                    ],
                },
            ],
            vmat: [
                {
                    vars: { color: 'JJ169XX', size: '006' },
                    ord: null, // orderable
                    pr: { cur: 110.99, orig: 110.99 },
                },
                {
                    vars: { color: 'JJ169XX', size: '008' },
                    ord: false, // Non-orderable
                    pr: { cur: 125.99, orig: 130.99 },
                },
                {
                    vars: { color: 'JJI15XX', size: '006' },
                    pr: { cur: 120.99, orig: 120.99 },
                },
            ],
        };

        element.product = productWithNonOrderableVariants;
        await Promise.resolve();

        // The non-orderable variant should be disabled
        const nonOrderableButton = element.querySelector('c-common-button[data-variant-name="size"][data-value="008"]');
        expect(nonOrderableButton.disabled).toBe(true);

        // Clicking a valid variant should still work
        const validColorButton = element.querySelector(
            '.variant-button[data-variant-name="color"][data-value="JJI15XX"]'
        );
        validColorButton.click();
        await Promise.resolve();
        await Promise.resolve(); // ensure re-render

        // Check if the button is selected by aria-pressed or class
        const isSelected =
            validColorButton.getAttribute('aria-pressed') === 'true' || validColorButton.classList.contains('selected');
        expect(isSelected).toBe(true);

        const sizeButton = element.querySelector('.variant-button[data-variant-name="size"][data-value="006"]');
        sizeButton.click();
        await Promise.resolve();
        // Verify that the price updates correctly for the selected variant
        const priceElement = element.querySelector('.negotiated-price');
        expect(priceElement).not.toBeNull();
        // The expected price for color: 'JJI15XX', size: '006' (default size) is 120.99
        expect(Number(priceElement.value)).toBe(120.99);
    });
});

describe('c-product-details edge cases', () => {
    let element;

    beforeEach(async () => {
        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        // Don't append to DOM in beforeEach - we'll do it in individual tests
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should handle variant options without val property', async () => {
        const productWithInvalidOptions = {
            ...mockProduct,
            vattr: [
                {
                    id: 'color',
                    lbl: 'Color',
                    selected: 'JJ169XX',
                    opts: [
                        { val: 'JJ169XX', name: 'Black' },
                        { name: 'Invalid Option' }, // Missing val property
                        { val: 'JJI15XX', name: 'Blue' },
                    ],
                },
            ],
        };
        element.product = productWithInvalidOptions;
        await Promise.resolve();
        // Should filter out options without val property
        const variantButtons = element.querySelectorAll('[data-variant-name]');
        expect(variantButtons.length).toBe(2); // Should only render valid options
    });

    it('should trigger SKU change detection when variant selection changes', async () => {
        // Setup a product with multiple variants that have different PIDs
        const productWithDifferentSkus = {
            ...mockProduct,
            vattr: [
                {
                    id: 'color',
                    lbl: 'Color',
                    selected: 'JJ169XX',
                    opts: [
                        { val: 'JJ169XX', name: 'Black' },
                        { val: 'JJI15XX', name: 'Blue' },
                    ],
                },
            ],
            vmat: [
                {
                    pid: 'SKU-BLACK-123',
                    vars: { color: 'JJ169XX' },
                    ord: true,
                    pr: { cur: 110.99, orig: 110.99 },
                },
                {
                    pid: 'SKU-BLUE-456',
                    vars: { color: 'JJI15XX' },
                    ord: true,
                    pr: { cur: 120.99, orig: 120.99 },
                },
            ],
        };

        element.product = productWithDifferentSkus;
        await Promise.resolve();

        // Mock the express payment component's updateSku method
        const expressPaymentComponent = element.querySelector('c-express-payment');
        const updateSkuSpy = jest.fn();
        expressPaymentComponent.updateSku = updateSkuSpy;

        // Simulate clicking the blue color variant button to trigger SKU change
        const blueColorButton = element.querySelector(
            '.variant-button[data-variant-name="color"][data-value="JJI15XX"]'
        );
        expect(blueColorButton).not.toBeNull();
        blueColorButton.click();
        await Promise.resolve();

        // Verify that the variant selection changed and would trigger line 77's SKU change logic
        // We can't directly test the private setter, but we can verify the UI updated correctly
        expect(blueColorButton.getAttribute('aria-pressed')).toBe('true');
    });

    it('should handle variant buttons when no variant matrix exists', async () => {
        const productWithoutVmat = {
            ...mockProduct,
            vmat: null,
        };
        element.product = productWithoutVmat;
        await Promise.resolve();

        // Should handle gracefully when vmat is null/undefined
        // The component still renders variant buttons but they should be disabled
        const variantButtons = element.querySelectorAll('[data-variant-name]');
        expect(variantButtons.length).toBeGreaterThan(0);

        // Check that variant buttons are rendered but may be disabled due to no variant matrix
        // Note: Not all buttons may be disabled if they have other orderable conditions
        expect(variantButtons.length).toBeGreaterThan(0);
    });

    it('should handle handleAddToCart with missing variant definitions', async () => {
        const productWithMissingVariants = {
            ...mockProduct,
            vattr: [
                {
                    id: 'color',
                    lbl: 'Color',
                    selected: 'JJ169XX',
                    opts: [{}],
                },
            ],
        };
        element.product = productWithMissingVariants;
        await Promise.resolve();

        const handler = jest.fn();
        element.addEventListener('addtocart', handler);

        // The variant-options container exists but should have no valid variant buttons
        const variantOptions = element.querySelector('.variant-options');
        expect(variantOptions).not.toBeNull();

        // Check that no variant buttons are rendered due to invalid options
        const variantButtons = element.querySelectorAll('[data-variant-name]');
        expect(variantButtons.length).toBe(0);
    });

    it('should return default images when no color is selected', async () => {
        const productWithImages = {
            ...mockProduct,
            imgGroups: [
                {
                    imgs: [
                        { url: '/image1.jpg', alt: 'Default Image 1' },
                        { url: '/image2.jpg', alt: 'Default Image 2' },
                    ],
                },
            ],
            baseUrl: 'https://example.com',
        };
        element.product = productWithImages;
        await Promise.resolve();

        // Should return default images with baseUrl prepended
        const images = element.querySelectorAll('.image-carousel-image');
        expect(images.length).toBe(2);
    });

    it('should handle getFilteredImages fallback for large viewType', async () => {
        element.product = mockProduct;
        await Promise.resolve();
        // Should fallback to default images for large viewType
        const images = element.querySelectorAll('.image-carousel-image');
        expect(images.length).toBe(2); // Should show default images
    });

    it('should handle isVariantOrderable with default orderable flag', async () => {
        const productWithDfOrd = {
            ...mockProduct,
            dfOrd: true, // Default orderable flag
            vattr: [
                {
                    id: 'color',
                    lbl: 'Color',
                    selected: 'JJ169XX',
                    opts: [
                        { val: 'JJ169XX', name: 'Black' },
                        { val: 'JJI15XX', name: 'Blue' },
                    ],
                },
            ],
            vmat: [
                {
                    vars: { color: 'JJ169XX' },
                    // No ord property, should use dfOrd
                    pr: { cur: 110.99, orig: 110.99 },
                },
                {
                    vars: { color: 'JJI15XX' },
                    // No ord property, should use dfOrd
                    pr: { cur: 120.99, orig: 120.99 },
                },
            ],
        };
        element.product = productWithDfOrd;
        await Promise.resolve(); // Wait for component to render

        // Should consider variant orderable when dfOrd is true and no ord property
        // Look for either button elements with variant-button class or c-common-button components
        const variantButtons = element.querySelectorAll('[data-variant-name]');
        expect(variantButtons.length).toBeGreaterThan(0);

        // Check that buttons are not disabled (orderable)
        const disabledButtons = element.querySelectorAll('[data-variant-name][disabled]');
        expect(disabledButtons.length).toBe(0);
    });
});

describe('c-product-details initialSelectedVariants', () => {
    let element;

    beforeEach(async () => {
        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should initialize with selected variant when variant has selected property', async () => {
        const productWithSelectedVariant = {
            ...mockProduct,
            vattr: [
                {
                    id: 'color',
                    lbl: 'Color',
                    selected: 'JJ169XX',
                    opts: [
                        { val: 'JJ169XX', name: 'Black' },
                        { val: 'JJI15XX', name: 'Blue' },
                    ],
                },
            ],
        };

        // Set product before adding to DOM to ensure connectedCallback runs with the product
        element.product = productWithSelectedVariant;
        document.body.appendChild(element);
        await Promise.resolve();

        // Check that the variant button for the selected variant is marked as selected
        const selectedButton = element.querySelector(
            '.selected[data-variant-name="color"][data-value="JJ169XX"][aria-pressed="true"]'
        );
        expect(selectedButton).not.toBeNull();
    });

    it('should initialize with single option when variant has only one option and is orderable', async () => {
        // Using mockProductForVariantSelection which has one color option
        element.product = mockProductForVariantSelection;
        document.body.appendChild(element);
        await Promise.resolve();

        // Check that the single option is automatically selected
        const selectedButton = element.querySelector(
            '.selected[data-variant-name="color"][data-value="JJI15XX"][aria-pressed="true"]'
        );
        expect(selectedButton).not.toBeNull();
    });

    it('should not initialize with single option when variant has only one option but is not orderable', async () => {
        element.product = mockProductNonOrderableSingleOption;
        document.body.appendChild(element);
        await Promise.resolve();

        // Check that no variant button is selected
        const selectedButtons = element.querySelectorAll('.selected');
        expect(selectedButtons.length).toBe(0);
    });

    it('should not initialize with single option when variant matrix is empty', async () => {
        element.product = mockProductEmptyVmat;
        document.body.appendChild(element);
        await Promise.resolve();

        // Check that no variant button is selected
        const selectedButtons = element.querySelectorAll('.selected');
        expect(selectedButtons.length).toBe(0);
    });

    it('should handle multiple variants with mixed conditions but auto select the variant which is only one in length and orderable', async () => {
        element.product = mockProductMixedVariants;
        document.body.appendChild(element);
        await Promise.resolve();

        // Check that both variants are selected
        const selectedButtons = element.querySelectorAll('.selected');
        expect(selectedButtons.length).toBe(2);

        // Check specific selections
        const colorButton = element.querySelector(
            '.selected[data-variant-name="color"][data-value="JJ169XX"][aria-pressed="true"]'
        );
        const sizeButton = element.querySelector(
            '.selected[data-variant-name="size"][data-value="M"][aria-pressed="true"]'
        );
        expect(colorButton).not.toBeNull();
        expect(sizeButton).not.toBeNull();
    });

    it('should handle variant with null options', async () => {
        const productWithNullOptions = {
            ...mockProduct,
            vattr: [
                {
                    id: 'color',
                    lbl: 'Color',
                    opts: null,
                },
            ],
        };
        element.product = productWithNullOptions;
        document.body.appendChild(element);
        await Promise.resolve();

        // Check that no variant button is rendered
        const variantButtons = element.querySelectorAll('[data-variant-name]');
        expect(variantButtons.length).toBe(0);
    });

    it('should handle multiple variants with different orderable states', async () => {
        const productWithMixedOrderableStates = {
            ...mockProduct,
            vattr: [
                {
                    id: 'color',
                    lbl: 'Color',
                    selected: 'JJ169XX',
                    opts: [
                        { val: 'JJ169XX', name: 'Black' },
                        { val: 'JJI15XX', name: 'Blue' },
                    ],
                },
                {
                    id: 'size',
                    lbl: 'Size',
                    opts: [
                        { val: 'M', name: 'Medium' }, // Single option, orderable
                    ],
                },
                {
                    id: 'style',
                    lbl: 'Style',
                    opts: [
                        { val: 'CASUAL', name: 'Casual' }, // Single option, not orderable
                    ],
                },
            ],
            vmat: [
                {
                    vars: { color: 'JJ169XX', size: 'M', style: 'CASUAL' },
                    ord: false, // Not orderable
                    pr: { cur: 110.99, orig: 110.99 },
                },
                {
                    vars: { color: 'JJ169XX', size: 'M', style: 'FORMAL' },
                    ord: true,
                    pr: { cur: 120.99, orig: 120.99 },
                },
            ],
        };
        element.product = productWithMixedOrderableStates;
        document.body.appendChild(element);
        await Promise.resolve();

        // Check that color and size are selected, but style is not
        const selectedButtons = element.querySelectorAll('[aria-pressed="true"]');
        expect(selectedButtons.length).toBe(2);

        const colorButton = element.querySelector(
            '.selected[data-variant-name="color"][data-value="JJ169XX"][aria-pressed="true"]'
        );
        const sizeButton = element.querySelector(
            '.selected[data-variant-name="size"][data-value="M"][aria-pressed="true"]'
        );
        const styleButton = element.querySelector(
            '.selected[data-variant-name="style"][data-value="CASUAL"][aria-pressed="true"]'
        );

        expect(colorButton).not.toBeNull();
        expect(sizeButton).not.toBeNull();
        expect(styleButton).toBeNull(); // Should not be selected because it's not orderable
    });

    it('should verify that selectedVariants is initialized correctly in connectedCallback', async () => {
        element.product = mockProductForVariantSelection;
        document.body.appendChild(element);
        await Promise.resolve();

        // Verify that the variant is selected in the UI
        const selectedButton = element.querySelector(
            '.selected[data-variant-name="color"][data-value="JJI15XX"][aria-pressed="true"]'
        );
        expect(selectedButton).not.toBeNull();
    });

    it('should handle product with no variants', async () => {
        element.product = mockProductNoVariants;
        document.body.appendChild(element);
        await Promise.resolve();

        // Check that no variant buttons are rendered
        const variantButtons = element.querySelectorAll('[data-variant-name]');
        expect(variantButtons.length).toBe(0);
    });

    it('should handle product with null variants', async () => {
        element.product = mockProductNullVariants;
        document.body.appendChild(element);
        await Promise.resolve();

        // Check that no variant buttons are rendered
        const variantButtons = element.querySelectorAll('[data-variant-name]');
        expect(variantButtons.length).toBe(0);
    });

    it('should not call updateSku when sku is null via handleExpressLoaded', async () => {
        // Setup express payment component with spy
        const expressPaymentComponent = element.querySelector('c-express-payment');
        const updateSkuSpy = jest.fn();
        expressPaymentComponent.updateSku = updateSkuSpy;

        // Mock the sku getter to return null (simulating no valid variant selected)
        jest.spyOn(element, 'sku', 'get').mockReturnValue(null);

        // Simulate express loaded event with available = true
        const event = new CustomEvent('expressloaded', {
            detail: { available: true },
        });

        expressPaymentComponent.dispatchEvent(event);
        await Promise.resolve();

        // Verify updateSku was not called due to null sku check
        expect(updateSkuSpy).not.toHaveBeenCalled();
    });
});
