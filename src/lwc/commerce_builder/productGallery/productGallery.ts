import { api, LightningElement } from 'lwc';
import type { ProductDetailData } from 'commerce/productApi';
import type { ProductImage } from 'commerce_product_details/gallery';
import { transformMediaContents, areExpandable } from './productGalleryUtils';

export default class ProductGallery extends LightningElement {
    static renderMode = 'light';
    /**
     * Gets or sets the number of images displayed at a time (i.e. per page) when pagination is enabled.
     *
     * @type {number}
     */

    @api
    carouselPageSize: number | undefined;

    /**
     * Gets or sets the image border color for product gallery component.
     * @type {string}
     */
    @api imageBorderColor: string | undefined;

    /**
     * The position of the image carousel - when shown - in relation to the showcased image.
     * Accepted values are:
     *  - "above": the carousel appears before the showcased image, as defined by the normal column flow direction of the user (e.g. top).
     *  - "after": the carousel appears after the showcased image, as defined by the normal flow direction of the user (e.g. right).
     *  - "before": the carousel appears before the showcased image, as defined by the normal flow direction of the user (e.g. left).
     *  - "below": the carousel appears after the showcased image, as defined by the normal column flow direction of the user (e.g. under).
     *
     * If no value is specified or an invalid option is provided, the default position of "below" is used.
     *
     * @type {string}
     */
    @api
    carouselPosition: string | undefined;

    /**
     * Whether or not to show the image carousel
     *
     * @type {Boolean}
     */
    @api
    showCarousel = false;

    /**
     * Sets the custom background color and custom CSS properties for the product gallery component.
     * @returns {string}
     * The css style overwrites for the product gallery component component.
     */
    private get productGalleryCustomStyles(): string {
        return `--com-carousel-image-border-color: ${this.imageBorderColor || 'initial'};`;
    }

    /**
     * Gets or sets the images to display in the gallery.
     *
     * @type {Image[]}
     */
    get images(): ProductImage[] {
        const mediaGroups = this.product?.mediaGroups;
        return transformMediaContents(mediaGroups);
    }

    get isImageGalleryExpandable(): boolean {
        return areExpandable(this.images);
    }

    @api
    product?: ProductDetailData;

    /**
     * Should render gallery component only if mediaGroups is available.
     *
     * @returns { boolean }
     */
    get displayGallery(): boolean {
        return !!this.product?.mediaGroups && this.product?.mediaGroups.length > 0;
    }

    public renderedCallback(): void {
        this.classList.toggle('slds-hide', !this.displayGallery);
    }
}
