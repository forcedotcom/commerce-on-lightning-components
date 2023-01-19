import type {
    ProductDetailData,
    ProductVariationAttributeInfoData,
    ProductVariationAttributeSetData,
} from 'commerce/productApi';
import type { VariationInfo } from 'commerce_product_details/variantSelector';

const productDetailData: ProductDetailData = {
    attributeSetInfo: {
        Cereal: {
            attributeInfo: {
                CerealFlavour__c: {
                    allowableValues: ['Plain', 'Strawberry', 'Wild-Berries', 'Nut-Mix'],
                    apiName: 'CerealFlavour__c',
                    availableValues: ['Plain', 'Nut-Mix'],
                    fieldEnumOrId: '00NR0000001qQVy',
                    label: 'Flavour',
                    objectName: 'ProductAttribute',
                    sequence: 0,
                },
                Size_weight__c: {
                    allowableValues: ['100g', '250g', '500g', '1kg'],
                    apiName: 'Size_weight__c',
                    availableValues: ['250g', '500g'],
                    fieldEnumOrId: '00NR0000001qPsS',
                    label: 'Size',
                    objectName: 'ProductAttribute',
                    sequence: 1,
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
                CerealUnknown__c: {
                    allowableValues: [],
                    apiName: 'CerealUnknown__c',
                    availableValues: null,
                    fieldEnumOrId: '00NR0000001qPsX',
                    label: 'Unknown',
                    objectName: 'ProductAttribute',
                    sequence: 3,
                },
            },
            description: null,
            developerName: 'Cereal',
            id: '0iYR000000000IoMAI',
            masterLabel: 'Cereal',
            sequence: null,
        },
    },
    defaultImage: {
        alternateText: '',
        contentVersionId: null,
        id: null,
        mediaType: 'Image',
        sortOrder: 0,
        thumbnailUrl: null,
        title: 'image',
        url: '/img/b2b/default-product-image.svg',
    },
    fields: {
        LastModifiedDate: '2021-07-06T15:21:33Z',
        DisplayUrl: null,
        IsDeleted: 'false',
        Description: 'Cereals are great',
        ProductCode: null,
        IsActive: 'true',
        ExternalId: null,
        LastViewedDate: null,
        LastReferencedDate: null,
        StockKeepingUnit: '0123456789',
        Name: 'Oat Flakes',
        SystemModstamp: '2021-07-06T17:49:00Z',
        IsArchived: 'false',
        Type: 'Base',
        CreatedById: '005R0000000yGbu',
        CloneSourceId: null,
        QuantityUnitOfMeasure: null,
        CreatedDate: '2021-07-06T14:10:13Z',
        Family: null,
        ProductClass: 'VariationParent',
        LastModifiedById: '005R0000000yGbu',
    },
    id: '01tR0000000maWQIAY',
    mediaGroups: [
        {
            developerName: 'productListImage',
            id: '2mgR00000001VDcIAM',
            mediaItems: [
                {
                    alternateText: '',
                    contentVersionId: null,
                    id: null,
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image',
                    url: '/img/b2b/default-product-image.svg',
                },
            ],
            name: 'Product List Image',
            usageType: 'Listing',
        },
        {
            developerName: 'productDetailImage',
            id: '2mgR00000001VDbIAM',
            mediaItems: [
                {
                    alternateText: 'Alternate Text Media',
                    contentVersionId: null,
                    id: '0123456789',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: '/img/b2b/default-thumbnail-product-image.svg',
                    title: 'image',
                    url: '/img/b2b/default-product-image.svg',
                },
                {
                    alternateText: 'Alternative Text Media',
                    contentVersionId: null,
                    id: '1234567890',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image',
                    url: '/img/b2b/default-product-image.svg',
                },
            ],
            name: 'Product Detail Images',
            usageType: 'Standard',
        },
    ],
    primaryProductCategoryPath: { path: [{ description: null, id: '0ZGR00000000XqpOAE', name: 'Cereal' }] },
    productClass: 'VariationParent',
    purchaseQuantityRule: null,
    variationAttributeSet: {
        attributes: { CerealFlavour__c: 'Nut-Mix', Size_weight__c: null, CerealColor__c: null, CerealUnknown__c: null },
        developerName: 'Cereal',
        id: null,
    },
    variationInfo: {
        attributesToProductMappings: [
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
        ],
        variationAttributeInfo: {
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
        },
    },
    variationParentId: null,
};

export const getProductDetailData = (variantNull = false, hasAttributeInfo = true): ProductDetailData => ({
    ...productDetailData,
    purchaseQuantityRule: {
        minimum: '2',
        maximum: '100',
        increment: '2',
    },
    ...(variantNull || !hasAttributeInfo
        ? {
              variationAttributeSet: null,
              mediaGroups: [],
          }
        : {}),
    ...(variantNull ? { variationInfo: null } : {}),
    ...(!hasAttributeInfo
        ? {
              variationInfo: {
                  variationAttributeInfo: {},
                  attributesToProductMappings: [],
              },
          }
        : {}),
});

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
