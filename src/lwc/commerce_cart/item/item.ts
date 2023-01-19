import { LightningElement, api, wire } from 'lwc';
import { displayDiscountPrice } from 'commerce_unified_promotions/discountPriceDisplayEvaluator';
import canDisplayOriginalPrice from 'commerce_cart/originalPriceDisplayEvaluator';
import { getPriceLabel, getProductLabel } from './labelGenerators';
import { changeSign } from './transformers';
import { DELETE_ITEM_EVENT, UPDATE_ITEM_EVENT, NAVIGATE_PRODUCT_EVENT, PRODUCT_DETAIL_FIELDS } from './constants';
import {
    pricePerItem,
    pricePerItemAssistiveText,
    originalPriceAssistiveText,
    actualPriceAssistiveText,
    removeButtonText,
    removeItemAssistiveText,
} from './labels';
import { NavigationContext, generateUrl } from 'lightning/navigation';
import { resolve as resourceResolver } from 'experience/resourceResolver';

import type { CartItemData, ProductDetailsData } from 'commerce_data_provider/cartDataProvider';
import type { LightningNavigationContext } from 'types/common';
import type { CartProductAttributeSummaryInternal, InputField, FieldData } from './types';
import type { CartProductAttributeSummaryData } from 'commerce/cartApi';

export { DELETE_ITEM_EVENT, UPDATE_ITEM_EVENT, NAVIGATE_PRODUCT_EVENT } from './constants';
export type { InputField };

/**
 * @fires Item#deletecartitem
 * @fires Item#updatecartitem
 * @fires Item#navigatetoproduct
 */
export default class Item extends LightningElement {
    /**
     * An event fired when the Product link or image is clicked
     *
     * Properties:
     *   - Bubbles: true
     *   - Cancelable: false
     *   - Composed: true
     *
     * @event Item#navigatetoproduct
     * @type {CustomEvent}
     * @property {string} detail productId
     *
     * @export
     */

    /**
     * An event fired when the "Remove" button is clicked
     *
     * Properties:
     *   - Bubbles: true
     *   - Cancelable: false
     *   - Composed: true
     *
     * @event Item#deletecartitem
     * @type {CustomEvent}
     * @property {string} detail cartItemId
     *
     * @export
     */

    /**
     * An event fired when the quantity selector value is changed
     *
     * Properties:
     *   - Bubbles: true
     *   - Cancelable: false
     *   - Composed: true
     *
     * @event Item#updatecartitem
     * @type {CustomEvent}
     * @property {cartItemId: string, quantity: number} detail
     *
     * @export
     */

    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light';

    labels = {
        pricePerItem,
        pricePerItemAssistiveText,
        originalPriceAssistiveText,
        actualPriceAssistiveText,
        removeButtonText,
        removeItemAssistiveText,
    };

    /**
     * @description CartItemData record
     */
    @api item: CartItemData | undefined;

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
     * @description Show the total price
     */
    @api showTotalPrices = false;

    /**
     * @description Show the original price
     */
    @api showOriginalPrice = false;

    /**
     * @description Show the negotiated price
     */
    @api showActualPrice = false;

    /**
     * @description Show the promotions/discounted price
     */
    @api showPromotions = false;

    /**
     * @description discount/applied promotions button text - takes '{amount}' as a replaceable parameter
     */
    @api promotionsAppliedSavingsButtonText: string | undefined;

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
    @api productFieldMapping: InputField[] | undefined;

    /**
     * @description Should the original price be shown under the total amount
     * @readonly
     */
    get _showOriginalPrice(): boolean {
        return canDisplayOriginalPrice(true, this.showOriginalPrice, this.item?.amount, this.item?.listPrice);
    }

    /**
     * @description Get the variant values and map them to format that can be used by
     * <commerce_product_information-variant-attributes-display>
     * @readonly
     */
    get variants(): CartProductAttributeSummaryInternal[] | undefined {
        return this.item?.ProductDetails?.variationAttributes?.attributes?.map(
            (attribute: CartProductAttributeSummaryData) => {
                return {
                    ...attribute,
                    name: attribute.label,
                };
            }
        );
    }

    /**
     * @description Get the quantity value for the line item, returns 0 if undefined
     * @readonly
     */
    get quantity(): number {
        if (this.item?.quantity === undefined) {
            return 0;
        }

        return this.item.quantity;
    }

    /**
     * @description should the discounted price (in the green badge) be shown
     * @readonly
     */
    get _showPromotions(): boolean {
        return displayDiscountPrice(this.showPromotions, this.item?.adjustmentAmount?.toString());
    }

    /**
     * @description get the minimum quantity allowed as defined by purchase quantity rule
     * @readonly
     */
    get minimum(): string | null | undefined {
        return this.item?.ProductDetails.purchaseQuantityRule?.minimum;
    }

    /**
     * @description get the maximum quantity allowed as defined by purchase quantity rule
     * @readonly
     */
    get maximum(): string | null | undefined {
        return this.item?.ProductDetails.purchaseQuantityRule?.maximum;
    }

    /**
     * @description the amount that the quantity selector should increment or decrement by
     * @readonly
     */
    get step(): string | null | undefined {
        return this.item?.ProductDetails.purchaseQuantityRule?.increment;
    }

    @wire(NavigationContext)
    navContext!: LightningNavigationContext;

