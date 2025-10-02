/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { createElement } from 'lwc';
import CommerceHeader from 'c/commerceHeader';
import { dispatchMessagingEvent, MESSAGING_EVENT } from 'lightningsnapin/eventStore';

// Mock styling utilities
jest.mock(
    'experience/styling',
    () => ({
        generateButtonSizeClass: jest.fn(() => 'mock-size'),
        generateButtonStretchClass: jest.fn(() => 'mock-stretch'),
        generateButtonStyleClass: jest.fn(() => 'mock-style'),
        generateElementAlignmentClass: jest.fn(() => 'mock-alignment'),
    }),
    { virtual: true }
);

// Mock event store
jest.mock(
    'lightningsnapin/eventStore',
    () => ({
        dispatchMessagingEvent: jest.fn(),
        assignMessagingEventHandler: jest.fn(),
        MESSAGING_EVENT: {
            MINIMIZE_BUTTON_CLICK: 'MINIMIZE_BUTTON_CLICK',
            CLOSE_CONTAINER: 'CLOSE_CONTAINER',
            CLOSE_CONVERSATION: 'CLOSE_CONVERSATION',
            UPDATE_HEADER_TEXT: 'UPDATE_HEADER_TEXT',
            PARTICIPANT_JOINED: 'PARTICIPANT_JOINED',
            PARTICIPANT_LEFT: 'PARTICIPANT_LEFT',
            REQUEST_TRANSCRIPT: 'REQUEST_TRANSCRIPT',
            MENU_ITEM_SELECTED: 'MENU_ITEM_SELECTED',
        },
    }),
    { virtual: true }
);

/**
 * Helper function to simulate opening the dropdown menu and clicking the "End Chat" c-common-button.
 * This function performs the common workflow of:
 * 1. Finding and clicking the menu button to open the dropdown
 * 2. Waiting for DOM updates
 * 3. Finding and clicking the "End Chat" button (styled with error color)
 * @param {HTMLElement} element - The commerce header component element
 * @returns {Promise<void>} Promise that resolves when the actions are complete
 */
async function openMenuAndClickEndChat(element) {
    const menuButton = element.querySelector('c-common-button.menuButton');
    menuButton.click();
    await Promise.resolve();

    const endBtn = element.querySelector('c-common-button.end-chat-button');
    endBtn.click();
}

/**
 * Helper function to find the "Request Transcript" button in the dropdown menu.
 * Searches through all dropdown menu buttons and finds the one containing "Request" text.
 * @param {HTMLElement} element - The commerce header component element
 * @returns {HTMLElement|undefined} The request transcript button element, or undefined if not found
 */
function findTranscriptButton(element) {
    const transcriptButtons = Array.from(element.querySelectorAll('.slds-dropdown__item button'));
    return transcriptButtons.find((btn) => btn.textContent.includes('Request'));
}

/**
 * Helper function to create a test configuration object with common properties.
 * Provides a consistent way to create configuration objects for different test scenarios.
 * @param {string} [authMode] - The authentication mode ('Auth' or 'UnAuth')
 * @returns {object} Configuration object with messaging channel, util, and transcript properties
 */
function createTestConfig(authMode = 'UnAuth') {
    return {
        embeddedServiceMessagingChannel: { authMode },
        util: { endSession: jest.fn() },
        transcript: {},
    };
}

