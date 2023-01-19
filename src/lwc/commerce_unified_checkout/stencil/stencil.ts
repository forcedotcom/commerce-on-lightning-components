import { api, LightningElement } from 'lwc';

import defaultStencil from './stencilTemplates/defaultStencil.html';
import shippingAddress from './stencilTemplates/shippingAddress.html';
import shippingAddressPicker from './stencilTemplates/shippingAddressPicker.html';
import shippingMethod from './stencilTemplates/shippingMethod.html';
import payment from './stencilTemplates/payment.html';
import { StencilType } from './stencilType';
export { StencilType }; // module re-export

const COUNT_DEFAULTS = {
    item: 5,
};

export default class Stencil extends LightningElement {
    public static renderMode = 'light';
    private _type = StencilType.DEFAULT_STENCIL;
    private _itemCount = COUNT_DEFAULTS.item;

    /**
     * Get and set the type of the stencil to be displayed.
     */
    @api public stencilType = StencilType.DEFAULT_STENCIL;

    /**
     * Sets the number of items to be dispalyed in the stencil.
     */
    @api
    public set itemCount(value: number) {
        this._itemCount = Math.floor(value);
    }

    /**
     * Gets the number of items dispalyed in the stencil.
     */
    public get itemCount(): number {
        return this._itemCount;
    }

    private get items(): { key: string }[] {
        return this.createArrayFromCount(this._itemCount);
    }

    /**
     * Creates an array of items with unique keys
     */
    private createArrayFromCount(count: number): { key: string }[] {
        return new Array(count).fill(null).map((element, index) => {
            return {
                key: this.generateKey(index),
            };
        });
    }

    private generateKey(index: number): string {
        return this.stencilType + '-' + index;
    }

    render(): HTMLElement {
        if (this.stencilType === StencilType.SHIPPING_ADDRESS) {
            return shippingAddress;
        } else if (this.stencilType === StencilType.SHIPPING_ADDRESS_PICKER) {
            return shippingAddressPicker;
        } else if (this.stencilType === StencilType.SHIPPING_METHOD) {
            return shippingMethod;
        } else if (this.stencilType === StencilType.PAYMENT) {
            return payment;
        }
        return defaultStencil;
    }
}
