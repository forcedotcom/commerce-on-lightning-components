import type { NormalizedFacetSummary, SearchFacet } from 'commerce/searchApiInternal';
import type { ProductSearchCategoryData } from 'commerce/productApiInternal';
import {
    createTreeFromCategory,
    transformInputFacetLabels,
    normalizeRefinements,
    prepareRefinementsForRequest,
} from 'commerce_search/facetsLib';

// Category Mock Data
const categoryData: ProductSearchCategoryData = {
    category: {
        id: '',
        name: 'All Categories',
    },
    productCount: 100,
    children: [
        {
            category: {
                id: '1A',
                name: 'Home Decor',
            },
            productCount: 25,
            children: [],
        },
    ],
};

const firstLevelSubCategoryData: ProductSearchCategoryData = {
    category: {
        id: '1A',
        name: 'Home Decor',
    },
    productCount: 25,
    children: [
        {
            category: {
                id: '2A',
                name: 'Home Decor1',
            },
            productCount: 12,
            children: [],
        },
    ],
};

const secondLevelSubCategoryData: ProductSearchCategoryData = {
    category: {
        id: '2A',
        name: 'Home Decor1',
    },
    productCount: 12,
    children: [
        {
            category: {
                id: '3A',
                name: 'Home Decor2',
            },
            productCount: 13,
            children: [],
        },
    ],
};

const categoryTree = {
    ancestorCategories: [],
    selectedCategory: {
        id: 'ROOT_CATEGORY_ID',
        label: 'All Categories',
        categoryName: 'All Categories',
        items: [
            {
                id: '1A',
                label: 'Home Decor (25)',
                categoryName: 'Home Decor',
            },
        ],
    },
};

const firstUpdatedCategoryTree = {
    ancestorCategories: [
        {
            id: 'ROOT_CATEGORY_ID',
            label: 'All Categories',
            categoryName: 'All Categories',
        },
    ],
    selectedCategory: {
        id: '1A',
        label: 'Home Decor (25)',
        categoryName: 'Home Decor',
        items: [
            {
                id: '2A',
                label: 'Home Decor1 (12)',
                categoryName: 'Home Decor1',
            },
        ],
    },
};

const secondUpdatedCategoryTree = {
    ancestorCategories: [
        {
            id: 'ROOT_CATEGORY_ID',
            label: 'All Categories',
            categoryName: 'All Categories',
        },
        {
            id: '1A',
            label: 'Home Decor (25)',
            categoryName: 'Home Decor',
        },
    ],
    selectedCategory: {
        id: '2A',
        label: 'Home Decor1 (12)',
        categoryName: 'Home Decor1',
        items: [
            {
                id: '3A',
                label: 'Home Decor2 (13)',
                categoryName: 'Home Decor2',
            },
        ],
    },
};

// Facet Mock Data
const facetValueData = [
    {
        nameOrId: 'Brushed Metal',
        displayName: 'Brushed Metal',
        productCount: 19,
    },
    {
        nameOrId: 'Copper',
        displayName: 'Copper',
        productCount: 25,
    },
];

const facetValues = [
    {
        id: 'Brushed Metal',
        name: 'Brushed Metal (19)',
        focusOnInit: false,
        checked: false,
        productCount: 19,
    },
    {
        id: 'Copper',
        name: 'Copper (25)',
        focusOnInit: false,
        checked: false,
        productCount: 25,
    },
];

