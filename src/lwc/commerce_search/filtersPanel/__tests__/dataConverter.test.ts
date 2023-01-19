import { refinementsFromFacetsMap } from '../dataConverter';

describe('commerce_search/filtersPanel: refinementsFromFacetsMap function', () => {
    [
        {
            facets: null,
            result: [],
        },
        {
            facets: undefined,
            result: [],
        },
        {
            facets: new Map([
                [
                    'Color:Standard',
                    {
                        searchFacet: {
                            id: 'Color:Standard',
                            nameOrId: 'Color',
                            displayType: 'radio',
                            attributeType: 'Standard',
                            facetType: 'DistinctValue',
                            values: [],
                        },
                        valuesCheckMap: new Map([
                            ['Red', true],
                            ['Green', false],
                        ]),
                    },
                ],
                [
                    'Finish:Custom',
                    {
                        searchFacet: {
                            id: 'Finish:Custom',
                            nameOrId: 'Finish',
                            attributeType: 'Custom',
                            displayType: 'radio',
                            facetType: 'DistinctValue',
                            values: [],
                        },
                        valuesCheckMap: new Map([
                            ['Brushed Metal', false],
                            ['Copper', true],
                        ]),
                    },
                ],
            ]),
            result: [
                {
                    attributeType: 'Standard',
                    id: 'Color:Standard',
                    nameOrId: 'Color',
                    type: 'DistinctValue',
                    values: ['Red'],
                },
                {
                    attributeType: 'Custom',
                    id: 'Finish:Custom',
                    nameOrId: 'Finish',
                    type: 'DistinctValue',
                    values: ['Copper'],
                },
            ],
        },
    ].forEach((params) => {
        it(`gives refinements "${params.result}" for "${JSON.stringify(params.facets)}"`, () => {
            const refinement = refinementsFromFacetsMap(params.facets);
            expect(refinement).toEqual(expect.arrayContaining(params.result));
        });
    });
});
