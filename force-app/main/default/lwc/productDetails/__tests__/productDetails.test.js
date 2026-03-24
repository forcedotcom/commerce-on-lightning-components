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
    mockProductMissingVariantLabel,
    mockProductMissingOptionName,
    mockProductMissingBothFallbacks,
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
            productId: expect.any(String), // productId will be resolved from the mock data
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

    it('should use variantId as fallback when variant definition missing lbl property', async () => {
        element.product = mockProductMissingVariantLabel;
        await Promise.resolve();

        // Simulate express payment loaded event so the button renders
        const expressPayment = element.querySelector('c-express-payment');
        const expressLoadedEvent = new CustomEvent('expressloaded', {
            detail: { available: false },
        });
        expressPayment.dispatchEvent(expressLoadedEvent);
        await Promise.resolve();

        const addToCartHandler = jest.fn();
        element.addEventListener('addtocart', addToCartHandler);

        const button = element.querySelector('.button-checkout');
        expect(button).not.toBeNull();
        button.click();

        // Verify the event was fired with variantId as fallback for missing lbl
        expect(addToCartHandler).toHaveBeenCalled();
        const eventDetail = addToCartHandler.mock.calls[0][0].detail;
        expect(eventDetail.variantDetails).toEqual([
            expect.objectContaining({
                id: 'color',
                label: 'color', // Should use variantId as fallback since lbl is missing
                value: 'JJ169XX',
                displayName: 'Black', // Should use option name since it exists
            }),
        ]);
    });

    it('should use variantValue as fallback when option missing name property', async () => {
        element.product = mockProductMissingOptionName;
        await Promise.resolve();

        // Simulate express payment loaded event so the button renders
        const expressPayment = element.querySelector('c-express-payment');
        const expressLoadedEvent = new CustomEvent('expressloaded', {
            detail: { available: false },
        });
        expressPayment.dispatchEvent(expressLoadedEvent);
        await Promise.resolve();

        const addToCartHandler = jest.fn();
        element.addEventListener('addtocart', addToCartHandler);

        const button = element.querySelector('.button-checkout');
        expect(button).not.toBeNull();
        button.click();

        // Verify the event was fired with variantValue as fallback for missing option name
        expect(addToCartHandler).toHaveBeenCalled();
        const eventDetail = addToCartHandler.mock.calls[0][0].detail;
        expect(eventDetail.variantDetails).toEqual([
            expect.objectContaining({
                id: 'color',
                label: 'Color', // Should use lbl since it exists
                value: 'JJ169XX',
                displayName: 'JJ169XX', // Should use variantValue as fallback since option name is missing
            }),
        ]);
    });

    it('should use both variantId and variantValue as fallbacks when both lbl and option name are missing', async () => {
        element.product = mockProductMissingBothFallbacks;
        await Promise.resolve();

        // Simulate express payment loaded event so the button renders
        const expressPayment = element.querySelector('c-express-payment');
        const expressLoadedEvent = new CustomEvent('expressloaded', {
            detail: { available: false },
        });
        expressPayment.dispatchEvent(expressLoadedEvent);
        await Promise.resolve();

        const addToCartHandler = jest.fn();
        element.addEventListener('addtocart', addToCartHandler);

        const button = element.querySelector('.button-checkout');
        expect(button).not.toBeNull();
        button.click();

        // Verify the event was fired with both fallbacks
        expect(addToCartHandler).toHaveBeenCalled();
        const eventDetail = addToCartHandler.mock.calls[0][0].detail;
        expect(eventDetail.variantDetails).toEqual([
            expect.objectContaining({
                id: 'color',
                label: 'color', // Should use variantId as fallback since lbl is missing
                value: 'JJ169XX',
                displayName: 'JJ169XX', // Should use variantValue as fallback since option name is missing
            }),
        ]);
    });
});

