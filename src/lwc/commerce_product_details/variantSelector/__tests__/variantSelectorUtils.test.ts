import {
    isOptionAtSelectedIndexValid,
    getAvailableOptions,
    transformVariantOptions,
    transformSelectedOptions,
    transformVariantSelectionToProductIdMap,
    transformValidVariantsList,
} from '../variantSelectorUtils';
import {
    variationAttributeInfo,
    variant,
    selectedOptions,
    variationAttributeSet,
    attributesToProductMappings,
    variantSelectionToProductIdMap,
    availableVariantOptions,
} from './data/product.mock';

// Falsy test data
const variantsWithNoValidOption = [
    // Example of a garment product
    // [Size, Color, Material, SizeOfPocket]
    ['Small', 'Red', 'Cotton', 'Small_Pocket'],
    ['Small', 'Blue', 'Cotton', 'Medium_Pocket'],
    ['Medium', 'Blue', 'Cotton', 'Small_Pocket'],
    ['Large', 'Yellow_Orange', 'Polyester', 'Small_Pocket'],
    ['Large', 'Yellow_Orange', 'Polyester', 'Medium_Pocket'],
];

// Truthy test data
const currentlySelectedOptionsList = [
    // Example of a garment product
    // [Size, Color, Material, SizeOfPocket]
    ['', '', '', ''],
    ['', 'Yellow_Orange', '', ''],
    ['', 'Yellow_Orange', 'Cotton', 'Small_Pocket'],
    ['Large', 'Yellow_Orange', 'Cotton', 'Small_Pocket'],
    ['Large', 'Yellow_Orange', 'Polyester', 'Small_Pocket'],
];

const validVariantsList = [
    // Example of a garment product
    // [Size, Color, Material, SizeOfPocket]
    ['Small', 'Red', 'Cotton', 'Small_Pocket'],
    ['Small', 'Blue', 'Cotton', 'Medium_Pocket'],
    ['Medium', 'Yellow_Orange', 'Cotton', 'Large_Pocket'],
    ['Medium', 'Blue', 'Cotton', 'Large_Pocket'],
    ['Large', 'Yellow_Orange', 'Polyester', 'Small_Pocket'],
    ['Large', 'Yellow_Orange', 'Polyester', 'Medium_Pocket'],
];

describe('commerce_product_details-variant-selector: isOptionAtSelectedIndexValid()', () => {
    variantsWithNoValidOption.forEach((validVariant) => {
        it(`returns false for a variant that does not have a valid option at the selected attribute index, where
            the valid variant is ${JSON.stringify(validVariant)}`, () => {
            const selectedAttributeIndex = 1;
            const currentlySelectedOptions = ['Medium', 'Blue', 'Cotton', 'Large'];
            const isOptionAtSelectedIndexValidVal = isOptionAtSelectedIndexValid(
                validVariant,
                selectedAttributeIndex,
                currentlySelectedOptions
            );
            expect(isOptionAtSelectedIndexValidVal).toBe(false);
        });
    });

    currentlySelectedOptionsList.forEach((currentlySelectedOptions) => {
        it(`returns true for a variant that has a valid option at the selected attribute index, where
            the currently selected options are ${JSON.stringify(currentlySelectedOptions)}`, () => {
            const validVariant = ['Large', 'Yellow_Orange', 'Cotton', 'Small_Pocket'];
            const selectedAttributeIndex = 2;
            const isOptionAtSelectedIndexValidVal = isOptionAtSelectedIndexValid(
                validVariant,
                selectedAttributeIndex,
                currentlySelectedOptions
            );
            expect(isOptionAtSelectedIndexValidVal).toBe(true);
        });
    });
});

describe('commerce_product_details-variant-selector/utils: getAvailableOptions()', () => {
    it('returns an empty set if there are no valid options', () => {
        const selectedAttributeIndex = 1;
        const currentlySelectedOptions = ['Medium', 'Blue', 'Cotton', 'Small_Pocket'];
        const expectedAvailableOptionsVal = getAvailableOptions(
            selectedAttributeIndex,
            currentlySelectedOptions,
            validVariantsList
        );
        expect(expectedAvailableOptionsVal.size).toBe(0);
    });

    [
        {
            selectedAttributeIndex: 0,
            currentlySelectedOptions: ['Medium', 'Blue', 'Cotton', 'Large_Pocket'],
            actualAvailableOptionsVal: ['Medium'],
        },
        {
            selectedAttributeIndex: 1,
            currentlySelectedOptions: ['Medium', 'Blue', 'Cotton', 'Large_Pocket'],
            actualAvailableOptionsVal: ['Yellow_Orange', 'Blue'],
        },
        {
            selectedAttributeIndex: 3,
            currentlySelectedOptions: ['', 'Blue', '', ''],
            actualAvailableOptionsVal: ['Medium_Pocket', 'Large_Pocket'],
        },
    ].forEach((item) => {
        it('returns a set of options if there are valid options', () => {
            const expectedAvailableOptionsVal = getAvailableOptions(
                item.selectedAttributeIndex,
                item.currentlySelectedOptions,
                validVariantsList
            );
            expect(Array.from(expectedAvailableOptionsVal)).toEqual(
                expect.arrayContaining(item.actualAvailableOptionsVal)
            );
        });
    });
});

describe('commerce_product_details/variantSelector#transformVariantOptions', () => {
    it('should transform Variant Attributes to a consumable form', () => {
        expect(transformVariantOptions(variationAttributeInfo)).toEqual(variant);
    });

    it(`should return empty array when attributeInfo is not available`, () => {
        expect(transformVariantOptions({})).toStrictEqual([]);
        expect(transformVariantOptions(null)).toStrictEqual([]);
        expect(transformVariantOptions(undefined)).toStrictEqual([]);
    });
});

describe('commerce_product_details/variantSelector#transformSelectedOptions', () => {
    it('should transform selected attributes to a string array', () => {
        expect(transformSelectedOptions(variationAttributeSet.attributes, variationAttributeInfo)).toEqual(
            selectedOptions
        );
    });

    it('should return empty array when attributes or variationAttributeInfo is not available', () => {
        expect(transformSelectedOptions(undefined, undefined)).toEqual([]);
    });
});

describe('commerce_product_details/variantSelector#transformVariantSelectionToProductIdMap', () => {
    it('should transform Variant Attributes list to a map', () => {
        expect(transformVariantSelectionToProductIdMap(attributesToProductMappings)).toEqual(
            variantSelectionToProductIdMap
        );
    });

    it(`should return empty map for undefined when attributesToProductMappings is not available`, () => {
        expect(transformVariantSelectionToProductIdMap(undefined)).toEqual(new Map());
    });
});

describe('commerce_product_details/variantSelector#transformValidVariantsList', () => {
    it('should transform Variant Attributes list to a list of available variant options', () => {
        expect(transformValidVariantsList(attributesToProductMappings)).toEqual(availableVariantOptions);
    });

    it(`should return empty array when attributesToProductMappings is not available`, () => {
        expect(transformValidVariantsList(undefined)).toEqual([]);
    });
});
