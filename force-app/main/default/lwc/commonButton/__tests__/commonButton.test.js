/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { createElement } from 'lwc';
import CommonButton from 'c/commonButton';

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

describe('c-common-button', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('renders with correct button classes from utility functions', async () => {
        const element = createElement('c-common-button', {
            is: CommonButton,
        });

        element.variant = 'primary';
        element.size = 'large';
        element.width = 'stretch';
        element.alignment = 'center';

        document.body.appendChild(element);
        await Promise.resolve();

        const button = element.querySelector('button');

        const classList = button.className
            .split(' ')
            .map((cls) => cls.trim())
            .filter(Boolean);

        expect(classList).toEqual(
            expect.arrayContaining(['slds-button', 'mock-style', 'mock-size', 'mock-stretch', 'mock-alignment'])
        );
    });

    it('applies disabled attribute when disabled is true', async () => {
        const element = createElement('c-common-button', {
            is: CommonButton,
        });

        element.disabled = true;
        document.body.appendChild(element);
        await Promise.resolve();

        const button = element.querySelector('button');
        expect(button.disabled).toBe(true);
    });

    it('sets assistive text as aria-label', async () => {
        const element = createElement('c-common-button', {
            is: CommonButton,
        });

        element.assistiveText = 'Save Item';
        document.body.appendChild(element);
        await Promise.resolve();

        const button = element.querySelector('button');
        expect(button.getAttribute('aria-label')).toBe('Save Item');
    });

    it('focus() method sets focus to the button', async () => {
        const element = createElement('c-common-button', {
            is: CommonButton,
        });

        document.body.appendChild(element);
        await Promise.resolve();

        const button = element.querySelector('button');
        const focusSpy = jest.spyOn(button, 'focus');

        element.focus();
        expect(focusSpy).toHaveBeenCalled();
    });
});
