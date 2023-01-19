import { LightningElement, api, wire, track } from 'lwc';
import { NavigationContext, generateUrl } from 'lightning/navigation';
import type { LightningNavigationContext } from 'types/common';
import { resolve as resolveResource } from 'experience/resourceResolver';
import { productImageAltText } from './labels';
import type { OrderItem as OrderItemData } from 'commerce_my_account/orderDeliveryGroupContainer';
import type { TextDisplayInfo } from './types';
export type { TextDisplayInfo } from './types';
import type { EntityField } from 'commerce/orderApiInternal';
import currencyFormatter from 'commerce/currencyFormatter';
const NAV_TO_PRODUCT_DETAIL_EVENT = 'navigatetoproductdetailpage';

/**
 * @fires OrderItem#navigatetoproductdetailpage
 */
export default class OrderItemInfo extends LightningElement {
    /**
     * An event fired when a product is available and the product image is clicked.
     *
     * Properties:
     *   - Bubbles: true
     *   - Cancelable: false
     *   - Composed: true
     *
     * @event OrderItem#navigatetoproductdetailpage
     * @type {CustomEvent}
     *
     * @export
     */
    static renderMode = 'light';
    /**
     * The ISO 4217 currency code
     */
    @api currencyCode: string | undefined;

    /**
     * The label which needs to be displayed if buyer isn't entitled to buy this product. Example : (No More Available)
     */
    @api productUnavailableMessage: string | undefined;

    /**
     * Whether or not to show the Product Image
     */
    @api showImage = false;

    /**
     * Whether or not to show the total
     */
    @api showTotal = false;

    /**
     * Total Price Text Color
     */
    @api totalPriceTextColor: string | undefined;

    /**
     *Contains style information for the total field
     */
    @api
    textDisplayInfo: TextDisplayInfo | undefined;

    @wire(NavigationContext)
    navigationContextHandler(navContext: LightningNavigationContext): void {
        this._navContext = navContext;
        if (this.orderItem?.productId) {
            this.updateUrl();
        }
    }

    _navContext: LightningNavigationContext | undefined;

    updateUrl(): void {
        this._productUrl = generateUrl(<LightningNavigationContext>this._navContext, {
            type: 'standard__recordPage',
            attributes: {
                objectApiName: 'Product2',
                recordId: <string>this._orderItem?.productId,
                actionName: 'view',
            },
        });
    }

    @api
    set orderItem(orderItem: OrderItemData | undefined) {
        const isProductIdUpdated = Boolean(this._orderItem?.productId !== orderItem?.productId);
        this._orderItem = orderItem;
        if (this._orderItem?.productId && this._navContext && isProductIdUpdated) {
            this.updateUrl();
        }
    }

    get orderItem(): OrderItemData | undefined {
        return this._orderItem;
    }

    @track
    _orderItem: OrderItemData | undefined;

    //END API PROPERTIES

    //FOR GENERATING URL
    _productUrl = '';

    //BOOLEAN CONDITIONS THAT DETERMINE WHICH PARTS OF HTML ARE RENDERED

    /**
     * Whether or not to show the Order Item
     */
    get _showOrderItem(): boolean {
        return this.orderItem ? true : false;
    }

    /**
     * Whether or not to show the Product Image
     */
    get _showImage(): boolean {
        return Boolean(this.showImage && (this.orderItem?.media.url || '').length > 0);
    }

    /**
     * Whether or not to show product title
     */
    get _showProductTitle(): boolean {
        return (this.orderItem?.name || '').length > 0;
    }

    /**
     * Whether or not to show the product variants
     */
    get _showVariants(): boolean {
        return (this.orderItem?.variants || []).length > 0;
    }

    /**
     * Whether or not to show the order item fields
     */
    get _showFields(): boolean {
        return (this.orderItem?.fields || []).length > 0;
    }
    /**
     * Whether or not to show the order item fields in second column
     * If viewed on mobile device show all fields in column one
     */
    get _showFieldsInSecondColumn(): boolean {
        return <number>this.orderItem?.fields?.length > 5;
    }

    /**
     *  item total Price in third column when showTotal is true and totalPrice and currencyCode are defined.
     */
    get _showTotalPrice(): boolean {
        return this.showTotal && this.currencyCode && this.orderItem?.totalPrice ? true : false;
    }

    //END BOOLEAN CONDITIONS THAT DETERMINE WHICH PARTS OF HTML ARE RENDERED

    // EXTRACTING DATA
    /**
     * Gets the product Id if the product is valid (can be viewed and is active) otherwise undefined
     */
    get _productId(): string | undefined {
        return this.orderItem?.isValid ? this.orderItem.productId : undefined;
    }

    /**
     * Gets the alternateText for product image.
     */
    get _alternateTextForImage(): string {
        return this.orderItem?.media.alternateText || productImageAltText;
    }

    /**
     * Gets the resolved image URL.
     */
    get _resolvedUrl(): string | null {
        //the url will always be defined because _showImage has to return true before _resolvedUrl is called.
        return resolveResource(<string>this.orderItem?.media.url);
    }

    /**
     * Gets the Fields to be displayed in column one
     * If viewed on mobile device all fields are shown in column one
     */
    get _fieldsForColumnOne(): EntityField[] | undefined {
        return this.orderItem?.fields?.slice(0, 5);
    }

    /**
     * Returns the class list for column 1
     */
    get _classesForColumnOne(): string {
        return 'slds-col slds-size_1-of-1 slds-large-size_1-of-2';
    }

    /**
     * Gets the Fields to be displayed in column two
     * If there are more than 5 fields then the remaining fields
     * are shown in column 2.
     * If in mobile view all fields are shown in column 1
     */
    get _fieldsForColumnTwo(): EntityField[] | undefined {
        return this.orderItem?.fields?.slice(5);
    }

    /**
     * Returns the class list for column 2
     */
    get _classesForColumnTwo(): string {
        return 'slds-col slds-size_1-of-1 slds-large-size_1-of-2 slds-order_2 slds-large-order_1';
    }

    /**
     * Gets the formatted total price to be displayed in column 3 when show total is selected
     * in mobile view it is shown in column 2
     */
    get _formattedTotalPriceValue(): string {
        return currencyFormatter(this.currencyCode, this.orderItem?.totalPrice?.toString());
    }

    navigateToProductDetailPage(event: Event): void {
        /**
         * Fired when the user clicks on image .
         */
        event.preventDefault();
        this.dispatchEvent(
            new CustomEvent(NAV_TO_PRODUCT_DETAIL_EVENT, {
                bubbles: true,
                composed: true,
                detail: {
                    productId: this._productId,
                },
            })
        );
    }
}
