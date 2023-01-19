import { LightningElement, api } from 'lwc';

/**
 * Facet component for sliders
 *
 */
export default class SliderFacet extends LightningElement {
    static renderMode = 'light';

    /**
     * The id of the facet
     *
     */
    @api
    facetId: string | undefined;

    /**
     * The minimum value count for the slider
     *
     */
    @api
    min: number | undefined | null;

    /**
     * The maximum value count for the slider
     */
    @api
    max: number | undefined | null;
}
