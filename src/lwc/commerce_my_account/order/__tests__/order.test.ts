import { createElement } from 'lwc';
import Order from 'commerce_my_account/order';

import { mockOrder } from './data/order';
import { mockOrderWithoutFields } from './data/orderWithoutFields';
import { mockActions } from './data/actions';
import { querySelector } from 'kagekiri';

const mockGeneratedUrl = '/b2c/s/detail/1Osxx0000006i45AAA';
jest.mock('lightning/navigation', () => ({
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
    generateUrl: jest.fn(() => mockGeneratedUrl),
}));

jest.mock('lightning/uiRecordApi', () => ({
    getRecord: jest.fn(),
}));

describe('commerce_my_account-order: order details', () => {
    let element: HTMLElement & Order;
    type orderProperty = 'order' | 'actions' | 'columns' | 'detailsLabel';

    beforeEach(() => {
        element = createElement('commerce_my_account-order', {
            is: Order,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'order',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'actions',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'columns',
            defaultValue: undefined,
            changeValue: 4,
        },
        {
            property: 'detailsLabel',
            defaultValue: undefined,
            changeValue: 'view details',
        },
        {
            property: 'fieldsetTabIndex',
            defaultValue: undefined,
            changeValue: '0',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<orderProperty>propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<orderProperty>propertyTest.property]).not.toBe(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[<orderProperty>propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[<orderProperty>propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('is accessible', async () => {
        element.actions = mockActions;
        element.order = mockOrder;
        element.detailsLabel = 'view details';
        await Promise.resolve();
        await expect(element).toBeAccessible();
    });

    it('displays fields of the order, if order contains fields info', async () => {
        element.order = mockOrder;
        await Promise.resolve();
        const ordersFields = querySelector('commerce_my_account-order-line-item-fields');
        expect(ordersFields).toBeTruthy();
    });

    [null, undefined, mockOrderWithoutFields].forEach((data) => {
        it(`doesn't display fields of the order, if order is ${data}`, async () => {
            element.order = data;
            await Promise.resolve();
            const ordersFields = querySelector('commerce_my_account-order-line-item-fields');
            expect(ordersFields).toBeNull();
        });
    });

    it('displays actions container, if actions are available', async () => {
        element.actions = mockActions;
        element.order = mockOrder;
        await Promise.resolve();
        const actionsCtn = querySelector('commerce_my_account-order-line-item-action-container');
        expect(actionsCtn).toBeTruthy();
    });

    [null, undefined, []].forEach((actions) => {
        it(`doesn't display actions container, if actions are ${actions}`, async () => {
            element.actions = actions;
            element.order = mockOrder;
            await Promise.resolve();
            const actionsCtn = querySelector('commerce_my_account-order-line-item-action-container');
            expect(actionsCtn).toBeNull();
        });
    });

    [null, undefined].forEach((order) => {
        it(`doesn't display actions container, if order is ${order}`, async () => {
            element.order = order;
            element.actions = mockActions;
            await Promise.resolve();
            const actionsCtn = querySelector('commerce_my_account-order-line-item-action-container');
            expect(actionsCtn).toBeNull();
        });
    });

    it('displays view details, if text for view more detail is avilable along with order id', async () => {
        element.order = mockOrder;
        element.detailsLabel = 'view details';
        await Promise.resolve();
        const actionsCtn = querySelector('commerce_my_account-order-line-item-action-container');
        expect(actionsCtn).toBeTruthy();
    });

    it("triggers the event shiftfocus with direction 'up' if up arrow key is pressed", async () => {
        element.order = mockOrder;
        const shiftFocusListener = jest.fn();
        element.addEventListener('shiftfocus', shiftFocusListener);
        await Promise.resolve();
        querySelector('commerce_my_account-order-line-item-fields')?.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowUp' })
        );
        expect(shiftFocusListener).toHaveBeenCalledWith(
            expect.objectContaining({
                bubbles: false,
                cancelable: false,
                composed: false,
                detail: {
                    cell: 'orderInfo',
                    direction: 'up',
                },
            })
        );
    });

    it("triggers the event shiftfocus with direction 'down' if down arrow key is pressed", async () => {
        element.order = mockOrder;
        const shiftFocusListener = jest.fn();
        element.addEventListener('shiftfocus', shiftFocusListener);
        await Promise.resolve();
        querySelector('commerce_my_account-order-line-item-fields')?.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowDown' })
        );
        expect(shiftFocusListener).toHaveBeenCalledWith(
            expect.objectContaining({
                bubbles: false,
                cancelable: false,
                composed: false,
                detail: {
                    cell: 'orderInfo',
                    direction: 'down',
                },
            })
        );
    });

    ['orderInfo', 'actions'].forEach((cell) => {
        it(`focus on action cell if right arrow key is pressed and current cell is ${cell}`, async () => {
            element.actions = mockActions;
            element.order = mockOrder;
            const focusListener = jest.fn();

            await Promise.resolve();
            querySelector("[data-cell-id='actions']")?.addEventListener('focus', focusListener);
            querySelector(`[data-cell-id='${cell}']`)?.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'ArrowRight' })
            );
            expect(focusListener).toHaveBeenCalledTimes(1);
        });
    });

    ['orderInfo', 'actions'].forEach((cell) => {
        it(`focus on order fields cell if left arrow key is pressed and current cell is ${cell}`, async () => {
            element.actions = mockActions;
            element.order = mockOrder;
            const focusListener = jest.fn();

            await Promise.resolve();
            querySelector("[data-cell-id='orderInfo']")?.addEventListener('focus', focusListener);
            querySelector(`[data-cell-id='${cell}']`)?.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'ArrowLeft' })
            );
            expect(focusListener).toHaveBeenCalledTimes(1);
        });
    });

    it('focus on cell if focusCell has been called on the element', async () => {
        element.actions = mockActions;
        element.order = mockOrder;
        const focusListener = jest.fn();

        await Promise.resolve();
        querySelector("[data-cell-id='orderInfo']")?.addEventListener('focus', focusListener);
        element.focusCell('orderInfo');
        expect(focusListener).toHaveBeenCalledTimes(1);
    });

    it('does nothing if any key other than arrow key is pressed', async () => {
        element.order = mockOrder;
        element.actions = mockActions;
        const shiftFocusListener = jest.fn();
        element.addEventListener('shiftfocus', shiftFocusListener);

        await Promise.resolve();
        querySelector("[data-cell-id='orderInfo']")?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
        expect(shiftFocusListener).not.toHaveBeenCalled();
    });

    it('display actions and orderInfo as gridcell if column value is more than 1', async () => {
        element.order = mockOrder;
        element.actions = mockActions;
        element.columns = 4;
        await Promise.resolve();
        expect(querySelector("[data-cell-id='orderInfo'][role='gridcell']")).toBeTruthy();
        expect(querySelector("[data-cell-id='actions'][role='gridcell']")).toBeTruthy();
    });

    it('displays actions and orderInfo as presentation if column value is 1 (small container)', async () => {
        element.order = mockOrder;
        element.actions = mockActions;
        element.columns = 1;
        await Promise.resolve();
        expect(querySelector("[data-cell-id='orderInfo'][role='presentation']")).toBeTruthy();
        expect(querySelector("[data-cell-id='actions'][role='presentation']")).toBeTruthy();
    });

    it('display tab index as 0 for orderInfo and -1 for actions when fieldsetTabIndex is 0', async () => {
        element.order = mockOrder;
        element.actions = mockActions;
        element.fieldsetTabIndex = 0;
        await Promise.resolve();
        expect(querySelector("[data-cell-id='orderInfo'][tabindex='0']")).toBeTruthy();
        expect(querySelector("[data-cell-id='actions'][tabindex='-1']")).toBeTruthy();
    });

    [-1, undefined].forEach((fieldsetTabIndex) => {
        it(`display tab index as -1 for orderInfo and actions when fieldsetTabIndex is ${fieldsetTabIndex}`, async () => {
            element.order = mockOrder;
            element.actions = mockActions;
            element.fieldsetTabIndex = fieldsetTabIndex;
            await Promise.resolve();
            expect(querySelector("[data-cell-id='actions'][tabindex='-1']")).toBeTruthy();
            expect(querySelector("[data-cell-id='orderInfo'][tabindex='-1']")).toBeTruthy();
        });
    });
});
