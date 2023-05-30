/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
/**
 * @typedef {import('./searchSortMenu').SortRuleData} SortRuleData
 */

/**
 * @typedef {import('./searchSortMenu').LabelValuePair} LabelValuePair
 */

/**
 * Computes a list of (normalized) sort menu options from the given sort rules.
 * @param {SortRuleData[]} [sortRules] The list of sort rules
 * @returns {LabelValuePair[]} The list of sort options
 */
export function computeSortOptions(sortRules) {
    return Array.isArray(sortRules)
        ? sortRules.map((item) => {
              const { sortRuleId, label } = item;
              return {
                  value: sortRuleId,
                  label: label,
              };
          })
        : [];
}
