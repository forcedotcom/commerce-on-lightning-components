import { LightningElement, api } from 'lwc';
import type { OrderAction } from 'commerce_my_account/orders';

export { startReorderAssistiveText } from './labels';

/**
 * @description Display salesforce actions that can be performed on a order
 * @fires OrderLineItem#<Action.eventName>
 */
export default class OrderLineItemActionContainer extends LightningElement {
    static renderMode = 'light';

    /**
     * An event that gets triggered when user clicks on an action. The even will bubble up and propagate across the shadow DOM boundary into the standard DOM.
     *
     *
     * Properties:
     *   - bubbles: true
     *   - composed: true
     *
     * @event <Action.eventName>
     * @type {CustomEvent}
     *
     */

    /**
     * @description Unique identifier of a order.
     */
    @api orderId?: string | null;

    /**
     * @description An array of Actions
     */
    @api actions?: OrderAction[] | null;

    /**
     * @description Text for link which will redirect to order detail page.
     */
    @api detailsLabel?: string | null;

    @api viewDetailLinkAssistiveText?: string;

    /**
     * @description Gets the list of CSS classes for order actions
     */
    get _orderActionsClasses(): string {
        return this._showDetailsLabel ? 'slds-m-bottom_medium' : '';
    }

    /**
     * @description Whether or not to show the actions
     */
    get _showActions(): boolean {
        return !!(this.actions || []).length && this.hasOrderId();
    }

    /**
     * @description Whether or not to show the detailsLabel
     */
    get _showDetailsLabel(): boolean {
        return !!(this.detailsLabel || '').length && this.hasOrderId();
    }

    /**
     * @description whether or not order id is empty.
     */
    hasOrderId(): boolean {
        return !!(this.orderId || '').length;
    }

    /**
     * @description handler for the event fired from action item.
     */
    handleAction(event: CustomEvent): void {
        const eventName = event.detail.name;
        this.dispatchEvent(
            new CustomEvent(eventName, {
                bubbles: true,
                composed: true,
                detail: {
                    orderId: this.orderId,
                },
            })
        );
    }
}
