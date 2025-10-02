/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache2.0/
 */
import { createElement } from 'lwc';
import CommonButtonGroup from 'c/commonButtonGroup';

describe('c-common-button-group', () => {
    let element;

    beforeEach(() => {
        element = createElement('c-common-button-group', {
            is: CommonButtonGroup,
        });
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    describe('Component Initialization', () => {
        it('should initialize with default empty items array', () => {
            expect(element.items).toEqual([]);
        });

        it('should have light DOM render mode', () => {
            expect(CommonButtonGroup.renderMode).toBe('light');
        });
    });

    describe('Rendering', () => {
        it('should render without items when items array is empty', async () => {
            document.body.appendChild(element);
            await Promise.resolve();

            const buttons = element.querySelectorAll('button');
            expect(buttons.length).toBe(0);
        });

        it('should render correct number of buttons based on items array', async () => {
            const testItems = ['Button 1', 'Button 2', 'Button 3'];

            element.items = testItems;
            document.body.appendChild(element);
            await Promise.resolve();

            const buttons = element.querySelectorAll('button');
            expect(buttons.length).toBe(3);
        });

        it('should render buttons with correct attributes', async () => {
            const testItems = ['Test Button'];

            element.items = testItems;
            document.body.appendChild(element);
            await Promise.resolve();

            const button = element.querySelector('button');
            expect(button.name).toBe('Test Button');
            expect(button.type).toBe('button');
            expect(button.getAttribute('aria-label')).toBe('Test Button');
        });

        it('should render buttons with correct CSS classes', async () => {
            const testItems = ['Button 1'];

            element.items = testItems;
            document.body.appendChild(element);
            await Promise.resolve();

            const button = element.querySelector('button');
            expect(button.className).toContain('button-group');
        });

        it('should render container with correct accessibility attributes', async () => {
            document.body.appendChild(element);
            await Promise.resolve();

            const container = element.querySelector('.button-group-layout');
            expect(container.getAttribute('role')).toBe('group');
            expect(container.getAttribute('aria-label')).toBe('Button group options');
        });
    });

    describe('Event Handling', () => {
        it('should dispatch selectbutton event when button is clicked', async () => {
            const testItems = ['Test Button'];

            element.items = testItems;
            document.body.appendChild(element);
            await Promise.resolve();

            const button = element.querySelector('button');
            const eventSpy = jest.fn();
            element.addEventListener('selectbutton', eventSpy);

            button.click();

            expect(eventSpy).toHaveBeenCalledTimes(1);
            expect(eventSpy.mock.calls[0][0].detail).toEqual({
                name: 'Test Button',
            });
        });

        it('should handle multiple button clicks correctly', async () => {
            const testItems = ['Button 1', 'Button 2'];

            element.items = testItems;
            document.body.appendChild(element);
            await Promise.resolve();

            const buttons = element.querySelectorAll('button');
            const eventSpy = jest.fn();
            element.addEventListener('selectbutton', eventSpy);

            // Click first button
            buttons[0].click();
            expect(eventSpy).toHaveBeenCalledTimes(1);
            expect(eventSpy.mock.calls[0][0].detail).toEqual({
                name: 'Button 1',
            });

            // Click second button
            buttons[1].click();
            expect(eventSpy).toHaveBeenCalledTimes(2);
            expect(eventSpy.mock.calls[1][0].detail).toEqual({
                name: 'Button 2',
            });
        });
    });

    describe('Data Validation', () => {
        it('should handle items with invalid values gracefully', async () => {
            const testItems = ['Valid Button', null, undefined, '', 123, {}, () => {}];

            element.items = testItems;
            document.body.appendChild(element);
            await Promise.resolve();

            const buttons = element.querySelectorAll('button');
            // Only valid string items should render
            expect(buttons.length).toBe(1);

            const eventSpy = jest.fn();
            element.addEventListener('selectbutton', eventSpy);

            // Only the valid button should dispatch an event
            buttons[0].click();
            expect(eventSpy).toHaveBeenCalledTimes(1);
            expect(eventSpy.mock.calls[0][0].detail).toEqual({
                name: 'Valid Button',
            });
        });

        it('should handle empty items array', async () => {
            element.items = [];
            document.body.appendChild(element);
            await Promise.resolve();

            const buttons = element.querySelectorAll('button');
            expect(buttons.length).toBe(0);
        });

        it('should handle non-array items gracefully', async () => {
            // Test with various non-array values
            const testCases = [null, undefined, 'string', 123, {}, () => {}];

            // Use Promise.all with map to avoid await in loop
            await Promise.all(
                testCases.map(async (testCase) => {
                    const testElement = createElement('c-common-button-group', {
                        is: CommonButtonGroup,
                    });

                    testElement.items = testCase;
                    document.body.appendChild(testElement);
                    await Promise.resolve();

                    const buttons = testElement.querySelectorAll('button');
                    expect(buttons.length).toBe(0);

                    // Clean up for this iteration
                    document.body.removeChild(testElement);
                })
            );
        });

        it('should handle items with empty strings', async () => {
            const testItems = ['Valid Button', '', '   ', 'Another Valid Button'];

            element.items = testItems;
            document.body.appendChild(element);
            await Promise.resolve();

            const buttons = element.querySelectorAll('button');
            // Empty strings should be filtered out
            expect(buttons.length).toBe(2);
            expect(buttons[0].textContent).toBe('Valid Button');
            expect(buttons[1].textContent).toBe('Another Valid Button');
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long button names', async () => {
            const longName = 'A'.repeat(1000);
            const testItems = [longName];

            element.items = testItems;
            document.body.appendChild(element);
            await Promise.resolve();

            const button = element.querySelector('button');
            expect(button.textContent).toBe(longName);
            expect(button.name).toBe(longName);
        });

        it('should handle special characters in button names', async () => {
            const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const testItems = [specialChars];

            element.items = testItems;
            document.body.appendChild(element);
            await Promise.resolve();

            const button = element.querySelector('button');
            expect(button.textContent).toBe(specialChars);
            expect(button.name).toBe(specialChars);
        });

        it('should handle unicode characters in button names', async () => {
            const unicodeName = '🚀 🌟 💫 ✨ 🎉';
            const testItems = [unicodeName];

            element.items = testItems;
            document.body.appendChild(element);
            await Promise.resolve();

            const button = element.querySelector('button');
            expect(button.textContent).toBe(unicodeName);
            expect(button.name).toBe(unicodeName);
        });

        it('should handle items array modification after initial render', async () => {
            document.body.appendChild(element);
            await Promise.resolve();

            // Initially no buttons
            let buttons = element.querySelectorAll('button');
            expect(buttons.length).toBe(0);

            // Add items
            element.items = ['New Button 1', 'New Button 2'];
            await Promise.resolve();

            buttons = element.querySelectorAll('button');
            expect(buttons.length).toBe(2);

            // Modify items
            element.items = ['Updated Button'];
            await Promise.resolve();

            buttons = element.querySelectorAll('button');
            expect(buttons.length).toBe(1);
            expect(buttons[0].textContent).toBe('Updated Button');
        });

        it('should handle direct access to _items when undefined', async () => {
            // Create a new instance and directly test the getter behavior
            const newElement = createElement('c-common-button-group', {
                is: CommonButtonGroup,
            });

            // Test the getter when _items is undefined
            expect(newElement.items).toEqual([]);
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels on buttons', async () => {
            const testItems = ['Accessible Button'];

            element.items = testItems;
            document.body.appendChild(element);
            await Promise.resolve();

            const button = element.querySelector('button');
            expect(button.getAttribute('aria-label')).toBe('Accessible Button');
        });

        it('should have proper role and aria-label on container', async () => {
            document.body.appendChild(element);
            await Promise.resolve();

            const container = element.querySelector('.button-group-layout');
            expect(container.getAttribute('role')).toBe('group');
            expect(container.getAttribute('aria-label')).toBe('Button group options');
        });

        it('should have proper button type attribute', async () => {
            const testItems = ['Test Button'];

            element.items = testItems;
            document.body.appendChild(element);
            await Promise.resolve();

            const button = element.querySelector('button');
            expect(button.getAttribute('type')).toBe('button');
        });
    });
});
