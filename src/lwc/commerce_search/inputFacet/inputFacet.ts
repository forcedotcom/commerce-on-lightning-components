import { api, LightningElement } from 'lwc';
import { NUM_FACETVALUES_ALWAYS_DISPLAYED, FACETVALUE_SHOW_MORE_LIMIT } from './constants';
import generateLabel from './inputFacetLabelGenerator';
import type { DistinctFacetValue } from 'commerce/searchApiInternal';

/**
 * Facet component for input types (checkbox, radio button, etc)
 *
 */
export default class InputFacet extends LightningElement {
    static renderMode = 'light';

    /**
     * Facet representation that inputFacet will take in
     *
     * @typedef DistinctFacetValue
     *
     * @property id
     *  ID or internal name of the facet value.
     *
     * @property name
     *  Display Name of the facet value with product count.
     *
     * @property checked
     *  Whether or not the value is selected.
     *
     * @property focusOnInit
     *  Whether or not to show the focus when initially displayed.
     *
     * @property productCount
     *  Number of products in search results under this category
     */

    /**
     * The values of the facet
     *
     */
    @api
    values?: DistinctFacetValue[];

    /**
     * Gets the defaulted / normalized sequence of facet values to display.
     *
     */
    get normalizedValues(): DistinctFacetValue[] {
        return this.values || [];
    }

    /**
     * The type of facet being displayed
     *
     */
    @api
    type: string | undefined | null;

    /**
     * The facet name for the values being displayed
     *
     */
    @api
    facetName: string | undefined;

    /**
     * Determines whether we show all the facet's values or not
     * @private
     */
    _expanded = false;

    /**
     * Gets the defaulted / normalized sequence of facet values to display.
     * Only show the first 6 values if
     *
     */
    get displayedValues(): DistinctFacetValue[] {
        let facetValues = Array.from(this.normalizedValues);
        if (this.displayShowMore && !this._expanded) {
            facetValues = facetValues.slice(0, NUM_FACETVALUES_ALWAYS_DISPLAYED);
        } else if (this.displayShowMore && this._expanded) {
            // Focus on the next facet value that appears once we click on Show More
            // Needed for accessibility: Users must be able to access the next item in a list if we are expanding it.
            facetValues = facetValues.map((facetValue, index) => ({
                ...facetValue,
                focusOnInit: index === NUM_FACETVALUES_ALWAYS_DISPLAYED,
            }));
        }
        return facetValues;
    }

    /**
     * Gets whether we should display a "Show More" button or not
     *
     * @returns the generated label
     * @private
     */
    get displayShowMore(): boolean {
        return this.normalizedValues.length > FACETVALUE_SHOW_MORE_LIMIT;
    }

    /**
     * Gets the label for the 'Show More' or 'Show Less' button
     *
     * @returns the generated label
     * @private
     */
    get showMoreOrLessLabel(): string {
        return generateLabel(this._expanded);
    }

    /**
     * Gets the aria label for the 'Show More' or 'Show Less' button
     *
     * @returns the generated label
     * @private
     */
    get facetAriaLabel(): string {
        return generateLabel(this._expanded, this.facetName);
    }

    /**
     * Handle the 'click' event fired from the 'Show More' or 'Show Less' button
     * @private
     */
    handleShowMoreOrLess(): void {
        this._expanded = !this._expanded;
    }
}
