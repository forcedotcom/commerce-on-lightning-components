import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import currency from '@salesforce/i18n/currency';

import { sampleCartItemData } from './mockData';
import {
    CART_ACTION_PROCESSING,
    CART_DP_ACTION_SHOW_MORE,
    CART_DP_ACTION_DELETE,
    CART_DP_ACTION_UPDATE,
} from './constants';

import { DataProviderActionEvent } from 'experience/dataProvider';
import isPreviewMode from '@app/isPreviewMode';

import type { CartItemData } from 'commerce_data_provider/cartDataProvider';
import type { LightningNavigationContext } from 'types/common';
import type { InputField } from './types';

export {
    CART_ACTION_PROCESSING,
    CART_DP_ACTION_SHOW_MORE,
    CART_DP_ACTION_DELETE,
    CART_DP_ACTION_UPDATE,
} from './constants';

/**
 * @fires CartItems#cartactionprocessing
 */

/**
 * @slot showMore ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: { text: "Show More", textDisplayInfo: "{\"textStyle\": \"body-regular\"}" }}] })
 */
export default class CartItems extends LightningElement {
    /**
     * An event fired when an action is dispatched to the data provider
     *
     * Properties:
     *   - Bubbles: true
     *   - Cancelable: false
     *   - Composed: true
     *
     * @event CartItems#cartactionprocessing
     * @type {CustomEvent}
     * @property {{processing: boolean, loadingData?: boolean}} detail isProcessing
     *
     * @export
     */

    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light';

    /**
     * @description List of cart items from the data provider
     */
    @api items: CartItemData[] | undefined;

    /**
     * This component has a slot, which can't be displayed in a design substitute yet,
     * so mock data for the builder will have to be provided like this
     */
    get _items(): CartItemData[] | undefined {
        return isPreviewMode ? sampleCartItemData : this.items;
    }

    /**
     * @description Is there a next page of items
     */
    @api hasNextPageItems = false;

    /**
     * @description User defined option to show or hide the "show more" button/link
     */
    @api displayShowMoreItems = false;

    /**
     * @description Always display the "Show More" button if in the builder or if displayShowMore === true
     * @readonly
     */
    get displayShowMoreButton(): boolean {
        return this.displayShowMoreItems ? isPreviewMode || this.hasNextPageItems : false;
    }

    /**
     * @description Currency ISO code for the cart
     */
    @api currencyIsoCode: string | undefined;

    get _currencyIsoCode(): string | undefined {
        return isPreviewMode ? currency : this.currencyIsoCode;
    }

    /**
     * @description Show the "Remove Items" link
     */
    @api showRemoveItem = false;

    /**
     * @description Show the product image
     */
    @api showProductImage = false;

    /**
     * @description Show variant information
     */
    @api showProductVariants = false;

    /**
     * @description Show the price per unit
     */
    @api showPricePerUnit = false;

    /**
     * @description Custom font color for price per unit
     */
    @api pricePerUnitFontColor: string | undefined;
    /**
     * @description Custom font size for price per unit
     */
    @api pricePerUnitFontSize: string | undefined;

    /**
     * @description Show the total price column, which includes the original and actual prices
     */
    @api showTotalPrices = false;

    /**
     * @description Show the original price
     */
    @api showOriginalPrice = false;

    /**
     * @description Custom font color for original price
     */
    @api originalPriceFontColor: string | undefined;

    /**
     * @description Custom font size for original price
     */
    @api originalPriceFontSize: string | undefined;

    /**
     * @description Show the actual price
     */
    @api showActualPrice = false;
    /**
     * @description Custom font color for actual price
     */
    @api actualPriceFontColor: string | undefined;
    /**
     * @description Custom font size for actual price
     */
    @api actualPriceFontSize: string | undefined;

    /**
     * @description Show the promotions/discounted price
     */
    @api showPromotions = false;

    /**
     * @description discount/applied promotions button text - takes '{amount}' as a replaceable parameter
     */
    @api promotionsAppliedSavingsButtonText: string | undefined;

    /**
     * @description discount/applied promotions button font color
     */
    @api promotionsAppliedSavingsButtonFontColor: string | undefined;

    /**
     * @description discount/applied promotions button font size
     */
    @api promotionsAppliedSavingsButtonFontSize: string | undefined;

