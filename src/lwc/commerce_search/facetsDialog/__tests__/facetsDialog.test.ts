import { createElement } from 'lwc';

import FacetsDialog from 'commerce_search/facetsDialog';

describe('commerce_search/FacetsDialog: Facets Dialog', () => {
    let element: HTMLElement & FacetsDialog;

    beforeEach(() => {
        element = createElement('commerce_search-facets-dialog', {
            is: FacetsDialog,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            defaultValue: undefined,
            changeValue: {},
        },
    ].forEach((propertyTest) => {
        describe(`the displayData property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element.displayData).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element.displayData).not.toBe(propertyTest.changeValue);

                // Change the value.
                element.displayData = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element.displayData).toStrictEqual(propertyTest.changeValue);
            });
        });
    });

    it('verify displayMode property', () => {
        expect(element.displayMode).toBe('searchResults');
        element.displayMode = 'searchResults2';
        expect(element.displayMode).toBe('searchResults2');
    });

    it('verify displayCount property', () => {
        expect(element.displayCount).toBe(0);
        element.displayCount = 1;
        expect(element.displayCount).toBe(1);
    });

    it("triggers the 'closefacetsdialog' event", () => {
        const button = <HTMLElement>element.querySelector('.cancel-facets-dialog');
        const closeDialogFn = jest.fn();
        element.addEventListener('closefacetsdialog', closeDialogFn);
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        button!.dispatchEvent(
            new CustomEvent('click', {
                bubbles: true,
                cancelable: true,
            })
        );
        expect(closeDialogFn).toHaveBeenCalled();
    });

    it("triggers the 'clearallfilters' event in filtersPanel", () => {
        const button = <HTMLElement>element.querySelector('.clear-facets-dialog');
        const clearAllFn = jest.fn();

        element.addEventListener('clearallfilters', clearAllFn);
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        button!.dispatchEvent(
            new CustomEvent('click', {
                bubbles: true,
                cancelable: true,
            })
        );
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
