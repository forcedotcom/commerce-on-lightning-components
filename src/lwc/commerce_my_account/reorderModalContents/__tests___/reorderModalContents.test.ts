import { createElement } from 'lwc';
import type { TestWireAdapter } from 'types/testing';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { OrderActionAddToCartAdapter } from 'commerce/orderApi';
import ReorderModalContents from 'commerce_my_account/reorderModalContents';
import { Empty_MODAL_DATA, REORDER_MODAL_DATA_MULTIPLE, REORDER_MODAL_DATA_SINGLE } from './data/modalTestData';
import { querySelector } from 'kagekiri';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });
jest.mock('commerce/context');
jest.mock('commerce/contextApi');

jest.mock('commerce/orderApi', () =>
    Object.assign({}, jest.requireActual('commerce/orderApi'), {
        OrderActionAddToCartAdapter: mockCreateTestWireAdapter(),
        OrderItemsAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock('commerce/cartApiInternal', () => ({
    cartSummaryChanged: jest.fn(() => 'test'),
}));

jest.mock('../labels', () => ({
    spinnerScreenHeaderText: 'Reorder in progress',
    spinnerScreenHelpText: 'Adding items to your cart...',
    viewCartButtonLabel: 'View Cart',
    continueShoppingButton: 'Continue shopping',
    itemsNotAvailableInStoreHeaderText: 'Some items are unavailable',
    errorScreenButtonLabel: 'GOT IT.',
    unavailableItems: 'UNAVAILABLE ITEMS',
    itemAddedItemNotAvailableInStoreHelpText: 'We added 1 item to your cart, but 1 item is unavailable or out of stock',
    noItemsAvailableHelpText: 'We could not add any items to your cart, items are unavailable or out of stock.',
    errorScreenHeaderText: "Something isn't right...",
    errorScreenSubHeaderText:
        "We couldn't add the items to your cart. Try adding your items again. If the problem persists, contact customer support",
}));

describe('commerce_my_account/reorderModalContent', () => {
    let element: ReorderModalContents & HTMLElement;

    beforeEach(() => {
        jest.clearAllMocks();
        element = createElement('commerce_my_account-reorder-modal-contents', {
            is: ReorderModalContents,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.removeChild(element);
    });

    [
        {
            property: 'orderSummaryId',
            defaultValue: undefined,
            changeValue: '123',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof ReorderModalContents]).toStrictEqual(
                    propertyTest.defaultValue
                );
            });
            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof ReorderModalContents]).not.toBe(propertyTest.changeValue);
                //@ts-ignore
                element[propertyTest.property as keyof ReorderModalContents] = propertyTest.changeValue;
                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof ReorderModalContents]).toStrictEqual(
                    propertyTest.changeValue
                );
            });
        });
    });

    describe('accessibility', () => {
        it('is accessible when loading', () => {
            return Promise.resolve().then(async () => {
                expect.assertions(1);
                await expect(element).toBeAccessible();
            });
        });

        it('is accessible when not loading', () => {
            (<typeof OrderActionAddToCartAdapter & typeof TestWireAdapter>OrderActionAddToCartAdapter).emit({
                data: REORDER_MODAL_DATA_SINGLE,
            });
            return Promise.resolve().then(async () => {
                expect.assertions(1);
                await expect(element).toBeAccessible();
            });
        });
    });

    describe('while data is loading', () => {
        it('shows the spinner while data is loading', () => {
            const spinnerScreenHeader = querySelector('h1')?.textContent;
            const spinnerScreenHelpText = querySelector('h2')?.textContent;
            expect(spinnerScreenHeader).toBe('Reorder in progress');
            expect(spinnerScreenHelpText).toBe('Adding items to your cart...');
        });
    });

    describe('After data has loaded', () => {
        it('Shows correct error labels when wire returns error response', async () => {
            (<typeof OrderActionAddToCartAdapter & typeof TestWireAdapter>OrderActionAddToCartAdapter).emit({
                error: {},
            });
            await Promise.resolve();
            const heading = querySelector('h1')?.textContent;
            const subheading = querySelector('h2')?.textContent;
            const errorStateButtonText = querySelector('button[name="errorsScreenButton"]')?.textContent;
            expect(heading).toBe("Something isn't right...");
            expect(subheading).toBe(
                "We couldn't add the items to your cart. Try adding your items again. If the problem persists, contact customer support"
            );
            expect(errorStateButtonText).toBe('GOT IT.');
        });

        it("doesn't show unadded products if there are none", async () => {
            (<typeof OrderActionAddToCartAdapter & typeof TestWireAdapter>OrderActionAddToCartAdapter).emit({
                data: Empty_MODAL_DATA,
            });
            await Promise.resolve();
            const unaddedProducts = querySelector('ul');
            expect(unaddedProducts).toBeFalsy();
        });

        it('Shows modal subheadings', async () => {
            (<typeof OrderActionAddToCartAdapter & typeof TestWireAdapter>OrderActionAddToCartAdapter).emit({
                data: REORDER_MODAL_DATA_SINGLE,
            });
            await Promise.resolve();
            const subheading = querySelector('h2')?.textContent;
            const itemsUnavailable = querySelector('h3')?.textContent;
            expect(subheading).toBe('We added 1 item to your cart, but 1 item is unavailable or out of stock');
            expect(itemsUnavailable).toBe('UNAVAILABLE ITEMS');
        });

        it('Should show the viewCart anchor', async () => {
            (<typeof OrderActionAddToCartAdapter & typeof TestWireAdapter>OrderActionAddToCartAdapter).emit({
                data: REORDER_MODAL_DATA_MULTIPLE,
            });
            await Promise.resolve();
            const viewCartAnchor: HTMLAnchorElement | null = element.querySelector('a');
            expect(viewCartAnchor).toBeDefined();
        });

        it('should call handleViewCart when the View Cart anchor is clicked', async () => {
            const handler = jest.fn();
            element.addEventListener('viewcart', handler);
            (<typeof OrderActionAddToCartAdapter & typeof TestWireAdapter>OrderActionAddToCartAdapter).emit({
                data: REORDER_MODAL_DATA_SINGLE,
            });
            await Promise.resolve();
            const viewCartAnchor: HTMLAnchorElement | null = element.querySelector('a');
            viewCartAnchor?.click();
            await Promise.resolve();
            expect(handler).toHaveBeenCalled();
        });

        it('Should call handleCloseModal on Continue Shopping button click', async () => {
            const handler = jest.fn();
            element.addEventListener('close', handler);
            (<typeof OrderActionAddToCartAdapter & typeof TestWireAdapter>OrderActionAddToCartAdapter).emit({
                data: REORDER_MODAL_DATA_SINGLE,
            });
            await Promise.resolve();
            const continueShoppingButton: HTMLButtonElement | null = element.querySelector(
                'button[name="continueShoppingButton"]'
            );
            continueShoppingButton?.click();
            expect(handler).toHaveBeenCalledTimes(1);
        });
    });
});
