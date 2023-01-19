import { LightningElement, api, wire } from 'lwc';
import type { ButtonVariant, ButtonSize, ButtonWidth, ButtonAlignment } from 'commerce_my_account/reorderButton';
import ReorderModal from 'commerce_my_account/reorderModal';
import type { PageReference } from 'types/common';
import type { LightningNavigationContext } from 'types/common';
import { NavigationContext, generateUrl, navigate } from 'lightning/navigation';
import { finishReorder } from 'commerce/orderApiInternal';

export const MODAL_SIZE = 'small';

const CART_PAGE_REF: PageReference = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Current_Cart',
    },
};

export default class ReorderButton extends LightningElement {
    static renderMode = 'light';

    /**
     * @description The unique identifier of order summary
     * @type {string}
     */
    @api orderSummaryId: string | undefined;

    /**
     * @description Button variant
     * @type {ButtonVariant | undefined}
     */
    @api variant: ButtonVariant | undefined;

    /**
     * @description Button size
     * @type {ButtonSize | undefined}
     */
    @api size: ButtonSize | undefined;

    /**
     * @description Button width
     * @type {ButtonWidth | undefined}
     */
    @api width: ButtonWidth | undefined;

    /**
     * @description Button alignment on the page
     * @type {ButtonAlignment | undefined}
     */
    @api alignment: ButtonAlignment | undefined;

    /**
     * @description Button text
     * @type {string | undefined}
     */
    @api buttonText: string | undefined;

    /**
     * URL for View Cart button in modal
     * @private
     * @type {string}
     */
    _cartUrl: string | undefined;

    _navContext: LightningNavigationContext | undefined;

    @wire(NavigationContext)
    navigationContextHandler(navContext: LightningNavigationContext): void {
        this._cartUrl = generateUrl(navContext, CART_PAGE_REF);
        this._navContext = navContext;
    }

    handleViewCart(): void {
        navigate(<LightningNavigationContext>this._navContext, CART_PAGE_REF);
    }

    /**
     * @description Opens the ReorderModal
     */
    async handleReorder(): Promise<void> {
        await ReorderModal.open({
            size: MODAL_SIZE,
            orderSummaryId: this.orderSummaryId,
            cartUrl: this._cartUrl,
            onviewcart: () => {
                this.handleViewCart();
            },
        });
        await finishReorder();
    }
}