describe('commerce_search/facetsLib: Facets Library', () => {
    it('translates category data into category UI representation', () => {
        const expectedCategoryTree = createTreeFromCategory(categoryData, null);
        expect(expectedCategoryTree).toEqual(categoryTree);
    });

    describe('Facet Data Transformation For Input Facets', () => {
        [
            [
                {
                    nameOrId: 'A',
                    displayType: 'SingleSelect',
                    values: facetValueData,
                },
            ],
            [
                {
                    nameOrId: 'B',
                    displayType: 'MultiSelect',
                    values: facetValueData,
                },
            ],
        ].forEach((facetData) => {
            it(`translates facet data into facet UI representation for lightning-input when displayType is ${facetData[0].displayType}`, () => {
                const expectedFacet = transformInputFacetLabels(facetData, null, null);
                expect(expectedFacet[0].values).toEqual(facetValues);
            });
        });

        describe('merge the MruFacet values with the Facet Values: mergeFacetValues()', () => {
            const facet: NormalizedFacetSummary[] = [
                {
                    id: undefined,
                    nameOrId: 'A',
                    displayName: '',
                    displayType: 'SingleSelect',
                    values: facetValueData,
                },
            ];

            it('merges existing facetValues with current mruFacet values when all the Object attributes are same', () => {
                const mruFacet: SearchFacet = {
                    nameOrId: 'A',
                    displayName: 'Brushed Metal',
                    values: [
                        {
                            id: 'Brushed Metal',
                            name: 'Brushed Metal (19)',
                            focusOnInit: false,
                            checked: false,
                            productCount: 19,
                        },
                    ],
                };
                const expectedFacet = transformInputFacetLabels(facet, null, mruFacet);
                expect(expectedFacet[0].values).toEqual(facetValues);
            });

            it('merges existing facetValues with current mruFacet values when some of the the Object attributes are different', () => {
                const mruFacet: SearchFacet = {
                    nameOrId: 'A',
                    displayName: 'Brushed Metal',
                    values: [
                        {
                            id: 'Brushed Metal',
                            name: 'Brushed Metal (19)',
                            focusOnInit: true,
                            checked: true,
                            productCount: 19,
                        },
                    ],
                };
                const expectedFacet = transformInputFacetLabels(facet, null, mruFacet);
                const expectedSearchFacet = expectedFacet[0].values ?? [];
                expect(expectedSearchFacet[0]).toEqual({
                    id: 'Brushed Metal',
                    name: 'Brushed Metal (19)',
                    focusOnInit: true,
                    checked: true,
                    productCount: 19,
                });
            });

            it('merges existing facetValues with current mruFacet values when mruFacet has different Object', () => {
                // e.g. Silver object isn't present in facet, but it should be merged to facet values as an additional object
                const mruFacet: SearchFacet = {
                    nameOrId: 'A',
                    displayName: 'Brushed Metal',
                    values: [
                        {
                            id: 'Silver',
                            name: 'Silver (19)',
                            focusOnInit: true,
                            checked: true,
                        },
                    ],
                };

                const expectedFacet = transformInputFacetLabels(facet, null, mruFacet);
                const expectedSearchFacet = expectedFacet[0].values ?? [];
                expect(expectedSearchFacet[0]).toEqual({
                    id: 'Silver',
                    name: 'Silver (19)',
                    focusOnInit: true,
                    checked: true,
                });
            });
        });
    });

    describe('Facet Data For DateTime and Slider Facets', () => {
        [
            [
                {
                    nameOrId: 'A',
                    displayType: 'datetime',
                    values: facetValueData,
                },
            ],
            [
                {
                    nameOrId: 'B',
                    displayType: 'range',
                    values: facetValueData,
                },
            ],
        ].forEach((facetData) => {
            const result = [
                {
                    checked: false,
                    focusOnInit: false,
                    id: 'Brushed Metal',
                    name: 'Brushed Metal (19)',
                    productCount: 19,
                },
                { checked: false, focusOnInit: false, id: 'Copper', name: 'Copper (25)', productCount: 25 },
            ];
            it(`keeps facet data the same in facet UI representation for datetime/slider when displayType is ${facetData[0].displayType}`, () => {
                const expectedFacet = transformInputFacetLabels(facetData, null, null);
                expect(expectedFacet[0].values).toEqual(result);
            });
        });
    });

    describe('Empty Facet Value Data', () => {
        [
            [
                {
                    nameOrId: 'A',
                    displayType: 'SingleSelect',
                    values: [],
                },
            ],
        ].forEach((facetData) => {
            it(`returns empty list when facet values are ${facetData.values}`, () => {
                const expectedFacet = transformInputFacetLabels(facetData, null, null);
                expect(expectedFacet[0].values).toEqual([]);
            });
        });
    });

    it('translates category data into category UI representation with cached tree', () => {
        const expectedFirstUpdatedTree = createTreeFromCategory(firstLevelSubCategoryData, categoryTree);
        expect(expectedFirstUpdatedTree).toEqual(firstUpdatedCategoryTree);

        const expectedRootCategoryTree = createTreeFromCategory(categoryData, firstUpdatedCategoryTree);
        expect(expectedRootCategoryTree).toEqual(categoryTree);

        const expectedSecondUpdatedTree = createTreeFromCategory(secondLevelSubCategoryData, firstUpdatedCategoryTree);
        expect(expectedSecondUpdatedTree).toEqual(secondUpdatedCategoryTree);
    });

    it('translates facet data into facet UI representation with cached facets', () => {
        const refinements = [
            {
                id: 'Color:Standard',
                nameOrId: 'Color',
                values: ['Red'],
            },
            {
                id: 'Finish:Standard',
                nameOrId: 'Finish',
                values: ['Brushed Metal'],
            },
        ];

        const mruFacet = {
            id: 'Color:Standard',
            nameOrId: 'Color',
            displayType: 'radio',
            values: [
                {
                    id: 'Red',
                    name: 'Red (19)',
                    checked: true,
                },
                {
                    id: 'Green',
                    name: 'Green (13)',
                    checked: false,
                },
            ],
        };

        const facetData = [
            {
                id: 'Color:Standard',
                nameOrId: 'Color',
                displayType: 'SingleSelect',
                values: [{ nameOrId: 'Red', displayName: 'Red', productCount: 19 }],
            },
            {
                id: 'Finish:Standard',
                nameOrId: 'Finish',
                displayType: 'SingleSelect',
                values: facetValueData,
            },
        ];

        const updatedFacets = [
            mruFacet,
            {
                id: 'Finish:Standard',
                nameOrId: 'Finish',
                displayType: 'radio',
                values: facetValues,
            },
        ];

        // Make the "Brushed Metal" value of facet "Finish" checked since its cached in "cachedFacetData"
        const finishFacet = updatedFacets[1];
        finishFacet.values[0].checked = true;
        const expectedFacets = transformInputFacetLabels(facetData, refinements, mruFacet);
        expect(expectedFacets).toEqual(updatedFacets);
    });

    describe('normalizeRefinements tests', () => {
        [undefined, null, []].forEach((refinements) => {
            it(`returns an empty array when given refinements are (${JSON.stringify(refinements)})`, () => {
                expect(normalizeRefinements(refinements)).toEqual([]);
            });
        });

        [
            {
                refinements: { nameOrId: '', attributeType: undefined, values: [] },
                result: '',
            },
            {
                refinements: { nameOrId: 'C', attributeType: '', values: [] },
                result: 'C',
            },
            {
                refinements: { nameOrId: '', attributeType: 'Product', values: [] },
                result: 'Product',
            },
            {
                refinements: { nameOrId: 'C', attributeType: 'Product', values: [] },
                result: 'C:Product',
            },
        ].forEach((param) => {
            it(`returns with an id of '${param.result}' when given refinements has (${JSON.stringify(
                param.refinements
            )})`, () => {
                const inputRefinements = [
                    {
                        otherValues: 'Other values',
                        ...param.refinements,
                    },
                ];
                const outputRefinements = [
                    {
                        id: param.result,
                        otherValues: 'Other values',
                        ...param.refinements,
                    },
                ];
                expect(normalizeRefinements(inputRefinements)).toEqual(expect.arrayContaining(outputRefinements));
            });
        });
    });

    describe('prepareRefinementsForRequest tests', () => {
        [undefined, null].forEach((param) => {
            it(`returns a FacetRequestParams object with empty values
                when refinements are (${JSON.stringify(param)})`, () => {
                expect(prepareRefinementsForRequest(param)).toEqual([]);
            });
        });

        it("returns an object containing refinements by removing it's client generated ids", () => {
            const refinements = [
                {
                    id: 'Color__c:ProductAttribute',
                    nameOrId: 'Color',
                    values: ['Red'],
                },
                {
                    id: 'Family:Standard',
                    nameOrId: 'Family',
                    values: ['One', 'Two'],
                },
            ];

            const expectedRefinements = refinements.map((mapItem) => {
                const newItem = { ...mapItem };
                Reflect.deleteProperty(newItem, 'id');
                return newItem;
            });

            expect(prepareRefinementsForRequest(refinements)).toEqual(expect.arrayContaining(expectedRefinements));
        });
    });
});
