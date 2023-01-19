import { LightningElement, api } from 'lwc';
import generateLabel from './textGenerator';
const NAV_TO_PRODUCT_DETAIL_EVENT = 'navigatetoproductdetailpage';
/**
 * display product title
 * @fires ProductTitle#navigatetoproductdetailpage
 */
export default class ProductTitle extends LightningElement {
    /**
     * An event fired when a product is available and "Product Title" is clicked.
     *
     * Properties:
     *   - Bubbles: true
     *   - Cancelable: false
     *   - Composed: true
     *
     * @event ProductTitle#navigatetoproductdetailpage
     * @type {CustomEvent}
     *
     * @export
     */

    static renderMode = 'light';

    /**
     * name of the product
     */
    @api name = '';

    /**
     * whether or not the product is available
     */
    @api isAvailable = false;

    /**
     * The label which needs to be displayed if buyer isn't entitled to buy this product. Example : (No More Available)
     */
    @api productUnavailableMessage = '';

    /**
     * Unique identifier of the product
     * When this property is set to an non empty value, product title will be navigable.
     */

    @api productId: string | undefined;

    /**
     * url to the product detail page for this product.
     */
    @api url: string | undefined;

    /**
     * Whether or not to show the product title as clickable
     */
    get _isNavigable(): boolean {
        return (this.productId || '').length > 0 && this.isAvailable === true;
    }

    /**
     * Gets the product title when productId is empty.
     */
    get _productNameWithInvalidLabel(): string {
        return generateLabel(this.name, this.productUnavailableMessage);
    }

    navigateToProductDetailPage(event: Event): void {
        /**
         * Fired when the user clicks on product title .
         */
        event.preventDefault();
        this.dispatchEvent(
            new CustomEvent(NAV_TO_PRODUCT_DETAIL_EVENT, {
                bubbles: true,
                composed: true,
                detail: {
                    productId: this.productId,
                },
            })
        );
    }
}
