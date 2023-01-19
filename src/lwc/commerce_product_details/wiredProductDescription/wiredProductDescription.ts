import { LightningElement, api, wire } from 'lwc';
import type { ProductDetailData } from 'commerce/productApi';
import { ProductAdapter } from 'commerce/productApi';

/**
 * Wired wrapper component for Product Description (aka "Product Field (Long)")
 * which fetches data from productApi and passes to an inner presentational component to display the selected product field.
 * @author mrabbitt
 */
export default class WiredProductDescription extends LightningElement {
    public static renderMode = 'light';
    /**
     * ID of a Product2 record.
     */
    @api public productId: string | undefined;

    /**
     * Developer name of the Product2 field to be displayed.
     */
    @api public sectionContentField: string | undefined;

    /**
     * If true, the field value is expanded by default; otherwise it is collapsed.
     */
    @api public isExpanded = false;

    /**
     * Label to be displayed for the field.
     */
    @api public label: string | undefined;

    /**
     * Product2 field data provided by productApi.
     */
    private productFields: Record<string, unknown> = {};

    @wire(ProductAdapter, {
        productId: '$productId',
    })
    private productInfo({ data }: { data: ProductDetailData }): void {
        if (data) {
            this.productFields = data.fields;
        }
    }

    /**
     * The data from the selected product field to display as the content of the Product Description.
     */
    private get contentFieldData(): unknown {
        return this.sectionContentField ? this.productFields[this.sectionContentField] : undefined;
    }

    /**
     * Returns true if the component should be displayed. To match behavior with the B2B Aura component, the component is hidden if no data
     */
    private get isDisplayed(): boolean {
        return this.contentFieldData !== null && this.contentFieldData !== undefined;
    }
}
