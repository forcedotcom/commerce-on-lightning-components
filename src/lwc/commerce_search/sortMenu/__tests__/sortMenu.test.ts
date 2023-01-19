import { createElement } from 'lwc';

import { EVENT_SORT_ORDER_CHANGED } from '../constants';
import SearchSortMenu from '../sortMenu';
import { sortRuleData, sortRuleOptions } from './data/searchRules.mock';

/**
 * Create the component and append it to the DOM
 */
const createComponentUnderTest = (): SearchSortMenu & HTMLElement => {
    const element = createElement<SearchSortMenu>('commerce_builder-sort-menu', {
        is: SearchSortMenu,
    });
    document.body.appendChild(element);
    return <SearchSortMenu & HTMLElement>element;
};

describe('Search sort menu component', () => {
    let element: HTMLElement & SearchSortMenu;
    let combobox: HTMLSelectElement | null | undefined;

    beforeEach(() => {
        element = createComponentUnderTest();
        combobox = element.querySelector<HTMLSelectElement>('lightning-combobox');
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        combobox = null;
    });

    describe('the sort menu list rendering', () => {
        beforeEach(() => {
            element.sortRules = sortRuleData;
            element.sortRuleId = sortRuleOptions[0].value;
        });

        it('should have two options', async () => {
            await Promise.resolve();
            expect(combobox!.options).toHaveLength(2);
        });

        it('should set the rule Id as the combobox value', async () => {
            await Promise.resolve();
            expect(combobox!.value).toBe(sortRuleOptions[0].value);
        });

        it('should have the correct rule Id', async () => {
            await Promise.resolve();
            expect(element!.sortRuleId).toBe(sortRuleOptions[0].value);
        });

        it('should have the correct rules', async () => {
            await Promise.resolve();
            expect(element!.sortRules).toStrictEqual(sortRuleData);
        });

        it('is selecting the right option for known value', async () => {
            element.sortRuleId = sortRuleOptions[1].value;
            await Promise.resolve();
            expect(combobox!.value).toBe(element.sortRuleId);
        });

        [undefined, ''].forEach((selectedValue: string | undefined) => {
            it(`is selecting the first option when sortRuleId is (${JSON.stringify(selectedValue)})`, async () => {
                element.sortRuleId = selectedValue;
                await Promise.resolve();
                expect(combobox!.value).toBe(sortRuleOptions[0].value);
            });
        });

        it('lists all of the correct menu options in the correct order', async () => {
            await Promise.resolve();
            expect(combobox!.options).toEqual(sortRuleOptions);
        });
    });

    describe('searchsort event fired', () => {
        let sortOrderChangedHandlerMock: EventListenerOrEventListenerObject;

        beforeEach(() => {
            element.sortRules = sortRuleData;
            element.sortRuleId = sortRuleOptions[0].value;
            sortOrderChangedHandlerMock = jest.fn();
            element.addEventListener(EVENT_SORT_ORDER_CHANGED, sortOrderChangedHandlerMock);
        });

        afterEach(() => {
            element.removeEventListener(EVENT_SORT_ORDER_CHANGED, sortOrderChangedHandlerMock);
        });

        it('sort event name', () => {
            expect(EVENT_SORT_ORDER_CHANGED).toBe('searchsort');
        });

        it('should call the event handler once when the event is fired', async () => {
            const sortRuleId: string = sortRuleOptions[1].value;
            combobox!.value = sortRuleId;
            combobox!.dispatchEvent(
                new CustomEvent('change', {
                    detail: {
                        value: sortRuleId,
                    },
                })
            );
            await Promise.resolve();
            expect(sortOrderChangedHandlerMock).toHaveBeenCalledTimes(1);
        });

        it('should fired event with the correct sort rule Id', async () => {
            const sortRuleId: string = sortRuleOptions[1].value;
            combobox!.value = sortRuleId;
            combobox!.dispatchEvent(
                new CustomEvent('change', {
                    detail: {
                        value: sortRuleId,
                    },
                })
            );
            await Promise.resolve();
            expect(sortOrderChangedHandlerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    detail: { sortRuleId },
                })
            );
        });
    });

    describe('sort event not be fired', () => {
        let sortOrderChangedHandlerMock: EventListenerOrEventListenerObject;

        beforeEach(() => {
            element.sortRuleId = sortRuleOptions[0].value;
            element.sortRules = sortRuleData;
            sortOrderChangedHandlerMock = jest.fn();
            element.addEventListener(EVENT_SORT_ORDER_CHANGED, sortOrderChangedHandlerMock);
        });

        afterEach(() => {
            element.removeEventListener(EVENT_SORT_ORDER_CHANGED, sortOrderChangedHandlerMock);
        });

        it('sort order not changed, event should not be fired', async () => {
            // Dispatch a change event without changing the selected option
            combobox!.dispatchEvent(
                new CustomEvent('change', {
                    composed: true,
                    bubbles: true,
                    detail: {
                        value: sortRuleOptions[0].value,
                    },
                })
            );

            // Event should not be fired if it's the same as current selected order option
            await Promise.resolve();
            expect(sortOrderChangedHandlerMock).not.toHaveBeenCalled();
        });
    });

    describe('sort menu component with empty options', () => {
        [null, undefined, []].forEach((emptySortRules) => {
            it(`defaults the sort rules to be an empty list when ${JSON.stringify(emptySortRules)}`, async () => {
                element.sortRules = emptySortRules;
                document.body.appendChild(element);

                await Promise.resolve();
                expect(combobox!.options).toHaveLength(0);
            });
        });
    });
});
