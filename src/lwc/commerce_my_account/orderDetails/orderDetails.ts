import { LightningElement, api, wire } from 'lwc';
import genericErrorMessage from '@salesforce/label/B2B_Buyer_Orders.genericErrorMessage';
import { OrderAdapter } from 'commerce/orderApi';
import type { OrderData } from 'commerce/orderApi';
import { effectiveAccount } from 'commerce/effectiveAccountApi';

import type { InputField } from './types';

export type { InputField, FieldData, AddressField, GeolocationField } from './types';
import type { StoreAdapterCallbackEntry } from 'experience/store';

export default class OrderDetails extends LightningElement {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light';
    /**
     * @description The unique identifier for order summary record
     */
    @api orderSummaryId?: string;
    /**
     * @description The stringified, unparsed JSON string of the orderSummary field mapping attribute
     */
    @api public orderSummaryHighlightsFieldMapping?: InputField[];

    /**
     * @description Title of Order Summary Highlights card
     */
    @api public highlightsTitle?: string;

    /**
     * @description Background color of Highlights card
     */
    @api public highlightsCardBackgroundColor?: string;

    /**
     * @description Border color of Highlights card
     */
    @api public highlightsCardBorderColor?: string;

    /**
     * @description Text color in Highlights card
     */
    @api public highlightsCardTextColor?: string;

    /**
     * @description Border Radius Highlights card
     */
    @api public highlightsCardBorderRadius?: string;

    private get _highlightsCardBorderRadius(): string {
        return this.highlightsCardBorderRadius ? this.highlightsCardBorderRadius + 'px' : '';
    }

    private get _fields(): string[] {
        return this.orderSummaryHighlightsFieldMapping?.map((field) => field.name) ?? [];
    }

    get _customStyles(): string {
        return `
            --com-c-my-account-order-details-background-color: ${this.highlightsCardBackgroundColor || 'initial'};
            --com-c-my-account-order-details-font-color: ${this.highlightsCardTextColor || 'initial'};
            --com-c-my-account-order-details-border-color: ${this.highlightsCardBorderColor || 'initial'};
            --com-c-my-account-order-details-border-radius: ${this._highlightsCardBorderRadius || 'initial'};
        `;
    }

    @wire(OrderAdapter, {
        orderSummaryId: '$orderSummaryId',
        fields: '$_fields',
        effectiveAccountId: effectiveAccount.accountId,
    })
    orderSummaryDetails: StoreAdapterCallbackEntry<OrderData> | undefined;

    get detailsData(): OrderData | undefined {
        return this.orderSummaryDetails?.data;
    }

    get _hasError(): boolean {
        return !!this.orderSummaryDetails?.error;
    }

    get _errorMessage(): string {
        return genericErrorMessage;
    }
}
