/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
export const EVENT = {
    SHOW_PRODUCT_EVT: 'showproduct',

    ADD_PRODUCT_TO_CART_EVT: 'addproducttocart',
};

export const PRODUCT_CLASS = {
    VARIATION: 'Variation',
    VARIATION_PARENT: 'VariationParent',
    SIMPLE: 'Simple',
    SET: 'Set',
};

export const QUANTITY_RULES = {
    DEFAULT_MIN: 1,
    DEFAULT_MAX: 1000000,
    DEFAULT_INCREMENT: 1,
};
