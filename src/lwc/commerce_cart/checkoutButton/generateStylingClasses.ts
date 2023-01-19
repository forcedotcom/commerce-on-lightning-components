/**
 * This function returns the class for a
 * given button style
 *
 * @param {string} style the style for which class is generated
 * @returns {string} the class which should be applied to get the given style
 */
export function generateStyleClass(style: string | undefined): string {
    if (style === 'primary') {
        return 'slds-button_brand';
    } else if (style === 'secondary') {
        return 'slds-button_outline-brand';
    }
    return 'slds_button-tertiary';
}
