import type { PromotionInformationDetail } from 'commerce_unified_promotions/cartAppliedPromotions';
import { LightningElement, api } from 'lwc';

/**
 * A display of key (i.e. summary) promotions.
 */
export default class Summary extends LightningElement {
    public static renderMode = 'light';

    /**
     * Gets or sets list (i.e summary) of applied promotions.
     * @returns {PromotionInformationDetail[]}
     */
    @api public appliedPromotions: PromotionInformationDetail[] | undefined;
    /**
     * Gets the header text that is displayed for the summary section.
     * @type {string}
     */
    @api public headerText: string | undefined;
    /**
     * Gets or sets the ISO 4217 currency code.
     * @type {string}
     */
    @api public currencyCode: string | undefined;
    /**
     * Gets the title text that is displayed in the terms and conditions popup.
     * @type {string}
     */
    @api public termsAndConditionsHeaderText: string | undefined;

    /**
     * Gets the list of applied promotions for display.
     * @returns {PromotionInformationDetail[]} representation with all the applied promotions.
     */
    private get appliedPromotionsDisplayList(): PromotionInformationDetail[] {
        return this.appliedPromotions || [];
    }
}
