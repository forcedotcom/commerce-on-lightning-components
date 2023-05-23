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
 * Transform the Tier Pricing Adjustments Contents
 * @param {JsonData} [data] The specified product pricing data
 * @returns {Array<JsonData>} transformed/normalized price adjustments contents
 */
export function transformTierAdjustmentContents(data) {
    return (data?.priceAdjustment?.priceAdjustmentTiers ?? []).map(
        ({ id, adjustmentType, adjustmentValue, lowerBound, upperBound, tierUnitPrice }) => ({
            id,
            adjustmentValue,
            adjustmentValueFormat: adjustmentType === 'PercentageBasedAdjustment' ? 'percent-fixed' : 'currency',
            lowerBound,
            upperBound,
            tierUnitPrice,
        })
    );
}
