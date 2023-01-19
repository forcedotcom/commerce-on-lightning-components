import { LightningElement, api } from 'lwc';
import headerStyleStringGenerator from './headerStyleStringGenerator';
import * as Constants from './constants';

import generateLabel from './headerLabelGenerator';

/**
 * A list header for the product list.
 */
export default class ListHeader extends LightningElement {
    /**
     * Style customizations supported by the list header.
     *
     * @typedef {Object} CustomStyles
     *
     * @property {string} ['header-color]
     *  The text color of the header, specified as a valid CSS color representation.
     *
     * @property {string} ["class-header-font-size"]
     *  The size of the page title, currently: 'small', 'medium', 'large'.
     */

    /**
     * Gets or sets the result type.
     *
     * @type {String}
     */
    @api
    displayMode = Constants.ResultType.SearchResult;

    /**
     * Gets or sets the display count.
     *
     * @type {Number}
     */
    @api
    displayCount = 0;

    /**
     * The index of the first item in the list.
     * It's expected to be 1-based.
     * @type {Number}
     */
    @api
    displayStartIndex;

    /**
     * The index of the last item in the list.
     *
     * @type {Number}
     */
    @api
    displayEndIndex;

    /**
     * Gets or sets the display word.
     *
     * @type {String}
     */
    @api
    displayWord = '';

    /**
     * Gets or sets the optional custom styles applied to the list header.
     *
     * @type {CustomStyles}
     */
    @api
    customStyles;

    /**
     * Sets the focus to the header element.
     */
    @api
    focus() {
        this.template.querySelector('h1').focus();
    }

    /**
     * Blurs the header element.
     */
    @api
    blur() {
        this.template.querySelector('h1').blur();
    }

    /**
     * Gets the display text for the header.
     *
     * @returns {String} the generated label from count, keyword and result type.
     * @private
     */
    get displayText() {
        return generateLabel(
            this.displayCount,
            this.displayStartIndex,
            this.displayEndIndex,
            this.displayWord,
            this.displayMode
        );
    }

    /**
     * Gets the css styles to apply to the list header.
     *
     * @returns {string} the css styles to apply to the list header.
     * @private
     */
    get listHeaderStyles() {
        return headerStyleStringGenerator.createForStyles(this.customStyles);
    }

    /**
     * Gets the appropriate SLDS classes to apply to the list header
     *
     * @returns {string} the SLDS classes to apply to the list header
     * @private
     */
    get listHeaderClasses() {
        const customStyles = this.customStyles || {};
        let sldsClass = {
            small: 'slds-text-heading_small',
            medium: 'slds-text-heading_medium',
            large: 'slds-text-heading_large',
        }[customStyles['class-header-font-size']];
        return `slds-p-vertical_small slds-truncate ${sldsClass}`;
    }
}
