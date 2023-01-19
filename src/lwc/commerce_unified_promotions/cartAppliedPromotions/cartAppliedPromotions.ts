import { LightningElement, api, wire, track } from 'lwc';
import type { PromotionSummaryCollectionData } from 'commerce/cartApi';
import { CartPromotionsAdapter } from 'commerce/cartApi';
import { transformPromotionContents } from './transformations';
import type { PromotionInformationDetail } from './types';
import { getErrorInfo } from 'commerce_cart/failedActionEvaluator';
import type { ErrorLabels } from 'commerce_cart/types';
import {
    webstoreNotFound,
    effectiveAccountNotFound,
    insufficientAccess,
    defaultErrorMessage,
    invalidInput,
} from './labels';
import type { ToastConfig } from 'lightning/toast';
import Toast from 'lightning/toast';
import type { CommerceError } from 'commerce/cartApi';
export type { PromotionInformationDetail };

/**
 * Error code returned for an empty cart.
 */
const MISSING_RECORD = 'MISSING_RECORD';

/**
 * A display of cart applied promotions.
 */
export default class CartAppliedPromotions extends LightningElement {
    public static renderMode = 'light';

    /**
     * Gets the title text that is displayed for the cart applied promotions.
     * @type {string}
     */
    @api public appliedPromotionsTitleText: string | undefined;

    /**
     * Gets the title text that is displayed in the terms and conditions popup.
     * @type {string}
     */
    @api public termsAndConditionsTitleText: string | undefined;

    /**
     * Whether or not show discount amount price.
     * @type {boolean}
     */
    @api public showDiscountAmount = false;

    /**
     * Whether or not show terms and conditions.
     * @type {boolean}
     */
    @api public showTermsAndConditions = false;

    /**
     * Gets the summary of applied promotions.
     * @type {PromotionSummaryCollectionData}
     */
    @api public cartAppliedPromotions: PromotionSummaryCollectionData | undefined;

    /**
     * Gets or sets the background color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public backgroundColor: string | undefined;

    /**
     * Gets or sets the applied promotions header text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public appliedPromotionsTitleTextColor: string | undefined;

    /**
     * Gets or sets the applied promotions header font size(small,medium,large)
     * @type {string}
     */
    @api public appliedPromotionsTitleFontSize: string | undefined;

    /**
     * Gets or sets the applied promotions text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public appliedPromotionsTextColor: string | undefined;

    /**
     * Gets or sets the discount amount text color, specified as a valid CSS color representation.
     * @type {string}
     */
    @api public discountAmountTextColor: string | undefined;

    /**
     * Gets or sets the applied promotions text font size(small,medium,large)
     * @type {string}
     */
    @api public appliedPromotionsFontSize: string | undefined;

    /**
     * Gets or sets the ISO 4217 currency code.
     * @type {string}
     */
    private _currencyCode: unknown;

    /**
     * Gets or sets whether to show applied promotions or not.
     * @type {boolean}
     */
    private _showAppliedPromotions = false;

    /**
     * Gets or sets the applied promotions.
     * @type {PromotionInformationDetail[]}
     */
    @track private _appliedPromotions: PromotionInformationDetail[] = [];

    /**
     * Gets the list of applied promotions for display.
     * @returns {PromotionInformationDetail[]} representation with all the applied promotions.
     */
    private get appliedPromotions(): PromotionInformationDetail[] {
        if (this.cartAppliedPromotions) {
            this._currencyCode = this.cartAppliedPromotions.currencyIsoCode;
            this._showAppliedPromotions = true;
            return transformPromotionContents(
                this.cartAppliedPromotions.promotions,
                this.showDiscountAmount,
                this.showTermsAndConditions
            );
        }
        return this._appliedPromotions;
    }

    /**
     * Determines whether to display the applied promotions component or not.
     * @returns {boolean}
     */
    private get displayCartAppliedPromotions(): boolean {
        if (this.cartAppliedPromotions) {
            return this.cartAppliedPromotions.promotions?.promotions?.length > 0;
        }
        return this._showAppliedPromotions;
    }

    /**
     * Sets the custom background color and custom CSS properties for the cart applied promotions component.
     * @returns {string}
     * The css style overwrites for the cart applied promotions component.
     */
    private get cartAppliedPromotionsCssStyles(): string {
        const headingDxpStyling = this.generateClassForSize(this.appliedPromotionsTitleFontSize);
        const descriptionsDxpStyling = this.generateClassForSize(this.appliedPromotionsFontSize);
        return `background-color:${this.backgroundColor};
             --com-c-cart-applied-promotions-heading-font-color: ${this.appliedPromotionsTitleTextColor};
             --com-c-cart-applied-promotions-heading-font-size: ${headingDxpStyling};
             --com-c-cart-applied-promotions-font-color: ${this.appliedPromotionsTextColor};
             --com-c-cart-applied-promotions-font-size: ${descriptionsDxpStyling};
             --com-c-cart-discount-amount-font-color: ${this.discountAmountTextColor};
             --com-c-cart-applied-promotions-border: none`;
    }

    /**
     * Gets dxp styling heading text of a given size.
     *  Valid values are: "small", "medium", and "large"
     *
     * @returns {string | undefined }
     *  The dxp css variable matching the requested size, if one exists; otherwise, undefined.
     */
    private generateClassForSize(fontSize: string | undefined): string | undefined {
        switch (fontSize) {
            case 'small':
                return 'var(--dxp-g-font-size-5)';
            case 'medium':
                return 'var(--dxp-g-font-size-7)';
            case 'large':
                return 'var(--dxp-g-font-size-10)';
            default:
                return undefined;
        }
    }

    /**
     * Retrieves the cart level promotion information.
     */
    @wire(CartPromotionsAdapter)
    private promotionsInfo({ data, error }: { data: PromotionSummaryCollectionData; error: CommerceError }): void {
        if (data) {
            this._currencyCode = data.currencyIsoCode ? data.currencyIsoCode : this._currencyCode;
            this._appliedPromotions = transformPromotionContents(
                data.promotions,
                this.showDiscountAmount,
                this.showTermsAndConditions
            );
            this._showAppliedPromotions = this._appliedPromotions.length > 0 ? true : false;
        } else {
            this._showAppliedPromotions = false;
            this._appliedPromotions = [];
            // Discerning here for the context/location (builder or store) we are in by checking cartAppliedPromotions
            if (error && !this.cartAppliedPromotions) {
                const errorCode = error?.code;
                // If the error code is MISSING_RECORD, the cart is empty and we do not surface a toast message
                if (errorCode !== MISSING_RECORD) {
                    const { message } = getErrorInfo(errorCode, this.applyPromotionLocalizedErrorMessages);
                    const toast = <ToastConfig>{
                        label: message,
                        variant: 'error',
                    };
                    Toast.show(toast, this);
                }
            }
        }
    }

    /**
     * Apply promotion localized error labels.
     *
     * @returns {Object}
     *  Object containg the localized error labels associated for the appropriate error code.
     */
    private get applyPromotionLocalizedErrorMessages(): ErrorLabels {
        return {
            webstoreNotFound: webstoreNotFound,
            effectiveAccountNotFound: effectiveAccountNotFound,
            insufficientAccess: insufficientAccess,
            defaultErrorMessage: defaultErrorMessage,
            invalidInput: invalidInput,
            unqualifiedCart: '',
            maximumLimitExceeded: '',
            alreadyApplied: '',
            blockedExclusive: '',
            limitExceeded: '',
            gateDisabled: '',
            tooManyRecords: '',
            itemNotFound: '',
            missingRecord: '',
            invalidBatchSize: '',
        };
    }
}
