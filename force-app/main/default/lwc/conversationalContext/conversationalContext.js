/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { LightningElement, api } from 'lwc';

/**
 * A Lightning Web Component (LWC) that displays contextual suggestion buttons for conversational commerce flows.
 *
 * This component renders a set of interactive suggestion buttons along with descriptive text, typically used
 * in messaging interfaces to present users with multiple action options or context-aware suggestions. Each button
 * represents a selectable item (e.g., product categories, quick actions, or navigation options) and emits
 * standardized events when clicked to facilitate parent component handling.
 *
 * The component operates in **Light DOM**, meaning its internal structure is exposed to the document's global
 * stylesheet, offering flexibility in styling and simpler accessibility integration. It leverages the
 * `c-common-button-group` component for consistent button rendering and behavior.
 * @class
 * @augments LightningElement
 * @fires CustomEvent#selectcontext - Dispatched when a contextual button is clicked. `detail` contains the button's `name`.
 */
export default class ConversationalContext extends LightningElement {
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
     * Array of context data objects for suggestion buttons.
     * Each object should contain at least a `name` property for display text.
     * The component will render one button for each object in this array.
     * @type {Array<object>}
     * @default []
     * @example
     * [
     *   { id: 'cat1', name: 'Electronics' },
     *   { id: 'cat2', name: 'Clothing' },
     *   { id: 'cat3', name: 'Home & Garden' }
     * ]
     */
    @api contextualData = [];

    /**
     * Description text shown above the context buttons.
     * This text provides context or instructions for the user about the available options.
     * @type {string}
     * @default ''
     * @example "Choose a category to explore:"
     */
    @api contextualDescription = '';

    // =========================================================
    // Event Handlers
    // =========================================================

    /**
     * Handles context button click events from the child `c-common-button-group` component.
     * Extracts the button name from the event detail and dispatches a standardized `selectcontext` event
     * to the parent component for handling.
     * @param {CustomEvent} event - The click event from the context button with `event.detail` containing button details.
     * @param {string} event.detail.name - The name/text of the clicked button.
     */
    handleContextualButtonClick(event) {
        const name = event.detail?.name;

        if (name && typeof name === 'string') {
            this.dispatchEvent(
                new CustomEvent('selectcontext', {
                    detail: {
                        name,
                    },
                })
            );
        }
    }
}
