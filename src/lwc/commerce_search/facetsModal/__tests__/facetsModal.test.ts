import { createElement } from 'lwc';

import FacetsModal from 'commerce_search/facetsModal';

describe('commerce_search/facetsModal: Facets Modal', () => {
    let element: HTMLElement & FacetsModal;

    beforeEach(() => {
        element = createElement('commerce_search-facets-modal', {
            is: FacetsModal,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            propertyTest: 'category',
            defaultValue: undefined,
            changeValue: null,
        },
    ].forEach((propertyTest) => {
        describe(`the category property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element.category).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element.category).not.toBe(propertyTest.changeValue);

                // Change the value.
                element.category = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element.category).toBeNull();
            });
        });
    });

    describe(`the facets property`, () => {
        it('defaults to an empty array', () => {
            expect(element.facets).toStrictEqual([]);
        });

        it('reflects a changed value', () => {
            // Ensure the value isn't already set to the target value.
            expect(element.facets).not.toBeNull();

            // Change the value.
            element.facets = [];

            // Ensure we reflect the changed value.
            expect(element.facets).toStrictEqual([]);
        });
    });

    it('verify displayMode property', () => {
        expect(element.displayMode).toBe('searchResults');
        element.displayMode = 'searchResults1';
        expect(element.displayMode).toBe('searchResults1');
    });

    it('verify displayCount property', () => {
        expect(element.displayCount).toBe(0);
        element.displayCount = 1;
        expect(element.displayCount).toBe(1);
    });

    it("triggers the 'closefacetsmodal' event", () => {
        const button = <HTMLElement>element.querySelector('.results-button');
        const closeModalFn = jest.fn();

        element.addEventListener('closefacetsmodal', closeModalFn);
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        button!.dispatchEvent(
            new CustomEvent('click', {
                bubbles: true,
                cancelable: true,
            })
        );
        expect(closeModalFn).toHaveBeenCalled();
    });

    it("triggers the 'clearallfilters' event in filtersPanel", () => {
        const clearAllFn = jest.fn();
        element.addEventListener('clearallfilters', clearAllFn);
        element.clearFilters();

        expect(clearAllFn).toHaveBeenCalled();
    });

    it("handles and refires the 'facetvalueupdate' event after cleaning all the client generated ids", () => {
        const handler = jest.fn();
        element.addEventListener('facetvalueupdate', handler);

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
        const mruFacet = { ...refinements[1] };

        return Promise.resolve()
            .then(() => {
                const productGrid = <HTMLElement>element.querySelector('commerce_search-filters-panel');
                // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                productGrid!.dispatchEvent(
                    new CustomEvent('facetvalueupdate', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            refinements,
                            mruFacet,
                        },
                    })
                );
            })
            .then(() => {
                const expectedRefinements = refinements.map((mapItem) => {
                    const newItem = { ...mapItem };
                    Reflect.deleteProperty(newItem, 'id');
                    return newItem;
                });

                expect(handler).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            refinements: expectedRefinements,
                            mruFacet,
                        },
                    })
                );
            });
    });
});
