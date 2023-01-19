import { getDxpFontSize, getDxpButtonFontSize } from '../styleStringGenerator';
declare type FontSize = 'small' | 'medium' | 'large' | undefined;

describe('getDxpFontSize', () => {
    [
        {
            size: undefined,
            expected: '',
        },
        {
            size: 'small',
            expected: 'var(--dxp-g-font-size-4)',
        },
        {
            size: 'medium',
            expected: 'var(--dxp-g-font-size-5)',
        },
        {
            size: 'large',
            expected: 'var(--dxp-g-font-size-6)',
        },
    ].forEach((config) => {
        it(`returns ${config.expected}, when size: ${config.size}`, () => {
            expect(getDxpFontSize(<FontSize>config.size)).toBe(config.expected);
        });
    });
});

describe('getDxpButtonFontSize', () => {
    [
        {
            size: undefined,
            expected: '',
        },
        {
            size: 'small',
            expected: 'var(--dxp-s-button-small-font-size)',
        },
        {
            size: 'medium',
            expected: 'var(--dxp-s-button-font-size)',
        },
        {
            size: 'large',
            expected: 'var(--dxp-s-button-large-font-size)',
        },
    ].forEach((config) => {
        it(`returns ${config.expected}, when size: ${config.size}`, () => {
            expect(getDxpButtonFontSize(<FontSize>config.size)).toBe(config.expected);
        });
    });
});
