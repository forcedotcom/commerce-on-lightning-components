/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-title */
/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { createElement } from 'lwc';
import CommonLink from 'c/commonLink';
import {
    generateButtonSizeClass,
    generateButtonStretchClass,
    generateButtonStyleClass,
    generateElementAlignmentClass,
} from 'experience/styling';

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

describe('c-common-link', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('should create the component', () => {
        const element = createElement('c-common-link', {
            is: CommonLink,
        });
        document.body.appendChild(element);
        expect(element).toBeTruthy();
    });

    describe('element rendering based on disabled prop', () => {
        const testCases = [
            {
                title: 'should render anchor element when not disabled',
                props: { href: 'https://example.com' },
                expected: {
                    selector: 'a',
                    assertions: (element) => {
                        const anchor = element.querySelector('a');
                        expect(anchor).toBeTruthy();
                        expect(anchor.href).toBe('https://example.com/');
                    },
                },
            },
            {
                title: 'should render button element when disabled',
                props: { disabled: true },
                expected: {
                    selector: 'button',
                    assertions: (element) => {
                        const button = element.querySelector('button');
                        expect(button).toBeTruthy();
                        expect(button.disabled).toBeTruthy();
                    },
                },
            },
        ];

        testCases.forEach(({ title, props, expected }) => {
            it(title, () => {
                const element = createElement('c-common-link', {
                    is: CommonLink,
                });
                Object.assign(element, props);
                document.body.appendChild(element);

                return Promise.resolve().then(() => {
                    expected.assertions(element);
                });
            });
        });
    });

    describe('anchor css class application', () => {
        const testCases = [
            {
                title: 'should apply correct classes based on variant',
                props: { variant: 'primary' },
                expected: {
                    className: 'mock-style',
                    experienceStylingCall: () => expect(generateButtonStyleClass).toHaveBeenCalledWith('primary'),
                },
            },
            {
                title: 'should apply correct classes based on size',
                props: { size: 'small' },
                expected: {
                    className: 'mock-size',
                    experienceStylingCall: () => expect(generateButtonSizeClass).toHaveBeenCalledWith('small'),
                },
            },
            {
                title: 'should apply correct classes based on width',
                props: { width: 'stretch' },
                expected: {
                    className: 'mock-stretch',
                    experienceStylingCall: () => expect(generateButtonStretchClass).toHaveBeenCalledWith('stretch'),
                },
            },
            {
                title: 'should apply correct classes based on alignment',
                props: { alignment: 'center' },
                expected: {
                    className: 'mock-alignment',
                    experienceStylingCall: () => expect(generateElementAlignmentClass).toHaveBeenCalledWith('center'),
                },
            },
        ];

        testCases.forEach(({ title, props, expected }) => {
            // eslint-disable-next-line jest/valid-title
            it(title, () => {
                const element = createElement('c-common-link', {
                    is: CommonLink,
                });
                Object.assign(element, props);
                document.body.appendChild(element);

                return Promise.resolve().then(() => {
                    const anchor = element.querySelector('a');
                    expect(anchor.className).toContain(expected.className);
                    expected.experienceStylingCall();
                });
            });
        });
    });

    describe('click handling', () => {
        const testCases = [
            {
                title: 'should prevent default when href is empty',
                props: {},
                expected: {
                    shouldPreventDefault: true,
                },
            },
            {
                title: 'should not prevent default when href is provided',
                props: { href: 'https://example.com' },
                expected: {
                    shouldPreventDefault: false,
                },
            },
        ];

        testCases.forEach(({ title, props, expected }) => {
            it(title, () => {
                const element = createElement('c-common-link', {
                    is: CommonLink,
                });
                Object.assign(element, props);
                document.body.appendChild(element);

                return Promise.resolve().then(() => {
                    const anchor = element.querySelector('a');
                    const event = new CustomEvent('click');
                    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
                    anchor.dispatchEvent(event);
                    const wasCalled = preventDefaultSpy.mock.calls.length > 0;
                    expect(wasCalled).toBe(expected.shouldPreventDefault);
                });
            });
        });
    });

    it('should set assistive text correctly', () => {
        const element = createElement('c-common-link', {
            is: CommonLink,
        });
        element.assistiveText = 'Test Link';
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const anchor = element.querySelector('a');
            expect(anchor.getAttribute('aria-label')).toBe('Test Link');
        });
    });

    describe('focus handling', () => {
        const testCases = [
            {
                title: 'should focus the anchor element when focus method is called',
                props: {},
                expected: {
                    shouldThrow: false,
                    assertions: (element) => {
                        const anchor = element.querySelector('a');
                        const focusSpy = jest.spyOn(anchor, 'focus');
                        element.focus();
                        expect(focusSpy).toHaveBeenCalled();
                    },
                },
            },
            {
                title: 'should handle focus method when no anchor exists',
                props: { disabled: true },
                expected: {
                    shouldThrow: false,
                    assertions: (element) => {
                        expect(() => element.focus()).not.toThrow();
                    },
                },
            },
        ];

        testCases.forEach(({ title, props, expected }) => {
            it(title, () => {
                const element = createElement('c-common-link', {
                    is: CommonLink,
                });
                Object.assign(element, props);
                document.body.appendChild(element);

                return Promise.resolve().then(() => {
                    expected.assertions(element);
                });
            });
        });
    });
});
