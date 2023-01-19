import { LightningElement, api } from 'lwc';
import { resolve } from 'experience/resourceResolver';

/**
 * A showcased gallery image that supports optional user selection.
 *
 * @fires GalleryImage#selected
 */
export default class GalleryImage extends LightningElement {
    public static renderMode = 'light';
    /**
     * An event fired when an image is selected by the user.
     *
     * Properties:
     *   - Bubbles: false
     *   - Cancelable: false
     *   - Composed: false
     *
     * @event GalleryImage#selected
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * Gets or sets whether the image is selectable by the user.
     *
     * A selectable image will emit the {@see GalleryImage#selected} event when the user selects it,
     * e.g. via keyboard (enter) or mouse (click) interaction.
     *
     * @type {Boolean}
     */
    @api
    selectable = false;

    /**
     * Gets or sets the URL of the displayed image.
     *
     * @type {string}
     */
    @api
    url: string | undefined;

    /**
     * Gets or sets the alternative text of the displayed image.
     *
     * @type {string}
     */
    @api
    alternativeText: string | undefined;

    /**
     * Sets the 'aria-labelledby' attribute on the figure element with the provided id
     *
     * @type {string}
     */
    @api
    setAriaLabelledByOnFigureElement(idValue: string): void {
        this.figureElement?.setAttribute('aria-labelledby', idValue);
    }

    /**
     * Sets the 'role' attribute on the figure element with the provided role value
     *
     * @type {string}
     */
    @api
    setRoleOnFigureElement(roleValue: string): void {
        if (!this.figureElement?.hasAttribute('role')) {
            this.figureElement?.setAttribute('role', roleValue);
        }
    }

    /**
     * Get a reference to the 'figure' element of the component
     *
     * @type {object}
     */
    get figureElement(): HTMLElement | null {
        return this.querySelector('figure');
    }

    /**
     * Gets the resolved image URL.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get resolvedUrl(): string {
        return this.url ? resolve(this.url) : '';
    }

    /**
     * Fires an event to update the standard image
     *
     * @private
     * @fires GalleryImage#selected
     */
    handleImageClicked(): void {
        // Bubble up the event to the parent.
        const event = new CustomEvent('selected', {
            bubbles: false,
            cancelable: false,
            composed: false,
        });
        this.dispatchEvent(event);
    }
}
