import { api, LightningElement } from 'lwc';
import currency from '@salesforce/i18n/currency';
import { generateFieldLabelText } from './fieldLabelGenerator';

import { PROMO_FIELD_MAPPINGS } from './constants';

import type { FieldData } from 'commerce_my_account/orderTotals';
import type { InputField } from './types';
import type { OrderData, OrderAdjustmentAggregatesData } from 'commerce/orderApi';

export type { InputField } from './types';

export default class OrderTotalsWithFields extends LightningElement {
    public static renderMode = 'light';

    /**
     * @description Title text of the Totals Card Component
     */
    @api public titleText: string | undefined;

    /**
     * @description List of Net Tax Order Fields
     */
    @api public netTaxFields: InputField[] | undefined;

    /**
     * @description List of Gross Tax Order Fields
     */
    @api public grossTaxFields: InputField[] | undefined;

    /**
     * @description if true, display a horizontal line above last field.
     */
    @api public showHorizontalLineAboveLastField = false;

    /**
     * @description if true, display the last field as bold.
     */
    @api public showLastFieldAsBold = false;

    /**
     * @description Currency code of order summary record to display currency fields.
     */
    get _currencyCode(): string | undefined {
        if (this.totalsData?.fields) {
            const currencyCodeFieldObj = this.totalsData.fields.CurrencyIsoCode;
            return currencyCodeFieldObj?.text ?? currency;
        }
        return undefined;
    }

    /**
     * @description List of fields with displayable data.
     */
    get _fieldsData(): FieldData[] | undefined {
        if (this.totalsData?.fields) {
            const taxLocaleTypeFieldObj = this.totalsData.fields.TaxLocaleType;
            const taxLocaleType = taxLocaleTypeFieldObj?.text ?? '';
            const fieldsToDisplay = taxLocaleType === 'Gross' ? this.grossTaxFields : this.netTaxFields;

            return (fieldsToDisplay || [])
                .map((field) => ({
                    name: field.name,
                    label: generateFieldLabelText(field.label),
                    value: this.getFieldValue(this.totalsData, field),
                }))
                .filter((fieldData) => fieldData.value);
        }
        return undefined;
    }

    /**
     * @description Order Summary Data to display in Totals comp
     */
    @api public totalsData: OrderData | undefined;

    /**
     * @description Method to fetch the value of the field passed.
     * If the entity is OrderAdjustmentAggregateSummary, then we read data from adjustmentAggregates obj.
     * other-wise we fetch data from fields.
     * @param {TotalsData} totalsData
     * @param {InputField} inputField
     *
     * @return {string} value of the field
     */
    getFieldValue(totalsData: OrderData | undefined, inputField: InputField): string | boolean | null | undefined {
        if (inputField.entity === 'OrderAdjustmentAggregateSummary') {
            const adjAggregateFieldMapping = this.getAdjAggregateFieldMapping(inputField.name);
            const fieldName: string = this.normalizeFieldNameForAdjustmentAggregates(adjAggregateFieldMapping);
            if (totalsData?.adjustmentAggregates) {
                const adjFieldValue =
                    totalsData?.adjustmentAggregates[fieldName as keyof OrderAdjustmentAggregatesData];

                if (parseFloat(adjFieldValue as string) === 0) {
                    return null;
                }
                return adjFieldValue;
            }
        } else {
            const fieldObj = totalsData?.fields[inputField.name];
            if (fieldObj && fieldObj.text) {
                return fieldObj.text;
            }
        }
        return '';
    }

    /**
     * @description Method to convert the string to camelCase
     * @param {string} fieldName
     */
    normalizeFieldNameForAdjustmentAggregates(fieldName: string): string {
        return fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
    }

    /**
     * @description Get the correct field that will be in the response
     * @param {string} fieldName
     */
    getAdjAggregateFieldMapping(fieldName: string): string {
        return PROMO_FIELD_MAPPINGS[fieldName] ?? fieldName;
    }
}
