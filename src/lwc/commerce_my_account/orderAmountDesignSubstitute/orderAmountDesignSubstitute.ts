import { LightningElement, api } from 'lwc';

import { SAMPLE_DATA } from './data';

import type { InputField } from 'commerce_my_account/orderTotalsWithFields';
import type { OrderData } from 'commerce/orderApi';
import { getDefaultGrossTaxFields, getDefaultNetTaxFields } from 'commerce_builder/orderAmount';

export default class OrderAmountDesignSubstitute extends LightningElement {
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
    get _totalsCardBorderRadius(): string {
        return this.totalsCardBorderRadius ? this.totalsCardBorderRadius + 'px' : '';
    }

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

    get totalsCustomCssStyles(): string {
        return `
            --com-c-my-account-order-summary-amount-background-color: ${this.totalsCardBackgroundColor || 'initial'};
            --com-c-my-account-order-summary-amount-text-color: ${this.totalsCardTextColor || 'initial'};
            --com-c-my-account-order-summary-amount-border-color: ${this.totalsCardBorderColor || 'initial'};
            --com-c-my-account-order-summary-amount-border-radius: ${this._totalsCardBorderRadius || 'initial'};
        `;
    }

    get totalsData(): OrderData | undefined {
        return SAMPLE_DATA;
    }
}
