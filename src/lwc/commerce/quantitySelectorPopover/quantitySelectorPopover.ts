import { LightningElement, api } from 'lwc';
import type PopupSource from 'lightning/popupSource';
import { closeButtonText, quantityHelpLabel } from './labels';

export default class QuantitySelectorPopover extends LightningElement {
    static renderMode = 'light';
    /**
     * Gets or sets the Minimum Text
     * @type {string}
     */
    @api
    minimumText?: string;

    /**
     * Gets or sets the Maximum Text
     * @type {string}
     */
    @api
    maximumText?: string;

    @api
    incrementText?: string;

    /**
     *  Opens lighting-popup-source.
     *  Alignment should always be on top,
     *  Do not flip as we always want popover to be on top.
     * @private
     */
    openPopup(): void {
        this.popup?.open({
            alignment: 'top',
            autoFlip: true,
            size: 'small',
        });
    }

    /**
     * Closes lighting-pop-source
     * @private
     */
    closePopup(): void {
        this.popup?.close();
    }

    /**
     * Gets the popup-source
     * @returns {String}
     * @readonly
     * @private
     */
    get popup(): (PopupSource & HTMLElement) | null {
        return this.querySelector('lightning-popup-source');
    }

    /**
     * Show Increment text
     * @type {boolean}
     *
     * @readonly
     * @private
     */
    get showIncrementText(): boolean {
        return this.isNonEmptyText(this.incrementText);
    }

    /**
     * Show Maximum text
     * @type {boolean}
     *
     * @readonly
     * @private
     */
    get showMaxText(): boolean {
        return this.isNonEmptyText(this.maximumText);
    }

    /**
     * Show Minimum text
     * @type {boolean}
     *
     * @readonly
     * @private
     */
    get showMinText(): boolean {
        return this.isNonEmptyText(this.minimumText);
    }

    /**
     * Gets the i18n labels to display in the template
     * @type {object}
     *
     * @readonly
     * @private
     */
    get i18n(): {
        closeButtonText: string;
        quantityHelpLabel: string;
    } {
        return {
            closeButtonText,
            quantityHelpLabel,
        };
    }

    /**
     * Utility function if text is "not empty", "not null" or "not undefined"
     * @param text
     * @type {string | undefined}
     * @returns {boolean}
     * **/
    isNonEmptyText(text: string | undefined): boolean {
        return Boolean(text?.length);
    }
}
