import { fieldLabel as labels_fieldLabel } from './labels';

/**
 * @description Generates a localized '{fieldLabel}:'
 *
 * @param {string} fieldLabel
 *
 * @returns {string} a localized string of '{fieldLabel}:'
 */
export function generateFieldLabelText(fieldLabel: string | null | undefined): string {
    if (fieldLabel) {
        return labels_fieldLabel.replace('{fieldLabel}', fieldLabel);
    }
    return '';
}
