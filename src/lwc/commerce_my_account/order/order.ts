import { LightningElement, api } from 'lwc';
import { classSet } from 'lightning/utils';
import type { OrderData, OrderAction } from 'commerce_my_account/orders';
import { detailsAssistiveText } from './labels';

const DEFAULT_COLUMN = 1;
type DIRECTION = 'up' | 'down';

/**
 * @description Display a salesforce order along with the actions that can be performed on this order
 * @fires Order#<Action.eventName>
 * @fires Order#shiftfocus
 */
export default class Order extends LightningElement {
    static renderMode = 'light';

    /**
     * @description A order representation
     */
    @api order?: OrderData | null;

    /**
     * @description An array of actions that can be performed on a order
     */
    @api actions?: OrderAction[] | null;

    /**
     * @description Number of columns in which The order's fields will be rendered.
     */
    @api columns: number | undefined;

    /**
     * @description Text for link which will redirect to order detail page.
     */
    @api detailsLabel?: string;

    /**
     * Put the focus on the given cellId.
     */
    @api focusCell(cellId: string): void {
        (<HTMLElement | null>this.querySelector(`[data-cell-id='${cellId}']`))?.focus();
    }

    /**
     *  Tabindex for fields. This attribute must be set to 0 or -1
     */
    @api fieldsetTabIndex: number | undefined;

    /**
     * @description Return Normalised column value
     */
    get _normalisedColumn(): number {
        return this.columns !== undefined ? this.columns : DEFAULT_COLUMN;
    }

    /**
     * @description Return Normalised Tabindex for fields.
     */
    get _normalisedFieldsetTabIndex(): number {
        return this.fieldsetTabIndex !== undefined ? this.fieldsetTabIndex : -1;
    }

    /**
     * Whether or not to show the order's fields
     */
    get _showFields(): boolean {
        return !!(this.order?.fields || []).length;
    }

    /**
     * Whether or not to show the actions
     */
    get _showActions(): boolean {
        return !!(this.actions || []).length && this.hasOrderId();
    }

    /**
     * Whether or not to show the detailsLabel
     */
    get _showDetailsLabel(): boolean {
        return !!(this.detailsLabel || []).length && this.hasOrderId();
    }

    /**
     * Gets the list of CSS classes
     */
    get _rowclasses(): string {
        return classSet('slds-box slds-grid slds-grid_align-spread slds-align-middle slds-m-bottom_small')
            .add({
                'small-region': this.isSmallRegion(),
            })
            .toString();
    }

    /**
     * Gets the list of CSS classes for field container
     */
    get _fieldsclasses(): string {
        return classSet()
            .add({
                'field-ctn': !this.isSmallRegion() && this._hasActions,
                'field-ctn_max': this.isSmallRegion() || !this._hasActions,
            })
            .toString();
    }

    /**
     * Gets the list of CSS classes for action container
     */
    get _actionsclasses(): string {
        return classSet('slds-grid small-region')
            .add({
                'slds-align-middle width_20': !this.isSmallRegion(),
            })
            .toString();
    }

    /**
     * Whether or not display action container
     */
    get _hasActions(): boolean {
        return this._showDetailsLabel || this._showActions;
    }

    /**
     * Aria role for field's info  and actions
     */
    get _ariaRoleForFieldInfoAndAction(): string {
        return this._normalisedColumn > 1 ? 'gridcell' : 'presentation';
    }

    /**
     * @description Creates aria label text.
     */
    get viewDetailLinkAssistiveText(): string {
        return detailsAssistiveText.replace('{orderNumber}', <string>this.order?.orderNumber);
    }

    /**
     * @description Return an array of Order Actions
     */
    get _actions(): OrderAction[] {
        return (this.actions || []).map((action, index) => {
            const updatedField = {
                ...action,
                id: index,
                assistiveText: action.assistiveText.replace('{orderNumber}', <string>this.order?.orderNumber),
            };
            return updatedField;
        });
    }

    /**
     * Whether or not display field's container and action container in one column.
     */
    isSmallRegion(): boolean {
        return this._normalisedColumn < 2;
    }

    /**
     * whether or not order object contain non empty id.
     */
    hasOrderId(): boolean {
        return !!(this.order?.id || []).length;
    }

    /**
     * handler for the event fired from key down.
     */
    handleKeyDown(event: KeyboardEvent): void {
        const key = event.key;
        const cellId = (<HTMLElement>event.currentTarget)?.dataset.cellId;
        switch (key) {
            case 'ArrowUp':
                if (cellId) {
                    this.shiftFocusVerticly(cellId, 'up');
                }
                break;
            case 'ArrowDown':
                if (cellId) {
                    this.shiftFocusVerticly(cellId, 'down');
                }
                break;
            case 'ArrowRight':
                (<HTMLElement | null>this.querySelector("[data-cell-id='actions']"))?.focus();
                break;
            case 'ArrowLeft':
                (<HTMLElement | null>this.querySelector("[data-cell-id='orderInfo']"))?.focus();
                break;
            default:
                break;
        }
    }

    /**
     * Triggers a custom event with details about current cell and direction towards which the shift is requested.
     *
     * @fires #shiftfocus
     */
    shiftFocusVerticly(cell: string, direction: DIRECTION): void {
        this.dispatchEvent(
            new CustomEvent('shiftfocus', {
                detail: {
                    cell,
                    direction,
                },
            })
        );
    }
}
