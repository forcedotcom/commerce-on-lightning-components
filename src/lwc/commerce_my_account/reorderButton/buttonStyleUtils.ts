import type { ButtonAlignment } from './types';

/**
 * This function returns the styles for a given alignment (left, right, center)
 *
 * @param {ButtonAlignment}
 * @returns {string} the style which should be applied to the button
 */
export function generateAlignmentClass(alignment: ButtonAlignment): string {
    if (alignment === 'center') {
        return 'slds-grid_align-center';
    } else if (alignment === 'right') {
        return 'slds-grid_align-end';
    }
    return '';
}
