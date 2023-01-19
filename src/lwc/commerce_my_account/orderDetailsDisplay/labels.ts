/*
 * Copyright 2022 salesforce.com, inc.
 * All Rights Reserved
 * Company Confidential
 */

import spinnerText from '@salesforce/label/B2B_Buyer_Orders.spinnerText';
import noDataAvailableText from '@salesforce/label/B2B_Buyer_Orders.noDataAvailableText';
import keyValueSeparatorWithSpace from '@salesforce/label/B2B_Buyer_Orders.keyValueSeparatorWithSpace';
import genericErrorMessage from '@salesforce/label/B2B_Buyer_Orders.genericErrorMessage';

export default {
    /**
     * Label for the spinner text like "Data Loading.."
     * @type {string}
     *
     */
    spinnerText,
    /**
     * Message to display when there is no data to render like "There's no data to preview."
     * @type {string}
     *
     */
    noDataAvailableText,
    /**
     * A label of the form ": ".
     * @type {string}
     */
    keyValueSeparatorWithSpace,
    /**
     * Generic error message to display in case of wire api error like "Something went wrong. Refresh the page or contact us for assistance."
     * @type {string}
     */
    genericErrorMessage,
};
