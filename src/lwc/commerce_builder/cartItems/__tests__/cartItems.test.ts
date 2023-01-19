import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import CartItems from 'commerce_builder/cartItems';
import { sampleCartItemData } from './data/cartItemData';
import * as isPreviewMode from '@app/isPreviewMode';
import { SHOW_MORE_EVENT } from 'commerce_cart/items';
import { DELETE_ITEM_EVENT, UPDATE_ITEM_EVENT, NAVIGATE_PRODUCT_EVENT } from 'commerce_cart/item';
import { CART_DP_ACTION_SHOW_MORE, CART_DP_ACTION_DELETE, CART_DP_ACTION_UPDATE } from 'commerce_builder/cartItems';
import { navigate } from 'lightning/navigation';

import type { DataProviderActionEvent } from 'experience/dataProvider';
import type { UpdateItemActionPayLoad } from 'commerce_data_provider/cartDataProvider';
import type Items from 'commerce_cart/items';
import type { InputField } from 'commerce_cart/item';

jest.mock('transport', () => ({
    fetch: jest.fn(() => Promise.resolve()),
}));

jest.mock('lightning/navigation', () => ({
    NavigationContext: mockCreateTestWireAdapter(),
    navigate: jest.fn(),
}));

jest.mock(
    '@app/isPreviewMode',
    () => ({
        __esModule: true,
        default: false,
    }),
    { virtual: true }
);

jest.mock('@salesforce/i18n/currency', () => 'USD', { virtual: true });

const mockIsPreviewMode = isPreviewMode as { default: boolean };

