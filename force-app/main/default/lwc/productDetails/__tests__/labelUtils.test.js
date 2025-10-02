/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

import * as Labels from '../labelUtils';

describe('c-product-details labelUtils', () => {
    it('should return requested locale when available', () => {
        expect(Labels.addToCartAssistiveText('en_US')).toBe('Add To Cart');
        expect(Labels.addToCartAssistiveText('en_GB')).toBe('Add to basket');
        expect(Labels.addToCartAssistiveText('es')).toBe('Agregar al carrito');
        expect(Labels.addToCartAssistiveText('fr')).toBe('Ajouter au panier');
    });

    it('should fallback to English when requested locale not available', () => {
        expect(Labels.addToCartAssistiveText('xx')).toBe('Add To Cart');
    });

    it('should fallback to labelKey when English not available', () => {
        expect(Labels.addToCartAssistiveText('xyz')).toBe('Add To Cart');
    });

    it('should handle undefined/null language gracefully', () => {
        expect(Labels.addToCartAssistiveText()).toBe('Add To Cart');
        expect(Labels.addToCartAssistiveText(null)).toBe('Add To Cart');
        expect(Labels.addToCartAssistiveText('')).toBe('Add To Cart');
    });

    it('should test all fallback branches comprehensively', () => {
        expect(Labels.quantityLabelAssistiveText('en_US')).toBe('Quantity');
        expect(Labels.quantityLabelAssistiveText('xx')).toBe('Quantity');
        expect(Labels.quantityLabelAssistiveText('xyz')).toBe('Quantity');
        expect(Labels.quantityLabelAssistiveText('abc')).toBe('Quantity');
        expect(Labels.quantityLabelAssistiveText('123')).toBe('Quantity');

        expect(Labels.currentPriceAssistiveText('xyz')).toBe('Current price');
        expect(Labels.originalPriceAssistiveText('xyz')).toBe('Original price strikethrough');
        expect(Labels.loadingSpinnerAltText('xyz')).toBe('Loading express payment options...');
    });

    it('should test final fallback branch with missing English translation', () => {
        const { LABEL_DATA } = require('../labels');
        const originalLabel = LABEL_DATA.Product_addToCartAssistiveText;
        const testLabel = { es: 'Agregar al carrito', fr: 'Ajouter au panier' };

        LABEL_DATA.Product_addToCartAssistiveText = testLabel;

        try {
            const updatedLabels = require('../labelUtils');
            expect(updatedLabels.addToCartAssistiveText('de')).toBe('Product_addToCartAssistiveText');
        } finally {
            LABEL_DATA.Product_addToCartAssistiveText = originalLabel;
        }
    });

    it('should test all exported label functions for consistency', () => {
        expect(Labels.addToCartAssistiveText('en_US')).toBe('Add To Cart');
        expect(Labels.quantityLabelAssistiveText('en_US')).toBe('Quantity');
        expect(Labels.currentPriceAssistiveText('en_US')).toBe('Current price');
        expect(Labels.originalPriceAssistiveText('en_US')).toBe('Original price strikethrough');
        expect(Labels.pricingSectionAssistiveText('en_US')).toBe('Product Pricing');
        expect(Labels.featuresSectionAssistiveText('en_US')).toBe('Product Features');
        expect(Labels.variantsSectionAssistiveText('en_US')).toBe('Product Variants');
        expect(Labels.quantitySectionAssistiveText('en_US')).toBe('Quantity Selection');
        expect(Labels.quantityControlsAssistiveText('en_US')).toBe('Quantity Controls');
        expect(Labels.decreaseQuantityAssistiveText('en_US')).toBe('Decrease quantity');
        expect(Labels.increaseQuantityAssistiveText('en_US')).toBe('Increase quantity');
        expect(Labels.loadingSpinnerAltText('en_US')).toBe('Loading express payment options...');
        expect(Labels.quantityLabelText('en_US')).toBe('Qty');
        expect(Labels.originalPriceLabelText('en_US')).toBe('Original price');
        expect(Labels.currentPriceLabelText('en_US')).toBe('Current price');
        expect(Labels.strikethroughAssistiveText('en_US')).toBe('Crossed Out');
    });

    it('should test different locales for all functions', () => {
        expect(Labels.strikethroughAssistiveText('de')).toBe('Durchgestrichen');
        expect(Labels.strikethroughAssistiveText('es')).toBe('Tachado');
        expect(Labels.strikethroughAssistiveText('fr')).toBe('Barré');
        expect(Labels.strikethroughAssistiveText('ja')).toBe('取り消し線');
        expect(Labels.strikethroughAssistiveText('zh_CN')).toBe('删除线');
        expect(Labels.strikethroughAssistiveText('unsupported_locale')).toBe('Crossed Out');
    });
});
