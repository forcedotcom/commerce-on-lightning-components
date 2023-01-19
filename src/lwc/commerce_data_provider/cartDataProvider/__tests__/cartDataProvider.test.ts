import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import CartDataProvider from 'commerce_data_provider/cartDataProvider';
import { DataProviderActionEvent } from 'experience/dataProvider';
import {
    CartItemsAdapter,
    CartSummaryAdapter,
    deleteCurrentCart,
    deleteItemFromCart,
    updateItemInCart,
} from 'commerce/cartApi';
import { showMoreCartItems } from 'commerce/cartApiInternal';
import { apiData as cartSummaryData } from './data/cartSummaryData';
import { cartItemsData } from './data/cartItemsData';

import type { TestWireAdapter } from 'types/testing';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('commerce/cartApi', () =>
    Object.assign({}, jest.requireActual('commerce/cartApi'), {
        CartSummaryAdapter: mockCreateTestWireAdapter(),
        CartItemsAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock('commerce/cartApiInternal', () => ({
    deleteCurrentCart: jest.fn(),
    updateItemInCart: jest.fn(),
    deleteItemFromCart: jest.fn(),
    showMoreCartItems: jest.fn(),
}));

const CartSummaryTestAdapter = <typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter;
const CartItemsTestAdapter = <typeof CartItemsAdapter & typeof TestWireAdapter>CartItemsAdapter;

describe('commerce_data_provider/cartDataProvider', () => {
    let element: CartDataProvider & HTMLElement;

    beforeEach(() => {
        element = createElement('commerce_data_provider-cart-data-provider', {
            is: CartDataProvider,
        });
        document.body.appendChild(element);
    });

    // Clean up after each test
    afterEach(() => {
        jest.clearAllMocks();
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('Data Retrieval', () => {
        it('fetches all loaded Details Data', async () => {
            CartSummaryTestAdapter.emit({
                data: cartSummaryData.cartSummaryNetTax,
            });

            await Promise.resolve();
            expect(element.getData()?.Details).toEqual(cartSummaryData.detailsData);
        });

        it('fetches all loaded Totals Data', async () => {
            CartSummaryTestAdapter.emit({
                data: cartSummaryData.cartSummaryNetTax,
            });

            await Promise.resolve();
            expect(element.getData()?.Totals).toEqual(cartSummaryData.totalsNetData);
        });

        it('fetches all loaded Items Data', async () => {
            CartItemsTestAdapter.emit({
                data: cartItemsData,
            });

            await Promise.resolve();
            expect(element.getData()?.Items?.length).toBe(3);
            expect(element.getData()?.Items?.[0].name).toBe('Alpine Energy During Eco Pod, Chai');
            expect(element.getData()?.Items?.[0].ProductDetails.sku).toBe('6010018');
            expect(element.getData()?.Items?.[2].unitAdjustmentAmount).toBeUndefined();
        });

        it('returns an empty array if items are not provided, and loaded is true', async () => {
            CartItemsTestAdapter.emit({
                data: null,
                loaded: true,
            });
            await Promise.resolve();

            expect(element.getData()?.Items).toEqual([]);
        });

        it('returns undefined if items are not provided, and loaded is false', async () => {
            CartItemsTestAdapter.emit({
                data: null,
                loaded: false,
            });
            await Promise.resolve();

            expect(element.getData()?.Items).toBeUndefined();
        });

        it('Fetch Gross Tax Type', async () => {
            CartSummaryTestAdapter.emit({
                data: cartSummaryData.cartSummaryGrossTax,
            });
            await Promise.resolve();
            const taxType = element.getData()?.Details?.taxType;
            expect(taxType).toBe('Gross');
        });

        it('returns undefined when no cartSummary data is present for the field requested', () => {
            expect(element.getData()?.Details?.status).toBeUndefined();
        });

        it('returns undefined when data from adapters is null?', async () => {
            CartSummaryTestAdapter.emit({ data: null });

            await Promise.resolve();
            expect(element.getData()?.Details?.taxType).toBeUndefined();
        });
    });

    describe('loading state', () => {
        it.each([
            {
                label: `should return true if all wire adapters are loaded`,
                adapters: [
                    [CartSummaryTestAdapter, true],
                    [CartItemsTestAdapter, true],
                ],
            },
            {
                label: `should return false if no wire adapter is loaded`,
                adapters: [
                    [CartSummaryTestAdapter, false],
                    [CartItemsTestAdapter, false],
                ],
            },
            {
                label: `should return false if only 'CartSummaryAdapter' is loaded`,
                adapters: [
                    [CartSummaryTestAdapter, true],
                    [CartItemsTestAdapter, false],
                ],
            },
            {
                label: `should return false if only 'CartItemsAdapter' is loaded`,
                adapters: [
                    [CartSummaryTestAdapter, false],
                    [CartItemsTestAdapter, true],
                ],
            },
        ])('$label', async ({ adapters }: { adapters: unknown[] }) => {
            const expected = (<[TestWireAdapter, boolean][]>adapters).reduce(
                (result: boolean, [adapter, loaded]: [TestWireAdapter, boolean]) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (<any>adapter).emit({ data: null, loaded });
                    return result && loaded;
                },
                true
            );
            await Promise.resolve();
            expect(element.hasData()).toBe(expected);
        });
    });

    describe('Actions', () => {
        describe('cart:changeSortOrder', () => {
            ['NameDesc', 'CreatedDateDesc', 'CreatedDateAsc', 'NameAsc'].forEach((sortOrder) => {
                it(`Calls the CartItemsAdapter when the "cart:changeSortOrder" action is called with: ${sortOrder}`, async () => {
                    element.dispatchEvent(new DataProviderActionEvent('cart:changeSortOrder', sortOrder));

                    await Promise.resolve();

                    expect(CartItemsTestAdapter.getLastConfig()).toEqual(
                        expect.objectContaining({ sortOrder: sortOrder })
                    );
                });
            });
        });

        describe('cart:clear', () => {
            it('Calls deleteCurrentCart when the "cart:clear" action is called - success', () => {
                element.dispatchEvent(new DataProviderActionEvent('cart:clear'));
                expect(deleteCurrentCart).toHaveBeenCalled();
            });

            it('Calls deleteCurrentCart when the "cart:clear" action is called - error', async () => {
                const expectedError = { errorCode: 'FAILED' };
                (<jest.Mock>deleteCurrentCart).mockRejectedValueOnce(expectedError);

                // Mock console.error to prevent it from failing the test
                global.console.error = jest.fn();

                await Promise.resolve();

                const actionPromise = new Promise((resolve, reject) => {
                    element.dispatchEvent(
                        new DataProviderActionEvent('cart:clear', undefined, {
                            onSuccess: resolve,
                            onError: reject,
                        })
                    );
                });

                await expect(actionPromise).rejects.toEqual(expectedError);
                expect(deleteCurrentCart).toHaveBeenCalled();
            });
        });

        describe('cart:updateItem', () => {
            it('Calls updateItemInCart when the "cart:updateItem" action is called - success', async () => {
                element.dispatchEvent(
                    new DataProviderActionEvent('cart:updateItem', {
                        cartItemId: 'mockCartItemId',
                        quantity: 12,
                    })
                );

                await Promise.resolve();

                expect(updateItemInCart).toHaveBeenCalledTimes(1);
                expect(updateItemInCart).toHaveBeenCalledWith('mockCartItemId', 12);
            });

            it('Calls updateItemInCart when the "cart:updateItem" action is called - error', async () => {
                const expectedError = { errorCode: 'FAILED' };
                (<jest.Mock>updateItemInCart).mockRejectedValueOnce(expectedError);

                // Mock console.error to prevent it from failing the test
                global.console.error = jest.fn();

                const actionPromise = new Promise((resolve, reject) => {
                    element.dispatchEvent(
                        new DataProviderActionEvent(
                            'cart:updateItem',
                            {
                                cartItemId: 'mockCartItemId',
                                quantity: 12,
                            },
                            {
                                onSuccess: resolve,
                                onError: reject,
                            }
                        )
                    );
                });

                await expect(actionPromise).rejects.toEqual(expectedError);
                expect(updateItemInCart).toHaveBeenCalledTimes(1);
                expect(updateItemInCart).toHaveBeenCalledWith('mockCartItemId', 12);
            });
        });

        describe('cart:deleteItem', () => {
            it('Calls deleteItemFromCart when the "cart:deleteItem" action is called - success', async () => {
                element.dispatchEvent(new DataProviderActionEvent('cart:deleteItem', 'mockCartItemId'));

                await Promise.resolve();

                expect(deleteItemFromCart).toHaveBeenCalledTimes(1);
                expect(deleteItemFromCart).toHaveBeenCalledWith('mockCartItemId');
            });

            it('Calls deleteItemFromCart when the "cart:deleteItem" action is called - error', async () => {
                const expectedError = { errorCode: 'FAILED' };
                (<jest.Mock>deleteItemFromCart).mockRejectedValueOnce(expectedError);

                // Mock console.error to prevent it from failing the test
                global.console.error = jest.fn();

                const actionPromise = new Promise((resolve, reject) => {
                    element.dispatchEvent(
                        new DataProviderActionEvent('cart:deleteItem', 'mockCartItemId', {
                            onSuccess: resolve,
                            onError: reject,
                        })
                    );
                });

                await expect(actionPromise).rejects.toEqual(expectedError);
                expect(deleteItemFromCart).toHaveBeenCalledTimes(1);
                expect(deleteItemFromCart).toHaveBeenCalledWith('mockCartItemId');
            });
        });

        describe('cart:showMoreItems', () => {
            it('Calls showMoreCartItems when the "cart:showMore" action is called - with page token', async () => {
                const cartItemsDataWithToken = { ...cartItemsData };
                cartItemsDataWithToken.nextPageToken = 'someMockToken';

                //we don't need to care about what the response is, only that it resolves successfully
                const expectedResponse = { data: 'SUCCESS' };
                (<jest.Mock>showMoreCartItems).mockResolvedValueOnce(expectedResponse);

                CartItemsTestAdapter.emit({
                    data: cartItemsDataWithToken,
                });

                const actionPromise = new Promise((resolve, reject) => {
                    element.dispatchEvent(
                        new DataProviderActionEvent('cart:showMoreItems', undefined, {
                            onSuccess: resolve,
                            onError: reject,
                        })
                    );
                });

                await expect(actionPromise).resolves.toEqual(expectedResponse);

                await Promise.resolve();

                expect(showMoreCartItems).toHaveBeenCalledTimes(1);
                expect(showMoreCartItems).toHaveBeenCalledWith('someMockToken');
            });

            it('Calls showMoreCartItems when the "cart:showMore" action is called - without page token', async () => {
                const actionPromise = new Promise((resolve, reject) => {
                    element.dispatchEvent(
                        new DataProviderActionEvent('cart:showMoreItems', undefined, {
                            onSuccess: resolve,
                            onError: reject,
                        })
                    );
                });

                await expect(actionPromise).resolves.toEqual({});
                expect(showMoreCartItems).not.toHaveBeenCalledTimes(1);
            });

            it('Calls showMoreCartItems when the "cart:showMore" action is called - with page token - error', async () => {
                // Mock console.error to prevent it from failing the test
                global.console.error = jest.fn();

                const expectedError = { errorCode: 'FAILED' };
                (<jest.Mock>showMoreCartItems).mockRejectedValueOnce(expectedError);

                const cartItemsDataWithToken = { ...cartItemsData };
                cartItemsDataWithToken.nextPageToken = 'someMockToken';

                CartItemsTestAdapter.emit({
                    data: cartItemsDataWithToken,
                });

                const actionPromise = new Promise((resolve, reject) => {
                    element.dispatchEvent(
                        new DataProviderActionEvent('cart:showMoreItems', undefined, {
                            onSuccess: resolve,
                            onError: reject,
                        })
                    );
                });

                await expect(actionPromise).rejects.toEqual(expectedError);
                expect(showMoreCartItems).toHaveBeenCalled();
                expect(showMoreCartItems).toHaveBeenCalledWith('someMockToken');
            });
            it('has a new page if a new next page token is provided', async () => {
                const cartItemsDataWithToken = { ...cartItemsData };
                cartItemsDataWithToken.nextPageToken = 'someMockToken';

                const expectedResponse = { nextPageToken: 'newMockToken' };
                (<jest.Mock>showMoreCartItems).mockResolvedValueOnce(expectedResponse);

                CartItemsTestAdapter.emit({
                    data: cartItemsDataWithToken,
                });

                const actionPromise = new Promise((resolve, reject) => {
                    element.dispatchEvent(
                        new DataProviderActionEvent('cart:showMoreItems', undefined, {
                            onSuccess: resolve,
                            onError: reject,
                        })
                    );
                });

                await expect(actionPromise).resolves.toEqual(expectedResponse);

                await Promise.resolve();

                expect(element.getData()?.Pagination?.hasNextPage).toBe(true);
            });

            it('does not display a new page if a new next page token is not provided', async () => {
                const cartItemsDataWithToken = { ...cartItemsData };
                cartItemsDataWithToken.nextPageToken = 'someMockToken';

                const expectedResponse = { nextPageToken: null };
                (<jest.Mock>showMoreCartItems).mockResolvedValueOnce(expectedResponse);

                CartItemsTestAdapter.emit({
                    data: cartItemsDataWithToken,
                });

                const actionPromise = new Promise((resolve, reject) => {
                    element.dispatchEvent(
                        new DataProviderActionEvent('cart:showMoreItems', undefined, {
                            onSuccess: resolve,
                            onError: reject,
                        })
                    );
                });

                await expect(actionPromise).resolves.toEqual(expectedResponse);

                await Promise.resolve();

                expect(element.getData()?.Pagination?.hasNextPage).toBe(false);
            });
        });
    });
});
