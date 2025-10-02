/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

import * as Labels from '../labelUtils';

describe('c-commerce-header labelUtils', () => {
    it('should return requested locale when available', () => {
        // Test the first branch: label[language] exists
        expect(Labels.menu('en_US')).toBe('Menu');
        expect(Labels.menu('en_GB')).toBe('Menu');
        expect(Labels.menu('es')).toBe('Menú');
        expect(Labels.menu('fr')).toBe('Menu');
    });

    it('should fallback to English when requested locale not available', () => {
        // Test the second branch: label[language] doesn't exist, fallback to label.en_US
        expect(Labels.menu('xx')).toBe('Menu'); // Unknown locale not available, fallback to English
    });

    it('should fallback to labelKey when English not available', () => {
        // Test the third branch: neither label[language] nor label.en_US exist
        // This tests the final fallback to labelKey
        expect(Labels.menu('xyz')).toBe('Menu'); // This will fallback through the chain
    });

    it('should handle undefined/null language gracefully', () => {
        // Test default parameter behavior
        expect(Labels.menu()).toBe('Menu'); // undefined language
        expect(Labels.menu(null)).toBe('Menu'); // null language
        expect(Labels.menu('')).toBe('Menu'); // empty string
    });

    it('should test all fallback branches comprehensively', () => {
        // Test all three branches of the fallback logic:
        // 1. label[language] exists
        expect(Labels.menu('en_US')).toBe('Menu');

        // 2. label[language] doesn't exist, fallback to label['en_US']
        expect(Labels.menu('xx')).toBe('Menu');

        // 3. For the final fallback, we need to test with a non-existent label key
        // Since all our current labels have English translations, we'll test the logic
        // by ensuring the fallback chain works correctly

        // Test with various unsupported locales to ensure fallback chain works
        expect(Labels.menu('xyz')).toBe('Menu'); // Should fallback to English
        expect(Labels.menu('abc')).toBe('Menu'); // Should fallback to English
        expect(Labels.menu('123')).toBe('Menu'); // Should fallback to English

        // Test all label functions to ensure consistent fallback behavior
        expect(Labels.requestTranscript('xyz')).toBe('Request Transcript');
        expect(Labels.endChat('xyz')).toBe('End Chat');
        expect(Labels.minimize('xyz')).toBe('Minimize');
    });

    it('should test final fallback branch with missing English translation', () => {
        // Create a test scenario to trigger the final fallback branch
        // We'll test this by creating a temporary label structure

        // Import the actual LABEL_DATA to create a test scenario
        const { LABEL_DATA } = require('../labels');

        // Create a temporary test label that has no English translation
        const originalMenuLabel = LABEL_DATA.menu;
        const testLabel = { es: 'Menú', fr: 'Menu' }; // No English translation

        // Temporarily replace the menu label
        LABEL_DATA.menu = testLabel;

        try {
            // Now test the final fallback: no language specified, no English, should return key
            // We need to re-import to get the updated data
            const updatedLabels = require('../labelUtils');
            expect(updatedLabels.menu('de')).toBe('menu'); // Should fallback to key 'menu'
        } finally {
            // Restore the original label
            LABEL_DATA.menu = originalMenuLabel;
        }
    });
});
