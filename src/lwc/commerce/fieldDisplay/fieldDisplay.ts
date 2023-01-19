import { LightningElement, api } from 'lwc';
import TIMEZONE from '@salesforce/i18n/timeZone';
import FieldType from './fieldTypes';
import { yesAssistiveText, noAssistiveText } from './labels';

/**
 * Displays a product field based on its type
 */
export default class FieldDisplay extends LightningElement {
    public static renderMode = 'light';
    /**
     * @description The type of the product field
     */
    @api public type: string | null | undefined;

    /**
     * @description The field value.
     */
    @api public value: unknown | undefined;

    /**
     * @description The ISO 4217 currency code
     */
    @api public currencyCode: string | undefined;

    /**
     * @description Get the time zone of the user.
     */
    private get timezone(): string {
        return TIMEZONE;
    }

    /**
     * @description Gets the accessibility label for a read-only checked checkbox
     */
    private get yesAssistiveText(): string {
        return yesAssistiveText;
    }

    /**
     * @description Gets the accessibility label for a read-only unchecked checkbox
     */
    private get noAssistiveText(): string {
        return noAssistiveText;
    }

    /**
     * @description Gets the the normalized, or upper-cased, version of the product field type
     */
    private get _normalizedType(): string {
        return (this.type || '').toUpperCase();
    }

    /**
     * @description Gets whether the given value is displayed as text (which is default).
     */
    private get isDefaultDisplayType(): boolean {
        const isText = FieldType.get(this._normalizedType) === 'TEXT';

        const isUnknownType = !FieldType.has(this._normalizedType);

        return isText || isUnknownType;
    }

    /**
     * @description Gets whether the given value is displayed as a Currency.
     */
    private get isCurrencyType(): boolean {
        return FieldType.get(this._normalizedType) === 'CURRENCY';
    }

    /**
     * @description Gets whether the given value is displayed as a DateTime.
     */
    get isDateTimeType(): boolean {
        return FieldType.get(this._normalizedType) === 'DATETIME';
    }

    /**
     * @description Gets whether given value is displayed as Date
     */
    get isDateType(): boolean {
        return FieldType.get(this._normalizedType) === 'DATE';
    }

    /**
     * @description Gets whether the given value is displayed as a Number.
     */
    get isNumberType(): boolean {
        return FieldType.get(this._normalizedType) === 'NUMBER';
    }

    /**
     * @description Gets whether the given value is displayed as an Email.
     */
    get isEmailType(): boolean {
        return FieldType.get(this._normalizedType) === 'EMAIL';
    }

    /**
     * @description Gets whether the given value is displayed as a Percent.
     */
    get isPercentType(): boolean {
        return FieldType.get(this._normalizedType) === 'PERCENT';
    }

    /**
     * @description Gets whether the given value is displayed as a Phone number.
     */
    get isPhoneType(): boolean {
        return FieldType.get(this._normalizedType) === 'PHONE';
    }

    /**
     * @description Gets whether the given value is displayed as Time.
     */
    get isTimeType(): boolean {
        return FieldType.get(this._normalizedType) === 'TIME';
    }

    /**
     * @description Gets whether the given value is displayed as a URL.
     */
    get isUrlType(): boolean {
        return FieldType.get(this._normalizedType) === 'URL';
    }

    /**
     * @description Gets whether the given value is displayed as a Address.
     */
    get isAddressType(): boolean {
        return FieldType.get(this._normalizedType) === 'ADDRESS';
    }

    /**
     * @description Gets whether the given value is displayed as a "true" or selected Boolean value.
     * A "checked" checkbox field would meet this criteria.
     */
    get isTrueBooleanType(): boolean {
        return FieldType.get(this._normalizedType) === 'BOOLEAN' && (this.value === 'true' || this.value === true);
    }

    /**
     * @description Gets whether the given value is displayed as a "false" or un-selected Boolean value.
     * An "unchecked" checkbox field would meet this criteria.
     */
    get isFalseBooleanType(): boolean {
        return FieldType.get(this._normalizedType) === 'BOOLEAN' && !(this.value === 'true' || this.value === true);
    }

    /**
     * @description Gets whether the given value is displayed as a Geolocation.
     */
    get isLocationType(): boolean {
        return FieldType.get(this._normalizedType) === 'GEOLOCATION';
    }
}
