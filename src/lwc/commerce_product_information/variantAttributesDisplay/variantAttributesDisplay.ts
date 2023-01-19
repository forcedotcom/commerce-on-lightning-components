import { LightningElement, api } from 'lwc';
import generateText from './textGenerator';
import labels from './labels';
import type { Attribute, InternalAttribute } from './types';
export type { Attribute };
/**
 * A UI control to display a product variant attributes.
 */
export default class VariantAttributesDisplay extends LightningElement {
    static renderMode = 'light';

    /**
     * Gets or sets the variation of the product (i.e. variant properties)
     */
    @api
    attributes: Attribute[] | undefined;

    /**
     * Gets the required i18n labels
     */
    get labels(): Record<string, string> {
        return labels;
    }

    /**
     * Whether has product variant attributes or not.
     */
    get _hasAttributes(): boolean {
        // If the variant attributes are a non-empty array (not undefined or null), we know we have attributes.
        return Array.isArray(this.attributes) && this.attributes.length > 0;
    }

    /**
     * Gets the displayable product variant attribute sets.
     *
     * The 'id' property will include a synthetic, unique index required for template iterations.
     * The 'set' property will include the name & value pair of an attribute.
     *
     */
    get _displayAttributes(): InternalAttribute[] {
        let result: InternalAttribute[] = [];
        if (this.attributes) {
            result = this.attributes.map((attribute, index) => ({
                id: index,
                set: generateText(attribute.name, attribute.value),
            }));
        }
        return result;
    }
}
