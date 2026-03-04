/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';
import * as Labels from './labelUtils';
import { marked } from './marked.esm.js';
import {
    MESSAGE_CONTENT_CLASS,
    ENDUSER,
    PARTICIPANT_TYPES,
    CONTENT_TYPES,
    CONTENT_TYPE_COMPONENT_MAP,
    DEFAULT_RICH_TEXT_CONFIG,
    PAYMENT_METHOD_MAP,
    SUGGESTED_ACTIONS_TYPES,
    SUGGESTED_ACTIONS_OPTIONS_TYPES,
} from './constants';

/**
 * A Lightning Web Component (LWC) that renders dynamic content within a commerce messaging interface.
 *
 * This component acts as a versatile renderer, capable of displaying various types of message payloads,
 * ranging from plain text to complex structured data like product recommendations, product details,
 * and cart summaries. It intelligently parses incoming `conversationEntry` data, determines the
 * appropriate rendering strategy, and facilitates interactive commerce actions such as "Add to Cart"
 * or "Show Product" by sending structured messages back to the messaging system.
 *
 * It operates in **Light DOM**, meaning its internal structure is exposed to the document's global
 * stylesheet, offering flexibility in styling and simpler accessibility integration.
 * @class
 * @augments LightningElement
 * @fires CustomEvent#addtocart - Dispatched by a child component when a user clicks 'Add to Cart'. `detail` contains the product name.
 * @fires CustomEvent#selectcategory - Dispatched by a child component when a user selects a category. `detail` contains category name and ID.
 * @fires CustomEvent#showproduct - Dispatched by a child component when a user wants to view a product. `detail` contains product name and ID.
 * @fires CustomEvent#selectoption - Dispatched by a child component when a user selects an option from suggested actions. `detail` contains option display value and utterance.
 * @fires CustomEvent#payment - Dispatched by a child component upon completion or failure of a payment action. `detail` contains order number on success, or a falsy value on failure.
 * @fires CustomEvent#selectcontext - Dispatched by a child component when a user selects a context. `detail` contains context name.
 * @fires CustomEvent#cartapplycoupon - Dispatched by a child component when a user applies a coupon code. `detail` contains the coupon code.
 */
export default class DynamicContentRenderer extends LightningElement {
    /**
     * Specifies the render mode for the component.
     * Setting this to 'light' means the component's content is rendered directly into the host element,
     * making it accessible to global CSS and standard DOM APIs, simplifying styling and accessibility.
     * @type {string}
     */
    static renderMode = 'light';

    /**
     * Static counter to track component instances for proper cleanup.
     * @type {number}
     * @private
     */
    static _instanceCounter = 0;

    /**
     * Reference to the latest component instance for message handling.
     * @type {DynamicContentRenderer|null}
     * @private
     */
    static _latestInstance = null;

    // =========================================================
    // Private Internal State
    // =========================================================

    /** @type {Array<object>} */
    productData = [];

    /** @type {string} */
    productsDescription = '';

    /** @type {Array<object>} */
    productVariants = [];

    /** @type {object} */
    productDetails = {};

    /** @type {object} */
    cartSummary = {};

    /**
     * Private property storing the complete conversation entry object.
     * This object contains metadata about the message, including sender details and the raw payload.
     * @type {object|undefined}
     * @private
     */
    _conversationEntry;

    /**
     * Private property storing the processed message content.
     * Depending on the payload, this can be a raw static text string, or a parsed JavaScript object
     * representing structured content (e.g., product recommendations, cart summary).
     * @type {string|object|undefined}
     * @private
     */
    _parsedMessageContent;

    /**
     * Private property indicating the determined content type of the current message payload.
     * This internal state drives which specific data processing logic and child component should be used.
     * If no specific structured content type is identified, it defaults to an empty string,
     * indicating generic rich text content.
     * @type {string}
     * @private
     */
    _currentContentType = '';

    /**
     * Private property used to cache the processed `dynamicComponentData`.
     * This cache optimizes performance by storing the result of data processing,
     * preventing redundant calculations if the underlying content has not changed.
     * @type {object|null}
     * @private
     */
    _cachedDynamicComponentData = null;

    /**
     * Private reactive property storing the ID of the current conversation entry.
     * This ID can be used for tracking or as a key in HTML templates.
     * @type {string}
     * @private
     */
    _entryId = '';

    /**
     * Private property storing contextual data received from PWA via postMessage.
     * This data is used to populate the conversational context component.
     * @type {Array<object>|null}
     * @private
     */
    _contextualData = null;

    /**
     * Private property storing the contextual description text.
     * This provides instructions to users about how to interact with contextual options.
     * @type {string}
     * @private
     */
    _contextualDescription = '';

    /**
     * Private property storing the instance ID for this component instance.
     * Used for proper cleanup and instance management.
     * @type {number|null}
     * @private
     */
    _instanceId = null;

    /**
     * Private property storing the bound message handler for cleanup.
     * @type {Function|null}
     * @private
     */
    _boundMessageHandler = null;

    /**
     * Flag to track whether the markdown parser has been initialized.
     * @type {boolean}
     * @private
     */
    _markdownParserInitialized = false;

    // =========================================================
    // Public API - Properties and Setters/Getters (@api decorated)
    // =========================================================

    /**
     * Configuration object provided to the component, essential for interacting with the messaging system.
     * It typically includes a `util` object with a `sendTextMessage` method for dispatching messages.
     * @type {object}
     * @property {object} util - Utility functions.
     * @property {function(string): void} util.sendTextMessage - A function to send a text message back to the conversation.
     */
    @api configuration;

    /**
     * Sets the `conversationEntry` object for the component.
     * This setter triggers the processing of the incoming message payload to identify its content type
     * and extract relevant data for rendering. Includes validation to ensure a valid object is received.
     * If an invalid value is provided, the component's internal state is reset.
     * @param {object} value - The conversation entry object, typically containing `id`, `sender` (with `role`), and `entryPayload`.
     */
    @api
    set conversationEntry(value) {
        // --- Input Validation: Ensure 'value' is a valid object ---
        if (!value || typeof value !== 'object') {
            this.resetState(); // Reset to clear any previous invalid state
            return;
        }

        this._conversationEntry = value;
        this.processEntryPayload();
    }

    /**
     * Get the current language for translations.
     * Falls back to English ('en') if no language is configured.
     * @returns {string} The current language code (e.g., 'en', 'es', 'fr')
     */
    @api
    get language() {
        return this.configuration?.language || 'en_US';
    }

