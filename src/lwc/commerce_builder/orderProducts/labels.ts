import genericErrorMessageLabel from '@salesforce/label/B2B_Buyer_Orders.genericErrorMessage';
import StockKeepingUnit from '@salesforce/label/udd_OrderItemSummary.StockKeepingUnit';
import Quantity from '@salesforce/label/udd_OrderItemSummary.Quantity';
import TotalLineAdjustmentAmount from '@salesforce/label/udd_OrderItemSummary.TotalLineAdjustmentAmount';
import AdjustedLineAmount from '@salesforce/label/udd_OrderItemSummary.AdjustedLineAmount';
import Name from '@salesforce/label/udd_OrderDeliveryMethod.Name';
import TotalLineAmount from '@salesforce/label/udd_OrderDeliveryGroupSummary.TotalLineAmount';

export {
    /**
     * Label for the order delivery group data fetch error, in the form of "Something went wrong. Refresh the page or contact us for assistance"
     *
     * @type {String}
     */
    genericErrorMessageLabel,
    /**
     * Label for Order Item Summary StockKeepingUnit, in the form of "Product Sku".
     *
     * @type {string}
     */
    StockKeepingUnit,
    /**
     * Label for Order Item Summary Quantity, in the form of "Quantity".
     *
     * @type {string}
     */
    Quantity,
    /**
     * Label for Total Adjustments applied to a line item, in the form of "Adjusted Line Subtotal".
     *
     * @type {string}
     */
    TotalLineAdjustmentAmount,
    /**
     * Label for total line amount after adjustments are applied to a line, in the form of "Line Adjustments".
     *
     * @type {string}
     */
    AdjustedLineAmount,
    /**
     * Label for name of order delivery method, in the form of "Name".
     *
     * @type {string}
     */
    Name,
    /**
     * Label for shipping subtotal of order delivery group, in the form of "Subtotal".
     *
     * @type {string}
     */
    TotalLineAmount,
};
