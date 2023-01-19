import { LightningElement, api } from 'lwc';

import type { ProductCountType } from './types';
import type { CountType } from 'commerce_cart/badge';

export default class CartBadge extends LightningElement {
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
     * @description Indicates whether to show the total items in the cart, or the number of unique items
     */
    @api countType: ProductCountType | undefined;
    get _countType(): CountType | undefined {
        return this.countType === 'UniqueProductCount' ? 'Unique' : 'Total';
    }
}
