/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import labels from './labels';

/**
 * @param {boolean} expanded Whether the facet is expanded or not
 * @returns {string}
 *  A localized label for the toggled state of the facet.
 */
export default function generateLabel(expanded) {
    return expanded ? labels.toggleFilterExpandedAssistiveText : labels.toggleFilterCollapsedAssistiveText;
}
