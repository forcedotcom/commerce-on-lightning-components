/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { createElement } from 'lwc';
import ProductPricing from 'c/productPricing';

describe('c-product-pricing', () => {
    let element;

    beforeEach(() => {
        element = createElement('c-product-pricing', {
            is: ProductPricing,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('Price Display', () => {
        it('should display negotiated price when available', async () => {
            element.showNegotiatedPrice = true;
            element.negotiatedPrice = '100.00';
            element.currencyCode = 'USD';
            await Promise.resolve();

            const priceElement = element.querySelector('.negotiated-price');
            expect(priceElement).not.toBeNull();
            expect(priceElement.value).toBe('100.00');
            expect(priceElement.currencyCode).toBe('USD');
        });

        it('should display original price when available', async () => {
            element.showNegotiatedPrice = true;
            element.showOriginalPrice = true;
            element.negotiatedPrice = '100.00';
            element.originalPrice = '150.00';
            element.currencyCode = 'USD';
            await Promise.resolve();

            const priceElement = element.querySelector('.original-price');
            expect(priceElement).not.toBeNull();
            expect(priceElement.value).toBe('150.00');
            expect(priceElement.currencyCode).toBe('USD');
        });

        it('should display both prices when both are available', async () => {
            element.showNegotiatedPrice = true;
            element.showOriginalPrice = true;
            element.negotiatedPrice = '100.00';
            element.originalPrice = '150.00';
            element.currencyCode = 'USD';
            await Promise.resolve();

            const negotiatedPrice = element.querySelector('.negotiated-price');
            const originalPrice = element.querySelector('.original-price');
            expect(negotiatedPrice).not.toBeNull();
            expect(originalPrice).not.toBeNull();
            expect(negotiatedPrice.value).toBe('100.00');
            expect(originalPrice.value).toBe('150.00');
        });

        it('should display price labels when provided', async () => {
            element.showNegotiatedPrice = true;
            element.showOriginalPrice = true;
            element.negotiatedPrice = '100.00';
            element.originalPrice = '150.00';
            element.negotiatedPriceLabel = 'Sale Price';
            element.originalPriceLabel = 'List Price';
            element.currencyCode = 'USD';
            await Promise.resolve();

            const labels = element.querySelectorAll('.price-col-section');
            expect(labels[0].textContent.trim()).toBe('Sale Price:');
            expect(labels[2].textContent.trim()).toBe('List Price:');
        });

        it('should display unavailable price message when no price is available', async () => {
            element.showNegotiatedPrice = true;
            element.unavailablePriceLabel = 'Price not available';
            await Promise.resolve();

            const unavailableMessage = element.querySelector('.price-unavailable');
            expect(unavailableMessage).not.toBeNull();
            expect(unavailableMessage.textContent.trim()).toBe('Price not available');
        });
    });

    describe('Tax Information', () => {
        it('should display tax information when conditions are met', async () => {
            element.showNegotiatedPrice = true;
            element.negotiatedPrice = '100.00';
            element.showTaxIndication = true;
            element.taxLocaleType = 'Gross';
            element.taxRate = 10;
            element.taxIncludedLabel = 'Tax included';
            await Promise.resolve();

            const taxInfo = element.querySelector('.tax-info-label');
            expect(taxInfo).not.toBeNull();
            expect(taxInfo.textContent.trim()).toBe('Tax included');
        });

        it('should not display tax information when tax rate is 0', async () => {
            element.showNegotiatedPrice = true;
            element.negotiatedPrice = '100.00';
            element.showTaxIndication = true;
            element.taxLocaleType = 'Gross';
            element.taxRate = 0;
            element.taxIncludedLabel = 'Tax included';
            await Promise.resolve();

            const taxInfo = element.querySelector('.tax-info-label');
            expect(taxInfo).toBeNull();
        });

        it('should not display tax information when tax locale type is not Gross', async () => {
            element.showNegotiatedPrice = true;
            element.negotiatedPrice = '100.00';
            element.showTaxIndication = true;
            element.taxLocaleType = 'Net';
            element.taxRate = 10;
            element.taxIncludedLabel = 'Tax included';
            await Promise.resolve();

            const taxInfo = element.querySelector('.tax-info-label');
            expect(taxInfo).toBeNull();
        });
    });

    describe('Layout', () => {
        it('should apply horizontal layout classes when layout is horizontal', async () => {
            element.layout = 'horizontal';
            element.showNegotiatedPrice = true;
            element.negotiatedPrice = '100.00';
            await Promise.resolve();

            const container = element.querySelector('div[class*="price-container"]');
            expect(container).not.toBeNull();
            expect(container.className).toContain('slds-grid_reverse');
            expect(container.className).toContain('slds-grid_align-end');
        });
    });

    describe('Accessibility', () => {
        it('should include assistive text when both prices are displayed', async () => {
            element.showNegotiatedPrice = true;
            element.showOriginalPrice = true;
            element.negotiatedPrice = '100.00';
            element.originalPrice = '150.00';
            await Promise.resolve();

            const assistiveText = element.querySelector('.slds-assistive-text');
            expect(assistiveText).not.toBeNull();
        });

        it('should not include assistive text when only one price is displayed', async () => {
            element.showNegotiatedPrice = true;
            element.negotiatedPrice = '100.00';
            await Promise.resolve();

            const assistiveText = element.querySelector('.slds-assistive-text');
            expect(assistiveText).toBeNull();
        });
    });
});
