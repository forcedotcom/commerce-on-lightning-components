import { api } from 'lwc';
import { LightningElement } from 'lwc';

/**
 * This component renders a table component which contains product fields data
 */
export default class FieldsTable extends LightningElement {
    static renderMode = 'light';

    /**
     * The product fields data
     */
    @api
    fields?: Field[];

    /**
     * The currency code
     */
    @api
    currencyCode?: string;

    private get normalizedField(): Field[] {
        return this.fields === undefined ? [] : this.fields;
    }
}

export interface Field {
    name: string;
    label: string;
    value: string | unknown;
    type: string | unknown;
}
