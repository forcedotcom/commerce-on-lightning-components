/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { createElement } from 'lwc';
import ProductVariants from '../productVariants';
import { mockProductVariants } from './constants';

jest.mock(
    'experience/styling',
    () => ({
        generateButtonSizeClass: jest.fn(() => 'mock-size'),
        generateButtonStretchClass: jest.fn(() => 'mock-stretch'),
        generateButtonStyleClass: jest.fn(() => 'mock-style'),
        generateElementAlignmentClass: jest.fn(() => 'mock-alignment'),
    }),
    { virtual: true }
);
describe('c-product-variants', () => {
    let element;

    beforeEach(() => {
        element = createElement('c-product-variants', {
            is: ProductVariants,
        });
        element.productVariants = mockProductVariants;
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should initialize with mock product variants', () => {
        expect(element.productVariants).toEqual(mockProductVariants);
    });

    it('should handle variant selection and dispatch event', async () => {
        // Create a spy for the dispatchEvent method
        const dispatchEventSpy = jest.spyOn(element, 'dispatchEvent');

        // Get the first variant button
        const variantButton = element.querySelector('c-common-button');
        const variantValue = variantButton.dataset.value;

        // Trigger click event
        await variantButton.click();

        // Verify the event was dispatched with correct data
        expect(dispatchEventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: {
                    name: mockProductVariants[0].name,
                    option: variantValue,
                },
            })
        );

        // Verify selected styling was applied
        expect(variantButton.classList.contains('selected')).toBe(true);
    });

    it('should update selected styling when different variant is clicked', async () => {
        // Get all variant buttons
        const variantButtons = element.querySelectorAll('c-common-button');

        // Click first button
        variantButtons[0].click();
        // Wait for the component to update
        await Promise.resolve();
        expect(variantButtons[0].classList.contains('selected')).toBe(true);
        expect(variantButtons[1].classList.contains('selected')).toBe(false);

        // Click second button
        variantButtons[1].click();
        // Wait for the component to update
        await Promise.resolve();
        expect(variantButtons[0].classList.contains('selected')).toBe(false);
        expect(variantButtons[1].classList.contains('selected')).toBe(true);
    });
});