    /**
     * @description discount/applied promotions button hover text color
     */
    @api promotionsAppliedSavingsButtonTextHoverColor: string | undefined;

    /**
     * @description discount/applied promotions button background color
     */
    @api promotionsAppliedSavingsButtonBackgroundColor: string | undefined;

    /**
     * @description discount/applied promotions button background hover color
     */
    @api promotionsAppliedSavingsButtonBackgroundHoverColor: string | undefined;

    /**
     * @description discount/applied promotions button border color
     */
    @api promotionsAppliedSavingsButtonBorderColor: string | undefined;

    /**
     * @description discount/applied promotions button border radius
     */
    @api promotionsAppliedSavingsButtonBorderRadius: string | undefined;

    /**
     * @description Show the product SKU
     */
    @api showSku = false;

    /**
     * @description Label for sku field
     */
    @api skuLabel: string | undefined;

    /**
     * @description text that shows up in a quantity rules popover; takes '{0}' as a replaceable parameter
     */
    @api minimumValueGuideText: string | undefined;

    /**
     * @description text that shows up in a quantity rules popover; takes '{0}' as a replaceable parameter
     */
    @api maximumValueGuideText: string | undefined;

    /**
     * @description text that shows up in a quantity rules popover; takes '{0}' as a replaceable parameter
     */
    @api incrementValueGuideText: string | undefined;

    /**
     * @description List of other custom fields to be displayed, as a JSON string
     */
    @api productFieldMapping: string | undefined;

    /**
     * @description Convert the custom fields string into an array
     * @readonly
     */
    get productFieldMappingValue(): InputField[] {
        return this.productFieldMapping ? JSON.parse(this.productFieldMapping) : [];
    }

    /**
     * @description Handle the 'cartshowmore' event and fire the appropriate action to the data provider
     */
    handleCartShowMore(): void {
        this.dispatchActionProcessing(true);
        this.dispatchEvent(
            new DataProviderActionEvent(CART_DP_ACTION_SHOW_MORE, undefined, {
                onSuccess: (): void => {
                    this.dispatchActionProcessing(false, false);
                },
                onError: (): void => {
                    this.dispatchActionProcessing(false, false);
                },
            })
        );
    }

    /**
     * @description Handle the 'deletecartitem' event and fire the appropriate action to the data provider
     * @param {CustomEvent} event
     * @param {string} event.detail
     */
    handleDeleteCartItem(event: CustomEvent): void {
        this.dispatchActionProcessing(true);
        this.dispatchEvent(
            new DataProviderActionEvent(CART_DP_ACTION_DELETE, event.detail, {
                onSuccess: (): void => {
                    this.dispatchActionProcessing(false);
                },
                onError: (): void => {
                    this.dispatchActionProcessing(false);
                },
            })
        );
    }

    /**
     * @description
     * @param {CustomEvent} event
     * @param {{ cartItemId: string, quantity: number }} event.detail
     */
    handleUpdateCartItem(event: CustomEvent): void {
        this.dispatchActionProcessing(true);
        this.dispatchEvent(
            new DataProviderActionEvent(CART_DP_ACTION_UPDATE, event.detail, {
                onSuccess: (): void => {
                    this.dispatchActionProcessing(false);
                },
                onError: (): void => {
                    this.dispatchActionProcessing(false);
                },
            })
        );
    }

    @wire(NavigationContext)
    navContext!: LightningNavigationContext;

    /**
     * @description Handle the 'navigatetoproduct'
     * @param {CustomEvent} event
     * @param {string} event.detail
     */
    handleProductNavigation(event: CustomEvent): void {
        navigate(this.navContext, {
            type: 'standard__recordPage',
            attributes: {
                objectApiName: 'Product2',
                recordId: event.detail,
                actionName: 'view',
            },
        });
    }

    /**
     * @description
     * @private
     * @param {boolean} processing This tells parent components if the action is still pending
     * @param {(boolean | undefined)} [loadingData=undefined] This tells parent components if the data
     * is still loading.  This is need if the parent cannot tell if new data has loaded because the setter is not
     * triggered.
     */
    private dispatchActionProcessing(processing: boolean, loadingData: boolean | undefined = undefined): void {
        this.dispatchEvent(
            new CustomEvent(CART_ACTION_PROCESSING, {
                detail: {
                    processing,
                    loadingData,
                },
                bubbles: true,
                composed: true,
            })
        );
    }
}