    /**
     * Get translated labels based on current language
     * @returns {object} Object with translated label strings
     */
    @api
    get i18n() {
        const language = this.language;
        return {
            productSelectionTextMessageLabel: Labels.productSelectionTextMessageLabel(language),
            addToCartMessageLabel: Labels.addToCartMessageLabel(language),
            addToCartMessageWithNoVariationsLabel: Labels.addToCartMessageWithNoVariationsLabel(language),
            applyCouponCodeLabel: Labels.applyCouponCodeLabel(language),
            invalidResponseMessageLabel: Labels.invalidResponseMessageLabel(language),
            paymentCompletedLabel: Labels.paymentCompletedLabel(language),
            paymentFailedLabel: Labels.paymentFailedLabel(language),
            paymentCanceledLabel: Labels.paymentCanceledLabel(language),
            fallbackPaymentSucceededLabel: Labels.fallbackPaymentSucceededLabel(language),
            fallbackPaymentFailedLabel: Labels.fallbackPaymentFailedLabel(language),
            dynamicContentRegionAriaLabel: Labels.dynamicContentRegionAriaLabel(language),
            richTextMessageContentAriaLabel: Labels.richTextMessageContentAriaLabel(language),
            applePayPaymentFailedLabel: Labels.applePayPaymentFailedLabel(language),
            applePayPaymentCanceledLabel: Labels.applePayPaymentCanceledLabel(language),
            applePayPaymentCompletedLabel: Labels.applePayPaymentCompletedLabel(language),
            contextualDescriptionLabel: Labels.contextualDescriptionLabel(language),
            showMoreProductsLabel: Labels.showMoreProductsLabel(language),
        };
    }

    /**
     * Determines if the current EndUser message content is longer than 40 characters.
     * This is used to conditionally apply different max-width styling for longer messages.
     * @returns {boolean} True if the message content is more than 40 characters, false otherwise.
     */
    get isLongEndUserMessage() {
        if (this.sender !== 'EndUser') {
            return false;
        }

        // Check if this is an orderCompleted structured message - always treat as short
        if (this.isOrderCompleted) {
            return false;
        }

        // For other messages, check the actual text content length
        const content = this.textContent;
        return typeof content === 'string' && content.length > 40;
    }

    /**
     * Returns the class name for the message bubble based on sender role.
     * Includes a defensive fallback if sender role is not supported.
     * @returns {string} A space-separated string of class names for the message bubble.
     */
    @api
    get generateMessageBubbleClassname() {
        if (this.isSupportedSender()) {
            const baseClasses = `${MESSAGE_CONTENT_CLASS} ${this.sender}`;
            const welcomeClass = this.isWelcomeMessage ? 'welcome-message' : '';
            const longMessageClass = this.isLongEndUserMessage ? 'long-message' : '';
            return [baseClasses, welcomeClass, longMessageClass].filter(Boolean).join(' ');
        }
        return MESSAGE_CONTENT_CLASS; // Default class to ensure styling is applied
    }

    /**
     * Returns the localized text for a successfully completed order.
     * This text is dynamically generated based on the payment method from the parsed message content.
     * Falls back to the generic payment succeeded label if no payment method is found.
     * @returns {string} The formatted order completion text.
     */
    @api
    get orderCompletedText() {
        // Check if we have parsed message content with payment method
        const method = this._parsedMessageContent?.orderCompleted?.paymentMethod;
        if (method) {
            return this.i18n.paymentCompletedLabel.replace('{0}', this._getPaymentMethodDisplayName(method));
        }
        // Fallback to the generic payment succeeded label
        return this.i18n.fallbackPaymentSucceededLabel;
    }

    // =========================================================
    // Getters for Derived State / Conditional Rendering (Used in HTML and internally)
    // =========================================================
    /**
     * Gets the ID of the current conversation entry.
     * This property is publicly accessible and often used in the component's HTML template for keying or identification.
     * @returns {string} The ID of the conversation entry, or an empty string if not available.
     */
    get entryId() {
        return this._entryId;
    }

    /**
     * Gets the determined content type of the current message.
     * This value dictates which specific rendering logic and data processing methods should be applied.
     * @returns {string} The content type (e.g., 'productRecommendations', 'cartSummary', or an empty string for rich text).
     */
    get contentType() {
        return this._currentContentType;
    }

    /**
     * Gets the current `conversationEntry` object.
     * @returns {object|undefined} The conversation entry object, or `undefined` if not set or invalid.
     */
    get conversationEntry() {
        return this._conversationEntry;
    }

    /**
     * Returns the aria-label text for the main conversation message content region.
     * @returns {string} The localized label.
     */
    get ariaLabelConversationContent() {
        const role = this._conversationEntry?.sender?.role;
        const message = this.i18n.dynamicContentRegionAriaLabel.replace('{0}', role).replace('{1}', this.contentType);
        return message;
    }

    /**
     * Returns the aria-label text for generic rich text message content.
     * @returns {string} The localized label.
     */
    get ariaLabelRichTextContent() {
        const role = this._conversationEntry?.sender?.role;
        const message = this.i18n.richTextMessageContentAriaLabel.replace('{0}', role);
        return message;
    }

    /**
     * Gets the role of the sender from the current `conversationEntry`.
     * This getter provides a safe way to access nested sender information.
     * @returns {string|undefined} The sender's role (e.g., 'EndUser', 'Agent', or 'Chatbot'), or `undefined` if not available.
     */
    get sender() {
        // Defensive check for nested properties
        return this._conversationEntry?.sender?.role;
    }

    /**
     * Indicates whether the current content type is 'productRecommendations'.
     * Used for conditional rendering in the HTML template.
     * @returns {boolean} `true` if the content type matches `CONTENT_TYPES.PRODUCT_RECOMMENDATIONS`, `false` otherwise.
     */
    get isProductRecommendations() {
        return this.contentType === CONTENT_TYPES.PRODUCT_RECOMMENDATIONS;
    }

    /**
     * Indicates whether the current content type is 'productDetails'.
     * Used for conditional rendering in the HTML template.
     * @returns {boolean} `true` if the content type matches `CONTENT_TYPES.PRODUCT_DETAILS`, `false` otherwise.
     */
    get isProductDetails() {
        return this.contentType === CONTENT_TYPES.PRODUCT_DETAILS;
    }

    /**
     * Indicates whether the current content type is 'cartSummary'.
     * Used for conditional rendering in the HTML template.
     * @returns {boolean} `true` if the content type matches `CONTENT_TYPES.CART_SUMMARY`, `false` otherwise.
     */
    get isCartSummary() {
        return this.contentType === CONTENT_TYPES.CART_SUMMARY;
    }

    /**
     * Indicates whether the current content type is 'orderConfirmation'.
     * Used for conditional rendering in the HTML template.
     * @returns {boolean} `true` if the content type matches `CONTENT_TYPES.ORDER_CONFIRMATION`, `false` otherwise.
     */
    get isOrderConfirmation() {
        return this.contentType === CONTENT_TYPES.ORDER_CONFIRMATION;
    }

    /**
     * Indicates whether the current content type is 'orderCompleted'.
     * Used for conditional rendering in the HTML template.
     * @returns {boolean} `true` if the content type matches `CONTENT_TYPES.ORDER_COMPLETED`, `false` otherwise.
     */
    get isOrderCompleted() {
        return this.contentType === CONTENT_TYPES.ORDER_COMPLETED;
    }

