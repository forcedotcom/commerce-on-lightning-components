import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { getValueOfNameFieldForEntity } from './entityFieldValueGenerator';
import type { Field, Record } from './types';
export type { Field };

/**
 * display the value of field for Record, If field isn't present, display the recordId
 */
export default class RecordFieldValue extends LightningElement {
    static renderMode = 'light';

    /**
     * @description Gets or sets the name of the field on the record to display.
     */
    @api field?: Field;

    /**
     * @description Unique identifier of a record
     */
    @api recordId?: string;

    /**
     *  Wheather or not display the value as a link.
     */
    @api isLink = false;

    @wire(getRecord, {
        recordId: '$recordId',
        fields: '$fieldsArray',
    })
    _record?: Record;

    /**
     * @description A list of fields
     */
    get fieldsArray(): Field[] {
        if (this.field) {
            return [this.field];
        }
        return [];
    }

    /**
     * @description Gets the Value of the Name field
     */
    get valueOfNameField(): string | undefined {
        return getValueOfNameFieldForEntity(this.field, this.recordId, this._record);
    }

    get _objectApiName(): string | undefined {
        return this.field?.objectApiName;
    }
}
