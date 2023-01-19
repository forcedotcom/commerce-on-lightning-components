import { removeCouponAssistiveText } from './labels';

/**
 * Generates a localized assistive text with coupon name.
 *
 * @returns {string}
 */
export function generateAssistiveText(name: string | null | undefined): string {
    return removeCouponAssistiveText.replace('{code}', name ? name : '');
}