    /**
     * Indicates whether the current message is conv context questions (className B2CConvContextQuestionRepresentation).
     * Used for conditional rendering to show generated questions as text.
     * @returns {boolean} `true` if the content type matches `CONTENT_TYPES.CONV_CONTEXT_QUESTIONS`, `false` otherwise.
     */
    get isConvContextData() {
        return this.contentType === CONTENT_TYPES.CONV_CONTEXT_QUESTIONS;
    }

    /**
     * Returns the generated questions text from convContextQuestions payload for display.
     * Used when the payload has className B2CConvContextQuestionRepresentation.
     * @returns {string} The generated questions string, or empty string if not present.
     */
    get generatedQuestions() {
        const questions = this._parsedMessageContent?.convContextQuestions?.generatedQuestions;
        return typeof questions === 'string' ? questions : '';
    }

    /**
     * Comprehensive JSDoc documentation for the richTextClasses getter.
     * This getter computes CSS classes for rich text content based on whether an image is present.
     * It adjusts padding to accommodate image content - removes padding when images are present
     * to prevent excessive spacing, and adds standard padding when no images are detected.
     * @returns {string} CSS class string - 'slds-p-around_none' if image present, 'slds-p-around_small' otherwise.
     */
    get richTextClasses() {
        return this.hasImage ? 'slds-p-around_none' : 'slds-p-around_small';
    }

    /**
     * Determines whether the current message content contains an image element.
     * Uses regex pattern matching to detect HTML img tags within the parsed message content.
     * This is used to conditionally apply styling and layout adjustments for image-containing content.
     * @returns {boolean} True if an img tag is detected in the content, false otherwise.
     */
    get hasImage() {
        if (!this._parsedMessageContent) return false;

        // Detect if the content has an <img> tag
        const regex = /<img\b[^>]*>/i;
        return regex.test(this._parsedMessageContent);
    }

