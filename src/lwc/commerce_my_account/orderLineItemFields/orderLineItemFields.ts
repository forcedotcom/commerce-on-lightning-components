import { LightningElement, api } from 'lwc';
import getFieldNameFromEntity from './fieldNameGenerator';
import { keyValueSeparatorWithSpace } from './labels';
import getLayoutClass from './layoutClassGenerator';
import type { EntityField } from './types';
import type { OrderField } from 'commerce_my_account/orders';

const DEFAULT_COLUMN = 1;

interface UpdatedOrderField extends OrderField {
    id: number;
    isReference: boolean;
    showFieldName: boolean;
    fieldName?: EntityField;
}

/**
 * @description Display the fields of a Order Line Item i.e. record
 */
export default class OrderLineItemFields extends LightningElement {
    static renderMode = 'light';

    /**
     * @description An array of fields of a order
     */
    @api fields?: OrderField[];

    /**
     * @description The ISO 4217 currency code for the currency fields
     */
    @api currencyCode?: string;

    /**
     * @description Number of columns in which the order's fields will be rendered.
     */
    @api columns: number | undefined;

    /**
     * @description Return Normalised column value
     */
    get _normalisedColumn(): number {
        return this.columns !== undefined ? this.columns : DEFAULT_COLUMN;
    }

    /**
     * @description Gets the required i18n labels
     */
    get _keyValueSeparatorWithSpace(): string {
        return keyValueSeparatorWithSpace;
    }

    /**
     * @description Get the ordered sequence of Fields for display.
     */
    get _updatedFields(): UpdatedOrderField[] {
        return (this.fields || []).map((field, index) => {
            return {
                ...field,
                id: index,
                isReference: field.type === 'reference' || field.type === 'id',
                showFieldName: (field.name || '').length > 0,
                ...((field.type === 'reference' || field.type === 'id') && {
                    fieldName: getFieldNameFromEntity(field.value as string),
                }),
                showLink: field.type === 'id' && ((field.value as string) || '').startsWith('1Os'),
                classNames: field.type === 'id' && ((field.value as string) || '').startsWith('1Os') ? 'bold-name' : '',
            };
        });
    }

    /**
     * @description Gets the CSS classes for the field item
     */
    get _fieldItemclasses(): string {
        return `slds-p-right_small slds-grid slds-wrap slds-m-vertical_xx-small ${getLayoutClass(
            this._normalisedColumn,
            this._updatedFields.length
        )}`;
    }
}
