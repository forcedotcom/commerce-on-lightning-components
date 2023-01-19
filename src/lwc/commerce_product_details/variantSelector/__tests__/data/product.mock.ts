import type { ProductVariationAttributeInfoData, ProductVariationAttributeSetData } from 'commerce/productApi';
import type { VariationInfo } from 'commerce_product_details/variantSelector';

export const variationAttributeInfo: Record<string, ProductVariationAttributeInfoData> = {
    Size_weight__c: {
        allowableValues: ['100g', '250g', '500g', '1kg'],
        apiName: 'Size_weight__c',
        availableValues: ['250g', '500g'],
        fieldEnumOrId: '00NR0000001qPsS',
        label: 'Size',
        objectName: 'ProductAttribute',
        sequence: 1,
    },
    CerealFlavour__c: {
        allowableValues: ['Plain', 'Strawberry', 'Wild-Berries', 'Nut-Mix'],
        apiName: 'CerealFlavour__c',
        availableValues: ['Plain', 'Nut-Mix'],
        fieldEnumOrId: '00NR0000001qQVy',
        label: 'Flavour',
        objectName: 'ProductAttribute',
        sequence: 0,
    },
    CerealColor__c: {
        allowableValues: [],
        apiName: 'CerealColor__c',
        availableValues: null,
        fieldEnumOrId: '00NR0000001qPsY',
        label: 'Color',
        objectName: 'ProductAttribute',
        sequence: 2,
    },
};

export const variant: VariationInfo[] = [
    {
        id: '00NR0000001qQVy',
        label: 'Flavour',
        sequence: 0,
        options: [
            {
                label: 'Plain',
                value: 'Plain',
            },
            {
                label: 'Nut-Mix',
                value: 'Nut-Mix',
            },
        ],
    },
    {
        id: '00NR0000001qPsS',
        label: 'Size',
        sequence: 1,
        options: [
            {
                label: '250g',
                value: '250g',
            },
            {
                label: '500g',
                value: '500g',
            },
        ],
    },
    {
        id: '00NR0000001qPsY',
        label: 'Color',
        sequence: 2,
        options: [],
    },
];

export const selectedOptions = ['Nut-Mix', null, null];

export const variationAttributeSet: ProductVariationAttributeSetData = {
    attributes: { CerealFlavour__c: 'Nut-Mix', Size_weight__c: null, CerealColor__c: null, CerealUnknown__c: null },
    developerName: 'Cereal',
    id: null,
};

export const attributesToProductMappings = [
    {
        canonicalKey: 'Nut-Mix_500g',
        productId: '01tR0000000maX0IAI',
        selectedAttributes: [
            { apiName: 'CerealFlavour__c', label: 'Flavour', sequence: 0, value: 'Nut-Mix' },
            { apiName: 'Size_weight__c', label: 'Size', sequence: 1, value: '500g' },
        ],
    },
    {
        canonicalKey: 'Plain_500g',
        productId: '01tR0000000maWlIAI',
        selectedAttributes: [
            { apiName: 'CerealFlavour__c', label: 'Flavour', sequence: 0, value: 'Plain' },
            { apiName: 'Size_weight__c', label: 'Size', sequence: 1, value: '500g' },
        ],
    },
    {
        canonicalKey: 'Nut-Mix_250g',
        productId: '01tR0000000maWgIAI',
        selectedAttributes: [
            { apiName: 'CerealFlavour__c', label: 'Flavour', sequence: 0, value: 'Nut-Mix' },
            { apiName: 'Size_weight__c', label: 'Size', sequence: 1, value: '250g' },
        ],
    },
    {
        canonicalKey: 'Plain_250g',
        productId: '01tR0000000maWVIAY',
        selectedAttributes: [
            { apiName: 'CerealFlavour__c', label: 'Flavour', sequence: 0, value: 'Plain' },
            { apiName: 'Size_weight__c', label: 'Size', sequence: 1, value: '250g' },
        ],
    },
    {
        canonicalKey: null,
        productId: '01tR0000000maWVIAY',
        selectedAttributes: [
            { apiName: 'CerealFlavour__c', label: 'Flavour', sequence: 0, value: 'Plain' },
            { apiName: 'Size_weight__c', label: 'Size', sequence: 1, value: '250g' },
        ],
    },
    {
        canonicalKey: 'Plain_0g',
        productId: null,
        selectedAttributes: [],
    },
];

export const variantSelectionToProductIdMap = new Map([
    [
        'Nut-Mix_500g',
        {
            productId: '01tR0000000maX0IAI',
            attributes: ['Nut-Mix', '500g'],
        },
    ],
    ['Plain_500g', { productId: '01tR0000000maWlIAI', attributes: ['Plain', '500g'] }],
    [
        'Nut-Mix_250g',
        {
            productId: '01tR0000000maWgIAI',
            attributes: ['Nut-Mix', '250g'],
        },
    ],
    ['Plain_250g', { productId: '01tR0000000maWVIAY', attributes: ['Plain', '250g'] }],
]);

export const availableVariantOptions = [
    ['Nut-Mix', '500g'],
    ['Plain', '500g'],
    ['Nut-Mix', '250g'],
    ['Plain', '250g'],
];
