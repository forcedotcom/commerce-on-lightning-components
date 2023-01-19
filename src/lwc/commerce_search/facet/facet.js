import { LightningElement, api } from 'lwc';
import generateLabel from './facetLabelGenerator';

/**
 * General facet display component
 */
export default class Facet extends LightningElement {
    /**
     * The search facet display-data. The difference between
     * {@see ConnectApi.SearchFacet} and this type is it's "values" property
     *
     * @typedef {Object} SearchFacet
     *
     * @property {string} id
     *  The client-side generated unique identifier
     *
     * @property {string} facetType
     *  Type of the facet (so far we have DISTINCT_VALUE).
     *
     * @property {string} nameOrId
     *  ID or internal name of the facet.
     *
     * @property {string} attributeType
     *  Type of the search attribute underlying the facet
     *  (STANDARD, CUSTOM, PRODUCT_ATTRIBUTE or PRODUCT_CATEGORY).
     *
     * @property {string} displayName
     *  Display name of the facet.
     *
     * @property {string} displayType
     *  Display name of the facet. (SINGLE_SELECT, MULTI_SELECT, CATEGORY_TREE or
     *  DATE_PICKER)
     *
     * @property {Number} displayRank
     *  Display rank for the facet.
     *
     * @property {DistinctFacetValue[]} values
     *  The values of the facet
     */

    /**
     * The facet display-data for checkbox.
     *
     * @typedef {Object} DistinctFacetValue
     *
     * @property {string} id
     *  ID or internal name of the facet value.
     *
     * @property {string} name
     *  Display Name of the facet value with product count.
     *
     * @property {Boolean} checked
     *  Whether or not the value is selected.
     *
     * @property {Boolean} focusOnInit
     *  Whether or not to show the focus when initially displayed.
     *
     * @property {Number} productCount
     *  Number of products in search results under this category
     */

    /**
     * Gets or sets the facet display-data.
     *
     * @type {SearchFacet[]}
     */
    @api
    displayData;

    /**
     * Gets the normalized facet display-data.
     *
     * @type {SearchFacet[]}
     */
    get normalizedDisplayData() {
        const displayData = this.displayData || {};

        return {
            ...displayData,
            type: displayData.type || 'checkbox',
            values: displayData.values || [],
        };
    }

    /**
     * Gets the values of the facet,
     *
     * @type {DistinctFacetValue[]}
     */
    get values() {
        return this.normalizedDisplayData.values;
    }

    /**
     * Gets the type of facet being displayed.
     *
     * Types supported: 'checkbox', 'radio', 'range', 'datetime'
     * Default: checkbox
     *
     * @type {string}
     */
    get type() {
        return this.normalizedDisplayData.type;
    }

    /**
     * Gets the display name of facet to be displayed.
     *
     * @type {string}
     */
    get name() {
        return this.normalizedDisplayData.displayName;
    }

    /**
     * Determines whether we expand to show the facet's values or not
     * @type {Boolean}
     * @private
     */
    _expanded = true;

    /**
     * Gets the value assocaited with the button "aira-expanded" attribute.
     *
     * @readonly
     * @returns {string}
     *  "true" if the button reflects an expanded state, otherwise "false".
     */
    get ariaExpanded() {
        return (this._expanded || false).toString();
    }

    /**
     * Determines whether the facet is a slider
     *
     * @type {boolean}
     */
    get isSlider() {
        return this.normalizedDisplayData.type === 'range';
    }

    /**
     * Determines whether the facet is a date-time or slider
     *
     * @type {boolean}
     */
    get isDateTimeOrSlider() {
        return this.isDateTime || this.isSlider;
    }

    /**
     * Determines whether the facet is a date-time
     *
     * @type {boolean}
     */
    get isDateTime() {
        return this.type === 'datetime';
    }

    /**
     * The minimum value count for the facet, if it is a slider
     */
    get minValue() {
        return this.values[0].productCount;
    }

    /**
     * The maximum value count for the facet, if it is a slider
     */
    get maxValue() {
        return this.values[1].productCount;
    }

    /**
     * The icon for the facet toggle button
     */
    get iconName() {
        return this._expanded ? 'utility:chevrondown' : 'utility:chevronup';
    }

    /**
     * The CSS classes for the facet toggle button
     */
    get facetDisplayClasses() {
        let classes = '';
        if (!this._expanded) {
            classes = 'slds-hide';
        }
        return classes;
    }

    /**
     * Gets the label for the facet toggle.
     *
     * @returns {string} the generated label
     * @private
     */
    get facetToggleLabel() {
        return generateLabel(this._expanded);
    }

    /**
     * Handle the 'click' event fired from the facet
     * @param {Object} evt the event object.
     */
    handleFacetToggle() {
        this._expanded = !this._expanded;
    }
}
