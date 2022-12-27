/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api } from 'lwc';
import { dispatchMessagingEvent, assignMessagingEventHandler, MESSAGING_EVENT } from 'lightningsnapin/eventStore';
import logoUrl from '@salesforce/resourceUrl/agentChatLogo';
import { Labels } from './labels';

const SLDS_MENU_SELECTOR = 'slds-dropdown-trigger slds-dropdown-trigger_click';
const DEFAULT_HEADER_TEXT = 'Chatting with Agent';
const AUTH_MODE = {
    AUTH: 'Auth',
};

/**
 * Custom header component for Messaging-Web embeds.
 *
 * Displays:
 * - A three-dots menu (Request Transcript, dynamic participant options, End Chat)
 * - Centered logo + header text
 * - A minimize (X) button
 */
export default class ChatHeader extends LightningElement {
    static renderMode = 'light';

    /**
     * Messaging deployment configuration
     * @type {object}
     */
    @api configuration = {};

    /**
     * Current conversation status: NOT_STARTED, OPEN, CLOSED
     * @type {string}
     */
    @api conversationStatus;

    /** Labels for the component */
    labels = Labels;

    /** CSS classes for the SLDS dropdown container */
    menuClass = SLDS_MENU_SELECTOR;

    /** Dynamic participant menu options */
    chatbotOptionsMenu = [];

    /**
     * true if dropdown has slds-is-open
     * @returns {boolean} True if menu is open
     */
    get isMenuOpen() {
        return this.menuClass.includes('slds-is-open');
    }

    /**
     * inverse of isMenuOpen
     * @returns {boolean} True if menu is closed
     */
    get isMenuClosed() {
        return !this.isMenuOpen;
    }

    /**
     * Whether the user is authenticated.
     * AuthMode can have the following values:
     * - Auth: user is in verified, which corresponds to the authenticated user mode.
     * - UnAuth: user is in unverified,  which corresponds to the guest user mode.
     * @returns {boolean} True if the user is authenticated, false otherwise
     */
    get isAuthenticatedContext() {
        return this.configuration?.embeddedServiceMessagingChannel?.authMode === AUTH_MODE.AUTH;
    }

    /**
     * Whether to display request transcript option.
     * @returns {boolean} True if transcript download is enabled and conversation has started
     */
    get isRequestTranscriptionEnabled() {
        return (
            this.conversationStatus !== 'NOT_STARTED' &&
            Boolean(this.configuration?.transcript?.allowTranscriptDownload)
        );
    }

    /** Text shown in the center of the header */
    headerText = DEFAULT_HEADER_TEXT;

    /**
     * URL for the static-resource SVG logo
     * @returns {string} The URL of the logo
     */
    get logoSrc() {
        return logoUrl;
    }

    /**
     * Initialize SDK event handlers:
     * - UPDATE_HEADER_TEXT to set headerText
     * - PARTICIPANT_JOINED / LEFT to manage dynamic options
     * @override
     * @returns {void}
     */
    connectedCallback() {
        this.assignHandlers();
    }

    /**
     * Assign handlers to the header events that are triggered by the chat client.
     * @private
     * @returns {void}
     */
    assignHandlers() {
        // TODO: Once chat session is closed and reopened, the header text is not updated.
        // The UPDATE_HEADER_TEXT event is not fired on conversation re-open.
        assignMessagingEventHandler(MESSAGING_EVENT.UPDATE_HEADER_TEXT, (data) => {
            this.headerText = data?.text || DEFAULT_HEADER_TEXT;
        });
        assignMessagingEventHandler(MESSAGING_EVENT.PARTICIPANT_JOINED, (data) => {
            if (Array.isArray(data?.options)) {
                this.chatbotOptionsMenu = [...this.chatbotOptionsMenu, ...data.options];
            }
        });
        assignMessagingEventHandler(MESSAGING_EVENT.PARTICIPANT_LEFT, () => {
            this.chatbotOptionsMenu = [];
        });
    }

    /**
     * Toggle dropdown open/closed by adding/removing `slds-is-open`
     * @returns {void}
     */
    onMenuButtonClick() {
        const isOpen = this.menuClass?.includes('slds-is-open');
        this.menuClass = SLDS_MENU_SELECTOR + (isOpen ? '' : ' slds-is-open');
    }

    /**
     * Fire REQUEST_TRANSCRIPT and close the menu
     * @returns {void}
     */
    onRequestTranscriptClick() {
        this.menuClass = SLDS_MENU_SELECTOR;
        dispatchMessagingEvent(MESSAGING_EVENT.REQUEST_TRANSCRIPT, {});
    }

    /**
     * Fire MENU_ITEM_SELECTED for a dynamic participant option
     * @param {Event} event - The click event from the menu option
     * @returns {void}
     * @todo Not sure if chatbotOptionsMenu is needed yet.
     */
    onMenuOptionClick(event) {
        const id = event?.currentTarget?.value;
        const selectedOption = this.chatbotOptionsMenu?.find((opt) => opt?.optionIdentifier === id);
        this.menuClass = SLDS_MENU_SELECTOR;
        if (selectedOption) {
            dispatchMessagingEvent(MESSAGING_EVENT.MENU_ITEM_SELECTED, { selectedOption });
        }
    }

    /**
     * Fire CLOSE_CONVERSATION to end the chat and close the menu
     * @returns {void}
     * @todo Not sure if check for isAuthenticatedContext is needed yet.
     */
    onEndChatClick() {
        this.menuClass = SLDS_MENU_SELECTOR;
        if (this.isAuthenticatedContext) {
            this.configuration?.util?.endSession();
        } else {
            dispatchMessagingEvent(MESSAGING_EVENT.CLOSE_CONVERSATION, {});
        }
    }

    /**
     * Handle click on the X button.
     * - If the conversation is still OPEN, minimize the window.
     * - If the conversation is CLOSED, fully close the container.
     * @returns {void}
     */
    onMinimizeButtonClick() {
        if (this.conversationStatus === 'OPEN') {
            dispatchMessagingEvent(MESSAGING_EVENT.MINIMIZE_BUTTON_CLICK, {});
        } else {
            dispatchMessagingEvent(MESSAGING_EVENT.CLOSE_CONTAINER, {});
        }
    }
}
