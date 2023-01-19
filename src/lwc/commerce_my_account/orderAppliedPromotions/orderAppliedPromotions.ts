import { LightningElement, api, wire } from 'lwc';
import { OrderAdjustmentsAdapter } from 'commerce/orderApi';
import type { OrderAdjustmentsCollectionData, OrderAdjustment } from 'commerce/orderApi';
import { effectiveAccount } from 'commerce/effectiveAccountApi';
import { generateDisplayablePromotionName } from 'commerce_unified_promotions/nameDisplayEvaluator';
import type { ErrorLabels } from 'commerce_cart/types';
import type { PromotionInformationDetail } from 'commerce_unified_promotions/cartAppliedPromotions';
import styleStringGenerator from './styleStringGenerator';
import { genericErrorMessage } from './labels';
import { getErrorInfo } from 'commerce_cart/failedActionEvaluator';

export default class OrderAppliedPromotions extends LightningElement {
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

    _adjustments: PromotionInformationDetail[] = [];
    private _currencyIsoCode: string | undefined;
    get _showAppliedAdjustments(): boolean {
        return this._adjustments?.length > 0;
    }

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

    @wire(OrderAdjustmentsAdapter, {
        orderSummaryId: '$orderSummaryId',
        effectiveAccountId: effectiveAccount.accountId,
    })
    getAppliedOrderPromotionsHandler({ data, error }: { data: OrderAdjustmentsCollectionData; error: string }): void {
        const isPromotionType = (adjustment: OrderAdjustment): boolean => adjustment.type === 'Promotion';
        if (data) {
            this._adjustments = data.adjustments
                .filter(isPromotionType)
                .map(function (adj: OrderAdjustment, index: number) {
                    const appliedPromotion: PromotionInformationDetail = {
                        id: `${index}`,
                        name: generateDisplayablePromotionName(adj.displayName, adj.basisReferenceDisplayName || ''),
                        discountAmount: adj.amount,
                        termsAndConditions: null,
                    };

                    return appliedPromotion;
                });
            if (this._adjustments.length > 0) {
                this._currencyIsoCode = data.adjustments[0].currencyIsoCode;
            }
        } else if (error) {
            this._adjustments = [];
            this._currencyIsoCode = undefined;
            this._handleGetAppliedOrderPromotionsError(error);
        }
    }

    private _handleGetAppliedOrderPromotionsError(error: string): void {
        const errorLabels: ErrorLabels = {
            defaultErrorMessage: genericErrorMessage,
            webstoreNotFound: '',
            effectiveAccountNotFound: '',
            gateDisabled: '',
            invalidInput: '',
            insufficientAccess: '',
            maximumLimitExceeded: '',
            limitExceeded: '',
            tooManyRecords: '',
            itemNotFound: '',
            missingRecord: '',
            invalidBatchSize: '',
            alreadyApplied: '',
            blockedExclusive: '',
            unqualifiedCart: '',
        };
        const errorInfo = getErrorInfo(error, errorLabels);

        // TODO: implement error handling logic to make finding error info easier
        console.error(errorInfo);
    }
}
