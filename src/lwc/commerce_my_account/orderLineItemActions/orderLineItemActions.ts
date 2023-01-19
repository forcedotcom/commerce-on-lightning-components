import { LightningElement, api } from 'lwc';
import type { OrderAction } from 'commerce_my_account/orders';

/**
 * @description Represent an Action that can be performed on a Order
 * @fires OrderLineItemActions#actionselected
 */
export default class OrderLineItemActions extends LightningElement {
    static renderMode = 'light';

    /**
     * @description An array of Order Actions
     */
    @api actions?: OrderAction[];

    /**
     * @description An array of Actions
     */
    get _actions(): OrderAction[] {
        return this.actions || [];
    }

    /**
     * @description handler for the event fired from action item.
     */
    handleAction(event: Event): void {
        this.dispatchEvent(
            new CustomEvent('actionselected', {
                detail: {
                    name: (<HTMLButtonElement>event.currentTarget).dataset.event,
                },
            })
        );
    }
}
