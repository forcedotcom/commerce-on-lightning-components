import { LightningElement, api } from 'lwc';

import type { InputField } from 'commerce_my_account/orderTotalsWithFields';
import { getDefaultGrossTaxFields, getDefaultNetTaxFields } from './orderAmountPreprocessor';
export { getDefaultGrossTaxFields, getDefaultNetTaxFields } from './orderAmountPreprocessor';

export default class OrderAmount extends LightningElement {
    public static renderMode = 'light';

    @api public orderSummaryId: string | undefined;

    /**
     * @description The stringified, unparsed JSON string of the net tax order fields mapping attribute
     */
    @api public netTaxOrdersFieldMapping: string | undefined;

    /**
     * @description The stringified, unparsed JSON string of the gross tax order fields mapping attribute
     */
    @api public grossTaxOrdersFieldMapping: string | undefined;

    /**
     * @description Title of Order Summary Totals card
     */
    @api public totalsCardTitle: string | undefined;

    /**
     * @description Background color of Totals card
     */
    @api public totalsCardBackgroundColor: string | undefined;

    /**
     * @description Border color of Totals card
     */
    @api public totalsCardBorderColor: string | undefined;

    /**
     * @description Text color in Totals card
     */
    @api public totalsCardTextColor: string | undefined;

    /**
     * @description Border Radius of Totals card
     */
    @api public totalsCardBorderRadius: string | undefined;

    /**
     * @description Display a horizontal line above last field
     */
    @api public showHorizontalLineAboveLastField = false;

    /**
     * @description Display the last field as bold
     */
    @api public showLastFieldAsBold = false;

    private get _netTaxFields(): InputField[] {
        return this.netTaxOrdersFieldMapping ? JSON.parse(this.netTaxOrdersFieldMapping) : getDefaultNetTaxFields();
    }

    private get _grossTaxFields(): InputField[] {
        return this.grossTaxOrdersFieldMapping
            ? JSON.parse(this.grossTaxOrdersFieldMapping)
            : getDefaultGrossTaxFields();
    }
}
