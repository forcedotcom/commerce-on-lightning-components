import { api, wire } from 'lwc';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import DataProvider from 'experience/dataProvider';
import { OrderAdapter } from 'commerce/orderApi';
import type { OrderData as OrderDataApi } from 'commerce/orderApi';
import type { OrderData } from './types';
import { isDataAvailable, updateDataAvailable } from 'commerce_data_provider/utils';

/**
 * Data provider that provides exp api data.
 *
 * @extends DataProvider
 */
export default class OrderDataProvider extends DataProvider {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    public static renderMode = 'light'; // default is 'shadow'

    @api recordId: string | undefined;

    /**
     * The key identifier for the expressions
     */
    @api
    sfdcExpressionKey!: string;

    /**
     * @description OrderSummary data fetched from OrderSummary stores
     */
    orderSummaryData: OrderData = {};

    /**
     * @description Retrieves the Order detail information.
     */
    @wire(OrderAdapter, {
        orderSummaryId: '$recordId',
        fields: ['*'],
        includeAdjustmentDetails: true,
    })
    private wireOrderSummary({ data, loaded }: StoreAdapterCallbackEntry<OrderDataApi>): void {
        updateDataAvailable(this, loaded, 'Details');

        this.orderSummaryData = {
            ...this.orderSummaryData,
            Details: data,
        };
        this.updateComponents();
    }

    /**
     * @description Override for DataProvider getData method
     * @return {OrderData} All data
     */
    @api
    getData(): OrderData | undefined | null {
        return this.orderSummaryData;
    }

    @api
    hasData(): boolean {
        return isDataAvailable(this);
    }
}
