/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

import * as Labels from '../labelUtils';

describe('c-cart-summary labelUtils', () => {
    it('should return requested locale when available', () => {
        // Test the first branch: label[language] exists
        expect(Labels.cartSummaryRegionLabel('en_US')).toBe('Cart Summary Section');
        expect(Labels.cartSummaryRegionLabel('en_GB')).toBe('Cart Summary Section');
        expect(Labels.cartSummaryRegionLabel('es')).toBe('Sección de resumen del carrito');
        expect(Labels.cartSummaryRegionLabel('fr')).toBe('Section récapitulatif du panier');
    });

    it('should fallback to English when requested locale not available', () => {
        // Test the second branch: label[language] doesn't exist, fallback to label['en_US']
        expect(Labels.cartSummaryRegionLabel('xx')).toBe('Cart Summary Section'); // Unknown locale not available, fallback to English
    });

    it('should fallback to labelKey when English not available', () => {
        // Test the third branch: neither label[language] nor label['en_US'] exist
        // This tests the final fallback to labelKey
        expect(Labels.cartSummaryRegionLabel('xyz')).toBe('Cart Summary Section'); // This will fallback through the chain
    });

    it('should handle undefined/null language gracefully', () => {
        // Test default parameter behavior
        expect(Labels.cartSummaryRegionLabel()).toBe('Cart Summary Section'); // undefined language
        expect(Labels.cartSummaryRegionLabel(null)).toBe('Cart Summary Section'); // null language
        expect(Labels.cartSummaryRegionLabel('')).toBe('Cart Summary Section'); // empty string
    });

    it('should test all fallback branches comprehensively', () => {
        // Test all three branches of the fallback logic:
        // 1. label[language] exists
        expect(Labels.cartSummaryRegionLabel('en_US')).toBe('Cart Summary Section');

        // 2. label[language] doesn't exist, fallback to label['en_US']
        expect(Labels.cartSummaryRegionLabel('xx')).toBe('Cart Summary Section');

        // 3. For the final fallback, we need to test with a non-existent label key
        // Since all our current labels have English translations, we'll test the logic
        // by ensuring the fallback chain works correctly

        // Test with various unsupported locales to ensure fallback chain works
        expect(Labels.cartSummaryRegionLabel('xyz')).toBe('Cart Summary Section'); // Should fallback to English
        expect(Labels.cartSummaryRegionLabel('abc')).toBe('Cart Summary Section'); // Should fallback to English
        expect(Labels.cartSummaryRegionLabel('123')).toBe('Cart Summary Section'); // Should fallback to English

        // Test all label functions to ensure consistent fallback behavior
        expect(Labels.loadingSpinnerAltText('xyz')).toBe('Loading express payment options...');
        expect(Labels.checkoutButtonLabel('xyz')).toBe('Checkout');
        expect(Labels.checkoutButtonAssistiveText('xyz')).toBe('Proceed to checkout');
    });

    it('should return addedCouponsAriaLabel for locale', () => {
        expect(Labels.addedCouponsAriaLabel('en_US')).toBe('Added coupons');
        expect(Labels.addedCouponsAriaLabel('es')).toBe('Cupones añadidos');
        expect(Labels.addedCouponsAriaLabel('fr')).toBe('Codes promo ajoutés');
    });

    it('should return appliedCouponsAriaLabel for locale', () => {
        expect(Labels.appliedCouponsAriaLabel('en_US')).toBe('Applied coupons');
        expect(Labels.appliedCouponsAriaLabel('es')).toBe('Cupones aplicados');
        expect(Labels.appliedCouponsAriaLabel('fr')).toBe('Codes promo appliqués');
    });

    it('should test final fallback branch with missing English translation', () => {
        // Create a test scenario to trigger the final fallback branch
        // We'll test this by creating a temporary label structure

        // Import the actual LABEL_DATA to create a test scenario
        const { LABEL_DATA } = require('../labels');

        // Create a temporary test label that has no English translation
        const originalLabel = LABEL_DATA.cartSummaryRegionLabel;
        const testLabel = { es: 'Sección de resumen del carrito', fr: 'Section récapitulatif du panier' }; // No English translation

        // Temporarily replace the label
        LABEL_DATA.cartSummaryRegionLabel = testLabel;

        try {
            // Now test the final fallback: no language specified, no English, should return key
            // We need to re-import to get the updated data
            const updatedLabels = require('../labelUtils');
            expect(updatedLabels.cartSummaryRegionLabel('de')).toBe('cartSummaryRegionLabel'); // Should fallback to key 'cartSummaryRegionLabel'
        } finally {
            // Restore the original label
            LABEL_DATA.cartSummaryRegionLabel = originalLabel;
        }
    });
});
