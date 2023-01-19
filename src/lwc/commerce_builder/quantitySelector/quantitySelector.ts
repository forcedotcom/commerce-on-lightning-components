import { api, LightningElement } from 'lwc';
import { DataProviderActionEvent } from 'experience/dataProvider';
import type { QuantityChangedActionPayload } from 'commerce_data_provider/shared';

/**
 * The QuantitySelector component is a common component that can be used on all pages to show a number input field
 * optionally with quantity rules and +/- buttons.
 *
 * Parameters:
 *  minimum - The minimal allowed value
 *  maximum - The maximum allowed value
 *  step - The allowed increments
 *
 *  hideLabel - boolean to hide the label for the inout field
 *  hideButtons - boolean to hide the +/- buttons
 *
 *  label - The label for the input field
 *  minimumValueGuideText - text that shows up in a quantity rules popover; takes '{minimum}' as a replaceable parameter
 *  maximumValueGuideText - text that shows up in a quantity rules popover; takes '{maximum}' as a replaceable parameter
 *  stepValueGuideText - text that shows up in a quantity rules popover; takes '{step}' as a replaceable parameter
 *
 * Events:
 *  dispatches
 *      DataProviderActionEvent<QuantityChangedActionPayload>('commerce:quantityChanged', {
 *          last: number,
 *          isValid: boolean,
 *          reason?: string,
 *          currentValue: number,
 *          entered?: number
 *      })
 */
export default class QuantitySelector extends LightningElement {
    public static renderMode = 'light';

    @api
    minimum?: string;

    @api
    maximum?: string;

    @api
    step?: string;

    @api
    hideLabel = false;

    @api
    hideButtons = false;

    @api
    disabled = false;

    @api
    label?: string;

    @api
    minimumValueGuideText?: string;

    @api
    maximumValueGuideText?: string;

    @api
    stepValueGuideText?: string;

    handleQuantityChanged({ detail }: CustomEvent): void {
        if (detail) {
            this.dispatchEvent(
                new DataProviderActionEvent<QuantityChangedActionPayload>('commerce:quantityChanged', {
                    last: detail.last,
                    isValid: detail.isValid,
                    reason: detail.reason,
                    currentValue: detail.currentValue,
                    entered: detail.entered,
                })
            );
        }
    }
}
