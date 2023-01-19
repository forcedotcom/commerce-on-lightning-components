import { LightningElement, api } from 'lwc';
import type { OrderData } from 'commerce/orderApi';

import type { InputField, FieldData } from 'commerce_my_account/orderDetails';

import labels from './labels';
import getFieldsData from './fieldsDataGenerator';

/**
 * TO DO: Remove currency reference entirely
 */
import currency from '@salesforce/i18n/currency';

export default class OrderDetailsDisplay extends LightningElement {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light';

    /**
     * @description The stringified, unparsed JSON string of the orderSummary field mapping attribute
     */
    @api public fieldMapping?: InputField[];

    /**
     * @description Title of Order Summary Highlights card
     */
    @api public titleText?: string;

    @api public detailsData?: OrderData;

    get hasTitleText(): boolean {
        return (this.titleText || '').length > 0;
    }

    /**
     * @description Currency code of order summary record to display currency fields.
     */
    get _currencyCode(): string | undefined {
        // TO DO: Remove currency reference
        return this.detailsData?.fields.CurrencyIsoCode?.text ?? currency;
    }

    /**
     * @description List of fields with displayable data.
     */
    get _fieldsData(): FieldData[] | undefined {
        if (this.detailsData) {
            return getFieldsData(this.detailsData, this.fieldMapping);
        }
        return undefined;
    }

    /**
     * @description Get the required labels
     */
    get _labels(): Record<string, string> {
        return labels;
    }
}
