import { LightningElement, api } from 'lwc';

import loading from '@salesforce/label/B2B_Search_Results_Tiles_Placeholder.loading';

/**
 * A UI placeholder/stencil component for ResultsTiles.
 **/
export default class ResultsTilesPlaceholder extends LightningElement {
    /**
     * Keys for showing the facet panel stencils.
     * @type {Array}
     */
    _facetPanelKeys = [1, 2, 3, 4];

    /**
     * Keys for showing the product card stencils.
     * @type {Array}
     */
    _productCardKeys = [1, 2, 3, 4, 5, 6, 7, 8];

    /**
     * Maximum columns to be displyed in the grid.
     * @default 4
     * @type {Number}
     */
    @api
    gridMaxColumnsDisplayed = 4;

    /**
     * Gets the custom styles to apply to the elements of the product grid
     *
     * @returns {string}
     *
     * @readonly
     * @private
     */
    get gridCustomStyles() {
        // ensure we are dividing by a positive number
        if (this.gridMaxColumnsDisplayed <= 0) {
            return 'flex-basis: 25%;';
        }
        return `flex-basis: ${100 / this.gridMaxColumnsDisplayed}%;`;
    }

    /**
     * Gets the required i18n labels
     * @private
     */
    get label() {
        return {
            loading,
        };
    }
}
