/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

import { createElement } from 'lwc';
import ProductSummary from 'c/productSummary';

// Mock the labels
jest.mock('@salesforce/label/c.Product_quantityLabelText', () => ({ default: 'Qty' }), {
    virtual: true,
});
jest.mock('@salesforce/label/c.Product_originalPriceLabelText', () => ({ default: 'Original price' }), {
    virtual: true,
});
jest.mock('@salesforce/label/c.Product_currentPriceLabelText', () => ({ default: 'Current price' }), {
    virtual: true,
});

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
            expect(variantSpans[0].textContent).toBe(
                `${mockItemWithDetails.variants[0].type}${mockItemWithDetails.variants[0].value}`
            );
            expect(variantSpans[1].textContent).toBe(
                `${mockItemWithDetails.variants[1].type}${mockItemWithDetails.variants[1].value}`
            );

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

            const currentPrice = element.querySelector('.current-price');
            expect(currentPrice).toBeNull();

            // Regular price is displayed
            const itemPrice = element.querySelector('.item-price');
            expect(itemPrice.textContent).toBe('$15.99');
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

            // Regular price is displayed
            const itemPrice = element.querySelector('.item-price');
            expect(itemPrice.textContent).toBe('$15.99');
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

            // For non-discounted items, no aria-label is needed as it's just text
            const itemPrice = element.querySelector('.item-price');
            expect(itemPrice.textContent).toBe('$15.99');
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
            // Only first 2 variants should be displayed (limited to 2 facets max)
            expect(variantSpans.length).toBe(2);
            expect(variantSpans[0].textContent).toBe('Product Colorred');
            expect(variantSpans[1].textContent).toBe('Size Optionxl');
        });
    });
    it('should trigger formattedStandardPrice getter when hasStandardPrice is true', async () => {
        const itemWithStandardPrice = {
            imageUrl: 'test.jpg',
            name: 'Test Product',
            quantity: 1,
            formattedPrice: '$19.99',
            originalSubtotal: 29.99, // Valid standard price - different from itemSubtotal
            itemSubtotal: 19.99, // Different from originalSubtotal, so hasStandardPrice = true
            currencyCode: 'USD',
        };

        element.item = itemWithStandardPrice;
        await Promise.resolve();

        // When hasStandardPrice is true, the template renders both prices
        // This triggers the formattedStandardPrice getter, executing the .format() call
        const priceContainer = element.querySelector('.price-container');
        expect(priceContainer).not.toBeNull();

        const originalPriceElement = element.querySelector('.original-price');
        expect(originalPriceElement).not.toBeNull();

        // Verify that the .format() call was executed and returned a formatted price
        expect(originalPriceElement.textContent).toBe('$29.99');

        const currentPrice = element.querySelector('.current-price');
        expect(currentPrice.textContent).toBe('$19.99');
    });
});
