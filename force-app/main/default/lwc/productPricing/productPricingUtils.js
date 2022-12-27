/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
/**
 * Determines whether the original (list) price should be displayed given available pricing information
 * @param {boolean} showNegotiatedPrice Whether negotiated price should be displayed
 * @param {boolean} showOriginalPrice Whether original (list) price should be displayed
 * @param {string} negotiatedPrice The negotiated price of an item
 * @param {string} originalPrice The original (list) price of an item
 * @returns {boolean} true if the original (list) price should be displayed, otherwise false
 */
export default function displayOriginalPrice(showNegotiatedPrice, showOriginalPrice, negotiatedPrice, originalPrice) {
    const showBothPrices = showOriginalPrice && showNegotiatedPrice;
    const originalPriceExists = !!originalPrice && Number(originalPrice) >= 0;
    const negotiatedPriceExists = !!negotiatedPrice && Number(negotiatedPrice) >= 0;
    const originalPriceIsAvailableAndGreaterThanNegotiatedPrice =
        originalPriceExists && negotiatedPriceExists && Number(originalPrice) > Number(negotiatedPrice);

    return showBothPrices && originalPriceIsAvailableAndGreaterThanNegotiatedPrice;
}
