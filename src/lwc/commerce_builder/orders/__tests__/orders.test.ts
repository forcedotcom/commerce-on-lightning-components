import { createElement } from 'lwc';
import type { TestWireAdapter } from 'types/testing';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import Orders from 'commerce_builder/orders';
import type { default as myAccountOrder } from 'commerce_my_account/orders';
import type { default as commerceError } from 'commerce/error';
import { OrdersAdapter } from 'commerce/orderApi';
import { mockStoreAdapterResponse } from './data/orders';
import { mockStoreAdapterResponseWithLocation } from './data/ordersWithLocation';
import { mockStoreAdapterResponseWithNextPageToken } from './data/ordersWithNextPageToken';
import { NavigationContext, generateUrl } from 'lightning/navigation';
import { SessionContextAdapter } from 'commerce/contextApi';
import ReorderModal from 'commerce_my_account/reorderModal';
import { navigate } from 'lightning/navigation';

const sessionDataPreviewTrue = {
    data: {
        isPreview: true,
    },
};

const sessionDataPreviewFalse = {
    data: {
        isPreview: false,
    },
};

jest.mock(
    'lightning/navigation',
    () => ({
        generateUrl: jest.fn(() => 'orders_history'),
        NavigationContext: mockCreateTestWireAdapter(),
        navigate: jest.fn(),
        CurrentPageReference: mockCreateTestWireAdapter(),
    }),
    { virtual: true }
);

jest.mock('lightning/uiRecordApi', () => ({
    getRecord: jest.fn(),
}));

jest.mock('commerce/orderApi', () =>
    Object.assign({}, jest.requireActual('commerce/orderApi'), {
        OrdersAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        SessionContextAdapter: mockCreateTestWireAdapter(),
    })
);

const ENTER_VALID_ACCOUNT_ID = 'Enter a valid Account ID and try again.';
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Refresh the page or contact us for assistance.';

