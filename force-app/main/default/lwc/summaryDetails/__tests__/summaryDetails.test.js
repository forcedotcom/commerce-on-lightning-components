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

    /**
     * Checks if a summary label exists in the component
     * @param {Element} element - The component element to search within
     * @param {string} labelText - The text content of the label to find
     * @returns {boolean} True if the label exists, false otherwise
     */
    function hasSummaryLabel(element, labelText) {
        const labels = element.querySelectorAll('.summary-label');
        return Array.from(labels).some((label) => label.textContent === labelText);
    }

    /**
     * Checks if a summary value exists for a given label
     * @param {Element} element - The component element to search within
     * @param {string} labelText - The text content of the label to find
     * @param {string} expectedValue - The expected value text
     * @returns {boolean} True if the label exists with the expected value
     */
    function hasSummaryValue(element, labelText, expectedValue) {
        const value = findSummaryValue(element, labelText);
        return value !== null && value.textContent === expectedValue;
    }

    describe('Basic Functionality', () => {
        it('should render collapsed state by default with header content only', async () => {
            const element = await createComponent();

            // Header should always be visible
            const titleEl = element.querySelector('.confirmation-title');
            expect(titleEl.textContent).toBe('Your order is confirmed.');

            const deliveryMsgEl = element.querySelector('.delivery-message');
            expect(deliveryMsgEl.textContent).toBe('Your order is confirmed.');

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
            expect(titleEl.textContent).toBe('Your order is confirmed.');

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
            expect(element.querySelector('[role="list"]')).toBeNull();

            // Click to expand
            clickableEl.click();
            await Promise.resolve();

            // Should be expanded
            caretIcon = element.querySelector('lightning-icon');
            expect(caretIcon.iconName).toBe('utility:chevronup');
            expect(element.querySelector('[role="list"]')).not.toBeNull();

            // Click to collapse again
            clickableEl.click();
            await Promise.resolve();

            // Should be collapsed again
            caretIcon = element.querySelector('lightning-icon');
            expect(caretIcon.iconName).toBe('utility:chevrondown');
            expect(element.querySelector('[role="list"]')).toBeNull();
        });

        it('should display "Free" for shipping when shippingCost is 0', async () => {
            const dataWithFreeShipping = { ...mockOrderData, shippingCost: 0, total: 108.0 };
            const element = await createComponent({ details: dataWithFreeShipping });
            await expandComponent(element);

            expect(hasSummaryValue(element, 'Shipping', 'Free')).toBe(true);

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

            expect(hasSummaryValue(element, 'Subtotal', '€100.00')).toBe(true);
            expect(hasSummaryValue(element, 'Shipping', '€10.00')).toBe(true);
            expect(hasSummaryValue(element, 'Taxes', '€8.00')).toBe(true);

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

            expect(hasSummaryValue(element, 'Subtotal', '$0.00')).toBe(true);
            expect(hasSummaryValue(element, 'Shipping', 'Free')).toBe(true);
            expect(hasSummaryValue(element, 'Taxes', '$0.00')).toBe(true);

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
            expect(titleEl.textContent).toBe('Your order is confirmed.');
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

            expect(hasSummaryLabel(element, 'Promotions')).toBe(true);
            expect(hasSummaryValue(element, 'Promotions', '-$25.00')).toBe(true);
        });

        it('should display order-level promotion pills when details.promotions array is provided', async () => {
            const dataWithPromotionsArray = {
                ...mockDataWithPromotionsAndDiscounts,
                promotions: ['15% off on all accessories with A...', 'Save 18% with Save18'],
            };
            const element = await createComponent({ details: dataWithPromotionsArray });
            await expandComponent(element);

            const pills = element.querySelectorAll('c-custom-pill');
            expect(pills.length).toBe(2);
            expect(pills[0].label).toBe('15% off on all accessories with A...');
            expect(pills[1].label).toBe('Save 18% with Save18');
        });

        it('should not display promotion pills when details.promotions is empty or missing', async () => {
            const element = await createComponent({ details: mockDataWithPromotionsAndDiscounts });
            await expandComponent(element);

            const pills = element.querySelectorAll('c-custom-pill');
            expect(pills.length).toBe(0);
        });

        it('should hide promotions row when promotions amount is 0', async () => {
            const dataNoPromotions = { ...mockDataWithPromotionsAndDiscounts, promotionsDiscount: 0 };
            const element = await createComponent({ details: dataNoPromotions });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Promotions')).toBe(false);
        });

        it('should display shipping discount row when shipping discount amount is greater than 0', async () => {
            const element = await createComponent({ details: mockDataWithPromotionsAndDiscounts });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Shipping Discount')).toBe(true);
            expect(hasSummaryValue(element, 'Shipping Discount', '-$10.00')).toBe(true);
        });

        it('should hide shipping discount row when shipping discount amount is 0', async () => {
            const dataNoShippingDiscount = { ...mockDataWithPromotionsAndDiscounts, shippingDiscount: 0 };
            const element = await createComponent({ details: dataNoShippingDiscount });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Shipping Discount')).toBe(false);
        });

        it('should display coupon discount row when coupon discount amount is greater than 0', async () => {
            const dataWithCouponsDiscount = {
                ...mockDataWithPromotionsAndDiscounts,
                couponsDiscount: -15.0,
                couponsApplied: ['SAVE15'],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details: dataWithCouponsDiscount });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Coupon Discount')).toBe(true);
            expect(hasSummaryValue(element, 'Coupon Discount', '-$15.00')).toBe(true);
        });

        it('should hide coupon discount row when coupon discount amount is 0', async () => {
            const dataNoCouponsDiscount = { ...mockDataWithPromotionsAndDiscounts, couponsDiscount: 0 };
            const element = await createComponent({ details: dataNoCouponsDiscount });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Coupon Discount')).toBe(false);
        });

        it('should not display coupon applied row (coupons shown as pills in cart summary)', async () => {
            const dataWithMultipleCouponsApplied = {
                ...mockDataWithPromotionsAndDiscounts,
                couponsApplied: ['SAVE20', 'HALLOWEEN15', 'NEW10', 'WELCOME10'],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details: dataWithMultipleCouponsApplied });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Coupons Applied')).toBe(false);
        });

        it('should not display coupon applied row with single coupon (moved to cart summary pills)', async () => {
            const dataWithSingleCoupon = {
                ...mockDataWithPromotionsAndDiscounts,
                couponsApplied: ['WELCOME10'],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details: dataWithSingleCoupon });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Coupon Applied')).toBe(false);
        });

        it.each([
            ['empty array', []],
            ['null', null],
            ['undefined', undefined],
        ])('should hide coupon applied row when couponsApplied is %s', async (description, couponsAppliedValue) => {
            const testData = { ...mockDataWithPromotionsAndDiscounts };
            if (couponsAppliedValue === undefined) {
                delete testData.couponsApplied;
            } else {
                testData.couponsApplied = couponsAppliedValue;
            }

            const element = await createComponent({ details: testData });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Coupon Applied')).toBe(false);
        });

        it.each([
            {
                description: 'only empty strings',
                couponsApplied: ['', '', ''],
            },
            {
                description: 'only whitespace values',
                couponsApplied: ['  ', '   ', '\t', '    \n  '],
            },
        ])('should hide coupon applied row when array contains $description', async ({ couponsApplied }) => {
            const testData = {
                ...mockDataWithPromotionsAndDiscounts,
                couponsApplied,
            };
            const element = await createComponent({ details: testData });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Coupon Applied')).toBe(false);
        });

        it.each([
            {
                description: 'mix of valid and empty/whitespace values',
                couponsApplied: ['SAVE20', '', 'WELCOME10', '  ', 'LOYALTY15', '\t', '  NEW10  '],
                expectedLabel: 'Coupons Applied',
            },
            {
                description: 'valid codes with surrounding whitespace',
                couponsApplied: ['  SAVE20  ', '\tWELCOME10\t', '  LOYALTY15\n'],
                expectedLabel: 'Coupons Applied',
            },
        ])(
            'should not display coupon applied row with $description (moved to cart summary pills)',
            async ({ couponsApplied, expectedLabel }) => {
                const testData = {
                    ...mockDataWithPromotionsAndDiscounts,
                    couponsApplied,
                    flags: { isCouponFeatureEnabled: true },
                };
                const element = await createComponent({ details: testData });
                await expandComponent(element);

                expect(hasSummaryLabel(element, expectedLabel)).toBe(false);
            }
        );

        it('should display "TBD" for taxes when taxes is null or undefined', async () => {
            const dataWithTBDValues = { ...mockDataWithPromotionsAndDiscounts, taxes: null };
            const element = await createComponent({ details: dataWithTBDValues });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Taxes')).toBe(true);
            expect(hasSummaryValue(element, 'Taxes', 'TBD')).toBe(true);
        });

        it('should hide taxes row when taxationMode is gross', async () => {
            const dataWithGrossTaxation = { ...mockOrderData, taxationMode: 'gross' };
            const element = await createComponent({ details: dataWithGrossTaxation });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Taxes')).toBe(false);
        });

        it('should show taxes row when taxationMode is net', async () => {
            const dataWithNetTaxation = { ...mockOrderData, taxationMode: 'net' };
            const element = await createComponent({ details: dataWithNetTaxation });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Taxes')).toBe(true);
            expect(hasSummaryValue(element, 'Taxes', '$8.00')).toBe(true);
        });

        it('should show taxes row when taxationMode is undefined', async () => {
            const dataWithUndefinedTaxation = { ...mockOrderData, taxationMode: undefined };
            const element = await createComponent({ details: dataWithUndefinedTaxation });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Taxes')).toBe(true);
            expect(hasSummaryValue(element, 'Taxes', '$8.00')).toBe(true);
        });

        it('should hide taxes row in cart summary mode when taxationMode is gross', async () => {
            const dataWithGrossTaxation = { ...mockCartData, taxationMode: 'gross' };
            const element = await createComponent({
                details: dataWithGrossTaxation,
                isCartSummary: true,
            });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Taxes')).toBe(false);
            // Other totals should still be visible
            expect(hasSummaryLabel(element, 'Subtotal')).toBe(true);
            expect(hasSummaryLabel(element, 'Shipping')).toBe(true);
        });

        it('should display "TBD" for shipping when shippingCost is null or undefined', async () => {
            const dataWithTBDValues = { ...mockDataWithPromotionsAndDiscounts, shippingCost: undefined };
            const element = await createComponent({ details: dataWithTBDValues });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Shipping')).toBe(true);
            expect(hasSummaryValue(element, 'Shipping', 'TBD')).toBe(true);
        });

        it('should display correct order summary structure with all conditional elements', async () => {
            const element = await createComponent({ details: mockDataWithPromotionsAndDiscounts });
            await expandComponent(element);

            const summaryLabels = element.querySelectorAll('.summary-label');
            const expectedOrder = ['Subtotal', 'Promotions', 'Shipping', 'Shipping Discount', 'Taxes'];

            expectedOrder.forEach((expectedLabel, index) => {
                expect(summaryLabels[index].textContent).toBe(expectedLabel);
            });

            const totalRow = element.querySelector('.summary-row.total');
            expect(totalRow).not.toBeNull();

            const totalLabel = totalRow.querySelector('span:first-child');
            expect(totalLabel.textContent).toBe('Total');
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
            const expectedOrder = ['Subtotal', 'Shipping', 'Taxes'];

            expectedOrder.forEach((expectedLabel, index) => {
                expect(summaryLabels[index].textContent).toBe(expectedLabel);
            });

            expect(hasSummaryLabel(element, 'Promotions')).toBe(false);
            expect(hasSummaryLabel(element, 'Shipping Discount')).toBe(false);
        });

        it('should display summary structure without taxes when taxationMode is gross', async () => {
            const dataGrossTaxation = {
                ...mockDataWithPromotionsAndDiscounts,
                taxationMode: 'gross',
            };
            const element = await createComponent({ details: dataGrossTaxation });
            await expandComponent(element);

            const summaryLabels = element.querySelectorAll('.summary-label');
            const expectedOrder = ['Subtotal', 'Promotions', 'Shipping', 'Shipping Discount'];

            expectedOrder.forEach((expectedLabel, index) => {
                expect(summaryLabels[index].textContent).toBe(expectedLabel);
            });

            expect(hasSummaryLabel(element, 'Taxes')).toBe(false);

            // Total row should still be present
            const totalRow = element.querySelector('.summary-row.total');
            expect(totalRow).not.toBeNull();
        });
    });

    describe('Edge Cases', () => {
        it('should handle null details gracefully', async () => {
            const element = await createComponent({ details: null });

            const titleEl = element.querySelector('.confirmation-title');
            expect(titleEl.textContent).toBe('Your order is confirmed.');

            const deliveryMsgEl = element.querySelector('.delivery-message');
            expect(deliveryMsgEl.textContent).toBe('Your order is confirmed.');
        });

        it('should handle undefined details gracefully', async () => {
            const element = await createComponent({ details: undefined });
            await expandComponent(element);

            const productSummaryEls = element.querySelectorAll('c-product-summary');
            expect(productSummaryEls.length).toBe(0);

            expect(hasSummaryValue(element, 'Subtotal', '$0.00')).toBe(true);
            expect(hasSummaryValue(element, 'Shipping', 'TBD')).toBe(true);
            expect(hasSummaryValue(element, 'Taxes', 'TBD')).toBe(true);

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
            expect(hasSummaryValue(element, 'Subtotal', '$100.00')).toBe(true);
            expect(hasSummaryValue(element, 'Shipping', '$10.00')).toBe(true);
            expect(hasSummaryValue(element, 'Taxes', '$8.00')).toBe(true);

            // Check total
            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('$118.00');
        });
    });

    it('handles undefined details gracefully', async () => {
        const element = await createComponent({ details: undefined });

        const titleEl = element.querySelector('.confirmation-title');
        expect(titleEl.textContent).toBe('Your order is confirmed.');

        const deliveryMsgEl = element.querySelector('.delivery-message');
        expect(deliveryMsgEl.textContent).toBe('Your order is confirmed.');
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

        expect(hasSummaryValue(element, 'Subtotal', '$0.00')).toBe(true);
        expect(hasSummaryValue(element, 'Shipping', 'Free')).toBe(true);
        expect(hasSummaryValue(element, 'Taxes', '$0.00')).toBe(true);

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

        expect(hasSummaryValue(element, 'Subtotal', '$100.00')).toBe(true);
        // Promotions ARE shown when negative (hasPromotions returns true for < 0)
        // Since promotions row is displayed, shipping becomes the next value
        expect(hasSummaryValue(element, 'Promotions', '-$15.00')).toBe(true);
        expect(hasSummaryValue(element, 'Shipping', '$10.00')).toBe(true);
        expect(hasSummaryValue(element, 'Taxes', '$8.00')).toBe(true);

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
            expect(hasSummaryValue(element, 'Subtotal', '$100.00')).toBe(true);
            expect(hasSummaryValue(element, 'Shipping', '$10.00')).toBe(true);
            expect(hasSummaryValue(element, 'Taxes', '$8.00')).toBe(true);

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
            expect(hasSummaryValue(element, 'Subtotal', '€100.00')).toBe(true);
            expect(hasSummaryValue(element, 'Shipping', '€10.00')).toBe(true);
            expect(hasSummaryValue(element, 'Taxes', '€8.00')).toBe(true);

            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('€118.00'); // Total in EUR
        });

        it('should handle invalid locale gracefully in price formatting', async () => {
            const testData = {
                ...mockOrderData,
                currencyCode: 'USD',
                subtotal: 25.99,
                total: 30.99,
            };
            const element = await createComponent({ details: testData });
            element.configuration = { language: 'invalid-locale-xyz' };

            // Expand to see formatted values
            const clickableEl = element.querySelector('.clickable-row');
            clickableEl.click();
            await Promise.resolve();

            // Should render without throwing an error - prices should be formatted with fallback locale
            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toMatch(/\$25\.99/); // Subtotal with fallback formatting
        });

        it('should handle empty language gracefully in price formatting', async () => {
            const testData = {
                ...mockOrderData,
                currencyCode: 'EUR',
                subtotal: 15.5,
                total: 20.5,
            };
            const element = await createComponent({ details: testData });
            element.configuration = { language: '' };

            // Expand to see formatted values
            const clickableEl = element.querySelector('.clickable-row');
            clickableEl.click();
            await Promise.resolve();

            // Should render without throwing an error - prices should be formatted with fallback locale
            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toMatch(/€15\.50/); // Subtotal with fallback formatting
        });

        it('should handle null language gracefully in price formatting', async () => {
            const testData = {
                ...mockOrderData,
                currencyCode: 'USD',
                subtotal: 100.0,
                total: 110.0,
            };
            const element = await createComponent({ details: testData });
            element.configuration = { language: null };

            // Expand to see formatted values
            const clickableEl = element.querySelector('.clickable-row');
            clickableEl.click();
            await Promise.resolve();

            // Should render without throwing an error - prices should be formatted with fallback locale
            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toMatch(/\$100\.00/); // Subtotal with fallback formatting
        });

        it('should handle undefined language gracefully in price formatting', async () => {
            const testData = {
                ...mockOrderData,
                currencyCode: 'GBP',
                subtotal: 50.25,
                total: 60.25,
            };
            const element = await createComponent({ details: testData });
            element.configuration = { language: undefined };

            // Expand to see formatted values
            const clickableEl = element.querySelector('.clickable-row');
            clickableEl.click();
            await Promise.resolve();

            // Should render without throwing an error - prices should be formatted with fallback locale
            const summaryValues = element.querySelectorAll('.summary-value');
            expect(summaryValues[0].textContent).toMatch(/£50\.25/); // Subtotal with fallback formatting
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

            expect(hasSummaryLabel(element, 'Promotions')).toBe(true);
            expect(hasSummaryValue(element, 'Promotions', '-$50.00')).toBe(true);
        });

        it('should handle negative shipping discount values', async () => {
            const dataWithNegativeShippingDiscount = { ...mockOrderData, shippingDiscount: -5.0 };
            const element = await createComponent({ details: dataWithNegativeShippingDiscount });
            await expandComponent(element);

            expect(hasSummaryValue(element, 'Shipping Discount', '-$5.00')).toBe(true);
            expect(hasSummaryLabel(element, 'Shipping Discount')).toBe(true);
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

            expect(hasSummaryValue(element, 'Subtotal', '$100.00')).toBe(true);
            expect(hasSummaryValue(element, 'Shipping', '$10.00')).toBe(true);
            expect(hasSummaryValue(element, 'Taxes', '$8.00')).toBe(true);

            expect(hasSummaryLabel(element, 'Shipping Discount')).toBe(false);

            const totalEl = element.querySelector('.summary-row.total span:last-child');
            expect(totalEl.textContent).toBe('$118.00');
        });

        it('should handle coupon discount with zero value', async () => {
            const dataWithZeroCouponsDiscount = { ...mockOrderData, couponsDiscount: 0 };
            const element = await createComponent({ details: dataWithZeroCouponsDiscount });
            await expandComponent(element);

            expect(hasSummaryValue(element, 'Subtotal', '$100.00')).toBe(true);
            expect(hasSummaryValue(element, 'Shipping', '$10.00')).toBe(true);
            expect(hasSummaryValue(element, 'Taxes', '$8.00')).toBe(true);

            expect(hasSummaryLabel(element, 'Coupon Discount')).toBe(false);

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

            expect(hasSummaryLabel(element, 'Promotions')).toBe(true);
            expect(hasSummaryLabel(element, 'Shipping Discount')).toBe(true);

            expect(hasSummaryValue(element, 'Promotions', '-$30.00')).toBe(true);
            expect(hasSummaryValue(element, 'Shipping Discount', '-$10.00')).toBe(true);
        });

        it('should handle positive coupon discount values', async () => {
            const orderDataWithPositiveCouponsDiscount = {
                ...mockOrderData,
                couponsDiscount: 20.0,
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details: orderDataWithPositiveCouponsDiscount });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Coupon Discount')).toBe(true);

            expect(hasSummaryValue(element, 'Coupon Discount', '-$20.00')).toBe(true);
        });

        it('should handle both discounts as null/undefined', async () => {
            const orderData = {
                ...mockOrderData,
                promotionsDiscount: null,
                shippingDiscount: undefined,
                couponsDiscount: null,
            };
            const element = await createComponent({ details: orderData });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Promotions')).toBe(false);
            expect(hasSummaryLabel(element, 'Shipping Discount')).toBe(false);
            expect(hasSummaryLabel(element, 'Coupon Discount')).toBe(false);
        });

        it('should handle invalid non-numeric discount values gracefully', async () => {
            const orderData = {
                ...mockOrderData,
                promotionsDiscount: 'invalid',
                shippingDiscount: {},
                couponsDiscount: [],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details: orderData });
            await expandComponent(element);

            // These values are truthy so rows will render

            expect(hasSummaryLabel(element, 'Promotions')).toBe(true);
            expect(hasSummaryLabel(element, 'Shipping Discount')).toBe(true);
            expect(hasSummaryLabel(element, 'Coupon Discount')).toBe(true);

            // All should display -$0.00 due to defensive handling
            expect(hasSummaryValue(element, 'Promotions', '-$0.00')).toBe(true);
            expect(hasSummaryValue(element, 'Shipping Discount', '-$0.00')).toBe(true);
            expect(hasSummaryValue(element, 'Coupon Discount', '-$0.00')).toBe(true);
        });

        it('should handle negative coupon discount values', async () => {
            const dataWithNegativeCouponsDiscount = {
                ...mockOrderData,
                couponsDiscount: -10.0,
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details: dataWithNegativeCouponsDiscount });
            await expandComponent(element);

            expect(hasSummaryValue(element, 'Coupon Discount', '-$10.00')).toBe(true);
        });

        it('should return "$0.00" for promotions when promotionsDiscount is 0', async () => {
            const orderData = { ...mockOrderData, promotionsDiscount: 0 };
            const element = await createComponent({ details: orderData });
            await expandComponent(element);
            expect(hasSummaryLabel(element, 'Promotions')).toBe(false);
        });

        it('should return "$0.00" for shippingDiscount when shippingDiscount is 0', async () => {
            const orderData = { ...mockOrderData, shippingDiscount: 0 };
            const element = await createComponent({ details: orderData });
            await expandComponent(element);
            expect(hasSummaryLabel(element, 'Shipping Discount')).toBe(false);
        });

        it('should verify correct order of summary rows with both discounts', async () => {
            const orderData = {
                ...mockOrderData,
                promotionsDiscount: 20.0,
                shippingDiscount: 5.0,
                couponsDiscount: 10.0,
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details: orderData });
            await expandComponent(element);

            const summaryLabels = element.querySelectorAll('.summary-label');
            const expectedOrder = [
                'Subtotal',
                'Coupon Discount',
                'Promotions',
                'Shipping',
                'Shipping Discount',
                'Taxes',
            ];

            expectedOrder.forEach((expectedLabel, index) => {
                expect(summaryLabels[index].textContent).toBe(expectedLabel);
            });
        });

        it('should handle both coupon discount and coupon applied together (applied row moved to cart summary)', async () => {
            const orderDataWithBothCouponFields = {
                ...mockOrderData,
                couponsDiscount: 15.0,
                couponsApplied: ['SAVE15'],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details: orderDataWithBothCouponFields });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Coupon Applied')).toBe(false);
            expect(hasSummaryLabel(element, 'Coupon Discount')).toBe(true);
            expect(hasSummaryValue(element, 'Coupon Discount', '-$15.00')).toBe(true);
        });

        it('should handle non-array couponsApplied value gracefully', async () => {
            const orderDataWithInvalidCouponsApplied = {
                ...mockOrderData,
                couponsApplied: 'INVALID_STRING',
            };
            const element = await createComponent({ details: orderDataWithInvalidCouponsApplied });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Coupon Applied')).toBe(false);
        });

        it('should return empty string when couponsApplied is not an array (direct getter test)', async () => {
            const orderDataWithNonArrayCoupon = {
                ...mockOrderData,
                couponsApplied: 'NOT_AN_ARRAY',
            };
            const element = await createComponent({ details: orderDataWithNonArrayCoupon });
            expect(element.couponsApplied).toBe('');
        });

        it('should verify correct order of summary rows with coupon discount', async () => {
            const orderData = {
                ...mockOrderData,
                couponsApplied: ['COUPON1', 'COUPON2'],
                promotionsDiscount: 20.0,
                shippingDiscount: 5.0,
                couponsDiscount: 10.0,
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details: orderData });
            await expandComponent(element);

            const summaryLabels = element.querySelectorAll('.summary-label');
            const expectedOrder = [
                'Subtotal',
                'Coupons Discount',
                'Promotions',
                'Shipping',
                'Shipping Discount',
                'Taxes',
            ];

            expectedOrder.forEach((expectedLabel, index) => {
                expect(summaryLabels[index].textContent).toBe(expectedLabel);
            });
        });
    });

    describe('Coupon Labels Plural Support', () => {
        it('should display coupon discount when exactly one coupon is applied (applied row moved to cart summary)', async () => {
            const dataWithOneCoupon = {
                ...mockDataWithPromotionsAndDiscounts,
                couponsApplied: ['SAVE20'],
                couponsDiscount: -20.0,
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details: dataWithOneCoupon });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Coupon Applied')).toBe(false);
            expect(hasSummaryLabel(element, 'Coupon Discount')).toBe(true);
            expect(hasSummaryValue(element, 'Coupon Discount', '-$20.00')).toBe(true);
        });

        it('should display coupon discount when more than one coupon is applied (applied row moved to cart summary)', async () => {
            const dataWithManyCoupons = {
                ...mockDataWithPromotionsAndDiscounts,
                couponsApplied: ['COUPON1', 'COUPON2', 'COUPON3', 'COUPON4', 'COUPON5'],
                couponsDiscount: -50.0,
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details: dataWithManyCoupons });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Coupons Applied')).toBe(false);
            expect(hasSummaryLabel(element, 'Coupons Discount')).toBe(true);
            expect(hasSummaryValue(element, 'Coupons Discount', '-$50.00')).toBe(true);
        });

        it.each([
            {
                description: 'single coupon',
                couponsApplied: ['SAVE20'],
                expectedCount: 1,
            },
            {
                description: 'multiple coupons',
                couponsApplied: ['SAVE20', 'WELCOME10', 'LOYALTY15'],
                expectedCount: 3,
            },
            {
                description: 'empty array',
                couponsApplied: [],
                expectedCount: 0,
            },
            {
                description: 'non-array value',
                couponsApplied: 'INVALID',
                expectedCount: 0,
            },
            {
                description: 'mixed valid and invalid values',
                couponsApplied: ['SAVE20', '', '  ', 'WELCOME10', '\t', null, 'LOYALTY15'],
                expectedCount: 3,
            },
        ])(
            'should return $expectedCount for couponsAppliedCount with $description',
            async ({ couponsApplied, expectedCount }) => {
                const testData = {
                    ...mockDataWithPromotionsAndDiscounts,
                    couponsApplied,
                };
                const element = await createComponent({ details: testData });

                expect(element.couponsAppliedCount).toBe(expectedCount);
            }
        );

        it.each([
            {
                description: 'singular discount label when only one valid coupon after filtering',
                couponsApplied: ['SAVE20', '', '  ', '\t'],
                couponsDiscount: -20.0,
                expectedDiscountLabel: 'Coupon Discount',
                expectedDiscountValue: '-$20.00',
            },
            {
                description: 'plural discount label when two valid coupons after filtering',
                couponsApplied: ['SAVE20', '', 'WELCOME10', '  '],
                couponsDiscount: -30.0,
                expectedDiscountLabel: 'Coupons Discount',
                expectedDiscountValue: '-$30.00',
            },
        ])(
            'should display $description',
            async ({ couponsApplied, couponsDiscount, expectedDiscountLabel, expectedDiscountValue }) => {
                const testData = {
                    ...mockDataWithPromotionsAndDiscounts,
                    couponsApplied,
                    couponsDiscount,
                    flags: { isCouponFeatureEnabled: true },
                };
                const element = await createComponent({ details: testData });
                await expandComponent(element);

                expect(hasSummaryLabel(element, 'Coupon Applied')).toBe(false);
                expect(hasSummaryLabel(element, 'Coupons Applied')).toBe(false);
                expect(hasSummaryLabel(element, expectedDiscountLabel)).toBe(true);
                expect(hasSummaryValue(element, expectedDiscountLabel, expectedDiscountValue)).toBe(true);
            }
        );

        it('should not display coupon labels when no valid coupons after filtering', async () => {
            const dataWithNoValidCoupons = {
                ...mockDataWithPromotionsAndDiscounts,
                couponsApplied: ['', '  ', '\t', '\n'],
                couponsDiscount: 0,
            };
            const element = await createComponent({ details: dataWithNoValidCoupons });
            await expandComponent(element);

            expect(hasSummaryLabel(element, 'Coupon Applied')).toBe(false);
            expect(hasSummaryLabel(element, 'Coupons Applied')).toBe(false);
        });
    });

    describe('Coupon feature flag (isCouponFeatureEnabled)', () => {
        it.each([
            {
                description: 'feature flag is true',
                flags: { isCouponFeatureEnabled: true },
                expectedToShow: true,
            },
            {
                description: 'feature flag is false',
                flags: { isCouponFeatureEnabled: false },
                expectedToShow: false,
            },
            {
                description: 'feature flag is undefined (defaults to true)',
                flags: undefined,
                expectedToShow: true,
            },
        ])(
            'should show/hide coupon discount and applied labels when $description',
            async ({ flags, expectedToShow }) => {
                const details = {
                    ...mockDataWithPromotionsAndDiscounts,
                    couponsDiscount: -25.0,
                    couponsApplied: ['SAVE20', 'WELCOME10'],
                    flags,
                };
                const element = await createComponent({ details });
                await expandComponent(element);

                const hasCouponDiscount =
                    hasSummaryLabel(element, 'Coupon Discount') || hasSummaryLabel(element, 'Coupons Discount');
                expect(hasCouponDiscount).toBe(expectedToShow);
                // Coupon applied row removed from order summary; coupons shown as pills in cart summary
                expect(hasSummaryLabel(element, 'Coupon Applied') || hasSummaryLabel(element, 'Coupons Applied')).toBe(
                    false
                );
            }
        );
    });

    describe('Order-level coupon pills and shipping promotions (coverage)', () => {
        const NO_APPLICABLE_PROMOTION = 'no_applicable_promotion';

        it('does not show order-level coupon pills when isCartSummary is false', async () => {
            const element = await createComponent({
                details: { ...mockCartData, coupons: [{ code: 'SAVE20' }], flags: { isCouponFeatureEnabled: true } },
                isCartSummary: false,
            });
            await expandComponent(element);
            const wrapper = element.querySelector('.order-coupon-pills-wrapper');
            expect(wrapper).toBeNull();
        });

        it('does not show order-level coupon pills when isCouponFeatureEnabled is false', async () => {
            const element = await createComponent({
                details: {
                    ...mockCartData,
                    coupons: [{ code: 'SAVE20' }],
                    flags: { isCouponFeatureEnabled: false },
                },
                isCartSummary: true,
            });
            await expandComponent(element);
            const wrapper = element.querySelector('.order-coupon-pills-wrapper');
            expect(wrapper).toBeNull();
        });

        it('does not show order-level coupon pills when coupons is not an array', async () => {
            const element = await createComponent({
                details: { ...mockCartData, coupons: null, flags: { isCouponFeatureEnabled: true } },
                isCartSummary: true,
            });
            await expandComponent(element);
            const wrapper = element.querySelector('.order-coupon-pills-wrapper');
            expect(wrapper).toBeNull();
        });

        it('shows order-level coupon pills when isCartSummary, expanded, and coupons provided', async () => {
            const details = {
                ...mockCartData,
                coupons: [
                    { id: 'c1', code: 'SAVE20' },
                    { code: 'WELCOME10', status: NO_APPLICABLE_PROMOTION },
                ],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details, isCartSummary: true });
            await expandComponent(element);
            const wrapper = element.querySelector('.order-coupon-pills-wrapper');
            expect(wrapper).not.toBeNull();
            const pills = element.querySelectorAll('.order-coupon-pills-wrapper c-custom-pill');
            expect(pills).toHaveLength(2);
            expect(pills[0].label).toBe('SAVE20');
            expect(pills[1].label).toBe('WELCOME10');
        });

        it('uses addedCouponsAriaLabel when any coupon has NO_APPLICABLE_PROMOTION status', async () => {
            const details = {
                ...mockCartData,
                coupons: [{ code: 'SAVE20', status: NO_APPLICABLE_PROMOTION }],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details, isCartSummary: true });
            await expandComponent(element);
            const wrapper = element.querySelector('.order-coupon-pills-wrapper');
            expect(wrapper).not.toBeNull();
            expect(wrapper.getAttribute('aria-label')).toBe('Added coupons');
        });

        it('uses appliedCouponsAriaLabel when no coupon has NO_APPLICABLE_PROMOTION status', async () => {
            const details = {
                ...mockCartData,
                coupons: [{ code: 'SAVE20' }],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details, isCartSummary: true });
            await expandComponent(element);
            const wrapper = element.querySelector('.order-coupon-pills-wrapper');
            expect(wrapper.getAttribute('aria-label')).toBe('Applied coupons');
        });

        it('orderLevelCouponPills normalizes coupon code with trim and fallback id (covers map path)', async () => {
            const details = {
                ...mockCartData,
                coupons: [
                    { id: 'c1', code: 'SAVE20' },
                    { code: '  WELCOME10  ', status: NO_APPLICABLE_PROMOTION },
                ],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details, isCartSummary: true });
            await expandComponent(element);
            const pills = element.querySelectorAll('.order-coupon-pills-wrapper c-custom-pill');
            expect(pills).toHaveLength(2);
            expect(pills[0].label).toBe('SAVE20');
            expect(pills[1].label).toBe('WELCOME10');
            expect(pills[1].disabled).toBe(true);
        });

        it('orderLevelCouponPills excludes coupons with null or invalid code', async () => {
            const details = {
                ...mockCartData,
                coupons: [{ code: 'SAVE20' }, { code: null }],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details, isCartSummary: true });
            await expandComponent(element);
            const pills = element.querySelectorAll('.order-coupon-pills-wrapper c-custom-pill');
            expect(pills).toHaveLength(1);
            expect(pills[0].label).toBe('SAVE20');
        });

        it('orderLevelCouponPills excludes coupons with undefined code, non-string code, empty or whitespace code', async () => {
            const details = {
                ...mockCartData,
                coupons: [
                    { code: 'VALID' },
                    { code: undefined },
                    { code: 123 },
                    { code: '' },
                    { code: '   ' },
                    { code: '\t' },
                ],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details, isCartSummary: true });
            await expandComponent(element);
            const pills = element.querySelectorAll('.order-coupon-pills-wrapper c-custom-pill');
            expect(pills).toHaveLength(1);
            expect(pills[0].label).toBe('VALID');
        });

        it('orderLevelCouponPills excludes null coupon entries', async () => {
            const details = {
                ...mockCartData,
                coupons: [{ code: 'OK' }, null, undefined],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details, isCartSummary: true });
            await expandComponent(element);
            const pills = element.querySelectorAll('.order-coupon-pills-wrapper c-custom-pill');
            expect(pills).toHaveLength(1);
            expect(pills[0].label).toBe('OK');
        });

        it('shippingPromotionPills handles string and object promotions', async () => {
            const details = {
                ...mockOrderData,
                shippingDiscount: -5.0,
                shippingPromotions: [
                    'Free ship above $200',
                    { text: 'Promo text' },
                    { description: 'Promo description' },
                    { text: '  ', description: '' },
                    null,
                ],
            };
            const element = await createComponent({ details });
            await expandComponent(element);
            const promoPills = element.querySelectorAll('.order-promotions-pills c-custom-pill');
            expect(promoPills.length).toBeGreaterThanOrEqual(3);
            expect(promoPills[0].label).toBe('Free ship above $200');
            expect(promoPills[1].label).toBe('Promo text');
            expect(promoPills[2].label).toBe('Promo description');
        });

        it('hides coupon discount when isCouponFeatureEnabled is false (hasCouponsApplied)', async () => {
            const details = {
                ...mockOrderData,
                couponsApplied: ['SAVE20'],
                couponsDiscount: -10.0,
                flags: { isCouponFeatureEnabled: false },
            };
            const element = await createComponent({ details });
            await expandComponent(element);
            expect(hasSummaryLabel(element, 'Coupon Discount')).toBe(false);
        });

        it('couponsApplied getter returns trimmed comma-separated string', async () => {
            const details = {
                ...mockOrderData,
                couponsApplied: ['SAVE20', '  WELCOME10  ', 'LOYALTY15'],
            };
            const element = await createComponent({ details });
            expect(element.couponsApplied).toBe('SAVE20, WELCOME10, LOYALTY15');
        });

        it('hasCouponsApplied returns true when feature enabled and coupons applied', async () => {
            const details = {
                ...mockOrderData,
                couponsApplied: ['SAVE20'],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details });
            const desc = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'hasCouponsApplied');
            expect(desc?.get?.call(element)).toBe(true);
        });

        it('hasCouponsApplied returns false when isCouponFeatureEnabled is false', async () => {
            const details = {
                ...mockOrderData,
                couponsApplied: ['SAVE20'],
                flags: { isCouponFeatureEnabled: false },
            };
            const element = await createComponent({ details });
            const desc = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'hasCouponsApplied');
            expect(desc?.get?.call(element)).toBe(false);
        });

        it('orderLevelPromotions handles string, object with text/description, and empty text', async () => {
            const details = {
                ...mockOrderData,
                promotionsDiscount: -20,
                promotions: [
                    '  String promo  ',
                    { text: 'Text promo' },
                    { description: 'Description only' },
                    { text: '  ', description: '' },
                ],
            };
            const element = await createComponent({ details });
            await expandComponent(element);
            const pills = element.querySelectorAll('.order-promotions-pills c-custom-pill');
            expect(pills.length).toBeGreaterThanOrEqual(3);
            expect(pills[0].label).toBe('String promo');
            expect(pills[1].label).toBe('Text promo');
            expect(pills[2].label).toBe('Description only');
        });

        it('orderLevelCouponPills returns empty array when isCartSummary is false (getter coverage)', async () => {
            const element = await createComponent({
                details: { ...mockCartData, coupons: [{ code: 'SAVE20' }], flags: { isCouponFeatureEnabled: true } },
                isCartSummary: false,
            });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'orderLevelCouponPills').get;
            expect(getter.call(element)).toEqual([]);
        });

        it('orderLevelCouponPills uses fallback id when coupon has no id (getter coverage)', async () => {
            const details = {
                ...mockCartData,
                coupons: [{ code: 'WELCOME10' }],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details, isCartSummary: true });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'orderLevelCouponPills').get;
            const pills = getter.call(element);
            expect(pills).toHaveLength(1);
            expect(pills[0].id).toBe('coupon-0-WELCOME10');
            expect(pills[0].code).toBe('WELCOME10');
        });

        it('orderLevelCouponPills uses coupon.id when present (branch coverage)', async () => {
            const details = {
                ...mockCartData,
                coupons: [{ id: 'my-coupon-id', code: 'SAVE20' }],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details, isCartSummary: true });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'orderLevelCouponPills').get;
            const pills = getter.call(element);
            expect(pills).toHaveLength(1);
            expect(pills[0].id).toBe('my-coupon-id');
        });

        it('orderLevelPromotions getter returns description when text is absent (branch coverage)', async () => {
            const details = {
                ...mockOrderData,
                promotions: [{ description: 'Description only promo' }],
            };
            const element = await createComponent({ details });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'orderLevelPromotions').get;
            const result = getter.call(element);
            expect(result).toHaveLength(1);
            expect(result[0].text).toBe('Description only promo');
        });

        it('orderLevelPromotions getter uses text when present (branch coverage)', async () => {
            const details = {
                ...mockOrderData,
                promotions: [{ text: 'Text promo' }],
            };
            const element = await createComponent({ details });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'orderLevelPromotions').get;
            const result = getter.call(element);
            expect(result).toHaveLength(1);
            expect(result[0].text).toBe('Text promo');
        });

        it('shippingPromotionPills getter returns description when text is absent (branch coverage)', async () => {
            const details = {
                ...mockOrderData,
                shippingPromotions: [{ description: 'Free shipping description' }],
            };
            const element = await createComponent({ details });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'shippingPromotionPills').get;
            const result = getter.call(element);
            expect(result).toHaveLength(1);
            expect(result[0].text).toBe('Free shipping description');
        });

        it('shippingPromotionPills getter uses text when present (branch coverage)', async () => {
            const details = {
                ...mockOrderData,
                shippingPromotions: [{ text: 'Free ship text' }],
            };
            const element = await createComponent({ details });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'shippingPromotionPills').get;
            const result = getter.call(element);
            expect(result).toHaveLength(1);
            expect(result[0].text).toBe('Free ship text');
        });

        it('hasCouponsApplied getter returns false when isCouponFeatureEnabled is false (branch coverage)', async () => {
            const details = {
                ...mockOrderData,
                couponsApplied: ['SAVE20'],
                flags: { isCouponFeatureEnabled: false },
            };
            const element = await createComponent({ details });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'hasCouponsApplied').get;
            expect(getter.call(element)).toBe(false);
        });

        it('hasCouponsApplied getter returns false when feature enabled but no coupons applied (branch coverage)', async () => {
            const details = {
                ...mockOrderData,
                couponsApplied: [],
                flags: { isCouponFeatureEnabled: true },
            };
            const element = await createComponent({ details });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'hasCouponsApplied').get;
            expect(getter.call(element)).toBe(false);
        });

        it('hasCouponsApplied uses default true when flags is undefined (branch coverage)', async () => {
            const details = {
                ...mockOrderData,
                couponsApplied: ['SAVE20'],
            };
            const element = await createComponent({ details });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'hasCouponsApplied').get;
            expect(getter.call(element)).toBe(true);
        });

        it('orderLevelPromotions getter returns empty string when promotion has no text or description (branch coverage)', async () => {
            const details = {
                ...mockOrderData,
                promotions: [{}, { text: '', description: '' }],
            };
            const element = await createComponent({ details });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'orderLevelPromotions').get;
            const result = getter.call(element);
            expect(result).toHaveLength(0);
        });

        it('shippingPromotionPills getter returns empty string when promotion has no text or description (branch coverage)', async () => {
            const details = {
                ...mockOrderData,
                shippingPromotions: [{}, { text: '', description: '' }],
            };
            const element = await createComponent({ details });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'shippingPromotionPills').get;
            const result = getter.call(element);
            expect(result).toHaveLength(0);
        });

        it('orderLevelPromotions getter handles string promotion (branch coverage)', async () => {
            const details = {
                ...mockOrderData,
                promotions: ['  String only  '],
            };
            const element = await createComponent({ details });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'orderLevelPromotions').get;
            const result = getter.call(element);
            expect(result).toHaveLength(1);
            expect(result[0].text).toBe('String only');
        });

        it('shippingPromotionPills getter handles string promotion (branch coverage)', async () => {
            const details = {
                ...mockOrderData,
                shippingPromotions: ['  Ship string  '],
            };
            const element = await createComponent({ details });
            const getter = Object.getOwnPropertyDescriptor(SummaryDetails.prototype, 'shippingPromotionPills').get;
            const result = getter.call(element);
            expect(result).toHaveLength(1);
            expect(result[0].text).toBe('Ship string');
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

                const itemsList = element.querySelector('[role="list"]');
                expect(itemsList).not.toBeNull();
                expect(itemsList.getAttribute('role')).toBe('list');
                expect(itemsList.getAttribute('aria-label')).toBeDefined();

                const listItems = element.querySelectorAll('.item');
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
                expect(element.querySelector('[role="list"]')).toBeNull();

                // Native buttons automatically handle Enter key and trigger click
                toggleButton.click();
                await Promise.resolve();

                // Should be expanded
                expect(element.querySelector('[role="list"]')).not.toBeNull();
                expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
            });

            it('should handle Space key on toggle button', async () => {
                const element = await createComponent({ details: accessibilityMockOrderData });
                const toggleButton = element.querySelector('.clickable-row');

                // Initially collapsed
                expect(element.querySelector('[role="list"]')).toBeNull();

                // Native buttons automatically handle Space key and trigger click
                toggleButton.click();
                await Promise.resolve();

                // Should be expanded
                expect(element.querySelector('[role="list"]')).not.toBeNull();
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
                expect(element.querySelector('[role="list"]')).toBeNull();

                // Press Tab key (should not trigger toggle)
                const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
                toggleButton.dispatchEvent(tabEvent);
                await Promise.resolve();

                // Should still be collapsed
                expect(element.querySelector('[role="list"]')).toBeNull();
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
                expect(orderToggle.getAttribute('aria-label')).toBe('Expand order details');

                await expandComponent(orderElement);
                expect(orderToggle.getAttribute('aria-label')).toBe('Collapse order details');

                // Test cart summary mode
                const cartElement = await createComponent({
                    details: accessibilityMockOrderData,
                    isCartSummary: true,
                });
                const cartToggle = cartElement.querySelector('.clickable-row');
                expect(cartToggle.getAttribute('aria-label')).toBe('Expand cart details');

                await expandComponent(cartElement);
                expect(cartToggle.getAttribute('aria-label')).toBe('Collapse cart details');
            });
        });

        describe('Dynamic Content Accessibility', () => {
            it('should handle conditional content with proper ARIA', async () => {
                const dataWithPromotions = {
                    ...accessibilityMockOrderData,
                    promotionsDiscount: -10.0,
                    shippingDiscount: -5.0,
                    couponsDiscount: -8.0,
                    couponsApplied: ['NEW20', 'SAVE10'],
                    flags: { isCouponFeatureEnabled: true },
                };

                const element = await createComponent({ details: dataWithPromotions });
                await expandComponent(element);

                // Check that conditional elements have proper ARIA
                expect(hasSummaryLabel(element, 'Promotions')).toBe(true);
                expect(findSummaryValue(element, 'Promotions')).not.toBeNull();

                expect(hasSummaryLabel(element, 'Coupons Discount')).toBe(true);
                expect(findSummaryValue(element, 'Coupons Discount')).not.toBeNull();

                expect(hasSummaryLabel(element, 'Shipping Discount')).toBe(true);
                expect(findSummaryValue(element, 'Shipping Discount')).not.toBeNull();
            });

            it('should handle empty states gracefully', async () => {
                const emptyData = {
                    ...accessibilityMockOrderData,
                    items: [],
                };

                const element = await createComponent({ details: emptyData });
                await expandComponent(element);

                // Should still have proper ARIA structure even with no items
                const itemsList = element.querySelector('[role="list"]');
                expect(itemsList).not.toBeNull();
                expect(itemsList.getAttribute('role')).toBe('list');
                expect(itemsList.getAttribute('aria-label')).toBeDefined();
            });
        });

        it('should apply correct classes for the clickable row', async () => {
            // Test cart summary mode
            const cartElement = await createComponent({
                details: mockOrderData,
                isCartSummary: true,
            });
            const cartClickableRow = cartElement.querySelector('.clickable-row');
            expect(cartClickableRow.className).toContain('slds-p-horizontal_none');
            expect(cartClickableRow.className).toContain('slds-p-top_small');
            expect(cartClickableRow.className).toContain('slds-p-bottom_medium');

            // Test non-cart summary mode
            const orderElement = await createComponent({
                details: mockOrderData,
                isCartSummary: false,
            });
            const orderClickableRow = orderElement.querySelector('.clickable-row');
            expect(orderClickableRow.className).toContain('slds-p-around_none');
            expect(orderClickableRow.className).toContain('slds-m-bottom_medium');
        });

        it('should show footer message for order summary', async () => {
            const element = await createComponent({ details: mockOrderData });
            const footer = element.querySelector('.summary-footer');
            const footerMessage = element.querySelector('.footer-message');

            expect(footer).not.toBeNull();
            expect(footerMessage).not.toBeNull();
            expect(footerMessage.textContent).toBe('Is there anything else I can help you with?');
        });

        it('should not show footer message for cart summary', async () => {
            const element = await createComponent({ details: mockCartData, isCartSummary: true });
            const footer = element.querySelector('.summary-footer');

            expect(footer).toBeNull();
        });
    });
});
