import { LightningElement, api } from 'lwc';
import { ProductFieldTypeEnum } from './constants';
import { content } from './fieldStyleStringGenerators';
import type { FieldValueDetailData, FieldConfiguration } from 'commerce/searchApiInternal';

/**
 * Generates an SLDS CSS class representing heading text of a given size.
 */
export function generateClassForSize(size: string | undefined): string | undefined {
    let cssClass;

    switch (size) {
        case 'small':
            cssClass = 'slds-text-heading_small';
            break;
        case 'medium':
            cssClass = 'slds-text-heading_medium';
            break;
        case 'large':
            cssClass = 'slds-text-heading_large';
            break;
        default:
            // Undefined is our default for unrecognized values.
            cssClass = undefined;
            break;
    }

    return cssClass;
}

/**
 * Representation of the product field which is displayed in product information views
 */
export default class ProductField extends LightningElement {
    public static renderMode = 'light';
    /**
     * Supported field styling customizations.
     *
     * @typedef {Object} CustomStyles
     *
     * @property {string} ['align-self']
     * @property {string} ['justify-self']
     *  The alignment of the field, currently: 'left', 'center', 'right'.
     *
     * @property {string} ['font-size']
     *  The font size of the field, currently: 'small', 'medium', 'large'.
     *
     * @property {string} ['color']
     *  The color of the field, specified as a valid CSS color representation.
     */

    /**
     * The field UI configuration.
     *
     * @typedef {Object} FieldConfiguration
     *
     * @property {Boolean} showLabel
     *  Whether or not to show the field label.
     *
     * @property {String} fontSize
     *  The font size of the field.
     *  Accepted values are: "small", "medium", and "large"
     *
     * @property {String} fontColor
     *  Font color for the field, as 'rgb', 'rgba' or 'hex' CSS value.
     */

    /**
     * The field display-dataValue. The relevant details are extracted from
     * {@see BuilderFieldItem} and {@see CardDetail}.
     *
     * @typedef {Object} FieldValueDetail
     *
     * @property {string} name
     *  The name of the field.
     *
     * @property {string} label
     *  The display label of the field.
     *
     * @property {string} type
     *  The type of the field.
     *
     * @property {string} value
     *  The value of the field.
     *
     * @property {Boolean} tabStoppable
     *  The tabStoppable will be assigned accordingly to make only one field in the
     *  card lot to be tab stoppable in keyboard navigation.
     */

    /**
     * Gets or sets the field configuration.
     *
     * @type {FieldConfiguration}
     */
    @api
    configuration?: FieldConfiguration;

    /**
     * Gets or sets the field display-data.
     *
     * @type {FieldValueDetail}
     */
    @api
    displayData?: FieldValueDetailData;

    /**
     * Gets or sets the optional custom styles applied to the field.
     *
     * @type {CustomStyles}
     */
    @api
    customStyles?: Record<string, string>;

    /**
     * Grabs the focus on the current field.
     */
    @api
    focus(): void {
        const element = <HTMLElement>this.querySelector('div');
        element?.focus();
    }

    /**
     * Gets the normalized field display-data.
     *
     * @type {FieldValueDetail}
     */
    get normalizedDisplayData(): FieldValueDetailData | undefined {
        return this.displayData;
    }

    /**
     * Gets the normalized field configuration.
     *
     * @type {FieldConfiguration}
     */
    get normalizedConfiguration(): FieldConfiguration | undefined {
        return this.configuration;
    }

    /**
     * The field label to be displayed along with the field value.
     *
     * @type {string}
     */
    get label(): string | undefined {
        return this.normalizedDisplayData?.label;
    }

    /**
     * The field value.
     *
     * @type {string}
     */
    get value(): string {
        // Ensure that HTML is properly rendered by decoding its tag brackets and "&quot;" entity
        return (this.normalizedDisplayData?.value ?? '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');
    }

    /**
     * The field type. Supported values are defined in ProductFieldTypeEnum.
     *
     * @type {ProductFieldTypeEnum}
     */
    get type(): string {
        return this.normalizedDisplayData?.type ?? '';
    }

