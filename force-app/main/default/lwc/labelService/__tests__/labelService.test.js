/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */

import { getTranslatedLabel } from '../labelService';

describe('labelService', () => {
    describe('getTranslatedLabel', () => {
        const MOCK_LABEL_DATA = {
            welcomeMessage: {
                en_US: 'Welcome',
                es: 'Bienvenido',
                fr: 'Bienvenue',
                de: 'Willkommen',
            },
            goodbyeMessage: {
                en_US: 'Goodbye',
                fr: 'Au revoir',
            },
            onlyEnglish: {
                en_US: 'Only English',
            },
            noEnglishFallback: {
                es: 'Solo español',
                fr: 'Seulement français',
            },
        };

        describe('positive tests', () => {
            it('should return correct translation for valid locale', () => {
                expect(getTranslatedLabel('welcomeMessage', MOCK_LABEL_DATA, 'fr')).toBe('Bienvenue');
                expect(getTranslatedLabel('welcomeMessage', MOCK_LABEL_DATA, 'es')).toBe('Bienvenido');
                expect(getTranslatedLabel('welcomeMessage', MOCK_LABEL_DATA, 'de')).toBe('Willkommen');
            });

            it('should return en_US translation when requested locale not found', () => {
                expect(getTranslatedLabel('welcomeMessage', MOCK_LABEL_DATA, 'ja')).toBe('Welcome');
                expect(getTranslatedLabel('goodbyeMessage', MOCK_LABEL_DATA, 'de')).toBe('Goodbye');
            });

            it('should return en_US translation when locale not specified (default)', () => {
                expect(getTranslatedLabel('welcomeMessage', MOCK_LABEL_DATA)).toBe('Welcome');
                expect(getTranslatedLabel('goodbyeMessage', MOCK_LABEL_DATA)).toBe('Goodbye');
            });

            it('should return labelKey when translation not found and no en_US fallback', () => {
                expect(getTranslatedLabel('unknownKey', MOCK_LABEL_DATA, 'fr')).toBe('unknownKey');
            });

            it('should return available translation when en_US not available', () => {
                expect(getTranslatedLabel('noEnglishFallback', MOCK_LABEL_DATA, 'es')).toBe('Solo español');
                expect(getTranslatedLabel('noEnglishFallback', MOCK_LABEL_DATA, 'fr')).toBe('Seulement français');
            });

            it('should return labelKey when label exists but requested locale and en_US not available', () => {
                expect(getTranslatedLabel('noEnglishFallback', MOCK_LABEL_DATA, 'de')).toBe('noEnglishFallback');
            });
        });

        describe('negative tests - invalid labelKey', () => {
            it('should return empty string when labelKey is null', () => {
                expect(getTranslatedLabel(null, MOCK_LABEL_DATA, 'en_US')).toBe('');
            });

            it('should return empty string when labelKey is undefined', () => {
                expect(getTranslatedLabel(undefined, MOCK_LABEL_DATA, 'en_US')).toBe('');
            });

            it('should return empty string when labelKey is empty string', () => {
                expect(getTranslatedLabel('', MOCK_LABEL_DATA, 'en_US')).toBe('');
            });

            it('should return empty string when labelKey is a number', () => {
                expect(getTranslatedLabel(123, MOCK_LABEL_DATA, 'en_US')).toBe('');
            });

            it('should return empty string when labelKey is an object', () => {
                expect(getTranslatedLabel({}, MOCK_LABEL_DATA, 'en_US')).toBe('');
            });

            it('should return empty string when labelKey is an array', () => {
                expect(getTranslatedLabel([], MOCK_LABEL_DATA, 'en_US')).toBe('');
            });

            it('should return empty string when labelKey is a boolean', () => {
                expect(getTranslatedLabel(true, MOCK_LABEL_DATA, 'en_US')).toBe('');
            });
        });

        describe('negative tests - invalid LABEL_DATA', () => {
            it('should return labelKey when LABEL_DATA is null', () => {
                expect(getTranslatedLabel('someKey', null, 'en_US')).toBe('someKey');
            });

            it('should return labelKey when LABEL_DATA is undefined', () => {
                expect(getTranslatedLabel('someKey', undefined, 'en_US')).toBe('someKey');
            });

            it('should return labelKey when LABEL_DATA is empty object', () => {
                expect(getTranslatedLabel('someKey', {}, 'en_US')).toBe('someKey');
            });

            it('should return labelKey when LABEL_DATA is not an object (string)', () => {
                expect(getTranslatedLabel('someKey', 'not an object', 'en_US')).toBe('someKey');
            });

            it('should return labelKey when LABEL_DATA is not an object (number)', () => {
                expect(getTranslatedLabel('someKey', 123, 'en_US')).toBe('someKey');
            });

            it('should return labelKey when LABEL_DATA is not an object (array)', () => {
                expect(getTranslatedLabel('someKey', [], 'en_US')).toBe('someKey');
            });
        });

        describe('negative tests - malformed label entries', () => {
            it('should return labelKey when label entry is null', () => {
                const data = { someKey: null };
                expect(getTranslatedLabel('someKey', data, 'en_US')).toBe('someKey');
            });

            it('should return labelKey when label entry is undefined', () => {
                const data = { someKey: undefined };
                expect(getTranslatedLabel('someKey', data, 'en_US')).toBe('someKey');
            });

            it('should return labelKey when label entry is not an object (string)', () => {
                const data = { someKey: 'not an object' };
                expect(getTranslatedLabel('someKey', data, 'en_US')).toBe('someKey');
            });

            it('should return labelKey when label entry is not an object (number)', () => {
                const data = { someKey: 123 };
                expect(getTranslatedLabel('someKey', data, 'en_US')).toBe('someKey');
            });

            it('should return labelKey when label entry is empty object', () => {
                const data = { someKey: {} };
                expect(getTranslatedLabel('someKey', data, 'en_US')).toBe('someKey');
            });
        });

        describe('edge cases', () => {
            it('should handle locale parameter as undefined (use default)', () => {
                expect(getTranslatedLabel('welcomeMessage', MOCK_LABEL_DATA, undefined)).toBe('Welcome');
            });

            it('should handle locale parameter as null (use default)', () => {
                expect(getTranslatedLabel('welcomeMessage', MOCK_LABEL_DATA, null)).toBe('Welcome');
            });

            it('should handle locale parameter as empty string', () => {
                expect(getTranslatedLabel('welcomeMessage', MOCK_LABEL_DATA, '')).toBe('Welcome');
            });

            it('should handle special characters in labelKey', () => {
                const data = {
                    'special-key_123': {
                        en_US: 'Special Value',
                    },
                };
                expect(getTranslatedLabel('special-key_123', data, 'en_US')).toBe('Special Value');
            });

            it('should handle special characters in locale', () => {
                const data = {
                    someKey: {
                        en_US: 'English',
                        zh_CN: 'Chinese',
                    },
                };
                expect(getTranslatedLabel('someKey', data, 'zh_CN')).toBe('Chinese');
            });

            it('should handle whitespace in translation values', () => {
                const data = {
                    someKey: {
                        en_US: '  Whitespace Value  ',
                    },
                };
                expect(getTranslatedLabel('someKey', data, 'en_US')).toBe('  Whitespace Value  ');
            });

            it('should return labelKey when translation value is empty string (falsy)', () => {
                const data = {
                    someKey: {
                        en_US: '',
                    },
                };
                // Empty string is falsy, so it falls back to returning the labelKey
                expect(getTranslatedLabel('someKey', data, 'en_US')).toBe('someKey');
            });
        });

        describe('fallback chain tests', () => {
            it('should follow fallback chain: requested locale -> en_US -> labelKey', () => {
                // Test case 1: Requested locale exists
                expect(getTranslatedLabel('welcomeMessage', MOCK_LABEL_DATA, 'fr')).toBe('Bienvenue');

                // Test case 2: Requested locale doesn't exist, fallback to en_US
                expect(getTranslatedLabel('welcomeMessage', MOCK_LABEL_DATA, 'ja')).toBe('Welcome');

                // Test case 3: Neither requested locale nor en_US exist, return labelKey
                expect(getTranslatedLabel('noEnglishFallback', MOCK_LABEL_DATA, 'de')).toBe('noEnglishFallback');
            });

            it('should not use en_US if requested locale exists', () => {
                expect(getTranslatedLabel('welcomeMessage', MOCK_LABEL_DATA, 'es')).not.toBe('Welcome');
                expect(getTranslatedLabel('welcomeMessage', MOCK_LABEL_DATA, 'es')).toBe('Bienvenido');
            });
        });
    });
});
