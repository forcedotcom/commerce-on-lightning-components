import { LightningElement, wire, api } from 'lwc';
import { navigate, NavigationContext, generateUrl } from 'lightning/navigation';
import { CartSummaryAdapter } from 'commerce/cartApi';

import { getIconPath } from 'lightning/iconUtils';
import generateLabel from './textGenerator';
import badgeLabelGenerator from './badgeLabelGenerator';

import { DEFAULTS, MAX_CART_ITEMS_COUNT } from './constants';

import type { LightningNavigationContext } from 'types/common';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type { CountType } from './types';
export type { CountType } from './types';

/**
 * A UI control to display the cart badge.
 */
export default class Badge extends LightningElement {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    public static renderMode = 'light';

    /**
     * @description Determines if the cart count should be shown, regardless of the amount in the cart
     */
    @api showCount = false;

    /**
     * @description Icon color
     */
    @api iconLinkColor: string | undefined;

    /**
     * @description Icon hover/focus color
     */
    @api iconLinkHoverColor: string | undefined;

    /**
     * @description The type of count to be displayed
     * Supported values are "Total" and "Unique".
     * Total: total number of items in the cart
     * Unique: Number of unique products in the cart
     *
     */
    @api countType: CountType | undefined | null;

    /**
     * @description Cart Icon url
     */
    iconUrl = getIconPath('utility:cart');

    /**
     * @description Total number of items/products in the cart.
     * @type {(number | undefined)}
     */
    get _totalCartCount(): number {
        return this.cartSummary?.data
            ? this.setTotalCartCount(this.countType, this.cartSummary.data)
            : DEFAULTS.totalCartCount;
    }

    /**
     * @description Gets whether the cart has any items (i.e. a non-zero item count).
     * @readonly
     */
    get hasItems(): boolean {
        return this._totalCartCount > 0;
    }

    /**
     * @description Gets whether or not we should show the notification badge
     * @readonly
     */
    get showBadge(): boolean {
        return this.showCount && this.hasItems;
    }

    /**
     * @description The label for the cart header, in the form of "Cart: {0} items / Cart: {0} product types"
     * @readonly
     * @returns {string} The text description of the number of items in the cart.
     */
    get iconAssistiveText(): string | undefined {
        return generateLabel(this.countType, this._totalCartCount);
    }

    /**
     * @description Gets the total number of items or product types in the cart to be displayed in the cart badge.
     *
     * @returns {string}
     * The total number of items or product types in the cart.
     * If total number is greater than 999 (MAX_CART_ITEMS_COUNT), returns '999+'
     */
    get badgeItemsCount(): string | undefined {
        return badgeLabelGenerator(this._totalCartCount, MAX_CART_ITEMS_COUNT);
    }

    /**
     * @description Custom style options for the icon
     * @readonly
     */
    get customStyles(): string {
        return `
            --com-c-unified-cart-badge-link-color: ${this.iconLinkColor || 'initial'};
            --com-c-unified-cart-badge-link-color-hover: ${this.iconLinkHoverColor || 'initial'};
        `;
    }

    @wire(NavigationContext)
    navContext!: LightningNavigationContext;

    /**
     * Retrieves the information for the current cart
     * @param {string}
     */
    @wire(CartSummaryAdapter)
    cartSummary: StoreAdapterCallbackEntry<Record<string, unknown>> | undefined;

    /**
     * @description Based on the type of count to be shown, retrieves the correct value and converts to a number if needed
     * If the value cannot be converted to a number, then 0 is returned.
     * @param {CountType | undefined | null} countType
     * @param {Record<string, unknown>} data response from CartSummaryAdapter
     * @return {number} Cart count
     * @memberof Badge
     */
    setTotalCartCount(countType: CountType | undefined | null, data: Record<string, unknown>): number {
        let total = 0;
        if (countType === 'Total') {
            total = Number(data.totalProductCount);
        } else if (countType === 'Unique') {
            total = Number(data.uniqueProductCount);
        }

        if (isNaN(total)) {
            total = 0;
        }

        return total;
    }
    /**
     * @description Navigates to the cart page on button click.
     */
    handleCartButtonIconClick(): void {
        navigate(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Current_Cart',
            },
        });
    }

    /**
     * @description Relative url for the active cart
     * @private
     */
    _cartPageUrl = '';

    connectedCallback(): void {
        this._cartPageUrl = generateUrl(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Current_Cart',
            },
        });
    }
}
