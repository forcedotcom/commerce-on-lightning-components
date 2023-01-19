import { LightningElement, api } from 'lwc';
import type { CartItemData } from 'commerce_data_provider/cartDataProvider';

import styleStringGenerator, { getDxpFontSize, getDxpButtonFontSize } from './styleStringGenerator';

import { SHOW_MORE_EVENT } from './constants';
export { SHOW_MORE_EVENT };

/**
 * Cart items component for displaying a list of items in the cart
 * @fires Items#cartshowmore
 */
export default class Items extends LightningElement {
    /**
     * An event fired when the "Show More" button is clicked
     *
     * Properties:
     *   - Bubbles: true
     *   - Cancelable: false
     *   - Composed: true
     *
     * @event Items#cartshowmore
     * @type {CustomEvent}
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
     * @description List of cart items as provided from the data provider;
     */
    @api items: CartItemData[] | undefined;

    /**
     * @description Should the "Show More" button be shown
     */
    @api displayShowMore = false;

    /**
     * @description Currency ISO code for the cart
     */
    @api currencyIsoCode: string | undefined;

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
    @api pricePerUnitFontSize: 'small' | 'medium' | 'large' | undefined;

    /**
     * @description Show the total price
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
    @api originalPriceFontSize: 'small' | 'medium' | 'large' | undefined;

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
    @api actualPriceFontSize: 'small' | 'medium' | 'large' | undefined;

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
    @api promotionsAppliedSavingsButtonFontSize: 'small' | 'medium' | 'large' | undefined;

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
     * @description text that shows up in a quantity rules popover; takes '{minimum}' as a replaceable parameter
     */
    @api minimumValueGuideText: string | undefined;

    /**
     * @description text that shows up in a quantity rules popover; takes '{maximum}' as a replaceable parameter
     */
    @api maximumValueGuideText: string | undefined;

    /**
     * @description text that shows up in a quantity rules popover; takes '{step}' as a replaceable parameter
     */
    @api incrementValueGuideText: string | undefined;

    /**
     * @description List of other custom fields to be displayed
     */
    @api productFieldMapping: Record<string, unknown> | undefined;

    /**
     * @description generate the custom styles string for the cart line item component
     * @readonly
     */
    get cartItemsStyles(): string {
        const styles = {
            'unit-price-font-color': this.pricePerUnitFontColor,
            'unit-price-font-size': getDxpFontSize(this.pricePerUnitFontSize),
            'original-price-font-color': this.originalPriceFontColor,
            'original-price-font-size': getDxpFontSize(this.originalPriceFontSize),
            'actual-price-font-color': this.actualPriceFontColor,
            'actual-price-font-size': getDxpFontSize(this.actualPriceFontSize),
            'applied-savings-button-font-size': getDxpButtonFontSize(this.promotionsAppliedSavingsButtonFontSize),
            'applied-savings-button-text-color': this.promotionsAppliedSavingsButtonFontColor,
            'applied-savings-button-text-hover-color': this.promotionsAppliedSavingsButtonTextHoverColor,
            'applied-savings-button-background-color': this.promotionsAppliedSavingsButtonBackgroundColor,
            'applied-savings-button-background-hover-color': this.promotionsAppliedSavingsButtonBackgroundHoverColor,
            'applied-savings-button-border-color': this.promotionsAppliedSavingsButtonBorderColor,
            'applied-savings-button-border-radius': this.promotionsAppliedSavingsButtonBorderRadius
                ? this.promotionsAppliedSavingsButtonBorderRadius + 'px'
                : '',
        };
        return styleStringGenerator.cartItemsStyles.createForStyles(styles);
    }

    /**
     * @description Fire event to show the next page of items
     */
    handleShowMoreButton(): void {
        this.dispatchEvent(
            new CustomEvent(SHOW_MORE_EVENT, {
                composed: true,
                bubbles: true,
            })
        );
    }
}
