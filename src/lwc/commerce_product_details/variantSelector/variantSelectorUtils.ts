import type {
    ProductDetailData,
    ProductVariationAttributeInfoData,
    ProductVariationAttributeMappingsData,
} from 'commerce/productApi';
import type { VariationInfo } from './types';

// Set of product classes that allow a product to have a variant selector section
const variantSupportedProductClasses = new Set(['Variation', 'VariationParent']);

/**
 * Determines if option value at the selected attribute index is valid based
 * on the provided valid variant and the currently selected options
 *
 * @param {string[]} variant
 *  A valid variant to parse (e.g. ['Large', 'Yellow', 'Polyester'])
 * @param {number} selectedAttributeIndex
 *  The index of the attribute the user selected
 * @param {string[]} currentlySelectedOptions
 *  Options that are currently selected
 * @returns {boolean}
 *  True, if the option is valid
 */
export function isOptionAtSelectedIndexValid(
    variant: string[],
    selectedAttributeIndex: number,
    currentlySelectedOptions: string[]
): boolean {
    return variant.every((variantOption, optionIndex) => {
        const selectedOption = currentlySelectedOptions[optionIndex];
        // The first condition simply states that we only need to compare option values for the attributes
        // that the user has not selected. So we ignore the variant option value at the selected attribute
        // index and move on to the next option index if the first condition evaluates to false.
        // The second and third conditions state that if
        //     - the selected option value does not match the corresponding variant option value
        //     - and the selected option is not an empty string (i.e. an unselected attribute)
        // then the variant option value at the selected attribute index is not valid.
        // See a visualized example of this logic here https://salesforce.quip.com/cCjuAVseNIag#LHOACAhWVjD
        return !(
            optionIndex !== selectedAttributeIndex &&
            selectedOption !== variantOption &&
            selectedOption.length !== 0
        );
    });
}

/**
 * Returns a set of available options from the attribute the user selected.
 *
 * The list of available options is returned as a Set to remove duplicated option values.
 * Removing duplicated values has little effect on performance,
 * but it's done here to prevent confusion in the future.
 *
 * @param {number} selectedAttributeIndex
 *  The index of the attribute the user just selected
 *      (e.g. 1 if the user selected the color attribute from a list of attributes ['Size', 'Color', 'Material'])
 * @param {string[]} currentlySelectedOptions
 * The currently selected variant options
 *      (e.g. ['Small', 'Red', 'Cotton'])
 * @param {Array<string[]>} validVariantsList
 * A list of valid variants
 *      (e.g. [
 *              ['Small', 'Blue', 'Cotton'],
 *              ['Medium', 'Yellow', 'Cotton'],
 *               ...
 *            ])
 * @returns {Set}
 *  Set of available options from the attribute the user selected
 *  Empty Set if there are no available options
 */
export function getAvailableOptions(
    selectedAttributeIndex: number,
    currentlySelectedOptions: string[],
    validVariantsList: string[][]
): Set<string> {
    const availableOptions = validVariantsList
        .filter((variant) => isOptionAtSelectedIndexValid(variant, selectedAttributeIndex, currentlySelectedOptions))
        .map((filteredOptions) => filteredOptions[selectedAttributeIndex]);

    return new Set(availableOptions);
}

export function isVariantSupportedProductClass(productClass: string | undefined): boolean {
    return variantSupportedProductClasses.has(productClass as string);
}

/**
 * Transform Variant Attributes to a consumable form
 */
export const transformVariantOptions = (
    attributeInfo: Record<string, ProductVariationAttributeInfoData> | null | undefined
): VariationInfo[] => {
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
 *
 * @example
 * Input:
 attributes : {
                Color__c : 'Red',
                Material__c : 'Polyester'
            }

 variationAttributeInfo: {
                Material__c: {
                    sequence: 1
                },
                Color__c: {
                    sequence: 0
                }
            }
 Output:
 ['Red', 'Polyester']
 *
 */
export const transformSelectedOptions = (
    attributes: Record<string, unknown> | null | undefined,
    variationAttributeInfo: Record<string, ProductVariationAttributeInfoData> | null | undefined
): unknown[] => {
    if (attributes == null || variationAttributeInfo == null) {
        return [];
    }

    const transformedAttributes = Object.keys(attributes).reduce((acc, attributeKey) => {
        return variationAttributeInfo[attributeKey]
            ? [...acc, { value: attributes[attributeKey], sequence: variationAttributeInfo[attributeKey].sequence }]
            : acc;
    }, [] as { value: unknown; sequence: number }[]);

    return transformedAttributes
        .sort((attr1, attr2) => {
            return attr1.sequence - attr2.sequence;
        })
        .map((attr) => attr.value);
};

/**
 * Transform Variant Attributes list to a map
 *
 * @example
 * Input:
 *  [
 *      {
 *          canonicalKey: 'Red_Large_Polyester',
 *          productId: '01txx0000006iTlAAI',
 *          selectedAttributes: [
 *              {
 *                  //...
 *                  value: 'Red'
 *              },
 *              {
 *                   //...
 *                  value: 'Large'
 *              },
 *              {
 *                   //...
 *                  value: 'Polyester'
 *              }
 *          ]
 *      }
 * ]
 *
 * Output:
 * new Map([
 *      Red_Large_Polyester, {
 *          productId: '01txx0000006iTlAAI',
 *          attributes: ['Red', 'Large', 'Polyester']
 *      }
 * ])
 */
export const transformVariantSelectionToProductIdMap = (
    attributesToProductMappings: ProductVariationAttributeMappingsData[] = []
): Map<string, Record<string, string[]>> =>
    attributesToProductMappings.reduce((attributesToProductIdMap, item) => {
        if (item.canonicalKey && item.productId) {
            attributesToProductIdMap.set(item.canonicalKey, {
                productId: item.productId,
                attributes: item.selectedAttributes.map((attribute) => attribute.value),
            });
        }
        return attributesToProductIdMap;
    }, new Map());

/**
 * Transform Variant Attributes list to a list of available variant options
 *
 * @type {ProductVariationAttributeMappingsData[]}
 * @example
 * [
 *      ['Red', 'Large'],
 *      ['Blue', 'Small']
 * ]
 */
export const transformValidVariantsList = (
    attributesToProductMappings: ProductVariationAttributeMappingsData[] = []
): string[][] => {
    const variantSelectionToProductIdMap = transformVariantSelectionToProductIdMap(attributesToProductMappings);
    return [...variantSelectionToProductIdMap].map((item) => item[1].attributes);
};

export interface VariantSelectorProductState {
    isDisplayable: boolean;
    variants: VariationInfo[];
    validVariants: string[][];
    selected: unknown[];
    selectionToProductIdMap: Map<string, Record<string, unknown>>;
}

/**
 * Computes a state object with properties that can be consumed by the variant selector component.
 * @params [product] The product to compute variant state from.
 * @returns An object with the following state values:
 *      - Product variants
 *      - Whether variants should be displayable
 *      - Which variant(s) are selected
 *      - A selection to product id map
 *      - A list of valid variants
 */
export function getVariantStateFromProduct(product?: ProductDetailData): VariantSelectorProductState {
    const variants = transformVariantOptions(product?.variationInfo?.variationAttributeInfo);

    return {
        variants,
        isDisplayable: isVariantSupportedProductClass(product?.productClass) && Boolean(variants.length),
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
