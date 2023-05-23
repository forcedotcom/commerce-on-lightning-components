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
 * @param {?string} [value] The value to check whether it's a blank string
 * @returns {boolean} Whether the passed value is a blank string
 */
function isBlank(value) {
    return value == null || typeof value !== 'string' || value.trim().length === 0;
}

/**
 * Create a style declaration `property: value;`. If a suffix is provided, appends the suffix to the value.
 * @param {string} name The declaration property name
 * @param {(string | number)} [value] The declaration value
 * @param {string} [suffix] The value suffix
 * @returns {string} A style declaration `property: value;`. If no name or value provided, returns an empty string
 */
export function createStyleDeclaration(name, value, suffix) {
    return name && (typeof value === 'number' || !isBlank(value)) ? `${name}: ${value}${suffix ?? ''};` : '';
}

/**
 * Creates an inline style string - suitable for use in an element style attribute - for a given collection of styles.
 * @param {JsonData} styles
 *  A collection of CSS styles, specified in one of two ways:
 *    - A simple object where the keys are the names of CSS properties and the values are the associated property values
 *    - An array of Style objects (which support more robust options)
 * @returns {string}
 *  A formatted string representing all the styles with defined (i.e. not null, undefined, or empty string) values.
 *  Any additional transformations (e.g. application of a suffix) are applied to the values.
 */
export function createStyleString(styles) {
    // If this isn't an array, assume it's an object and convert it to the more specific array.
    if (!Array.isArray(styles)) {
        styles = Object.entries(styles).map(([styleName, styleValue]) => ({
            name: styleName,
            value: styleValue,
        }));
    }

    return styles
        .reduce((stylesList, style) => {
            const styleString = createStyleDeclaration(style.name, style.value, style.suffix);
            if (!isBlank(styleString)) {
                stylesList.push(styleString);
            }
            return stylesList;
        }, [])
        .join(' ');
}
