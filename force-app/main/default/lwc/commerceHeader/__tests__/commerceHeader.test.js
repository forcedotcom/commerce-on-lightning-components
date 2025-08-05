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

// Mock the eventStore as a virtual module
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
 * Helper function to simulate opening the dropdown menu and clicking the "End Chat" button.
 * This function performs the common workflow of:
 * 1. Finding and clicking the menu button to open the dropdown
 * 2. Waiting for DOM updates
 * 3. Finding and clicking the "End Chat" button (styled with error color)
 * @param {HTMLElement} element - The commerce header component element
 * @returns {Promise<void>} Promise that resolves when the actions are complete
 */
async function openMenuAndClickEndChat(element) {
    const menuButton = element.querySelector('button.menuButton');
    menuButton.click();
    await Promise.resolve();

    const endBtn = element.querySelector('button.slds-text-color_error');
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

    describe('Component Rendering', () => {
        it('renders all essential UI elements with correct initial state', () => {
            expect(element.querySelector('.brand-logo')).toBeTruthy();
            expect(element.querySelector('.headerTitle')).toBeTruthy();
            expect(element.querySelector('button.minimizeButton')).toBeTruthy();
            expect(element.querySelector('button.menuButton')).toBeTruthy();

            const headerElement = element.querySelector('.headerTitle');
            expect(headerElement.textContent).toBe('Chatting with Agent');

            const logoImg = element.querySelector('.brand-logo');
            expect(logoImg.src).toBeDefined();
            expect(logoImg.alt).toBeDefined();
        });
    });

    describe('Minimize Button Behavior', () => {
        it('dispatches correct events based on conversation status', () => {
            element.conversationStatus = 'OPEN';
            const minimizeBtn = element.querySelector('button.minimizeButton');

            minimizeBtn.click();
            expect(dispatchMessagingEvent).toHaveBeenCalledWith(MESSAGING_EVENT.MINIMIZE_BUTTON_CLICK, {});

            jest.clearAllMocks();
            element.conversationStatus = 'CLOSED';
            minimizeBtn.click();
            expect(dispatchMessagingEvent).toHaveBeenCalledWith(MESSAGING_EVENT.CLOSE_CONTAINER, {});
        });
    });

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

            const menuButton = element.querySelector('button.menuButton');
            const mockOptions = [
                { optionIdentifier: 'opt1', title: 'Option 1' },
                { optionIdentifier: 'opt2', title: 'Option 2' },
            ];

            participantJoinedHandler({ options: mockOptions });
            await Promise.resolve();

            menuButton.click();
            await Promise.resolve();

            let dynamicOptions = element.querySelectorAll('button[value]');
            expect(dynamicOptions.length).toBe(2);
            expect(dynamicOptions[0].value).toBe('opt1');

            participantLeftHandler();
            await Promise.resolve();

            dynamicOptions = element.querySelectorAll('button[value]');
            expect(dynamicOptions.length).toBe(0);

            participantJoinedHandler({ options: null });
            await Promise.resolve();
            dynamicOptions = element.querySelectorAll('button[value]');
            expect(dynamicOptions.length).toBe(0);

            participantJoinedHandler({ options: 'not an array' });
            await Promise.resolve();
            dynamicOptions = element.querySelectorAll('button[value]');
            expect(dynamicOptions.length).toBe(0);
        });
    });

    describe('Menu Functionality', () => {
        it('toggles menu open/close state', async () => {
            const menuButton = element.querySelector('button.menuButton');

            expect(element.querySelector('.slds-is-open')).toBeNull();

            menuButton.click();
            await Promise.resolve();
            expect(element.querySelector('.slds-is-open')).toBeTruthy();

            menuButton.click();
            await Promise.resolve();
            expect(element.querySelector('.slds-is-open')).toBeNull();
        });

        it('handles request transcript functionality based on configuration', async () => {
            const menuButton = element.querySelector('button.menuButton');
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

            const menuButton = element.querySelector('button.menuButton');
            menuButton.click();
            await Promise.resolve();

            expect(element.querySelector('.slds-is-open')).toBeTruthy();

            const dynamicOption = element.querySelector('button[value="opt1"]');
            expect(dynamicOption).toBeTruthy();

            dynamicOption.click();

            expect(dispatchMessagingEvent).toHaveBeenCalledWith(MESSAGING_EVENT.MENU_ITEM_SELECTED, {
                selectedOption: { optionIdentifier: 'opt1', title: 'Option 1' },
            });

            await Promise.resolve();
            expect(element.querySelector('.slds-is-open')).toBeNull();
        });
    });

    describe('Accessibility', () => {
        it('menu button exposes correct ARIA attributes and toggles dropdown visibility', async () => {
            // grab the trigger and the dropdown container
            const menuButton = element.querySelector('button.menuButton');
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

            // close via the “End Chat” button
            const endBtn = element.querySelector('button.slds-text-color_error');
            endBtn.click();
            await Promise.resolve();

            expect(menuButton.getAttribute('aria-expanded')).toBe('false');
            expect(menuSection.hasAttribute('hidden')).toBe(true);
        });
    });
});
