import { api, LightningElement } from 'lwc';
import { previousImageButtonAlternativeText, nextImageButtonAlternativeText } from './labels';
import { resolve } from 'experience/resourceResolver';
import type { ThumbnailImage } from 'commerce_product_details/gallery';

/**
 * An image carousel supporting horizontal and vertical orientation.
 *
 * @fires Carousel#selectionchanged
 * @fires Carousel#carouseldisplayed
 */
export default class Carousel extends LightningElement {
    static renderMode = 'light';
    /**
     * An event fired when the user selects a new image.
     *
     * Properties:
     *   - Bubbles: false
     *   - Cancelable: false
     *   - Composed: false
     *
     * @event Carousel#selectionchanged
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * An event fired when the carousel is rendered
     *
     * Properties:
     *   - Bubbles: false
     *   - Cancelable: false
     *   - Composed: false
     *
     * @event Carousel#carouseldisplayed
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * Gets or sets the sequence of images displayed.
     * @type {ThumbnailImage[]}
     */
    @api
    images?: ThumbnailImage[];

    /**
     * The orientation of the carousel.
     * Accepted values are: "horizontal" and "vertical"
     *
     * If no value is provided or an invalid value is specified, the default orientation is "horizontal".
     *
     * @type {string}
     */
    @api
    orientation?: 'horizontal' | 'vertical';

    /**
     * Gets or sets the number of images displayed at a time (i.e. per page) when pagination is enabled.
     * @type {number}
     */
    @api
    pageSize = 1;

    /**
     * Gets or sets whether pagination is enabled.
     *
     * When enabled, a fixed number of images (controlled by the pageSize property) is displayed at a given time with "next" and "previous" pagination controls displayed.
     * When disabled, all images are displayed and no pagination controls are present.
     *
     * @memberof Carousel
     */
    @api
    paginate = false;

    /**
     * Private storage for the (0-based) index of the image that appears selected.
     *
     * @type {number | undefined}
     */
    _selectedIndex?: number;

    /**
     * Gets or sets the index (0-based) of the image that appears selected.
     *
     * The value of this property differ from an assigned value as it is updated
     * to reflect the index of the image selected via user interaction.
     *
     * @type {number}
     */
    @api
    get selectedIndex(): number | undefined {
        return this._selectedIndex;
    }

    set selectedIndex(newIndex: number | undefined) {
        this._selectedIndex = newIndex;
    }

    /**
     * Whether to focus on the "next" button when the component DOM is next updated.
     *
     * @type {boolean}
     * @private
     */
    _focusOnNextButton = false;

    /**
     * Whether to focus on the "previous" button when the component DOM is next updated.
     *
     * @type {boolean}
     * @private
     */
    _focusOnPreviousButton = false;

    /**
     * LWC property change callback.
     */
    renderedCallback(): void {
        const selectedCarouselImage = this.querySelectorAll('button')[this._selectedIndex || 0];
        const selectedImageId = selectedCarouselImage ? selectedCarouselImage.getAttribute('id') : '';
        // A bit of accessibility juggling to move focus to the "next" or "previous" buttons after changing pages,
        // which causes us to update the "disabled" state of those buttons.
        if (this._focusOnNextButton) {
            this._focusOnNextButton = false;
            this.querySelector<HTMLElement>('lightning-button-icon:last-child')?.focus();
        }

        if (this._focusOnPreviousButton) {
            this._focusOnPreviousButton = false;
            this.querySelector<HTMLElement>('lightning-button-icon:first-child')?.focus();
        }

        // Fire the 'carouseldisplayed' event with the currently selected image's id
        // This is useful to set accessibilty related attributes on sibling components
        // which may depend on the id of the currently selected image
        this.dispatchEvent(
            new CustomEvent('carouseldisplayed', {
                bubbles: false,
                cancelable: false,
                composed: false,
                detail: { selectedImageId },
            })
        );
    }

    /**
     * Gets whether the carousel is oriented vertically.
     *
     * @type {boolean}
     * @readonly
     * @private
     */
    get isVerticalOrientation(): boolean {
        return this.orientation === 'vertical';
    }

    /**
     * The classes for the slideshow position.
     *
     * @type {string}
     * @private
     */
    get orientationClass(): string {
        const classes = ['carousel'];
        if (this.isVerticalOrientation) {
            classes.push('thumbnail-left');
        }
        return classes.join(' ');
    }

    /**
     * The direction of the chevron that appears first in the carousel.
     *
     * @type {string}
     * @private
     */
    get prevChevronDirection(): string {
        return !this.isVerticalOrientation ? 'utility:chevronleft' : 'utility:chevronup';
    }

