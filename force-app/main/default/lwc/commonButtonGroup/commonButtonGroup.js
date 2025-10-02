/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache2.0/
 */
import { LightningElement, api } from 'lwc';

/**
 * A Lightning Web Component (LWC) that renders a group of interactive buttons for conversational commerce flows.
 *
 * This component displays a collection of suggestion buttons in a responsive grid layout, typically used
 * to present users with multiple action options in a messaging interface. Each button represents a selectable
 * item (e.g., product categories, quick actions, or navigation options) and emits standardized events when
 * clicked to facilitate parent component handling.
 *
 * The component operates in **Light DOM**, meaning its internal structure is exposed to the document's global
 * stylesheet, offering flexibility in styling and simpler accessibility integration. It employs a pill-shaped
 * button design with hover effects and responsive behavior for optimal user experience across devices.
 * @class
 * @augments LightningElement
 * @fires CustomEvent#selectbutton - Dispatched when a button is clicked. `detail` contains the button's `name` and `id`.
 * @example
 * <c-common-button-group
 *   items={[
 *     { id: 'cat1', name: 'Electronics' },
 *     { id: 'cat2', name: 'Clothing' },
 *     { id: 'cat3', name: 'Home & Garden' }
 *   ]}
 *   onselectbutton={handleButtonSelection}
 * ></c-common-button-group>
 */
export default class CommonButtonGroup extends LightningElement {
    /**
     * Specifies the render mode for the component.
     * Setting this to 'light' means the component's content is rendered directly into the host element,
     * making it accessible to global CSS and standard DOM APIs, simplifying styling and accessibility.
     * @type {string}
     */
    static renderMode = 'light';

    // =========================================================
    // Public API - Properties (@api decorated)
    // =========================================================

    /**
     * Array of button labels to be displayed in the button group.
     * Each item should be a string representing the button text.
     * The component will render one button for each string in this array.
     * @type {Array<string>}
     * @default
     * @example
     * [
     *   'Electronics',
     *   'Clothing',
     *   'Home & Garden'
     * ]
     */
    @api
    set items(value) {
        // Ensure we always have a valid array
        if (Array.isArray(value)) {
            this._items = value;
        } else {
            this._items = [];
        }
    }

    get items() {
        return this._items;
    }

    // =========================================================
    // Private Properties
    // =========================================================

    /**
     * Private property to store the items array.
     * @type {Array<object>}
     * @private
     */
    _items = [];

    // =========================================================
    // Computed Properties (Getters)
    // =========================================================

    /**
     * Returns a filtered array of valid strings for rendering.
     * Filters out null, undefined, or non-string items.
     * @returns {Array<string>} Array of valid string items.
     * @private
     */
    get validItems() {
        return this._items?.filter((item) => item && typeof item === 'string' && item.trim().length > 0);
    }

    // =========================================================
    // Event Handling Methods (Private)
    // =========================================================

    /**
     * Handles button click events and dispatches a standardized 'selectbutton' custom event.
     *
     * This method extracts the button's `name` from the clicked element's attributes
     * and dispatches a custom event with this information. The event detail contains:
     * - `name`: The display text of the clicked button
     *
     * The method includes validation to ensure the `name` is present before
     * dispatching the event, preventing incomplete event data from being sent.
     * @param {Event} event - The click event object from the selected button.
     * @fires CustomEvent#selectbutton - Dispatched when a valid button is clicked.
     * @private
     */
    handleClick(event) {
        const name = event.target.name;

        // Validate that name is present before dispatching event
        if (name) {
            this.dispatchEvent(
                new CustomEvent('selectbutton', {
                    detail: {
                        name,
                    },
                })
            );
        }
    }
}
