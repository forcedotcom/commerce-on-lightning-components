import { api, LightningElement } from 'lwc';
import labels from './labels';

import type { FieldData, IterableField } from './types';

export type { FieldData, IterableField };

export default class OrderTotals extends LightningElement {
    public static renderMode = 'light';
    /**
     * @description Title text of the Totals Card Component
     */
    @api titleText: string | undefined;

    /**
     * @description if true, display a horizontal line above last field.
     */
    @api showHorizontalLineAboveLastField: boolean | null | undefined = false;

    /**
     * @description if true, display the last field as bold.
     */
    @api showLastFieldAsBold: boolean | null | undefined = false;

    /**
     * @description Status variable to track the data loading status
     */
    dataLoaded: boolean | null | undefined = false;

    /**
     * @description List of fields with displayable data.
     */
    fieldsData: FieldData[] | null | undefined;

    /**
     * @description List of fields with displayable data
     */
    @api
    get fields(): FieldData[] | null | undefined {
        return this.fieldsData;
    }

    set fields(value: FieldData[] | null | undefined) {
        this.fieldsData = value;
        if (value) {
            this.dataLoaded = true;
        }
    }

    /**
     * @description Currency code of order summary record to display currency fields.
     */
    @api currencyCode: string | undefined;

    /**
     * @description Get the required labels
     * @return {Object}
     * @private
     */
    get _labels(): Record<string, string> {
        return labels;
    }

    /**
     * @description List of fields with displayable data.
     */
    get displayableFields(): IterableField[] | undefined {
        return this.fieldsData?.map((field, index) => ({
            ...field,
            // @ts-ignore this.fieldsData?.length will never be undefined
            // displayableFields only gets accessed if this.fieldsData exists
            cssClasses: this.generateCssClassesForField(index === this.fieldsData?.length - 1),
        }));
    }

    /**
     * @description returns css classes
     *
     * @param {boolean} isLastField
     *
     * @return {string}
     */
    generateCssClassesForField(isLastField: boolean): string {
        let classes = 'field-item slds-grid slds-m-bottom_xx-small slds-grid_align-spread';

        if (isLastField && this.showHorizontalLineAboveLastField) {
            classes += ' slds-border_top slds-p-top_xx-small';
        }

        if (isLastField && this.showLastFieldAsBold) {
            classes += ' slds-text-title_bold';
        }

        return classes;
    }
}
