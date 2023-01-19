import startDate from '@salesforce/label/B2B_Buyer_Orders.startDate';
import endDate from '@salesforce/label/B2B_Buyer_Orders.endDate';
import apply from '@salesforce/label/B2B_Buyer_Orders.apply';
import reset from '@salesforce/label/B2B_Buyer_Orders.reset';
import dateValidationError from '@salesforce/label/B2B_Buyer_Orders.dateValidationError';

export default {
    /**
     * Label for the start date "Start Date"
     *
     * @type {string}
     */
    startDate,
    /**
     * Label for the end date "End Date"
     *
     * @type {string}
     */
    endDate,
    /**
     * Label for the apply button "Apply"
     *
     * @type {string}
     */
    apply,
    /**
     * Label for the reset button "Reset"
     *
     * @type {string}
     */
    reset,
    /**
     * Label for the date validation error "invalid date"
     *
     * @type {string}
     */
    dateValidationError,
};
