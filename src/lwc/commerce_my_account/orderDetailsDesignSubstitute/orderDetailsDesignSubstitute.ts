import { LightningElement, api } from 'lwc';
import { OrderDetailsFieldData } from './data';
import type { OrderData } from 'commerce/orderApiInternal';
import type { InputField } from '../orderDetails/types';
import { getDefaultFields } from 'commerce_builder/orderDetails';

export default class OrderDetailsDesignSubstitute extends LightningElement {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light';
    /**
     * @description The {!orderSummaryId} for this page.
     */
    @api orderSummaryId?: string;
    /**
     * @description The stringified, unparsed JSON string of the orderSummary field mapping attribute
     */
    @api public orderSummaryHighlightsFieldMapping?: string;

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
    get _highlightsCardBorderRadius(): string {
        return this.highlightsCardBorderRadius ? this.highlightsCardBorderRadius + 'px' : '';
    }

    private get _fieldMapping(): InputField[] {
        return this.orderSummaryHighlightsFieldMapping
            ? JSON.parse(this.orderSummaryHighlightsFieldMapping)
            : getDefaultFields();
    }

    get _customStyles(): string {
        return `
            --com-c-my-account-order-details-background-color: ${this.highlightsCardBackgroundColor || 'initial'};
            --com-c-my-account-order-details-font-color: ${this.highlightsCardTextColor || 'initial'};
            --com-c-my-account-order-details-border-color: ${this.highlightsCardBorderColor || 'initial'};
            --com-c-my-account-order-details-border-radius: ${this._highlightsCardBorderRadius || 'initial'};
        `;
    }

    get detailsData(): OrderData | undefined {
        return OrderDetailsFieldData;
    }
}
