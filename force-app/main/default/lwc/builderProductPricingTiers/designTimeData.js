/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
/**
 * @typedef {{[key: string]: *}} JsonData
 */

/**
 * @returns {Array<JsonData>} Pricing tiers adjustments
 */
export function priceAdjustmentTiers() {
    return [
        {
            id: '1d23y',
            adjustmentValueFormat: 'percent-fixed',
            adjustmentValue: '50',
            lowerBound: '20',
            upperBound: '60',
            tierUnitPrice: '10',
        },
    ];
}
