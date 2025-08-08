/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';
import {
    applePayFailedLabel,
    applePayCanceledLabel,
    applePayCompletedLabel,
    categoryRecommendationTextMessageLabel,
    productSelectionTextMessageLabel,
    addToCartMessageLabel,
    addToCartMessageWithNoVariationsLabel,
    dynamicContentRegionAriaLabel,
    richTextMessageContentAriaLabel,
    invalidResponseMessageLabel,
} from './labels';

import {
    MESSAGE_CONTENT_CLASS,
    ENDUSER,
    CHATBOT,
    PARTICIPANT_TYPES,
    CONTENT_TYPES,
    CONTENT_TYPE_COMPONENT_MAP,
    DEFAULT_RICH_TEXT_CONFIG,
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
 * @fires CustomEvent#payment - Dispatched by a child component upon completion or failure of a payment action. `detail` contains order number on success, or a falsy value on failure.
 */
export default class DynamicContentRenderer extends LightningElement {
    /**
     * Specifies the render mode for the component.
     * Setting this to 'light' means the component's content is rendered directly into the host element,
     * making it accessible to global CSS and standard DOM APIs, simplifying styling and accessibility.
     * @type {string}
     */
    static renderMode = 'light';

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
     * Gets the current `conversationEntry` object.
     * @returns {object|undefined} The conversation entry object, or `undefined` if not set or invalid.
     */
    get conversationEntry() {
        return this._conversationEntry;
    }

    // =========================================================
    // Private Internal State
    // =========================================================

    /** @type {Array<object>} */
    productData = [];

    /** @type {string} */
    productsDescription = '';

    /** @type {Array<object>} */
    categoryData = [];

    /** @type {string} */
    categoriesDescription = '';

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

    // =========================================================
    // Public API - Methods and Getters (@api decorated)
    // These methods and getters are exposed to other components or the component's own template.
    // =========================================================

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
        const { quantity, productName, variantDetails } = detail;

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
                const message = addToCartMessageWithNoVariationsLabel
                    .replace('{0}', productName)
                    .replace('{1}', quantity);
                this.configuration.util.sendTextMessage(message);
            } else {
                const message = addToCartMessageLabel
                    .replace('{0}', productName)
                    .replace('{1}', variantText)
                    .replace('{2}', quantity);
                this.configuration.util.sendTextMessage(message);
            }
        }
    }

    /**
     * Handles the "Select Category" action, typically from a product recommendations component.
     * It extracts category name and ID from the event detail and sends a formatted text message
     * back to the conversation system, including the original user query for context.
     * @param {CustomEvent} event - A custom event with `event.detail` containing `name` (string) and `id` (string) of the selected category.
     */
    @api
    handleSelectCategory(event) {
        const category = event?.detail;
        // Basic validation for required category properties
        if (category?.name && category?.id) {
            // Retrieve userQuery from the processed content if available
            const userQuery =
                this._parsedMessageContent?.userQuery ||
                this._parsedMessageContent?.productRecommendations?.userQuery ||
                '';
            const message = categoryRecommendationTextMessageLabel
                .replace('{0}', userQuery)
                .replace('{1}', category.name)
                .replace('{2}', category.id);
            this.configuration.util.sendTextMessage(message);
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
            const productUrl = event?.detail?.url;

            if (productUrl) {
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
                const message = productSelectionTextMessageLabel
                    .replace('{0}', product.name)
                    .replace('{1}', product.id);
                this.configuration.util.sendTextMessage(message);
            }
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
        if (event.detail && typeof event.detail === 'string') {
            // Success case - event.detail is the orderId string
            this.configuration.util.sendTextMessage(
                `{"orderCompleted": {"className":"orderCompleted","orderNumber": "${event.detail}"}}`
            );
        } else if (event.detail && typeof event.detail === 'object' && event.detail.status === 'cancel') {
            // Cancel case
            this.configuration.util.sendTextMessage(applePayCanceledLabel);
        } else {
            // Failure case (null, undefined, or status: 'failure')
            this.configuration.util.sendTextMessage(applePayFailedLabel);
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

    /**
     * Returns the class name for the message bubble based on sender role.
     * Includes a defensive fallback if sender role is not supported.
     * @returns {string} A space-separated string of class names for the message bubble.
     */
    @api
    get generateMessageBubbleClassname() {
        if (this.isSupportedSender()) {
            return `${MESSAGE_CONTENT_CLASS} ${this.sender}`;
        }
        return MESSAGE_CONTENT_CLASS; // Default class to ensure styling is applied
    }

    /**
     * Returns the localized text for a successfully completed order.
     * This text is sourced from the imported `applePayCompletedLabel` constant.
     * @returns {string} The formatted order completion text.
     */
    @api
    get orderCompletedText() {
        return applePayCompletedLabel;
    }

    /**
     * Returns the aria-label text for the main conversation message content region.
     * @returns {string} The localized label.
     */
    get ariaLabelConversationContent() {
        const role = this._conversationEntry?.sender?.role;
        const message = dynamicContentRegionAriaLabel.replace('{0}', role).replace('{1}', this.contentType);
        return message;
    }

    /**
     * Returns the aria-label text for generic rich text message content.
     * @returns {string} The localized label.
     */
    get ariaLabelRichTextContent() {
        const role = this._conversationEntry?.sender?.role;
        const message = richTextMessageContentAriaLabel.replace('{0}', role);
        return message;
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
        if (senderRole === CHATBOT && typeof staticTextContent === 'string') {
            try {
                const chatbotContent = JSON.parse(staticTextContent);
                const foundContentType = this._findContentTypeRecursively(chatbotContent);

                if (foundContentType) {
                    this._currentContentType = foundContentType;
                } else {
                    // Fallback to rich text if no recognized content type (via className) is found recursively
                    this._currentContentType = '';
                }
                this._parsedMessageContent = chatbotContent; // Store the successfully parsed object
            } catch (error) {
                this._currentContentType = ''; // Ensure it's handled as rich text
                // Chatbot message's staticContent.text is not valid JSON for structured content
                if (this._isValidTextString(staticTextContent)) {
                    this._parsedMessageContent = staticTextContent; // Store as plain string
                } else {
                    this._parsedMessageContent = invalidResponseMessageLabel; // Store as plain string
                }
            }
        } else if (senderRole === ENDUSER && typeof staticTextContent === 'string') {
            try {
                const userContent = JSON.parse(staticTextContent);
                const foundContentType = this._findContentTypeRecursively(userContent);

                if (foundContentType) {
                    this._currentContentType = foundContentType;
                    this._parsedMessageContent = userContent;
                } else {
                    // User message is JSON but not a recognized structured type for display, treat as plain text
                    this._parsedMessageContent = staticTextContent;
                    this._currentContentType = '';
                }
            } catch (error) {
                // User message staticContent.text is not valid JSON, treat as plain text
                this._parsedMessageContent = staticTextContent;
                this._currentContentType = '';
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

    // =========================================================
    // Private Data Processing Methods
    // These methods responsibly extract and structure data from `_parsedMessageContent`
    // and include defensive checks to ensure valid types/defaults.
    // =========================================================

    /**
     * Processes product recommendations data from the `_parsedMessageContent`.
     * This method extracts and structures product and category details, along with cart management
     * support status and user query, ensuring safe defaults for missing properties.
     * @returns {object} An object containing structured data for product recommendations:
     * - `productData`: An array of product objects.
     * - `productsDescription`: A string description for products.
     * - `isCartMgmtSupported`: Boolean indicating if cart management is enabled.
     * - `categoryData`: An array of category objects.
     * - `categoriesDescription`: A string description for categories.
     * - `userQuery`: The user's original query related to recommendations.
     * @private
     */
    processProductRecommendations() {
        const data = {};
        const parsed = this._parsedMessageContent;

        // Extract productsDetails, defaulting to empty objects/arrays for safety
        const productsDetails = parsed?.productsDetails || parsed?.productRecommendations?.productsDetails;
        if (productsDetails && Array.isArray(productsDetails.products)) {
            data.productData = productsDetails.products;
            data.productsDescription = productsDetails.description || '';
            data.isCartMgmtSupported =
                parsed?.isCartMgmtSupported || parsed?.productRecommendations?.isCartMgmtSupported || false;
        } else {
            data.productData = []; // Ensure it's an array for child component
            data.productsDescription = '';
        }

        // Extract categoryDetails, defaulting to empty objects/arrays for safety
        const categoryDetails = parsed?.categoryDetails || parsed?.productRecommendations?.categoryDetails;
        if (categoryDetails && Array.isArray(categoryDetails.categories)) {
            data.categoryData = categoryDetails.categories;
            data.categoriesDescription = categoryDetails.description || '';
        } else {
            data.categoryData = []; // Ensure it's an array for child component
            data.categoriesDescription = '';
        }

        // userQuery can be at root or under productRecommendations
        data.userQuery = parsed?.userQuery || parsed?.productRecommendations?.userQuery || '';

        return data;
    }

    /**
     * Processes product details data from the `_parsedMessageContent`.
     * It extracts the primary product object, handling cases where details might be an array or a single object.
     * @returns {object} An object containing the processed product data:
     * - `product`: The product object, or an empty object if not found.
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
        return data;
    }

    /**
     * Processes cart summary data from the `_parsedMessageContent`.
     * It extracts the cart summary object, providing a safe default if the data is missing or malformed.
     * @returns {object} An object containing the processed cart summary data:
     * - `cartSummary`: The cart summary object, or an empty object if not found.
     * @private
     */
    processCartSummary() {
        const data = {};
        const cartSummary =
            this._parsedMessageContent?.cartDetails || this._parsedMessageContent?.cartSummary?.cartDetails;
        // Ensure cartSummary is always an object
        data.cartSummary = typeof cartSummary === 'object' && cartSummary !== null ? cartSummary : {};
        return data;
    }

    /**
     * Processes order confirmation data from the `_parsedMessageContent`.
     * It extracts the order details, ensuring they are always presented as an array.
     * @returns {object} An object containing the processed order confirmation data:
     * - `orderDetails`: An array of order detail objects.
     * @private
     */
    processOrderConfirmation() {
        const data = {};
        const orderDetails = this._parsedMessageContent?.orderConfirmation || this._parsedMessageContent;
        // Ensure orderDetails is always an object
        data.orderDetails = typeof orderDetails === 'object' && orderDetails !== null ? orderDetails : {};
        return data;
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

    get richTextClasses() {
        return this.hasImage ? 'slds-p-around_none' : 'slds-p-around_small';
    }

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
     * @returns {string} The extracted or parsed message content, suitable for rich text rendering.
     */
    get textContent() {
        if (typeof this._parsedMessageContent === 'string') {
            return this._parsedMessageContent;
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
     * @returns {object} The processed data object specific to the `_currentContentType`.
     * Returns an empty object if no specific data processor is defined or if an error occurs during processing.
     */
    get dynamicComponentData() {
        // Cache invalidation logic: if content type or the raw parsed message content has changed
        if (
            this._cachedDynamicComponentData &&
            this._cachedDynamicComponentData.contentType === this._currentContentType &&
            this._cachedDynamicComponentData.parsedMessageContent === this._parsedMessageContent
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

        // Store the newly calculated data and the state it was based on
        this._cachedDynamicComponentData = {
            contentType: this._currentContentType,
            parsedMessageContent: this._parsedMessageContent,
            data: data,
        };

        return data;
    }
}
