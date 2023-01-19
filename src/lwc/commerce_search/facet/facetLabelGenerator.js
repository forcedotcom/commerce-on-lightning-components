import labels from './labels.js';

/**
 * Generates a localized label for the toggled state of the facet
 *
 * @param {Boolean} expanded Whether the facet is expanded or not
 *
 * @returns {String}
 */
export default function generateLabel(expanded) {
    return expanded ? labels.toggleFilterExpandedAssistiveText : labels.toggleFilterCollapsedAssistiveText;
}
