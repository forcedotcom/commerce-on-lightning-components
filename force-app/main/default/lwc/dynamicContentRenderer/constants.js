/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */

// --- Message Content Constants ---
export const MESSAGE_CONTENT_CLASS = 'embedded-messaging-message-content';

// --- Participant Type Constants ---
export const ENDUSER = 'EndUser';
export const AGENT = 'Agent';
export const CHATBOT = 'Chatbot';
export const PARTICIPANT_TYPES = Object.freeze([ENDUSER, AGENT, CHATBOT]);

// --- Content Type Constants ---
export const CONTENT_TYPES = Object.freeze({
    PRODUCT_RECOMMENDATIONS: 'B2CProductSearchActionResultsRepresentation',
    PRODUCT_DETAILS: 'B2CMultipleProductDetailsRepresentation',
    CART_SUMMARY: 'B2CCartSummaryRepresentation',
    ORDER_CONFIRMATION: 'B2COrderConfirmationDetails',
    ORDER_COMPLETED: 'orderCompleted',
});

// --- Component Configuration Mapping ---
export const CONTENT_TYPE_COMPONENT_MAP = Object.freeze({
    [CONTENT_TYPES.PRODUCT_RECOMMENDATIONS]: {
        componentName: 'c-product-search-recommendations',
        dataProcessor: 'processProductRecommendations',
        eventHandlers: ['onaddtocart', 'onselectcategory', 'onshowproduct', 'onselectoption'],
    },
    [CONTENT_TYPES.PRODUCT_DETAILS]: {
        componentName: 'c-product-details',
        dataProcessor: 'processProductDetails',
        eventHandlers: ['onaddtocart'],
    },
    [CONTENT_TYPES.CART_SUMMARY]: {
        componentName: 'c-cart-summary',
        dataProcessor: 'processCartSummary',
        eventHandlers: ['oncheckout'],
    },
    [CONTENT_TYPES.ORDER_CONFIRMATION]: {
        componentName: 'c-summary-details',
        dataProcessor: 'processOrderConfirmation',
        eventHandlers: [],
    },
});

// --- Default Configuration for Rich Text ---
export const DEFAULT_RICH_TEXT_CONFIG = Object.freeze({
    componentName: 'lightning-formatted-rich-text',
    dataProcessor: null, // Rich text content doesn't need data processing
    eventHandlers: [],
});

// --- Payment Method Mapping ---
export const PAYMENT_METHOD_MAP = {
    applepay: 'Apple Pay',
    googlepay: 'Google Pay',
};

// --- Suggested Actions Constants ---
// Defines the types of suggested actions that can be presented to users.
export const SUGGESTED_ACTIONS_TYPES = Object.freeze({
    QUESTION: 'QUESTION_WITH_ANSWERS',
});

// --- Suggested Actions Options Types Constants ---
// Defines the types of options within each action
export const SUGGESTED_ACTIONS_OPTIONS_TYPES = Object.freeze({
    UTTERANCE_SUGGESTION: 'UTTERANCE_SUGGESTIONS',
});
