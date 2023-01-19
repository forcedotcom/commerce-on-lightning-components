import { LightningElement, api, wire } from 'lwc';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import { generateModalHeading, generateModalSubheading } from './textGenerator';
import type { OrderActionAddToCartData, OrderUnaddedProductsData } from 'commerce/orderApi';
import { OrderActionAddToCartAdapter } from 'commerce/orderApi';
import { cartSummaryChanged } from 'commerce/cartApiInternal';

import {
    unavailableItems,
    viewCartButtonLabel,
    continueShoppingButton,
    errorScreenButtonLabel,
    spinnerScreenHeaderText,
    errorScreenHeaderText,
    errorScreenSubHeaderText,
    spinnerScreenHelpText,
} from './labels';

export default class ReorderModalContents extends LightningElement {
    static renderMode = 'light';

    /**
     * @description The unique identifier of order summary
     * @type {string}
     */
    @api orderSummaryId: string | undefined;

    /**
     * @description Count of how many products were successfully added to cart
     * @type {number}
     */
    _succeededProductCount = 0;

    /**
     * @description Count of how many products failed to be added to cart
     * @type {number}
     */
    _failedProductCount = 0;

    /**
     * @description List of which products failed to be added to cart
     * @type {Array}
     */
    _unaddedProductList: OrderUnaddedProductsData[] = [];

    /**
     * @description url to "current-cart" page
     * @type {string}
     */
    @api cartUrl: string | undefined;

    /**
     * @description Shows modal in error state if error response from wire
     * @type {boolean}
     */
    _errors = false;

    /**
     * @description Shows spinner if true
     * @type {boolean}
     */
    _isLoading = true;

    /**
     * Custom label "UNAVAILABLE ITEMS"
     * @type {String}
     */
    get _unavailableItemsText(): string {
        return unavailableItems;
    }

    /**
     * Custom label "VIEW CART"
     * @type {String}
     */
    get _viewCartButtonText(): string {
        return viewCartButtonLabel;
    }

    /**
     * Custom label "CONTINUE SHOPPING"
     * @type {String}
     */
    get _continueShoppingButtonText(): string {
        return continueShoppingButton;
    }

    /**
     * Custom label "GOT IT."
     * @type {String}
     */
    get _errorsScreenButtonLabel(): string {
        return errorScreenButtonLabel;
    }

    /**
     * @description Generates a string that is the heading of the modal
     */
    get _modalHeading(): string | undefined {
        if (this._isLoading === true) {
            return spinnerScreenHeaderText;
        }
        return this._errors
            ? errorScreenHeaderText
            : generateModalHeading(<number>this._succeededProductCount, <number>this._failedProductCount);
    }

    /**
     * @description Generates a string that is the subheading of the modal
     */
    get _modalSubheading(): string | undefined {
        return this._errors
            ? errorScreenSubHeaderText
            : generateModalSubheading(this._succeededProductCount, this._failedProductCount);
    }

    /**
     * @description Conditionally show subheadings
     */
    get _showSubheadings(): boolean {
        return this._failedProductCount !== 0 || this._errors;
    }

    /**
     * @description Custom label "Adding items to your cart..."
     */
    get _spinnerHelpText(): string | undefined {
        return spinnerScreenHelpText;
    }

    /**
     * @description Conditionally changes button options in modal if there is an error from api
     */
    get _hasError(): boolean {
        return this._errors;
    }

    /**
     * @description Changes unadded product list styling if there are multiple unadded products
     */
    get _listClassGenerator(): string {
        return this._unaddedProductList.length > 1
            ? 'unadded-product-list-column slds-p-around_medium slds-border_bottom'
            : 'unadded-product-list-column slds-p-around_medium';
    }

    /**
     * @description Conditionally renders the unadded product list if items are unavailable
     */
    get _unavailableProducts(): boolean {
        return Boolean(this._unaddedProductList?.length);
    }

    /**
     * @description Fetches reorder data
     */
    @wire(OrderActionAddToCartAdapter, { orderSummaryId: '$orderSummaryId', cartStateOrId: 'current' })
    handleReorderAdapterResponse({ data, error }: StoreAdapterCallbackEntry<OrderActionAddToCartData>): void {
        if (data) {
            this._isLoading = false;
            this._succeededProductCount = data.totalSucceededProductCount;
            this._failedProductCount = data.totalFailedProductCount;
            this._unaddedProductList = data.unaddedProducts || [];
            cartSummaryChanged();
        } else if (error) {
            this._isLoading = false;
            this._errors = true;
        }
    }

    /**
     * @description Fires the 'close' event to reorder modal component to close the modal
     */
    handleCloseModal(): void {
        const closeModal = new CustomEvent('close');
        this.dispatchEvent(closeModal);
    }

    /**
     * @description Handle the click of the "View Cart" button
     */
    handleViewCart(): void {
        const viewcart = new CustomEvent('viewcart');
        this.dispatchEvent(viewcart);
    }
}
