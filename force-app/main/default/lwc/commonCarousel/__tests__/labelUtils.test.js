/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

import * as Labels from '../labelUtils';

describe('c-common-carousel labelUtils', () => {
    it('should return requested locale when available', () => {
        expect(Labels.previousImage('en_US')).toBe('Previous image');
        expect(Labels.previousImage('de')).toBe('Vorheriges Bild');
        expect(Labels.nextImage('es')).toBe('Siguiente imagen');
        expect(Labels.previousProduct('fr')).toBe('Produit précédent');
        expect(Labels.nextProduct('it')).toBe('Prodotto successivo');
        expect(Labels.productPrice('ja')).toBe('商品価格');
        expect(Labels.outOfStock('pt_BR')).toBe('Fora de estoque');
    });

    it('should fallback to English when requested locale not available', () => {
        expect(Labels.previousImage('xx')).toBe('Previous image');
        expect(Labels.nextProduct('unknown')).toBe('Next product');
        expect(Labels.productPrice('zzz')).toBe('Product Price');
    });

    it('should handle undefined/null/empty language gracefully', () => {
        expect(Labels.previousImage()).toBe('Previous image');
        expect(Labels.previousImage(null)).toBe('Previous image');
        expect(Labels.previousImage('')).toBe('Previous image');
    });

    it('should substitute parameters correctly for ARIA labels', () => {
        expect(Labels.viewImageAriaLabel('en_US', 3, 10)).toBe('View image 3 of 10');
        expect(Labels.viewProductAriaLabel('en_US', 2, 5)).toBe('View product 2 of 5');

        // Verify substitution for a non-English locale as well
        expect(Labels.viewImageAriaLabel('de', 1, 4)).toBe('Bild 1 von 4 anzeigen');
        expect(Labels.viewProductAriaLabel('fr', 7, 9)).toBe('Voir le produit 7 de 9');
    });

    it('should fallback to English for parameterized labels when locale not available', () => {
        expect(Labels.viewImageAriaLabel('xx', 1, 2)).toBe('View image 1 of 2');
        expect(Labels.viewProductAriaLabel('xx', 5, 6)).toBe('View product 5 of 6');
    });

    it('should test final fallback branch with missing English translation', () => {
        // Import actual LABEL_DATA and temporarily remove English for a key
        const { LABEL_DATA } = require('../labels');

        const originalPreviousImage = LABEL_DATA.previousImage;
        const testLabel = { es: 'Imagen anterior', fr: 'Image précédente' }; // No English translation

        LABEL_DATA.previousImage = testLabel;

        try {
            const updatedLabels = require('../labelUtils');
            expect(updatedLabels.previousImage('de')).toBe('previousImage'); // Should fallback to key
        } finally {
            LABEL_DATA.previousImage = originalPreviousImage;
        }
    });

    it('should test final fallback for parameterized label with missing English translation', () => {
        const { LABEL_DATA } = require('../labels');

        const originalViewImageAriaLabel = LABEL_DATA.viewImageAriaLabel;
        const paramOnlyNonEnglish = { de: 'Bild {0} von {1} anzeigen' }; // No English translation

        LABEL_DATA.viewImageAriaLabel = paramOnlyNonEnglish;

        try {
            const updatedLabels = require('../labelUtils');
            // Since neither requested locale (e.g., it) nor English exists, should fall back to key
            expect(updatedLabels.viewImageAriaLabel('it', 3, 7)).toBe('viewImageAriaLabel');
        } finally {
            LABEL_DATA.viewImageAriaLabel = originalViewImageAriaLabel;
        }
    });

    it('should use default locale for parameterized labels when locale is undefined', () => {
        // locale omitted should default to en_US in getTranslatedLabelWithParams (line 40)
        expect(Labels.viewImageAriaLabel(undefined, 1, 2)).toBe('View image 1 of 2');
        expect(Labels.viewProductAriaLabel(undefined, 3, 4)).toBe('View product 3 of 4');
    });

    it('should fallback to key when label key is completely missing (simple label)', () => {
        const { LABEL_DATA } = require('../labels');
        const original = LABEL_DATA.outOfStock;
        delete LABEL_DATA.outOfStock;
        try {
            const updated = require('../labelUtils');
            expect(updated.outOfStock('de')).toBe('outOfStock');
        } finally {
            LABEL_DATA.outOfStock = original;
        }
    });

    it('should fallback to key when label key is completely missing (parameterized)', () => {
        const { LABEL_DATA } = require('../labels');
        const original = LABEL_DATA.viewProductAriaLabel;
        delete LABEL_DATA.viewProductAriaLabel;
        try {
            const updated = require('../labelUtils');
            expect(updated.viewProductAriaLabel('de', 2, 3)).toBe('viewProductAriaLabel');
        } finally {
            LABEL_DATA.viewProductAriaLabel = original;
        }
    });
});
