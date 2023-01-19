import { LightningElement, api } from 'lwc';
import labels from './labels';
import { transformFields } from './transformField';
import type { Field, TransformedField, Adjustment } from './types';
export type { Field, Adjustment } from './types';
/**
 * display fields of an order item in a column
 */
export default class ItemFields extends LightningElement {
    static renderMode = 'light';
    /**
     * Fields of an order item
     */
    @api fields: Field[] | undefined;

    /**
     * The ISO 4217 currency code
     */
    @api currencyCode: string | undefined;

    /**
     * Gets or sets the pricing adjustments (if any) for the item.
     *
     * @example
     *  [{
     *          discountAmount: '-85',
     *          name: '510$ off on exercise equipments',
     *          currencyIsoCode: 'USD'
     *  }]
     */
    @api adjustments: Adjustment[] | undefined;

    /**
     * Whether to show the order item fields
     */
    get _showFields(): boolean {
        return (this.fields || []).length > 0;
    }

    /**
     * Get the ordered sequence of Field for display.
     */
    get _transformedFields(): TransformedField[] {
        return transformFields(this.fields, this.adjustments);
    }

    /**
     * Gets the required i18n labels
     */
    get _labels(): Record<string, string> {
        return labels;
    }
}
