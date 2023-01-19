import { createElement } from 'lwc';
import Header from 'commerce_cart/header';
import { SORT_OPTIONS } from '../constants';
import { defaultSortOrder } from 'commerce/config';

import type Combobox from 'lightning/combobox';

const CHANGE_SORT_ORDER_EVENT = 'cartchangesortorder';

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(),
    }),
    { virtual: true }
);

describe('Cart Header', () => {
    let element: HTMLElement & Header;

    beforeEach(() => {
        element = createElement('commerce_cart-header', {
            is: Header,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    it('does not show the sort menu when showSortOptions is false', async () => {
        element.showSortOptions = false;

        await Promise.resolve();

        const sortOptionsCombobox: (HTMLElement & Combobox) | null = element.querySelector('lightning-combobox');
        expect(sortOptionsCombobox).toBeNull();
    });

    it('does not show the sort menu when showSortOptions is not defined', () => {
        const sortOptionsCombobox: (HTMLElement & Combobox) | null = element.querySelector('lightning-combobox');
        expect(sortOptionsCombobox).toBeNull();
    });

    it('Shows the default sort order on load', async () => {
        element.showSortOptions = true;
        await Promise.resolve();

        const sortOptionsCombobox: (HTMLElement & Combobox) | null = element.querySelector('lightning-combobox');
        expect(sortOptionsCombobox?.value).toBe(defaultSortOrder);
    });

    SORT_OPTIONS.forEach((sortOption) => {
        it(`fires "cartchangesortorder" with the the value: ${sortOption.value}, when sortOrder option is selected`, async () => {
            const eventHandler = jest.fn();
            element.addEventListener(CHANGE_SORT_ORDER_EVENT, eventHandler);

            element.showSortOptions = true;
            await Promise.resolve();

            const sortOptionsCombobox: (HTMLElement & Combobox) | null = element.querySelector('lightning-combobox');

            sortOptionsCombobox?.dispatchEvent(
                new CustomEvent('change', {
                    detail: {
                        value: sortOption.value,
                    },
                })
            );

            await Promise.resolve();
            await Promise.resolve();

            expect(eventHandler).toHaveBeenCalledTimes(1);

            const eventDetails = eventHandler.mock.calls[0][0].detail;
            expect(eventDetails).toBe(sortOption.value);
        });
    });

    describe('a11y', () => {
        it('is accessible', () => {
            // Assert that the element is accessible
            return Promise.resolve().then(async () => {
                await expect(element).toBeAccessible();
            });
        });
    });
});