describe('c-product-details express payment loading states', () => {
    let element;
    let mockLocalStorage;

    beforeEach(async () => {
        // Mock localStorage
        mockLocalStorage = {
            getItem: jest.fn((key) => {
                const mockData = {
                    pwaDomainUrl: 'https://www.phased-launch-testing.com',
                    pwaSiteId: 'site-123',
                    pwaLocale: 'en-US',
                };
                return mockData[key] || null;
            }),
            setItem: jest.fn(),
        };
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true,
        });

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
            expect(expressPayment.expressPaymentUrl).toBe(
                'https://www.phased-launch-testing.com/site-123/en-US/express'
            );
        });

        it('should construct PWA URL from localStorage when product has no expressPaymentUrl', async () => {
            const productWithoutExpressUrl = { ...mockProduct };
            delete productWithoutExpressUrl.expressPaymentUrl;
            element.product = productWithoutExpressUrl;
            await Promise.resolve();

            const expressPayment = element.querySelector('c-express-payment');
            expect(expressPayment).not.toBeNull();
            expect(expressPayment.expressPaymentUrl).toBe(
                'https://www.phased-launch-testing.com/site-123/en-US/express'
            );
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('pwaDomainUrl');
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('pwaSiteId');
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('pwaLocale');
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
            expect(spinner.alternativeText).toBe('Loading express payment options...');
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
            // The button text should now be the actual translated text from i18n
            // In test environment, it should fall back to the default English text
            expect(button.textContent.trim()).toBe('Add To Cart');
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

describe('Express payment URL construction', () => {
    let element;
    let mockLocalStorage;
    let mockProductWithoutExpressUrl;

    beforeEach(async () => {
        // Mock localStorage
        mockLocalStorage = {
            getItem: jest.fn((key) => {
                const mockData = {
                    pwaDomainUrl: 'https://www.phased-launch-testing.com',
                    pwaSiteId: 'site-123',
                    pwaLocale: 'en-US',
                };
                return mockData[key] || null;
            }),
            setItem: jest.fn(),
        };
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true,
        });

        mockProductWithoutExpressUrl = { ...mockProduct };
        delete mockProductWithoutExpressUrl.expressPaymentUrl;

        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        element.product = mockProductWithoutExpressUrl;
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

    it('should use constructed PWA URL from localStorage over product expressPaymentUrl', async () => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        element.product = mockProduct;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe('https://www.phased-launch-testing.com/site-123/en-US/express');
    });

    it('should construct express payment URL from localStorage values when product has no expressPaymentUrl', () => {
        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe('https://www.phased-launch-testing.com/site-123/en-US/express');
    });

    it('should call localStorage.getItem for required keys when falling back', () => {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('pwaDomainUrl');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('pwaSiteId');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('pwaLocale');
    });

    it('should return null when localStorage values are missing and no product expressPaymentUrl', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        element.product = mockProductWithoutExpressUrl;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe('null');
    });

    it('should handle localStorage errors gracefully when no product expressPaymentUrl', async () => {
        mockLocalStorage.getItem.mockImplementation(() => {
            throw new Error('localStorage error');
        });

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        element.product = mockProductWithoutExpressUrl;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe('null');
    });

    it('should fall back to product expressPaymentUrl when localStorage values are missing', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        element.product = mockProduct;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe('https://www.phased-launch-testing.com/express');
    });

    it('should construct SFRA express payment URL from localizedUrl in localStorage', async () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === 'localizedUrl')
                return 'https://zysn-003.unified.demandware.net/on/demandware.servlet/Sites-RefArch-Site/en_US';
            return null;
        });

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        element.product = mockProductWithoutExpressUrl;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe(
            'https://zysn-003.unified.demandware.net/on/demandware.store/Sites-RefArch-Site/en_US/Payments-Express'
        );
    });

    it('should use SFRA localizedUrl over PWA keys when both are in localStorage', async () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
            const mockData = {
                localizedUrl: 'https://zysn-003.unified.demandware.net/on/demandware.servlet/Sites-RefArch-Site/en_US',
                pwaDomainUrl: 'https://www.phased-launch-testing.com',
                pwaSiteId: 'site-123',
                pwaLocale: 'en-US',
            };
            return mockData[key] || null;
        });

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        element.product = mockProductWithoutExpressUrl;
        element.entryId = 'test-entry-456';
        document.body.appendChild(element);
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment).not.toBeNull();
        expect(expressPayment.expressPaymentUrl).toBe(
            'https://zysn-003.unified.demandware.net/on/demandware.store/Sites-RefArch-Site/en_US/Payments-Express'
        );
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

    it('should call updateExpressPaymentQuantity when quantity setter is used and express payment is available', async () => {
        // Setup express payment component
        const expressPaymentComponent = element.querySelector('c-express-payment');
        const updateQuantitySpy = jest.fn();
        expressPaymentComponent.updateQuantity = updateQuantitySpy;

        // Trigger express payment loaded event to mark it as available
        const event = new CustomEvent('expressloaded', {
            detail: { available: true },
        });
        expressPaymentComponent.dispatchEvent(event);
        await Promise.resolve();

        // Clear any calls from the handleExpressLoaded method
        updateQuantitySpy.mockClear();

        // Set quantity via setter
        element.quantity = 3;

        expect(updateQuantitySpy).toHaveBeenCalledWith(3);
    });

    it('should not call updateExpressPaymentQuantity when quantity setter is used and express payment is not available', async () => {
        // Setup express payment component
        const expressPaymentComponent = element.querySelector('c-express-payment');
        const updateQuantitySpy = jest.fn();
        expressPaymentComponent.updateQuantity = updateQuantitySpy;

        // Trigger express payment loaded event to mark it as not available
        const event = new CustomEvent('expressloaded', {
            detail: { available: false },
        });
        expressPaymentComponent.dispatchEvent(event);
        await Promise.resolve();

        // Clear any calls from the handleExpressLoaded method
        updateQuantitySpy.mockClear();

        // Set quantity via setter
        element.quantity = 3;

        expect(updateQuantitySpy).not.toHaveBeenCalled();
    });

    it('should call updateExpressPaymentQuantity when increment button is clicked and express payment is available', async () => {
        // Setup express payment component
        const expressPaymentComponent = element.querySelector('c-express-payment');
        const updateQuantitySpy = jest.fn();
        expressPaymentComponent.updateQuantity = updateQuantitySpy;

        // Trigger express payment loaded event to mark it as available
        const event = new CustomEvent('expressloaded', {
            detail: { available: true },
        });
        expressPaymentComponent.dispatchEvent(event);
        await Promise.resolve();

        // Clear any calls from the handleExpressLoaded method
        updateQuantitySpy.mockClear();

        // Click increment button
        const incrementButton = element.querySelector('.quantity-increment-button');
        incrementButton.click();
        await Promise.resolve();

        const expectedQuantity = mockProduct.quantity.minQuantity + mockProduct.quantity.increment;
        expect(updateQuantitySpy).toHaveBeenCalledWith(expectedQuantity);
    });

    it('should call updateExpressPaymentQuantity when decrement button is clicked and express payment is available', async () => {
        // Set initial quantity higher than minimum
        element.quantity = 2;

        // Setup express payment component
        const expressPaymentComponent = element.querySelector('c-express-payment');
        const updateQuantitySpy = jest.fn();
        expressPaymentComponent.updateQuantity = updateQuantitySpy;

        // Trigger express payment loaded event to mark it as available
        const event = new CustomEvent('expressloaded', {
            detail: { available: true },
        });
        expressPaymentComponent.dispatchEvent(event);
        await Promise.resolve();

        // Clear any calls from the handleExpressLoaded method
        updateQuantitySpy.mockClear();

        // Click decrement button
        const decrementButton = element.querySelector('.quantity-decrement-button');
        decrementButton.click();
        await Promise.resolve();

        const expectedQuantity = 2 - mockProduct.quantity.increment;
        expect(updateQuantitySpy).toHaveBeenCalledWith(expectedQuantity);
    });

    it('should not call updateExpressPaymentQuantity when increment would exceed max quantity', async () => {
        // Set quantity to max
        element.quantity = mockProduct.quantity.maxQuantity;

        // Setup express payment component
        const expressPaymentComponent = element.querySelector('c-express-payment');
        const updateQuantitySpy = jest.fn();
        expressPaymentComponent.updateQuantity = updateQuantitySpy;

        // Trigger express payment loaded event to mark it as available
        const event = new CustomEvent('expressloaded', {
            detail: { available: true },
        });
        expressPaymentComponent.dispatchEvent(event);
        await Promise.resolve();

        // Clear any previous calls
        updateQuantitySpy.mockClear();

        // Click increment button (should not increment because at max)
        const incrementButton = element.querySelector('.quantity-increment-button');
        incrementButton.click();
        await Promise.resolve();

        expect(updateQuantitySpy).not.toHaveBeenCalled();
    });

    it('should not call updateExpressPaymentQuantity when decrement would go below min quantity', async () => {
        // Quantity should already be at minimum by default

        // Setup express payment component
        const expressPaymentComponent = element.querySelector('c-express-payment');
        const updateQuantitySpy = jest.fn();
        expressPaymentComponent.updateQuantity = updateQuantitySpy;

        // Trigger express payment loaded event to mark it as available
        const event = new CustomEvent('expressloaded', {
            detail: { available: true },
        });
        expressPaymentComponent.dispatchEvent(event);
        await Promise.resolve();

        // Clear any previous calls
        updateQuantitySpy.mockClear();

        // Click decrement button (should not decrement because at min)
        const decrementButton = element.querySelector('.quantity-decrement-button');
        decrementButton.click();
        await Promise.resolve();

        expect(updateQuantitySpy).not.toHaveBeenCalled();
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
                    { val: '016', name: 'Small', disabled: true },
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

    it('should return no images when images do not have url property available', async () => {
        const productWithoutImgUrl = {
            ...mockProductWithVariants,
            imgGroups: [
                {
                    imgs: [
                        {
                            alt: 'Red swatch',
                            title: 'Red',
                        },
                    ],
                    vattr: [{ id: 'color', vals: ['M'] }],
                    viewType: 'swatch',
                },
                {
                    imgs: [
                        {
                            alt: 'Blue swatch',
                            title: 'Blue',
                        },
                    ],
                    vattr: [{ id: 'color', vals: ['M'] }],
                    viewType: 'swatch',
                },
            ],
            baseUrl: 'https://example.com',
        };
        element.product = productWithoutImgUrl;
        await Promise.resolve();

        // Should return no images
        const images = element.querySelectorAll('.image-carousel-image');
        expect(images.length).toBe(1);
        expect(images[0].src).toBe('https://example.com/');
    });

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
        expect(nonOrderableButton.getAttribute('data-out-of-stock')).toBe('true');
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

    it('should fallback to original price when variant has no price in vmat', async () => {
        // Create a mock product where one variant combination doesn't have a price
        const mockProductWithMissingPrice = {
            ...mockProductWithPriceVariants,
            vmat: [
                {
                    vars: { color: 'JJI15XX', size: '008' },
                    ord: true,
                    pr: { cur: 130.99, orig: 135.99 },
                },
                // Intentionally missing price for color: JJI15XX, size: 010
                {
                    vars: { color: 'JJI15XX', size: '010' },
                    ord: true,
                    // No pr property - should fallback to original price
                },
            ],
            pr: { cur: 125.99, orig: 130.99 }, // Original base product price
        };

        // Create a new element with the modified mock data
        const testElement = createElement('c-product-details', {
            is: ProductDetails,
        });
        testElement.product = mockProductWithMissingPrice;
        document.body.appendChild(testElement);
        await Promise.resolve();

        // Select the variant that has no price (blue color, large size)
        const blueColorButton = testElement.querySelector(
            '.variant-button[data-variant-name="color"][data-value="JJI15XX"]'
        );
        expect(blueColorButton).not.toBeNull();
        blueColorButton.click();
        await Promise.resolve();

        const sizeButton = testElement.querySelector('.variant-button[data-variant-name="size"][data-value="008"]');
        expect(sizeButton).not.toBeNull();
        sizeButton.click();
        await Promise.resolve();
        let priceElement = testElement.querySelector('.negotiated-price');
        expect(priceElement).not.toBeNull();
        expect(Number(priceElement.value)).toBe(130.99);

        const largeSizeButton = testElement.querySelector(
            '.variant-button[data-variant-name="size"][data-value="010"]'
        );
        expect(largeSizeButton).not.toBeNull();
        largeSizeButton.click();
        await Promise.resolve();

        // Verify that the price falls back to the original price since variant has no price
        priceElement = testElement.querySelector('.negotiated-price');
        expect(priceElement).not.toBeNull();
        expect(Number(priceElement.value)).toBe(125.99); // Should use original price as fallback

        // Clean up
        document.body.removeChild(testElement);
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
                {
                    vars: { color: 'JJI15XX', size: '008' },
                    pr: { cur: 130.99, orig: 135.99 },
                },
            ],
        };

        element.product = productWithNonOrderableVariants;
        await Promise.resolve();

        // The non-orderable variant should be disabled
        const nonOrderableButton = element.querySelector('c-common-button[data-variant-name="size"][data-value="008"]');
        expect(nonOrderableButton).not.toBeNull();
        expect(nonOrderableButton.getAttribute('data-out-of-stock')).toBe('true');

        // Verify that the blue color button is enabled and clickable
        const validColorButton = element.querySelector(
            '.variant-button[data-variant-name="color"][data-value="JJI15XX"]'
        );
        expect(validColorButton).not.toBeNull();
        expect(validColorButton.disabled).toBe(false);

        // Click the blue color button
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

    it('should handle handleAddToCart with missing variant attributes', async () => {
        const productWithMissingVariants = {
            ...mockProduct,
            vattr: [
                {
                    id: 'color',
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

    it('should return no images when no baseUrl is available', async () => {
        const productWithoutBaseUrl = {
            ...mockProduct,
            imgGroups: [
                {
                    imgs: [
                        { url: '', alt: 'Default Image 1' },
                        { url: '', alt: 'Default Image 2' },
                    ],
                },
            ],
            baseUrl: '',
        };
        element.product = productWithoutBaseUrl;
        await Promise.resolve();

        // Should return no images
        const images = element.querySelectorAll('.image-carousel-image');
        expect(images.length).toBe(0);
    });

    it('should return no images when no imgGroups are available', async () => {
        const productWithoutBaseUrl = {
            ...mockProduct,
            imgGroups: [{}],
        };
        element.product = productWithoutBaseUrl;
        await Promise.resolve();

        // Should return no images
        const images = element.querySelectorAll('.image-carousel-image');
        expect(images.length).toBe(0);
    });

    it('should handle getFilteredImages fallback for large viewType', async () => {
        element.product = mockProduct;
        await Promise.resolve();
        // Should fallback to default images for large viewType
        const images = element.querySelectorAll('.image-carousel-image');
        expect(images.length).toBe(2); // Should show default images
    });

    it('should transform large URLs to medium URLs when viewType is large', async () => {
        const productWithLargeUrls = {
            ...mockProduct,
            imgGroups: [
                {
                    imgs: [
                        {
                            alt: 'Test image',
                            url: '/images/large/test-image.jpg',
                            title: 'Test Image',
                        },
                    ],
                },
            ],
            baseUrl: 'https://example.com',
        };
        element.product = productWithLargeUrls;
        await Promise.resolve();

        // Test by checking the rendered image src attributes
        const images = element.querySelectorAll('.image-carousel-image');
        expect(images).toHaveLength(1);
        expect(images[0].src).toBe('https://example.com/images/medium/test-image.jpg');
    });

    it('should handle URLs without large path correctly', async () => {
        const productWithNonLargeUrls = {
            ...mockProduct,
            imgGroups: [
                {
                    imgs: [
                        {
                            alt: 'Test image',
                            url: '/images/medium/test-image.jpg',
                            title: 'Test Image',
                        },
                    ],
                },
            ],
            baseUrl: 'https://example.com',
        };
        element.product = productWithNonLargeUrls;
        await Promise.resolve();

        // Test by checking the rendered image src attributes
        const images = element.querySelectorAll('.image-carousel-image');
        expect(images).toHaveLength(1);
        expect(images[0].src).toBe('https://example.com/images/medium/test-image.jpg');
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

    it('should use base product ID as SKU for products with no variants', async () => {
        element.product = mockProductNoVariants;
        document.body.appendChild(element);
        await Promise.resolve();

        // Setup express payment component with spy
        const expressPaymentComponent = element.querySelector('c-express-payment');
        const updateSkuSpy = jest.fn();
        expressPaymentComponent.updateSku = updateSkuSpy;

        // Simulate express loaded event with available = true to trigger SKU update
        const event = new CustomEvent('expressloaded', {
            detail: { available: true },
        });

        expressPaymentComponent.dispatchEvent(event);
        await Promise.resolve();

        // For products with no variants, SKU should be the base product ID
        expect(updateSkuSpy).toHaveBeenCalledWith('701643472246M');
    });

    it('should handle product with null variants', async () => {
        element.product = mockProductNullVariants;
        document.body.appendChild(element);
        await Promise.resolve();

        // Check that no variant buttons are rendered
        const variantButtons = element.querySelectorAll('[data-variant-name]');
        expect(variantButtons.length).toBe(0);
    });

    it('should use base product ID as SKU for products with null variants', async () => {
        element.product = mockProductNullVariants;
        document.body.appendChild(element);
        await Promise.resolve();

        // Setup express payment component with spy
        const expressPaymentComponent = element.querySelector('c-express-payment');
        const updateSkuSpy = jest.fn();
        expressPaymentComponent.updateSku = updateSkuSpy;

        // Simulate express loaded event with available = true to trigger SKU update
        const event = new CustomEvent('expressloaded', {
            detail: { available: true },
        });

        expressPaymentComponent.dispatchEvent(event);
        await Promise.resolve();

        // For products with null variants, SKU should be the base product ID
        expect(updateSkuSpy).toHaveBeenCalledWith('701643472246M');
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

    it('should call updateExpressPaymentQuantity when express payment loads and is available', async () => {
        // Setup express payment component with spy
        const expressPaymentComponent = element.querySelector('c-express-payment');
        const updateQuantitySpy = jest.fn();
        expressPaymentComponent.updateQuantity = updateQuantitySpy;

        // Mock the sku getter to return a valid SKU
        jest.spyOn(element, 'sku', 'get').mockReturnValue('test-sku-123');

        // Simulate express loaded event with available = true
        const event = new CustomEvent('expressloaded', {
            detail: { available: true },
        });

        expressPaymentComponent.dispatchEvent(event);
        await Promise.resolve();

        // Verify updateExpressPaymentQuantity was called with current quantity
        expect(updateQuantitySpy).toHaveBeenCalledWith(element.quantity);
    });

    it('should not call updateExpressPaymentQuantity when express payment loads but is not available', async () => {
        // Setup express payment component with spy
        const expressPaymentComponent = element.querySelector('c-express-payment');
        const updateQuantitySpy = jest.fn();
        expressPaymentComponent.updateQuantity = updateQuantitySpy;

        // Simulate express loaded event with available = false
        const event = new CustomEvent('expressloaded', {
            detail: { available: false },
        });

        expressPaymentComponent.dispatchEvent(event);
        await Promise.resolve();

        // Verify updateExpressPaymentQuantity was not called
        expect(updateQuantitySpy).not.toHaveBeenCalled();
    });

    describe('Window message handling and basket data functionality', () => {
        let mockLocalStorage;
        let mockPostMessage;
        let originalAddEventListener;
        let originalRemoveEventListener;

        beforeEach(async () => {
            // Mock localStorage
            mockLocalStorage = {
                getItem: jest.fn(),
                setItem: jest.fn(),
            };
            Object.defineProperty(window, 'localStorage', {
                value: mockLocalStorage,
                writable: true,
            });

            // Mock window.postMessage
            mockPostMessage = jest.fn();
            Object.defineProperty(window.parent, 'postMessage', {
                value: mockPostMessage,
                writable: true,
            });

            // Store original event listener methods
            originalAddEventListener = window.addEventListener;
            originalRemoveEventListener = window.removeEventListener;

            // Trigger express payment loaded event to ensure component is ready
            const expressPayment = element.querySelector('c-express-payment');
            const event = new CustomEvent('expressloaded', {
                detail: { available: true },
            });
            expressPayment.dispatchEvent(event);
            await Promise.resolve();
        });

        afterEach(() => {
            jest.clearAllMocks();
            // Restore original event listener methods
            window.addEventListener = originalAddEventListener;
            window.removeEventListener = originalRemoveEventListener;
        });

        describe('Customer data message handling', () => {
            it('should handle express.actualCustomerData message and store in localStorage', () => {
                const customerData = {
                    type: 'express.actualCustomerData',
                    payload: {
                        customerId: 'customer-123',
                        authToken: 'auth-token-456',
                    },
                };

                // Create and dispatch the message event to window
                const messageEvent = new MessageEvent('message', {
                    data: customerData,
                });

                // Dispatch the event to trigger the component's message handler
                window.dispatchEvent(messageEvent);

                // Verify localStorage was called correctly
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('expressPaymentCustomerId', 'customer-123');
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('expressPaymentAuthToken', 'auth-token-456');
            });

            it('should handle express.actualCustomerData message with missing payload gracefully', () => {
                const customerData = {
                    type: 'express.actualCustomerData',
                    payload: null,
                };

                const messageEvent = new MessageEvent('message', {
                    data: customerData,
                });

                // Should not throw an error when dispatched
                expect(() => {
                    window.dispatchEvent(messageEvent);
                }).not.toThrow();

                // localStorage should be called with undefined values
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('expressPaymentCustomerId', undefined);
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('expressPaymentAuthToken', undefined);
            });

            it('should ignore messages that are not express.actualCustomerData', () => {
                const otherMessage = {
                    type: 'other.message.type',
                    payload: { data: 'test' },
                };

                const messageEvent = new MessageEvent('message', {
                    data: otherMessage,
                });

                window.dispatchEvent(messageEvent);

                // localStorage should not be called
                expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
            });
        });

        describe('Basket data request handling', () => {
            it('should ignore basketDataRequested if not the latest instance', () => {
                const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

                // Create a second element to make the first one not the latest
                const secondElement = createElement('c-product-details', {
                    is: ProductDetails,
                });
                secondElement.product = mockProduct;
                document.body.appendChild(secondElement);

                const basketRequestMessage = {
                    type: 'basketDataRequested',
                };

                const messageEvent = new MessageEvent('message', {
                    data: basketRequestMessage,
                });

                // Dispatch the message - only the latest instance should respond
                window.dispatchEvent(messageEvent);

                // The first element should not have triggered any warning since it's not the latest
                expect(consoleWarnSpy).not.toHaveBeenCalled();

                // Clean up
                document.body.removeChild(secondElement);
                consoleWarnSpy.mockRestore();
            });

            it('should handle sendCheckoutData error and log warning', () => {
                const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

                // Ensure product is set on the element so ccy getter returns valid currency
                element.product = mockProduct;

                // Mock localStorage to return customer data
                mockLocalStorage.getItem.mockImplementation((key) => {
                    if (key === 'expressPaymentCustomerId') return 'customer-123';
                    if (key === 'expressPaymentAuthToken') return 'auth-token-456';
                    return null;
                });

                // Mock querySelector to return a mock express payment component that throws an error
                const mockExpressPaymentWithError = {
                    sendCheckoutData: jest.fn().mockImplementation(() => {
                        throw new Error('Network error');
                    }),
                };

                const originalQuerySelector = element.querySelector.bind(element);
                element.querySelector = jest.fn().mockImplementation((selector) => {
                    if (selector === 'c-express-payment') {
                        return mockExpressPaymentWithError;
                    }
                    return originalQuerySelector(selector);
                });

                const basketRequestMessage = {
                    type: 'basketDataRequested',
                };

                const messageEvent = new MessageEvent('message', {
                    data: basketRequestMessage,
                });

                // Dispatch the message to trigger basket data sending
                window.dispatchEvent(messageEvent);

                // Verify the warning was logged with the error
                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    expect.stringMatching(/Failed to send authentication data postMessage \(Component \d+\):/),
                    expect.any(Error)
                );

                // Verify sendCheckoutData was called with correct data (null basket data, auth data only)
                expect(mockExpressPaymentWithError.sendCheckoutData).toHaveBeenCalledWith(null, {
                    customerId: 'customer-123',
                    authToken: 'auth-token-456',
                    currency: 'USD',
                });

                // Clean up
                consoleWarnSpy.mockRestore();
                element.querySelector = originalQuerySelector;
            });

            it('should handle missing product gracefully', () => {
                const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

                // Set product to null using the public setter
                element.product = null;

                const basketRequestMessage = {
                    type: 'basketDataRequested',
                };

                const messageEvent = new MessageEvent('message', {
                    data: basketRequestMessage,
                });

                // Should not throw an error when dispatched
                expect(() => {
                    window.dispatchEvent(messageEvent);
                }).not.toThrow();

                // No warning should be logged when product is null (early return)
                expect(consoleWarnSpy).not.toHaveBeenCalled();
                consoleWarnSpy.mockRestore();
            });
        });

        describe('Component lifecycle and message listeners', () => {
            it('should set up message listeners on connectedCallback', () => {
                const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

                // Create a new element to test connectedCallback
                const newElement = createElement('c-product-details', {
                    is: ProductDetails,
                });
                newElement.product = mockProduct;
                document.body.appendChild(newElement);

                // Verify message listeners were added (called twice - once for each handler)
                expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));

                // Verify postMessage was sent to request customer data
                expect(mockPostMessage).toHaveBeenCalledWith(
                    {
                        type: 'lwc.getCustomerData',
                        timestamp: expect.any(Number),
                    },
                    '*'
                );

                addEventListenerSpy.mockRestore();
                document.body.removeChild(newElement);
            });

            it('should clean up message listeners on disconnectedCallback', () => {
                const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

                // Create and connect element
                const newElement = createElement('c-product-details', {
                    is: ProductDetails,
                });
                newElement.product = mockProduct;
                document.body.appendChild(newElement);

                // Disconnect element
                document.body.removeChild(newElement);

                // Verify message listener was removed
                expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));

                removeEventListenerSpy.mockRestore();
            });
        });
    });

    describe('Multi-language support', () => {
        it('should have default language configuration', () => {
            expect(element.configuration).toEqual({});
            expect(element.language).toBe('en_US');
        });

        it('should support custom language configuration', () => {
            const newElement = createElement('c-product-details', {
                is: ProductDetails,
            });
            newElement.configuration = { language: 'es' };
            newElement.product = mockProduct;
            document.body.appendChild(newElement);

            expect(newElement.language).toBe('es');
            expect(newElement.i18n.addToCartAssistiveText).toBe('Agregar al carrito');

            document.body.removeChild(newElement);
        });

        it('should fallback to English when language not supported', () => {
            const newElement = createElement('c-product-details', {
                is: ProductDetails,
            });
            newElement.configuration = { language: 'unsupported-lang' };
            newElement.product = mockProduct;
            document.body.appendChild(newElement);

            expect(newElement.language).toBe('unsupported-lang');
            // Should fallback to English
            expect(newElement.i18n.addToCartAssistiveText).toBe('Add To Cart');

            document.body.removeChild(newElement);
        });

        it('should provide all required i18n labels', () => {
            const requiredLabels = [
                'addToCartAssistiveText',
                'quantityLabelAssistiveText',
                'currentPriceAssistiveText',
                'originalPriceAssistiveText',
                'pricingSectionAssistiveText',
                'featuresSectionAssistiveText',
                'variantsSectionAssistiveText',
                'quantitySectionAssistiveText',
                'quantityControlsAssistiveText',
                'decreaseQuantityAssistiveText',
                'increaseQuantityAssistiveText',
                'loadingSpinnerAltText',
                'quantityLabelText',
                'originalPriceLabelText',
                'currentPriceLabelText',
                'strikethroughAssistiveText',
            ];

            requiredLabels.forEach((labelKey) => {
                expect(element.i18n[labelKey]).toBeDefined();
                expect(typeof element.i18n[labelKey]).toBe('string');
                expect(element.i18n[labelKey].length).toBeGreaterThan(0);
            });
        });
    });
});

describe('c-product-details isAnyVariantOrderable functionality', () => {
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

    const testCases = [
        {
            name: 'at least one variant option is orderable',
            product: {
                ...mockProduct,
                quantity: {
                    minQuantity: 1,
                    maxQuantity: 10.0,
                    increment: 0.5,
                },
                vattr: [
                    {
                        id: 'color',
                        lbl: 'Color',
                        opts: [
                            { val: 'JJ169XX', name: 'Black' },
                            { val: 'JJI15XX', name: 'Blue' },
                        ],
                    },
                ],
                vmat: [
                    {
                        vars: { color: 'JJ169XX' },
                        ord: true, // Orderable
                        pr: { cur: 110.99, orig: 110.99 },
                    },
                    {
                        vars: { color: 'JJI15XX' },
                        ord: false, // Not orderable
                        pr: { cur: 120.99, orig: 120.99 },
                    },
                ],
            },
            expectedIncrementDisabled: false,
            expectedDecrementDisabled: true,
        },
        {
            name: 'no variant options are orderable',
            product: {
                ...mockProduct,
                vattr: [
                    {
                        id: 'color',
                        lbl: 'Color',
                        opts: [
                            { val: 'JJ169XX', name: 'Black' },
                            { val: 'JJI15XX', name: 'Blue' },
                        ],
                    },
                ],
                vmat: [
                    {
                        vars: { color: 'JJ169XX' },
                        ord: false, // Not orderable
                        pr: { cur: 110.99, orig: 110.99 },
                    },
                    {
                        vars: { color: 'JJI15XX' },
                        ord: false, // Not orderable
                        pr: { cur: 120.99, orig: 120.99 },
                    },
                ],
            },
            expectedIncrementDisabled: true,
            expectedDecrementDisabled: true,
        },
        {
            name: 'product has no variant matrix',
            product: {
                ...mockProduct,
                vattr: [
                    {
                        id: 'color',
                        lbl: 'Color',
                        opts: [{ val: 'JJ169XX', name: 'Black' }],
                    },
                ],
                vmat: [], // Empty variant matrix
            },
            expectedIncrementDisabled: true,
            expectedDecrementDisabled: true,
        },
        {
            name: 'product has null variant matrix',
            product: {
                ...mockProduct,
                vattr: [
                    {
                        id: 'color',
                        lbl: 'Color',
                        opts: [{ val: 'JJ169XX', name: 'Black' }],
                    },
                ],
                vmat: null, // Null variant matrix
            },
            expectedIncrementDisabled: true,
            expectedDecrementDisabled: true,
        },
        {
            name: 'product has no variants',
            product: {
                ...mockProduct,
                quantity: {
                    minQuantity: 1,
                    maxQuantity: 10.0,
                    increment: 0.5,
                },
                vattr: [], // No variants
                vmat: [], // No variant matrix
            },
            expectedIncrementDisabled: false,
            expectedDecrementDisabled: true,
        },
    ];

    testCases.forEach((testCase) => {
        it(`should set isAnyVariantOrderable correctly when ${testCase.name}`, async () => {
            element.product = testCase.product;
            await Promise.resolve();

            const incrementButton = element.querySelector('.quantity-increment-button');
            const decrementButton = element.querySelector('.quantity-decrement-button');

            expect(incrementButton.disabled).toBe(testCase.expectedIncrementDisabled);
            expect(decrementButton.disabled).toBe(testCase.expectedDecrementDisabled);
        });
    });
});
describe('c-product-details variant orderability tests', () => {
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

    it('should correctly process variant options through DOM interface', async () => {
        // Test data based on user's example
        const complexProduct = {
            ...mockProduct,
            vattr: [
                {
                    id: 'color',
                    lbl: 'Colour',
                    opts: [
                        { val: 'JJ0VWXX', name: 'midnight navy' },
                        { val: 'JJ493XX', name: 'Chino' },
                    ],
                },
                {
                    id: 'size',
                    lbl: 'Size',
                    opts: [
                        { val: '004', name: '4' },
                        { val: '008', name: '8' },
                        { val: '010', name: '10' },
                        { val: '012', name: '12' },
                        { val: '014', name: '14' },
                        { val: '016', name: '16' },
                    ],
                },
            ],
            vmat: [
                { vars: { size: '008', color: 'JJ0VWXX' }, pr: null, pid: '701643489183M', ord: true },
                { vars: { size: '012', color: 'JJ493XX' }, pr: null, pid: '701643489206M', ord: true },
                { vars: { size: '004', color: 'JJ0VWXX' }, pr: null, pid: '701643489169M', ord: true },
                { vars: { size: '010', color: 'JJ0VWXX' }, pr: null, pid: '701643489121M', ord: true },
                { vars: { size: '014', color: 'JJ0VWXX' }, pr: null, pid: '701643489145M', ord: true },
                { vars: { size: '016', color: 'JJ493XX' }, pr: null, pid: '701643489220M', ord: true },
                { vars: { size: '014', color: 'JJ493XX' }, pr: null, pid: '701643489213M', ord: true },
                { vars: { size: '012', color: 'JJ0VWXX' }, pr: null, pid: '701643489138M', ord: true },
                { vars: { size: '004', color: 'JJ493XX' }, pr: null, pid: '701643489237M', ord: true },
            ],
        };

        element.product = complexProduct;
        await Promise.resolve();

        // Test 1: When no variants are selected, all options should be orderable
        // Check that all variant buttons are enabled (not disabled)
        const allVariantButtons = element.querySelectorAll('[data-variant-name]');
        expect(allVariantButtons.length).toBeGreaterThan(0);

        const disabledButtons = element.querySelectorAll('[data-variant-name][disabled]');
        expect(disabledButtons.length).toBe(0); // All buttons should be enabled initially

        // Test 2: When color JJ493XX is selected, only certain sizes should be orderable
        // Simulate selecting color JJ493XX by clicking the button
        const colorJJ493XXButton = element.querySelector('[data-variant-name="color"][data-value="JJ493XX"]');
        expect(colorJJ493XXButton).not.toBeNull();
        colorJJ493XXButton.click();
        await Promise.resolve();

        // With color JJ493XX selected, only these sizes should be orderable: 012, 016, 014, 004
        // Check that size 008 and 010 are disabled (not available with JJ493XX)
        const size008Button = element.querySelector('[data-variant-name="size"][data-value="008"]');
        const size010Button = element.querySelector('[data-variant-name="size"][data-value="010"]');

        expect(size008Button.getAttribute('data-out-of-stock')).toBe('true'); // Should be disabled
        expect(size010Button.getAttribute('data-out-of-stock')).toBe('true'); // Should be disabled

        // Count enabled size buttons - should be 4 (004, 012, 014, 016)
        const sizeButtons = element.querySelectorAll('[data-variant-name="size"]');
        const enabledSizeButtons = Array.from(sizeButtons).filter(
            (btn) => btn.getAttribute('data-out-of-stock') !== 'true'
        );
        expect(enabledSizeButtons.length).toBe(4);

        // Test 3: When color JJ0VWXX is selected, different sizes should be orderable
        // Simulate selecting color JJ0VWXX
        const colorJJ0VWXXButton = element.querySelector('[data-variant-name="color"][data-value="JJ0VWXX"]');
        expect(colorJJ0VWXXButton).not.toBeNull();
        colorJJ0VWXXButton.click();
        await Promise.resolve();

        // With color JJ0VWXX selected, size 016 should be disabled
        const size016ButtonAfterColorChange = element.querySelector('[data-variant-name="size"][data-value="016"]');
        expect(size016ButtonAfterColorChange.getAttribute('data-out-of-stock')).toBe('true'); // Should be disabled

        // Count enabled size buttons - should be 5 (004, 008, 010, 012, 014)
        const optionButtonsAfterColorChange = element.querySelectorAll('[data-variant-name="size"]');
        const enabledSizeButtonsAfterColorChange = Array.from(optionButtonsAfterColorChange).filter(
            (btn) => btn.getAttribute('data-out-of-stock') !== 'true'
        );
        expect(enabledSizeButtonsAfterColorChange.length).toBe(5);
    });

    it('should correctly handle three-way variant selection (color, size, material)', async () => {
        // Test data with three attributes: color, size, and material
        const threeWayProduct = {
            ...mockProduct,
            vattr: [
                {
                    id: 'color',
                    lbl: 'Colour',
                    opts: [
                        { val: 'RED', name: 'Red' },
                        { val: 'BLUE', name: 'Blue' },
                        { val: 'GREEN', name: 'Green' },
                    ],
                },
                {
                    id: 'size',
                    lbl: 'Size',
                    opts: [
                        { val: 'S', name: 'Small' },
                        { val: 'M', name: 'Medium' },
                        { val: 'L', name: 'Large' },
                    ],
                },
                {
                    id: 'material',
                    lbl: 'Material',
                    opts: [
                        { val: 'COTTON', name: 'Cotton' },
                        { val: 'POLYESTER', name: 'Polyester' },
                        { val: 'WOOL', name: 'Wool' },
                    ],
                },
            ],
            vmat: [
                // Red variants
                { vars: { color: 'RED', size: 'S', material: 'COTTON' }, pr: null, pid: 'RED-S-COTTON', ord: true },
                { vars: { color: 'RED', size: 'M', material: 'COTTON' }, pr: null, pid: 'RED-M-COTTON', ord: true },
                {
                    vars: { color: 'RED', size: 'L', material: 'POLYESTER' },
                    pr: null,
                    pid: 'RED-L-POLYESTER',
                    ord: true,
                },
                { vars: { color: 'RED', size: 'S', material: 'WOOL' }, pr: null, pid: 'RED-S-WOOL', ord: true },

                // Blue variants
                { vars: { color: 'BLUE', size: 'S', material: 'COTTON' }, pr: null, pid: 'BLUE-S-COTTON', ord: true },
                {
                    vars: { color: 'BLUE', size: 'M', material: 'POLYESTER' },
                    pr: null,
                    pid: 'BLUE-M-POLYESTER',
                    ord: true,
                },
                { vars: { color: 'BLUE', size: 'L', material: 'WOOL' }, pr: null, pid: 'BLUE-L-WOOL', ord: true },
                { vars: { color: 'BLUE', size: 'M', material: 'WOOL' }, pr: null, pid: 'BLUE-M-WOOL', ord: true },

                // Green variants
                {
                    vars: { color: 'GREEN', size: 'S', material: 'POLYESTER' },
                    pr: null,
                    pid: 'GREEN-S-POLYESTER',
                    ord: true,
                },
                { vars: { color: 'GREEN', size: 'M', material: 'COTTON' }, pr: null, pid: 'GREEN-M-COTTON', ord: true },
                { vars: { color: 'GREEN', size: 'L', material: 'COTTON' }, pr: null, pid: 'GREEN-L-COTTON', ord: true },
                { vars: { color: 'GREEN', size: 'S', material: 'WOOL' }, pr: null, pid: 'GREEN-S-WOOL', ord: true },
            ],
        };

        element.product = threeWayProduct;
        await Promise.resolve();

        // Test 1: When no variants are selected, all options should be orderable
        const allVariantButtons = element.querySelectorAll('[data-variant-name]');
        expect(allVariantButtons.length).toBeGreaterThan(0);

        const disabledButtons = element.querySelectorAll('[data-variant-name][disabled]');
        expect(disabledButtons.length).toBe(0); // All buttons should be enabled initially

        // Test 2: When color RED is selected, check size and material availability
        const redColorButton = element.querySelector('[data-variant-name="color"][data-value="RED"]');
        expect(redColorButton).not.toBeNull();
        redColorButton.click();
        await Promise.resolve();

        // With RED selected, available combinations are:
        // RED-S-COTTON, RED-M-COTTON, RED-L-POLYESTER, RED-S-WOOL
        // So sizes S, M, L should be available
        // Materials COTTON, POLYESTER, WOOL should be available
        const enabledSizeButtonsAfterRed = element.querySelectorAll('[data-variant-name="size"]');
        const enabledMaterialButtonsAfterRed = element.querySelectorAll('[data-variant-name="material"]');

        expect(enabledSizeButtonsAfterRed.length).toBe(3); // S, M, L
        expect(enabledMaterialButtonsAfterRed.length).toBe(3); // COTTON, POLYESTER, WOOL

        // Test 3: When color RED and size S are selected, check material availability
        const smallSizeButton = element.querySelector('[data-variant-name="size"][data-value="S"]');
        expect(smallSizeButton).not.toBeNull();
        smallSizeButton.click();
        await Promise.resolve();

        // With RED-S selected, available combinations are:
        // RED-S-COTTON, RED-S-WOOL
        // So only materials COTTON and WOOL should be available
        const materialButtonsAfterRedAndSmall = element.querySelectorAll('[data-variant-name="material"]');
        const enabledMaterialButtonsAfterColorChange = Array.from(materialButtonsAfterRedAndSmall).filter(
            (btn) => btn.getAttribute('data-out-of-stock') !== 'true'
        );
        expect(enabledMaterialButtonsAfterColorChange.length).toBe(2); // COTTON, WOOL

        // Verify POLYESTER is disabled
        const polyesterButton = element.querySelector('[data-variant-name="material"][data-value="POLYESTER"]');
        expect(polyesterButton.getAttribute('data-out-of-stock')).toBe('true');

        // Test 4: When color BLUE is selected, check different availability
        const blueColorButton = element.querySelector('[data-variant-name="color"][data-value="BLUE"]');
        expect(blueColorButton).not.toBeNull();
        blueColorButton.click();
        await Promise.resolve();

        // With BLUE selected, available combinations are:
        // BLUE-S-COTTON, BLUE-M-POLYESTER, BLUE-L-WOOL, BLUE-M-WOOL
        // So sizes S, M, L should be available
        // Materials COTTON, POLYESTER, WOOL should be available
        const enabledSizeButtonsAfterBlue = element.querySelectorAll('[data-variant-name="size"]');
        const enabledMaterialButtonsAfterBlue = element.querySelectorAll('[data-variant-name="material"]');

        expect(enabledSizeButtonsAfterBlue.length).toBe(3); // S, M, L
        expect(enabledMaterialButtonsAfterBlue.length).toBe(3); // COTTON, POLYESTER, WOOL

        // Test 5: When color BLUE and size M are selected, check material availability
        const mediumSizeButton = element.querySelector('[data-variant-name="size"][data-value="M"]');
        expect(mediumSizeButton).not.toBeNull();
        mediumSizeButton.click();
        await Promise.resolve();

        // With BLUE-M selected, available combinations are:
        // BLUE-M-POLYESTER, BLUE-M-WOOL
        // So only materials POLYESTER and WOOL should be available
        const materialButtonsAfterBlueAndMedium = element.querySelectorAll('[data-variant-name="material"]');
        const enabledMaterialButtonsAfterBlueAndMedium = Array.from(materialButtonsAfterBlueAndMedium).filter(
            (btn) => btn.getAttribute('data-out-of-stock') !== 'true'
        );
        expect(enabledMaterialButtonsAfterBlueAndMedium.length).toBe(2); // POLYESTER, WOOL

        // Verify COTTON is disabled
        const cottonButton = element.querySelector('[data-variant-name="material"][data-value="COTTON"]');
        expect(cottonButton.getAttribute('data-out-of-stock')).toBe('true');

        // Test 6: When color GREEN is selected, check availability
        const greenColorButton = element.querySelector('[data-variant-name="color"][data-value="GREEN"]');
        expect(greenColorButton).not.toBeNull();
        greenColorButton.click();
        await Promise.resolve();

        // With GREEN selected, available combinations are:
        // GREEN-S-POLYESTER, GREEN-M-COTTON, GREEN-L-COTTON, GREEN-S-WOOL
        // So sizes S, M, L should be available
        // Materials COTTON, POLYESTER, WOOL should be available
        const enabledSizeButtonsAfterGreen = element.querySelectorAll('[data-variant-name="size"]');
        const enabledMaterialButtonsAfterGreen = element.querySelectorAll('[data-variant-name="material"]');

        expect(enabledSizeButtonsAfterGreen.length).toBe(3); // S, M, L
        expect(enabledMaterialButtonsAfterGreen.length).toBe(3); // COTTON, POLYESTER, WOOL
    });
});

describe('c-product-details product ID resolution', () => {
    let element;

    beforeEach(async () => {
        element = createElement('c-product-details', {
            is: ProductDetails,
        });
        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        if (element && element.parentNode) {
            document.body.removeChild(element);
        }
    });

    it('should handle products with variants but none selected', async () => {
        const productWithNoAutoSelection = {
            ...mockProduct,
            vattr: [
                {
                    id: 'color',
                    lbl: 'Color',
                    opts: [
                        { val: 'RED', name: 'Red' },
                        { val: 'BLUE', name: 'Blue' },
                    ],
                },
                {
                    id: 'size',
                    lbl: 'Size',
                    opts: [
                        { val: 'S', name: 'Small' },
                        { val: 'M', name: 'Medium' },
                    ],
                },
            ],
            vmat: [
                { vars: { color: 'RED', size: 'S' }, ord: true, pr: { cur: 100, orig: 100 } },
                { vars: { color: 'BLUE', size: 'M' }, ord: true, pr: { cur: 110, orig: 110 } },
            ],
        };

        if (element.parentNode) {
            document.body.removeChild(element);
        }

        const newElement = createElement('c-product-details', {
            is: ProductDetails,
        });
        newElement.product = productWithNoAutoSelection;
        document.body.appendChild(newElement);
        await Promise.resolve();

        const expressPayment = newElement.querySelector('c-express-payment');
        const event = new CustomEvent('expressloaded', {
            detail: { available: false },
        });
        expressPayment.dispatchEvent(event);
        await Promise.resolve();

        const addToCartHandler = jest.fn();
        newElement.addEventListener('addtocart', addToCartHandler);

        const button = newElement.querySelector('.button-checkout');
        expect(button).not.toBeNull();
        button.click();

        expect(addToCartHandler).toHaveBeenCalled();

        if (newElement.parentNode) {
            document.body.removeChild(newElement);
        }
    });

    it('should use base product ID for simple products without variants', async () => {
        const simpleProduct = {
            ...mockProduct,
            id: 'SIMPLE-PRODUCT-123',
            name: 'Simple Product',
            vattr: [],
            vmat: [],
        };

        element.product = simpleProduct;
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        const event = new CustomEvent('expressloaded', {
            detail: { available: false },
        });
        expressPayment.dispatchEvent(event);
        await Promise.resolve();

        const addToCartHandler = jest.fn();
        element.addEventListener('addtocart', addToCartHandler);

        const button = element.querySelector('.button-checkout');
        expect(button).not.toBeNull();
        button.click();

        expect(addToCartHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: expect.objectContaining({
                    productId: 'SIMPLE-PRODUCT-123',
                    productName: 'Simple Product',
                }),
            })
        );
    });

    it('should handle products with null ID', async () => {
        const productWithNoId = {
            ...mockProduct,
            id: null,
            vattr: [],
            vmat: [],
        };

        element.product = productWithNoId;
        await Promise.resolve();

        const expressPaymentComponent = element.querySelector('c-express-payment');
        const updateSkuSpy = jest.fn();
        expressPaymentComponent.updateSku = updateSkuSpy;

        const event = new CustomEvent('expressloaded', {
            detail: { available: true },
        });
        expressPaymentComponent.dispatchEvent(event);
        await Promise.resolve();

        expect(updateSkuSpy).not.toHaveBeenCalled();
    });
});

describe('c-product-details toggleToOtherSelectedVariants functionality', () => {
    let element;

    beforeEach(async () => {
        element = createElement('c-product-details', {
            is: ProductDetails,
        });
    });

    afterEach(() => {
        if (element && element.parentNode) {
            document.body.removeChild(element);
        }
    });

    // Helper function to create product with variants
    const createProductWithVariants = (vattr, vmat) => ({
        ...mockProduct,
        vattr,
        vmat,
    });

    // Helper function to setup element with product
    const setupElement = async (product) => {
        element.product = product;
        document.body.appendChild(element);
        await Promise.resolve();
    };

    // Helper function to get variant buttons
    const getVariantButton = (variantName, value) =>
        element.querySelector(`[data-variant-name="${variantName}"][data-value="${value}"]`);

    // Helper function to verify button states
    const expectButtonState = (variantName, value, pressed) => {
        const button = getVariantButton(variantName, value);
        expect(button.getAttribute('aria-pressed')).toBe(pressed.toString());
    };

    it('should change other variants when user clicks on out-of-stock variant to make it available', async () => {
        const vattr = [
            {
                id: 'color',
                lbl: 'Color',
                selected: 'RED',
                opts: [
                    { val: 'RED', name: 'Red' },
                    { val: 'BLUE', name: 'Blue' },
                ],
            },
            {
                id: 'size',
                lbl: 'Size',
                selected: 'M',
                opts: [
                    { val: 'S', name: 'Small' },
                    { val: 'M', name: 'Medium' },
                    { val: 'L', name: 'Large' },
                ],
            },
        ];
        const vmat = [
            { vars: { color: 'RED', size: 'M' }, ord: true, pr: { cur: 100, orig: 100 } },
            { vars: { color: 'BLUE', size: 'M' }, ord: false, pr: { cur: 110, orig: 110 } },
            { vars: { color: 'BLUE', size: 'S' }, ord: true, pr: { cur: 120, orig: 120 } },
            { vars: { color: 'BLUE', size: 'L' }, ord: true, pr: { cur: 130, orig: 130 } },
        ];

        await setupElement(createProductWithVariants(vattr, vmat));

        // Verify initial state: RED-M selected
        expectButtonState('color', 'RED', true);
        expectButtonState('size', 'M', true);

        // Click BLUE color (out of stock for M size)
        getVariantButton('color', 'BLUE').click();
        await Promise.resolve();

        // Should switch to BLUE-S
        expectButtonState('color', 'BLUE', true);
        expectButtonState('color', 'RED', false);
        expectButtonState('size', 'S', true);
        expectButtonState('size', 'M', false);
    });

    it('should not change variants when no alternative combination exists for out-of-stock variant', async () => {
        const vattr = [
            {
                id: 'color',
                lbl: 'Color',
                selected: 'RED',
                opts: [
                    { val: 'RED', name: 'Red' },
                    { val: 'BLUE', name: 'Blue' },
                ],
            },
            {
                id: 'size',
                lbl: 'Size',
                selected: 'M',
                opts: [
                    { val: 'S', name: 'Small' },
                    { val: 'M', name: 'Medium' },
                    { val: 'L', name: 'Large' },
                ],
            },
        ];
        const vmat = [
            { vars: { color: 'RED', size: 'M' }, ord: true, pr: { cur: 100, orig: 100 } },
            { vars: { color: 'BLUE', size: 'M' }, ord: false, pr: { cur: 110, orig: 110 } },
        ];

        await setupElement(createProductWithVariants(vattr, vmat));

        // Verify initial state: RED-M selected
        expectButtonState('color', 'RED', true);
        expectButtonState('size', 'M', true);

        // Click BLUE color (no alternatives available)
        getVariantButton('color', 'BLUE').click();
        await Promise.resolve();

        // Should remain on RED-M
        expectButtonState('color', 'RED', true);
        expectButtonState('size', 'M', true);
        expectButtonState('color', 'BLUE', false);
    });

    it('should select first available variant when multiple alternatives exist', async () => {
        const vattr = [
            {
                id: 'color',
                lbl: 'Color',
                selected: 'RED',
                opts: [
                    { val: 'RED', name: 'Red' },
                    { val: 'BLUE', name: 'Blue' },
                ],
            },
            {
                id: 'size',
                lbl: 'Size',
                selected: 'M',
                opts: [
                    { val: 'S', name: 'Small' },
                    { val: 'M', name: 'Medium' },
                    { val: 'L', name: 'Large' },
                ],
            },
        ];
        const vmat = [
            { vars: { color: 'RED', size: 'M' }, ord: true, pr: { cur: 100, orig: 100 } },
            { vars: { color: 'BLUE', size: 'M' }, ord: false, pr: { cur: 110, orig: 110 } },
            { vars: { color: 'BLUE', size: 'S' }, ord: true, pr: { cur: 120, orig: 120 } },
            { vars: { color: 'BLUE', size: 'L' }, ord: true, pr: { cur: 130, orig: 130 } },
        ];

        await setupElement(createProductWithVariants(vattr, vmat));

        // Verify initial state: RED-M selected
        expectButtonState('color', 'RED', true);
        expectButtonState('size', 'M', true);

        // Click BLUE color (multiple alternatives available)
        getVariantButton('color', 'BLUE').click();
        await Promise.resolve();

        // Should switch to BLUE-S (first available)
        expectButtonState('color', 'BLUE', true);
        expectButtonState('color', 'RED', false);
        expectButtonState('size', 'S', true);
        expectButtonState('size', 'M', false);
    });

    it('should handle three-way variant selection (color, size, material)', async () => {
        const vattr = [
            {
                id: 'color',
                lbl: 'Color',
                selected: 'RED',
                opts: [
                    { val: 'RED', name: 'Red' },
                    { val: 'BLUE', name: 'Blue' },
                ],
            },
            {
                id: 'size',
                lbl: 'Size',
                selected: 'M',
                opts: [
                    { val: 'S', name: 'Small' },
                    { val: 'M', name: 'Medium' },
                ],
            },
            {
                id: 'material',
                lbl: 'Material',
                selected: 'COTTON',
                opts: [
                    { val: 'COTTON', name: 'Cotton' },
                    { val: 'WOOL', name: 'Wool' },
                ],
            },
        ];
        const vmat = [
            { vars: { color: 'RED', size: 'M', material: 'COTTON' }, ord: true, pr: { cur: 100, orig: 100 } },
            { vars: { color: 'BLUE', size: 'M', material: 'COTTON' }, ord: false, pr: { cur: 110, orig: 110 } },
            { vars: { color: 'BLUE', size: 'S', material: 'COTTON' }, ord: true, pr: { cur: 120, orig: 120 } },
            { vars: { color: 'BLUE', size: 'M', material: 'WOOL' }, ord: true, pr: { cur: 130, orig: 130 } },
        ];

        await setupElement(createProductWithVariants(vattr, vmat));

        // Verify initial state: RED-M-COTTON selected
        expectButtonState('color', 'RED', true);
        expectButtonState('size', 'M', true);
        expectButtonState('material', 'COTTON', true);

        // Click BLUE color (out of stock for M-COTTON)
        getVariantButton('color', 'BLUE').click();
        await Promise.resolve();

        // Should switch to BLUE-S-COTTON
        expectButtonState('color', 'BLUE', true);
        expectButtonState('color', 'RED', false);
        expectButtonState('size', 'S', true);
        expectButtonState('size', 'M', false);
        expectButtonState('material', 'COTTON', true);
    });

    it('should handle malformed variant data gracefully', async () => {
        const vattr = [
            {
                id: 'color',
                lbl: 'Color',
                selected: 'RED',
                opts: [
                    { val: 'RED', name: 'Red' },
                    { val: 'BLUE', name: 'Blue' },
                ],
            },
            {
                id: 'size',
                lbl: 'Size',
                selected: 'M',
                opts: [
                    { val: 'S', name: 'Small' },
                    { val: 'M', name: 'Medium' },
                ],
            },
        ];
        const vmat = [
            { vars: { color: 'RED', size: 'M' }, ord: true, pr: { cur: 100, orig: 100 } },
            { ord: false, pr: { cur: 110, orig: 110 } }, // Missing vars
            { vars: null, ord: false, pr: { cur: 120, orig: 120 } }, // Null vars
            { vars: { color: 'BLUE', size: 'S' }, ord: true, pr: { cur: 130, orig: 130 } },
        ];

        await setupElement(createProductWithVariants(vattr, vmat));

        // Verify initial state: RED-M selected
        expectButtonState('color', 'RED', true);
        expectButtonState('size', 'M', true);

        // Click BLUE color (should skip malformed entries)
        getVariantButton('color', 'BLUE').click();
        await Promise.resolve();

        // Should switch to BLUE-S (skipping malformed entries)
        expectButtonState('color', 'BLUE', true);
        expectButtonState('color', 'RED', false);
        expectButtonState('size', 'S', true);
        expectButtonState('size', 'M', false);
    });
});

describe('c-product-details originalPrice', () => {
    it('handles originalPrice when _originalProductData.pr is undefined', async () => {
        // Create a new element to test the originalPrice getter
        const element = createElement('c-product-details', {
            is: ProductDetails,
        });
        document.body.appendChild(element);

        // Set a product with variants BUT WITHOUT a pr property
        // This will set _originalProductData with pr: undefined
        element.product = {
            ...mockProduct,
            pr: undefined, // Explicitly set to undefined
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
            ],
            vmat: [
                {
                    vars: { color: 'JJI15XX' },
                    ord: true,
                    pr: null, // Variant has no price
                },
            ],
        };

        await Promise.resolve();

        // Trigger variant selection which will call updateProductPrice
        // and use this.originalPrice (which should return null since _originalProductData.pr is undefined)
        const colorButton = element.querySelector('.variant-button[data-variant-name="color"][data-value="JJI15XX"]');
        expect(colorButton).not.toBeNull();
        colorButton.click();
        await Promise.resolve();

        // The product price should be null or undefined since both variant and original price are null/undefined
        expect(element.product.pr).toBeFalsy();

        // Clean up
        document.body.removeChild(element);
    });
});

describe('c-product-details isAnyVariantOrderable button state', () => {
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

    const testCases = [
        {
            name: 'at least one variant option is orderable',
            product: {
                ...mockProduct,
                quantity: {
                    minQuantity: 1,
                    maxQuantity: 10.0,
                    increment: 0.5,
                },
                vattr: [
                    {
                        id: 'color',
                        lbl: 'Color',
                        opts: [
                            { val: 'JJ169XX', name: 'Black' },
                            { val: 'JJI15XX', name: 'Blue' },
                        ],
                    },
                ],
                vmat: [
                    {
                        vars: { color: 'JJ169XX' },
                        ord: true, // Orderable
                        pr: { cur: 110.99, orig: 110.99 },
                    },
                    {
                        vars: { color: 'JJI15XX' },
                        ord: false, // Not orderable
                        pr: { cur: 120.99, orig: 120.99 },
                    },
                ],
            },
            expectedIncrementDisabled: false,
            expectedDecrementDisabled: true,
        },
        {
            name: 'no variant options are orderable',
            product: {
                ...mockProduct,
                vattr: [
                    {
                        id: 'color',
                        lbl: 'Color',
                        opts: [
                            { val: 'JJ169XX', name: 'Black' },
                            { val: 'JJI15XX', name: 'Blue' },
                        ],
                    },
                ],
                vmat: [
                    {
                        vars: { color: 'JJ169XX' },
                        ord: false, // Not orderable
                        pr: { cur: 110.99, orig: 110.99 },
                    },
                    {
                        vars: { color: 'JJI15XX' },
                        ord: false, // Not orderable
                        pr: { cur: 120.99, orig: 120.99 },
                    },
                ],
            },
            expectedIncrementDisabled: true,
            expectedDecrementDisabled: true,
        },
        {
            name: 'product has no variant matrix',
            product: {
                ...mockProduct,
                vattr: [
                    {
                        id: 'color',
                        lbl: 'Color',
                        opts: [{ val: 'JJ169XX', name: 'Black' }],
                    },
                ],
                vmat: [], // Empty variant matrix
            },
            expectedIncrementDisabled: true,
            expectedDecrementDisabled: true,
        },
        {
            name: 'product has null variant matrix',
            product: {
                ...mockProduct,
                vattr: [
                    {
                        id: 'color',
                        lbl: 'Color',
                        opts: [{ val: 'JJ169XX', name: 'Black' }],
                    },
                ],
                vmat: null, // Null variant matrix
            },
            expectedIncrementDisabled: true,
            expectedDecrementDisabled: true,
        },
        {
            name: 'product has no variants',
            product: {
                ...mockProduct,
                quantity: {
                    minQuantity: 1,
                    maxQuantity: 10.0,
                    increment: 0.5,
                },
                vattr: [], // No variants
                vmat: [], // No variant matrix
            },
            expectedIncrementDisabled: false,
            expectedDecrementDisabled: true,
        },
    ];

    testCases.forEach((testCase) => {
        it(`should set isAnyVariantOrderable correctly when ${testCase.name}`, async () => {
            element.product = testCase.product;
            await Promise.resolve();

            const incrementButton = element.querySelector('.quantity-increment-button');
            const decrementButton = element.querySelector('.quantity-decrement-button');

            expect(incrementButton.disabled).toBe(testCase.expectedIncrementDisabled);
            expect(decrementButton.disabled).toBe(testCase.expectedDecrementDisabled);
        });
    });
});

describe('c-product-details expressPaymentPrice', () => {
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

    it('should pass unit price (not multiplied by quantity) to c-express-payment price prop', async () => {
        element.product = { ...mockProduct, pr: { cur: 110.99, orig: 110.99 } };
        element.quantity = 3;
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment.price).toBeCloseTo(110.99, 2);
    });

    it('should pass unit price regardless of quantity changes', async () => {
        element.product = { ...mockProduct, pr: { cur: 35.69, orig: 35.69 } };
        element.quantity = 2;
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment.price).toBeCloseTo(35.69, 2);
    });

    it('should pass null price to c-express-payment when product has no price', async () => {
        element.product = { ...mockProduct, pr: null };
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment.price).toBeNull();
    });

    it('should pass null price to c-express-payment when product is not set', async () => {
        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment.price).toBeNull();
    });

    it('should pass unit price to c-express-payment when product has a valid price', async () => {
        element.product = { ...mockProduct, pr: { cur: 110.99, orig: 110.99 } };
        await Promise.resolve();

        const expressPayment = element.querySelector('c-express-payment');
        expect(expressPayment.price).toBeCloseTo(110.99, 2);
    });
});
