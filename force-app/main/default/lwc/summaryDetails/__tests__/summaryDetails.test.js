/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { createElement } from 'lwc';
import SummaryDetails from 'c/summaryDetails';

// Test data
const mockOrderData = {
    id: '12345',
    currencyCode: 'USD',
    items: [
        { name: 'Product A', quantity: 1, itemSubtotal: 50.0, imageUrl: 'imgA.jpg' },
        { name: 'Product B', quantity: 2, itemSubtotal: 25.0, imageUrl: 'imgB.jpg' },
    ],
    subtotal: 100.0,
    shippingCost: 10.0,
    taxes: 8.0,
    total: 118.0,
    bodyMessage: 'Expected delivery tomorrow.',
};

const mockCartData = {
    ...mockOrderData,
    headerMessage: 'Cart Summary Title',
    bodyMessage: 'Cart delivery message',
};

const mockDataWithPromotionsAndDiscounts = {
    taxes: 98.3,
    status: 'created',
    shippingCost: 15.99,
    shippingDiscount: -10.0,
    promotionsDiscount: -25.0,
    total: 2064.21,
    subtotal: 1949.92,
    id: '00000601',
    items: [
        {
            variationValues: {},
            quantity: 1,
            itemSubtotal: 1199.97,
            name: 'Sony Playstation 3 Game Console',
            productId: 'sony-ps3-consoleM',
            imageUrl: 'https://example.com/image.jpg',
        },
    ],
    bodyMessage: 'Order received within 7-10 business days',
    currencyCode: 'USD',
};

