import { createElement } from 'lwc';
import { querySelector } from 'kagekiri';
import OrdersRefinements from 'commerce_my_account/ordersRefinements';

const sortOptions = [
    {
        label: 'age Descending',
        value: 'ageDescending',
        selected: true,
    },
];

describe('commerce_my_account/ordersRefinements', () => {
    let element: HTMLElement & OrdersRefinements;
    type ordersRefinementsProps =
        | 'showFilter'
        | 'filterText'
        | 'startDate'
        | 'endDate'
        | 'showSortBy'
        | 'sortOptions'
        | 'count'
        | 'smallLayout';

    beforeEach(() => {
        element = createElement('commerce_my_account-orders-refinements', {
            is: OrdersRefinements,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'showFilter',
            defaultValue: false,
            changeValue: null,
        },
        {
            property: 'filterText',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'startDate',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'endDate',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'showSortBy',
            defaultValue: false,
            changeValue: null,
        },
        {
            property: 'sortOptions',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'count',
            defaultValue: undefined,
            changeValue: 1,
        },
        {
            property: 'smallLayout',
            defaultValue: false,
            changeValue: true,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<ordersRefinementsProps>propertyTest.property]).toStrictEqual(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<ordersRefinementsProps>propertyTest.property]).not.toStrictEqual(
                    propertyTest.changeValue
                );

                // Change the value.
                // @ts-ignore
                element[<ordersRefinementsProps>propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[<ordersRefinementsProps>propertyTest.property]).toStrictEqual(propertyTest.changeValue);
            });
        });
    });

    it('is accessible', async () => {
        element.showFilter = true;
        element.showSortBy = true;
        element.filterText = 'filter text';
        element.startDate = '2022-10-01';
        element.endDate = '2022-10-03';
        element.count = 1;
        await Promise.resolve();
        expect(element).toBeAccessible();
    });

    it('displays a filter when showFilter is true', async () => {
        element.showFilter = true;
        await Promise.resolve();
        const dateFilter = querySelector('commerce_my_account-date-filter');
        expect(dateFilter).toBeTruthy();
    });

    [null, undefined].forEach((invalidShowFilter) => {
        it(`doesn't display filter if  showFilter ({invalidShowFilter}) isn't true`, async () => {
            element.showFilter = invalidShowFilter;
            await Promise.resolve();
            const dateFilter = querySelector('commerce_my_account-date-filter');
            expect(dateFilter).toBeNull();
        });
    });

    [true, false].forEach((smallLayout) => {
        it(`displays sort by option for smallLayout(${smallLayout}) when showSortBy is true `, async () => {
            element.showSortBy = true;
            element.smallLayout = smallLayout;
            element.sortOptions = sortOptions;
            await Promise.resolve();
            const sortBy = querySelector('commerce_my_account-apply-sort');
            expect(sortBy).toBeTruthy();
        });
    });

    [null, undefined].forEach((invalidShowSortBy) => {
        it(`doesn't display sort by option if  showSortBy ({invalidShowSortBy}) isn't true`, async () => {
            element.showSortBy = invalidShowSortBy;
            element.sortOptions = sortOptions;
            await Promise.resolve();
            const sortBy = querySelector('commerce_my_account-apply-sort');
            expect(sortBy).toBeNull();
        });
    });

    it('focus on total record count if consumer component tries to set the foucs', async () => {
        element.count = 1;
        await Promise.resolve();
        element.focus();
        const recordCount = querySelector('.record-count');
        expect(document.activeElement).toBe(recordCount);
    });

    it('focus on total record count if consumer component tries to set the foucs and then update the count to non zero', async () => {
        element.count = 0;
        await Promise.resolve();
        element.focus();
        element.count = 1;
        await Promise.resolve();
        const recordCount = querySelector('.record-count');
        expect(document.activeElement).toBe(recordCount);
    });

    [0, null, undefined].forEach((emptyCount) => {
        it(`doesn't focus on total record count if consumer component tries to set the foucs and no records(${emptyCount}) are present`, async () => {
            element.focus();
            element.count = emptyCount;
            await Promise.resolve();
            expect(document.activeElement).toBe(document.body);
        });
    });
});