    /**
     * The font size of the field, currently: 'small', 'medium', 'large'.
     *
     * @type {string}
     */
    get fontSize(): string {
        return this.normalizedConfiguration?.fontSize ?? '';
    }

    /**
     * The font color of the field, specified as a valid CSS color representation.
     *
     * @type {string}
     */
    get fontColor(): string {
        return this.normalizedConfiguration?.fontColor ?? '';
    }

    /**
     * Gets or sets whether or not field label should be displayed.
     *
     * @type {Boolean}
     */
    get showLabel(): boolean | undefined {
        return this.normalizedConfiguration?.showLabel;
    }

    /**
     * Gets or sets whether or not field label should be tab stoppable.
     *
     * @type {Boolean}
     */
    get tabStoppable(): boolean | undefined {
        return this.normalizedDisplayData?.tabStoppable;
    }

    /**
     * Gets whether there is a label available to display.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    private get isLabelAvailable(): boolean | undefined {
        return this.showLabel && !!this.label;
    }

    /**
     * Gets whether the given value is displayed as a text (which is default).
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    private get isDefaultDisplayType(): boolean {
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
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    private get isBoldStringType(): boolean {
        return this.type === ProductFieldTypeEnum.BOLD_STRING;
    }

    /**
     * Gets whether the given value is displayed as a Currency.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    private get isCurrencyType(): boolean {
        return this.type === ProductFieldTypeEnum.CURRENCY;
    }

    /**
     * Gets whether the given value is displayed as a DateTime.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    private get isDateTimeType(): boolean {
        return this.type === ProductFieldTypeEnum.DATETIME || this.type === ProductFieldTypeEnum.DATE;
    }

    /**
     * Gets whether the given value is displayed as a Number.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    private get isNumberType(): boolean {
        return this.type === ProductFieldTypeEnum.DOUBLE || this.type === ProductFieldTypeEnum.INTEGER;
    }

    /**
     * Gets whether the given value is displayed as an Email.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    private get isEmailType(): boolean {
        return this.type === ProductFieldTypeEnum.EMAIL;
    }

    /**
     * Gets whether the given value is displayed as a Percent.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    private get isPercentType(): boolean {
        return this.type === ProductFieldTypeEnum.PERCENT;
    }

    /**
     * Gets whether the given value is displayed as a Phone number.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    private get isPhoneType(): boolean {
        return this.type === ProductFieldTypeEnum.PHONE;
    }

    /**
     * Gets whether the given value is displayed as Time.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    private get isTimeType(): boolean {
        return this.type === ProductFieldTypeEnum.TIME;
    }

    /**
     * Gets whether the given value is displayed as a URL.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    private get isUrlType(): boolean {
        return this.type === ProductFieldTypeEnum.URL;
    }

    /**
     * Gets whether the given value is displayed as a Product Variation.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    private get isVariationType(): boolean {
        return this.type === ProductFieldTypeEnum.VARIATION;
    }

    /**
     * Gets the custom CSS styles for all of the inner content
     *
     * @type {string}
     * @readonly
     * @private
     */
    private get allContentCustomStyling(): string {
        const styles = Object.assign({}, this.customStyles);
        styles.color = this.fontColor;
        return content.createForStyles(styles);
    }

    /**
     * Gets the custom CSS classes to apply to the field.
     *
     * @type {string}
     * @readonly
     * @private
     */
    private get allContentCustomClasses(): string {
        const classes = [generateClassForSize(this.fontSize)];

        // No truncation for variation attributes for better disambiguation.
        if (!this.isVariationType) {
            classes.push('slds-truncate');
        }

        return classes.join(' ');
    }

    /**
     * Gets the tabindex either 0 or -1 depends on this field is tabStoppable.
     *  returns 0 if tabStoppable, else -1.
     *
     * @type {string}
     * @readonly
     * @private
     */
    private get getTabindex(): number {
        return this.tabStoppable ? 0 : -1;
    }
}
