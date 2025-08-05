/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */

// Base product data with realistic structure
const baseProductData = {
    id: '701643472246M',
    name: 'Mini Print Jacket',
    dscr: 'This mini-print jacket with seaming detail and two front pockets is a wardrobe completer.',
    slugUrl: 'https://www.phased-launch-testing.com/mini-print-jacket/701643472246M.html?lang=en_US',
    baseUrl: 'https://www.phased-launch-testing.com/on/demandware.static/-/Sites-apparel-m-catalog/default/',
    imageUrl:
        'https://www.phased-launch-testing.com/on/demandware.static/-/Sites-apparel-m-catalog/default/dwd85244e4/images/large/PG.10232592.JJ0DDXX.PZ.jpg',
    pr: {
        cur: 110.99,
        orig: 110.99,
    },
    ccy: 'USD',
    features: [
        'Comfortable and stylish design',
        'Premium quality fabric construction',
        'Available in multiple sizes and colors',
    ],
    quantity: {
        minQuantity: 0.5,
        maxQuantity: 10.0,
        increment: 0.5,
    },
    dfOrd: true,
};

// Default image groups for the product
const defaultImageGroups = [
    {
        imgs: [
            {
                alt: 'Mini Print Jacket, Black & White, large',
                url: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZEU_052/on/demandware.static/-/Sites-apparel-m-catalog/default/dw7b33c762/images/large/PG.10215243.JJDS0XX.PZ.jpg',
                title: 'Mini Print Jacket, Black & White',
            },
            {
                alt: 'Mini Print Jacket, Black & White, large',
                url: 'https://www.phased-launch-testing.com/on/demandware.static/-/Sites-apparel-m-catalog/default/dw8b04613e/images/large/PG.10232592.JJ0DDXX.BZ.jpg',
                title: 'Mini Print Jacket, Black & White',
            },
        ],
    },
];

// Color variant images
const colorVariantImages = [
    {
        imgs: [
            {
                alt: 'Mini Print Jacket, Black & White, large',
                url: 'https://www.phased-launch-testing.com/on/demandware.static/-/Sites-apparel-m-catalog/default/dwd85244e4/images/large/PG.10232592.JJ0DDXX.PZ.jpg',
                title: 'Mini Print Jacket, Black & White',
            },
        ],
        vattr: [
            {
                id: 'color',
                vals: ['JJI15XX'],
            },
        ],
        viewType: 'large',
    },
    {
        imgs: [
            {
                alt: 'Mini Print Jacket, Black & White, swatch',
                url: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZEU_052/on/demandware.static/-/Sites-apparel-m-catalog/default/dwd0f65a3e/images/swatch/PG.10217073.JJI15XX.CP.jpg',
                title: 'Mini Print Jacket, Black & White',
            },
        ],
        vattr: [
            {
                id: 'color',
                vals: ['JJI15XX'],
            },
        ],
        viewType: 'swatch',
    },
    {
        imgs: [
            {
                alt: 'Mini Print Jacket, Black, large',
                url: 'https://zzeu-052.dx.commercecloud.salesforce.com/on/demandware.static/-/Sites-apparel-m-catalog/default/dwaf088cc2/images/large/PG.10215243.JJ0NLB9.PZ.jpg',
                title: 'Mini Print Jacket, Black',
            },
        ],
        vattr: [
            {
                id: 'color',
                vals: ['JJ169XX'],
            },
        ],
        viewType: 'large',
    },
    {
        imgs: [
            {
                alt: 'Mini Print Jacket, Black, swatch',
                url: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZEU_052/on/demandware.static/-/Sites-apparel-m-catalog/default/dwd0f65a3e/images/swatch/PG.10217073.JJ169XX.CP.jpg',
                title: 'Mini Print Jacket, Black',
            },
        ],
        vattr: [
            {
                id: 'color',
                vals: ['JJ169XX'],
            },
        ],
        viewType: 'swatch',
    },
];

