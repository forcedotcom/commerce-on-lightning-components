import { createElement } from 'lwc';
import Orders from 'commerce_my_account/orders';
import MockResizeObserver from './ResizeObserver';
import { mockOrders } from './data/orders';
import type Order from 'commerce_my_account/order';
import type OrdersRefinements from 'commerce_my_account/ordersRefinements';

async function timeout(ms = 0): Promise<void> {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockGeneratedUrl = '/commerce/s/detail/01txx0000006i45AAA';
const ordersURL = '/OrderSummary/OrderSummary/default';
jest.mock(
    'lightning/navigation',
    () => ({
        NavigationContext: jest.fn(),
        generateUrl: jest.fn(() => mockGeneratedUrl),
    }),
    { virtual: true }
);

jest.mock('lightning/uiRecordApi', () => ({
    getRecord: jest.fn(),
}));

describe('commerce_my_account/orders : Orders', () => {
    let element: Orders & HTMLElement;
    type ordersProperty =
        | 'orders'
        | 'actions'
        | 'listTitle'
        | 'detailsLabel'
        | 'showMoreLabel'
        | 'showMoreBehaviour'
        | 'focusedOrderId'
        | 'hasNextPage'
        | 'showSortBy'
        | 'sortOptions'
        | 'showFilter'
        | 'filterText'
        | 'noOrderMessageTitle'
        | 'noOrderMessageText'
        | 'errorMessage'
        | 'filterState'
        | 'isSorting'
        | 'isLoadingMore'
        | 'ordersUrl';

    beforeAll(() => {
        MockResizeObserver.mock([{ contentRect: { width: 1026 } }]);
    });

    afterAll(() => {
        MockResizeObserver.restore();
    });

    beforeEach(() => {
        element = createElement('commerce_my_account-orders', {
            is: Orders,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'orders',
            defaultValue: [],
            changeValue: mockOrders,
        },
        {
            property: 'actions',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'listTitle',
            defaultValue: undefined,
            changeValue: 'Recent Orders',
        },
        {
            property: 'detailsLabel',
            defaultValue: undefined,
            changeValue: 'view details',
        },
        {
            property: 'showMoreLabel',
            defaultValue: undefined,
            changeValue: 'show more',
        },
        {
            property: 'showMoreBehaviour',
            defaultValue: undefined,
            changeValue: 'SHOW_MORE',
        },
        {
            property: 'focusedOrderId',
            defaultValue: undefined,
            changeValue: '1Osxx0000006i45AAA',
        },
        {
            property: 'hasNextPage',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'showSortBy',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'sortOptions',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'showFilter',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'filterText',
            defaultValue: undefined,
            changeValue: 'filter by order date',
        },
        {
            property: 'noOrderMessageTitle',
            defaultValue: undefined,
            changeValue: 'No Orders',
        },
        {
            property: 'noOrderMessageText',
            defaultValue: undefined,
            changeValue: 'No Orders',
        },
        {
            property: 'errorMessage',
            defaultValue: undefined,
            changeValue: 'Something went wrong',
        },
        {
            property: 'filterState',
            defaultValue: undefined,
            changeValue: 'updated',
        },
        {
            property: 'isSorting',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'isLoadingMore',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'ordersUrl',
            defaultValue: undefined,
            changeValue: 'Sample Order URL',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<ordersProperty>propertyTest.property]).toStrictEqual(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<ordersProperty>propertyTest.property]).not.toStrictEqual(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[<ordersProperty>propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[<ordersProperty>propertyTest.property]).toStrictEqual(propertyTest.changeValue);
            });
        });
    });

    it('is accessible', async () => {
        element.orders = mockOrders;
        element.hasNextPage = true;
        element.showMoreLabel = 'show more';
        element.showMoreBehaviour = 'SHOW_MORE';
        element.showMoreAssistiveText = 'Assistive Text for show more';
        element.showFilter = true;
        element.filterText = 'orders filter text';
        element.startDate = '2022-08-29T10:27:42.000Z';
        element.endDate = '2022-09-29T10:27:42.000Z';
        await Promise.resolve();
        await expect(element).toBeAccessible();
    });

    it('displays orders, if orders have been provided', async () => {
        element.orders = mockOrders;
        await Promise.resolve();
        const orders = element.querySelectorAll('commerce_my_account-order');
        expect(orders).toHaveLength(2);
    });

    it('displays spinner, if more orders are being added to the page', async () => {
        element.isLoadingMore = true;
        await Promise.resolve();
        const spinner = element.querySelector('lightning-spinner');
        expect(spinner).toBeTruthy();
    });

    it('displays a link for orders UI, if value of showMoreBehaviour is GO_TO_LIST_UI', async () => {
        element.orders = mockOrders;
        element.hasNextPage = true;
        element.showMoreBehaviour = 'GO_TO_LIST_UI';
        element.ordersUrl = ordersURL;
        await Promise.resolve();
        const ordersViewLink = <HTMLAnchorElement | null>element.querySelector(`a[href='${ordersURL}']`);
        expect(ordersViewLink).toBeTruthy();
    });

    it('displays a show more button, if value of showMoreBehaviour is SHOW_MORE', async () => {
        element.orders = mockOrders;
        element.hasNextPage = true;
        element.showMoreBehaviour = 'SHOW_MORE';
        await Promise.resolve();
        const showMoreButton = element.querySelector('lightning-button');
        expect(showMoreButton).toBeTruthy();
    });

    it('triggers an event when show more button is clicked', async () => {
        element.orders = mockOrders;
        element.hasNextPage = true;
        element.showMoreBehaviour = 'SHOW_MORE';
        const actionListener = jest.fn();
        element.addEventListener('showmoreorders', actionListener);
        await Promise.resolve();
        (<HTMLButtonElement | null>element.querySelector('lightning-button'))?.click();
        expect(actionListener).toHaveBeenCalledWith(
            expect.objectContaining({
                bubbles: true,
                cancelable: false,
                composed: true,
            })
        );
    });

    it('displays orders unavilable message, if no order has been provided', async () => {
        element.orders = [];
        await Promise.resolve();
        const emptyState = element.querySelector('.emptyState');
        expect(emptyState).toBeTruthy();
    });

    it('displays error message, if error is present', async () => {
        element.orders = mockOrders;
        element.errorMessage = 'something went wrong';
        await Promise.resolve();
        const error = element.querySelector('commerce-error');
        expect(error).toBeTruthy();
    });

    it('focus on the order when valid focusedOrderId has been provided', async () => {
        element.orders = mockOrders;
        const focusedOrderId = '1Osxx0000006i45AAA';
        await Promise.resolve();
        const focusedOrder = <Order & HTMLElement>element.querySelector(`[data-order-id="${focusedOrderId}"]`);
        const mockFocusCell = jest.spyOn(focusedOrder, 'focusCell');
        element.focusedOrderId = focusedOrderId;
        element.hasNextPage = true;
        await Promise.resolve();
        expect(mockFocusCell).toHaveBeenCalledWith('orderInfo');
    });

    [undefined, '', 'randomString'].forEach((invalidFocusedOrderId) => {
        it(`doesn't focus if no order with given order id(${invalidFocusedOrderId}) is found`, async () => {
            element.orders = mockOrders;
            const focusedOrderId = '1Osxx0000006i45AAA';
            await Promise.resolve();
            const focusedOrder = <Order & HTMLElement>element.querySelector(`[data-order-id="${focusedOrderId}"]`);
            const mockFocusCell = jest.spyOn(focusedOrder, 'focusCell');
            element.focusedOrderId = invalidFocusedOrderId;
            element.hasNextPage = true;
            await Promise.resolve();
            expect(mockFocusCell).not.toHaveBeenCalled();
        });
    });

    it('verifies that correct value of order count is being passed to order Refinements', async () => {
        element.orders = mockOrders;
        await Promise.resolve();
        const header = <OrdersRefinements & HTMLElement>element.querySelector('commerce_my_account-orders-refinements');
        expect(header.count).toBe(mockOrders.length);
    });

    it('displays orders in 2 columns in container having width greater than 600', async () => {
        element.orders = mockOrders;
        MockResizeObserver.mock([{ contentRect: { width: 601 } }]);
        await timeout();
        const order = <Order & HTMLElement>element.querySelector('commerce_my_account-order');
        expect(order.columns).toBe(2);
    });

    it('By default, displays orders in 4 columns in container', async () => {
        element.orders = mockOrders;
        MockResizeObserver.mock([]);
        await timeout();
        const order = <Order & HTMLElement>element.querySelector('commerce_my_account-order');
        expect(order.columns).toBe(4);
    });

    it('displays orders in 4 columns in large size container', async () => {
        element.orders = mockOrders;
        MockResizeObserver.mock([{ contentRect: { width: 1026 } }]);
        await timeout();
        const order = <Order & HTMLElement>element.querySelector('commerce_my_account-order');
        expect(order.columns).toBe(4);
    });

    it('displays orders in 3 columns in container having width greater than 768', async () => {
        element.orders = mockOrders;
        MockResizeObserver.mock([{ contentRect: { width: 769 } }]);
        await timeout();
        const order = <Order & HTMLElement>element.querySelector('commerce_my_account-order');
        expect(order.columns).toBe(3);
    });

    it('displays orders in 1 column in small size container', async () => {
        element.orders = mockOrders;
        MockResizeObserver.mock([{ contentRect: { width: 300 } }]);
        await timeout();
        const order = <Order & HTMLElement>element.querySelector('commerce_my_account-order');
        expect(order.columns).toBe(1);
    });

    it('calls the focus of orders refinements if filter state is found to be updated', async () => {
        const focus = jest.fn();
        await Promise.resolve();
        const header = <OrdersRefinements & HTMLElement>element.querySelector('commerce_my_account-orders-refinements');
        header.focus = focus;
        element.filterState = 'updated';
        element.orders = mockOrders;
        expect(focus).toHaveBeenCalledTimes(2);
    });

    [undefined].forEach((noFocusFilterState) => {
        it(`doesn't calls the focus of list header if filterState is ${noFocusFilterState}`, async () => {
            const focus = jest.fn();
            await Promise.resolve();
            const header = <OrdersRefinements & HTMLElement>(
                element.querySelector('commerce_my_account-orders-refinements')
            );
            header.focus = focus;
            element.filterState = noFocusFilterState;
            element.orders = mockOrders;
            expect(focus).not.toHaveBeenCalled();
        });
    });

    it("shift the focus upwards if arrow key 'up' is pressed", async () => {
        element.orders = mockOrders;
        await Promise.resolve();
        const firstOrder = <Order & HTMLElement>element.querySelector("[data-index='0']");
        const mockFocusCell = jest.spyOn(firstOrder, 'focusCell');
        const secondOrder = <Order & HTMLElement>element.querySelector("[data-index='1']");
        secondOrder.dispatchEvent(
            new CustomEvent('shiftfocus', {
                detail: {
                    cell: 'orderInfo',
                    direction: 'up',
                },
            })
        );
        expect(mockFocusCell).toHaveBeenCalledWith('orderInfo');
    });

    it('triggers an event when order link label is clicked', async () => {
        element.orders = mockOrders;
        element.showMoreLabel = 'go to order list';
        element.hasNextPage = true;
        element.showMoreBehaviour = 'GO_TO_LIST_UI';
        element.ordersUrl = ordersURL;
        await Promise.resolve();
        const actionListener = jest.fn();
        element.addEventListener('navigatetoorders', actionListener);
        await Promise.resolve();
        (<HTMLAnchorElement | null>element.querySelector(`a[href='${ordersURL}']`))?.click();
        expect(actionListener).toHaveBeenCalledWith(
            expect.objectContaining({
                bubbles: true,
                cancelable: false,
                composed: true,
            })
        );
    });

    it("shift the focus downwards if arrow key 'down' is pressed", async () => {
        element.orders = mockOrders;
        await Promise.resolve();
        const firstOrder = <Order & HTMLElement>element.querySelector("[data-index='0']");
        const secondOrder = <Order & HTMLElement>element.querySelector("[data-index='1']");
        const mockFocusCell = jest.spyOn(secondOrder, 'focusCell');
        firstOrder.dispatchEvent(
            new CustomEvent('shiftfocus', {
                detail: {
                    cell: 'orderInfo',
                    direction: 'down',
                },
            })
        );
        expect(mockFocusCell).toHaveBeenCalledWith('orderInfo');
    });
});
