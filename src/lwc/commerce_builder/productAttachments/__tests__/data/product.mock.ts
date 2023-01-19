import type {
    ProductDetailData,
    ProductVariationAttributeInfoData,
    ProductVariationAttributeSetData,
} from 'commerce/productApi';
import type { VariationInfo } from 'commerce_product_details/variantSelector';

const productDetailData: ProductDetailData = {
    defaultImage: {
        alternateText: null,
        contentVersionId: '5OUxx0000004CAzGAM',
        id: '2pmxx000000000zAAA',
        mediaType: 'Image',
        sortOrder: 0,
        thumbnailUrl: null,
        title: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpine-energy-gobar-cranberryjpg',
        url: 'https://s3.amazonaws.com/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-energy-goBAR-cranberry.jpg',
    },
    fields: {
        LastModifiedDate: '2022-06-09T20:29:11Z',
        DisplayUrl: null,
        IsDeleted: 'false',
        Description:
            'Alpine Cranberry Vegan GoBar is a grab and go Vegan Protein performance bar. Engineered for athletes, GoBar helps you achieve your daily protein intake while keeping you full.',
        ProductCode: null,
        IsActive: 'true',
        ExternalId: null,
        LastViewedDate: '2022-06-16T23:56:12Z',
        LastReferencedDate: '2022-06-16T23:56:12Z',
        StockKeepingUnit: '6010027',
        ExternalDataSourceId: null,
        Name: 'GoBar Cranberry Vegan, 2oz - 6 pack',
        SystemModstamp: '2022-06-09T20:29:11Z',
        IsArchived: 'false',
        Type: null,
        CreatedById: '005xx000001X7ib',
        CloneSourceId: null,
        QuantityUnitOfMeasure: null,
        CreatedDate: '2022-06-09T20:29:11Z',
        Family: 'Alpine Nutrition',
        ProductClass: 'Simple',
        LastModifiedById: '005xx000001X7ib',
    },
    id: '01txx0000006i7eAAA',
    mediaGroups: [
        {
            developerName: 'productListImage',
            id: '2mgxx0000000002AAA',
            mediaItems: [
                {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CATGA2',
                    id: '2pmxx000000000jAAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpine-energy-gobar-cranberryjpg',
                    url: 'https://s3.amazonaws.com/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-energy-goBAR-cranberry.jpg',
                },
            ],
            name: 'Product List Image',
            usageType: 'Attachment',
        },
        {
            developerName: 'productDetailImage',
            id: '2mgxx0000000001AAA',
            mediaItems: [
                {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CAzGAM',
                    id: '2pmxx000000000zAAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpine-energy-gobar-cranberryjpg',
                    url: 'https://s3.amazonaws.com/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-energy-goBAR-cranberry.jpg',
                },
            ],
            name: 'Product Detail Images',
            usageType: 'Standard',
        },
    ],
    primaryProductCategoryPath: {
        path: [
            {
                description: null,
                id: '0ZGxx000000003FGAQ',
                name: 'Energy',
            },
            {
                description: null,
                id: '0ZGxx000000003IGAQ',
                name: 'Energy Bars',
            },
        ],
    },
    productClass: 'Simple',
    purchaseQuantityRule: null,
    variationAttributeSet: null,
    variationInfo: null,
    variationParentId: null,
    attributeSetInfo: null,
};

export const getProductDetailData = (
    nullUrl = false,
    variantNull = false,
    hasAttributeInfo = true
): ProductDetailData => ({
    ...productDetailData,
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
    ...(nullUrl
        ? {
              mediaGroups: [
                  {
                      developerName: 'productListImage',
                      id: '2mgxx0000000002AAA',
                      mediaItems: [
                          {
                              alternateText: null,
                              contentVersionId: '5OUxx0000004CATGA2',
                              id: '2pmxx000000000jAAA',
                              mediaType: 'Image',
                              sortOrder: 0,
                              thumbnailUrl: null,
                              title: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpine-energy-gobar-cranberryjpg',
                              url: null,
                          },
                      ],
                      name: 'Product List Image',
                      usageType: 'Attachment',
                  },
              ],
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
