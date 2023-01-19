import { LightningElement, api } from 'lwc';
import labels from './labels';

/**
 * The display for the apply coupon button.
 */
export default class ApplyButton extends LightningElement {
    private static renderMode = 'light';
    /**
     * Gets or sets whether the button is disabled.
     *
     * @type {boolean}
     */
    @api
    public disabled = false;

    /**
     * Gets or sets the apply coupon button text.
     *
     * @type {string}
     */
    @api
    public text: string | undefined;

    /**
     * Gets the available labels.
     *
     * @type {Object}
     *
     * @readonly
     * @private
     */
    private get labels(): Record<string, string> {
        return labels;
    }
}
