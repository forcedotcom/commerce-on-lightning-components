import { LightningElement, api } from 'lwc';
import type { AppliedPromotion, InternalAppliedPromotion } from './types';
export type { AppliedPromotion, InternalAppliedPromotion } from './types';
import { transformPromotions } from './transformPromotions';
/**
 * A UI control to view applied promotions details popover.
 *
 */
export default class AppliedDetailsPopover extends LightningElement {
    static renderMode = 'light';
    /**
     * Gets or sets the popover header label.
     */
    @api
    headerLabel: string | undefined;

    /**
     * Gets or sets the popover terms and conditions title text.
     */
    @api
    termsAndConditionsTitleText: string | undefined;

    /**
     * The ISO 4217 currency code for displayed prices
     */
    @api
    currencyCode: string | undefined;

    /**
     * The list of applied promotions.
     *
     */
    @api
    appliedPromotions: AppliedPromotion[] | undefined;

    /**
     * Gets or sets the assistive text of the close button.
     */
    @api
    closeButtonAssistiveText: string | undefined;

    /**
     * Gets or sets the assistive text of the savings info icon.
     */
    @api
    savingsInfoBubbleAssistiveText: string | undefined;

    /**
     * Gets whether the applied promotions list is non-empty.
     *
     */
    get hasAppliedPromotions(): boolean {
        // If the applied promotions are a non-empty array (not undefined or null), we know we have promotions.
        return Array.isArray(this.appliedPromotions) && this.appliedPromotions.length > 0;
    }

    /**
     * Whether or not to show the savings info icon.
     */
    get showSavingsInfoIcon(): boolean {
        return Boolean(this.hasAppliedPromotions);
    }

    /**
     * Gets the normalized, displayable applied promotions.
     */
    get displayableAppliedPromotions(): InternalAppliedPromotion[] {
        const promotions = this.appliedPromotions || [];
        // Add a squinch more information to each item via this getter.
        return transformPromotions(promotions, this.currencyCode);
    }

    /**
     * Gets the `lightning-popup-source` element.
     */
    get popover(): HTMLFormElement | null {
        return this.querySelector('lightning-popup-source');
    }

    /**
     *  Opens lighting-popup-source with the content
     *  alignment:: to the bottom
     *  autoFlip:: to false as we do always autoalign to the bottom.
     *  size:: of the popover to medium
     * ( Eventhough with size:medium/autoFlip:false the pop-over-source components is not mobile friendly. The reason we went because we do
     *   want to display more content so we do have to size up.
     *   And the base components team plans to come up with a different approach for mobile view by altogether using a different component.
     *   Yet to be finalized. )
     *
     * ** June 19,'22 changed the size to small as it is completely not mobile friendly.
     * **
     */
    openPopover(): void {
        this.popover?.open({
            alignment: 'bottom',
            autoFlip: false,
            size: 'small',
        });
    }

    /**
     * Closes lighting-pop-source
     */
    closePopover(): void {
        this.popover?.close();
    }

    /**
     * Handler for the 'savings button' & 'savings icon' click.
     */
    handleClickAction(): void {
        // Open the popover only if there are any applied promotions.
        if (this.hasAppliedPromotions) {
            this.openPopover();
        }
    }
}
