import { LightningElement, api } from 'lwc';
import { Labels } from './labels';

/**
 * A display of common, heading-style product information including:
 *  - A product name / title
 *  - Prominent product field values
 */
export default class Heading extends LightningElement {
    public static renderMode = 'light';
    /**
     * Gets or sets the ISO 4217 currency code any currencies displayed.
     *
     * @type {string | undefined}
     */
    @api
    currencyCode: string | undefined;
    /**
     * Gets or sets the (optional) ordered sequence of product fields / information to display.
     *
     * @type {Field[] | undefined | null}
     */
    @api
    fields: Field[] | undefined | null;
    /**
     * Gets the iterable fields.
     *
     * @returns {IterableField[] | undefined}
     *  The ordered sequence of fields for display.
     *
     * @private
     */
    get _displayableFields(): IterableField[] | undefined {
        // Enhance the fields with a synthetic ID for iteration.
        return (this.fields || []).map((field, index) => ({
            ...field,
            id: index,
        }));
    }
    /**
     * Gets label for separator
     */
    get keyValueSeparator(): string {
        return Labels.keyValueSeparator;
    }
}

/**
 * A Field attribute
 *
 * @typedef {Object} Field
 *
 * @property {string} name
 *  A name for each item
 *
 * @property {string | undefined} value
 *  A value for the item
 */
type Field = {
    name: string;
    value: string | undefined;
};

/**
 * A IterableField attribute
 *
 * @typedef {Object} IterableField
 *
 * @property {string} name
 *  A name for each item
 *
 * @property {string | undefined} value
 *  A value for the item
 *
 * @property {number} id
 *  A unique id for each item
 */
type IterableField = {
    name: string;
    value: string | undefined;
    id: number;
};
