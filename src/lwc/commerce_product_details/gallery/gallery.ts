import { api, LightningElement } from 'lwc';
import type { LwcCustomEventTargetOf } from 'types/common';
import type Dialog from 'lightning/dialog';
import { resolve } from 'experience/resourceResolver';
import type Carousel from 'commerce_product_details/carousel';
import type GalleryImage from 'commerce_product_details/galleryImage';
import type { ProductImage, ThumbnailImage } from './types';
import { lightBoxImageNoAssistiveText, lightBoxImageAssistiveText } from './labels';

export type { ProductImage, ThumbnailImage };

const defaultEmptyObject = Object.create(null);

// Vertical carousel position values.
const verticalCarouselPositions = new Set(['after', 'before']);

// Valid carousel position settings.
const validCarouselPositions = new Set(['above', 'after', 'before', 'below']);

/**
 * A responsive image gallery designed for product images, showcasing a selected image accompanied by additional thumbnail images.
 *
 * This component automatically changes its representation and functionality depending upon the form factor in which it's displayed.
 * In the narrow form factor, thumbnail images are replaced by generic dots.
 */
export default class Gallery extends LightningElement {
    static renderMode = 'light';

    // Private storage for carouselImages.
    _images?: ProductImage[];

    /**
     * Gets or sets the 0-based index of the displayed image.
     *
     * @type {number | undefined}
     * @private
     */
    selectedImageIndex?: number;

    /**
     * Gets or sets the no. of images to display in the carousel
     *
     * @type {number}
     */
    @api
    carouselPageSize = 1;

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
    carouselPosition?: 'above' | 'after' | 'before' | 'below';

    /**
     * Whether to show an expanded version of the featured image (e.g. in a lightbox) when it is selected.
     *
     * @type {Boolean}
     */
    @api
    expandable = false;

    /**
     * Whether to show the image carousel
     *
     * @type {Boolean}
     */
    @api
    showCarousel = false;

    /**
     * Gets the orientation for the carousel.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get carouselOrientation(): 'vertical' | 'horizontal' {
        return verticalCarouselPositions.has(<string>this.carouselPosition) ? 'vertical' : 'horizontal';
    }

    /**
     * The classes for the carousel position.
     *
     * @type {string}
     * @private
     */
    get carouselPositionClasses(): string {
        const carouselPosition = validCarouselPositions.has(<string>this.carouselPosition)
            ? this.carouselPosition
            : 'below';
        return `images carousel-${carouselPosition}`;
    }

    /**
     * Gets or sets the images to display in the gallery.
     *
     * @type {ProductImage[]}
     */
    @api
    get images(): ProductImage[] | undefined {
        return this._images;
    }

    set images(images: ProductImage[] | undefined) {
        // Store the images and set the first image - if any - as displayed.
        this._images = images;
        this.selectedImageIndex = Array.isArray(images) && images.length > 0 ? 0 : undefined;
    }

    /**
     * Gets the normalized sequence of images.
     *
     * @type {ProductImage[]}
     * @readonly
     * @private
     */
    get normalizedImages(): ProductImage[] {
        return this.images || [];
    }

    /**
     * Gets the image selected for display, if any.
     *
     * @type {ProductImage}
     * @private
     */
    get selectedImage(): ProductImage {
        return this.normalizedImages[this.selectedImageIndex || 0];
    }

    /**
     * Gets whether there are multiple images to display.
     *
     * @type {boolean}
     * @readonly
     * @private
     */
    get hasMultipleImages(): boolean {
        return this.normalizedImages.length > 1;
    }

    /**
     * Gets the custom styles for the mobile lightbox carousel.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get mobileLightboxCarouselStyles(): string {
        return `
            --com-c-carousel-image-container-height: 40px;
            --com-c-carousel-image-container-width: 40px;
        `;
    }

    /**
     * Gets the URI of the displayed image.
     *
     * @type {string}
     *
     * @readonly
     * @private
     */
    get url(): string | undefined {
        return this.selectedImage?.fullUrl ?? undefined;
    }

    /**
     * Gets the url of the displayed image for desktop.
     *
     * Here we are trying to leverage CMS API to get appropriate size images based on our requirement.
     * Only CMS API will support the scaling parameters and all the external URLs will just ignore them.
     * Height and Width are hardcoded to 400px as that is our standard size for the gallery image for Desktop.
     *
     * @type {string}
     *
     * @readonly
     * @private
     */
    get desktopUrl(): string | undefined {
        return this.url
            ? resolve(this.url, false, {
                  height: 400,
                  width: 400,
              })
            : undefined;
    }

