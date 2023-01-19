import { createElement } from 'lwc';
import { querySelector, querySelectorAll } from 'kagekiri';
import ApplySort from 'commerce_my_account/applySort';

describe('commerce_my_account/applySort', () => {
    let element: HTMLElement & ApplySort;
    type applySortProps = 'sortOptions';

    beforeEach(() => {
        element = createElement('commerce_my_account-apply-sort', {
            is: ApplySort,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'sortOptions',
            defaultValue: undefined,
            changeValue: null,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<applySortProps>propertyTest.property]).toStrictEqual(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<applySortProps>propertyTest.property]).not.toStrictEqual(propertyTest.changeValue);

                // Change the value.
                element[<applySortProps>propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[<applySortProps>propertyTest.property]).toStrictEqual(propertyTest.changeValue);
            });
        });
    });

    it('is accessible', () => {
        element.sortOptions = [
            {
                label: 'age Descending',
                value: 'ageDescending',
                selected: true,
            },
            {
                label: 'age Ascending',
                value: 'ageAscending',
                selected: false,
            },
        ];
        return Promise.resolve().then(async () => {
            await expect(element).toBeAccessible();
        });
    });

    [null, undefined, []].forEach((emptySortOptions) => {
        it(`doesn't displays sort by option for emptySortOptions(${emptySortOptions})`, async () => {
            element.sortOptions = emptySortOptions;
            await Promise.resolve();
            (<HTMLElement>querySelector('lightning-button-menu')).click();
            await Promise.resolve();
            const sortBy = querySelector('lightning-menu-item');
            expect(sortBy).toBeNull();
        });
    });

    it('displays all sorting options', async () => {
        element.sortOptions = [
            {
                label: 'age Descending',
                value: 'ageDescending',
                selected: true,
            },
            {
                label: 'age Ascending',
                value: 'ageAscending',
                selected: false,
            },
        ];
        await Promise.resolve();
        (<HTMLElement>querySelector('lightning-button-menu')).click();
        await Promise.resolve();
        const menuItems = querySelectorAll('lightning-menu-item');
        expect(menuItems).toHaveLength(element.sortOptions.length);
    });

    it('dispalys the sort option as selected if the value of select is true', async () => {
        element.sortOptions = [
            {
                label: 'age Descending',
                value: 'ageDescending',
                selected: true,
            },
        ];
        await Promise.resolve();
        (<HTMLElement>querySelector('lightning-button-menu')).click();
        await Promise.resolve();
        const selectedMenuItem = querySelector('lightning-menu-item');
        expect((selectedMenuItem as HTMLInputElement).checked).toBe(true);
    });

    it("triggers the 'sortorders' event when sort by has been changed", async () => {
        element.sortOptions = [
            {
                label: 'age Descending',
                value: 'ageDescending',
                selected: false,
            },
        ];
        const sortordersListener = jest.fn();
        element.addEventListener('sortorders', sortordersListener);
        await Promise.resolve();
        (<HTMLElement>querySelector('lightning-button-menu')).dispatchEvent(
            new CustomEvent('select', {
                detail: {
                    value: 'ageDescending',
                },
            })
        );
        await Promise.resolve();
        expect(sortordersListener).toHaveBeenCalledWith(
            expect.objectContaining({
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    sortingOption: 'ageDescending',
                },
            })
        );
    });
});
