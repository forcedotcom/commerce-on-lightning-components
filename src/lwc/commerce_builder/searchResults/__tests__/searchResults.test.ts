import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import SearchResults from '../searchResults';
import type { PageReference } from 'types/common';
import { mockSearchResultsData } from './data/searchResults.mock';
import type { DataProviderActionEvent } from 'experience/dataProvider';
import type Dialog from 'lightning/dialog';
import type { AddItemToCartActionPayload } from 'commerce_data_provider/searchDataProvider';

let exposedNavigationParams: PageReference | undefined;
const ADD_PRODUCT_TO_CART_EVENT = 'addproducttocart';

jest.mock('lightning/navigation', () => ({
    navigate: jest.fn((_, params) => {
        exposedNavigationParams = params;
    }),
    NavigationContext: jest.fn(),
    CurrentPageReference: jest.fn(),
}));

jest.mock(
    'instrumentation/service',
    () => ({
        interaction: jest.fn(),
    }),
    { virtual: true }
);

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(() => Promise.resolve()),
    }),
    { virtual: true }
);

jest.mock('commerce/searchApiInternal', () =>
    Object.assign({}, jest.requireActual('commerce/searchApiInternal'), {
        ProductSearchAdapter: mockCreateTestWireAdapter(),
    })
);

describe('commerce_builder/searchResults: SearchResults', () => {
    let element: HTMLElement & SearchResults;

    beforeEach(() => {
        element = createElement('commerce_builder-search-results', {
            is: SearchResults,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
        exposedNavigationParams = undefined;
    });

    describe('Navigate to Product Page', () => {
        it('should navigate to the Product Page', () => {
            element.searchResults = mockSearchResultsData;
            return Promise.resolve().then(() => {
                const grid = <HTMLElement & SearchResults>element.querySelector('commerce_search-product-grid');
                grid.dispatchEvent(
                    new CustomEvent('showproduct', {
                        bubbles: false,
                        composed: false,
                        detail: {
                            productId: 'the-product-id',
                            productName: 'the-product-name',
                        },
                    })
                );
                expect(exposedNavigationParams).toEqual({
                    type: 'standard__recordPage',
                    attributes: {
                        objectApiName: 'Product2',
                        recordId: 'the-product-id',
                        actionName: 'view',
                    },
                    state: {
                        recordName: 'the-product-name',
                    },
                });
            });
        });
    });

    describe('Search Results', () => {
        describe('api properties', () => {
            describe('resultsLayout', () => {
                it('has a default value', () => {
                    element.resultsLayout = 'grid';
                    expect(element.resultsLayout).toBe('grid');
                });

                it('returns previously set value', () => {
                    element.resultsLayout = 'list';
                    expect(element.resultsLayout).toBe('list');
                });
            });

            describe('cardBackgroundColor', () => {
                it('has a default value', () => {
                    element.cardBackgroundColor = 'var(--dxp-g-root)';
                    expect(element.cardBackgroundColor).toBe('var(--dxp-g-root)');
                });

                it('returns previously set value', () => {
                    element.cardBackgroundColor = 'red';
                    expect(element.cardBackgroundColor).toBe('red');
                });
            });

            describe('negotiatedPriceTextSize', () => {
                it('has a default value', () => {
                    element.negotiatedPriceTextSize = 'medium';
                    expect(element.negotiatedPriceTextSize).toBe('medium');
                });

                it('returns previously set value', () => {
                    element.negotiatedPriceTextSize = 'small';
                    expect(element.negotiatedPriceTextSize).toBe('small');
                });
            });

            describe('negotiatedPriceTextColor', () => {
                it('has a default value', () => {
                    element.negotiatedPriceTextColor = 'var(--dxp-g-root-contrast)';
                    expect(element.negotiatedPriceTextColor).toBe('var(--dxp-g-root-contrast)');
                });

                it('returns previously set value', () => {
                    element.negotiatedPriceTextColor = 'red';
                    expect(element.negotiatedPriceTextColor).toBe('red');
                });
            });

            describe('originalPriceTextSize', () => {
                it('has a default value', () => {
                    element.originalPriceTextSize = 'medium';
                    expect(element.originalPriceTextSize).toBe('medium');
                });

                it('returns previously set value', () => {
                    element.originalPriceTextSize = 'small';
                    expect(element.originalPriceTextSize).toBe('small');
                });
            });

            describe('originalPriceTextColor', () => {
                it('has a default value', () => {
                    element.originalPriceTextColor = 'var(--dxp-g-root-contrast)';
                    expect(element.originalPriceTextColor).toBe('var(--dxp-g-root-contrast)');
                });

                it('returns previously set value', () => {
                    element.originalPriceTextColor = 'red';
                    expect(element.originalPriceTextColor).toBe('red');
                });
            });

            describe('cardContentMapping', () => {
                it('defaults to undefined', () => {
                    expect(element.cardContentMapping).toBeUndefined();
                });

                it('returns previously set value', () => {
                    element.cardContentMapping = '[]';
                    expect(element.cardContentMapping).toBe('[]');
                });
            });

            describe('cardAlignment', () => {
                it('has a default value', () => {
                    element.cardAlignment = 'center';
                    expect(element.cardAlignment).toBe('center');
                });

                it('returns previously set value', () => {
                    element.cardAlignment = 'left';
                    expect(element.cardAlignment).toBe('left');
                });
            });

            describe('cardBorderColor', () => {
                it('has a default value', () => {
                    element.cardBorderColor = 'var(--dxp-g-root)';
                    expect(element.cardBorderColor).toBe('var(--dxp-g-root)');
                });

                it('returns previously set value', () => {
                    element.cardBorderColor = 'red';
                    expect(element.cardBorderColor).toBe('red');
                });
            });

            describe('cardBorderRadius', () => {
                it('has a default value', () => {
                    element.cardBorderRadius = '1';
                    expect(element.cardBorderRadius).toBe('1');
                });

                it('returns previously set value', () => {
                    element.cardBorderRadius = '1ch';
                    expect(element.cardBorderRadius).toBe('1ch');
                });
            });

            describe('gridColumnSpacing', () => {
                it('has a default value', () => {
                    element.gridColumnSpacing = 'small';
                    expect(element.gridColumnSpacing).toBe('small');
                });

                it('returns previously set value', () => {
                    element.gridColumnSpacing = 'large';
                    expect(element.gridColumnSpacing).toBe('large');
                });
            });

            describe('gridRowSpacing', () => {
                it('has a default value', () => {
                    element.gridRowSpacing = 'small';
                    expect(element.gridRowSpacing).toBe('small');
                });

                it('returns previously set value', () => {
                    element.gridRowSpacing = 'large';
                    expect(element.gridRowSpacing).toBe('large');
                });
            });

            describe('gridMaxColumnsDisplayed', () => {
                it('has a default value', () => {
                    element.gridMaxColumnsDisplayed = 3;
                    expect(element.gridMaxColumnsDisplayed).toBe(3);
                });

                it('returns previously set value', () => {
                    element.gridMaxColumnsDisplayed = 4;
                    expect(element.gridMaxColumnsDisplayed).toBe(4);
                });
            });

            describe('cardDividerColor', () => {
                it('has a default value', () => {
                    element.cardDividerColor = 'var(--dxp-g-neutral)';
                    expect(element.cardDividerColor).toBe('var(--dxp-g-neutral)');
                });

                it('returns previously set value', () => {
                    element.cardDividerColor = 'red';
                    expect(element.cardDividerColor).toBe('red');
                });
            });

            describe('listRowSpacing', () => {
                it('has a default value', () => {
                    element.listRowSpacing = 'small';
                    expect(element.listRowSpacing).toBe('small');
                });

                it('returns previously set value', () => {
                    element.listRowSpacing = 'large';
                    expect(element.listRowSpacing).toBe('large');
                });
            });

            describe('showProductImage', () => {
                it('has a default value', () => {
                    element.showProductImage = true;
                    expect(element.showProductImage).toBe(true);
                });

                it('returns previously set value', () => {
                    element.showProductImage = false;
                    expect(element.showProductImage).toBe(false);
                });
            });

            describe('showNegotiatedPrice', () => {
                it('has a default value', () => {
                    element.showNegotiatedPrice = true;
                    expect(element.showNegotiatedPrice).toBe(true);
                });

                it('returns previously set value', () => {
                    element.showNegotiatedPrice = false;
                    expect(element.showNegotiatedPrice).toBe(false);
                });
            });

            describe('showOriginalPrice', () => {
                it('has a default value', () => {
                    element.showOriginalPrice = true;
                    expect(element.showOriginalPrice).toBe(true);
                });

                it('returns previously set value', () => {
                    element.showOriginalPrice = false;
                    expect(element.showOriginalPrice).toBe(false);
                });
            });
        });

        it('should not render results in the grid', () => {
            return Promise.resolve()
                .then(() => {
                    element.searchResults = mockSearchResultsData;
                    return Promise.resolve();
                })
                .then(() => {
                    const grid = <HTMLElement>element.querySelector('commerce_search-product-grid');
                    expect(grid).not.toBeNull();
                });
        });
        it('should keep the same results grid instance', () => {
            element.searchResults = mockSearchResultsData;
            let firstGrid: HTMLElement & SearchResults;
            return Promise.resolve()
                .then(() => {
                    firstGrid = <HTMLElement & SearchResults>element.querySelector('commerce_search-product-grid');
                    expect(firstGrid).not.toBeNull();
                    element.searchResults = mockSearchResultsData;
                    return Promise.resolve();
                })
                .then(() => {
                    const grid = <HTMLElement & SearchResults>element.querySelector('commerce_search-product-grid');
                    expect(grid).not.toBeNull();
                    expect(firstGrid).toBe(grid);
                });
        });
        it('should show first page of searched products with grid layout', () => {
            element.resultsLayout = 'grid';
            element.searchResults = mockSearchResultsData;
            return Promise.resolve().then(() => {
                const products = element.querySelectorAll('li').length;
                expect(products).toEqual(mockSearchResultsData.pageSize);
            });
        });
        it('should show first page of searched products with list layout', () => {
            element.resultsLayout = 'list';
            element.searchResults = mockSearchResultsData;
            return Promise.resolve().then(() => {
                const products = element.querySelectorAll('li').length;
                expect(products).toEqual(mockSearchResultsData.pageSize);
            });
        });
        it('should not show paging control when pageSize or total is undefined', () => {
            element.searchResults = {
                filtersPanel: {
                    categories: null,
                    facets: [],
                },
                cardCollection: [],
                pageSize: 0,
                total: 0,
            };
            return Promise.resolve().then(() => {
                const pagingControl = <HTMLElement & SearchResults>(
                    element.querySelector('commerce_search-paging-control')
                );
                expect(pagingControl).toBeNull();
            });
        });
        it('should have Prev Button disabled and Next Button enabled', () => {
            element.searchResults = mockSearchResultsData;
            return Promise.resolve().then(() => {
                const buttons = element.querySelectorAll('button');
                const prevButton = buttons[0];
                const nextButton = buttons[2];
                expect(prevButton.disabled).toBe(true);
                expect(nextButton.disabled).toBe(false);
            });
        });
        it('should have Next Button clickable and be called', () => {
            element.searchResults = mockSearchResultsData;
            const handleNextPageEvent = jest.fn();
            return Promise.resolve().then(() => {
                const buttons = element.querySelectorAll('button');
                const nextButton = <HTMLButtonElement>buttons[2];
                nextButton.addEventListener('click', handleNextPageEvent);
                nextButton.click();
                expect(handleNextPageEvent).toHaveBeenCalled();
            });
        });
        it('should have Prev Button clickable and be called', () => {
            element.searchResults = mockSearchResultsData;
            const handleNextPageEvent = jest.fn();
            const handlePrevPageEvent = jest.fn();
            return Promise.resolve().then(() => {
                const buttons = element.querySelectorAll('button');
                const nextButton = <HTMLButtonElement>buttons[2];
                nextButton.addEventListener('click', handleNextPageEvent);
                nextButton.click();
                element.searchResults = mockSearchResultsData;
                return Promise.resolve().then(() => {
                    const buttonsPrev = element.querySelectorAll('button');
                    const prevButton = <HTMLButtonElement>buttonsPrev[0];
                    prevButton.addEventListener('click', handlePrevPageEvent);
                    prevButton.click();
                    expect(handlePrevPageEvent).toHaveBeenCalled();
                });
            });
        });
        it('should have Page Number Button clickable and be called', () => {
            element.searchResults = mockSearchResultsData;
            const handleGotoPageEvent = jest.fn();
            return Promise.resolve().then(() => {
                const buttons = element.querySelectorAll('button');
                const gotoPageButton = <HTMLButtonElement>buttons[1];
                gotoPageButton.addEventListener('click', handleGotoPageEvent);
                gotoPageButton.click();
                expect(handleGotoPageEvent).toHaveBeenCalled();
            });
        });
    });

    describe('when add to cart event received', () => {
        it('should dispatch data provider when add to cart event is fired', async () => {
            element.searchResults = mockSearchResultsData;
            await Promise.resolve();
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            const productGrid = <HTMLElement>element.querySelector('commerce_search-product-grid');
            productGrid.dispatchEvent(
                new CustomEvent(ADD_PRODUCT_TO_CART_EVENT, {
                    detail: { quantity: '1', productId: 'abc' },
                })
            );
            await Promise.resolve();
            // Validate DataProviderActionEvent dispatched with appropriate payload
            const eventDetail = (<DataProviderActionEvent<AddItemToCartActionPayload>>dispatchSpy.mock.calls[0][0])
                .detail;
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            expect(eventDetail.payload!.quantity).toBe('1');
        });

        it('should show confirmation modal when onSuccess hook called', async () => {
            element.searchResults = mockSearchResultsData;
            await Promise.resolve();

            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            // Spy on showModal() method on dialog
            const modalElem = <Dialog & Element>element.querySelector('lightning-dialog');
            const showModalSpy = jest.spyOn(modalElem, 'showModal');

            // Dispatch add to cart event
            const productGrid = <HTMLElement>element.querySelector('commerce_search-product-grid');
            productGrid.dispatchEvent(
                new CustomEvent(ADD_PRODUCT_TO_CART_EVENT, {
                    detail: { quantity: '1', productId: 'abc' },
                })
            );
            await Promise.resolve();

            // Call onSuccess callback
            const eventDetail = (<DataProviderActionEvent<AddItemToCartActionPayload>>dispatchSpy.mock.calls[0][0])
                .detail;
            const eventDetailOptions = eventDetail.options;
            eventDetailOptions.onSuccess?.(undefined, true);
            await Promise.resolve();

            expect(showModalSpy).toHaveBeenCalledTimes(1);
        });

        it('should close dialog when continue shopping button clicked', async () => {
            element.searchResults = mockSearchResultsData;
            await Promise.resolve();

            const modalElem = <Dialog & Element>element.querySelector('lightning-dialog');
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            modalElem!.showModal();
            await Promise.resolve();

            // Click "Continue Shopping" button
            const continueButton = <HTMLButtonElement>element.querySelector('lightning-dialog .slds-button_neutral');
            continueButton.click();

            await Promise.resolve(); // Wait for navigation

            expect(exposedNavigationParams).toBeUndefined();
        });

        it('should navigate to cart when view cart button clicked', async () => {
            element.searchResults = mockSearchResultsData;
            await Promise.resolve();

            const modalElem = <Dialog & Element>element.querySelector('lightning-dialog');
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            modalElem!.showModal();
            await Promise.resolve();

            // Click "Continue Shopping" button
            const viewCartButton = <HTMLButtonElement>element.querySelector('lightning-dialog .slds-button_brand');
            expect(viewCartButton).toBeTruthy();
            viewCartButton.click();

            await Promise.resolve(); // Wait for navigation

            expect(exposedNavigationParams).toEqual({ attributes: { name: 'Current_Cart' }, type: 'comm__namedPage' });
        });
    });
});
