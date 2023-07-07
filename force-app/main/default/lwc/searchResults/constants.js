/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
/**
 * Default values for search results properties.
 * @property {string} [cardAlignment='center']
 *  A product card's content alignment.
 * @property {string} [cardBackgroundColor = 'var(--dxp-g-root)']
 *  A product card's background color.
 * @property {string} [cardBorderColor = 'var(--dxp-g-root)']
 *  A product card's border color.
 * @property {string} [cardBorderRadius = '1px']
 *  A product card's border radius.
 * @property {string} [cardDividerColor = 'var(--dxp-g-neutral)']
 *  A product card container's background color
 * @property {string} [gridColumnSpacing = 'small']
 *  A product card's background color
 * @property {number} [gridMaxColumnsDisplayed = 3]
 *  The maximum number of grid columns to display, i.e. product
 *  cards in a row.
 * @property {string} [gridRowSpacing = 'small']
 *  The spacing between product cards (grid rows) in 'grid' layout.
 * @property {string} [listRowSpacing = 'small']
 *  The spacing between product cards (list rows) in 'small' layout.
 * @property {string} [negotiatedPriceTextColor = 'var(--dxp-g-root-contrast)']
 *  The text color of the negotiated price display inside each product card.
 * @property {string} [negotiatedPriceTextSize = 'medium']
 *  The text size of the negotiated price display inside each product card.
 * @property {string} [originalPriceTextColor = 'var(--dxp-g-root-contrast)']
 *  The text color of the original price display inside each product card.
 * @property {string} [originalPriceTextSize = 'medium']
 *  The text size of the original price display inside each product card.
 * @property {string} [resultsLayout = 'grid']
 *  The layout type of the search results. Either 'grid' or 'list'.
 */
export const DEFAULTS = {
    cardAlignment: 'center',
    cardBackgroundColor: 'var(--dxp-g-root)',
    cardBorderColor: 'var(--dxp-g-root)',
    cardBorderRadius: '1px',
    cardDividerColor: 'var(--dxp-g-neutral)',
    gridColumnSpacing: 'small',
    gridMaxColumnsDisplayed: 3,
    gridRowSpacing: 'small',
    listRowSpacing: 'small',
    negotiatedPriceTextColor: 'var(--dxp-g-root-contrast)',
    negotiatedPriceTextSize: 'medium',
    originalPriceTextColor: 'var(--dxp-g-root-contrast)',
    originalPriceTextSize: 'medium',
    resultsLayout: 'grid',
};

export const EVENT = {
    SHOW_PRODUCT_EVT: 'showproduct',

    ADD_PRODUCT_TO_CART_EVT: 'addproducttocart',

    UPDATE_CURRENT_PAGE_EVT: 'updatecurrentpage',
};
