import { LightningElement, api } from 'lwc';
import type { CheckoutStep } from 'types/unified_checkout';

export default class MultiPaymentAccordionSection extends LightningElement {
    private _paymentComponent!: CheckoutStep;

    /**
     * Expand or collapse payment section/option
     * @private
     */
    @api isExpanded = false;

    /**
     * This section name
     */
    @api public sectionName: string | undefined;

    /**
     * This section name to be displayed
     */
    @api public sectionLabel: string | undefined;

    @api public get paymentComponent(): CheckoutStep {
        return <CheckoutStep>this._paymentComponent;
    }

    /**
     * Register the payment component on the slot change event.
     *
     * @param event Event slot change event object
     */
    private handleSlotChange(event: Event): void {
        // The direct child nodes added to the slot
        const target = event?.target as HTMLSlotElement;
        const components = target?.assignedNodes() as unknown as CheckoutStep[];
        // Register the payment component;
        this._paymentComponent = components[0] as unknown as CheckoutStep;
    }

    /**
     * Handle accordion section button click event.
     */
    private handleSelectSection(): void {
        this.dispatchEvent(
            new CustomEvent('sectionselected', {
                bubbles: true,
                composed: false,
                detail: {
                    name: this.sectionName,
                },
            })
        );
    }
}
