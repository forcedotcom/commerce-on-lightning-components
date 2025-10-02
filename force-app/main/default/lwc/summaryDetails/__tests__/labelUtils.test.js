/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import * as Labels from '../labelUtils';

describe('c-summary-details labelUtils', () => {
    it('should return requested locale when available', () => {
        expect(Labels.confirmationTitle('en_US')).toBe('Your order is confirmed.');
        expect(Labels.confirmationTitle('en_GB')).toBe('Your order is confirmed.');
        expect(Labels.confirmationTitle('es')).toBe('Tu pedido está confirmado.');
        expect(Labels.confirmationTitle('fr')).toBe('Votre commande est confirmée.');
        expect(Labels.confirmationTitle('de')).toBe('Ihre Bestellung ist bestätigt.');
        expect(Labels.confirmationTitle('ja')).toBe('ご注文が確定しました。');
    });

    it('should fallback to English when requested locale not available', () => {
        expect(Labels.confirmationTitle('xx')).toBe('Your order is confirmed.');
    });

    it('should fallback to labelKey when English not available', () => {
        const { LABEL_DATA } = require('../labels');
        const originalLabel = LABEL_DATA.confirmationTitle;
        const testLabel = { es: 'Tu pedido está confirmado.', fr: 'Votre commande est confirmée.' };

        LABEL_DATA.confirmationTitle = testLabel;

        try {
            delete require.cache[require.resolve('../labelUtils')];
            const updatedLabels = require('../labelUtils');
            expect(updatedLabels.confirmationTitle('de')).toBe('confirmationTitle');
        } finally {
            LABEL_DATA.confirmationTitle = originalLabel;
            delete require.cache[require.resolve('../labelUtils')];
        }
    });

    it('should handle undefined/null language gracefully', () => {
        expect(Labels.confirmationTitle()).toBe('Your order is confirmed.');
        expect(Labels.confirmationTitle(null)).toBe('Your order is confirmed.');
        expect(Labels.confirmationTitle('')).toBe('Your order is confirmed.');
    });

    it('should test all fallback branches comprehensively', () => {
        expect(Labels.subtotalLabel('en_US')).toBe('Subtotal');
        expect(Labels.subtotalLabel('xx')).toBe('Subtotal');
        expect(Labels.subtotalLabel('xyz')).toBe('Subtotal');
        expect(Labels.subtotalLabel('abc')).toBe('Subtotal');
        expect(Labels.subtotalLabel('123')).toBe('Subtotal');

        expect(Labels.promotionsLabel('xyz')).toBe('Promotions');
        expect(Labels.shippingLabel('xyz')).toBe('Shipping');
        expect(Labels.taxesLabel('xyz')).toBe('Taxes');
        expect(Labels.totalLabel('xyz')).toBe('Total');
        expect(Labels.tbdLabel('xyz')).toBe('TBD');
        expect(Labels.freeShippingLabel('xyz')).toBe('Free');
    });

    it('should test all exported label functions for consistency', () => {
        expect(Labels.confirmationTitle('en_US')).toBe('Your order is confirmed.');
        expect(Labels.subtotalLabel('en_US')).toBe('Subtotal');
        expect(Labels.promotionsLabel('en_US')).toBe('Promotions');
        expect(Labels.shippingLabel('en_US')).toBe('Shipping');
        expect(Labels.shippingDiscountLabel('en_US')).toBe('Shipping Discount');
        expect(Labels.taxesLabel('en_US')).toBe('Taxes');
        expect(Labels.totalLabel('en_US')).toBe('Total');
        expect(Labels.tbdLabel('en_US')).toBe('TBD');
        expect(Labels.freeShippingLabel('en_US')).toBe('Free');
        expect(Labels.defaultDeliveryMessage('en_US')).toBe('Your order is confirmed.');
        expect(Labels.footerMessage('en_US')).toBe('Is there anything else I can help you with?');
        expect(Labels.orderSummaryAssistiveText('en_US')).toBe('Order Summary');
        expect(Labels.cartSummaryAssistiveText('en_US')).toBe('Cart Summary');
        expect(Labels.toggleExpandAssistiveText('en_US')).toBe('Expand order details');
        expect(Labels.toggleCollapseAssistiveText('en_US')).toBe('Collapse order details');
        expect(Labels.toggleExpandCartAssistiveText('en_US')).toBe('Expand cart details');
        expect(Labels.toggleCollapseCartAssistiveText('en_US')).toBe('Collapse cart details');
        expect(Labels.orderItemsAssistiveText('en_US')).toBe('Order Items');
        expect(Labels.cartItemsAssistiveText('en_US')).toBe('Cart Items');
        expect(Labels.orderTotalsAssistiveText('en_US')).toBe('Order Total Breakdown');
        expect(Labels.cartTotalsAssistiveText('en_US')).toBe('Cart Total Breakdown');
        expect(Labels.orderIdLabel('en_US')).toBe('Order ID');
    });

    it('should test final fallback branch with missing English translation', () => {
        // Create a test scenario to trigger the final fallback branch
        // We'll test this by creating a temporary label structure

        // Import the actual LABEL_DATA to create a test scenario
        const { LABEL_DATA } = require('../labels');

        // Create a temporary test label that has no English translation
        const originalLabel = LABEL_DATA.confirmationTitle;
        const testLabel = { es: 'Tu pedido está confirmado.', fr: 'Votre commande est confirmée.' }; // No English translation

        // Temporarily replace the label
        LABEL_DATA.confirmationTitle = testLabel;

        try {
            // Now test the final fallback: no language specified, no English, should return key
            // We need to re-import to get the updated data
            const updatedLabels = require('../labelUtils');
            expect(updatedLabels.confirmationTitle('de')).toBe('confirmationTitle'); // Should fallback to key 'confirmationTitle'
        } finally {
            // Restore the original label
            LABEL_DATA.confirmationTitle = originalLabel;
        }
    });

    it('should test different locales for all functions', () => {
        expect(Labels.subtotalLabel('de')).toBe('Zwischensumme');
        expect(Labels.subtotalLabel('es')).toBe('Subtotal');
        expect(Labels.subtotalLabel('fr')).toBe('Sous-total');
        expect(Labels.subtotalLabel('ja')).toBe('小計');
        expect(Labels.subtotalLabel('zh_CN')).toBe('小计');

        expect(Labels.totalLabel('de')).toBe('Gesamt');
        expect(Labels.totalLabel('es')).toBe('Total');
        expect(Labels.totalLabel('fr')).toBe('Total');
        expect(Labels.totalLabel('ja')).toBe('合計');
        expect(Labels.totalLabel('zh_CN')).toBe('合计');

        expect(Labels.totalLabel('unsupported_locale')).toBe('Total');
        expect(Labels.subtotalLabel('unsupported_locale')).toBe('Subtotal');
    });
});
