import { api, LightningElement } from 'lwc';

const DEFAULT_ITEM_COUNT = 3;

export default class ProductStencil extends LightningElement {
    public static renderMode = 'light';
    private _itemCount = DEFAULT_ITEM_COUNT;

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
        return this.createArrayFromCount(this.itemCount);
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
        return `stencil-${index}`;
    }
}
