/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import labels from './labels';

/**
 * @param {boolean} expanded Whether we display all the facet values or not
 * @param {?string} facetName The facet name in the label, only used for the aria label attribute
 * @returns {string}
 *  A localized label for the toggled state of the 'Show More' button.
 */
export default function generateLabel(expanded, facetName) {
    if (facetName) {
        let labelSrc = expanded ? labels.showLessAriaLabel : labels.showMoreAriaLabel;
        labelSrc = labelSrc.replace('{name}', facetName);
        return labelSrc;
    }
    return expanded ? labels.showLessLabel : labels.showMoreLabel;
}
