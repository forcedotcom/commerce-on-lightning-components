/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { couponPlaceholder, applyButtonLabel, applyButtonAriaLabel, couponInputAriaLabel } from '../labelUtils';

describe('labelUtils', () => {
    describe('couponPlaceholder', () => {
        it.each([
            ['en_US', 'Enter coupon code...'],
            ['es', 'Ingresa el código del cupón...'],
            ['fr', 'Entrez le code promo...'],
            ['unknown', 'Enter coupon code...'],
        ])('should return correct label for %s', (language, expected) => {
            expect(couponPlaceholder(language)).toBe(expected);
        });
    });

    describe('applyButtonLabel', () => {
        it.each([
            ['en_US', 'Apply'],
            ['es', 'Aplicar'],
            ['de', 'Anwenden'],
        ])('should return correct label for %s', (language, expected) => {
            expect(applyButtonLabel(language)).toBe(expected);
        });
    });

    describe('applyButtonAriaLabel', () => {
        it.each([
            ['en_US', 'Apply coupon code'],
            ['es', 'Aplicar código de cupón'],
            ['fr', 'Appliquer le code promo'],
        ])('should return correct ARIA label for %s', (language, expected) => {
            expect(applyButtonAriaLabel(language)).toBe(expected);
        });
    });

    describe('couponInputAriaLabel', () => {
        it.each([
            ['en_US', 'Coupon code'],
            ['es', 'Código de cupón'],
            ['ja', 'クーポンコード'],
        ])('should return correct ARIA label for %s', (language, expected) => {
            expect(couponInputAriaLabel(language)).toBe(expected);
        });
    });
});
