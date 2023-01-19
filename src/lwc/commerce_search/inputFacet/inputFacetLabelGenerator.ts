import labels from './labels';

/**
 * Generates a localized label for the toggled state of the 'Show More' button
 *
 * @param expanded Whether we display all the facet values or not
 * @param facetName The facet name in the label, only used for the aria label attribute
 *
 * @returns
 */
export default function generateLabel(expanded: boolean, facetName?: string): string {
    if (facetName) {
        let labelSrc = expanded ? labels.showLessAriaLabel : labels.showMoreAriaLabel;
        labelSrc = labelSrc.replace('{name}', facetName);
        return labelSrc;
    }
    return expanded ? labels.showLessLabel : labels.showMoreLabel;
}
