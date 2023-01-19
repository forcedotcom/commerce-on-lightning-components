/**
 * This function returns the class for a
 * given button style
 */
export function generateStyleClass(style: string): string {
    if (style === 'primary') {
        return 'slds-button_brand';
    } else if (style === 'secondary') {
        return 'slds-button_outline-brand';
    }
    return '';
}

/**
 * This function returns the class for a
 * given button size
 */
export function generateSizeClass(size: string): string {
    if (size === 'small') {
        return 'dxp-button-small';
    } else if (size === 'large') {
        return 'dxp-button-large';
    }
    return '';
}

/**
 * This function returns the class for a
 * given button stretch style
 */
export function generateStretchClass(stretch: string): string {
    if (stretch === 'stretch') {
        return 'slds-button_stretch';
    }
    return '';
}

/**
 * This function returns the class for a
 * given button align style
 */
export function generateAlignClass(align: string): string {
    return `show-more-button_${align}`;
}
