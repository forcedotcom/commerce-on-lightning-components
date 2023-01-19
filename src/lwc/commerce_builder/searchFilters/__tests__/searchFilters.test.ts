import { createElement } from 'lwc';
import MatchMediaMock from 'jest-matchmedia-mock';
import SearchFilters from '../searchFilters';
import { mockSearchResultsData } from './data/searchFilters.mock';
import type LightningDialog from 'types/lightning-dialog';
import type { DataProviderActionEvent } from 'experience/dataProvider';

jest.mock(
    'community_runtime/utils',
    () => {
        return {
            debounce: jest.fn().mockImplementation((cb) => {
                return (): void => {
                    cb();
                };
            }),
        };
    },
    { virtual: true }
);

describe('commerce_builder/searchFilters: SearchFilters', () => {
    let element: HTMLElement & SearchFilters;
    let matchMedia: MatchMediaMock;

    describe('Mobile Filters', () => {
        beforeEach(() => {
            matchMedia = new MatchMediaMock();
            element = createElement('commerce_builder-search-filters', {
                is: SearchFilters,
            });
            document.body.appendChild(element);
            element.searchResults = mockSearchResultsData;
        });
        afterEach(() => {
            while (document.body.firstChild) {
                document.body.removeChild(document.body.firstChild);
            }
            jest.clearAllMocks();
            matchMedia.destroy();
        });

        describe('Mobile Filter Button', () => {
            it('should display filter option button', () => {
                const filterButton = element.querySelectorAll('.slds-button');
                expect(filterButton).not.toBeNull();
            });
            it('should fire click event when the filter option button is selected', () => {
                const handleCategoryUpdateEvent = jest.fn();
                const filterButton = <HTMLButtonElement>element.querySelector('button');
                filterButton.addEventListener('click', handleCategoryUpdateEvent);
                filterButton.click();
                expect(handleCategoryUpdateEvent).toHaveBeenCalled();
            });
        });

        describe('Mobile Filter Modal', () => {
            it('should fire click event when the cancel modal button is selected', async () => {
                const modalElem = <LightningDialog & Element>element.querySelector('lightning-dialog');
                modalElem?.showModal();
                const modalClosedSpy = jest.spyOn(modalElem, 'close');

                return Promise.resolve()
                    .then(() => {
                        const filterButton = <HTMLButtonElement>element.querySelector('.cancel-facets-dialog');
                        filterButton.click();
                    })
                    .then(() => {
                        expect(modalClosedSpy).toHaveBeenCalled();
                    });
            });

            it('should fire click event when clear filter button is selected', async () => {
                const modalElem = <LightningDialog & Element>element.querySelector('lightning-dialog');
                modalElem?.showModal();
                const dispatchSpy = jest.spyOn(element, 'dispatchEvent');

                return Promise.resolve()
                    .then(() => {
                        const filterButton = <HTMLButtonElement>element.querySelector('.clear-facets-dialog');
                        filterButton.click();
                    })
                    .then(() => {
                        const eventDetail = (<DataProviderActionEvent<undefined>>dispatchSpy.mock.calls[0][0]).detail;
                        expect(eventDetail.type).toBe('search:clearFilters');
                    });
            });
        });
    });

    describe('Desktop Filters', () => {
        beforeEach(() => {
            matchMedia = new MatchMediaMock();
            window.matchMedia = jest.fn().mockImplementation(() => ({
                matches: true,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            }));
            element = createElement('commerce_builder-search-filters', {
                is: SearchFilters,
            });
            document.body.appendChild(element);
            element.searchResults = mockSearchResultsData;
        });
        afterEach(() => {
            while (document.body.firstChild) {
                document.body.removeChild(document.body.firstChild);
            }
            jest.clearAllMocks();
            matchMedia.destroy();
        });
        describe('Api Properties', () => {
            describe('searchResults', () => {
                it('has a default value', () => {
                    element.searchResults = undefined;
                    expect(element.searchResults).toBeUndefined();
                });

                it('returns previously set value', () => {
                    element.searchResults = mockSearchResultsData;
                    expect(element.searchResults).toStrictEqual(mockSearchResultsData);
                });
            });
        });

        describe('Category Filter Change', () => {
            it('should display category change filter option', () => {
                const categoryTree = element.querySelectorAll('a');
                expect(categoryTree).not.toBeNull();
            });
            it('should fire click event when the category filter option is selected', () => {
                const handleCategoryUpdateEvent = jest.fn();
                const categoryTree = element.querySelectorAll('a');
                const updateCategory = categoryTree[1];
                updateCategory.addEventListener('click', handleCategoryUpdateEvent);
                updateCategory.click();
                expect(handleCategoryUpdateEvent).toHaveBeenCalled();
            });
        });

        describe('Facets Filter Change', () => {
            it('should display facets change filter option', () => {
                const facetInput = element.querySelectorAll('input');
                expect(facetInput).not.toBeNull();
            });
            it('should fire click event when the facets filter option is selected', () => {
                const handleFacetValueUpdateEvent = jest.fn();
                return Promise.resolve().then(() => {
                    const facetInput = element.querySelectorAll('input');
                    facetInput[0].addEventListener('click', handleFacetValueUpdateEvent);
                    facetInput[0].click();
                    expect(handleFacetValueUpdateEvent).toHaveBeenCalled();
                });
            });
        });

        describe('Reset Filter', () => {
            it('should fire click event when the reset filter option is selected', () => {
                const handleClearAllFilters = jest.fn();
                return Promise.resolve().then(() => {
                    const clearAllButton = <HTMLButtonElement>element.querySelector('lightning-button');
                    clearAllButton.addEventListener('click', handleClearAllFilters);
                    clearAllButton.click();
                    expect(handleClearAllFilters).toHaveBeenCalled();
                });
            });
        });
    });
});