    /**
     * Gets the url of the displayed image for mobile
     *
     * Here we are trying to leverage CMS API to get appropriate size images based on our requirement.
     * Only CMS API will support the scaling parameters and all the external URLs will just ignore them.
     * Height and Width are hardcoded to 200px as that is our standard size for the gallery image for mobile.
     *
     * @type {string}
     *
     * @readonly
     * @private
     */
    get mobileUrl(): string | undefined {
        return this.url
            ? resolve(this.url, false, {
                  height: 200,
                  width: 200,
              })
            : undefined;
    }

    /**
     * Gets the url of the displayed image
     *
     * This URL is the full-size image, without any scaling parameters
     *
     * @type {string}
     *
     * @readonly
     * @private
     */
    get imageUrl(): string | undefined {
        return this.url ? resolve(this.url) : undefined;
    }

    /**
     * Gets the alternative text to apply to the product image.
     *
     * @type {string}
     *
     * @readonly
     * @private
     */
    get imageResolvedAlternativeText(): string {
        // If the expandable / lightbox support is disabled, simply show the normal alternative text.
        // Otherwise, the alternative text needs to indicate it's clickable.
        const selectedImage = this.selectedImage || defaultEmptyObject;
        if (!this.expandable) {
            return selectedImage.alternativeText || '';
        }

        // Default to the "no assistive text provided" assistive text.
        const alternativeText = lightBoxImageNoAssistiveText;
        const imageAlternativeText = selectedImage.alternativeText || '';

        // If the selected image has alternative text, use that (with our "Click to Expand" bit added).
        if (imageAlternativeText.length > 0) {
            return lightBoxImageAssistiveText.replace('{0}', imageAlternativeText);
        }
        return alternativeText;
    }

    /**
     * Gets the alternative text to apply to the lightbox product image.
     *
     * @type {string}
     *
     * @readonly
     * @private
     */
    get lightboxImageAlternativeText(): string {
        // For the lightbox, we display the unaltered alternative text.
        return this.selectedImage?.alternativeText || '';
    }

    /**
     * Gets the thumbnail images information to apply to the desktop image carousel control.
     *
     * @type {ThumbnailImage}
     *
     * @readonly
     * @private
     */
    get thumbnailImages(): ThumbnailImage[] {
        return this.normalizedImages.map((item: ProductImage) => {
            return {
                alternativeText: item.alternativeText
                    ? lightBoxImageAssistiveText.replace('{0}', item.alternativeText)
                    : lightBoxImageNoAssistiveText,
                id: item.id,
                url: item.smallUrl,
            };
        });
    }

    /**
     * Gets the number of images available for display.
     *
     * @returns {number}
     *
     * @readonly
     * @private
     */
    get numberOfImages(): number {
        return this.normalizedImages.length;
    }

    /**
     * Handles a click of a product image, which should show a larger version in a lightbox.
     *
     * @private
     */
    handleImageClicked(): void {
        if (this.expandable) {
            this.querySelector<Dialog & Element>('lightning-dialog')?.showModal();
        }
    }

    /**
     * Handles a click of a thumbnail image,
     * which should show a larger version of the product image.
     *
     * @private
     */
    handleThumbnailImageSelected(event: LwcCustomEventTargetOf<Carousel>): void {
        // Update the selected image ID using the new selected image index.
        this.selectedImageIndex = event.target.selectedIndex;
    }

    /**
     * Displays the next image in the collection.
     *
     * @private
     */
    showNextImage(): void {
        this.selectedImageIndex = (Number(this.selectedImageIndex) + 1) % this.normalizedImages.length;
    }

    /**
     * Displays the previous image in the collection.
     *
     * @private
     */
    showPreviousImage(): void {
        const nextIndex = Number(this.selectedImageIndex) - 1;
        this.selectedImageIndex = nextIndex < 0 ? this.normalizedImages.length - 1 : nextIndex;
    }

    /**
     * Whenever a carosuel is associated with the gallery, we need to set a couple of attributes
     * on the commerce-gallery-image component.
     *  1. role="tabpanel"
     *  2. aria-labelledby="id-of-the-currently-selected-image"
     *
     * @private
     */
    handleCarouselDisplayed(event: LwcCustomEventTargetOf<Carousel, { selectedImageId: string }>): void {
        const { selectedImageId } = event.detail;
        const galleryImage = this.querySelector<GalleryImage & Element>('commerce_product_details-gallery-image');
        galleryImage?.setAriaLabelledByOnFigureElement(selectedImageId);
        galleryImage?.setRoleOnFigureElement('tabpanel');
    }
}
