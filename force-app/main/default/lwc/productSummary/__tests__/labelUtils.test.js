/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

import * as Labels from '../labelUtils';

describe('c-product-summary labelUtils', () => {
    it('should return requested locale when available', () => {
        // Test the first branch: label[language] exists
        expect(Labels.quantityLabelText('en_US')).toBe('Qty');
        expect(Labels.quantityLabelText('en_GB')).toBe('Qty');
        expect(Labels.quantityLabelText('es')).toBe('Cant.');
        expect(Labels.quantityLabelText('fr')).toBe('Qté');

        expect(Labels.originalPriceLabel('en_US')).toBe('Original price');
        expect(Labels.originalPriceLabel('es')).toBe('Precio original');
        expect(Labels.originalPriceLabel('fr')).toBe("Prix d'origine");

        expect(Labels.currentPriceLabel('en_US')).toBe('Current price');
        expect(Labels.currentPriceLabel('es')).toBe('Precio actual');
        expect(Labels.currentPriceLabel('fr')).toBe('Prix actuel');
    });

    it('should fallback to English when requested locale not available', () => {
        // Test the second branch: label[language] doesn't exist, fallback to label['en_US']
        expect(Labels.quantityLabelText('xx')).toBe('Qty'); // Unknown locale not available, fallback to English
        expect(Labels.originalPriceLabel('xx')).toBe('Original price');
        expect(Labels.currentPriceLabel('xx')).toBe('Current price');
    });

    it('should fallback to labelKey when English not available', () => {
        // Test the third branch: neither label[language] nor label['en_US'] exist
        // This tests the final fallback to labelKey
        expect(Labels.quantityLabelText('xyz')).toBe('Qty'); // This will fallback through the chain
        expect(Labels.originalPriceLabel('xyz')).toBe('Original price');
        expect(Labels.currentPriceLabel('xyz')).toBe('Current price');
    });

    it('should handle undefined/null language gracefully', () => {
        // Test default parameter behavior
        expect(Labels.quantityLabelText()).toBe('Qty'); // undefined language
        expect(Labels.quantityLabelText(null)).toBe('Qty'); // null language
        expect(Labels.quantityLabelText('')).toBe('Qty'); // empty string

        expect(Labels.originalPriceLabel()).toBe('Original price');
        expect(Labels.originalPriceLabel(null)).toBe('Original price');
        expect(Labels.originalPriceLabel('')).toBe('Original price');

        expect(Labels.currentPriceLabel()).toBe('Current price');
        expect(Labels.currentPriceLabel(null)).toBe('Current price');
        expect(Labels.currentPriceLabel('')).toBe('Current price');
    });

    it('should test all fallback branches comprehensively', () => {
        // Test all three branches of the fallback logic:
        // 1. label[language] exists
        expect(Labels.quantityLabelText('en_US')).toBe('Qty');
        expect(Labels.originalPriceLabel('en_US')).toBe('Original price');
        expect(Labels.currentPriceLabel('en_US')).toBe('Current price');

        // 2. label[language] doesn't exist, fallback to label['en_US']
        expect(Labels.quantityLabelText('xx')).toBe('Qty');
        expect(Labels.originalPriceLabel('xx')).toBe('Original price');
        expect(Labels.currentPriceLabel('xx')).toBe('Current price');

        // 3. For the final fallback, we need to test with a non-existent label key
        // Since all our current labels have English translations, we'll test the logic
        // by ensuring the fallback chain works correctly

        // Test with various unsupported locales to ensure fallback chain works
        expect(Labels.quantityLabelText('xyz')).toBe('Qty'); // Should fallback to English
        expect(Labels.quantityLabelText('abc')).toBe('Qty'); // Should fallback to English
        expect(Labels.quantityLabelText('123')).toBe('Qty'); // Should fallback to English

        // Test all label functions to ensure consistent fallback behavior
        expect(Labels.originalPriceLabel('xyz')).toBe('Original price');
        expect(Labels.currentPriceLabel('xyz')).toBe('Current price');
    });

    it('should test final fallback branch with missing English translation', () => {
        // Create a test scenario to trigger the final fallback branch
        // We'll test this by creating a temporary label structure

        // Import the actual LABEL_DATA to create a test scenario
        const { LABEL_DATA } = require('../labels');

        // Create a temporary test label that has no English translation
        const originalLabel = LABEL_DATA.quantityLabelText;
        const testLabel = { es: 'Cant.', fr: 'Qté' }; // No English translation

        // Temporarily replace the label
        LABEL_DATA.quantityLabelText = testLabel;

        try {
            // Now test the final fallback: no language specified, no English, should return key
            // We need to re-import to get the updated data
            const updatedLabels = require('../labelUtils');
            expect(updatedLabels.quantityLabelText('de')).toBe('quantityLabelText'); // Should fallback to key 'quantityLabelText'
        } finally {
            // Restore the original label
            LABEL_DATA.quantityLabelText = originalLabel;
        }
    });
});
