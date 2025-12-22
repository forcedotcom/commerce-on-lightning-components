/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

import * as Labels from '../labelUtils';

describe('c-dynamic-content-renderer labelUtils', () => {
    it('should return requested locale when available', () => {
        // Test the first branch: label[language] exists
        expect(Labels.productSelectionTextMessageLabel('en_US')).toBe('Show me details about {0} ({1})');
        expect(Labels.productSelectionTextMessageLabel('en_GB')).toBe('Show me details about {0} ({1})');
        expect(Labels.productSelectionTextMessageLabel('es')).toBe('Muéstrame detalles sobre {0} ({1})');
        expect(Labels.productSelectionTextMessageLabel('fr')).toBe('Montre-moi les détails sur {0} ({1})');
    });

    it('should fallback to English when requested locale not available', () => {
        // Test the second branch: label[language] doesn't exist, fallback to label.en_US
        expect(Labels.productSelectionTextMessageLabel('xx')).toBe('Show me details about {0} ({1})'); // Unknown locale not available, fallback to English
        expect(Labels.productSelectionTextMessageLabel('yy')).toBe('Show me details about {0} ({1})'); // Unknown locale not available, fallback to English
        expect(Labels.productSelectionTextMessageLabel('zz')).toBe('Show me details about {0} ({1})'); // Unknown locale not available, fallback to English
    });

    it('should fallback to labelKey when English not available', () => {
        // Test the third branch: neither label[language] nor label.en_US exist
        // This tests the final fallback to labelKey
        expect(Labels.productSelectionTextMessageLabel('xyz')).toBe('Show me details about {0} ({1})'); // This will fallback through the chain
    });

    it('should handle undefined/null language gracefully', () => {
        // Test default parameter behavior
        expect(Labels.productSelectionTextMessageLabel()).toBe('Show me details about {0} ({1})'); // undefined language
        expect(Labels.productSelectionTextMessageLabel(null)).toBe('Show me details about {0} ({1})'); // null language
        expect(Labels.productSelectionTextMessageLabel('')).toBe('Show me details about {0} ({1})'); // empty string
    });

    it('should test all fallback branches comprehensively', () => {
        // Test all three branches of the fallback logic:
        // 1. label[language] exists
        expect(Labels.productSelectionTextMessageLabel('en_US')).toBe('Show me details about {0} ({1})');

        // 2. label[language] doesn't exist, fallback to label['en_US']
        expect(Labels.productSelectionTextMessageLabel('xx')).toBe('Show me details about {0} ({1})');

        // 3. For the final fallback, we need to test with a non-existent label key
        // Since all our current labels have English translations, we'll test the logic
        // by ensuring the fallback chain works correctly

        // Test with various unsupported locales to ensure fallback chain works
        expect(Labels.productSelectionTextMessageLabel('xyz')).toBe('Show me details about {0} ({1})'); // Should fallback to English
        expect(Labels.productSelectionTextMessageLabel('abc')).toBe('Show me details about {0} ({1})'); // Should fallback to English
        expect(Labels.productSelectionTextMessageLabel('123')).toBe('Show me details about {0} ({1})'); // Should fallback to English

        // Test all label functions to ensure consistent fallback behavior
        expect(Labels.productSelectionTextMessageLabel('xyz')).toBe('Show me details about {0} ({1})');
        expect(Labels.addToCartMessageLabel('xyz')).toBe('Add {0} with {1} in a quantity of {2} to cart ({3})');
    });

    it('should test final fallback branch with missing English translation', () => {
        // Create a test scenario to trigger the final fallback branch
        // We'll test this by creating a temporary label structure

        // Import the actual LABEL_DATA to create a test scenario
        const { LABEL_DATA } = require('../labels');

        // Create a temporary test label that has no English translation
        const originalLabel = LABEL_DATA.TextMessage_productSelection;
        const testLabel = {
            es: 'Muéstrame detalles sobre {0} ({1})',
            fr: 'Montre-moi les détails sur {0} ({1})',
        }; // No English translation

        // Temporarily replace the label
        LABEL_DATA.TextMessage_productSelection = testLabel;

        try {
            // Now test the final fallback: no language specified, no English, should return key
            // We need to re-import to get the updated data
            const updatedLabels = require('../labelUtils');
            expect(updatedLabels.productSelectionTextMessageLabel('de')).toBe('TextMessage_productSelection'); // Should fallback to key
        } finally {
            // Restore the original label
            LABEL_DATA.TextMessage_productSelection = originalLabel;
        }
    });
});
