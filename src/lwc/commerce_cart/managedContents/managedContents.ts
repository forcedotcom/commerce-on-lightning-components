import { LightningElement, api } from 'lwc';

export default class ManagedContents extends LightningElement {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light';

    /**
     * @description Indicates whether to show the sorting menu in the header
     */
    @api showSortOptions = false;

    /**
     * @description Indicates whether to show the footer section
     */
    @api showFooter = false;

    /**
     * @description Indicates whether to show the "Show More" button in the footer
     */
    @api displayShowMore = false;

    /**
     * @description The current sort order of the cart line items
     */
    //This value gets passed down from cart contents.
    //the instance of this component is reset after sorting is changed, so it won't remember what the combobox value should be
    @api sortOrder: string | undefined;
}
