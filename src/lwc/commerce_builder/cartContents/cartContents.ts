import { LightningElement, api } from 'lwc';
import { spinnerText } from './labels';

import { DataProviderActionEvent } from 'experience/dataProvider';
import isPreviewMode from '@app/isPreviewMode';

import type { CartItemData } from 'commerce_data_provider/cartDataProvider';

const DP_CHANGE_SORT_ORDER = 'cart:changeSortOrder';
const DP_CLEAR = 'cart:clear';
export default class CartContents extends LightningElement {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    public static renderMode = 'light';

    protected _items: CartItemData[] | undefined;
    /**
     * @description List of cart items as provided from the data provider;
     */
    @api get items(): CartItemData[] | undefined {
        return this._items;
    }

    set items(value: CartItemData[] | undefined) {
        if (value === undefined) {
            this.isLoadingData = true;
        } else if (!this.actionProcessing) {
            this.isLoadingData = false;
        }

        this._items = value;
    }

    /**
     * @description Empty state is shown if we are in the builder, or if the count is zero
     * Note: The use of isPreviewMode is part of a temporary workaround while we wait for this bugfix: W-11279690.
     * Any session context usage will be removed once the bug is fixed and we add back
     * the design substitute, work that is tracked in W-11613971.
     * @readonly
     */
    get showEmptyState(): boolean {
        return isPreviewMode || (Array.isArray(this.items) && !this.items.length);
    }

    /**
     * @description
     * @readonly
     */
    get showIntermediateState(): boolean {
        return isPreviewMode || !this.items;
    }

    /**
     * @description Items state is shown if we are in the builder, or if the count is not zero
     * Note: The use of isPreviewMode is part of a temporary workaround while we wait for this bugfix: W-11279690.
     * Any session context usage will be removed once the bug is fixed and we add back
     * the design substitute, work that is tracked in W-11613971.
     * @readonly
     */
    get showItemState(): boolean {
        return isPreviewMode || (Array.isArray(this.items) && !!this.items.length);
    }

    labels = {
        spinnerText,
    };

    /**
     * @description Should the spinner be shown.
     * @protected
     */
    protected isLoadingData = true;

    /**
     * @description This is true while we are waiting for an action to complete.
     * We need both `isLoadingData` and `processingAction` because the wire adapter may return a value
     * before and after the action has completed.  Both need to be false to hide the spinner.
     * @protected
     */
    protected actionProcessing = false;

    /**
     * @description Handle the 'cartclear' event and fire the appropriate action to the data provider
     */
    handleCartClear(): void {
        this.actionProcessing = true;
        this.dispatchEvent(
            new DataProviderActionEvent(DP_CLEAR, undefined, {
                onSuccess: (): void => {
                    this.actionProcessing = false;
                    this.isLoadingData = false;
                },
                onError: (): void => {
                    this.actionProcessing = false;
                    this.isLoadingData = false;
                },
            })
        );
    }

    /**
     * @description This value gets passed down from cart contents.  the instance of this
     * component is reset after sorting is changed, so it won't remember what the combobox value should be
     */
    sortOrder: string | undefined;
    /**
     * @description Handle the 'cartchangesortorder', which is triggered when a sort option is
     * selected. Then fires the 'cart:changeSortOrder' action to the data provider
     * @fires CartContents#cart:changeSortOrder
     */
    handleCartChangeSortOrder(event: CustomEvent): void {
        this.sortOrder = event.detail;
        this.dispatchEvent(new DataProviderActionEvent(DP_CHANGE_SORT_ORDER, this.sortOrder));
    }

    handleCartActionProcessing(event: CustomEvent): void {
        const { processing, loadingData } = event.detail;

        if (processing) {
            this.isLoadingData = true;
        }

        if (loadingData !== undefined) {
            this.isLoadingData = loadingData;
        }

        this.actionProcessing = processing;
    }
}
