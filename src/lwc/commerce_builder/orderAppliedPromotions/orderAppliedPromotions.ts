import { LightningElement, api } from 'lwc';

export default class OrderAppliedPromotions extends LightningElement {
    static renderMode = 'light';

    /**
     * @description The {!orderSummaryId} for this page.
     * @type {string}
     */
    @api orderSummaryId: string | undefined;
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
    @api public borderRadius: string | undefined;

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
}
