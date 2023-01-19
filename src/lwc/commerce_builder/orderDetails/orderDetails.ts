import { LightningElement, api } from 'lwc';
import type { InputField } from 'commerce_my_account/orderDetails';
import { getDefaultFields } from './orderDetailsPreprocessor';
export { getDefaultFields } from './orderDetailsPreprocessor';

export default class OrderDetails extends LightningElement {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light';
    /**
     * @description The unique identifier for order summary record
     */
    @api orderSummaryId?: string;
    /**
     * @description The stringified, unparsed JSON string of the orderSummary field mapping attribute
     */
    @api public orderSummaryHighlightsFieldMapping?: string;

    /**
     * @description Title of Order Summary Highlights card
     */
    @api public highlightsTitle?: string;

    /**
     * @description Background color of Highlights card
     */
    @api public highlightsCardBackgroundColor?: string;

    /**
     * @description Border color of Highlights card
     */
    @api public highlightsCardBorderColor?: string;

    /**
     * @description Text color in Highlights card
     */
    @api public highlightsCardTextColor?: string;

    /**
     * @description Border Radius Highlights card
     */
    @api public highlightsCardBorderRadius?: string;

    private get _orderSummaryFields(): InputField[] {
        return this.orderSummaryHighlightsFieldMapping
            ? JSON.parse(this.orderSummaryHighlightsFieldMapping)
            : getDefaultFields();
    }
}
