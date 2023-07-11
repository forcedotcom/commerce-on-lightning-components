/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api } from 'lwc';
import { generateStyleProperties, generateTextHeadingSizeClass } from 'experience/styling';
import { FieldTypeEnum } from './constants';

/**
 * @typedef {('CURRENCY' | 'DATE' | 'DATETIME' | 'DOUBLE' | 'EMAIL' | 'INTEGER' | 'PERCENT' | 'PHONE' | 'STRING' | 'BOLD_STRING' | 'TEXTAREA' | 'TIME' | 'URL' | 'VARIATION')} FieldType
 */

/**
 * The field UI configuration.
 * @typedef {object} FieldConfiguration
 * @property {boolean} showLabel
 *  Whether to show the field label.
 * @property {string} fontSize
 *  The font size of the field.
 *  Accepted values are: "small", "medium", and "large"
 * @property {string} fontColor
 *  Font color for the field, as 'rgb', 'rgba' or 'hex' CSS value.
 */

/**
 * The field display-dataValue. The relevant details are extracted from
 * {@see BuilderFieldItem} and {@see CardDetail}.
 * @typedef {object} FieldValueDetailData
 * @property {string} name
 *  The name of the field.
 * @property {string} label
 *  The display label of the field.
 * @property {FieldType} type
 *  The type of the field.
 * @property {string} value
 *  The value of the field.
 * @property {boolean} tabStoppable
 *  The tabStoppable will be assigned accordingly to make only one field in the
 *  card lot to be tab-stoppable in keyboard navigation.
 */

export default class SearchProductField extends LightningElement {
    static renderMode = 'light';

    /**
     * Gets or sets the field configuration.
     * @type {?FieldConfiguration}
     */
    @api
    configuration;

    /**
     * Gets or sets the field display-data.
     * @type {?FieldValueDetailData}
     */
    @api
    displayData;

    @api
    focus() {
        this.querySelector('div')?.focus?.();
    }

    /**
     * The field label to be displayed along with the field value.
     * @type {?string}
     * @readonly
     * @private
     */
    get label() {
        return this.displayData?.label;
    }

    /**
     * The field value.
     * @type {string}
     * @readonly
     * @private
     */
    get value() {
        return (this.displayData?.value ?? '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');
    }

    /**
     * The field type.
     * @type {(FieldType | '')}
     * @readonly
     * @private
     */
    get type() {
        return this.displayData?.type ?? '';
    }

    /**
     * The font size of the field, currently: 'small', 'medium', 'large'.
     * @type {string}
     * @readonly
     * @private
     */
    get fontSize() {
        return this.configuration?.fontSize ?? '';
    }

    /**
     * The font color of the field, specified as a valid CSS color representation.
     * @type {string}
     * @readonly
     * @private
     */
    get fontColor() {
        return this.configuration?.fontColor ?? '';
    }

    /**
     * Gets or sets whether the field label should be displayed.
     * @type {boolean}
     * @readonly
     * @private
     */
    get showLabel() {
        return Boolean(this.configuration?.showLabel);
    }

    /**
     * Gets or sets whether the field label should be tab-stoppable.
     * @type {boolean}
     * @readonly
     * @private
     */
    get tabStoppable() {
        return Boolean(this.displayData?.tabStoppable);
    }

    /**
     * Gets whether there is a label available to display.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isLabelAvailable() {
        return this.showLabel && !!this.label;
    }

    /**
     * Gets whether the given value is displayed as a text (which is default).
     * @type {boolean}
     * @readonly
     * @private
     */
    get isDefaultDisplayType() {
        return (
            !this.isBoldStringType &&
            !this.isCurrencyType &&
            !this.isDateTimeType &&
            !this.isNumberType &&
            !this.isEmailType &&
            !this.isPercentType &&
            !this.isPhoneType &&
            !this.isTimeType &&
            !this.isUrlType &&
            !this.isVariationType
        );
    }

    /**
     * Gets whether the given value is displayed as a Bold String.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isBoldStringType() {
        return this.type === FieldTypeEnum.BOLD_STRING;
    }

    /**
     * Gets whether the given value is displayed as a Currency.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isCurrencyType() {
        return this.type === FieldTypeEnum.CURRENCY;
    }

    /**
     * Gets whether the given value is displayed as a DateTime.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isDateTimeType() {
        return this.type === FieldTypeEnum.DATETIME || this.type === FieldTypeEnum.DATE;
    }

    /**
     * Gets whether the given value is displayed as a Number.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isNumberType() {
        return this.type === FieldTypeEnum.DOUBLE || this.type === FieldTypeEnum.INTEGER;
    }

    /**
     * Gets whether the given value is displayed as an Email.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isEmailType() {
        return this.type === FieldTypeEnum.EMAIL;
    }

    /**
     * Gets whether the given value is displayed as a Percent.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isPercentType() {
        return this.type === FieldTypeEnum.PERCENT;
    }

    /**
     * Gets whether the given value is displayed as a Phone number.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isPhoneType() {
        return this.type === FieldTypeEnum.PHONE;
    }

    /**
     * Gets whether the given value is displayed as Time.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isTimeType() {
        return this.type === FieldTypeEnum.TIME;
    }

    /**
     * Gets whether the given value is displayed as a URL.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isUrlType() {
        return this.type === FieldTypeEnum.URL;
    }

    /**
     * Gets whether the given value is displayed as a Product Variation.
     * @type {boolean}
     * @readonly
     * @private
     */
    get isVariationType() {
        return this.type === FieldTypeEnum.VARIATION;
    }

    /**
     * Gets the custom CSS styles for all inner content.
     * @type {string}
     * @readonly
     * @private
     */
    get allContentCustomStyling() {
        return generateStyleProperties({
            color: this.fontColor,
        });
    }

    /**
     * Gets the custom CSS classes to apply to the field.
     * @type {string}
     * @readonly
     * @private
     */
    get allContentCustomClasses() {
        const classes = [generateTextHeadingSizeClass(this.fontSize)];

        if (!this.isVariationType) {
            classes.push('slds-truncate');
        }
        return classes.join(' ');
    }

    /**
     * Gets the tabindex either 0 or -1 depends on this field is tabStoppable.
     *  returns 0 if tabStoppable, else -1.
     * @type {string}
     * @readonly
     * @private
     */
    get getTabindex() {
        return this.tabStoppable ? 0 : -1;
    }
}
