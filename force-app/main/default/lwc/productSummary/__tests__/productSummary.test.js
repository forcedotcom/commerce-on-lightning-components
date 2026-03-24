/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

import { createElement } from 'lwc';
import ProductSummary from 'c/productSummary';

const mockItemMinimal = {
    imageUrl: 'minimal.png',
    name: 'Minimal Product',
    quantity: 1,
    formattedPrice: '$5.00',
};

const mockItemWithDetails = {
    imageUrl: 'detailed.png',
    name: 'Detailed Product',
    variants: [
        { type: 'Color', value: 'Blue' },
        { type: 'Size', value: 'Large' },
        { type: 'Material', value: 'Cotton' },
        { type: 'Style', value: 'Casual' },
    ],
    quantity: 2,
    formattedPrice: '$25.00',
};

describe('c-product-summary', () => {
    let element;

    beforeEach(() => {
        element = createElement('c-product-summary', {
            is: ProductSummary,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('renders minimal item data correctly', async () => {
            element.item = mockItemMinimal;
            await Promise.resolve();

            // Image
            const img = element.querySelector('img');
            expect(img).not.toBeNull();
            expect(img.src).toContain(mockItemMinimal.imageUrl);
            expect(img.alt).toBe(mockItemMinimal.name);

            // Name
            const nameDiv = element.querySelector('.item-name');
            expect(nameDiv).not.toBeNull();
            expect(nameDiv.textContent).toBe(mockItemMinimal.name);

            // Variants (should not render)
            const variantsContainer = element.querySelector('.item-variants');
            expect(variantsContainer).toBeNull();

            // Quantity
            const quantityDiv = element.querySelector('.item-quantity');
            expect(quantityDiv).not.toBeNull();
            expect(quantityDiv.textContent).toBe(`Qty${mockItemMinimal.quantity}`);

            // Price
            const priceDiv = element.querySelector('.item-price');
            expect(priceDiv).not.toBeNull();
            expect(priceDiv.textContent).toBe(mockItemMinimal.formattedPrice);
        });

        it('renders full item data correctly', async () => {
            element.item = mockItemWithDetails;
            await Promise.resolve();

            // Image
            const img = element.querySelector('img');
            expect(img).not.toBeNull();
            expect(img.src).toContain(mockItemWithDetails.imageUrl);
            expect(img.alt).toBe(mockItemWithDetails.name);

            // Name
            const nameDiv = element.querySelector('.item-name');
            expect(nameDiv).not.toBeNull();
            expect(nameDiv.textContent).toBe(mockItemWithDetails.name);

            // Variants
            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(mockItemWithDetails.variants.length);

            // Test all variants
            mockItemWithDetails.variants.forEach((variant, index) => {
                expect(variantSpans[index].textContent).toBe(`${variant.type}${variant.value}`);
            });

            // Quantity
            const quantityDiv = element.querySelector('.item-quantity');
            expect(quantityDiv).not.toBeNull();
            expect(quantityDiv.textContent).toBe(`Qty${mockItemWithDetails.quantity}`);

            // Price
            const priceDiv = element.querySelector('.item-price');
            expect(priceDiv).not.toBeNull();
            expect(priceDiv.textContent).toBe(mockItemWithDetails.formattedPrice);
        });
    });

    describe('Error Handling', () => {
        it('handles null item gracefully', async () => {
            element.item = null;
            await Promise.resolve();

            // Image
            const img = element.querySelector('img');
            expect(img).not.toBeNull();
            expect(img.src).toBe('');
            expect(img.alt).toBe('');

            // Name
            const nameDiv = element.querySelector('.item-name');
            expect(nameDiv).not.toBeNull();
            expect(nameDiv.textContent).toBe('');

            // Variants
            const variantsContainer = element.querySelector('.item-variants');
            expect(variantsContainer).toBeNull();

            // Quantity
            const quantityDiv = element.querySelector('.item-quantity');
            expect(quantityDiv).not.toBeNull();
            expect(quantityDiv.textContent).toBe('Qty');

            // Price
            const priceDiv = element.querySelector('.item-price');
            expect(priceDiv).not.toBeNull();
            expect(priceDiv.textContent).toBe('');
        });

        it('handles empty variants array', async () => {
            element.item = { ...mockItemMinimal, variants: [] };
            await Promise.resolve();

            const variantsContainer = element.querySelector('.item-variants');
            expect(variantsContainer).toBeNull();
        });

        it('handles non-array variants', async () => {
            element.item = { ...mockItemMinimal, variants: 'not-an-array' };
            await Promise.resolve();

            const variantsContainer = element.querySelector('.item-variants');
            expect(variantsContainer).toBeNull();
        });

        it('handles null variants', async () => {
            element.item = { ...mockItemMinimal, variants: null };
            await Promise.resolve();
            const variantsContainer = element.querySelector('.item-variants');
            expect(variantsContainer).toBeNull();
        });
    });

    describe('Variant Handling', () => {
        it('uses variationAttributes labels when available', async () => {
            element.item = {
                ...mockItemWithDetails,
                variants: [
                    { type: 'color', value: 'Red' },
                    { type: 'size', value: 'Large' },
                ],
                variationAttributes: [
                    { id: 'color', label: 'Color Selection' },
                    { id: 'size', label: 'Size Selection' },
                ],
            };
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(2);
            expect(variantSpans[0].textContent).toBe('Color SelectionRed');
            expect(variantSpans[1].textContent).toBe('Size SelectionLarge');
        });

        it('falls back to variant type when label not found', async () => {
            element.item = {
                ...mockItemWithDetails,
                variants: [
                    { type: 'color', value: 'Red' },
                    { type: 'material', value: 'Cotton' },
                ],
                variationAttributes: [
                    { id: 'color', label: 'Color Selection' },
                    // material attribute missing
                ],
            };
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(2);
            expect(variantSpans[0].textContent).toBe('Color SelectionRed');
            expect(variantSpans[1].textContent).toBe('MaterialCotton');
        });

        it('handles missing variationAttributes', async () => {
            element.item = {
                ...mockItemWithDetails,
                variants: [
                    { type: 'color', value: 'Red' },
                    { type: 'size', value: 'Large' },
                ],
                // No variationAttributes
            };
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(2);
            expect(variantSpans[0].textContent).toBe('ColorRed');
            expect(variantSpans[1].textContent).toBe('SizeLarge');
        });

        it('prioritizes variant.lbl over variationAttributes labels', async () => {
            element.item = {
                ...mockItemWithDetails,
                variants: [
                    { type: 'color', value: 'Rouge', lbl: 'Coloris ' },
                    { type: 'size', value: '30', lbl: 'Taille' },
                ],
                variationAttributes: [
                    { id: 'color', label: 'Color Selection' },
                    { id: 'size', label: 'Size Selection' },
                ],
            };
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(2);
            expect(variantSpans[0].textContent).toBe('ColorisRouge');
            expect(variantSpans[1].textContent).toBe('Taille30');
        });

        it('handles variant.lbl with proper capitalization', async () => {
            element.item = {
                ...mockItemWithDetails,
                variants: [
                    { type: 'color', value: 'Marine', lbl: 'coloris ' },
                    { type: 'size', value: '30', lbl: 'taille' },
                ],
            };
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(2);
            expect(variantSpans[0].textContent).toBe('ColorisMarine');
            expect(variantSpans[1].textContent).toBe('Taille30');
        });
    });

    describe('Price Display', () => {
        it('displays strikethrough price when discounted', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Discounted Product',
                quantity: 1,
                formattedPrice: '$15.99',
                originalSubtotal: 19.99,
                itemSubtotal: 15.99,
                currencyCode: 'USD',
            };
            await Promise.resolve();

            // Price container exists
            const priceContainer = element.querySelector('.price-container');
            expect(priceContainer).not.toBeNull();

            // Original price (strikethrough)
            const originalPrice = element.querySelector('.original-price');
            expect(originalPrice).not.toBeNull();
            expect(originalPrice.textContent).toBe('$19.99');

            // Current price
            const currentPrice = element.querySelector('.current-price');
            expect(currentPrice).not.toBeNull();
            expect(currentPrice.textContent).toBe('$15.99');
        });

        it('displays only current price when no discount', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Regular Product',
                quantity: 1,
                formattedPrice: '$15.99',
                itemSubtotal: 15.99,
                currencyCode: 'USD',
            };
            await Promise.resolve();

            // Price container does not exist
            const priceContainer = element.querySelector('.price-container');
            expect(priceContainer).toBeNull();

            // Original price elements don't exist
            const originalPrice = element.querySelector('.original-price');
            expect(originalPrice).toBeNull();

            // Current price should exist and display the price
            const currentPrice = element.querySelector('.current-price');
            expect(currentPrice).not.toBeNull();
            expect(currentPrice.textContent).toBe('$15.99');
        });

        it('displays only current price when prices are equal', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Same Price Product',
                quantity: 1,
                formattedPrice: '$15.99',
                originalSubtotal: 15.99,
                itemSubtotal: 15.99,
                currencyCode: 'USD',
            };
            await Promise.resolve();

            // Price container does not exist
            const priceContainer = element.querySelector('.price-container');
            expect(priceContainer).toBeNull();

            // Current price should exist and display the price
            const currentPrice = element.querySelector('.current-price');
            expect(currentPrice).not.toBeNull();
            expect(currentPrice.textContent).toBe('$15.99');
        });

        it('formats original price with correct currency', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Discounted Product',
                quantity: 1,
                formattedPrice: '$15.99',
                originalSubtotal: 19.99,
                itemSubtotal: 15.99,
                currencyCode: 'EUR',
            };
            await Promise.resolve();

            const originalPrice = element.querySelector('.original-price');
            expect(originalPrice).not.toBeNull();
            expect(originalPrice.textContent).toBe('€19.99');
        });

        it('uses USD as default currency', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Discounted Product',
                quantity: 1,
                formattedPrice: '$15.99',
                originalSubtotal: 19.99,
                itemSubtotal: 15.99,
                // No currencyCode
            };
            await Promise.resolve();

            const originalPrice = element.querySelector('.original-price');
            expect(originalPrice).not.toBeNull();
            expect(originalPrice.textContent).toBe('$19.99');
        });

        it('handles null originalSubtotal', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Product',
                quantity: 1,
                formattedPrice: '$15.99',
                originalSubtotal: null,
                itemSubtotal: 15.99,
            };
            await Promise.resolve();

            const priceContainer = element.querySelector('.price-container');
            expect(priceContainer).toBeNull();
        });

        it('handles undefined originalSubtotal', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Product',
                quantity: 1,
                formattedPrice: '$15.99',
                originalSubtotal: undefined,
                itemSubtotal: 15.99,
            };
            await Promise.resolve();

            const priceContainer = element.querySelector('.price-container');
            expect(priceContainer).toBeNull();
        });

        it('handles zero originalSubtotal', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Product',
                quantity: 1,
                formattedPrice: '$15.99',
                originalSubtotal: 0,
                itemSubtotal: 15.99,
            };
            await Promise.resolve();

            // Zero originalSubtotal should still show as discounted (different from current price)
            const priceContainer = element.querySelector('.price-container');
            expect(priceContainer).not.toBeNull();

            const originalPrice = element.querySelector('.original-price');
            expect(originalPrice).not.toBeNull();
            expect(originalPrice.textContent).toBe('$0.00');
        });
    });

    describe('Promotions', () => {
        it('renders promotions label and items when item has promotions', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Product',
                quantity: 1,
                formattedPrice: '$41.99',
                itemSubtotal: 41.99,
                promotions: ['20% off', '10% off'],
            };
            await Promise.resolve();

            const pills = element.querySelectorAll('c-custom-pill');
            expect(pills.length).toBe(2);
            expect(pills[0].label).toBe('20% off');
            expect(pills[1].label).toBe('10% off');
        });

        it('does not render promotions section when item has no promotions', async () => {
            element.item = { ...mockItemMinimal };
            await Promise.resolve();
            expect(element.querySelector('.promotions-container')).toBeNull();
        });

        it('does not render promotions section when item.promotions is empty array', async () => {
            element.item = { ...mockItemMinimal, promotions: [] };
            await Promise.resolve();
            expect(element.querySelector('.promotions-container')).toBeNull();
        });
    });

    describe('Item-level coupons', () => {
        it('renders coupon pills when item has coupons', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Product',
                quantity: 1,
                formattedPrice: '$41.99',
                coupons: ['ITEMLEVEL15', 'FILTER10'],
            };
            await Promise.resolve();

            const pills = element.querySelectorAll('c-custom-pill');
            expect(pills.length).toBe(2);
            expect(pills[0].label).toBe('ITEMLEVEL15');
            expect(pills[1].label).toBe('FILTER10');
        });

        it('does not render coupon section when item has no coupons', async () => {
            element.item = { ...mockItemMinimal };
            await Promise.resolve();
            expect(element.querySelector('.item-coupons')).toBeNull();
        });

        it('normalizes item coupons from object entries (code and id)', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Product',
                quantity: 1,
                formattedPrice: '$41.99',
                coupons: [{ code: 'OBJCODE' }, { id: 'id-only-coupon' }],
            };
            await Promise.resolve();
            const pills = element.querySelectorAll('c-custom-pill');
            expect(pills).toHaveLength(2);
            expect(pills[0].label).toBe('OBJCODE');
            expect(pills[1].label).toBe('id-only-coupon');
        });

        it('filters out null or whitespace-only code from item coupons', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Product',
                quantity: 1,
                formattedPrice: '$41.99',
                coupons: [{ code: 'VALID' }, { code: '' }, { code: '   ' }, {}],
            };
            await Promise.resolve();
            const pills = element.querySelectorAll('c-custom-pill');
            expect(pills).toHaveLength(1);
            expect(pills[0].label).toBe('VALID');
        });
    });

    describe('Accessibility', () => {
        it('provides correct ARIA label for discounted items', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Discounted Product',
                quantity: 1,
                formattedPrice: '$15.99',
                originalSubtotal: 19.99,
                itemSubtotal: 15.99,
                currencyCode: 'USD',
            };
            await Promise.resolve();

            const priceContainer = element.querySelector('.price-container');
            expect(priceContainer).not.toBeNull();
            expect(priceContainer.getAttribute('aria-label')).toBe('Original price: $19.99, Current price: $15.99');
        });

        it('provides correct ARIA label for non-discounted items', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Regular Product',
                quantity: 1,
                formattedPrice: '$15.99',
                itemSubtotal: 15.99,
            };
            await Promise.resolve();

            const priceContainer = element.querySelector('.price-container');
            expect(priceContainer).toBeNull();

            // For non-discounted items, the aria-label should be on the span element
            const priceSpan = element.querySelector('span[aria-label]');
            expect(priceSpan).not.toBeNull();
            expect(priceSpan.getAttribute('aria-label')).toBe('$15.99');
            expect(priceSpan.textContent).toBe('$15.99');
        });

        it('handles missing formattedPrice in ARIA label', async () => {
            element.item = {
                imageUrl: 'test.jpg',
                name: 'Product',
                quantity: 1,
                formattedPrice: null,
                originalSubtotal: 19.99,
                itemSubtotal: 15.99,
            };
            await Promise.resolve();

            const priceContainer = element.querySelector('.price-container');
            expect(priceContainer).not.toBeNull();
            expect(priceContainer.getAttribute('aria-label')).toBe('Original price: $19.99, Current price: null');
        });
    });

    describe('Component Properties', () => {
        it('has correct render mode', () => {
            expect(ProductSummary.renderMode).toBe('light');
        });

        it('has required @api property', () => {
            // Test that the component can be instantiated and has the item property
            expect(element.item).toBeUndefined(); // Initially undefined
            element.item = mockItemMinimal;
            expect(element.item).toStrictEqual(mockItemMinimal);
        });

        it('initializes with correct i18n object', () => {
            // Test that the component initializes properly
            expect(element).toBeDefined();
            expect(element.tagName).toBe('C-PRODUCT-SUMMARY');
        });

        it('initializes with default configuration', () => {
            expect(element.configuration).toEqual({});
            expect(element.language).toBe('en_US');
        });
    });

    describe('Configuration and Language Support', () => {
        it('should support different language configurations', () => {
            element.configuration = { language: 'es' };
            expect(element.configuration.language).toBe('es');
            expect(element.language).toBe('es');

            element.configuration = { language: 'fr' };
            expect(element.configuration.language).toBe('fr');
            expect(element.language).toBe('fr');

            element.configuration = { language: 'en-GB' };
            expect(element.configuration.language).toBe('en-GB');
            expect(element.language).toBe('en-GB');
        });

        it('should provide correct translations for different languages', () => {
            // Test English (default)
            expect(element.i18n.quantityLabelText).toBe('Qty');
            expect(element.i18n.originalPriceLabel).toBe('Original price');
            expect(element.i18n.currentPriceLabel).toBe('Current price');

            // Test Spanish
            element.configuration = { language: 'es' };
            expect(element.i18n.quantityLabelText).toBe('Cant.');
            expect(element.i18n.originalPriceLabel).toBe('Precio original');
            expect(element.i18n.currentPriceLabel).toBe('Precio actual');

            // Test French
            element.configuration = { language: 'fr' };
            expect(element.i18n.quantityLabelText).toBe('Qté');
            expect(element.i18n.originalPriceLabel).toBe("Prix d'origine");
            expect(element.i18n.currentPriceLabel).toBe('Prix actuel');

            // Test German
            element.configuration = { language: 'de' };
            expect(element.i18n.quantityLabelText).toBe('Menge');
            expect(element.i18n.originalPriceLabel).toBe('Ursprünglicher Preis');
            expect(element.i18n.currentPriceLabel).toBe('Aktueller Preis');
        });

        it('should fallback to English for unsupported languages', () => {
            element.configuration = { language: 'unsupported-lang' };
            expect(element.i18n.quantityLabelText).toBe('Qty');
            expect(element.i18n.originalPriceLabel).toBe('Original price');
            expect(element.i18n.currentPriceLabel).toBe('Current price');
        });

        it('should handle undefined/null language gracefully', () => {
            element.configuration = { language: undefined };
            expect(element.configuration.language).toBeUndefined();
            expect(element.language).toBe('en_US');
            expect(element.i18n.quantityLabelText).toBe('Qty');

            element.configuration = { language: null };
            expect(element.configuration.language).toBeNull();
            expect(element.language).toBe('en_US');
            expect(element.i18n.quantityLabelText).toBe('Qty');

            element.configuration = { language: '' };
            expect(element.configuration.language).toBe('');
            expect(element.language).toBe('en_US');
            expect(element.i18n.quantityLabelText).toBe('Qty');
        });

        it('should update translations when language configuration changes', async () => {
            // Start with English
            element.configuration = { language: 'en_US' };
            await Promise.resolve();
            expect(element.i18n.quantityLabelText).toBe('Qty');

            // Change to Spanish
            element.configuration = { language: 'es' };
            await Promise.resolve();
            expect(element.i18n.quantityLabelText).toBe('Cant.');

            // Change to French
            element.configuration = { language: 'fr' };
            await Promise.resolve();
            expect(element.i18n.quantityLabelText).toBe('Qté');
        });

        it('should handle invalid locale gracefully in price formatting', async () => {
            element.item = {
                ...mockItemWithDetails,
                originalSubtotal: 25.99,
                itemSubtotal: 20.99,
                currencyCode: 'USD',
            };
            element.configuration = { language: 'invalid-locale-xyz' };
            await Promise.resolve();

            // Should render without throwing an error - test through DOM
            const priceContainer = element.querySelector('.item-price');
            expect(priceContainer).not.toBeNull();

            // Check that strikethrough price is displayed (fallback formatting should work)
            const originalPrice = element.querySelector('.original-price');
            expect(originalPrice).not.toBeNull();
            expect(originalPrice.textContent).toMatch(/\$25\.99/);
        });

        it('should handle empty language gracefully in price formatting', async () => {
            element.item = {
                ...mockItemWithDetails,
                originalSubtotal: 15.5,
                itemSubtotal: 12.0,
                currencyCode: 'EUR',
            };
            element.configuration = { language: '' };
            await Promise.resolve();

            // Should render without throwing an error - test through DOM
            const priceContainer = element.querySelector('.item-price');
            expect(priceContainer).not.toBeNull();

            // Check that strikethrough price is displayed (fallback formatting should work)
            const originalPrice = element.querySelector('.original-price');
            expect(originalPrice).not.toBeNull();
            expect(originalPrice.textContent).toMatch(/€15\.50/);
        });

        it('should handle null language gracefully in price formatting', async () => {
            element.item = {
                ...mockItemWithDetails,
                originalSubtotal: 100.0,
                itemSubtotal: 90.0,
                currencyCode: 'USD',
            };
            element.configuration = { language: null };
            await Promise.resolve();

            // Should render without throwing an error - test through DOM
            const priceContainer = element.querySelector('.item-price');
            expect(priceContainer).not.toBeNull();

            // Check that strikethrough price is displayed (fallback formatting should work)
            const originalPrice = element.querySelector('.original-price');
            expect(originalPrice).not.toBeNull();
            expect(originalPrice.textContent).toMatch(/\$100\.00/);
        });
    });

    describe('VariationAttributes Mapping', () => {
        it('maps variant types to labels using variationAttributes', async () => {
            const itemWithVariationAttributes = {
                ...mockItemWithDetails,
                variants: [
                    { type: 'color_id', value: 'red' },
                    { type: 'size_id', value: 'large' },
                ],
                variationAttributes: [
                    { id: 'color_id', label: 'Color' },
                    { id: 'size_id', label: 'Size' },
                ],
            };
            element.item = itemWithVariationAttributes;
            await Promise.resolve();

            const variantsContainer = element.querySelector('.item-variants');
            expect(variantsContainer).not.toBeNull();

            const variantSpans = variantsContainer.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(2);
            expect(variantSpans[0].textContent).toBe('Colorred');
            expect(variantSpans[1].textContent).toBe('Sizelarge');
        });

        it('falls back to variant type when no matching variationAttribute found', async () => {
            const itemWithPartialMapping = {
                ...mockItemWithDetails,
                variants: [
                    { type: 'color_id', value: 'blue' },
                    { type: 'unknown_type', value: 'test' },
                ],
                variationAttributes: [
                    { id: 'color_id', label: 'Color' },
                    // no mapping for 'unknown_type'
                ],
            };
            element.item = itemWithPartialMapping;
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(2);
            expect(variantSpans[0].textContent).toBe('Colorblue');
            expect(variantSpans[1].textContent).toBe('Unknown_typetest'); // Falls back to type
        });

        it('handles null variationAttributes', async () => {
            const itemWithNullVariationAttributes = {
                ...mockItemWithDetails,
                variants: [{ type: 'Color', value: 'Green' }],
                variationAttributes: null,
            };
            element.item = itemWithNullVariationAttributes;
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(1);
            expect(variantSpans[0].textContent).toBe('ColorGreen'); // Uses original type
        });

        it('handles undefined variationAttributes', async () => {
            const itemWithUndefinedVariationAttributes = {
                ...mockItemWithDetails,
                variants: [{ type: 'Material', value: 'Cotton' }],
                // variationAttributes intentionally undefined
            };
            element.item = itemWithUndefinedVariationAttributes;
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(1);
            expect(variantSpans[0].textContent).toBe('MaterialCotton'); // Uses original type
        });

        it('handles non-array variationAttributes', async () => {
            const itemWithInvalidVariationAttributes = {
                ...mockItemWithDetails,
                variants: [{ type: 'Style', value: 'Casual' }],
                variationAttributes: 'not-an-array',
            };
            element.item = itemWithInvalidVariationAttributes;
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(1);
            expect(variantSpans[0].textContent).toBe('StyleCasual'); // Uses original type
        });

        it('handles empty variationAttributes array', async () => {
            const itemWithEmptyVariationAttributes = {
                ...mockItemWithDetails,
                variants: [{ type: 'Brand', value: 'TestBrand' }],
                variationAttributes: [],
            };
            element.item = itemWithEmptyVariationAttributes;
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(1);
            expect(variantSpans[0].textContent).toBe('BrandTestBrand'); // Uses original type
        });

        it('handles variationAttributes with missing id or label properties', async () => {
            const itemWithMalformedAttributes = {
                ...mockItemWithDetails,
                variants: [
                    { type: 'test_id', value: 'value1' },
                    { type: 'other_id', value: 'value2' },
                ],
                variationAttributes: [
                    { id: 'test_id' }, // missing label
                    { label: 'Other' }, // missing id
                    { id: null, label: 'Invalid' }, // null id
                    { id: 'test_id', label: null }, // null label
                ],
            };
            element.item = itemWithMalformedAttributes;
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(2);
            // Should fall back to original type for both since mappings are invalid
            expect(variantSpans[0].textContent).toBe('Test_idvalue1');
            expect(variantSpans[1].textContent).toBe('Other_idvalue2');
        });

        it('handles complex mapping scenario with multiple variants and attributes', async () => {
            const itemWithComplexMapping = {
                ...mockItemWithDetails,
                variants: [
                    { type: 'color_attr', value: 'red' },
                    { type: 'size_attr', value: 'xl' },
                    { type: 'material_attr', value: 'cotton' },
                    { type: 'unmapped_type', value: 'unmapped_value' },
                ],
                variationAttributes: [
                    { id: 'color_attr', label: 'Product Color' },
                    { id: 'size_attr', label: 'Size Option' },
                    { id: 'material_attr', label: 'Fabric Type' },
                    // no mapping for 'unmapped_type'
                ],
            };
            element.item = itemWithComplexMapping;
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            // All variants should be displayed
            expect(variantSpans.length).toBe(4);
            expect(variantSpans[0].textContent).toBe('Product Colorred');
            expect(variantSpans[1].textContent).toBe('Size Optionxl');
            expect(variantSpans[2].textContent).toBe('Fabric Typecotton');
            expect(variantSpans[3].textContent).toBe('Unmapped_typeunmapped_value');
        });

        it('capitalizes first letter of variant labels', async () => {
            const itemWithLowercaseLabels = {
                ...mockItemWithDetails,
                variants: [
                    { type: 'color', value: 'blue' },
                    { type: 'size', value: 'medium' },
                ],
                variationAttributes: [
                    { id: 'color', label: 'color selection' }, // lowercase label
                    { id: 'size', label: 'size option' }, // lowercase label
                ],
            };
            element.item = itemWithLowercaseLabels;
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(2);
            // Verify that first letter is capitalized
            expect(variantSpans[0].textContent).toBe('Color selectionblue');
            expect(variantSpans[1].textContent).toBe('Size optionmedium');
        });

        it('handles falsy variant type and label for capitalization', async () => {
            // This tests the capitalization ternary when both mapped label and variant type are falsy
            const itemWithFalsyType = {
                ...mockItemWithDetails,
                variants: [
                    { type: '', value: 'testvalue' }, // empty string type
                    { type: 'falsytype', value: 'anothervalue' }, // use string instead of null to avoid key errors
                ],
                variationAttributes: [
                    { id: 'falsytype', label: '' }, // empty label for this type
                ],
            };
            element.item = itemWithFalsyType;
            await Promise.resolve();

            const variantSpans = element.querySelectorAll('.facet-item');
            expect(variantSpans.length).toBe(2);
            // When type is falsy, the label should remain falsy and not be capitalized
            expect(variantSpans[0].textContent).toBe('testvalue'); // empty type becomes empty label
            expect(variantSpans[1].textContent).toBe('Falsytypeanothervalue'); // empty label falls back to capitalized type
        });
    });
});