    /**
     * Returns the content intended for display as rich text by `lightning-formatted-rich-text`.
     * This can be the original static text string or a raw parsed JSON object if it's an unrecognized
     * structured type that should still be rendered as text.
     * Only parses markdown for Agent and Chatbot messages, not for EndUser messages.
     * For EndUser messages, automatically strips content in parentheses for cleaner display.
     * @returns {string} The extracted or parsed message content, suitable for rich text rendering.
     */
    get textContent() {
        if (typeof this._parsedMessageContent === 'string') {
            let content = this._parsedMessageContent;

            // For EndUser messages, strip content in parentheses (e.g., product IDs) for cleaner display
            if (this.sender === 'EndUser') {
                content = content.replace(/\s*\([^)]*\)\s*$/, '').trim();
            }

            // Only parse markdown for Agent and Chatbot messages, not for EndUser
            const shouldParseMarkdown = this.sender !== 'EndUser';
            return shouldParseMarkdown ? this._parseMarkdownToHtml(content) : content;
        }
        if (typeof this._parsedMessageContent === 'object' && this._parsedMessageContent !== null) {
            return JSON.stringify(this._parsedMessageContent, null, 2);
        }
        return '';
    }

    /**
     * Computes and returns the dynamic component data for the current content type.
     * This getter acts as the centralized point for preparing and structuring data
     * to be passed to child components. It incorporates a caching mechanism to avoid
     * redundant data processing if the content type or parsed message content has not changed.
     * Includes contextual data and description only for welcome messages.
     * @returns {object} The processed data object specific to the `_currentContentType`.
     * Returns an empty object if no specific data processor is defined or if an error occurs during processing.
     * Includes `contextualData` and `contextualDescription` properties only for welcome messages.
     */
    get dynamicComponentData() {
        // Cache invalidation logic: if content type, parsed message content, or contextual data (for welcome messages) has changed
        if (
            this._cachedDynamicComponentData &&
            this._cachedDynamicComponentData.contentType === this._currentContentType &&
            this._cachedDynamicComponentData.parsedMessageContent === this._parsedMessageContent &&
            (!this.isWelcomeMessage ||
                (this._cachedDynamicComponentData.contextualData === this._contextualData &&
                    this._cachedDynamicComponentData.contextualDescription === this._contextualDescription))
        ) {
            return this._cachedDynamicComponentData.data;
        }

        const config = this.getComponentConfig();
        let data = {};

        // Only call data processor if it's defined and is a function
        if (config.dataProcessor && typeof this[config.dataProcessor] === 'function') {
            try {
                data = this[config.dataProcessor]();
            } catch (error) {
                data = {};
            }
        }

        // Only include contextual data and description for welcome messages
        if (this.isWelcomeMessage) {
            data.contextualData = this._contextualData;
            data.contextualDescription = this._contextualDescription;
        }

        // Store the newly calculated data and the state it was based on
        this._cachedDynamicComponentData = {
            contentType: this._currentContentType,
            parsedMessageContent: this._parsedMessageContent,
            contextualData: this.isWelcomeMessage ? this._contextualData : null,
            contextualDescription: this.isWelcomeMessage ? this._contextualDescription : null,
            data: data,
        };

        return data;
    }

    /**
     * Determines if the current message is a welcome message.
     * A welcome message is identified by the presence of an image in the content.
     * This getter is used for conditional rendering in the HTML template to display
     * welcome messages with specific styling and layout.
     * @returns {boolean} True if the message contains an image (indicating a welcome message), false otherwise.
     */
    get isWelcomeMessage() {
        return this.hasImage;
    }

    /**
     * Determines if contextual data is available for rendering the conversational context component.
     * This getter checks if we have valid contextual data and description to display.
     * @returns {boolean} True if contextual data is available, false otherwise.
     */
    get hasContextualData() {
        return (
            this._contextualData &&
            Array.isArray(this._contextualData) &&
            this._contextualData.length > 0 &&
            this._contextualDescription
        );
    }

    /**
     * Handles the "Add to Cart" action triggered by a child component.
     * It constructs a structured text message using the product name from the event detail
     * and sends it back to the conversation system via the `sendTextMessage` utility.
     * @param {CustomEvent} event - A custom event from a child component with `event.detail` containing product details object.
     */
    @api
    handleAddToCart(event) {
        const detail = event?.detail;
        if (!detail) {
            return;
        }
        const { quantity, productName, productId, variantDetails } = detail;

        // Validate required properties
        if (quantity && productName) {
            let variantText = '';

            // Handle variantDetails as JSON object array
            if (Array.isArray(variantDetails) && variantDetails.length > 0) {
                variantText = variantDetails
                    .map((variant) => `${variant.label.toLowerCase()} ${variant.displayName}`)
                    .join(', ');
            }

            if (!variantText) {
                const message = this.i18n.addToCartMessageWithNoVariationsLabel
                    .replace('{0}', productName)
                    .replace('{1}', quantity);
                this.configuration.util.sendTextMessage(message);
            } else {
                const message = this.i18n.addToCartMessageLabel
                    .replace('{0}', productName)
                    .replace('{1}', variantText)
                    .replace('{2}', quantity)
                    .replace('{3}', productId);
                this.configuration.util.sendTextMessage(message);
            }
        }
    }

    /**
     * Sends a message to the storefront when a search result in PSA is clicked
     * This is used for analytics tracking of agent-initiated search interactions.
     * @param {string} agentSessionId - The agent session identifier
     * @param {string} productId - The search query that was executed
     */
    @api
    sendPsaSearchResultClicked(agentSessionId, productId) {
        // Older versions of Firefox (before Firefox 148) don't support ancestorOrigins,
        // so we need to use the wildcard '*' as fallback in such cases
        var targetOrigin;
        if (window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
            targetOrigin = window.location.ancestorOrigins[0];
        } else {
            targetOrigin = '*';
        }
        if (agentSessionId && productId) {
            window.parent.postMessage(
                {
                    type: 'lwc.agentSearchResultClicked',
                    timestamp: Date.now(),
                    agentSessionId: agentSessionId,
                    productId: productId,
                },
                targetOrigin
            );
        }
    }

    /**
     * Handles the "Show Product" action.
     * If cart management is not supported, it attempts to find a product URL in the DOM (`data-url`)
     * and opens it in a new window. If cart management *is* supported, it sends a structured text message
     * to the conversation system, indicating product selection.
     * @param {CustomEvent} event - A custom event with `event.detail` containing product `name` (string) and `id` (string) if cart management is supported. Otherwise, it's a standard DOM event (`event.target` is used for URL lookup).
     */
    @api
    handleShowProduct(event) {
        // Determine if cart management is supported based on parsed content
        const isCartMgmtSupported = Boolean(
            this._parsedMessageContent?.isCartMgmtSupported === true ||
                this._parsedMessageContent?.isCartMgmtSupported === 'true' ||
                this._parsedMessageContent?.productRecommendations?.isCartMgmtSupported === true ||
                this._parsedMessageContent?.productRecommendations?.isCartMgmtSupported === 'true'
        );

        if (!isCartMgmtSupported) {
            // If cart management is not supported, get URL from event detail and open it
            // add src=shopperAgent to the URL since we need it for the order source tracking
            const baseUrl = event?.detail?.url;
            const separator = baseUrl?.includes('?') ? '&' : '?';
            const productUrl = baseUrl + separator + 'src=shopperAgent';

            // Get the agent session ID for analytics tracking send it to the storefront
            const agentSessionId =
                this._parsedMessageContent?.productRecommendations?.messagingSessionId ||
                this._parsedMessageContent?.messagingSessionId;
            const productId = event.detail?.id;
            this.sendPsaSearchResultClicked(agentSessionId, productId);

            if (baseUrl && productUrl) {
                try {
                    window.open(productUrl, '_blank');
                } catch (error) {
                    console.error('Failed to open product URL:', error);
                }
            }
        } else {
            // If cart management is supported, send a product selection message
            const product = event?.detail;
            // Basic validation for required product properties
            if (product?.name && product?.id) {
                const message = this.i18n.productSelectionTextMessageLabel
                    .replace('{0}', product.name)
                    .replace('{1}', product.id);
                this.configuration.util.sendTextMessage(message);
            }
        }
    }

    /**
     * Handles the "Select Option" action, typically from a product recommendations component.
     * It extracts option displayValue and utterance from the event detail and sends a formatted text message
     * back to the conversation system.
     * @param {CustomEvent} event - A custom event with `event.detail` containing `displayValue` (string) and `utterance` (string) of the selected option.
     */
    @api
    handleSelectOption(event) {
        const option = event?.detail;
        if (option?.displayValue && option?.utterance) {
            this.configuration.util.sendTextMessage(option.utterance);
        }
    }

    /**
     * Handles the outcome of an express payment process.
     * If `event.detail` contains a truthy value (typically an order number), it sends a structured JSON message
     * indicating a successful order completion. Otherwise, it sends a predefined failure message.
     * @param {CustomEvent} event - A custom event with `event.detail` containing the order number (string) on success, or a falsy value (e.g., `false`, `null`, `undefined`) on failure.
     */
    @api
    handlePayment(event) {
        if (event.detail && typeof event.detail === 'object' && event.detail.orderId) {
            // Success case - event.detail is an object with orderId and paymentMethod
            const paymentMethod = event.detail.paymentMethod || '';
            this.configuration.util.sendTextMessage(
                `{"orderCompleted": {"className":"orderCompleted","orderNumber": "${event.detail.orderId}","paymentMethod": "${paymentMethod}"}}`
            );
        } else if (
            event.detail &&
            typeof event.detail === 'object' &&
            (event.detail.status === 'cancel' || event.detail.status === 'failure')
        ) {
            // Cancel case
            const paymentMethod = event.detail.paymentMethod || '';
            const displayName = this._getPaymentMethodDisplayName(paymentMethod);
            const label =
                event.detail.status === 'cancel' ? this.i18n.paymentCanceledLabel : this.i18n.paymentFailedLabel;
            this.configuration.util.sendTextMessage(label.replace('{0}', displayName));
        } else {
            // Fallback case for null, undefined, or other failure scenarios
            this.configuration.util.sendTextMessage(this.i18n.fallbackPaymentFailedLabel);
        }
    }

    /**
     * Handles the "Select Context" action, typically from a session context component.
     * It extracts context name and ID from the event detail and sends a formatted text message.
     * @param {CustomEvent} event - A custom event with `event.detail` containing `name` (string) and `id` (string) of the selected context.
     */
    @api
    handleSelectContext(event) {
        const context = event?.detail;
        // Basic validation for required context properties
        if (context?.name) {
            this.configuration.util.sendTextMessage(context.name);
        }
    }

    /**
     * Handles the "Apply Coupon" action from the cart summary component.
     * It extracts the coupon code from the event detail and sends a text message
     * with the format "Apply coupon code {code}".
     * @param {CustomEvent} event - A custom event with `event.detail` containing `couponCode` (string).
     */
    @api
    handleApplyCoupon(event) {
        const couponCode = event?.detail?.couponCode;
        // Basic validation for required coupon code
        if (couponCode && couponCode.trim()) {
            const message = this.i18n.applyCouponCodeLabel.replace('{0}', couponCode.trim());
            this.configuration.util.sendTextMessage(message);
        }
    }

    /**
     * Checks if the sender is one of the supported participant types.
     * Supported types are defined in `PARTICIPANT_TYPES` constant.
     * @returns {boolean} `true` if the sender's role is supported (e.g., 'EndUser', 'Agent', or 'Chatbot'); `false` otherwise.
     */
    @api
    isSupportedSender() {
        return PARTICIPANT_TYPES.includes(this.sender);
    }

    // =========================================================
    // Core Logic Methods (Private)
    // These methods implement the primary functionality of parsing and state management.
    // =========================================================

    /**
     * Recursively searches for 'className' within an object.
     * Returns the first found valid content type string, or undefined if not found.
     * @param {object} obj The object to search within.
     * @returns {string|undefined} The content type string if found and valid, otherwise undefined.
     * @private
     */
    _findContentTypeRecursively(obj) {
        // Only check for 'className'
        if (typeof obj.className === 'string' && Object.values(CONTENT_TYPES).includes(obj.className)) {
            return obj.className;
        }

        // Recursively search in nested objects
        for (const key in obj) {
            // eslint-disable-next-line no-prototype-builtins
            if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && obj[key] !== null) {
                const foundType = this._findContentTypeRecursively(obj[key]);
                if (foundType) {
                    return foundType; // Return the first one found
                }
            }
        }

        return undefined; // Not found
    }

    /**
     * Processes the raw `entryPayload` from the `_conversationEntry` to identify the message's content type
     * and extract the primary message content. This method handles parsing JSON strings, including nested JSON
     * for structured messages, and determines if content is plain text or a recognized structured type based on sender role.
     * It robustly handles missing or malformed payloads by defaulting to plain text.
     * @private
     */
    processEntryPayload() {
        this.resetState(); // Clear previous state first

        // Defensive extraction of raw payload and sender role
        const rawPayload = this._conversationEntry?.entryPayload;
        const senderRole = this._conversationEntry?.sender?.role;

        // --- Data Structure Validation: Handle missing or empty payload ---
        if (!rawPayload) {
            this._parsedMessageContent = ''; // Default to empty string for rich text
            this._currentContentType = ''; // Indicate rich text content type
            this._entryId = this._conversationEntry?.id; // Still try to get ID if available
            return;
        }

        let parsedPayload;
        try {
            // Attempt to parse the top-level entryPayload JSON string
            parsedPayload = JSON.parse(rawPayload);
        } catch (e) {
            // If rawPayload isn't valid JSON, treat it as plain text and wrap it
            parsedPayload = {
                abstractMessage: {
                    staticContent: {
                        text: rawPayload, // Use the raw payload string as static text content
                    },
                },
            };
        }

        // Set the entryId from the parsed payload or the outer conversationEntry ID
        this._entryId = parsedPayload?.id || this._conversationEntry?.id || '';

        // Extract the content from staticContent.text, which might contain nested JSON
        const staticTextContent = parsedPayload?.abstractMessage?.staticContent?.text;

        // Determine content type based on sender role and attempts to parse nested JSON
        if (typeof staticTextContent === 'string') {
            // ---- Fast path: parse as-is (and handle double-encoded if needed) ----
            try {
                let once = JSON.parse(staticTextContent);
                if (typeof once === 'string' && /^\s*[{[]/.test(once)) {
                    // double-encoded → second parse
                    once = JSON.parse(once);
                }
                if (once && typeof once === 'object') {
                    this._applyParsedObjectRoleAware(once, senderRole, staticTextContent);
                } else if (this._isValidTextString(String(once))) {
                    this._parsedMessageContent = String(once); // plain text
                    this._currentContentType = '';
                } else {
                    this._parsedMessageContent = this.i18n.invalidResponseMessageLabel;
                    this._currentContentType = '';
                }
            } catch (_fastErr) {
                // ---- Fallback: ONLY because the first parse failed → sanitize + repair, then retry ----
                try {
                    let sanitized = this._sanitizeJson(staticTextContent, { newline: 'space' });
                    sanitized = this._repairInvalidEscapes(sanitized);

                    let once = JSON.parse(sanitized);
                    if (typeof once === 'string' && /^\s*[{[]/.test(once)) {
                        // still double-encoded
                        once = JSON.parse(once);
                    }
                    if (once && typeof once === 'object') {
                        this._applyParsedObjectRoleAware(once, senderRole, staticTextContent);
                    } else if (this._isValidTextString(once)) {
                        this._parsedMessageContent = once; // plain text
                        this._currentContentType = '';
                    } else {
                        this._parsedMessageContent = this.i18n.invalidResponseMessageLabel;
                        this._currentContentType = '';
                    }
                } catch (_fallbackErr) {
                    // Give up → treat as rich text if it looks like text
                    if (this._isValidTextString(staticTextContent)) {
                        this._parsedMessageContent = staticTextContent;
                    } else {
                        this._parsedMessageContent = this.i18n.invalidResponseMessageLabel;
                    }
                    this._currentContentType = '';
                }
            }
        } else {
            // Default case for any other sender role or non-string staticContent: treat as plain rich text
            this._parsedMessageContent = staticTextContent;
            this._currentContentType = '';
        }
    }

    /**
     * Checks if the provided content is a valid text string.
     * @param {string} content - The content to check.
     * @returns {boolean} `true` if the content is a valid text string, `false` otherwise.
     * @private
     */
    _isValidTextString(content) {
        // Check if content is null, undefined, or not a string
        if (!content || typeof content !== 'string') {
            return false;
        }

        // Check if it's a stringified object (starts with { or [)
        if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
            return false;
        }

        // Check if it's empty or just whitespace
        if (content.trim() === '') {
            return false;
        }

        return true;
    }

    /**
     * Resets all internal state properties of the component's content.
     * This is called when a new `conversationEntry` is set or when an invalid entry is received,
     * ensuring a clean state for the next message.
     * @private
     */
    resetState() {
        this._currentContentType = '';
        this._parsedMessageContent = undefined;
        this._cachedDynamicComponentData = null; // Invalidate cached data on state reset
        this._entryId = ''; // Reset entryId when state is reset
    }

    /**
     * Retrieves the configuration object for the child component that needs to be rendered,
     * based on the currently identified `contentType`. This configuration typically includes
     * the child component's name and the data processor method to use.
     * @returns {object} A configuration object containing `componentName` and `dataProcessor` property.
     * If the `contentType` is not recognized, it returns `DEFAULT_RICH_TEXT_CONFIG`.
     * @private
     */
    getComponentConfig() {
        return CONTENT_TYPE_COMPONENT_MAP[this.contentType] || DEFAULT_RICH_TEXT_CONFIG;
    }

    /**
     * Maps payment method codes to user-friendly display names.
     * @param {string} paymentMethod - The payment method code from the event (e.g., 'applepay', 'googlepay')
     * @returns {string} The user-friendly display name
     * @private
     */
    _getPaymentMethodDisplayName(paymentMethod) {
        if (!paymentMethod || typeof paymentMethod !== 'string') {
            return '';
        }
        const normalizedMethod = paymentMethod.toLowerCase();
        return PAYMENT_METHOD_MAP[normalizedMethod] || paymentMethod;
    }

    // =========================================================
    // Private Data Processing Methods
    // These methods responsibly extract and structure data from `_parsedMessageContent`
    // and include defensive checks to ensure valid types/defaults.
    // =========================================================

    /**
     * Sends a message to the storefront when PSA is invoked
     * This is used for analytics tracking of agent-initiated search interactions.
     * @param {string} agentSessionId - The agent session identifier
     * @param {string} searchQuery - The search query that was executed
     */
    @api
    sendPsaMsgToStorefront(agentSessionId, searchQuery) {
        // Older versions of Firefox (before Firefox 148) don't support ancestorOrigins,
        // so we need to use the wildcard '*' as fallback in such cases
        var targetOrigin;
        if (window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
            targetOrigin = window.location.ancestorOrigins[0];
        } else {
            targetOrigin = '*';
        }
        if (agentSessionId && searchQuery) {
            window.parent.postMessage(
                {
                    type: 'lwc.agentInvokedSearch',
                    timestamp: Date.now(),
                    agentSessionId: agentSessionId,
                    searchQuery: searchQuery,
                },
                targetOrigin
            );
        }
    }

    /**
     * Processes product recommendations data from the `_parsedMessageContent`.
     * This method extracts and structures product and category details, along with cart management
     * support status and user query, ensuring safe defaults for missing properties.
     * @returns {object} An object containing structured data for product recommendations:
     * - `productData`: An array of product objects.
     * - `productsDescription`: A string description for products.
     * - `isCartMgmtSupported`: Boolean indicating if cart management is enabled.
     * - `userQuery`: The user's original query related to recommendations.
     * - `suggestedActions`: An array of action objects containing suggested actions (e.g., suggested questions and answers), defaults to empty array if not available.
     * @private
     */
    processProductRecommendations() {
        const data = {};
        const parsed = this._parsedMessageContent;
        // Extract productsDetails, checking both nested under productRecommendations and root level for flexibility
        const productsDetails = parsed?.productRecommendations?.productsDetails || parsed?.productsDetails;

        // Extract agent session ID from PSA response and send it to the storefront
        const agentSessionId = parsed?.productRecommendations?.messagingSessionId || parsed?.messagingSessionId;
        const userSearchQuery = parsed?.productRecommendations?.userQuery || parsed?.userQuery;
        this.sendPsaMsgToStorefront(agentSessionId, userSearchQuery);

        if (productsDetails && Array.isArray(productsDetails.products)) {
            data.productData = productsDetails.products;
            data.productsDescription = productsDetails.description || '';
            data.showMoreProducts = productsDetails.showMore;
            data.isCartMgmtSupported =
                parsed?.isCartMgmtSupported || parsed?.productRecommendations?.isCartMgmtSupported || false;
        } else {
            data.productData = []; // Ensure it's an array for child component
            data.productsDescription = '';
        }

        // userQuery can be under productRecommendations or at root level
        data.userQuery = parsed?.productRecommendations?.userQuery || parsed?.userQuery || '';

        // Extract and process suggestedActions with proper null safety
        const suggestedActions = parsed?.productRecommendations?.suggestedActions || parsed?.suggestedActions;

        // Initialize suggestedActions with safe defaults
        data.suggestedActions = {
            description: '',
            options: [],
            utterance: '',
        };

        // Only process if suggestedActions exists and has actions array
        if (suggestedActions && Array.isArray(suggestedActions) && suggestedActions.length > 0) {
            // Find the first QUESTION_WITH_ANSWERS action (currently only supported type)
            const questionAction = suggestedActions.find(
                (action) => action && action.type === SUGGESTED_ACTIONS_TYPES.QUESTION
            );

            if (questionAction) {
                // Set description from action's displayValue
                data.suggestedActions.description = questionAction.displayValue || '';
                data.suggestedActions.utterance = questionAction.utterance || '';

                // Filter and validate options with proper type checking
                if (Array.isArray(questionAction.options)) {
                    data.suggestedActions.options = questionAction.options.filter((option) => {
                        // Validate that option has required properties and correct type
                        return (
                            option &&
                            option.type === SUGGESTED_ACTIONS_OPTIONS_TYPES.UTTERANCE_SUGGESTION &&
                            option.displayValue &&
                            option.utterance
                        );
                    });
                }
            }
        }

        return data;
    }

    /**
     * Processes product details data from the `_parsedMessageContent`.
     * It extracts the primary product object, handling cases where details might be an array or a single object.
     * @returns {object} An object containing the processed product data:
     * - `product`: The product object, or an empty object if not found.
     * - `suggestedActions`: An array of action objects containing suggested actions (e.g., suggested questions and answers), defaults to empty array if not available.
     * @private
     */
    processProductDetails() {
        const data = {};
        const details = this._parsedMessageContent?.details || this._parsedMessageContent?.productDetails?.details;
        if (details) {
            // If details is an array, take the first element; otherwise, use details directly.
            // Ensure the result is always an object.
            const product = Array.isArray(details) && details.length > 0 ? details[0] : details;
            data.product = typeof product === 'object' && product !== null ? product : {};
        } else {
            data.product = {};
        }

        // Extract suggestedActions actions array from parsed message content
        const suggestedActions =
            this._parsedMessageContent?.suggestedActions ||
            this._parsedMessageContent?.productDetails?.suggestedActions;

        // Initialize suggestedActions with safe defaults
        data.suggestedActions = {
            description: '',
            options: [],
            utterance: '',
        };

        data.suggestedActions = Array.isArray(suggestedActions) ? suggestedActions : [];
        return data;
    }

    /**
     * Processes cart summary data from the `_parsedMessageContent`.
     * It extracts the cart summary object, providing a safe default if the data is missing or malformed.
     * @returns {object} An object containing the processed cart summary data:
     * - `cartSummary`: The cart summary object, or an empty object if not found.
     * - `suggestedActions`: An array of action objects containing suggested actions (e.g., suggested questions and answers), defaults to empty array if not available.
     * @private
     */
    processCartSummary() {
        const data = {};
        const cartSummary =
            this._parsedMessageContent?.cartDetails || this._parsedMessageContent?.cartSummary?.cartDetails;
        // Ensure cartSummary is always an object
        data.cartSummary = typeof cartSummary === 'object' && cartSummary !== null ? cartSummary : {};

        // Extract suggestedActions array from parsed message content
        const suggestedActions =
            this._parsedMessageContent?.suggestedActions || this._parsedMessageContent?.cartSummary?.suggestedActions;

        // Initialize suggestedActions with safe defaults
        data.suggestedActions = {
            description: '',
            options: [],
            utterance: '',
        };

        data.suggestedActions = Array.isArray(suggestedActions) ? suggestedActions : [];

        return data;
    }

    /**
     * Processes order confirmation data from the `_parsedMessageContent`.
     * It extracts the order details, ensuring they are always presented as an array.
     * @returns {object} An object containing the processed order confirmation data:
     * - `orderDetails`: An array of order detail objects.
     * - `suggestedActions`: An array of action objects containing suggested actions (e.g., suggested questions and answers), defaults to empty array if not available.
     * @private
     */
    processOrderConfirmation() {
        const data = {};
        const orderDetails = this._parsedMessageContent?.orderConfirmation || this._parsedMessageContent;
        // Ensure orderDetails is always an object
        data.orderDetails = typeof orderDetails === 'object' && orderDetails !== null ? orderDetails : {};

        // Extract suggestedActions array from parsed message content
        const suggestedActions =
            this._parsedMessageContent?.suggestedActions ||
            this._parsedMessageContent?.orderConfirmation?.suggestedActions;

        // Initialize suggestedActions with safe defaults
        data.suggestedActions = {
            description: '',
            options: [],
            utterance: '',
        };

        data.suggestedActions = Array.isArray(suggestedActions) ? suggestedActions : [];

        return data;
    }

    /**
     * Sanitizes JSON-like text for two issues that commonly break parsing:
     *  - raw newlines in strings
     *  - unescaped inch marks immediately after digits (e.g., `55"`)
     *
     * This method is used for nested JSON parsing of `staticContent.text` where
     * the content contains JSON strings that may have formatting issues.
     * @param {string} raw - Raw JSON-like payload.
     * @param {{ newline?: 'space' | 'escape' }} [options] - Newline handling; default is `"space"`.
     * @returns {string} Cleaned string safe to pass to `JSON.parse`.
     * @private
     */
    _sanitizeJson(raw, { newline = 'space' } = {}) {
        let s = String(raw)
            .replace(/^\uFEFF/, '')
            .trim();

        // Normalize newlines
        if (newline === 'escape') {
            s = s.replace(/\r\n/g, '\\n').replace(/\r/g, '\\n').replace(/\n/g, '\\n');
        } else {
            s = s.replace(/\r?\n+/g, ' ').replace(/\s{2,}/g, ' ');
        }

        // Tame triple+ quotes from dirty inputs
        s = s.replace(/"{3,}/g, '""');

        const out = [];
        let inString = false;
        let prevWasEscape = false;

        const nextNonSpace = (str, i) => {
            for (let k = i; k < str.length; k++) {
                const c = str[k];
                if (c !== ' ' && c !== '\t' && c !== '\r' && c !== '\n') return c;
            }
            return '';
        };

        for (let i = 0; i < s.length; i++) {
            const c = s[i];

            if (c === '"' && !prevWasEscape) {
                if (!inString) {
                    inString = true;
                    out.push(c);
                } else {
                    const nxt = nextNonSpace(s, i + 1);
                    if (nxt === ',' || nxt === '}' || nxt === ']' || nxt === ':' || nxt === '') {
                        inString = false;
                        out.push(c);
                    } else {
                        out.push('\\', '"'); // inner content quote
                    }
                }
                prevWasEscape = false;
                continue;
            }

            if (inString) prevWasEscape = c === '\\' ? !prevWasEscape : false;
            else prevWasEscape = false;

            out.push(c);
        }

        return out.join('');
    }

    /**
     * Repairs invalid JSON escapes by doubling backslashes that do not start a valid escape.
     * Example: "\>" → "\\>" so JSON.parse succeeds while preserving data.
     * @param {string} str - The string to repair
     * @returns {string} The repaired string
     * @private
     */
    _repairInvalidEscapes(str) {
        return String(str).replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
    }

    /**
     * Apply parsed object to state with role-aware behavior.
     * - If a known content type is found → set it.
     * - If not:
     *    - ENDUSER → treat as plain text (use the original staticTextContent)
     *    - CHATBOT/others → keep the object but no specific content type
     * @param {object} obj - The parsed object
     * @param {string} senderRole - The sender role (ENDUSER, CHATBOT, etc.)
     * @param {string} staticTextContent - The original static text content
     * @private
     */
    _applyParsedObjectRoleAware(obj, senderRole, staticTextContent) {
        const foundContentType = this._findContentTypeRecursively(obj);
        const shouldPolishObj = this._containsBackslashArrow(obj);

        if (foundContentType) {
            // Keep structured object; polish only if needed.
            this._parsedMessageContent = shouldPolishObj ? this._polishBackslashArrowDeep(obj) : obj;
            this._currentContentType = foundContentType;
            return;
        }

        if (senderRole === ENDUSER) {
            // For unrecognized ENDUSER JSON, you render the original text—polish that text only.
            this._parsedMessageContent = this._polishBackslashArrowString(staticTextContent);
            this._currentContentType = '';
            return;
        }

        // Chatbot/others with unrecognized className → keep object (no type), polish if needed.
        this._parsedMessageContent = shouldPolishObj ? this._polishBackslashArrowDeep(obj) : obj;
        this._currentContentType = '';
    }

    /**
     * Replace only the literal backslash–arrow sequence (`\>`) with `>`.
     * Presentation-only tweak for breadcrumbs like: "Footwear -\> Men -\> Boots".
     * Leaves all other characters and escapes untouched.
     * @param {string} str - A single display string to polish.
     * @returns {string} The polished string (or the original if no `\>` is present).
     * @private
     */
    _polishBackslashArrowString(str) {
        return typeof str === 'string' && str.includes('\\>') ? str.replace(/\\>/g, '>') : str;
    }

    /**
     * Deeply polish only string leaves inside an object/array graph.
     * Non-strings (numbers, booleans, null, objects) are left as-is; structure is preserved.
     * This is intentionally narrow: it only fixes `\>` → `>` and nothing else.
     * @param {unknown} value - Parsed payload (object/array/string/etc.).
     * @returns {unknown} A new polished structure for objects/arrays/strings, or the input for other types.
     * @private
     */
    _polishBackslashArrowDeep(value) {
        if (typeof value === 'string') {
            return this._polishBackslashArrowString(value);
        }
        if (Array.isArray(value)) {
            return value.map((v) => this._polishBackslashArrowDeep(v));
        }
        if (value && typeof value === 'object') {
            const out = {};
            for (const k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                    out[k] = this._polishBackslashArrowDeep(value[k]);
                }
            }
            return out;
        }
        return value; // numbers, booleans, null, undefined
    }

    /**
     * Quick probe to avoid deep-walk work when there is no `\>` anywhere.
     * @param {unknown} value - The value to check for backslash-arrow sequences
     * @returns {boolean} True if some string leaf (or string itself) contains `\>`.
     * @private
     */
    _containsBackslashArrow(value) {
        if (typeof value === 'string') return value.includes('\\>');
        if (Array.isArray(value)) {
            for (const v of value) if (this._containsBackslashArrow(v)) return true;
            return false;
        }
        if (value && typeof value === 'object') {
            // eslint-disable-next-line no-prototype-builtins
            for (const k in value) if (value.hasOwnProperty(k) && this._containsBackslashArrow(value[k])) return true;
        }
        return false;
    }

    /**
     * Sets PWA context data in localStorage for use by other components.
     * @param {object} payload - PWA context data payload
     * @param {string} payload.pwaDomainUrl - PWA domain URL
     * @param {string} payload.pwaSiteId - PWA site ID
     * @param {string} payload.pwaLocale - PWA locale
     * @private
     */
    _setPwaContextInLocalStorage(payload) {
        try {
            if (payload?.pwaDomainUrl) {
                localStorage.setItem('pwaDomainUrl', payload.pwaDomainUrl);
            }
            if (payload?.pwaSiteId) {
                localStorage.setItem('pwaSiteId', payload.pwaSiteId);
            }
            if (payload?.pwaLocale) {
                localStorage.setItem('pwaLocale', payload.pwaLocale);
            }
        } catch (error) {
            console.warn('localStorage not available:', error);
        }
    }

    /**
     * Handle all postMessage events from the parent window (PWA).
     * This method processes messages from the parent application to receive
     * contextual data for the conversational context component.
     * @param {MessageEvent} event - The window message event containing data from the parent window.
     * @returns {void}
     * @private
     */
    _handleWindowMessage(event) {
        // Handle customer data from PWA/SFRA (always process)
        if (event?.data?.type === 'conversational.actualConversationContext') {
            // Extract conversation context data from the message payload
            const conversationContext = event?.data?.payload?.conversationContext;

            if (conversationContext) {
                // Set the contextual data for the conversational context component
                this._contextualData = Array.isArray(conversationContext) ? conversationContext : [conversationContext];

                // Set a static description for user guidance
                this._contextualDescription = this.i18n.contextualDescriptionLabel;

                // Invalidate the cached dynamic component data to trigger re-render
                this._cachedDynamicComponentData = null;
            }
        } else if (event?.data?.type === 'lwc.pwaContext') {
            this._setPwaContextInLocalStorage(event?.data?.payload);
        } else if (event?.data?.type === 'conversational.domainUrl') {
            // Handle domain URL from parent component
            const localizedUrl = event?.data?.payload?.domainUrl;
            if (localizedUrl) {
                // Store localized URL in localStorage for use by other components
                try {
                    localStorage.setItem('localizedUrl', localizedUrl);
                } catch (error) {
                    console.warn('localStorage not available for localizedUrl:', error);
                }
            }
        }
    }

    /**
     * Initializes the markdown parser with custom configuration and renderers.
     * This method is called once per component instance to configure the marked parser
     * with GitHub Flavored Markdown support and custom list rendering logic.
     * @returns {void}
     */
    _initializeMarkdownParser() {
        if (this._markdownParserInitialized) return;

        marked.setOptions({
            gfm: true, // Enable GitHub Flavored Markdown
            breaks: true, // Single line breaks create <br> tags
        });

        marked.use({
            renderer: {
                listitem(item) {
                    const singleParagraph =
                        !item.loose &&
                        Array.isArray(item.tokens) &&
                        item.tokens.length === 1 &&
                        item.tokens[0].type === 'paragraph';

                    if (singleParagraph) {
                        const inner = this.parser.parseInline(item.tokens[0].tokens);
                        return `<li>${inner}</li>`;
                    }
                    return `<li>${this.parser.parse(item.tokens, !!item.loose)}</li>`;
                },

                paragraph(token) {
                    return `<p>${this.parser.parseInline(token.tokens)}</p>`;
                },
            },
        });

        this._markdownParserInitialized = true;
    }

    /**
     * Converts markdown formatted text to HTML using the marked parser.
     * This method is only called for Agent and Chatbot messages, not for EndUser messages.
     *
     * The parser is initialized once per component instance for optimal performance.
     * Spacing is controlled via CSS using the `.richTextContent` class.
     * @param {string} text - The markdown text to parse
     * @returns {string} The parsed HTML string, trimmed of leading/trailing whitespace, or empty string if input is empty or parsing fails
     * @see _initializeMarkdownParser - Configures the markdown parser
     */
    _parseMarkdownToHtml(text) {
        if (!text) {
            return '';
        }
        try {
            this._initializeMarkdownParser();
            let html = marked(text).trim();

            html = html
                .replace(/(\r\n|\n|\r)/gm, '')
                .replace(/\s*<\/(p|div|ul|ol|li|h[1-6]|pre)>\s*<([pdivulolih])\s*([^>]*)>/gi, '</$1><$2$3>')
                .replace(/\s*<\/(ul|ol|p|div|h[1-6]|pre)>/gi, '</$1>');

            return html.trim();
        } catch (error) {
            console.warn('Something went wrong parsing markdown.', error);
            return '';
        }
    }

    /**
     * Handles the "Show More Products" action.
     * It sends a text message with the product IDs to the conversation system.
     * @param {CustomEvent} event - The click event from the show more button.
     */
    @api
    handleShowMoreProducts(event) {
        event.stopPropagation();
        event.preventDefault();
        const { productIds } = event.detail;
        const label = this.i18n.showMoreProductsLabel;
        const productIdsString = productIds.join(', ');
        this.configuration.util.sendTextMessage(`${label} (${productIdsString})`);
    }

    /**
     * Lifecycle hook called when the component is inserted into the DOM.
     * Sets up message communication with the parent window (PWA) to receive
     * contextual data for the conversational context component.
     * Registers this instance as the latest active instance for proper message handling.
     * @returns {void}
     */
    connectedCallback() {
        // Register this instance as the latest
        this._instanceId = ++DynamicContentRenderer._instanceCounter;
        DynamicContentRenderer._latestInstance = this;

        // Set up single message listener for all message types (bind this context)
        this._boundMessageHandler = this._handleWindowMessage.bind(this);
        window.addEventListener('message', this._boundMessageHandler);

        // Only send postMessage for welcome messages
        if (this.isWelcomeMessage) {
            window.parent.postMessage(
                {
                    type: 'lwc.getConversationContext',
                },
                '*'
            );

            window.parent.postMessage(
                {
                    type: 'lwc.getPwaContext',
                },
                '*'
            );

            window.parent.postMessage(
                {
                    type: 'lwc.getDomainUrl',
                },
                '*'
            );
        }
    }

    /**
     * Lifecycle hook called when the component is removed from the DOM.
     * Performs cleanup by removing event listeners and clearing instance references
     * to prevent memory leaks and ensure proper component lifecycle management.
     * @returns {void}
     */
    disconnectedCallback() {
        // Clean up message listener
        if (this._boundMessageHandler) {
            window.removeEventListener('message', this._boundMessageHandler);
            this._boundMessageHandler = null;
        }

        // If this was the latest instance, clear the registry
        if (DynamicContentRenderer._latestInstance === this) {
            DynamicContentRenderer._latestInstance = null;
        }
    }
}
