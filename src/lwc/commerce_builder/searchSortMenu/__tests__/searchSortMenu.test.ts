import { createElement } from 'lwc';

import type { SearchSortEvent, SortRuleData, SortRulesSearchResultsData } from 'commerce/searchApiInternal';
import SearchSortMenu from '../searchSortMenu';
import * as SortRuleMockData from './data/sortRules.json';

/**
 * Create the component and append it to the DOM
 */
const createComponentUnderTest = (): SearchSortMenu & HTMLElement => {
    const element = createElement<SearchSortMenu>('commerce_builder-search-sort-menu', {
        is: SearchSortMenu,
    });
    document.body.appendChild(element);
    return <HTMLElement & SearchSortMenu>element;
};

describe('Search sort menu component', () => {
    let element: HTMLElement & SearchSortMenu;

    beforeEach(() => {
        element = createComponentUnderTest();
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('Label slot', () => {
        it('Should be defined', () => {
            const labelSlot: HTMLElement | undefined | null =
                element.querySelector<HTMLElement>('slot[name="sortMenuLabel"]');
            expect(labelSlot).toBeDefined();
        });
    });

    describe('Child Search Sort Menu', () => {
        let childSortMenu: HTMLElement | null | undefined;

        beforeEach(() => {
            childSortMenu = element.querySelector<HTMLElement>('commerce_search-sort-menu');
        });

        afterEach(() => {
            childSortMenu = null;
        });

        it('Should be defined', () => {
            expect(childSortMenu).toBeDefined();
        });

        it('Should receive sort rules data list the parent', async () => {
            const mockSortRulesSearchResultsData: SortRulesSearchResultsData = SortRuleMockData;
            const expectedSortRules: Readonly<SortRuleData[]> = Object.freeze(
                mockSortRulesSearchResultsData.sortRules!
            );
            element.sortRules = mockSortRulesSearchResultsData.sortRules;
            await Promise.resolve();
            expect(childSortMenu).toHaveProperty('sortRules', expectedSortRules);
        });

        it('Should receive sort rules id from the parent', async () => {
            const mockSortRulesSearchResultsData: SortRulesSearchResultsData = SortRuleMockData;
            const selectedSortRuleId: string = mockSortRulesSearchResultsData.sortRules![2].sortRuleId;
            element.sortRules = mockSortRulesSearchResultsData.sortRules;
            element.sortRuleId = selectedSortRuleId;
            await Promise.resolve();
            expect(childSortMenu).toHaveProperty('sortRuleId', selectedSortRuleId);
        });

        ['', undefined, null].forEach((emptySortRuleId: string | undefined | null) => {
            it('Should ignore non valid values', async () => {
                const mockSortRulesSearchResultsData: SortRulesSearchResultsData = SortRuleMockData;
                element.sortRules = mockSortRulesSearchResultsData.sortRules;
                element.sortRuleId = emptySortRuleId;
                await Promise.resolve();
                expect(childSortMenu).toHaveProperty('sortRuleId', emptySortRuleId);
            });
        });

        it('Should dispatch the data provider event when new sort options is selected', async () => {
            const dispatchSpy = jest.spyOn(element!, 'dispatchEvent');
            const mockSortRulesSearchResultsData: SortRulesSearchResultsData = SortRuleMockData;
            const selectedSortRuleId: string = mockSortRulesSearchResultsData.sortRules![1].sortRuleId;

            element.sortRules = mockSortRulesSearchResultsData.sortRules;
            childSortMenu!.dispatchEvent(
                new CustomEvent<SearchSortEvent>('searchsort', {
                    detail: { sortRuleId: selectedSortRuleId },
                })
            );
            await Promise.resolve();

            expect(dispatchSpy).toHaveBeenCalledTimes(1);
        });

        it('Should dispatch the sort rule id on the data provider event when new sort options is selected', async () => {
            const dispatchSpy = jest.spyOn(element!, 'dispatchEvent');
            const mockSortRulesSearchResultsData: SortRulesSearchResultsData = SortRuleMockData;
            const selectedSortRuleId: string = mockSortRulesSearchResultsData.sortRules![1].sortRuleId;

            element.sortRules = mockSortRulesSearchResultsData.sortRules;
            childSortMenu!.dispatchEvent(
                new CustomEvent<SearchSortEvent>('searchsort', {
                    detail: { sortRuleId: selectedSortRuleId },
                })
            );
            await Promise.resolve();

            const dispatchedEvent = dispatchSpy.mock.lastCall[0] as CustomEvent<SearchSortEvent>;
            expect(dispatchedEvent.detail).toEqual(
                expect.objectContaining({
                    payload: { sortRuleId: selectedSortRuleId },
                    type: 'search:changeSortOrder',
                })
            );
        });
    });
});