jest.mock(
    '@salesforce/label/B2B_Buyer_Orders.needAccountId',
    () => {
        return {
            default: ENTER_VALID_ACCOUNT_ID,
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/B2B_Buyer_Orders.genericErrorMessage',
    () => {
        return {
            default: GENERIC_ERROR_MESSAGE,
        };
    },
    { virtual: true }
);

let reorderMockOpenViewCart: () => void;
jest.mock('commerce_my_account/reorderModal', () => ({
    open: jest.fn(({ onviewcart }) => {
        reorderMockOpenViewCart = onviewcart;
    }),
    onviewcart: jest.fn(),
}));

describe('commerce_builder/orders', () => {
    let element: HTMLElement & Orders;

    const { ResizeObserver } = window;

    beforeAll(() => {
        window.ResizeObserver = jest
            .fn()
            .mockImplementation((cb: (entries: ResizeObserverEntry[], observer: ResizeObserver) => void) => {
                const observer = {
                    observe: jest.fn().mockImplementation(() => {
                        cb([], observer);
                    }),
                    unobserve: jest.fn(),
                    disconnect: jest.fn(),
                };
                return observer;
            });
    });

    afterAll(() => {
        window.ResizeObserver = ResizeObserver;
    });

    beforeEach(() => {
        element = createElement('commerce_builder-orders', {
            is: Orders,
        });
        document.body.appendChild(element);

        (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({
            test: 'test',
        });
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'accountId',
            defaultValue: undefined,
            changeValue: 'account id',
        },
        {
            property: 'noOrderMessageText',
            defaultValue: undefined,
            changeValue: 'no order message text',
        },
        {
            property: 'orderSummaryFieldMapping',
            defaultValue: undefined,
            changeValue:
                '[{"entity":"OrderSummary","name":"OrderNumber","label":"Order Summary Number","type":"Text(255)"}]',
        },
        {
            property: 'ordersListCount',
            defaultValue: undefined,
            changeValue: 10,
        },
        {
            property: 'numberOfMonthsForFilter',
            defaultValue: undefined,
            changeValue: 12,
        },
        {
            property: 'showOrdersListSortBy',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'showOrdersListFilter',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'noResultsText',
            defaultValue: undefined,
            changeValue: 'no results text',
        },
        {
            property: 'viewMoreOrderBehaviour',
            defaultValue: undefined,
            changeValue: 'view more order behaviour',
        },
        {
            property: 'showMoreLabel',
            defaultValue: undefined,
            changeValue: 'show more label',
        },
        {
            property: 'showReorder',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'reorderLabel',
            defaultValue: undefined,
            changeValue: 're order label',
        },
        {
            property: 'showViewDetailsLink',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'viewDetailsLinkLabel',
            defaultValue: undefined,
            changeValue: 'view details label',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof Orders]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof Orders]).not.toBe(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[propertyTest.property as keyof Orders] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof Orders]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('is accessible', async () => {
        element.accountId = 'account id';
        element.noOrderMessageText = 'no order message text';
        element.showOrdersListSortBy = true;
        element.showOrdersListFilter = true;
        element.numberOfMonthsForFilter = undefined;

        await Promise.resolve();
        await expect(element).toBeAccessible();
    });

    const ordersAdapter = <typeof OrdersAdapter & typeof TestWireAdapter>OrdersAdapter;
    const sessionContextAdapter = <typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter;

    describe('wire', () => {
        describe('getOrders', () => {
            it('displays no order if empty response {} received from the ordersAdapter', async () => {
                ordersAdapter.emit({
                    data: {},
                });
                await Promise.resolve();
                const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
                expect(ordersElem.orders).toHaveLength(0);
            });

            it('displays no order if zero orders received from the ordersAdapter', async () => {
                ordersAdapter.emit({
                    data: {
                        count: 0,
                        orderSummaries: [],
                        nextPageToken: null,
                    },
                });
                await Promise.resolve();
                const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
                expect(ordersElem.orders).toHaveLength(0);
            });

            it('display no fields if empty fields response {} received from ordersAdapter', async () => {
                const ordersObj = [
                    {
                        id: '1Osxx0000004CtoCAE',
                        currencyCode: 'INR',
                        fields: [],
                        orderNumber: 'TQETT-R3IQ2-6DHXG-ZZ6PC',
                    },
                ];
                element.orderSummaryFieldMapping =
                    '[{"entity":"OrderSummary","name":"OrderNumber","label":"Order Summary Number","type":"Text(255)"}]';
                ordersAdapter.emit({
                    data: {
                        count: 1,
                        orderSummaries: [
                            {
                                adjustmentAggregates: null,
                                createdDate: '2022-08-29T13:22:32.000Z',
                                currencyIsoCode: 'INR',
                                fields: {},
                                orderNumber: 'TQETT-R3IQ2-6DHXG-ZZ6PC',
                                orderSummaryId: '1Osxx0000004CtoCAE',
                                orderedDate: '2022-08-29T13:22:31.000Z',
                                ownerId: '005xx000001X8efAAC',
                                status: 'Created',
                                totalAmount: '56.99',
                            },
                        ],
                        nextPageToken:
                            'eyJkIjoxNjAxODQ3MTcyMDAwLCJpIjoiMU9zeHgwMDAwMDAwMU44Q0FJIiwicyI6MiwicSI6Ik9yZGVyZWREYXRlRGVzYyJ9',
                    },
                });
                await Promise.resolve();
                const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
                expect(ordersElem.orders).toStrictEqual(ordersObj);
            });

            it('display orders if ordersAdapter return any orders', async () => {
                element.orderSummaryFieldMapping =
                    '[{"entity":"OrderSummary","name":"OrderNumber","label":"Order Summary Number","type":"Text(255)"},{"entity":"OrderSummary","name":"OrderedDate","label":"Order Summary OrderedDate","type":"Date/Time"},{"entity":"OrderSummary","name":"xTotalAmount","label":"Pretax Subtotal","type":"currency"}]';
                ordersAdapter.emit({ data: mockStoreAdapterResponse });
                await Promise.resolve();

                const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
                //@ts-ignore
                expect(ordersElem.orders[0]?.id).toBe(mockStoreAdapterResponse.orderSummaries[0].orderSummaryId);
                //@ts-ignore
                expect(ordersElem.orders[0]?.currencyCode).toBe(
                    mockStoreAdapterResponse.orderSummaries[0].currencyIsoCode
                );
                //@ts-ignore
                expect(ordersElem.orders[0]?.fields).toHaveLength(2);
            });

            it('display assemble address fields if BillingAddress field name was selected by buyer', async () => {
                const valueObj = {
                    city: 'San Francisco',
                    country: 'US',
                    latitude: '40.7128',
                    longitude: '74.0060',
                    postalcode: '94105',
                    state: 'CA',
                    street: '415 Mission Street (Shipping)',
                };
                element.orderSummaryFieldMapping =
                    '[{"entity":"OrderSummary","name":"OrderNumber","label":"Order Summary Number","type":"Text(255)"},{"entity":"OrderSummary","name":"BillingAddress","label":"Order Summary BillingAddress","type":"Text(255)"},{"entity":"OrderSummary","name":"xTotalAmount","label":"Pretax Subtotal","type":"currency"}]';
                ordersAdapter.emit({ data: mockStoreAdapterResponse });
                await Promise.resolve();

                const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
                //@ts-ignore
                expect(ordersElem.orders[0]?.fields[0]?.value).toBe('TQETT-R3IQ2-6DHXG-ZZ6PC');
                //@ts-ignore
                expect(ordersElem.orders[0]?.fields[1]?.value).toStrictEqual(valueObj);
            });

            it('display assemble location fields if location field type is received from ordersAdapter', async () => {
                const ordersObj = [
                    {
                        id: '1Osxx0000004CtoCAE',
                        currencyCode: 'USD',
                        orderNumber: 'TQETT-R3IQ2-6DHXG-ZZ6PC',
                        fields: [
                            { name: 'Order Summary Number', value: 'TQETT-R3IQ2-6DHXG-ZZ6PC', type: 'string' },
                            {
                                name: 'location',
                                value: { latitude: '40.7128', longitude: '74.0060' },
                                type: 'Geolocation',
                            },
                        ],
                    },
                ];
                element.orderSummaryFieldMapping =
                    '[{"entity":"OrderSummary","name":"OrderNumber","label":"Order Summary Number","type":"Text(255)"},{"entity":"OrderSummary","name":"Location","label":"location","type":"Text(255)"}]';
                ordersAdapter.emit({ data: mockStoreAdapterResponseWithLocation });
                await Promise.resolve();
                const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
                expect(ordersElem.orders).toStrictEqual(ordersObj);
            });

            it('display error message if ordersAdapter return error response', async () => {
                sessionContextAdapter.emit(sessionDataPreviewFalse);
                const error: Error = {
                    name: '400',
                    message: 'Something went wrong',
                };
                ordersAdapter.emit({ error: error });
                await Promise.resolve();

                const errorElem = <commerceError & HTMLElement>element.querySelector('commerce-error');
                expect(errorElem?.errorLabel).toStrictEqual(GENERIC_ERROR_MESSAGE);
            });

            it('display error message in preview mode if accountId does not exist and ordersAdapter return error response', async () => {
                const error: Error = {
                    name: '400',
                    message: 'Something went wrong',
                };
                (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({
                    test: 'test',
                });
                sessionContextAdapter.emit(sessionDataPreviewTrue);
                ordersAdapter.emit({ error: error });
                await Promise.resolve();
                const errorElem = <commerceError & HTMLElement>element.querySelector('commerce-error');
                expect(errorElem?.errorLabel).toStrictEqual(ENTER_VALID_ACCOUNT_ID);
            });

            it('display empty address fields if ordersAdapter return null field text', async () => {
                const ordersObj = [
                    {
                        id: '1Osxx0000004CtoCAE',
                        orderNumber: 'TQETT-R3IQ2-6DHXG-ZZ6PC',
                        currencyCode: 'INR',
                        fields: [
                            {
                                name: 'Order Summary BillingAddress',
                                value: {
                                    city: '',
                                    country: '',
                                    state: '',
                                    postalcode: '',
                                    street: '',
                                    latitude: '',
                                    longitude: '',
                                },
                                type: 'Address',
                            },
                        ],
                    },
                ];
                element.orderSummaryFieldMapping =
                    '[{"entity":"OrderSummary","name":"BillingAddress","label":"Order Summary BillingAddress","type":"Text(255)"}]';
                ordersAdapter.emit({
                    data: {
                        count: 1,
                        orderSummaries: [
                            {
                                adjustmentAggregates: null,
                                createdDate: '2022-08-29T13:22:32.000Z',
                                currencyIsoCode: 'INR',
                                fields: {
                                    BillingCity: {
                                        label: 'City',
                                        text: null,
                                        type: 'string',
                                    },
                                    BillingCountry: {
                                        label: 'Country',
                                        text: null,
                                        type: 'string',
                                    },
                                    BillingState: {
                                        label: 'State/Province',
                                        text: null,
                                        type: 'string',
                                    },
                                    BillingPostalCode: {
                                        label: 'Zip',
                                        text: null,
                                        type: 'string',
                                    },
                                    BillingStreet: {
                                        label: 'Address',
                                        text: null,
                                        type: 'textarea',
                                    },
                                    BillingLatitude: {
                                        label: 'Latitude',
                                        text: null,
                                        type: 'double',
                                    },
                                    BillingLongitude: {
                                        label: 'Longitude',
                                        text: null,
                                        type: 'double',
                                    },
                                },
                                orderNumber: 'TQETT-R3IQ2-6DHXG-ZZ6PC',
                                orderSummaryId: '1Osxx0000004CtoCAE',
                                orderedDate: '2022-08-29T13:22:31.000Z',
                                ownerId: '005xx000001X8efAAC',
                                status: 'Created',
                                totalAmount: '56.99',
                            },
                        ],
                    },
                });
                await Promise.resolve();
                const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
                expect(ordersElem.orders).toStrictEqual(ordersObj);
            });

            it('validate that show more handler is called when buyer clicks on show more button', async () => {
                const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
                const showMoreListener = jest.fn();
                ordersElem?.addEventListener('showmoreorders', showMoreListener);
                await Promise.resolve();
                ordersElem?.dispatchEvent(new CustomEvent('showmoreorders'));
                await Promise.resolve();
                expect(showMoreListener).toHaveBeenCalled();
            });

            it('validate the more order is being displayed when buyer clicks on show more button', async () => {
                element.orderSummaryFieldMapping =
                    '[{"entity":"OrderSummary","name":"OrderNumber","label":"Order Summary Number","type":"Text(255)"},{"entity":"OrderSummary","name":"OrderedDate","label":"Order Summary OrderedDate","type":"Date/Time"},{"entity":"OrderSummary","name":"xTotalAmount","label":"Pretax Subtotal","type":"currency"}]';
                ordersAdapter.emit({ data: mockStoreAdapterResponseWithNextPageToken });
                await Promise.resolve();
                const firstOrdersElem = <myAccountOrder & HTMLElement>(
                    element.querySelector('commerce_my_account-orders')
                );
                firstOrdersElem?.dispatchEvent(new CustomEvent('showmoreorders'));
                ordersAdapter.emit({ data: mockStoreAdapterResponse });
                await Promise.resolve();
                const secondOrdersElem = <myAccountOrder & HTMLElement>(
                    element.querySelector('commerce_my_account-orders')
                );
                expect(secondOrdersElem.orders).toHaveLength(2);
            });

            it('validate that date event handler is called when buyer clicks on date filter button', async () => {
                const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
                const dateFilterEventListerner = jest.fn();
                ordersElem?.addEventListener('applydatefilter', dateFilterEventListerner);
                await Promise.resolve();
                ordersElem?.dispatchEvent(
                    new CustomEvent('applydatefilter', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            startDate: '2021-02-01',
                            endDate: '2021-02-03',
                        },
                    })
                );
                await Promise.resolve();
                expect(dateFilterEventListerner).toHaveBeenCalled();
            });

            [
                { startDate: '2021-02-03', endDate: undefined },
                { startDate: undefined, endDate: '2021-02-03' },
            ].forEach((date) => {
                it(`validate that date event handler is called with start date ${date.startDate} and end date ${date.endDate} when buyer clicks on date filter button`, async () => {
                    const ordersElem = <myAccountOrder & HTMLElement>(
                        element.querySelector('commerce_my_account-orders')
                    );
                    ordersElem?.dispatchEvent(
                        new CustomEvent('applydatefilter', {
                            bubbles: true,
                            composed: true,
                            detail: {
                                startDate: date.startDate,
                                endDate: date.endDate,
                            },
                        })
                    );
                    await Promise.resolve();
                    expect(ordersElem?.startDate).toBe(date.startDate);
                    expect(ordersElem?.endDate).toBe(date.endDate);
                });
            });

            it('validate that reset event handler is called when buyer clicks on reset button', async () => {
                const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
                const resetEventListerner = jest.fn();
                ordersElem?.addEventListener('resetdatefilter', resetEventListerner);
                await Promise.resolve();
                ordersElem?.dispatchEvent(new CustomEvent('resetdatefilter'));
                await Promise.resolve();
                expect(resetEventListerner).toHaveBeenCalled();
            });

            it(`update 'filterState' property when buyer clicks on reset filter button`, async () => {
                element.numberOfMonthsForFilter = 2;
                const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
                ordersElem?.dispatchEvent(new CustomEvent('resetdatefilter'));
                ordersAdapter.emit({ data: mockStoreAdapterResponse });
                await Promise.resolve();
                expect(ordersElem?.filterState).toBe(`updated`);
            });

            it(`update 'filterState', 'startDate' and 'endDate' property when 'resetdatefilter' event is received`, async () => {
                element.numberOfMonthsForFilter = 2;
                const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
                ordersElem?.dispatchEvent(new CustomEvent('resetdatefilter'));
                await Promise.resolve();
                expect(ordersElem?.filterState).toBe(`updating`);
                expect(ordersElem?.startDate).toBeDefined();
                expect(ordersElem?.endDate).toBeDefined();
            });

            ['sortByNewToOld', 'sortByOldToNew'].forEach((sortOrder) => {
                it(`validate that sort event handler is called with ${sortOrder} sorting option when buyer clicks on sort button`, async () => {
                    const ordersElem = <myAccountOrder & HTMLElement>(
                        element.querySelector('commerce_my_account-orders')
                    );
                    const sortEventListerner = jest.fn();
                    ordersElem?.addEventListener('sortorders', sortEventListerner);
                    await Promise.resolve();
                    ordersElem?.dispatchEvent(
                        new CustomEvent('sortorders', {
                            bubbles: true,
                            composed: true,
                            detail: {
                                sortingOption: sortOrder,
                            },
                        })
                    );
                    await Promise.resolve();
                    expect(sortEventListerner).toHaveBeenCalledWith(
                        expect.objectContaining({
                            bubbles: true,
                            composed: true,
                            detail: {
                                sortingOption: sortOrder,
                            },
                        })
                    );
                });
            });

            ['sortByOldToNew', 'sortByOldToNew'].forEach((sortOrder) => {
                it(`update 'filterState' and  'isSorting' property when buyer clicks on sort button with ${sortOrder} order`, async () => {
                    const ordersElem = <myAccountOrder & HTMLElement>(
                        element.querySelector('commerce_my_account-orders')
                    );
                    ordersElem?.dispatchEvent(
                        new CustomEvent('sortorders', {
                            bubbles: true,
                            composed: true,
                            detail: {
                                sortingOption: sortOrder,
                            },
                        })
                    );
                    ordersAdapter.emit({ data: mockStoreAdapterResponse });
                    await Promise.resolve();
                    expect(ordersElem?.isSorting).toBeFalsy();
                    expect(ordersElem?.filterState).toBeUndefined();
                });
            });

            ['sortByOldToNew', 'sortByOldToNew'].forEach((sortOrder) => {
                it(`update 'filterState' and  'isSorting' property when 'sortorders' event is received`, async () => {
                    const ordersElem = <myAccountOrder & HTMLElement>(
                        element.querySelector('commerce_my_account-orders')
                    );
                    ordersElem?.dispatchEvent(
                        new CustomEvent('sortorders', {
                            bubbles: true,
                            composed: true,
                            detail: {
                                sortingOption: sortOrder,
                            },
                        })
                    );
                    await Promise.resolve();
                    expect(ordersElem?.isSorting).toBeTruthy();
                    expect(ordersElem?.filterState).toBeUndefined();
                });
            });

            it(`update 'noOrderMessageText' property when ordersAdapter returns zero orders`, async () => {
                const noResultsText = `No Orders exist in give date range. Please reset the filters`;
                element.noResultsText = noResultsText;
                const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
                ordersElem?.dispatchEvent(
                    new CustomEvent('applydatefilter', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            startDate: '2021-02-01',
                            endDate: '2021-02-03',
                        },
                    })
                );
                await Promise.resolve();
                ordersElem?.dispatchEvent(
                    new CustomEvent('applydatefilter', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            startDate: '2021-02-01',
                            endDate: '2021-02-04',
                        },
                    })
                );
                ordersAdapter.emit({
                    data: {
                        count: 0,
                        orderSummaries: [],
                        nextPageToken: null,
                    },
                });
                await Promise.resolve();
                expect(ordersElem?.noOrderMessageText).toBe(noResultsText);
            });
        });
    });

    it(`opens ReorderModal if it receives reorder event`, async () => {
        const orderId = '1OsOG00000002ao0AA';
        const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
        ordersElem?.dispatchEvent(
            new CustomEvent('reorder', {
                bubbles: true,
                composed: true,
                detail: {
                    orderId: orderId,
                },
            })
        );
        await Promise.resolve();
        expect(ReorderModal.open).toHaveBeenCalledWith(
            expect.objectContaining({
                size: 'small',
                orderSummaryId: orderId,
            })
        );
    });

    it('should generate cart url', () => {
        expect(generateUrl).toHaveBeenCalledWith(
            {
                test: 'test',
            },
            {
                type: 'comm__namedPage',
                attributes: {
                    name: 'Current_Cart',
                },
            }
        );
    });

    it('navigates to the cart page if the buyer triggers the `viewcart` event from the reorder modal', () => {
        const orderId = '1OsOG00000002ao0AA';
        const ordersElem = <myAccountOrder & HTMLElement>element.querySelector('commerce_my_account-orders');
        ordersElem?.dispatchEvent(
            new CustomEvent('reorder', {
                bubbles: true,
                composed: true,
                detail: {
                    orderId: orderId,
                },
            })
        );

        expect(ReorderModal.open).toHaveBeenCalledWith({
            onviewcart: reorderMockOpenViewCart,
            orderSummaryId: '1OsOG00000002ao0AA',
            size: 'small',
        });
        reorderMockOpenViewCart();
        expect(navigate).toHaveBeenCalled();
    });
});
