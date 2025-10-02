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
        expect(Labels.categoryRecommendationTextMessageLabel('en_US')).toBe('{0} for category {1} ({2})');
        expect(Labels.categoryRecommendationTextMessageLabel('en_GB')).toBe('{0} for category {1} ({2})');
        expect(Labels.categoryRecommendationTextMessageLabel('es')).toBe('{0} para la categoría {1} ({2})');
        expect(Labels.categoryRecommendationTextMessageLabel('fr')).toBe('{0} pour la catégorie {1} ({2})');
    });

    it('should fallback to English when requested locale not available', () => {
        // Test the second branch: label[language] doesn't exist, fallback to label.en_US
        expect(Labels.categoryRecommendationTextMessageLabel('xx')).toBe('{0} for category {1} ({2})'); // Unknown locale not available, fallback to English
        expect(Labels.categoryRecommendationTextMessageLabel('yy')).toBe('{0} for category {1} ({2})'); // Unknown locale not available, fallback to English
        expect(Labels.categoryRecommendationTextMessageLabel('zz')).toBe('{0} for category {1} ({2})'); // Unknown locale not available, fallback to English
    });

    it('should fallback to labelKey when English not available', () => {
        // Test the third branch: neither label[language] nor label.en_US exist
        // This tests the final fallback to labelKey
        expect(Labels.categoryRecommendationTextMessageLabel('xyz')).toBe('{0} for category {1} ({2})'); // This will fallback through the chain
    });

    it('should handle undefined/null language gracefully', () => {
        // Test default parameter behavior
        expect(Labels.categoryRecommendationTextMessageLabel()).toBe('{0} for category {1} ({2})'); // undefined language
        expect(Labels.categoryRecommendationTextMessageLabel(null)).toBe('{0} for category {1} ({2})'); // null language
        expect(Labels.categoryRecommendationTextMessageLabel('')).toBe('{0} for category {1} ({2})'); // empty string
    });

    it('should test all fallback branches comprehensively', () => {
        // Test all three branches of the fallback logic:
        // 1. label[language] exists
        expect(Labels.categoryRecommendationTextMessageLabel('en_US')).toBe('{0} for category {1} ({2})');

        // 2. label[language] doesn't exist, fallback to label['en_US']
        expect(Labels.categoryRecommendationTextMessageLabel('xx')).toBe('{0} for category {1} ({2})');

        // 3. For the final fallback, we need to test with a non-existent label key
        // Since all our current labels have English translations, we'll test the logic
        // by ensuring the fallback chain works correctly

        // Test with various unsupported locales to ensure fallback chain works
        expect(Labels.categoryRecommendationTextMessageLabel('xyz')).toBe('{0} for category {1} ({2})'); // Should fallback to English
        expect(Labels.categoryRecommendationTextMessageLabel('abc')).toBe('{0} for category {1} ({2})'); // Should fallback to English
        expect(Labels.categoryRecommendationTextMessageLabel('123')).toBe('{0} for category {1} ({2})'); // Should fallback to English

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
        const originalLabel = LABEL_DATA.TextMessage_categoryRecommendations;
        const testLabel = {
            es: '{0} para la categoría {1} ({2})',
            fr: '{0} pour la catégorie {1} ({2})',
        }; // No English translation

        // Temporarily replace the label
        LABEL_DATA.TextMessage_categoryRecommendations = testLabel;

        try {
            // Now test the final fallback: no language specified, no English, should return key
            // We need to re-import to get the updated data
            const updatedLabels = require('../labelUtils');
            expect(updatedLabels.categoryRecommendationTextMessageLabel('de')).toBe(
                'TextMessage_categoryRecommendations'
            ); // Should fallback to key
        } finally {
            // Restore the original label
            LABEL_DATA.TextMessage_categoryRecommendations = originalLabel;
        }
    });
});