describe('commerce_builder/cartItems', () => {
    let element: CartItems & HTMLElement;

    beforeEach(() => {
        jest.clearAllMocks();
        element = createElement('commerce_builder-cart-items', {
            is: CartItems,
        });
        element.items = sampleCartItemData;
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('get displayShowMoreButton', () => {
        [
            {
                isPreviewMode: true,
                hasNextPageItems: true,
            },
            {
                isPreviewMode: false,
                hasNextPageItems: true,
            },
            {
                isPreviewMode: true,
                hasNextPageItems: false,
            },
        ].forEach((config) => {
            it(`should display when "displayShowMoreButton" is set to true, isPreviewMode: ${config.isPreviewMode} & hasNextPageItems: ${config.hasNextPageItems}`, () => {
                mockIsPreviewMode.default = config.isPreviewMode;

                // create element in this test so that it gets the correct value of `isPreviewMode`
                element = createElement('commerce_builder-cart-items', {
                    is: CartItems,
                });
                element.displayShowMoreItems = true;
                element.items = sampleCartItemData;
                element.hasNextPageItems = config.hasNextPageItems;
                document.body.appendChild(element);

                const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
                expect(cartItems?.displayShowMore).toBe(true);
            });
        });

        [
            {
                displayShowMoreItems: false,
                isPreviewMode: true,
                hasNextPageItems: true,
            },
            {
                displayShowMoreItems: false,
                isPreviewMode: true,
                hasNextPageItems: false,
            },
            {
                displayShowMoreItems: false,
                isPreviewMode: false,
                hasNextPageItems: true,
            },
            {
                displayShowMoreItems: false,
                isPreviewMode: false,
                hasNextPageItems: false,
            },
            {
                displayShowMoreItems: true,
                isPreviewMode: false,
                hasNextPageItems: false,
            },
        ].forEach((config) => {
            it(`should not display when "displayShowMoreButton" is set to false, isPreviewMode: ${config.isPreviewMode} & hasNextPageItems: ${config.hasNextPageItems}`, () => {
                mockIsPreviewMode.default = config.isPreviewMode;

                // create element in this test so that it gets the correct value of `isPreviewMode`
                element = createElement('commerce_builder-cart-items', {
                    is: CartItems,
                });
                element.items = sampleCartItemData;
                element.hasNextPageItems = config.hasNextPageItems;
                element.displayShowMoreItems = config.displayShowMoreItems;
                document.body.appendChild(element);

                const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
                expect(cartItems?.displayShowMore).toBe(false);
            });
        });
    });

    it('parses customFields properly', async () => {
        const sampleArray: InputField[] = [
            {
                name: 'foo',
                label: 'Foo',
                type: 'string',
            },
            {
                name: 'bar',
                label: 'Bar',
                type: 'number',
            },
        ];

        const sampleArrayString = JSON.stringify(sampleArray);
        element.productFieldMapping = sampleArrayString;

        await Promise.resolve();

        const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
        expect(cartItems?.productFieldMapping).toEqual(sampleArray);
    });

    it('returns an empty array if no productFieldMapping set', () => {
        const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
        expect(cartItems?.productFieldMapping).toEqual([]);
    });

    it('calls navigate when navigate product is received', () => {
        const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
        cartItems?.dispatchEvent(
            new CustomEvent(NAVIGATE_PRODUCT_EVENT, {
                detail: 'test_product_id',
            })
        );

        expect(navigate).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({
                attributes: {
                    objectApiName: 'Product2',
                    recordId: 'test_product_id',
                    actionName: 'view',
                },
            })
        );
    });

    describe('"cartshowmore" event handler', () => {
        it('dispatches DataProviderActionEvent "cart:showMoreItems" when "cartshowmore" is received', async () => {
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            element.displayShowMoreItems = true;

            await Promise.resolve();

            const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
            cartItems?.dispatchEvent(new CustomEvent(SHOW_MORE_EVENT));

            expect(dispatchSpy).toHaveBeenCalledTimes(2);

            const processingEventDetail = (<CustomEvent>dispatchSpy.mock.calls[0][0]).detail;
            expect(processingEventDetail).toEqual(
                expect.objectContaining({
                    processing: true,
                    loadingData: undefined,
                })
            );

            const actionEventDetail = (<DataProviderActionEvent<undefined>>dispatchSpy.mock.calls[1][0]).detail;
            expect(actionEventDetail.type).toBe(CART_DP_ACTION_SHOW_MORE);
        });

        it('set processing and loadingData to false onSuccess of data provider action', async () => {
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            element.displayShowMoreItems = true;

            await Promise.resolve();

            const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
            cartItems?.dispatchEvent(new CustomEvent(SHOW_MORE_EVENT));

            const actionEventDetail = (<DataProviderActionEvent<undefined>>dispatchSpy.mock.calls[1][0]).detail;

            actionEventDetail.options.onSuccess?.(null, true);
            expect(dispatchSpy).toHaveBeenCalledTimes(3);
            expect((<CustomEvent>dispatchSpy.mock.calls[2][0]).detail).toEqual(
                expect.objectContaining({
                    processing: false,
                    loadingData: false,
                })
            );
        });

        it('set processing and loadingData to false onError of data provider action', async () => {
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            element.displayShowMoreItems = true;

            await Promise.resolve();

            const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
            cartItems?.dispatchEvent(new CustomEvent(SHOW_MORE_EVENT));

            const actionEventDetail = (<DataProviderActionEvent<undefined>>dispatchSpy.mock.calls[1][0]).detail;

            actionEventDetail.options.onError?.(null, true);
            expect(dispatchSpy).toHaveBeenCalledTimes(3);
            expect((<CustomEvent>dispatchSpy.mock.calls[2][0]).detail).toEqual(
                expect.objectContaining({
                    processing: false,
                    loadingData: false,
                })
            );
        });
    });

    describe('"deletecartitem" event handler', () => {
        it('dispatches DataProviderActionEvent "cart:deleteItem" when "deletecartitem" is received', () => {
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
            cartItems?.dispatchEvent(
                new CustomEvent(DELETE_ITEM_EVENT, {
                    detail: 'test_cartItemId',
                })
            );

            expect(dispatchSpy).toHaveBeenCalledTimes(2);

            const processingEventDetail = (<CustomEvent>dispatchSpy.mock.calls[0][0]).detail;
            expect(processingEventDetail).toEqual(
                expect.objectContaining({
                    processing: true,
                    loadingData: undefined,
                })
            );

            const actionEventDetail = (<DataProviderActionEvent<undefined>>dispatchSpy.mock.calls[1][0]).detail;
            expect(actionEventDetail.type).toBe(CART_DP_ACTION_DELETE);
            expect(actionEventDetail.payload).toBe('test_cartItemId');
        });

        it('set processing and loadingData to false onSuccess of data provider action', () => {
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');

            const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
            cartItems?.dispatchEvent(
                new CustomEvent('deletecartitem', {
                    detail: 'test_cartItemId',
                })
            );

            const actionEventDetail = (<DataProviderActionEvent<undefined>>dispatchSpy.mock.calls[1][0]).detail;

            actionEventDetail.options.onSuccess?.(null, true);
            expect(dispatchSpy).toHaveBeenCalledTimes(3);
            expect((<CustomEvent>dispatchSpy.mock.calls[2][0]).detail).toEqual(
                expect.objectContaining({
                    processing: false,
                    loadingData: undefined,
                })
            );
        });

        it('set processing and loadingData to false onError of data provider action', () => {
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');

            const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
            cartItems?.dispatchEvent(
                new CustomEvent(DELETE_ITEM_EVENT, {
                    detail: 'test_cartItemId',
                })
            );

            const actionEventDetail = (<DataProviderActionEvent<undefined>>dispatchSpy.mock.calls[1][0]).detail;

            actionEventDetail.options.onError?.(null, true);
            expect(dispatchSpy).toHaveBeenCalledTimes(3);
            expect((<CustomEvent>dispatchSpy.mock.calls[2][0]).detail).toEqual(
                expect.objectContaining({
                    processing: false,
                    loadingData: undefined,
                })
            );
        });
    });

    describe('"updatecartitem" event handler', () => {
        it('dispatches DataProviderActionEvent "cart:updateItem" when "updatecartitem" is received', () => {
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
            cartItems?.dispatchEvent(
                new CustomEvent(UPDATE_ITEM_EVENT, {
                    detail: {
                        cartItemId: 'test_cartItemId',
                        quantity: 12,
                    },
                })
            );

            expect(dispatchSpy).toHaveBeenCalledTimes(2);

            const processingEventDetail = (<CustomEvent>dispatchSpy.mock.calls[0][0]).detail;
            expect(processingEventDetail).toEqual(
                expect.objectContaining({
                    processing: true,
                    loadingData: undefined,
                })
            );

            const actionEventDetail = (<DataProviderActionEvent<UpdateItemActionPayLoad>>dispatchSpy.mock.calls[1][0])
                .detail;
            expect(actionEventDetail.type).toBe(CART_DP_ACTION_UPDATE);
            expect(actionEventDetail.payload).toEqual({
                cartItemId: 'test_cartItemId',
                quantity: 12,
            });
        });

        it('set processing and loadingData to false onSuccess of data provider action', () => {
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');

            const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
            cartItems?.dispatchEvent(
                new CustomEvent(UPDATE_ITEM_EVENT, {
                    detail: {
                        cartItemId: 'test_cartItemId',
                        quantity: 12,
                    },
                })
            );

            const actionEventDetail = (<DataProviderActionEvent<undefined>>dispatchSpy.mock.calls[1][0]).detail;

            actionEventDetail.options.onSuccess?.(null, true);
            expect(dispatchSpy).toHaveBeenCalledTimes(3);
            expect((<CustomEvent>dispatchSpy.mock.calls[2][0]).detail).toEqual(
                expect.objectContaining({
                    processing: false,
                    loadingData: undefined,
                })
            );
        });

        it('set processing and loadingData to false onError of data provider action', () => {
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');

            const cartItems: (HTMLElement & Items) | null = element.querySelector('commerce_cart-items');
            cartItems?.dispatchEvent(
                new CustomEvent(UPDATE_ITEM_EVENT, {
                    detail: {
                        cartItemId: 'test_cartItemId',
                        quantity: 12,
                    },
                })
            );

            const actionEventDetail = (<DataProviderActionEvent<undefined>>dispatchSpy.mock.calls[1][0]).detail;

            actionEventDetail.options.onError?.(null, true);
            expect(dispatchSpy).toHaveBeenCalledTimes(3);
            expect((<CustomEvent>dispatchSpy.mock.calls[2][0]).detail).toEqual(
                expect.objectContaining({
                    processing: false,
                    loadingData: undefined,
                })
            );
        });
    });
});
