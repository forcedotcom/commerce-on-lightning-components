import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import OrderDataProvider from 'commerce_data_provider/orderDataProvider';
import { OrderAdapter } from 'commerce/orderApi';
import { data as orderSummaryData, orderDataProviderData } from './data/orderSummaryResponse';
import type { TestWireAdapter } from 'types/testing';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('commerce/orderApi', () =>
    Object.assign({}, jest.requireActual('commerce/orderApi'), {
        OrderAdapter: mockCreateTestWireAdapter(),
    })
);

const OrderTestAdapter = <typeof OrderAdapter & typeof TestWireAdapter>OrderAdapter;

describe('commerce_data_provider/orderDataProvider', () => {
    let element: OrderDataProvider & HTMLElement;

    beforeEach(() => {
        element = createElement('commerce_data_provider-order-data-provider', {
            is: OrderDataProvider,
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
        it('fetches all loaded OrderSummary Data', async () => {
            const orderSummaryId = '1Osxx0000006nQLAAY';
            element.recordId = orderSummaryId;

            OrderTestAdapter.emit({
                data: orderSummaryData,
            });

            await Promise.resolve();
            expect(element.getData()).toEqual(orderDataProviderData);
        });

        it('Fetch order number', async () => {
            OrderTestAdapter.emit({
                data: orderSummaryData,
            });

            await Promise.resolve();
            expect(element.getData()?.Details?.orderNumber).toBe('QNCPW-I42UW-TX3TL-EWU23');
        });

        it('Fetch TotalAdjProductAmtWithTax field', async () => {
            OrderTestAdapter.emit({
                data: orderSummaryData,
            });

            await Promise.resolve();
            const totalAdjProductAmtWithTax = element.getData()?.Details?.fields.TotalAdjProductAmtWithTax.text;
            expect(totalAdjProductAmtWithTax).toBe('204.12');
        });

        it('returns undefined when no orderSummary data is present for the field requested', () => {
            expect(element.getData()?.Details).toBeUndefined();
        });

        it('null data from orderSummary when data from adapters is empty', async () => {
            OrderTestAdapter.emit({ data: null });

            await Promise.resolve();
            expect(element.getData()?.Details).toBeNull();
        });
    });

    describe('loading state', () => {
        it.each([
            {
                label: `should return true if all wire adapters are loaded`,
                adapters: [[OrderTestAdapter, true]],
            },
            {
                label: `should return false if not all wire adapters are loaded`,
                adapters: [[OrderTestAdapter, false]],
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
});
