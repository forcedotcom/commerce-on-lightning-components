import { api, LightningElement } from 'lwc';
import labels from './labels';

/**
 * An image display control that shows an image between two nagivation carets that allow the user to trigger the display of subsequent and / or prior images.
 *
 * @fires HorizontalScroller#shownext
 * @fires HorizontalScroller#showprevious
 */
export default class HorizontalScroller extends LightningElement {
    public static renderMode = 'light';
    /**
     * An event fired when the user elects to view the next image.
     *
     * Properties:
     *   - Bubbles: false
     *   - Cancelable: false
     *   - Composed: false
     *
     * @event HorizontalScroller#shownext
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * An event fired when the user elects to view the previous image.
     *
     * Properties:
     *   - Bubbles: false
     *   - Cancelable: false
     *   - Composed: false
     *
     * @event HorizontalScroller#showprevious
     * @type {CustomEvent}
     *
     * @export
     */

    get _labels(): Record<string, string> {
        return labels;
    }

    /**
     * Gets or sets whether the trigger to show the next image is displayed.
     *
     * @type {boolean}
     */
    @api
    showNextTrigger = false;

    /**
     * Gets or sets whether the trigger to show the previous image is displayed.
     *
     * @type {boolean}
     */
    @api
    showPreviousTrigger = false;

    /**
     * Handles a click of a next button,
     * which should show the next Standard Image.
     * @private
     * @fires ImageSliderMobile#nextbuttonclicked
     */
    handleNextButtonClick(): void {
        const event = new CustomEvent('shownext', {
            bubbles: false,
            cancelable: false,
            composed: false,
        });
        this.dispatchEvent(event);
    }

    /**
     * Handles a click of a previous button,
     * which should show the previous Standard Image.
     * @private
     * @fires ImageSliderMobile#prevbuttonclicked
     */
    handlePrevButtonClick(): void {
        const event = new CustomEvent('showprevious', {
            bubbles: false,
            cancelable: false,
            composed: false,
        });
        this.dispatchEvent(event);
    }
}