    /**
     * @description Url to product detail page
     */
    _productUrl: string | undefined;
    connectedCallback(): void {
        const productId = this.item?.ProductDetails.productId;

        if (productId && generateUrl) {
            this._productUrl = generateUrl(<LightningNavigationContext>this.navContext, {
                type: 'standard__recordPage',
                attributes: {
                    objectApiName: 'Product2',
                    recordId: productId,
                    actionName: 'view',
                },
            });
        }
    }

    /**
     * @description set of custom fields to be shown.  the data will be mapped to a format
     * that can be consumed by <commerce-field-display>
     * @readonly
     */
    get _productFieldMapping(): FieldData[] {
        return (
            this.productFieldMapping?.flatMap((fieldMapping) => {
                const fieldValue = this.getFieldValue(fieldMapping.name);

                if (!fieldValue) {
                    return [];
                }

                const fieldData: FieldData = {
                    name: fieldMapping.name,
                    label: fieldMapping.label,
                    type: fieldMapping.type,
                    value: fieldValue,
                };

                return fieldData;
            }) ?? []
        );
    }

    /**
     * @description Handle the "Remove" button click
     * @fires Item#deletecartitem
     */
    handleDeleteItem(): void {
        this.dispatchEvent(
            new CustomEvent(DELETE_ITEM_EVENT, {
                detail: this.item?.id,
                composed: true,
                bubbles: true,
            })
        );
    }

    /**
     * @description These values hold the last values from last time the quantity selector
     * was changed.  When the quantity is changed, the data is updated and the quantity selector
     * fires the event again.  Compare these values to prevent UPDATE_ITEM_EVENT from being fired twice.
     * @private
     */
    private _quantitySelectorCurrentValue: number | undefined;
    private _quantitySelectorLastValue: number | undefined;

    /**
     * @description Handle the value change from the quantity selector and fire an event to update the amount
     * @param {CustomEvent} event
     * @fires Item#updatecartitem
     */
    handleValueChanged(event: CustomEvent): void {
        const quantity = event.detail.value;
        const lastQuantity = event.detail.lastValue;

        if (this._quantitySelectorCurrentValue === quantity && this._quantitySelectorLastValue === lastQuantity) {
            //this is just from the quantity selector firing again when te value is set
            return;
        }

        this._quantitySelectorCurrentValue = quantity;
        this._quantitySelectorLastValue = lastQuantity;
        this.dispatchEvent(
            new CustomEvent(UPDATE_ITEM_EVENT, {
                detail: {
                    cartItemId: this.item?.id,
                    quantity,
                },
                composed: true,
                bubbles: true,
            })
        );
    }

    /**
     * @description Handle the event when the product name or image is clicked
     * @param {CustomEvent} event
     */
    handleProductNameClick(event: CustomEvent): void {
        event.preventDefault();
        this.dispatchEvent(
            new CustomEvent(NAVIGATE_PRODUCT_EVENT, {
                detail: this.item?.ProductDetails.productId,
                composed: true,
                bubbles: true,
            })
        );
    }

    /**
     * @description Get the value for the custom field to be shown
     * @param {string} fieldName
     * @return {*}  {unknown}
     */
    getFieldValue(fieldName: string): unknown {
        //if the fieldName is one of the fields in PRODUCT_DETAIL_FIELDS, then look for the value
        //here instead of in the `fields` map
        if (Object.keys(PRODUCT_DETAIL_FIELDS).includes(fieldName)) {
            const productDetailField: string = PRODUCT_DETAIL_FIELDS[fieldName];
            return this.item?.ProductDetails[productDetailField as keyof ProductDetailsData];
        }

        return this.item?.ProductDetails?.fields?.[fieldName];
    }

    /**
     * @description Get the button label for the discount/applied savings button
     * @readonly
     */
    get _promotionsAppliedSavingsButtonText(): string {
        return getPriceLabel(
            this.promotionsAppliedSavingsButtonText,
            changeSign(this.item?.adjustmentAmount, true),
            this.currencyIsoCode,
            '{amount}'
        );
    }

    /**
     * @description Get the price per item/unit price text
     * @readonly
     */
    get pricePerItemText(): string {
        return getPriceLabel(pricePerItem, this.item?.unitAdjustedPrice, this.currencyIsoCode, '{0}');
    }

    /**
     * @description Get the price per item/unit price assistive text
     * @readonly
     */
    get pricePerItemAssistiveText(): string {
        return getPriceLabel(pricePerItemAssistiveText, this.item?.unitAdjustedPrice, this.currencyIsoCode, '{0}');
    }

    /**
     * @description Get the original price assistive text
     * @readonly
     */
    get originalPriceAssistiveText(): string {
        return getPriceLabel(originalPriceAssistiveText, this.item?.listPrice, this.currencyIsoCode, '{0}');
    }

    /**
     * @description Get the actual price assistive text
     * @readonly
     */
    get actualPriceAssistiveText(): string {
        return getPriceLabel(actualPriceAssistiveText, this.item?.amount, this.currencyIsoCode, '{0}');
    }

    /**
     * @description Get the remove button assistive text that includes the item nae
     * @readonly
     */
    get removeButtonAssistiveText(): string {
        return getProductLabel(removeItemAssistiveText, this.item?.name, '{name}');
    }

    get thumbnailImageUrl(): string {
        const thumbnailUrl =
            this.item?.ProductDetails.thumbnailImage?.thumbnailUrl ||
            this.item?.ProductDetails.thumbnailImage?.url ||
            '';
        const cmsImageScalingProps = { height: 150, width: 150 };

        return resourceResolver(thumbnailUrl, false, cmsImageScalingProps);
    }
}
