/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

import { createElement } from 'lwc';
import ConversationalContext from 'c/conversationalContext';

/**
 * Main test suite for the ConversationalContext component
 *
 * Tests are organized into logical groups covering different aspects
 * of the component's functionality and behavior.
 */
describe('c-conversational-context', () => {
    let element;

    /**
     * Set up a fresh component instance before each test
     * to ensure test isolation and prevent state leakage
     */
    beforeEach(() => {
        element = createElement('c-conversational-context', {
            is: ConversationalContext,
        });
    });

    /**
     * Clean up DOM after each test to prevent test interference
     * and ensure a clean testing environment
     */
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    /**
     * Component Rendering Tests
     *
     * Verifies that the component renders correctly with various
     * property configurations and data inputs.
     */
    describe('Component Rendering', () => {
        /**
         * Tests default component rendering with no custom properties
         * Verifies that the component initializes with expected default values
         */
        it('renders with default properties', async () => {
            document.body.appendChild(element);
            await Promise.resolve();

            const descriptionElement = element.querySelector('.contextual-actions-description');
            const buttonGroup = element.querySelector('c-common-button-group');

            expect(descriptionElement).toBeTruthy();
            expect(descriptionElement.textContent).toBe('');
            expect(buttonGroup).toBeTruthy();
        });

        /**
         * Tests rendering with custom contextual description text
         * Verifies that the description is properly displayed and updated
         */
        it('renders with custom contextual description', async () => {
            element.contextualDescription = 'Choose a category to explore:';
            document.body.appendChild(element);
            await Promise.resolve();

            const descriptionElement = element.querySelector('.contextual-actions-description');
            expect(descriptionElement.textContent).toBe('Choose a category to explore:');
        });

        /**
         * Tests rendering with contextual data array
         * Verifies that the button group receives and displays the data correctly
         */
        it('renders with contextual data', async () => {
            element.contextualData = [
                { id: 'cat1', name: 'Electronics' },
                { id: 'cat2', name: 'Clothing' },
            ];
            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            expect(buttonGroup).toBeTruthy();
            expect(buttonGroup.items).toEqual([
                { id: 'cat1', name: 'Electronics' },
                { id: 'cat2', name: 'Clothing' },
            ]);
        });

        /**
         * Tests rendering when contextualData contains valid items
         * Verifies that the button group is properly populated
         */
        it('renders button group when contextualData has items', async () => {
            element.contextualData = [{ id: 'cat1', name: 'Electronics' }];
            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            expect(buttonGroup).toBeTruthy();
            expect(buttonGroup.items).toEqual([{ id: 'cat1', name: 'Electronics' }]);
        });

        /**
         * Tests rendering when contextualData is an empty array
         * Verifies that the component handles empty data gracefully
         */
        it('renders button group when contextualData is empty array', async () => {
            element.contextualData = [];
            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            expect(buttonGroup).toBeTruthy();
            expect(buttonGroup.items).toEqual([]);
        });

        /**
         * Tests rendering when contextualData is null
         * Verifies that the component handles null data gracefully
         */
        it('renders button group when contextualData is not an array', async () => {
            element.contextualData = null;
            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            expect(buttonGroup).toBeTruthy();
            // The component should handle this gracefully
            expect(buttonGroup.items).toEqual([]);
        });

        /**
         * Tests rendering when contextualData is undefined
         * Verifies that the component handles undefined data gracefully
         */
        it('renders button group when contextualData is undefined', async () => {
            element.contextualData = undefined;
            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            expect(buttonGroup).toBeTruthy();
            // The component should handle this gracefully
            expect(buttonGroup.items).toEqual([]);
        });

        /**
         * Tests rendering when contextualData is a string
         * Verifies that the component handles invalid data types gracefully
         */
        it('renders button group when contextualData is a string', async () => {
            element.contextualData = 'not-an-array';
            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            expect(buttonGroup).toBeTruthy();
            // The component should handle this gracefully
            expect(buttonGroup.items).toEqual([]);
        });
    });

    /**
     * Event Handling Tests
     *
     * Verifies that the component properly handles button click events
     * and dispatches the correct selectcontext events with proper validation.
     */
    describe('Event Handling', () => {
        /**
         * Tests successful event dispatch when button is clicked with valid name
         * Verifies that the selectcontext event is properly emitted
         */
        it('dispatches selectcontext event when button is clicked with valid name', async () => {
            const mockHandler = jest.fn();
            element.addEventListener('selectcontext', mockHandler);

            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            const mockEvent = new CustomEvent('selectbutton', {
                detail: { name: 'Electronics' },
            });

            buttonGroup.dispatchEvent(mockEvent);

            expect(mockHandler).toHaveBeenCalledTimes(1);
            expect(mockHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: { name: 'Electronics' },
                })
            );
        });

        /**
         * Tests that no event is dispatched when button click has no name
         * Verifies input validation prevents invalid events
         */
        it('does not dispatch selectcontext event when button click has no name', async () => {
            const mockHandler = jest.fn();
            element.addEventListener('selectcontext', mockHandler);

            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            const mockEvent = new CustomEvent('selectbutton', {
                detail: {},
            });

            buttonGroup.dispatchEvent(mockEvent);

            expect(mockHandler).not.toHaveBeenCalled();
        });

        /**
         * Tests that no event is dispatched when button click has null name
         * Verifies input validation prevents invalid events
         */
        it('does not dispatch selectcontext event when button click has null name', async () => {
            const mockHandler = jest.fn();
            element.addEventListener('selectcontext', mockHandler);

            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            const mockEvent = new CustomEvent('selectbutton', {
                detail: { name: null },
            });

            buttonGroup.dispatchEvent(mockEvent);

            expect(mockHandler).not.toHaveBeenCalled();
        });

        /**
         * Tests that no event is dispatched when button click has undefined name
         * Verifies input validation prevents invalid events
         */
        it('does not dispatch selectcontext event when button click has undefined name', async () => {
            const mockHandler = jest.fn();
            element.addEventListener('selectcontext', mockHandler);

            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            const mockEvent = new CustomEvent('selectbutton', {
                detail: { name: undefined },
            });

            buttonGroup.dispatchEvent(mockEvent);

            expect(mockHandler).not.toHaveBeenCalled();
        });

        /**
         * Tests that no event is dispatched when button click has non-string name
         * Verifies input validation prevents invalid events
         */
        it('does not dispatch selectcontext event when button click has non-string name', async () => {
            const mockHandler = jest.fn();
            element.addEventListener('selectcontext', mockHandler);

            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            const mockEvent = new CustomEvent('selectbutton', {
                detail: { name: 123 },
            });

            buttonGroup.dispatchEvent(mockEvent);

            expect(mockHandler).not.toHaveBeenCalled();
        });

        /**
         * Tests that no event is dispatched when button click has empty string name
         * Verifies input validation prevents invalid events
         */
        it('does not dispatch selectcontext event when button click has empty string name', async () => {
            const mockHandler = jest.fn();
            element.addEventListener('selectcontext', mockHandler);

            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            const mockEvent = new CustomEvent('selectbutton', {
                detail: { name: '' },
            });

            buttonGroup.dispatchEvent(mockEvent);

            expect(mockHandler).not.toHaveBeenCalled();
        });

        /**
         * Tests that no event is dispatched when event detail is null
         * Verifies input validation prevents invalid events
         */
        it('does not dispatch selectcontext event when event detail is null', async () => {
            const mockHandler = jest.fn();
            element.addEventListener('selectcontext', mockHandler);

            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            const mockEvent = new CustomEvent('selectbutton', {
                detail: null,
            });

            buttonGroup.dispatchEvent(mockEvent);

            expect(mockHandler).not.toHaveBeenCalled();
        });

        /**
         * Tests that no event is dispatched when event detail is undefined
         * Verifies input validation prevents invalid events
         */
        it('does not dispatch selectcontext event when event detail is undefined', async () => {
            const mockHandler = jest.fn();
            element.addEventListener('selectcontext', mockHandler);

            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            const mockEvent = new CustomEvent('selectbutton', {
                detail: undefined,
            });

            buttonGroup.dispatchEvent(mockEvent);

            expect(mockHandler).not.toHaveBeenCalled();
        });
    });

    /**
     * Component Structure Tests
     *
     * Verifies that the component renders with the correct DOM structure,
     * CSS classes, and child components.
     */
    describe('Component Structure', () => {
        /**
         * Tests that the component has correct CSS classes for layout
         * Verifies SLDS grid system classes are properly applied
         */
        it('has correct CSS classes for layout', async () => {
            document.body.appendChild(element);
            await Promise.resolve();

            const container = element.querySelector('.slds-grid.slds-grid_vertical');
            const column = element.querySelector('.slds-col.slds-p-bottom_small.slds-p-horizontal_medium');

            expect(container).toBeTruthy();
            expect(column).toBeTruthy();
        });

        /**
         * Tests that the description paragraph renders with correct class
         * Verifies the contextual description element structure
         */
        it('renders description paragraph with correct class', async () => {
            document.body.appendChild(element);
            await Promise.resolve();

            const descriptionElement = element.querySelector('p.contextual-actions-description');
            expect(descriptionElement).toBeTruthy();
            expect(descriptionElement.tagName).toBe('P');
        });

        /**
         * Tests that the common-button-group component renders
         * Verifies the child component integration
         */
        it('renders common-button-group component', async () => {
            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            expect(buttonGroup).toBeTruthy();
        });
    });

    /**
     * Property Updates Tests
     *
     * Verifies that the component properly updates its UI when
     * properties change, ensuring reactivity works correctly.
     */
    describe('Property Updates', () => {
        /**
         * Tests that contextualDescription updates when property changes
         * Verifies reactive property binding for description text
         */
        it('updates contextualDescription when property changes', async () => {
            document.body.appendChild(element);
            await Promise.resolve();

            element.contextualDescription = 'Updated description';
            await Promise.resolve();

            const descriptionElement = element.querySelector('.contextual-actions-description');
            expect(descriptionElement.textContent).toBe('Updated description');
        });

        /**
         * Tests that contextualData updates when property changes
         * Verifies reactive property binding for button data
         */
        it('updates contextualData when property changes', async () => {
            document.body.appendChild(element);
            await Promise.resolve();

            const newData = [{ id: 'new1', name: 'New Category' }];
            element.contextualData = newData;
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            expect(buttonGroup.items).toEqual(newData);
        });
    });

    /**
     * Edge Cases Tests
     *
     * Verifies that the component handles unusual or extreme
     * data scenarios gracefully and maintains stability.
     */
    describe('Edge Cases', () => {
        /**
         * Tests handling of contextualData with mixed valid and invalid items
         * Verifies the component can handle complex, mixed data scenarios
         */
        it('handles contextualData with mixed valid and invalid items', async () => {
            element.contextualData = [
                { id: 'cat1', name: 'Valid Category' },
                null,
                undefined,
                { id: 'cat2', name: '' },
                { id: 'cat3', name: 'Another Valid' },
            ];
            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            expect(buttonGroup.items).toEqual([
                { id: 'cat1', name: 'Valid Category' },
                null,
                undefined,
                { id: 'cat2', name: '' },
                { id: 'cat3', name: 'Another Valid' },
            ]);
        });

        /**
         * Tests handling of very long contextualDescription text
         * Verifies the component can handle extremely long text without breaking
         */
        it('handles very long contextualDescription', async () => {
            const longDescription = 'A'.repeat(1000);
            element.contextualDescription = longDescription;
            document.body.appendChild(element);
            await Promise.resolve();

            const descriptionElement = element.querySelector('.contextual-actions-description');
            expect(descriptionElement.textContent).toBe(longDescription);
        });

        /**
         * Tests handling of contextualData with complex nested objects
         * Verifies the component can handle complex data structures
         */
        it('handles contextualData with complex nested objects', async () => {
            const complexData = [
                {
                    id: 'cat1',
                    name: 'Complex Category',
                    metadata: {
                        description: 'A complex category',
                        tags: ['tag1', 'tag2'],
                    },
                },
            ];
            element.contextualData = complexData;
            document.body.appendChild(element);
            await Promise.resolve();

            const buttonGroup = element.querySelector('c-common-button-group');
            expect(buttonGroup.items).toEqual(complexData);
        });
    });
});
