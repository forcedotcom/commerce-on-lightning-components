import { createElement } from 'lwc';
import FiltersPanel from 'commerce_search/filtersPanel';

jest.mock(
    'community_runtime/utils',
    () => {
        return {
            debounce: jest.fn().mockImplementation((cb) => {
                return function (): void {
                    cb();
                };
            }),
        };
    },
    { virtual: true }
);

// tell jest to mock all timeout functions
jest.useFakeTimers();

// Mock facet data
const facets = [
    {
        id: 'Color:Standard',
        attributeType: 'Standard',
        facetType: 'DistinctValue',
        nameOrId: 'Color',
        displayType: 'radio',
        values: [
            {
                id: 'Red',
                name: 'Red (19)',
                checked: false,
            },
            {
                id: 'Green',
                name: 'Green (8)',
                checked: false,
            },
        ],
    },
    {
        id: 'Finish:Custom',
        attributeType: 'Custom',
        facetType: 'DistinctValue',
        nameOrId: 'Finish',
        displayType: 'radio',
        values: [
            {
                id: 'Brushed Metal',
                name: 'Brushed Metal (19)',
                checked: false,
            },
            {
                id: 'Copper',
                name: 'Copper (25)',
                checked: false,
            },
        ],
    },
    {
        id: 'Size:ProductAttribute',
        attributeType: 'ProductAttribute',
        facetType: 'DistinctValue',
        nameOrId: 'Size',
        displayType: 'radio',
        values: [
            {
                id: 'Big',
                name: 'Big (5)',
                checked: false,
            },
            {
                id: 'Small',
                name: 'Small (5)',
                checked: false,
            },
        ],
    },
];

const edgeCaseFacets = [
    {
        id: 'Material:Standard',
        attributeType: 'Standard',
        facetType: 'DistinctValue',
        nameOrId: 'Material',
        displayType: 'radio',
        values: [
            {
                id: 'Rough',
                name: 'Rough',
                checked: false,
            },
            {
                id: 'Smooth',
                name: 'Smooth',
                checked: false,
            },
        ],
    },
];

const expectedRefinements = [
    {
        id: 'Color:Standard',
        nameOrId: 'Color',
        type: 'DistinctValue',
        attributeType: 'Standard',
        values: ['Red'],
    },
    {
        id: 'Finish:Custom',
        nameOrId: 'Finish',
        type: 'DistinctValue',
        attributeType: 'Custom',
        values: ['Copper'],
    },
];

function callUpdateFacetEvt(element: Element, detail: { [key: string]: string | boolean }): void {
    element.dispatchEvent(
        new CustomEvent('facetvaluetoggle', {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: detail,
        })
    );
}

describe('commerce_search/filtersPanel: Filter Panel', () => {
    let element: HTMLElement & FiltersPanel;

    beforeEach(() => {
        element = createElement('commerce_search-filters-panel', {
            is: FiltersPanel,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('accessibility', () => {
        afterEach(() => jest.useFakeTimers());
        beforeEach(() => jest.useRealTimers());
        it('is accessible', () => {
            element.displayData = { facets };

            return Promise.resolve().then(() => {
                expect(element).toBeAccessible();
            });
        });
    });

    describe('the displaydata property', () => {
        it('defaults to undefined', () => {
            expect(element.displayData).toBeUndefined();
        });

        it('reflects a changed value', () => {
            expect(element.displayData).not.toBe({});

            element.displayData = { facets };
            expect(element.displayData).toStrictEqual({ facets });
        });
    });

    it('does not show facets when displayData is null', () => {
        element.displayData = null;

        return Promise.resolve().then(() => {
            const facetFields = Array.from(element.querySelectorAll('select'));

            expect(facetFields).toHaveLength(0);
        });
    });

    it('creates a facet component for each provided facet', () => {
        element.displayData = { facets };

        return Promise.resolve().then(() => {
            const slider = element.querySelectorAll('commerce_search-facet');
            expect(slider).toHaveLength(3);
        });
    });

    it('triggers the facet value update event and caches the correct facets', () => {
        element.displayData = { facets };

        return Promise.resolve().then(() => {
            const facetElements = element.querySelectorAll('commerce_search-facet');
            const facetUpdateFn = jest.fn();
            element.addEventListener('facetvalueupdate', facetUpdateFn);

            callUpdateFacetEvt(facetElements[0], { id: 'Red', checked: true });
            callUpdateFacetEvt(facetElements[0], { id: 'Red', checked: false });

            // Update the "Copper" value of facet "Finish" to be checked
            callUpdateFacetEvt(facetElements[1], {
                id: 'Copper',
                checked: true,
            });

            // Update the "Red" value of facet "Color" to be checked after debounce
            callUpdateFacetEvt(facetElements[0], { id: 'Red', checked: true });

            return Promise.resolve().then(() => {
                // fast-forward time
                jest.runAllTimers();

                // the MRU facet should be the "Color" facet and reflect that the "Red" value is checked
                const expectedMruFacet = Object.assign({}, facets[0]);
                expectedMruFacet.values[0].checked = true; //Red

                expect(facetUpdateFn).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            refinements: expectedRefinements,
                            mruFacet: expectedMruFacet,
                        },
                    })
                );

                // ensure the cached facets remain the same after new facets are passed in
                // ensure the MRU facet remains the same if the new list of facets is empty
                element.displayData = {
                    facets: [],
                };
                callUpdateFacetEvt(facetElements[0], {
                    id: 'Red',
                    facetId: 'Color',
                    // @ts-ignore verifying edge case
                    checked: null,
                });

                return Promise.resolve().then(() => {
                    jest.runAllTimers();
                    expect(facetUpdateFn).toHaveBeenCalledWith(
                        expect.objectContaining({
                            detail: {
                                refinements: expectedRefinements,
                                mruFacet: expectedMruFacet,
                            },
                        })
                    );
                });
            });
        });
    });

    it("triggers the 'clearallfilters' event", () => {
        return Promise.resolve().then(() => {
            const clearAllButton = <HTMLElement>element.querySelector('lightning-button');
            const onclearAllFn = jest.fn();
            element.addEventListener('clearallfilters', onclearAllFn);
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            clearAllButton!.dispatchEvent(
                new CustomEvent('click', {
                    bubbles: true,
                    cancelable: true,
                })
            );
            expect(onclearAllFn).toHaveBeenCalled();
        });
    });

    it('does not emit the facetvalueupdate event when an unrecognized facet is selected (edge case)', () => {
        element.displayData = { facets };

        return Promise.resolve()
            .then(() => {
                element.displayData = { facets: edgeCaseFacets };
            })
            .then(() => {
                const facetElements = element.querySelectorAll('commerce_search-facet');
                const facetUpdateFn = jest.fn();
                element.addEventListener('facetvalueupdate', facetUpdateFn);

                callUpdateFacetEvt(facetElements[0], {
                    id: 'big',
                    checked: true,
                });

                return Promise.resolve().then(() => {
                    // fast-forward time
                    jest.runAllTimers();

                    expect(facetUpdateFn).not.toHaveBeenCalledWith();
                });
            });
    });
});