describe('c-commerce-header', () => {
    let element;

    beforeEach(() => {
        element = createElement('c-commerce-header', { is: CommerceHeader });
        document.body.appendChild(element);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    // Test basic component rendering
    describe('Component Rendering', () => {
        it('renders all essential UI elements with correct initial state', () => {
            expect(element.querySelector('.brand-logo')).toBeTruthy();
            expect(element.querySelector('.headerTitle')).toBeTruthy();
            expect(element.querySelector('c-common-button.minimizeButton')).toBeTruthy();
            expect(element.querySelector('c-common-button.menuButton')).toBeTruthy();

            const headerElement = element.querySelector('.headerTitle');
            expect(headerElement.textContent).toBe('Chatting with Agent');

            const logoImg = element.querySelector('.brand-logo');
            expect(logoImg.src).toBeDefined();
            expect(logoImg.alt).toBeDefined();
        });
    });

    // Test minimize button behavior
    describe('Minimize Button Behavior', () => {
        it('dispatches correct events based on conversation status', () => {
            element.conversationStatus = 'OPEN';
            const minimizeBtn = element.querySelector('c-common-button.minimizeButton');

            minimizeBtn.click();
            expect(dispatchMessagingEvent).toHaveBeenCalledWith(MESSAGING_EVENT.MINIMIZE_BUTTON_CLICK, {});

            jest.clearAllMocks();
            element.conversationStatus = 'CLOSED';
            minimizeBtn.click();
            expect(dispatchMessagingEvent).toHaveBeenCalledWith(MESSAGING_EVENT.CLOSE_CONTAINER, {});
        });
    });

    // Test end chat functionality
    describe('End Chat Functionality', () => {
        it('handles authenticated vs unauthenticated contexts correctly', async () => {
            const config = createTestConfig();
            element.configuration = config;

            // Test unauthenticated context
            await openMenuAndClickEndChat(element);
            expect(dispatchMessagingEvent).toHaveBeenCalledWith(MESSAGING_EVENT.CLOSE_CONVERSATION, {});
            expect(config.util.endSession).not.toHaveBeenCalled();

            // Test authenticated context
            jest.clearAllMocks();
            element.configuration = createTestConfig('Auth');

            await openMenuAndClickEndChat(element);
            expect(element.configuration.util.endSession).toHaveBeenCalled();
            expect(dispatchMessagingEvent).not.toHaveBeenCalledWith(
                MESSAGING_EVENT.CLOSE_CONVERSATION,
                expect.anything()
            );
        });
    });

    // Test messaging event integration
    describe('Messaging Event Integration', () => {
        it('registers all required event handlers', () => {
            const { assignMessagingEventHandler } = require('lightningsnapin/eventStore');
            expect(assignMessagingEventHandler).toHaveBeenCalledWith(
                MESSAGING_EVENT.UPDATE_HEADER_TEXT,
                expect.any(Function)
            );
            expect(assignMessagingEventHandler).toHaveBeenCalledWith(
                MESSAGING_EVENT.PARTICIPANT_JOINED,
                expect.any(Function)
            );
            expect(assignMessagingEventHandler).toHaveBeenCalledWith(
                MESSAGING_EVENT.PARTICIPANT_LEFT,
                expect.any(Function)
            );
        });

        it('handles header text updates correctly', async () => {
            const { assignMessagingEventHandler } = require('lightningsnapin/eventStore');
            const updateHeaderHandler = assignMessagingEventHandler.mock.calls.find(
                (call) => call[0] === MESSAGING_EVENT.UPDATE_HEADER_TEXT
            )[1];
            const headerElement = element.querySelector('.headerTitle');

            updateHeaderHandler({ text: 'New Header Text' });
            await Promise.resolve();
            expect(headerElement.textContent).toBe('New Header Text');

            updateHeaderHandler(null);
            await Promise.resolve();
            expect(headerElement.textContent).toBe('Chatting with Agent');

            updateHeaderHandler({ text: '' });
            await Promise.resolve();
            expect(headerElement.textContent).toBe('Chatting with Agent');
        });

        it('manages participant options correctly', async () => {
            const { assignMessagingEventHandler } = require('lightningsnapin/eventStore');
            const participantJoinedHandler = assignMessagingEventHandler.mock.calls.find(
                (call) => call[0] === MESSAGING_EVENT.PARTICIPANT_JOINED
            )[1];
            const participantLeftHandler = assignMessagingEventHandler.mock.calls.find(
                (call) => call[0] === MESSAGING_EVENT.PARTICIPANT_LEFT
            )[1];

            const menuButton = element.querySelector('c-common-button.menuButton');
            const mockOptions = [
                { optionIdentifier: 'opt1', title: 'Option 1' },
                { optionIdentifier: 'opt2', title: 'Option 2' },
            ];

            participantJoinedHandler({ options: mockOptions });
            await Promise.resolve();

            menuButton.click();
            await Promise.resolve();

            let dynamicOptions = element.querySelectorAll('c-common-button[data-option-id]');
            expect(dynamicOptions.length).toBe(2);
            expect(dynamicOptions[0].dataset.optionId).toBe('opt1');

            participantLeftHandler();
            await Promise.resolve();

            dynamicOptions = element.querySelectorAll('c-common-button[data-option-id]');
            expect(dynamicOptions.length).toBe(0);

            participantJoinedHandler({ options: null });
            await Promise.resolve();
            dynamicOptions = element.querySelectorAll('c-common-button[data-option-id]');
            expect(dynamicOptions.length).toBe(0);

            participantJoinedHandler({ options: 'not an array' });
            await Promise.resolve();
            dynamicOptions = element.querySelectorAll('c-common-button[data-option-id]');
            expect(dynamicOptions.length).toBe(0);
        });
    });

    // Test menu functionality
    describe('Menu Functionality', () => {
        it('toggles menu open/close state', async () => {
            const menuButton = element.querySelector('c-common-button.menuButton');

            expect(element.querySelector('.slds-is-open')).toBeNull();

            menuButton.click();
            await Promise.resolve();
            expect(element.querySelector('.slds-is-open')).toBeTruthy();

            menuButton.click();
            await Promise.resolve();
            expect(element.querySelector('.slds-is-open')).toBeNull();
        });

        it('handles request transcript functionality based on configuration', async () => {
            const menuButton = element.querySelector('c-common-button.menuButton');
            const config = createTestConfig();

            config.transcript.allowTranscriptDownload = true;
            element.configuration = config;
            element.conversationStatus = 'OPEN';
            await Promise.resolve();

            menuButton.click();
            await Promise.resolve();

            let requestTranscriptBtn = findTranscriptButton(element);
            expect(requestTranscriptBtn).toBeTruthy();

            requestTranscriptBtn.click();
            expect(dispatchMessagingEvent).toHaveBeenCalledWith(MESSAGING_EVENT.REQUEST_TRANSCRIPT, {});

            jest.clearAllMocks();
            element.conversationStatus = 'NOT_STARTED';
            await Promise.resolve();

            menuButton.click();
            await Promise.resolve();
            requestTranscriptBtn = findTranscriptButton(element);
            expect(requestTranscriptBtn).toBeFalsy();

            element.conversationStatus = 'OPEN';
            config.transcript.allowTranscriptDownload = false;
            element.configuration = config;
            await Promise.resolve();

            menuButton.click();
            await Promise.resolve();
            requestTranscriptBtn = findTranscriptButton(element);
            expect(requestTranscriptBtn).toBeFalsy();
        });
    });

    // Test dynamic menu options
    describe('Dynamic Menu Options', () => {
        it('handles dynamic option selection and menu closure', async () => {
            const { assignMessagingEventHandler } = require('lightningsnapin/eventStore');
            const participantJoinedHandler = assignMessagingEventHandler.mock.calls.find(
                (call) => call[0] === MESSAGING_EVENT.PARTICIPANT_JOINED
            )[1];

            const mockOptions = [
                { optionIdentifier: 'opt1', title: 'Option 1' },
                { optionIdentifier: 'opt2', title: 'Option 2' },
            ];

            participantJoinedHandler({ options: mockOptions });
            await Promise.resolve();

            const menuButton = element.querySelector('c-common-button.menuButton');
            menuButton.click();
            await Promise.resolve();

            expect(element.querySelector('.slds-is-open')).toBeTruthy();

            const dynamicOption = element.querySelector('c-common-button[data-option-id="opt1"]');
            expect(dynamicOption).toBeTruthy();

            dynamicOption.click();

            expect(dispatchMessagingEvent).toHaveBeenCalledWith(MESSAGING_EVENT.MENU_ITEM_SELECTED, {
                selectedOption: { optionIdentifier: 'opt1', title: 'Option 1' },
            });

            await Promise.resolve();
            expect(element.querySelector('.slds-is-open')).toBeNull();
        });
    });

    // Test accessibility features
    describe('Accessibility', () => {
        it('menu button exposes correct ARIA attributes and toggles dropdown visibility', async () => {
            // grab the trigger and the dropdown container
            const menuButton = element.querySelector('c-common-button.menuButton');
            const menuSection = element.querySelector('#menuOptions');

            // initial state: closed
            expect(menuButton.getAttribute('aria-haspopup')).toBe('true');
            expect(menuButton.getAttribute('aria-controls')).toBe('menuOptions');
            expect(menuButton.getAttribute('aria-expanded')).toBe('false');
            expect(menuSection.hasAttribute('hidden')).toBe(true);
            expect(menuSection.getAttribute('aria-hidden')).toBe('true');

            // open the menu
            menuButton.click();
            await Promise.resolve();

            expect(menuButton.getAttribute('aria-expanded')).toBe('true');
            expect(menuSection.hasAttribute('hidden')).toBe(false);
            expect(menuSection.getAttribute('aria-hidden')).toBe('false');

            // close via the "End Chat" button
            const endBtn = element.querySelector('c-common-button.end-chat-button');
            endBtn.click();
            await Promise.resolve();

            expect(menuButton.getAttribute('aria-expanded')).toBe('false');
            expect(menuSection.hasAttribute('hidden')).toBe(true);
        });
    });

    // Test internationalization functionality
    describe('Internationalization', () => {
        it('displays English labels when no language is configured', async () => {
            // No configuration set - should default to English
            await Promise.resolve();

            // Check that menu button has English title
            const menuButton = element.querySelector('c-common-button.menuButton');
            expect(menuButton.title).toBe('Menu');

            // Check logo alt text
            const logoImg = element.querySelector('.brand-logo');
            expect(logoImg.alt).toBe('Logo');
        });

        it('displays Spanish labels when Spanish language is configured', async () => {
            element.configuration = { language: 'es' };
            await Promise.resolve();

            // Check that menu button has Spanish title
            const menuButton = element.querySelector('c-common-button.menuButton');
            expect(menuButton.title).toBe('Menú');

            // Check logo alt text
            const logoImg = element.querySelector('.brand-logo');
            expect(logoImg.alt).toBe('Logotipo');

            // Check minimize button - component uses i18n.minimize for aria-label
            const minimizeButton = element.querySelector('c-common-button.minimizeButton');
            expect(minimizeButton.title).toBe('Minimizar');
            expect(minimizeButton.getAttribute('aria-label')).toBe('Minimizar');

            // Check that the component renders correctly with Spanish labels
            expect(menuButton.title).toBe('Menú');
        });

        it('displays French labels when French language is configured', async () => {
            element.configuration = { language: 'fr' };
            await Promise.resolve();

            // Check that menu button has French title
            const menuButton = element.querySelector('c-common-button.menuButton');
            expect(menuButton.title).toBe('Menu');

            // Check logo alt text
            const logoImg = element.querySelector('.brand-logo');
            expect(logoImg.alt).toBe('Logo');

            // Check minimize button - component uses i18n.minimize for aria-label
            const minimizeButton = element.querySelector('c-common-button.minimizeButton');
            expect(minimizeButton.title).toBe('Réduire');
            expect(minimizeButton.getAttribute('aria-label')).toBe('Réduire');

            // Check that the component renders correctly with French labels
            expect(menuButton.title).toBe('Menu');
        });

        it('displays translated text in all UI elements', async () => {
            element.configuration = { language: 'es' };
            await Promise.resolve();

            // Check minimize button - component uses i18n.minimize for aria-label
            const minimizeButton = element.querySelector('c-common-button.minimizeButton');
            expect(minimizeButton.title).toBe('Minimizar');
            expect(minimizeButton.getAttribute('aria-label')).toBe('Minimizar');

            // Check logo alt text
            const logoImg = element.querySelector('.brand-logo');
            expect(logoImg.alt).toBe('Logotipo');

            // Check that the component renders correctly with Spanish labels
            const menuButton = element.querySelector('c-common-button.menuButton');
            expect(menuButton.title).toBe('Menú');
        });

        it('updates translations when language configuration changes', async () => {
            // Start with English
            element.configuration = { language: 'en_US' };
            await Promise.resolve();

            let menuButton = element.querySelector('c-common-button.menuButton');
            expect(menuButton.title).toBe('Menu');

            // Change to Spanish
            element.configuration = { language: 'es' };
            await Promise.resolve();

            expect(menuButton.title).toBe('Menú');

            // Change to French
            element.configuration = { language: 'fr' };
            await Promise.resolve();

            expect(menuButton.title).toBe('Menu');
        });

        it('handles undefined or null language configuration gracefully', async () => {
            // Test with undefined language
            element.configuration = { language: undefined };
            await Promise.resolve();

            // Should default to English
            const menuButton = element.querySelector('c-common-button.menuButton');
            expect(menuButton.title).toBe('Menu');

            // Test with null language
            element.configuration = { language: null };
            await Promise.resolve();
            expect(menuButton.title).toBe('Menu');

            // Test with empty string language
            element.configuration = { language: '' };
            await Promise.resolve();
            expect(menuButton.title).toBe('Menu');

            // Test with no configuration at all
            element.configuration = undefined;
            await Promise.resolve();
            expect(menuButton.title).toBe('Menu');
        });
    });
});
