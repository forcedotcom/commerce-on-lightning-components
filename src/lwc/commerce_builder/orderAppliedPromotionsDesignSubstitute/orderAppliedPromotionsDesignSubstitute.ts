import { LightningElement, api } from 'lwc';
import { ORDER_APPLIED_PROMOTIONS_DESIGN_SUBSTITUTE_DATA } from './data';
import type { PromotionInformationDetail } from 'commerce_unified_promotions/cartAppliedPromotions';
import styleStringGenerator from './styleStringGenerator';
export default class OrderAppliedPromotionsDesignSubstitute extends LightningElement {
    static renderMode = 'light';

    /**
     * @description The {!orderSummaryId} for this page.
     * @type {string}
     */
    @api public orderSummaryId: string | undefined;

    /**
     * @description The text displayed for the AppliedPromotions Component
     * @type {string}
     */
    @api public promotionTitle: string | undefined;

    /**
     * @description Background color of AppliedPromotions card
     * @type {string}
     */
    @api public backgroundColor: string | undefined;

    /**
     * @description Border color of AppliedPromotions card
     * @type {string}
     */
    @api public borderColor: string | undefined;

    /**
     * @description Border Radius of AppliedPromotions card
     * @type {string}
     */
    @api public borderRadius: number | undefined;

    private get _borderRadius(): string {
        return this.borderRadius ? this.borderRadius + 'px' : '0px';
    }

    /**
     * @description Text Color in AppliedPromotions card
     * @type {string}
     */
    @api public textColor: string | undefined;

    /**
     * @description Amounts color in AppliedPromotions card
     * @type {string}
     */
    @api public amountTextColor: string | undefined;

    get defaultOrderAppliedPromotionsStyle(): string {
        const styles = {
            'default-background-color': this.backgroundColor,
            'default-text-color': this.textColor,
            'default-heading-text-color': this.textColor,
            'default-amount-text-color': this.amountTextColor,
            'default-border-color': this.borderColor,
            'default-border-radius': this._borderRadius,
        };
        return styleStringGenerator.defaultOrderAppliedPromotionsStyles.createForStyles(styles);
    }

    get adjustments(): PromotionInformationDetail[] {
        return ORDER_APPLIED_PROMOTIONS_DESIGN_SUBSTITUTE_DATA.adjustments;
    }

    get _currencyIsoCode(): string {
        return ORDER_APPLIED_PROMOTIONS_DESIGN_SUBSTITUTE_DATA.currencyIsoCode;
    }
}
