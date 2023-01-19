import { createElement } from 'lwc';
import CategoryTree from 'commerce_search/categoryTree';

const ancestorCategories = [
    {
        id: '0000',
        label: 'All Categories (10)',
        categoryName: 'All Categories',
        items: [],
    },
];

const selectedCategory = {
    id: '0011',
    label: 'Category1 (15)',
    categoryName: 'Category1',
    items: [
        {
            id: '111',
            label: 'Category1-1 (5)',
            categoryName: 'Category1-1',
        },
        {
            id: '1122',
            label: 'Category1-2 (5)',
            categoryName: 'Category1-2',
        },
    ],
};

describe('commerce_search/categoryTree: Category Tree', () => {
    let element: HTMLElement & CategoryTree;

    beforeEach(() => {
        element = createElement('commerce_search-category-tree', {
            is: CategoryTree,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('returns an empty list when tree is not given', () => {
        return Promise.resolve().then(() => {
            const listElements = element.querySelectorAll('li');
            expect(listElements).toHaveLength(0);
        });
    });

    it.each`
        label                                                                    | data
        ${'ancestor categories is undefined and selected category is undefined'} | ${{ ancestorCategories: undefined, selectedCategory: undefined }}
        ${'ancestor categories is empty array and selected category is {}'}      | ${{ ancestorCategories: [], selectedCategory: {} }}
    `(`should render an empty list when $label`, async ({ data }) => {
        element.displayData = data;
        await Promise.resolve();
        const listElements = element.querySelectorAll('li');
        expect(listElements).toHaveLength(0);
    });

    it('should not fail if ancestor categories contains invalid item', async () => {
        element.displayData = { ancestorCategories: [{}], selectedCategory: {} };
        await Promise.resolve();
        const listElements = element.querySelectorAll('li');
        expect(listElements).toHaveLength(1);
    });

    it('shows the correct number of list elements when a tree object is passed in', () => {
        element.displayData = { ancestorCategories, selectedCategory };

        return Promise.resolve().then(() => {
            const listElements = element.querySelectorAll('li');
            expect(listElements).toHaveLength(ancestorCategories.length + selectedCategory.items.length + 1);
        });
    });

    it('triggers the category update event when clicking on a category', () => {
        element.displayData = { ancestorCategories, selectedCategory };

        return Promise.resolve().then(() => {
            const category = <HTMLElement>element.querySelector('li .category-item');

            const categoryUpdateFn = jest.fn();

            element.addEventListener('categoryupdate', categoryUpdateFn);

            category.dispatchEvent(
                new CustomEvent('click', {
                    bubbles: true,
                    cancelable: true,
                })
            );

            expect(categoryUpdateFn).toHaveBeenCalled();
        });
    });

    it('triggers the category update event when clicking on the back arrow button', () => {
        element.displayData = { ancestorCategories, selectedCategory };

        return Promise.resolve().then(() => {
            const categoryUpdateFn = jest.fn();

            element.addEventListener('categoryupdate', categoryUpdateFn);

            (<HTMLElement>element.querySelector('li lightning-button-icon')).dispatchEvent(
                new CustomEvent('click', {
                    bubbles: true,
                    cancelable: true,
                })
            );

            expect(categoryUpdateFn).toHaveBeenCalled();
        });
    });

    it("triggers the category update event on pressing 'Enter' on category", () => {
        element.displayData = { ancestorCategories, selectedCategory };

        return Promise.resolve().then(() => {
            const category = <HTMLElement>element.querySelector('li .category-item');

            const categoryUpdateFn = jest.fn();

            element.addEventListener('categoryupdate', categoryUpdateFn);

            category.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

            expect(categoryUpdateFn).toHaveBeenCalled();
        });
    });

    it("does not trigger the category update event on pressing any other key other than 'Enter'", () => {
        element.displayData = { ancestorCategories, selectedCategory };

        return Promise.resolve().then(() => {
            const category = <HTMLElement>element.querySelector('li .category-item');

            const categoryUpdateFn = jest.fn();

            element.addEventListener('categoryupdate', categoryUpdateFn);

            category.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));

            expect(categoryUpdateFn).not.toHaveBeenCalled();
        });
    });
});
