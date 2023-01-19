import { LightningElement, api } from 'lwc';
import { classSet } from 'lightning/utils';
import labels from './labels';
import type { DateSummary } from './types';
/**
 * Display Start and End date filter.
 * @fires DateFilter#applydatefilter
 * @fires DateFilter#resetdatefilter
 */
export default class DateFilter extends LightningElement {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light';

    /**
     * This event can bubble up through the DOM
     *
     * Properties:
     *	 - bubbles:true
     *   - composed: true
     *   - detail.startDate
     *   - detail.endDate
     *
     * @event DateFilter#applydatefilter
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * This event can bubble up through the DOM
     *
     * Properties:
     *	 - bubbles:true
     *   - composed: true
     *
     * @event DateFilter#resetdatefilter
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * Text to show along with filtering options
     */
    @api filterText: string | null | undefined;

    /**
     * The Start Date. User's Salesforce locale setting determines the date format accepted for a date you type in the text field
     */
    @api startDate: string | null | undefined;

    /**
     * The End Date. User's Salesforce locale setting determines the date format accepted for a date you type in the text field
     */
    @api endDate: string | null | undefined;

    /**
     * Gets the required i18n labels
     */
    get _labels(): Record<string, string> {
        return labels;
    }

    /**
     * true if start date is greater than end date.
     */
    _error = false;

    /**
     * true if any of the date is updated.
     */
    _dateUpdated = true;

    /**
     * handler for on change event fired from date pickers.
     */
    handleDateChange(): void {
        this._dateUpdated = true;
        this._error = !this.computeDateSummary().isValid;
    }

    /**
     * if true disable apply button
     */
    get _disableButton(): boolean {
        return !this._dateUpdated || this._error;
    }

    /**
     * true if start date is greater than end date.
     */
    get _hasError(): boolean {
        return this._error;
    }

    /**
     * Compare start date and end date and return this result along with both start and end dates.
     */
    computeDateSummary(): DateSummary {
        const startDate = (<HTMLInputElement>this.querySelector('[data-id="start-date"]')).value;
        const endDate = (<HTMLInputElement>this.querySelector('[data-id="end-date"]')).value;
        let isValid = true;
        if (startDate && endDate) {
            isValid = startDate <= endDate;
        }
        return { isValid, startDate, endDate };
    }

    /**
     * Gets the CSS classes for date picker
     */
    get _datePickerClasses(): string {
        return classSet('slds-m-right_small')
            .add({
                'slds-has-error': this._error,
            })
            .toString();
    }

    /**
     * Whether or not show filter text
     */
    get _showFilterText(): boolean {
        return (this.filterText || '').length > 0;
    }

    /**
     * handler for the event fired from apply button.
     */
    applyFilter(): void {
        const { startDate, endDate } = this.computeDateSummary();
        this.dispatchEvent(
            new CustomEvent('applydatefilter', {
                bubbles: true,
                composed: true,
                detail: {
                    startDate,
                    endDate,
                },
            })
        );
    }

    /**
     * handler for the event fired from reset button.
     */
    resetFilter(): void {
        this.dispatchEvent(
            new CustomEvent('resetdatefilter', {
                bubbles: true,
                composed: true,
            })
        );
    }
}
