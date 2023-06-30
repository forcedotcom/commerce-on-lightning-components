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

const variantSupportedProductClasses = new Set(['Variation', 'VariationParent']);

/**
 * Determines if option value at the selected attribute index is valid based
 * on the provided valid variant and the currently selected options
 * @param {Array<string>} variant
 *  A valid variant to parse (e.g. ['Large', 'Yellow', 'Polyester'])
 * @param {number} selectedAttributeIndex
 *  The index of the attribute the user selected
 * @param {Array<string>} currentlySelectedOptions
 *  Options that are currently selected
 * @returns {boolean}
 *  True, if the option is valid
 */
export function isOptionAtSelectedIndexValid(variant, selectedAttributeIndex, currentlySelectedOptions) {
    return variant.every((variantOption, optionIndex) => {
        const selectedOption = currentlySelectedOptions[optionIndex];

        return (
            optionIndex === selectedAttributeIndex || selectedOption === variantOption || selectedOption.length === 0
        );
    });
}

/**
 * Returns a set of available options from the attribute the user selected.
 *
 * The list of available options is returned as a Set to remove duplicated option values.
 * Removing duplicated values has little effect on performance,
 * but it's done here to prevent confusion in the future.
 * @param {number} selectedAttributeIndex
 * The index of the attribute the user just selected, e.g.
 * `1` if the user selected the color attribute from a list of attributes like ['Size', 'Color', 'Material']
 * @param {Array<string>} currentlySelectedOptions
 * The currently selected variant options, e.g.
 * ['Small', 'Red', 'Cotton']
 * @param {Array<Array<string>>} validVariantsList
 * A list of valid variants, e.g.
 * [
 *   ['Small', 'Blue', 'Cotton'],
 *   ['Medium', 'Yellow', 'Cotton'],
 *   ...,
 * ]
 * @returns {Set<string>}
 * Set of available options from the attribute the user selected.
 * Empty Set if there are no available options.
 */
export function getAvailableOptions(selectedAttributeIndex, currentlySelectedOptions, validVariantsList) {
    return new Set(
        validVariantsList
            ?.filter((variant) =>
                isOptionAtSelectedIndexValid(variant, selectedAttributeIndex, currentlySelectedOptions)
            )
            .map((filteredOptions) => filteredOptions[selectedAttributeIndex])
    );
}

/**
 * @param {string} [productClass] The product's class
 * @returns {boolean} Returns whether the product has either 'Variation', or 'VariationParent' as its class.
 */
export function isVariantSupportedProductClass(productClass) {
    return variantSupportedProductClasses.has(productClass);
}

/**
 * Transform Variant Attributes to a consumable form
 * @param {?{[key: string]: *}} [attributeInfo] The product's variation attribute information
 * @returns {Array<JsonData>} The consumable/normalized form of the variation attribute information
 */
export const transformVariantOptions = (attributeInfo) => {
    return Object.values(attributeInfo || [])
        .filter(Boolean)
        .map((attribute) => {
            const options = (attribute?.availableValues || []).map((value) => ({
                label: value,
                value: value,
            }));
            return {
                id: attribute?.fieldEnumOrId,
                label: attribute?.label,
                sequence: attribute?.sequence,
                options,
            };
        })
        .sort((attribute1, attribute2) => {
            return attribute1?.sequence - attribute2?.sequence;
        });
};

/**
 * Transform selected attributes to a string array
 * @param {?{[key: string]: *}} [attributes] The product's variation attributes
 * @param {?Array<JsonData>} [attributeInfo] The normalized form of the product's variation attribute information
 * @returns {Array<*>} The consumable/normalized form of the selected options
 * @example
 * Input:
 *   attributes: {
 *     Color__c : 'Red',
 *     Material__c : 'Polyester',
 *   }
 *
 *   variationAttributeInfo: {
 *     Material__c: {
 *       sequence: 1,
 *     },
 *     Color__c: {
 *       sequence: 0,
 *     },
 *   }
 * Output:
 *   ['Red', 'Polyester']
 */
export const transformSelectedOptions = (attributes, attributeInfo) => {
    if (attributes == null || attributeInfo == null) {
        return [];
    }
    const transformedAttributes = Object.keys(attributes).reduce((acc, attributeKey) => {
        return attributeInfo[attributeKey]
            ? [
                  ...acc,
                  {
                      value: attributes[attributeKey],
                      sequence: attributeInfo[attributeKey].sequence,
                  },
              ]
            : acc;
    }, []);
    return transformedAttributes.sort((attr1, attr2) => attr1.sequence - attr2.sequence).map((attr) => attr.value);
};

/**
 * Transform Variant Attributes list to a map
 * @param {Array<JsonData>} [attributesToProductMappings] The product's variation attributes mapping
 * @returns {Map<string, {[key: string]: Array<string>}>} The consumable/normalized form of the variation attributes mapping
 * @example
 * Input:
 *   [
 *     {
 *       canonicalKey: 'Red_Large_Polyester',
 *       productId: '01txx0000006iTlAAI',
 *       selectedAttributes: [
 *         {
 *           //...
 *           value: 'Red',
 *         },
 *         {
 *           //...
 *           value: 'Large',
 *         },
 *         {
 *           //...
 *           value: 'Polyester',
 *         },
 *       ],
 *      urlName: 'friendly_url'
 *     },
 *   ]
 *
 * Output:
 *   new Map([
 *     Red_Large_Polyester, {
 *       productId: '01txx0000006iTlAAI',
 *       attributes: ['Red', 'Large', 'Polyester'],
 *       urlName: 'friendly_url'
 *     }
 *   ])
 */
export const transformVariantSelectionToProductIdMap = (attributesToProductMappings = []) =>
    attributesToProductMappings.reduce((attributesToProductIdMap, item) => {
        if (item.canonicalKey && item.productId) {
            attributesToProductIdMap.set(item.canonicalKey, {
                productId: item.productId,
                attributes: item.selectedAttributes.map((attribute) => attribute.value),
                urlName: item.urlName,
            });
        }
        return attributesToProductIdMap;
    }, new Map());

/**
 * Transform Variant Attributes list to a list of available variant options
 * @param {Array<JsonData>} [attributesToProductMappings] The product's variation attributes mapping
 * @returns {Array<Array<string>>} A list of available variant options
 * @example
 * [
 *   ['Red', 'Large'],
 *   ['Blue', 'Small'],
 * ]
 */
export function transformValidVariantsList(attributesToProductMappings = []) {
    const variantSelectionToProductIdMap = transformVariantSelectionToProductIdMap(attributesToProductMappings);
    return [...variantSelectionToProductIdMap].map((item) => item[1].attributes);
}

/**
 * Computes a state object with properties that can be consumed by the variant selector component.
 * @param {{[key: string]: any}} [product] The product to compute variant state from
 * @returns {JsonData} An object with the following state values:
 *      - Product variants
 *      - Whether variants should be displayable
 *      - Which variant(s) are selected
 *      - A selection to product id map
 *      - A list of valid variants
 */
export function getVariantStateFromProduct(product) {
    const variants = transformVariantOptions(product?.variationInfo?.variationAttributeInfo);
    return {
        variants,
        selected: transformSelectedOptions(
            product?.variationAttributeSet?.attributes,
            product?.variationInfo?.variationAttributeInfo
        ),
        selectionToProductIdMap: transformVariantSelectionToProductIdMap(
            product?.variationInfo?.attributesToProductMappings
        ),
        validVariants: transformValidVariantsList(product?.variationInfo?.attributesToProductMappings),
    };
}