    /**
     * The direction of the chevron that appears last in the carousel.
     *
     * @type {string}
     * @private
     */
    get nextChevronDirection(): string {
        return !this.isVerticalOrientation ? 'utility:chevronright' : 'utility:chevrondown';
    }

    /**
     * Gets or sets the first displayed image index
     * based of 'firstDisplayedImageIndex' configuration
     * @type {number}
     * @private
     */
    firstDisplayedImageIndex = 0;

    /**
     * Gets whether the image carousel should display the content
     * based of 'thumbnailImages' configuration
     * @type {ThumbnailImage[]}
     */
    get displayedThumbnailImages(): (ThumbnailImage & { index: number; isSelected: string })[] {
        const element = this.querySelector<HTMLElement>('.carousel');
        let height = 0;
        let width = 0;
        if (element) {
            height = parseInt(
                getComputedStyle(<HTMLElement>element.parentElement).getPropertyValue(
                    '--com-c-carousel-image-container-height'
                ) || '0',
                10
            );
            width = parseInt(
                getComputedStyle(<HTMLElement>element.parentElement).getPropertyValue(
                    '--com-c-carousel-image-container-width'
                ) || '0',
                10
            );
        }

        // The CMS API for image scaling has a minimum requirement of 100px for both height and width.
        // Any height and width values less than 100px will be ignored and scaling will not work.
        height = Math.max(height, 100);
        width = Math.max(width, 100);
        return (this.images || []).reduce(
            (acc: (ThumbnailImage & { index: number; isSelected: string })[], image: ThumbnailImage, index: number) => {
                if (
                    !this.paginate ||
                    (index >= this.firstDisplayedImageIndex && index < this.firstDisplayedImageIndex + this.pageSize)
                ) {
                    acc.push({
                        id: null,
                        alternativeText: image.alternativeText,
                        index,
                        isSelected: index === this._selectedIndex ? 'true' : 'false',
                        url: resolve(<string>image.url, false, {
                            height,
                            width,
                        }),
                    });
                }
                return acc;
            },
            []
        );
    }

    /**
     * Gets whether to disable the previous button
     * @type {Boolean}
     * @readonly
     * @private
     */
    get disablePrevButton(): boolean {
        return this.firstDisplayedImageIndex < this.pageSize;
    }

    /**
     * Gets whether to disable the next button
     * @type {Boolean}
     * @readonly
     * @private
     */
    get disableNextButton(): boolean {
        const displayedthumbnailImages = this.images || [];
        return displayedthumbnailImages.length <= this.firstDisplayedImageIndex + this.pageSize;
    }

    /**
     * Gets the alternative text for the previous button.
     * @type {string}
     * @readonly
     * @private
     */
    get prevButtonAltText(): string {
        return previousImageButtonAlternativeText;
    }

    /**
     * Gets the alternative text for the next button.
     * @type {string}
     * @readonly
     * @private
     */
    get nextButtonAltText(): string {
        return nextImageButtonAlternativeText;
    }

    /**
     * Handles a click of a next button,
     * which should show the next set of media thumbnailImages.
     * @private
     */
    handleNextButtonClick(): void {
        const newIndex = this.firstDisplayedImageIndex + this.pageSize;
        const resolvedIndex = Math.min(Math.max(0, newIndex), (<[]>this.images).length - 1);
        this.firstDisplayedImageIndex = resolvedIndex;

        // Focus on the previous button since we're moving to the next page.
        this._focusOnPreviousButton = true;
    }

    /**
     * Handles a click of a previous button,
     * which should show the previous set of media thumbnailImages.
     * @private
     */
    handlePrevButtonClick(): void {
        const newIndex = this.firstDisplayedImageIndex - this.pageSize;
        const resolvedIndex = Math.min(Math.max(0, newIndex), (<[]>this.images).length - 1);
        this.firstDisplayedImageIndex = resolvedIndex;

        // Focus on the next button since we moved to the previous page.
        this._focusOnNextButton = true;
    }

    /**
     * Handles user selection of an image.
     *
     * @private
     * @fires Carousel#selectionchanged
     */
    handleImageSelected(event: MouseEvent): void {
        const newIndex = parseInt(<string>(<HTMLButtonElement>event?.currentTarget)?.dataset?.index, 10);
        const hasChanged = this._selectedIndex !== newIndex;
        // If the selection has changed, update our state and fire the change event.
        if (hasChanged) {
            this._selectedIndex = newIndex;
            this.dispatchEvent(
                new CustomEvent('selectionchanged', {
                    bubbles: false,
                    cancelable: false,
                    composed: false,
                })
            );
        }
    }
}
