/**
 * This function returns the class for given padding size
 * @param padding
 */
export function generateVerticalPaddingClass(padding: string): string {
    switch (padding) {
        case 'none':
        case 'xxx-small':
        case 'xx-small':
        case 'x-small':
        case 'small':
        case 'medium':
        case 'large':
        case 'x-large':
        case 'xx-large':
            return `slds-p-vertical_${padding}`;
        default:
            return 'slds-p-vertical_small';
    }
}