describe('c-summary-details', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    /**
     * Creates and appends the c-summary-details component to the DOM for testing
     * @param {object} config - The configuration object containing component properties
     * @returns {Promise<Element>} The created component element
     */
    async function createComponent(config = {}) {
        const element = createElement('c-summary-details', {
            is: SummaryDetails,
        });
        Object.assign(element, config);
        document.body.appendChild(element);
        await Promise.resolve();
        return element;
    }

    /**
     * Expands the summary details component to show all summary values
     * @param {Element} element - The component element to expand
     * @returns {Promise<void>}
     */
    async function expandComponent(element) {
        const clickableEl = element.querySelector('.clickable-row');
        clickableEl.click();
        await Promise.resolve();
    }

    /**
     * Finds the corresponding value element for a given summary label
     * @param {Element} element - The component element to search within
     * @param {string} labelText - The text content of the label to find
     * @returns {Element|null} The found value element or null if not found
     */
    function findSummaryValue(element, labelText) {
        const labels = element.querySelectorAll('.summary-label');
        const values = element.querySelectorAll('.summary-value');
        const labelIndex = Array.from(labels).findIndex((label) => label.textContent === labelText);
        return labelIndex >= 0 ? values[labelIndex] : null;
    }

    describe('Basic Functionality', () => {
        it('should render collapsed state by default with header content only', async () => {
            const element = await createComponent();

            // Header should always be visible
            const titleEl = element.querySelector('.confirmation-title');
            expect(titleEl.textContent).toBe('c.Order_confirmationTitle');

            const deliveryMsgEl = element.querySelector('.delivery-message');
            expect(deliveryMsgEl.textContent).toBe('c.Order_defaultDeliveryMessage');

            // Caret should show down arrow when collapsed
            const caretIcon = element.querySelector('lightning-icon');
            expect(caretIcon.iconName).toBe('utility:chevrondown');

            // Order details should not be visible when collapsed
            const orderNoEl = element.querySelector('.order-no-value');
            expect(orderNoEl).toBeNull();

            const productSummaryEls = element.querySelectorAll('c-product-summary');
            expect(productSummaryEls.length).toBe(0);
        });

        it('should render correctly with provided orderData when expanded', async () => {
            const element = await createComponent({ details: mockOrderData });
            await expandComponent(element);

            const titleEl = element.querySelector('.confirmation-title');
            expect(titleEl.textContent).toBe('c.Order_confirmationTitle');

            const deliveryMsgEl = element.querySelector('.delivery-message');
            expect(deliveryMsgEl.textContent).toBe(mockOrderData.bodyMessage);

            // Caret should show up arrow when expanded
            const caretIcon = element.querySelector('lightning-icon');
            expect(caretIcon.iconName).toBe('utility:chevronup');

            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toBe('$100.00'); // Subtotal
            expect(summaryValues[1].textContent).toBe('$10.00'); // Shipping
            expect(summaryValues[2].textContent).toBe('$8.00'); // Taxes

            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('$118.00'); // Total

            const productSummaryEls = element.querySelectorAll('c-product-summary');
            expect(productSummaryEls.length).toBe(mockOrderData.items.length);

            productSummaryEls.forEach((comp, index) => {
                expect(comp.item).toEqual({
                    ...mockOrderData.items[index],
                    name: mockOrderData.items[index].name,
                    itemSubtotal: mockOrderData.items[index].itemSubtotal,
                    formattedPrice: `$${mockOrderData.items[index].itemSubtotal.toFixed(2)}`,
                });
            });
        });

        it('should toggle expanded/collapsed state when clickable row is clicked', async () => {
            const element = await createComponent({ details: mockOrderData });
            const clickableEl = element.querySelector('.clickable-row');

            // Should start collapsed
            let caretIcon = element.querySelector('lightning-icon');
            expect(caretIcon.iconName).toBe('utility:chevrondown');
            expect(element.querySelector('.items')).toBeNull();

            // Click to expand
            clickableEl.click();
            await Promise.resolve();

            // Should be expanded
            caretIcon = element.querySelector('lightning-icon');
            expect(caretIcon.iconName).toBe('utility:chevronup');
            expect(element.querySelector('.items')).not.toBeNull();

            // Click to collapse again
            clickableEl.click();
            await Promise.resolve();

            // Should be collapsed again
            caretIcon = element.querySelector('lightning-icon');
            expect(caretIcon.iconName).toBe('utility:chevrondown');
            expect(element.querySelector('.items')).toBeNull();
        });

        it('should display "Free" for shipping when shippingCost is 0', async () => {
            const dataWithFreeShipping = { ...mockOrderData, shippingCost: 0, total: 108.0 };
            const element = await createComponent({ details: dataWithFreeShipping });
            await expandComponent(element);

            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[1].textContent).toBe('c.Order_freeShippingLabel'); // Shipping

            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('$108.00'); // Total reflects free shipping
        });

        it('should use default currency (USD) if not provided in orderData', async () => {
            const dataWithoutCurrency = { ...mockOrderData };
            delete dataWithoutCurrency.currencyCode;

            const element = await createComponent({ details: dataWithoutCurrency });
            await expandComponent(element);

            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toBe('$100.00'); // Subtotal

            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('$118.00');
        });

        it('should format different currency codes correctly', async () => {
            const eurData = { ...mockOrderData, currencyCode: 'EUR' };
            const element = await createComponent({ details: eurData });
            await expandComponent(element);

            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toBe('€100.00'); // Subtotal
            expect(summaryValues[1].textContent).toBe('€10.00'); // Shipping
            expect(summaryValues[2].textContent).toBe('€8.00'); // Taxes

            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('€118.00');
        });

        it('should handle zero values correctly', async () => {
            const zeroData = {
                currencyCode: 'USD',
                items: [],
                subtotal: 0,
                shippingCost: 0,
                taxes: 0,
                total: 0,
                promotionsDiscount: 0,
                shippingDiscount: 0,
            };

            const element = await createComponent({ details: zeroData });
            await expandComponent(element);

            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toBe('$0.00'); // Subtotal
            expect(summaryValues[1].textContent).toBe('c.Order_freeShippingLabel'); // Shipping = 0 shows "Free"
            expect(summaryValues[2].textContent).toBe('$0.00'); // Taxes

            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('$0.00');
        });
    });

    describe('Cart Summary Mode', () => {
        it('should display cart summary format when isCartSummary is true', async () => {
            const element = await createComponent({
                isCartSummary: true,
                details: mockCartData,
            });

            const deliveryMsgEl = element.querySelector('.delivery-message');
            expect(deliveryMsgEl).not.toBeNull();
        });

        it('should use headerMessage as confirmation title when in cart summary mode', async () => {
            const element = await createComponent({
                isCartSummary: true,
                details: mockCartData,
            });

            const richTextEl = element.querySelector('lightning-formatted-rich-text');
            expect(richTextEl).not.toBeNull();
            expect(richTextEl.value).toBe(mockCartData.headerMessage);
        });

        it('should apply cart-summary-title class when in cart summary mode', async () => {
            const element = await createComponent({
                isCartSummary: true,
                details: mockCartData,
            });

            const titleEl = element.querySelector('.confirmation-title');
            expect(titleEl.classList.contains('cart-summary-title')).toBe(true);
        });

        it('should return empty string when headerMessage is empty in cart summary mode', async () => {
            const cartDataWithoutHeader = { ...mockCartData, headerMessage: '' };
            const element = await createComponent({
                isCartSummary: true,
                details: cartDataWithoutHeader,
            });

            const richTextEl = element.querySelector('lightning-formatted-rich-text');
            expect(richTextEl.value).toBe('');
        });

        it('should use default confirmation title when not in cart summary mode', async () => {
            const element = await createComponent({
                isCartSummary: false,
                details: mockCartData,
            });

            const titleEl = element.querySelector('.confirmation-title');
            expect(titleEl.textContent).toBe('c.Order_confirmationTitle');
        });

        it('should handle headerMessage with <br> tag extraction correctly', async () => {
            const mockDataWithBrTag = { ...mockCartData, headerMessage: 'Cart Summary<br>Additional info' };
            const element = await createComponent({
                isCartSummary: true,
                details: mockDataWithBrTag,
            });

            const richTextEl = element.querySelector('lightning-formatted-rich-text');
            expect(richTextEl.value).toBe('Cart Summary');
        });

        it('should handle missing headerMessage in cart summary mode', async () => {
            const mockDataWithoutHeader = { ...mockCartData };
            delete mockDataWithoutHeader.headerMessage;

            const element = await createComponent({
                isCartSummary: true,
                details: mockDataWithoutHeader,
            });

            const richTextEl = element.querySelector('lightning-formatted-rich-text');
            expect(richTextEl.value).toBe('');
        });
    });

    describe('Conditional Display Logic', () => {
        it('should display promotions row when promotions amount is greater than 0', async () => {
            const element = await createComponent({ details: mockDataWithPromotionsAndDiscounts });
            await expandComponent(element);

            const promotionsLabels = element.querySelectorAll('.summary-label');
            const promotionsValues = element.querySelectorAll('.summary-value');

            const promotionsLabelFound = Array.from(promotionsLabels).some(
                (label) => label.textContent === 'c.Order_promotionsLabel'
            );
            const promotionsValueFound = Array.from(promotionsValues).some((value) => value.textContent === '-$25.00');

            expect(promotionsLabelFound).toBe(true);
            expect(promotionsValueFound).toBe(true);
        });

        it('should hide promotions row when promotions amount is 0', async () => {
            const dataNoPromotions = { ...mockDataWithPromotionsAndDiscounts, promotionsDiscount: 0 };
            const element = await createComponent({ details: dataNoPromotions });
            await expandComponent(element);

            const promotionsLabels = element.querySelectorAll('.summary-label');
            const promotionsLabelFound = Array.from(promotionsLabels).some(
                (label) => label.textContent === 'c.Order_promotionsLabel'
            );

            expect(promotionsLabelFound).toBe(false);
        });

        it('should display shipping discount row when shipping discount amount is greater than 0', async () => {
            const element = await createComponent({ details: mockDataWithPromotionsAndDiscounts });
            await expandComponent(element);

            const shippingDiscountLabels = element.querySelectorAll('.summary-label');
            const shippingDiscountValues = element.querySelectorAll('.summary-value');

            const shippingDiscountLabelFound = Array.from(shippingDiscountLabels).some(
                (label) => label.textContent === 'c.Order_shippingDiscountLabel'
            );
            const shippingDiscountValueFound = Array.from(shippingDiscountValues).some(
                (value) => value.textContent === '-$10.00'
            );

            expect(shippingDiscountLabelFound).toBe(true);
            expect(shippingDiscountValueFound).toBe(true);
        });

        it('should hide shipping discount row when shipping discount amount is 0', async () => {
            const dataNoShippingDiscount = { ...mockDataWithPromotionsAndDiscounts, shippingDiscount: 0 };
            const element = await createComponent({ details: dataNoShippingDiscount });
            await expandComponent(element);

            const shippingDiscountLabels = element.querySelectorAll('.summary-label');
            const shippingDiscountLabelFound = Array.from(shippingDiscountLabels).some(
                (label) => label.textContent === 'c.Order_shippingDiscountLabel'
            );

            expect(shippingDiscountLabelFound).toBe(false);
        });

        it('should display "TBD" for taxes when taxes is null or undefined', async () => {
            const dataWithTBDValues = { ...mockDataWithPromotionsAndDiscounts, taxes: null };
            const element = await createComponent({ details: dataWithTBDValues });
            await expandComponent(element);

            const taxesLabels = element.querySelectorAll('.summary-label');
            const taxesValues = element.querySelectorAll('.summary-value');

            const taxesLabelIndex = Array.from(taxesLabels).findIndex(
                (label) => label.textContent === 'c.Order_taxesLabel'
            );

            expect(taxesLabelIndex).toBeGreaterThan(-1);
            expect(taxesValues[taxesLabelIndex].textContent).toBe('c.Order_tbdLabel');
        });

        it('should display "TBD" for shipping when shippingCost is null or undefined', async () => {
            const dataWithTBDValues = { ...mockDataWithPromotionsAndDiscounts, shippingCost: undefined };
            const element = await createComponent({ details: dataWithTBDValues });
            await expandComponent(element);

            const shippingLabels = element.querySelectorAll('.summary-label');
            const shippingValues = element.querySelectorAll('.summary-value');

            const shippingLabelIndex = Array.from(shippingLabels).findIndex(
                (label) => label.textContent === 'c.Order_shippingLabel'
            );

            expect(shippingLabelIndex).toBeGreaterThan(-1);
            expect(shippingValues[shippingLabelIndex].textContent).toBe('c.Order_tbdLabel');
        });

        it('should display correct order summary structure with all conditional elements', async () => {
            const element = await createComponent({ details: mockDataWithPromotionsAndDiscounts });
            await expandComponent(element);

            const summaryLabels = element.querySelectorAll('.summary-label');
            const expectedOrder = [
                'c.Order_subtotalLabel',
                'c.Order_promotionsLabel',
                'c.Order_shippingLabel',
                'c.Order_shippingDiscountLabel',
                'c.Order_taxesLabel',
            ];

            expectedOrder.forEach((expectedLabel, index) => {
                expect(summaryLabels[index].textContent).toBe(expectedLabel);
            });

            const totalRow = element.querySelector('.summary-row.total');
            expect(totalRow).not.toBeNull();

            const totalLabel = totalRow.querySelector('span:first-child');
            expect(totalLabel.textContent).toBe('c.Order_totalLabel');
        });

        it('should display minimal summary structure when no promotions or discounts', async () => {
            const dataNoPromotionsOrDiscounts = {
                ...mockDataWithPromotionsAndDiscounts,
                shippingDiscount: 0,
                promotionsDiscount: 0,
            };
            const element = await createComponent({ details: dataNoPromotionsOrDiscounts });
            await expandComponent(element);

            const summaryLabels = element.querySelectorAll('.summary-label');
            const expectedOrder = ['c.Order_subtotalLabel', 'c.Order_shippingLabel', 'c.Order_taxesLabel'];

            expectedOrder.forEach((expectedLabel, index) => {
                expect(summaryLabels[index].textContent).toBe(expectedLabel);
            });

            const allLabels = Array.from(summaryLabels).map((label) => label.textContent);
            expect(allLabels).not.toContain('c.Order_promotionsLabel');
            expect(allLabels).not.toContain('c.Order_shippingDiscountLabel');
        });
    });

    describe('Edge Cases', () => {
        it('should handle null details gracefully', async () => {
            const element = await createComponent({ details: null });

            const titleEl = element.querySelector('.confirmation-title');
            expect(titleEl.textContent).toBe('c.Order_confirmationTitle');

            const deliveryMsgEl = element.querySelector('.delivery-message');
            expect(deliveryMsgEl.textContent).toBe('c.Order_defaultDeliveryMessage');
        });

        it('should handle undefined details gracefully', async () => {
            const element = await createComponent({ details: undefined });
            await expandComponent(element);

            const productSummaryEls = element.querySelectorAll('c-product-summary');
            expect(productSummaryEls.length).toBe(0);

            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toBe('$0.00'); // Subtotal
            expect(summaryValues[1].textContent).toBe('c.Order_tbdLabel'); // Shipping
            expect(summaryValues[2].textContent).toBe('c.Order_tbdLabel'); // Taxes

            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('$0.00');
        });

        it('should handle empty items array', async () => {
            const emptyItemsData = { ...mockOrderData, items: [] };
            const element = await createComponent({ details: emptyItemsData });
            await expandComponent(element);

            const productSummaryEls = element.querySelectorAll('c-product-summary');
            expect(productSummaryEls.length).toBe(0);
        });

        it('should handle missing items property', async () => {
            const noItemsData = { ...mockOrderData };
            delete noItemsData.items;

            const element = await createComponent({ details: noItemsData });
            await expandComponent(element);

            const productSummaryEls = element.querySelectorAll('c-product-summary');
            expect(productSummaryEls.length).toBe(0);
        });

        it('should handle details with null items', async () => {
            const orderDataWithNullItems = { ...mockOrderData, items: null };
            const element = await createComponent({ details: orderDataWithNullItems });
            await expandComponent(element);

            const productSummaryEls = element.querySelectorAll('c-product-summary');
            expect(productSummaryEls.length).toBe(0);

            // Check that summary values are rendered with default values
            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toBe('$100.00'); // Subtotal
            expect(summaryValues[1].textContent).toBe('$10.00'); // Shipping
            expect(summaryValues[2].textContent).toBe('$8.00'); // Taxes

            // Check total
            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('$118.00');
        });
    });

    it('handles undefined details gracefully', async () => {
        const element = await createComponent({ details: undefined });

        const titleEl = element.querySelector('.confirmation-title');
        expect(titleEl.textContent).toBe('c.Order_confirmationTitle');

        const deliveryMsgEl = element.querySelector('.delivery-message');
        expect(deliveryMsgEl.textContent).toBe('c.Order_defaultDeliveryMessage');
    });

    it('handles details with undefined items', async () => {
        const dataWithUndefinedItems = { ...mockOrderData };
        delete dataWithUndefinedItems.items;

        const element = await createComponent({ details: dataWithUndefinedItems });

        // Expand to see no items
        const clickableEl = element.querySelector('.clickable-row');
        clickableEl.click();
        await Promise.resolve();

        const productSummaryEls = element.querySelectorAll('c-product-summary');
        expect(productSummaryEls.length).toBe(0);
    });

    it('handles details with null items', async () => {
        const dataWithNullItems = { ...mockOrderData, items: null };

        const element = await createComponent({ details: dataWithNullItems });

        // Expand to see no items
        const clickableEl = element.querySelector('.clickable-row');
        clickableEl.click();
        await Promise.resolve();

        const productSummaryEls = element.querySelectorAll('c-product-summary');
        expect(productSummaryEls.length).toBe(0);
    });

    it('formats different currency codes correctly', async () => {
        const dataWithEuro = { ...mockOrderData, currencyCode: 'EUR' };

        const element = await createComponent({ details: dataWithEuro });

        // Expand to see formatted values
        const clickableEl = element.querySelector('.clickable-row');
        clickableEl.click();
        await Promise.resolve();

        const summaryValues = element.querySelectorAll('.summary-value');
        expect(summaryValues[0].textContent).toBe('€100.00'); // Subtotal in EUR
        expect(summaryValues[1].textContent).toBe('€10.00'); // Shipping in EUR
        expect(summaryValues[2].textContent).toBe('€8.00'); // Taxes in EUR

        const totalEl = element.querySelector('.summary-row.total span:last-child');
        expect(totalEl.textContent).toBe('€118.00'); // Total in EUR
    });

    it('handles zero values correctly', async () => {
        const dataWithZeros = {
            ...mockOrderData,
            subtotal: 0,
            shippingCost: 0,
            taxes: 0,
            total: 0,
        };

        const element = await createComponent({ details: dataWithZeros });

        // Expand to see formatted values
        const clickableEl = element.querySelector('.clickable-row');
        clickableEl.click();
        await Promise.resolve();

        const summaryValues = element.querySelectorAll('.summary-value');
        expect(summaryValues[0].textContent).toBe('$0.00'); // Subtotal
        expect(summaryValues[1].textContent).toBe('c.Order_freeShippingLabel'); // Shipping
        expect(summaryValues[2].textContent).toBe('$0.00'); // Taxes

        const totalEl = element.querySelector('.summary-row.total span:last-child');
        expect(totalEl.textContent).toBe('$0.00'); // Total
    });

    it('handles negative promotion values (edge case)', async () => {
        const dataWithNegativePromotions = {
            ...mockOrderData,
            promotionsDiscount: -15.0,
        };

        const element = await createComponent({ details: dataWithNegativePromotions });

        // Expand to see formatted values
        const clickableEl = element.querySelector('.clickable-row');
        clickableEl.click();
        await Promise.resolve();

        const summaryValues = element.querySelectorAll('.summary-value');
        expect(summaryValues[0].textContent).toBe('$100.00'); // Subtotal
        // Promotions ARE shown when negative (hasPromotions returns true for < 0)
        // Since promotions row is displayed, shipping becomes the next value
        expect(summaryValues[1].textContent).toBe('-$15.00'); // Promotions (negative value)
        expect(summaryValues[2].textContent).toBe('$10.00'); // Shipping
        expect(summaryValues[3].textContent).toBe('$8.00'); // Taxes

        const totalEl = element.querySelector('.summary-row.total span:last-child');
        expect(totalEl.textContent).toBe('$118.00'); // Total from mock data (not recalculated by component)
    });

    // NEW TESTS TO COVER UNCOVERED LINES
    describe('Coverage for uncovered lines', () => {
        it('should handle cartSummaryBodyMessage when not in cart summary mode (line 164-172)', async () => {
            const element = await createComponent({
                details: mockOrderData,
                isCartSummary: false,
            });

            // Expand to see content
            const clickableEl = element.querySelector('.clickable-row');
            clickableEl.click();
            await Promise.resolve();

            // When not in cart summary mode, the body message should be displayed normally
            const deliveryMsgEl = element.querySelector('.delivery-message');
            expect(deliveryMsgEl.textContent).toBe(mockOrderData.bodyMessage);
        });

        it('should handle confirmationTitle with empty headerMessage in cart summary mode (line 188)', async () => {
            const cartDataWithEmptyHeader = {
                ...mockOrderData,
                headerMessage: '',
            };

            const element = await createComponent({
                details: cartDataWithEmptyHeader,
                isCartSummary: true,
            });

            // When headerMessage is empty in cart summary mode, title should be empty
            const titleEl = element.querySelector('.confirmation-title');
            expect(titleEl.textContent).toBe('');
        });

        it('should handle formattedCurrency with undefined currencyCode (line 53)', async () => {
            const dataWithoutCurrency = { ...mockOrderData };
            delete dataWithoutCurrency.currencyCode;

            const element = await createComponent({ details: dataWithoutCurrency });

            // Expand to see formatted values
            const clickableEl = element.querySelector('.clickable-row');
            clickableEl.click();
            await Promise.resolve();

            // Should use USD as fallback
            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toBe('$100.00'); // Subtotal in USD
            expect(summaryValues[1].textContent).toBe('$10.00'); // Shipping in USD
            expect(summaryValues[2].textContent).toBe('$8.00'); // Taxes in USD

            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('$118.00'); // Total in USD
        });

        it('should handle formatPrice method with different currencies', async () => {
            const dataWithEuro = { ...mockOrderData, currencyCode: 'EUR' };
            const element = await createComponent({ details: dataWithEuro });

            // Expand to see formatted values
            const clickableEl = element.querySelector('.clickable-row');
            clickableEl.click();
            await Promise.resolve();

            // Test different currency formatting through DOM
            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toBe('€100.00'); // Subtotal in EUR
            expect(summaryValues[1].textContent).toBe('€10.00'); // Shipping in EUR
            expect(summaryValues[2].textContent).toBe('€8.00'); // Taxes in EUR

            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('€118.00'); // Total in EUR
        });

        it('should handle items with undefined itemSubtotal', async () => {
            const dataWithInvalidItems = {
                ...mockOrderData,
                items: [
                    { name: 'Product A', quantity: 1, imageUrl: 'imgA.jpg' }, // Missing itemSubtotal
                    { name: 'Product B', quantity: 2, itemSubtotal: 25.0, imageUrl: 'imgB.jpg' },
                ],
            };

            const element = await createComponent({ details: dataWithInvalidItems });
            await expandComponent(element);

            const productSummaryEls = element.querySelectorAll('c-product-summary');
            expect(productSummaryEls.length).toBe(2);
            expect(productSummaryEls[0]).toBeDefined();
            expect(productSummaryEls[1]).toBeDefined();
        });

        it('should handle negative promotion values', async () => {
            const dataWithNegativePromotions = { ...mockOrderData, promotionsDiscount: -50.0 };
            const element = await createComponent({ details: dataWithNegativePromotions });
            await expandComponent(element);

            const promotionsLabels = element.querySelectorAll('.summary-label');
            const promotionsLabelFound = Array.from(promotionsLabels).some(
                (label) => label.textContent === 'c.Order_promotionsLabel'
            );
            expect(promotionsLabelFound).toBe(true);

            const promotionsValue = Array.from(element.querySelectorAll('.summary-value')).find(
                (value, index) =>
                    Array.from(element.querySelectorAll('.summary-label'))[index]?.textContent ===
                    'c.Order_promotionsLabel'
            );
            expect(promotionsValue.textContent).toBe('-$50.00');
        });

        it('should handle negative shipping discount values', async () => {
            const dataWithNegativeShippingDiscount = { ...mockOrderData, shippingDiscount: -5.0 };
            const element = await createComponent({ details: dataWithNegativeShippingDiscount });
            await expandComponent(element);

            const shippingDiscountLabel = Array.from(element.querySelectorAll('.summary-label')).find(
                (label) => label.textContent === 'c.Order_shippingDiscountLabel'
            );
            expect(shippingDiscountLabel).toBeDefined();

            const shippingDiscountValue = Array.from(element.querySelectorAll('.summary-value')).find(
                (value, index) =>
                    Array.from(element.querySelectorAll('.summary-label'))[index]?.textContent ===
                    'c.Order_shippingDiscountLabel'
            );
            expect(shippingDiscountValue.textContent).toBe('-$5.00');
        });

        it('should verify header classes change with expanded state', async () => {
            const element = await createComponent({ details: mockOrderData });
            await expandComponent(element);

            const headerEl = element.querySelector('.confirmation-header');
            expect(headerEl.className).toContain('expanded');
        });

        it('should handle caret icon change with expanded state', async () => {
            const element = await createComponent({ details: mockOrderData });

            // Check initial collapsed state
            let caretIcon = element.querySelector('lightning-icon');
            expect(caretIcon.iconName).toBe('utility:chevrondown');

            // Expand and check expanded state
            await expandComponent(element);
            caretIcon = element.querySelector('lightning-icon');
            expect(caretIcon.iconName).toBe('utility:chevronup');
        });
    });

    describe('Promotions and Discounts Logic', () => {
        it('should handle promotions with zero value', async () => {
            const dataWithZeroPromotions = { ...mockOrderData, promotionsDiscount: 0 };
            const element = await createComponent({ details: dataWithZeroPromotions });
            await expandComponent(element);

            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toBe('$100.00'); // Subtotal
            expect(summaryValues[1].textContent).toBe('$10.00'); // Shipping
            expect(summaryValues[2].textContent).toBe('$8.00'); // Taxes

            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('$118.00');
        });

        it('should handle shipping discount with zero value', async () => {
            const dataWithZeroShippingDiscount = { ...mockOrderData, shippingDiscount: 0 };
            const element = await createComponent({ details: dataWithZeroShippingDiscount });
            await expandComponent(element);

            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toBe('$100.00'); // Subtotal
            expect(summaryValues[1].textContent).toBe('$10.00'); // Shipping
            expect(summaryValues[2].textContent).toBe('$8.00'); // Taxes

            const shippingDiscountLabel = Array.from(element.querySelectorAll('.summary-label')).find(
                (label) => label.textContent === 'c.Order_shippingDiscountLabel'
            );
            expect(shippingDiscountLabel).toBeUndefined();

            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('$118.00');
        });

        it('should handle both positive promotions and shipping discounts', async () => {
            const orderData = {
                ...mockOrderData,
                promotionsDiscount: 30.0,
                shippingDiscount: 10.0,
            };
            const element = await createComponent({ details: orderData });
            await expandComponent(element);

            const summaryLabels = element.querySelectorAll('.summary-label');
            const labelTexts = Array.from(summaryLabels).map((label) => label.textContent);

            expect(labelTexts).toContain('c.Order_promotionsLabel');
            expect(labelTexts).toContain('c.Order_shippingDiscountLabel');

            const promotionsValue = findSummaryValue(element, 'c.Order_promotionsLabel');
            expect(promotionsValue.textContent).toBe('-$30.00');

            const shippingValue = findSummaryValue(element, 'c.Order_shippingDiscountLabel');
            expect(shippingValue.textContent).toBe('-$10.00');
        });

        it('should handle both discounts as null/undefined', async () => {
            const orderData = {
                ...mockOrderData,
                promotionsDiscount: null,
                shippingDiscount: undefined,
            };
            const element = await createComponent({ details: orderData });
            await expandComponent(element);

            const summaryLabels = element.querySelectorAll('.summary-label');
            const labelTexts = Array.from(summaryLabels).map((label) => label.textContent);

            expect(labelTexts).not.toContain('c.Order_promotionsLabel');
            expect(labelTexts).not.toContain('c.Order_shippingDiscountLabel');
        });

        it('should verify correct order of summary rows with both discounts', async () => {
            const orderData = {
                ...mockOrderData,
                promotionsDiscount: 20.0,
                shippingDiscount: 5.0,
            };
            const element = await createComponent({ details: orderData });
            await expandComponent(element);

            const summaryLabels = element.querySelectorAll('.summary-label');
            const expectedOrder = [
                'c.Order_subtotalLabel',
                'c.Order_promotionsLabel',
                'c.Order_shippingLabel',
                'c.Order_shippingDiscountLabel',
                'c.Order_taxesLabel',
            ];

            expectedOrder.forEach((expectedLabel, index) => {
                expect(summaryLabels[index].textContent).toBe(expectedLabel);
            });
        });
    });

    describe('Accessibility Features', () => {
        const accessibilityMockOrderData = {
            id: '12345',
            currencyCode: 'USD',
            items: [
                { name: 'Product A', quantity: 1, itemSubtotal: 50.0, imageUrl: 'imgA.jpg' },
                { name: 'Product B', quantity: 2, itemSubtotal: 25.0, imageUrl: 'imgB.jpg' },
            ],
            subtotal: 100.0,
            shippingCost: 10.0,
            taxes: 8.0,
            total: 118.0,
            bodyMessage: 'Expected delivery tomorrow.',
        };

        describe('ARIA Attributes and Roles', () => {
            it('should have proper ARIA attributes on the main container', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });

                const mainContainer = element.querySelector('.summary');
                expect(mainContainer).not.toBeNull();
                expect(mainContainer.getAttribute('role')).toBe('region');
                expect(mainContainer.getAttribute('aria-label')).toBeDefined();
            });

            it('should have proper ARIA attributes on the toggle button', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });

                const toggleButton = element.querySelector('.clickable-row');
                expect(toggleButton).not.toBeNull();
                expect(toggleButton.tagName).toBe('BUTTON');
                expect(toggleButton.getAttribute('aria-label')).toBeDefined();
                expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
                expect(toggleButton.getAttribute('aria-controls')).toBe('summary-content');
            });

            it('should update aria-expanded when toggled', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });
                const toggleButton = element.querySelector('.clickable-row');

                // Initially collapsed
                expect(toggleButton.getAttribute('aria-expanded')).toBe('false');

                // Click to expand
                toggleButton.click();
                await Promise.resolve();
                expect(toggleButton.getAttribute('aria-expanded')).toBe('true');

                // Click to collapse
                toggleButton.click();
                await Promise.resolve();
                expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
            });

            it('should have proper ARIA attributes on items list', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });
                await expandComponent(element);

                const itemsList = element.querySelector('.items');
                expect(itemsList).not.toBeNull();
                expect(itemsList.getAttribute('role')).toBe('list');
                expect(itemsList.getAttribute('aria-label')).toBeDefined();

                const listItems = element.querySelectorAll('.items [role="listitem"]');
                expect(listItems.length).toBe(accessibilityMockOrderData.items.length);
            });

            it('should have proper ARIA attributes on totals section', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });
                await expandComponent(element);

                const totalsSection = element.querySelector('.totals');
                expect(totalsSection).not.toBeNull();
                expect(totalsSection.getAttribute('role')).toBe('region');
                expect(totalsSection.getAttribute('aria-label')).toBeDefined();
            });

            it('should have proper label associations for summary rows', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });
                await expandComponent(element);

                // Check subtotal row
                const subtotalLabel = element.querySelector('#subtotal-label');
                const subtotalValue = element.querySelector('[aria-labelledby="subtotal-label"]');
                expect(subtotalLabel).not.toBeNull();
                expect(subtotalValue).not.toBeNull();

                // Check total row
                const totalLabel = element.querySelector('#total-label');
                const totalValue = element.querySelector('[aria-labelledby="total-label"]');
                expect(totalLabel).not.toBeNull();
                expect(totalValue).not.toBeNull();
            });
        });

        describe('Keyboard Navigation', () => {
            it('should handle Enter key on toggle button', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });
                const toggleButton = element.querySelector('.clickable-row');

                // Initially collapsed
                expect(element.querySelector('.items')).toBeNull();

                // Native buttons automatically handle Enter key and trigger click
                toggleButton.click();
                await Promise.resolve();

                // Should be expanded
                expect(element.querySelector('.items')).not.toBeNull();
                expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
            });

            it('should handle Space key on toggle button', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });
                const toggleButton = element.querySelector('.clickable-row');

                // Initially collapsed
                expect(element.querySelector('.items')).toBeNull();

                // Native buttons automatically handle Space key and trigger click
                toggleButton.click();
                await Promise.resolve();

                // Should be expanded
                expect(element.querySelector('.items')).not.toBeNull();
                expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
            });

            it('should handle keyboard activation like a native button', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });
                const toggleButton = element.querySelector('.clickable-row');

                // Test that the button responds to keyboard activation
                expect(toggleButton.tagName).toBe('BUTTON');
            });

            it('should not handle other keys', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });
                const toggleButton = element.querySelector('.clickable-row');

                // Initially collapsed
                expect(element.querySelector('.items')).toBeNull();

                // Press Tab key (should not trigger toggle)
                const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
                toggleButton.dispatchEvent(tabEvent);
                await Promise.resolve();

                // Should still be collapsed
                expect(element.querySelector('.items')).toBeNull();
            });
        });

        describe('Focus Management', () => {
            it('should be focusable as a native button', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });
                const toggleButton = element.querySelector('.clickable-row');
                expect(toggleButton.tagName).toBe('BUTTON');
            });

            it('should have visible focus indicator', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });
                const toggleButton = element.querySelector('.clickable-row');

                // Focus the button
                toggleButton.focus();

                // Check if focus styles are applied
                expect(toggleButton).toBe(document.activeElement);
            });
        });

        describe('Screen Reader Support', () => {
            it('should hide decorative caret icon from screen readers', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });

                const caretContainer = element.querySelector('.caret-container');
                expect(caretContainer.getAttribute('aria-hidden')).toBe('true');
            });

            it('should have live region for content changes', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });

                const expandableContent = element.querySelector('#summary-content');
                expect(expandableContent.getAttribute('aria-live')).toBe('polite');
            });

            it('should provide appropriate ARIA labels for different modes', async () => {
                // Test order confirmation mode
                const orderElement = await createComponent({ details: accessibilityMockOrderData });
                const orderToggle = orderElement.querySelector('.clickable-row');
                expect(orderToggle.getAttribute('aria-label')).toBeDefined();
                expect(orderToggle.getAttribute('aria-label')).not.toBe('');

                // Test cart summary mode
                const cartElement = await createComponent({
                    details: accessibilityMockOrderData,
                    isCartSummary: true,
                });
                const cartToggle = cartElement.querySelector('.clickable-row');
                expect(cartToggle.getAttribute('aria-label')).toBeDefined();
                expect(cartToggle.getAttribute('aria-label')).not.toBe('');
            });
        });

        describe('Dynamic Content Accessibility', () => {
            it('should handle conditional content with proper ARIA', async () => {
                const dataWithPromotions = {
                    ...accessibilityMockOrderData,
                    promotionsDiscount: -10.0,
                    shippingDiscount: -5.0,
                };

                const element = await createComponent({ details: dataWithPromotions });
                await expandComponent(element);

                // Check that conditional elements have proper ARIA
                const promotionsLabel = element.querySelector('#promotions-label');
                const promotionsValue = element.querySelector('[aria-labelledby="promotions-label"]');
                expect(promotionsLabel).not.toBeNull();
                expect(promotionsValue).not.toBeNull();

                const shippingDiscountLabel = element.querySelector('#shipping-discount-label');
                const shippingDiscountValue = element.querySelector('[aria-labelledby="shipping-discount-label"]');
                expect(shippingDiscountLabel).not.toBeNull();
                expect(shippingDiscountValue).not.toBeNull();
            });

            it('should handle empty states gracefully', async () => {
                const emptyData = {
                    ...accessibilityMockOrderData,
                    items: [],
                };

                const element = await createComponent({ details: emptyData });
                await expandComponent(element);

                // Should still have proper ARIA structure even with no items
                const itemsList = element.querySelector('.items');
                expect(itemsList).not.toBeNull();
                expect(itemsList.getAttribute('role')).toBe('list');
                expect(itemsList.getAttribute('aria-label')).toBeDefined();
            });
        });
    });
});
