import { LightningElement, api } from 'lwc';
import currencyFormatter from 'commerce/currencyFormatter';

export default class FormattedPrice extends LightningElement {
    public static renderMode = 'light';

    /**
     * @description The ISO 4217 currency code for the price
     */
    @api currencyCode: string | undefined;

    /**
     * @description The value of the price to format
     *
     * If assigned a value of 'undefined', no value will be displayed.
     * A value of 'null' is handled as though it were a value of zero.
     */
    @api value: number | string | null | undefined;

    /**
     * @description Specify how the currency is displayed, defaults to 'symbol'
     *
     * @type {'symbol' | 'code' | 'name'}
     *    - 'symbol' to use a localized currency symbol such as €
     *    - 'code' to use the ISO currency code, e.g. 'USD' or 'EUR'
     *    - 'name' to use a localized currency name such as 'dollar'
     */
    @api displayCurrencyAs: 'symbol' | 'code' | 'name' | undefined;

    /**
     * @description Gets the formatted price based on the currencyCode and value
     * @readonly
     */
    get formattedPrice(): string | undefined {
        if (this.value !== undefined && this.currencyCode) {
            return currencyFormatter(this.currencyCode, this.value, this.displayCurrencyAs || 'symbol');
        }
        return undefined;
    }
}
