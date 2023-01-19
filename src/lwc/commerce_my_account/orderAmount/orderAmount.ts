import { LightningElement, api, wire } from 'lwc';
import genericErrorMessage from '@salesforce/label/B2B_Buyer_Orders.genericErrorMessage';
import { OrderAdapter } from 'commerce/orderApi';
import { effectiveAccount } from 'commerce/effectiveAccountApi';

import { DEFAULT_FIELDS } from './constants';

import type { InputField } from 'commerce_my_account/orderTotalsWithFields';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type { OrderData } from 'commerce/orderApi';

export default class OrderAmount extends LightningElement {
    public static renderMode = 'light';

    @api public orderSummaryId: string | undefined;

    /**
     * @description The stringified, unparsed JSON string of the net tax order fields mapping attribute
     */
    @api public netTaxOrdersFieldMapping: InputField[] | undefined;

    /**
     * @description The stringified, unparsed JSON string of the gross tax order fields mapping attribute
     */
    @api public grossTaxOrdersFieldMapping: InputField[] | undefined;

    /**
     * @description Title of Order Summary Totals card
     */
    @api public totalsCardTitle: string | undefined;

    /**
     * @description Background color of Totals card
     */
    @api public totalsCardBackgroundColor: string | undefined;

    /**
     * @description Border color of Totals card
     */
    @api public totalsCardBorderColor: string | undefined;

    /**
     * @description Text color in Totals card
     */
    @api public totalsCardTextColor: string | undefined;

    /**
     * @description Border Radius of Totals card
     */
    @api public totalsCardBorderRadius: string | undefined;
    get _totalsCardBorderRadius(): string {
        return this.totalsCardBorderRadius ? this.totalsCardBorderRadius + 'px' : '';
    }

    /**
     * @description Display a horizontal line above last field
     */
    @api public showHorizontalLineAboveLastField = false;

    /**
     * @description Display the last field as bold
     */
    @api public showLastFieldAsBold = false;

    private get _fields(): string[] {
        const netTaxFieldNames = this.netTaxOrdersFieldMapping?.map((field) => field.name) ?? [];
        const grossTaxFieldNames = this.grossTaxOrdersFieldMapping?.map((field) => field.name) ?? [];

        const allFields = [...netTaxFieldNames, ...grossTaxFieldNames, ...DEFAULT_FIELDS];
        return [...new Set(allFields)];
    }

    get totalsCustomCssStyles(): string {
        return `
            --com-c-my-account-order-summary-amount-background-color: ${this.totalsCardBackgroundColor || 'initial'};
            --com-c-my-account-order-summary-amount-text-color: ${this.totalsCardTextColor || 'initial'};
            --com-c-my-account-order-summary-amount-border-color: ${this.totalsCardBorderColor || 'initial'};
            --com-c-my-account-order-summary-amount-border-radius: ${this._totalsCardBorderRadius || 'initial'};
        `;
    }

    @wire(OrderAdapter, {
        orderSummaryId: '$orderSummaryId',
        fields: '$_fields',
        effectiveAccountId: effectiveAccount.accountId,
        includeAdjustmentDetails: true,
    })
    orderSummaryDetails: StoreAdapterCallbackEntry<OrderData> | undefined;

    get totalsData(): OrderData | undefined {
        return this.orderSummaryDetails?.data;
    }

    get _hasError(): boolean {
        return !!this.orderSummaryDetails?.error;
    }

    get _errorMessage(): string {
        return genericErrorMessage;
    }
}
