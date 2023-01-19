import type { ProductDetailData } from 'commerce/productApiInternal';
import { api, LightningElement } from 'lwc';
import type { File } from 'commerce_product_details/productAttachments';
import { transformMediaContents } from './productAttachmentsUtils';

/**
 * This is the container component of commerce_product_details/productAttachments
 */
export default class ProductAttachments extends LightningElement {
    static renderMode = 'light';

    /**
     * The product details for the given product
     */
    @api
    product?: ProductDetailData;

    /**
     * The icon color for each file
     */
    @api
    fileIconColor?: string;

    /**
     * Whether a file should open in a new tab
     */
    @api
    openFilesInNewTab?: boolean;

    /**
     * Get the transformed File objects
     */
    private get files(): File[] {
        return transformMediaContents(this.product);
    }
}
