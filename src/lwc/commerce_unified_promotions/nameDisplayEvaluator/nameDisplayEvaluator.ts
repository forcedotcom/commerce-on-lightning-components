import { couponCodeValueWithPromotionNameSeparator } from './labels';

/**
 * Generates a localized description of promotion name with coupon code.
 *
 * @returns {string}
 * If {@see code}, a localized string describing the code and name associated with the promotion,
 * or return the name of the promotion.
 */
export function generateDisplayablePromotionName(name: string, code: string): string {
    let text = '';
    let textSrc;
    const codeExists = typeof code === 'string' && code.length > 0;
    const nameExists = typeof name === 'string' && name.length > 0;

    if (codeExists) {
        textSrc = nameExists ? couponCodeValueWithPromotionNameSeparator : code;
    } else {
        text = name;
    }
    if (textSrc) {
        text = textSrc.replace('{code}', code);
        text = text.replace('{name}', name);
    }
    return text;
}