export const mockProduct = {
    ...baseProductData,
    imgGroups: [...defaultImageGroups, ...colorVariantImages],
    vattr: [
        {
            id: 'color',
            lbl: 'Color',
            selected: 'JJ169XX',
            opts: [
                {
                    name: 'Black & White',
                    val: 'JJI15XX',
                },
                {
                    name: 'Black',
                    val: 'JJ169XX',
                },
            ],
        },
        {
            id: 'size',
            lbl: 'Size',
            opts: [
                { name: '4', val: '004' },
                { name: '6', val: '006' },
                { name: '8', val: '008' },
                { name: '10', val: '010' },
                { name: '12', val: '012' },
                { name: '14', val: '014' },
                { name: '16', val: '016' },
            ],
        },
    ],
    vmat: [
        {
            pid: '701643472239M',
            vars: {
                color: 'JJI15XX',
                size: '006',
            },
            pr: {
                cur: 110.99,
                orig: 110.99,
            },
        },
        {
            pid: '701643472246M',
            vars: {
                color: 'JJI15XX',
                size: '008',
            },
            pr: {
                cur: 120.99,
                orig: 130.99,
            },
        },
        {
            pid: '701643472208M',
            vars: {
                color: 'JJI15XX',
                size: '016',
            },
            ord: false,
            pr: {
                cur: 200.99,
                orig: 210.99,
            },
        },
        {
            pid: '701643472192M',
            vars: {
                color: 'JJI15XX',
                size: '014',
            },
            ord: false,
            pr: {
                cur: 110.99,
                orig: 110.99,
            },
        },
        {
            pid: '701643472239M',
            vars: {
                color: 'JJ169XX',
                size: '006',
            },
            pr: {
                cur: 110.99,
                orig: 110.99,
            },
        },
        {
            pid: '701643472246M',
            vars: {
                color: 'JJ169XX',
                size: '008',
            },
            ord: false,
            pr: {
                cur: 125.99,
                orig: 130.99,
            },
        },
        {
            pid: '701643472208M',
            vars: {
                color: 'JJ169XX',
                size: '016',
            },
            pr: {
                cur: 120.99,
                orig: 110.99,
            },
        },
        {
            pid: '701643472192M',
            vars: {
                color: 'JJ169XX',
                size: '014',
            },
            ord: false,
            pr: {
                cur: 100.99,
                orig: 120.99,
            },
        },
    ],
};

// Product with single color variant for testing auto-selection
export const mockProductForVariantSelection = {
    ...baseProductData,
    imgGroups: [...defaultImageGroups, ...colorVariantImages.slice(0, 2)], // Only first two color variants
    vattr: [
        {
            id: 'color',
            lbl: 'Color',
            opts: [
                {
                    name: 'Black & White',
                    val: 'JJI15XX',
                },
            ],
        },
    ],
    vmat: [
        {
            pid: '701643472239M',
            vars: {
                color: 'JJI15XX',
            },
            ord: true,
            pr: {
                cur: 110.99,
                orig: 110.99,
            },
        },
    ],
};

// Product with no variants for testing edge cases
export const mockProductNoVariants = {
    ...baseProductData,
    imgGroups: defaultImageGroups,
    vattr: [],
    vmat: [],
};

// Product with null variants for testing edge cases
export const mockProductNullVariants = {
    ...baseProductData,
    imgGroups: defaultImageGroups,
    vattr: null,
    vmat: null,
};

// Product with empty variant matrix for testing edge cases
export const mockProductEmptyVmat = {
    ...baseProductData,
    imgGroups: [...defaultImageGroups, ...colorVariantImages],
    vattr: [
        {
            id: 'color',
            lbl: 'Color',
            opts: [
                {
                    name: 'Black',
                    val: 'JJ169XX',
                },
            ],
        },
    ],
    vmat: [],
};

// Product with non-orderable single option for testing edge cases
export const mockProductNonOrderableSingleOption = {
    ...baseProductData,
    imgGroups: [...defaultImageGroups, ...colorVariantImages],
    vattr: [
        {
            id: 'color',
            lbl: 'Color',
            opts: [
                {
                    name: 'Black',
                    val: 'JJ169XX',
                },
            ],
        },
    ],
    vmat: [
        {
            vars: { color: 'JJ169XX' },
            ord: false, // Not orderable
            pr: { cur: 110.99, orig: 110.99 },
        },
    ],
};

// Product with mixed variants (selected + single option) for testing
export const mockProductMixedVariants = {
    ...baseProductData,
    imgGroups: [...defaultImageGroups, ...colorVariantImages],
    vattr: [
        {
            id: 'color',
            lbl: 'Color',
            selected: 'JJ169XX',
            opts: [
                { val: 'JJ169XX', name: 'Black' },
                { val: 'JJI15XX', name: 'Blue' },
            ],
        },
        {
            id: 'size',
            lbl: 'Size',
            opts: [{ val: 'M', name: 'Medium' }],
        },
    ],
    vmat: [
        {
            vars: { color: 'JJ169XX', size: 'M' },
            ord: true,
            pr: { cur: 110.99, orig: 110.99 },
        },
    ],
};

// Product with different orderable states for testing
export const mockProductMixedOrderableStates = {
    ...baseProductData,
    imgGroups: [...defaultImageGroups, ...colorVariantImages],
    vattr: [
        {
            id: 'color',
            lbl: 'Color',
            selected: 'JJ169XX',
            opts: [
                { val: 'JJ169XX', name: 'Black' },
                { val: 'JJI15XX', name: 'Blue' },
            ],
        },
        {
            id: 'size',
            lbl: 'Size',
            opts: [{ val: 'M', name: 'Medium' }],
        },
        {
            id: 'style',
            lbl: 'Style',
            opts: [{ val: 'CASUAL', name: 'Casual' }],
        },
    ],
    vmat: [
        {
            vars: { color: 'JJ169XX', size: 'M', style: 'CASUAL' },
            ord: false, // Not orderable
            pr: { cur: 110.99, orig: 110.99 },
        },
        {
            vars: { color: 'JJ169XX', size: 'M', style: 'FORMAL' },
            ord: true,
            pr: { cur: 120.99, orig: 120.99 },
        },
    ],
};
