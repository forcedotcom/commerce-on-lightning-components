import filterDate from '@salesforce/label/B2B_Buyer_Orders.filterDate';
import sortByNewToOld from '@salesforce/label/B2B_Buyer_Orders.sortByNewToOld';
import sortByOldToNew from '@salesforce/label/B2B_Buyer_Orders.sortByOldToNew';
import Name from '@salesforce/label/udd_OrderSummary.Name';
import OrderedDate from '@salesforce/label/udd_OrderSummary.OrderedDate';
import Status from '@salesforce/label/udd_OrderSummary.Status';
import GrandTotalAmount from '@salesforce/label/udd_OrderSummary.GrandTotalAmount';
import needAccountIdLabel from '@salesforce/label/B2B_Buyer_Orders.needAccountId';
import genericErrorMessage from '@salesforce/label/B2B_Buyer_Orders.genericErrorMessage';
import startReorderAssistiveText from '@salesforce/label/B2B_Buyer_Orders.startReorderAssistiveText';

export {
    /**
     * Label for the filter date "Filter by date:"
     *
     * @type {string}
     */
    filterDate,
    /**
     * Label for sortByNewToOld: "Sort items by most recent order"
     *
     * @type {string}
     */
    sortByNewToOld,
    /**
     * Label for sortByOldToNew: "Sort items by oldest order"
     *
     * @type {string}
     */
    sortByOldToNew,
    /**
     * Label for Order Summary Name
     *
     * @type {string}
     */
    Name,
    /**
     * Label for Order Summary OrderedDate
     *
     * @type {string}
     */
    OrderedDate,
    /**
     * Label for Order Summary Status
     *
     * @type {string}
     */
    Status,
    /**
     * Label for Order Summary GrandTotalAmount
     *
     * @type {string}
     */
    GrandTotalAmount,
    /**
     * Label for valid account id
     *
     * @type {string}
     */
    needAccountIdLabel,
    /**
     * Label for generic error message
     *
     * @type {string}
     */
    genericErrorMessage,
    /**
     * "Start reorder for {orderNumber}."
     *
     * @type {string}
     */
    startReorderAssistiveText,
};
