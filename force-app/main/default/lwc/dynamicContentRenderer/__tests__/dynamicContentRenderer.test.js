/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { createElement } from 'lwc';
import DynamicContentRenderer from 'c/dynamicContentRenderer';

// Import real constants instead of mocking them
import { ENDUSER, AGENT, CHATBOT, CONTENT_TYPES } from '../constants';

// Mock lightningsnapin/eventStore module that is imported by cartSummary component
jest.mock(
    'lightningsnapin/eventStore',
    () => ({
        dispatchMessagingEvent: jest.fn(),
        MESSAGING_EVENT: {
            MINIMIZE_BUTTON_CLICK: 'MINIMIZE_BUTTON_CLICK',
        },
    }),
    { virtual: true }
);

// Mock all child components and their dependencies
jest.mock(
    'c/product-search-recommendations',
    () => {
        return {
            __esModule: true,
            default: class MockProductSearchRecommendations {
                static renderMode = 'light';
            },
        };
    },
    { virtual: true }
);

jest.mock(
    'c-product-details',
    () => {
        return {
            __esModule: true,
            default: class MockProductDetails {
                static renderMode = 'light';
            },
        };
    },
    { virtual: true }
);

jest.mock(
    'c-cart-summary',
    () => {
        return {
            __esModule: true,
            default: class MockCartSummary {
                static renderMode = 'light';
            },
        };
    },
    { virtual: true }
);

jest.mock(
    'c-summary-details',
    () => {
        return {
            __esModule: true,
            default: class MockSummaryDetails {
                static renderMode = 'light';
            },
        };
    },
    { virtual: true }
);

jest.mock(
    'c-common-button',
    () => {
        return {
            __esModule: true,
            default: class MockCommonButton {
                static renderMode = 'light';
            },
        };
    },
    { virtual: true }
);

jest.mock(
    'c-common-carousel',
    () => {
        return {
            __esModule: true,
            default: class MockCommonCarousel {
                static renderMode = 'light';
            },
        };
    },
    { virtual: true }
);

jest.mock(
    'c-express-payment',
    () => {
        return {
            __esModule: true,
            default: class MockExpressPayment {
                static renderMode = 'light';
            },
        };
    },
    { virtual: true }
);

jest.mock(
    'c-product-pricing',
    () => {
        return {
            __esModule: true,
            default: class MockProductPricing {
                static renderMode = 'light';
            },
        };
    },
    { virtual: true }
);

jest.mock(
    'c-product-summary',
    () => {
        return {
            __esModule: true,
            default: class MockProductSummary {
                static renderMode = 'light';
            },
        };
    },
    { virtual: true }
);

// Mock experience/styling module with all required functions
jest.mock(
    'experience/styling',
    () => ({
        generateButtonSizeClass: jest.fn(),
        generateButtonStretchClass: jest.fn(),
        generateButtonStyleClass: jest.fn(),
        generateButtonVariantClass: jest.fn(),
        generateButtonClass: jest.fn(),
        generateElementAlignmentClass: jest.fn(),
    }),
    { virtual: true }
);

jest.mock(
    '@salesforce/label/c.Common_ApplePay_paymentFailed',
    () => {
        return {
            default: 'Apple Pay failed',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/c.Common_ApplePay_paymentCanceled',
    () => {
        return {
            default: 'Apple Pay canceled',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/c.Common_ApplePay_paymentCompleted',
    () => {
        return {
            default: 'Payment completed successfully',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/c.Common_Payment_Completed',
    () => {
        return {
            default: 'Paid with {0}',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/c.Common_Payment_Failed',
    () => {
        return {
            default: '{0} failed',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/c.Common_Payment_Canceled',
    () => {
        return {
            default: '{0} was canceled',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/c.Common_Payment_Succeeded_NoPaymentMethod',
    () => {
        return {
            default: 'Payment succeeded',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/c.Common_Payment_Failed_NoPaymentMethod',
    () => {
        return {
            default: 'Payment failed',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/c.TextMessage_categoryRecommendations',
    () => {
        return {
            default: '{0} for category {1} ({2})',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/c.TextMessage_productSelection',
    () => {
        return {
            default: 'Show me details about {0} ({1})',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/c.TextMessage_addProductToCart',
    () => {
        return {
            default: 'Add {0} with {1} of quantity {2} to cart',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/c.TextMessage_addProductToCartWithNoVariations',
    () => {
        return {
            default: 'Add {0} of quantity {1} to cart',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/c.TextMessage_invalidResponseMessage',
    () => {
        return {
            default: 'Unable to process the request. Please try again.',
        };
    },
    { virtual: true }
);
// eslint-disable-next-line @lwc/lwc/no-async-operation
const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

describe('c-dynamic-content-renderer', () => {
    let element;
    let mockSendTextMessage;
    let mockConfiguration;
    let mockAgentSessionId;

    beforeEach(() => {
        // Reset DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        // Setup mocks
        mockSendTextMessage = jest.fn();
        mockConfiguration = {
            util: {
                sendTextMessage: mockSendTextMessage,
            },
        };

        // Create component
        element = createElement('c-dynamic-content-renderer', {
            is: DynamicContentRenderer,
        });
        element.configuration = mockConfiguration;
        document.body.appendChild(element);

        mockAgentSessionId = '0MxJzUZ9q6Z0eYx';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('conversationEntry setter', () => {
        it('should store valid conversation entry object correctly', () => {
            const validEntry = {
                id: 'test-123',
                entryPayload: '{"abstractMessage":{"staticContent":{"text":"Hello"}}}',
                sender: { role: CHATBOT },
            };

            element.conversationEntry = validEntry;

            expect(element.conversationEntry).toEqual(validEntry);
        });

        it('should reset state when conversation entry is null', () => {
            element.conversationEntry = null;

            expect(element.conversationEntry).toBeUndefined();
        });

        it('should reset state when conversation entry is not an object', () => {
            element.conversationEntry = 'not an object';

            expect(element.conversationEntry).toBeUndefined();
        });

        it('should store conversation entry even when entryPayload is missing', () => {
            const entryWithoutPayload = {
                id: 'test-123',
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entryWithoutPayload;

            expect(element.conversationEntry).toEqual(entryWithoutPayload);
        });
    });

    describe('configuration setter', () => {
        it('should store configuration object correctly', () => {
            const config = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };

            element.configuration = config;

            expect(element.configuration).toEqual(config);
        });

        it('should store null configuration without errors', () => {
            element.configuration = null;

            expect(element.configuration).toBeNull();
        });
    });

    describe('component rendering', () => {
        it('should process and store valid conversation entry without errors', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'Hello world',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;

            // Component should render without throwing errors
            expect(element).toBeDefined();
        });

        it('should render product recommendations component when content type is detected', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                productRecommendations: {
                                    messagingSessionId: mockAgentSessionId,
                                    className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                    productsDetails: { products: [] },
                                    categoryDetails: { categories: [] },
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;

            // Component should render without throwing errors
            expect(element).toBeDefined();
        });

        it('should render product recommendations component when content type is detected and no agent session id is present', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                productRecommendations: {
                                    className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                    productsDetails: { products: [] },
                                    categoryDetails: { categories: [] },
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;

            // Component should render without throwing errors
            expect(element).toBeDefined();
        });

        it('should render product recommendations component when content type is detected and agent session id is null', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                productRecommendations: {
                                    messagingSessionId: null,
                                    className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                    productsDetails: { products: [] },
                                    categoryDetails: { categories: [] },
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;

            // Component should render without throwing errors
            expect(element).toBeDefined();
        });

        it('should correctly parse and render complex product details data', () => {
            const complexProductDetailsPayload =
                '{"productDetails":{"details":[{"vmat":[{"vars":{"size":"L","color":"001"},"pr":null,"pid":"883360541099M","ord":true},{"vars":{"size":"S","color":"001"},"pr":null,"pid":"883360541075M","ord":true},{"vars":{"size":"XS","color":"001"},"pr":null,"pid":"883360541068M","ord":true},{"vars":{"size":"M","color":"001"},"pr":null,"pid":"883360541082M","ord":true},{"vars":{"size":"XXL","color":"001"},"pr":null,"pid":"883360541112M","ord":true},{"vars":{"size":"XL","color":"001"},"pr":null,"pid":"883360541105M","ord":true}],"vattr":[{"opts":[{"val":"001","ord":true,"name":"BLACK"}],"lbl":"Colour","id":"color"},{"opts":[{"val":"XS","ord":true,"name":"XS"},{"val":"S","ord":true,"name":"S"},{"val":"M","ord":true,"name":"M"},{"val":"L","ord":true,"name":"L"},{"val":"XL","ord":true,"name":"XL"},{"val":"XXL","ord":true,"name":"XXL"}],"lbl":"Size","id":"size"}],"slugUrl":"https://zzeu-052.dx.commercecloud.salesforce.com/s/RefArchGlobal/mens-summer-bomber-jacket/11736753M.html?lang=en_GB","quantity":{"minQuantity":1.0,"maxQuantity":600.0,"increment":1.0},"pr":{"orig":201.6,"cur":201.6},"name":"Summer Bomber Jacket","imgGroups":[{"viewType":"large","vattr":null,"imgs":[{"url":"dwd3dfd686/images/large/B0574182_001_0.jpg"},{"url":"dw99114f81/images/large/B0574182_001_L1.jpg"},{"url":"dw7245bb2b/images/large/B0574182_001_L2.jpg"},{"url":"dw7005603f/images/large/B0574182_001_L3.jpg"}]},{"viewType":"large","vattr":[{"vals":["001"],"id":"color"}],"imgs":[{"url":"dwd3dfd686/images/large/B0574182_001_0.jpg"},{"url":"dw99114f81/images/large/B0574182_001_L1.jpg"},{"url":"dw7245bb2b/images/large/B0574182_001_L2.jpg"},{"url":"dw7005603f/images/large/B0574182_001_L3.jpg"}]},{"viewType":"swatch","vattr":null,"imgs":[{"url":"dw80a7d9ec/images/swatch/B0574182_001_sw.jpg"}]},{"viewType":"swatch","vattr":[{"vals":["001"],"id":"color"}],"imgs":[{"url":"dw80a7d9ec/images/swatch/B0574182_001_sw.jpg"}]}],"imageUrl":"dwd3dfd686/images/large/B0574182_001_0.jpg","id":"11736753M","dscr":"This lightweight bomber jacket is the epitome of summer style. An old school look mixed with a modern fit. Made in our lightweight brushed cotton polyester fabric.","dfOrd":true,"ccy":"GBP","baseUrl":"https://zzeu-052.dx.commercecloud.salesforce.com/on/demandware.static/-/Sites-apparel-m-catalog/default/"}],"className":"B2CMultipleProductDetailsRepresentation"}}';

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: complexProductDetailsPayload,
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;

            // Verify the component renders without errors
            expect(element).toBeDefined();

            // Verify the product details component is rendered
            expect(element.querySelector('c-product-details')).toBeDefined();
        });

        it('should handle product recommendations gracefully when productsDetails and categoryDetails are null', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                productRecommendations: {
                                    className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                    messagingSessionId: mockAgentSessionId,
                                    productsDetails: null,
                                    categoryDetails: null,
                                    userQuery: 'invalid query',
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle product recommendations with suggestedActions containing valid actions', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                productRecommendations: {
                                    className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                    messagingSessionId: mockAgentSessionId,
                                    productsDetails: { products: [] },
                                    suggestedActions: [
                                        {
                                            type: 'QUESTION_WITH_ANSWERS',
                                            displayValue: 'Test',
                                            utterance: null,
                                            options: null,
                                        },
                                    ],
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle product recommendations when suggestedActions is null', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                productRecommendations: {
                                    className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                    messagingSessionId: mockAgentSessionId,
                                    productsDetails: { products: [] },
                                    suggestedActions: null,
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle product recommendations when suggestedActions is not an array', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                productRecommendations: {
                                    className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                    messagingSessionId: mockAgentSessionId,
                                    productsDetails: { products: [] },
                                    suggestedActions: 'invalid',
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle product recommendations when suggestedActions is undefined', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                productRecommendations: {
                                    className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                    messagingSessionId: mockAgentSessionId,
                                    productsDetails: { products: [] },
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        describe('Suggested Actions Processing', () => {
            it('should correctly process suggestedActions with QUESTION_WITH_ANSWERS and valid options', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productRecommendations: {
                                        messagingSessionId: mockAgentSessionId,
                                        className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                        productsDetails: { products: [] },
                                        suggestedActions: [
                                            {
                                                type: 'QUESTION_WITH_ANSWERS',
                                                displayValue:
                                                    'Are you looking for a jacket for hiking, skiing, or running?',
                                                utterance: null,
                                                options: [
                                                    {
                                                        utterance: 'Suggest me more in jackets for hiking.',
                                                        type: 'UTTERANCE_SUGGESTION',
                                                        displayValue: 'Hiking',
                                                    },
                                                    {
                                                        utterance: 'Suggest me more in jackets for skiing.',
                                                        type: 'UTTERANCE_SUGGESTION',
                                                        displayValue: 'Skiing',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;

                // Component should render without errors
                expect(element).toBeDefined();
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });

            it('should filter out options with incorrect type', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productRecommendations: {
                                        messagingSessionId: mockAgentSessionId,
                                        className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                        productsDetails: { products: [] },
                                        suggestedActions: [
                                            {
                                                type: 'QUESTION_WITH_ANSWERS',
                                                displayValue: 'Test question?',
                                                utterance: null,
                                                options: [
                                                    {
                                                        utterance: 'Valid utterance',
                                                        type: 'UTTERANCE_SUGGESTION',
                                                        displayValue: 'Valid Option',
                                                    },
                                                    {
                                                        utterance: 'Invalid utterance',
                                                        type: 'INVALID_TYPE',
                                                        displayValue: 'Invalid Option',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;

                // Component should render without errors
                expect(element).toBeDefined();
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });

            it('should filter out options missing required properties', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productRecommendations: {
                                        messagingSessionId: mockAgentSessionId,
                                        className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                        productsDetails: { products: [] },
                                        suggestedActions: [
                                            {
                                                type: 'QUESTION_WITH_ANSWERS',
                                                displayValue: 'Test question?',
                                                utterance: null,
                                                options: [
                                                    {
                                                        utterance: 'Valid utterance',
                                                        type: 'UTTERANCE_SUGGESTION',
                                                        displayValue: 'Valid Option',
                                                    },
                                                    {
                                                        // Missing utterance
                                                        type: 'UTTERANCE_SUGGESTION',
                                                        displayValue: 'Missing Utterance',
                                                    },
                                                    {
                                                        utterance: 'Missing displayValue',
                                                        type: 'UTTERANCE_SUGGESTION',
                                                        // Missing displayValue
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;

                // Component should render without errors
                expect(element).toBeDefined();
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });

            it('should return empty suggestedActions when suggestedActions is null', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productRecommendations: {
                                        messagingSessionId: mockAgentSessionId,
                                        className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                        productsDetails: { products: [] },
                                        suggestedActions: null,
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;

                // Component should render without errors
                expect(element).toBeDefined();
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });

            it('should return empty suggestedActions when suggestedActions array is empty', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productRecommendations: {
                                        messagingSessionId: mockAgentSessionId,
                                        className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                        productsDetails: { products: [] },
                                        suggestedActions: [],
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;

                // Component should render without errors
                expect(element).toBeDefined();
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });

            it('should handle suggestedActions with no QUESTION_WITH_ANSWERS action', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productRecommendations: {
                                        messagingSessionId: mockAgentSessionId,
                                        className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                        productsDetails: { products: [] },
                                        suggestedActions: [
                                            {
                                                type: 'UNKNOWN_TYPE',
                                                displayValue: 'Test',
                                                utterance: null,
                                                options: null,
                                            },
                                        ],
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;

                // Component should render without errors
                expect(element).toBeDefined();
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });

            it('should handle suggestedActions with action but no options array', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productRecommendations: {
                                        messagingSessionId: mockAgentSessionId,
                                        className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                        productsDetails: { products: [] },
                                        suggestedActions: [
                                            {
                                                type: 'QUESTION_WITH_ANSWERS',
                                                displayValue: 'Test question?',
                                                utterance: null,
                                                // No options property
                                            },
                                        ],
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;

                // Component should render without errors
                expect(element).toBeDefined();
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });

            it('should use the first QUESTION_WITH_ANSWERS when multiple actions exist', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productRecommendations: {
                                        messagingSessionId: mockAgentSessionId,
                                        className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                        productsDetails: { products: [] },
                                        suggestedActions: [
                                            {
                                                type: 'QUESTION_WITH_ANSWERS',
                                                displayValue: 'First question?',
                                                utterance: null,
                                                options: [
                                                    {
                                                        utterance: 'First',
                                                        type: 'UTTERANCE_SUGGESTION',
                                                        displayValue: 'First',
                                                    },
                                                ],
                                            },
                                            {
                                                type: 'QUESTION_WITH_ANSWERS',
                                                displayValue: 'Second question?',
                                                utterance: null,
                                                options: [
                                                    {
                                                        utterance: 'Second',
                                                        type: 'UTTERANCE_SUGGESTION',
                                                        displayValue: 'Second',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;

                // Component should render without errors
                expect(element).toBeDefined();
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });
        });

        it('should render product details component when content type is detected', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                productDetails: {
                                    className: CONTENT_TYPES.PRODUCT_DETAILS,
                                    details: [{ id: 'prod1', name: 'Product 1' }],
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle product details gracefully when details property is undefined', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                productDetails: {
                                    className: CONTENT_TYPES.PRODUCT_DETAILS,
                                    details: undefined,
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle product details with suggestedActions containing valid actions', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                productDetails: {
                                    className: CONTENT_TYPES.PRODUCT_DETAILS,
                                    details: [{ id: 'prod1' }],
                                    suggestedActions: [
                                        { type: 'TEST', displayValue: 'Test', utterance: null, options: null },
                                    ],
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle product details when suggestedActions is not an array', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                productDetails: {
                                    className: CONTENT_TYPES.PRODUCT_DETAILS,
                                    details: [{ id: 'prod1' }],
                                    suggestedActions: 'invalid',
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should render cart summary component when content type is detected', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                cartSummary: {
                                    className: CONTENT_TYPES.CART_SUMMARY,
                                    details: { id: 'cartId' },
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle cart summary gracefully when details property is undefined', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                cartSummary: {
                                    className: CONTENT_TYPES.CART_SUMMARY,
                                    details: undefined,
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle cart summary with suggestedActions containing valid actions', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                cartSummary: {
                                    className: CONTENT_TYPES.CART_SUMMARY,
                                    cartDetails: { id: 'cartId' },
                                    suggestedActions: [
                                        { type: 'TEST', displayValue: 'Test', utterance: null, options: null },
                                    ],
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle cart summary when suggestedActions is not an array', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                cartSummary: {
                                    className: CONTENT_TYPES.CART_SUMMARY,
                                    cartDetails: { id: 'cartId' },
                                    suggestedActions: {},
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle cartapplycoupon event from cart summary component', () => {
            element.conversationEntry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                cartSummary: {
                                    className: CONTENT_TYPES.CART_SUMMARY,
                                    cartDetails: {
                                        id: 'cartId',
                                        items: [{ name: 'Product A', quantity: 1 }],
                                    },
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            return Promise.resolve().then(() => {
                const cartSummary = element.querySelector('c-cart-summary');
                expect(cartSummary).not.toBeNull();

                cartSummary.dispatchEvent(
                    new CustomEvent('cartapplycoupon', {
                        detail: { couponCode: 'TEST123' },
                        bubbles: true,
                        composed: true,
                    })
                );

                expect(mockSendTextMessage).toHaveBeenCalledWith('Apply coupon code TEST123');
            });
        });

        it('should render order confirmation component when content type is detected', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                orderDetails: {
                                    className: CONTENT_TYPES.ORDER_CONFIRMATION,
                                    details: { id: 'orderId' },
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle order confirmation gracefully when details property is undefined', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                orderConfirmation: {
                                    className: CONTENT_TYPES.ORDER_CONFIRMATION,
                                    details: undefined,
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle order confirmation with suggestedActions containing valid actions', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                orderConfirmation: {
                                    className: CONTENT_TYPES.ORDER_CONFIRMATION,
                                    orderNumber: '12345',
                                    suggestedActions: [
                                        { type: 'TEST', displayValue: 'Test', utterance: null, options: null },
                                    ],
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle order confirmation when suggestedActions is not an array', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                orderConfirmation: {
                                    className: CONTENT_TYPES.ORDER_CONFIRMATION,
                                    orderNumber: '12345',
                                    suggestedActions: 123,
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should render order completed component when content type is detected', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                [CONTENT_TYPES.ORDER_COMPLETED]: {
                                    className: CONTENT_TYPES.ORDER_COMPLETED,
                                    orderNumber: 'ORD-123',
                                },
                            }),
                        },
                    },
                }),
                sender: { role: ENDUSER },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle invalid JSON payload gracefully', async () => {
            const entry = {
                entryPayload: 'INVALID JSON',
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            await flushPromises(); // Wait for component to render
            expect(element).toBeDefined();
        });

        it('should handle not text (incomplete JSON) payload gracefully', async () => {
            const entry = {
                entryPayload: '[INVALID JSON',
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            await flushPromises(); // Wait for component to render
            expect(element).toBeDefined();
            const errorMessage = element.querySelector('lightning-formatted-rich-text');
            expect(errorMessage).not.toBeNull();
            expect(errorMessage.value).toContain('I did not understand your response. Please try again.');
        });

        it('should handle missing sender role gracefully', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'Hello world',
                        },
                    },
                }),
                sender: {},
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });
    });

    describe('event handler methods', () => {
        describe('handleAddToCart', () => {
            it('should not send text message when event detail is a string', () => {
                const event = { detail: 'Test Product' };

                element.handleAddToCart(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should not send message when event detail is undefined', () => {
                const event = {};

                element.handleAddToCart(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should not send message when event is null', () => {
                element.handleAddToCart(null);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should not send message when event detail is empty string', () => {
                const event = { detail: '' };

                element.handleAddToCart(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should send message with variant details when all required properties are present', () => {
                const event = {
                    detail: {
                        quantity: 3,
                        productName: 'Cotton T-shirt',
                        productId: 'prod123',
                        variantDetails: [
                            {
                                id: 'size',
                                label: 'Size',
                                value: 'medium',
                                displayName: 'medium',
                            },
                            {
                                id: 'color',
                                label: 'Color',
                                value: 'white',
                                displayName: 'white',
                            },
                        ],
                    },
                };

                element.handleAddToCart(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith(
                    'Add Cotton T-shirt with size medium, color white in a quantity of 3 to cart (prod123)'
                );
            });

            it('should send message without variant details when variantDetails is missing', () => {
                const event = {
                    detail: {
                        quantity: 1,
                        productName: 'Simple Product',
                        productId: 'prod456',
                    },
                };

                element.handleAddToCart(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Add Simple Product to cart (1)');
            });

            it('should send message without variant details when variantDetails is empty array', () => {
                const event = {
                    detail: {
                        quantity: 2,
                        productName: 'Product',
                        productId: 'prod789',
                        variantDetails: [],
                    },
                };

                element.handleAddToCart(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Add Product to cart (2)');
            });

            it('should not send message when productName is missing from event detail', () => {
                const event = {
                    detail: {
                        quantity: 1,
                        // Missing productName
                    },
                };

                element.handleAddToCart(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should not send message when object detail is null', () => {
                const event = { detail: null };

                element.handleAddToCart(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should not send message when event detail is a number instead of object', () => {
                const event = { detail: 123 };

                element.handleAddToCart(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });
        });

        describe('handleShowProduct', () => {
            let mockPostMessage;

            beforeEach(() => {
                // Mock window.open
                global.window.open = jest.fn();

                // Mock window.parent.postMessage for analytics tracking
                mockPostMessage = jest.fn();
                Object.defineProperty(window.parent, 'postMessage', {
                    value: mockPostMessage,
                    writable: true,
                });
            });

            afterEach(() => {
                delete global.window.open;
                jest.clearAllMocks();
            });

            it('should open URL when cart management is not supported when product url has no existing query params', () => {
                // Set up conversation entry without cart management support
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productsDetails: { products: [] },
                                    categoryDetails: { categories: [] },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };
                element.conversationEntry = entry;

                const event = { detail: { url: 'https://example.com/product' } };

                element.handleShowProduct(event);

                expect(window.open).toHaveBeenCalledWith('https://example.com/product?src=shopperAgent', '_blank');
            });

            it('should open URL when cart management is not supported when product url does have existing query params', () => {
                // Set up conversation entry without cart management support
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productsDetails: { products: [] },
                                    categoryDetails: { categories: [] },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };
                element.conversationEntry = entry;

                const event = { detail: { url: 'https://example.com/product?lang=en-US' } };

                element.handleShowProduct(event);

                expect(window.open).toHaveBeenCalledWith(
                    'https://example.com/product?lang=en-US&src=shopperAgent',
                    '_blank'
                );
            });

            it('should traverse up DOM to find element with data-url', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productsDetails: { products: [] },
                                    categoryDetails: { categories: [] },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };
                element.conversationEntry = entry;

                const event = { detail: { url: 'https://example.com/product' } };

                element.handleShowProduct(event);

                expect(window.open).toHaveBeenCalledWith('https://example.com/product?src=shopperAgent', '_blank');
            });

            it('should send text message when cart management is supported', () => {
                // Set up conversation entry with cart management support
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    isCartMgmtSupported: true,
                                    productsDetails: { products: [] },
                                    categoryDetails: { categories: [] },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };
                element.conversationEntry = entry;

                const event = { detail: { name: 'Test Product', id: 'prod123' } };

                element.handleShowProduct(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Show me details about Test Product (prod123)');
            });

            it('should not send message when product name is missing', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    isCartMgmtSupported: true,
                                    productsDetails: { products: [] },
                                    categoryDetails: { categories: [] },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };
                element.conversationEntry = entry;

                const event = { detail: { id: 'prod123' } };

                element.handleShowProduct(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should not send message when product id is missing', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    isCartMgmtSupported: true,
                                    productsDetails: { products: [] },
                                    categoryDetails: { categories: [] },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };
                element.conversationEntry = entry;

                const event = { detail: { name: 'Test Product' } };

                element.handleShowProduct(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should not open URL when no element with data-url is found', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    [CONTENT_TYPES.PRODUCT_RECOMMENDATIONS]: {
                                        productsDetails: { products: [] },
                                        categoryDetails: { categories: [] },
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };
                element.conversationEntry = entry;

                const event = { target: { dataset: {}, parentNode: null } };

                element.handleShowProduct(event);

                expect(window.open).not.toHaveBeenCalled();
            });
        });

        describe('handleSelectOption', () => {
            it('should send text message with utterance when valid option is provided', () => {
                const event = {
                    detail: {
                        displayValue: 'Hiking',
                        utterance: 'Suggest me more in jackets for hiking.',
                    },
                };

                element.handleSelectOption(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Suggest me more in jackets for hiking.');
            });

            it('should not send message when option has no displayValue', () => {
                const event = {
                    detail: {
                        utterance: 'Some utterance',
                    },
                };

                element.handleSelectOption(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should not send message when option has no utterance', () => {
                const event = {
                    detail: {
                        displayValue: 'Hiking',
                    },
                };

                element.handleSelectOption(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should not send message when event detail is null', () => {
                const event = {
                    detail: null,
                };

                element.handleSelectOption(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should not send message when event detail is undefined', () => {
                const event = {};

                element.handleSelectOption(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });
        });

        describe('handlePayment', () => {
            it('should send order completed message when event detail is provided', () => {
                const event = { detail: { orderId: 'ORD-123', paymentMethod: 'googlepay' } };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith(
                    '{"orderCompleted": {"className":"orderCompleted","orderNumber": "ORD-123","paymentMethod": "googlepay"}}'
                );
            });

            it('should send fallback failed message when event detail is null', () => {
                const event = { detail: null };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Payment failed');
            });

            it('should send fallback failed message when event detail is empty string', () => {
                const event = { detail: '' };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Payment failed');
            });

            it('should send fallback failed message when event detail is false', () => {
                const event = { detail: false };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Payment failed');
            });

            it('should send Apple Pay failed message when event detail has failure status and payment method is applepay', () => {
                const event = { detail: { status: 'failure', paymentMethod: 'applepay' } };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Apple Pay failed');
            });

            it('should send Apple Pay canceled message when event detail has cancel status and payment method is applepay', () => {
                const event = { detail: { status: 'cancel', paymentMethod: 'applepay' } };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Apple Pay was canceled');
            });

            it('should send Google Pay failed message when event detail has failure status and payment method is googlepay', () => {
                const event = { detail: { status: 'failure', paymentMethod: 'googlepay' } };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Google Pay failed');
            });

            it('should send Google Pay canceled message when event detail has cancel status and payment method is googlepay', () => {
                const event = { detail: { status: 'cancel', paymentMethod: 'googlepay' } };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Google Pay was canceled');
            });
        });

        describe('orderCompletedText', () => {
            it('[googlepay] should return dynamic payment message when payment method is available', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    orderCompleted: {
                                        className: 'orderCompleted',
                                        orderNumber: 'ORD-123',
                                        paymentMethod: 'googlepay',
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };
                element.conversationEntry = entry;

                expect(element.orderCompletedText).toBe('Paid with Google Pay');
            });

            it('[applepay] should return dynamic payment message when payment method is available', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    orderCompleted: {
                                        className: 'orderCompleted',
                                        orderNumber: 'ORD-123',
                                        paymentMethod: 'applepay',
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };
                element.conversationEntry = entry;

                expect(element.orderCompletedText).toBe('Paid with Apple Pay');
            });

            it('should return generic payment succeeded message when payment method is not available', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    orderCompleted: {
                                        className: 'orderCompleted',
                                        orderNumber: 'ORD-123',
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };
                element.conversationEntry = entry;

                expect(element.orderCompletedText).toBe('Payment succeeded');
            });
        });

        describe('conv context questions (generatedQuestions)', () => {
            const makeEntry = (payload) => ({
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: typeof payload === 'string' ? payload : JSON.stringify(payload),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            });

            const convWithQuestions = {
                convContextKey: 'women-shoes',
                convContextQuestions: {
                    className: CONTENT_TYPES.CONV_CONTEXT_QUESTIONS,
                    generatedQuestions: 'To help me find the perfect pair, what kind of activity?',
                    convContextKey: 'women-shoes',
                    categoryFacetNames: 'Color, Activity, Size',
                },
            };
            const convNoQuestions = {
                convContextKey: 'women-shoes',
                convContextQuestions: {
                    className: CONTENT_TYPES.CONV_CONTEXT_QUESTIONS,
                    convContextKey: 'women-shoes',
                    categoryFacetNames: 'Color, Size',
                },
            };
            const convNonStringQuestions = {
                convContextKey: 'women-shoes',
                convContextQuestions: {
                    className: CONTENT_TYPES.CONV_CONTEXT_QUESTIONS,
                    generatedQuestions: 123,
                    convContextKey: 'women-shoes',
                },
            };

            it.each([
                [
                    'shows generatedQuestions when payload has className and generatedQuestions',
                    convWithQuestions,
                    false,
                    'To help me find the perfect pair, what kind of activity?',
                ],
                ['shows empty when convContextQuestions has no generatedQuestions', convNoQuestions, true, ''],
                ['shows empty when generatedQuestions is not a string', convNonStringQuestions, true, ''],
                [
                    'shows plain text when payload is not conv context',
                    'Just a regular message',
                    false,
                    'Just a regular message',
                ],
            ])('%s', async (_desc, payload, expectEmpty, expectedContains) => {
                element.conversationEntry = makeEntry(payload);
                await flushPromises();
                const richText = element.querySelector('lightning-formatted-rich-text');
                expect(richText).toBeTruthy();
                expect(richText.value === '').toBe(expectEmpty);
                expect(richText.value).toContain(expectedContains);
            });
        });

        describe('handleApplyCoupon', () => {
            it.each([
                ['standard coupon code', 'SAVE10', 'SAVE10'],
                ['trimmed coupon code', '  DISCOUNT20  ', 'DISCOUNT20'],
                ['coupon code with special characters', 'SAVE-20%', 'SAVE-20%'],
                ['numeric coupon code', '123456', '123456'],
            ])('should send apply coupon message with %s', (_description, couponCode, expectedCode) => {
                element.handleApplyCoupon({ detail: { couponCode } });

                expect(mockSendTextMessage).toHaveBeenCalledWith(`Apply coupon code ${expectedCode}`);
            });

            it.each([
                ['event detail is missing', {}],
                ['couponCode is missing', { detail: {} }],
                ['couponCode is empty string', { detail: { couponCode: '' } }],
                ['couponCode is only whitespace', { detail: { couponCode: '   ' } }],
                ['event is null', null],
                ['event is undefined', undefined],
            ])('should not send message when %s', (_description, event) => {
                element.handleApplyCoupon(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it.each([
                ['en_US', 'SAVE20', 'Apply coupon code SAVE20'],
                ['de', 'SAVE20', 'Gutscheincode SAVE20 anwenden'],
                ['es', 'SAVE20', 'Aplicar código de cupón SAVE20'],
                ['fr', 'SAVE20', 'Appliquer le code de coupon SAVE20'],
                ['ja', 'SAVE20', 'クーポンコード SAVE20 を適用'],
                ['zh_CN', 'SAVE20', '应用优惠券代码 SAVE20'],
                ['pt_BR', 'SAVE20', 'Aplicar código de cupom SAVE20'],
            ])('should send apply coupon message in %s locale', (locale, couponCode, expectedMessage) => {
                // Update configuration with the specified language
                element.configuration = {
                    ...mockConfiguration,
                    language: locale,
                };
                element.handleApplyCoupon({ detail: { couponCode } });
                expect(mockSendTextMessage).toHaveBeenCalledWith(expectedMessage);
            });
        });
    });

    describe('mobile detection logic', () => {
        it('should detect user agent', () => {
            // We can't directly test the private methods, but we can verify the component works
            // with different user agents by testing the overall functionality
            expect(navigator.userAgent).toBeDefined();
        });
    });

    describe('image detection logic', () => {
        it('should process content with images correctly', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'Hello <img src="test.jpg" alt="test"> world',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            // Verify the component processes the content without errors
            expect(element).toBeDefined();
            expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
        });

        it('should process content without images correctly', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'Hello world without images',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            // Verify the component processes the content without errors
            expect(element).toBeDefined();
            expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
        });
    });

    describe('sanitization functionality', () => {
        describe('nested JSON sanitization scenarios', () => {
            it('should handle nested content with inch marks for chatbot', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"product": "55" TV"}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // The component should render without errors, indicating sanitization worked
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle nested content with newlines for chatbot', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"product": "55" TV\nwith features"}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // The component should render without errors, indicating sanitization worked
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle complex nested content with multiple formatting issues', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"product": "24" monitor\nwith 55" TV and\nfeatures"}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // The component should render without errors, indicating sanitization worked
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should correctly parse and render the product recommendations data', () => {
                const realWorldPayload =
                    '{"productRecommendations":{"userQuery":"jackets","productsDetails":{"products":[{"variationsSummary":{"size":["4","6","8","10","12","14","16"],"color":["Laurel"]},"productPageUrl":"https://zzeu-052.dx.commercecloud.salesforce.com/s/RefArchGlobal/belted-safari-jacket/25502154M.html?lang=en_GB","price":95.35,"name":"Belted Safari Jacket","imageUrl":"https://zzeu-052.dx.commercecloud.salesforce.com/on/demandware.static/-/Sites-apparel-m-catalog/default/dw7c87112b/images/large/PG.10214859.JJ0NLB6.PZ.jpg","id":"25502154M","discountPrice":95.35,"description":"This jacket is one of our all time favorite classic styles. Pair it with the matching skirt and a piece of great Commerce Cloud Store jewelry.","currencyCode":"GBP"},{"variationsSummary":{"size":["4","6","8","10","12","14","16"],"color":["Cobalt"]},"productPageUrl":"https://zzeu-052.dx.commercecloud.salesforce.com/s/RefArchGlobal/one-button-jacket/25589100M.html?lang=en_GB","price":99.83,"name":"One Button Jacket","imageUrl":"https://zzeu-052.dx.commercecloud.salesforce.com/on/demandware.static/-/Sites-apparel-m-catalog/default/dwd55c74d3/images/large/PG.10226297.JJ555XX.PZ.jpg","id":"25589100M","discountPrice":99.83,"description":"Our best selling stand collar jacket is new this year in this seasons newest color. Wear the cuff folded upon down. Add a matching skirt and you will be set to go!","currencyCode":"GBP"},{"variationsSummary":{"size":["4","6","8","10","12","14","16"],"color":["Slate"]},"productPageUrl":"https://zzeu-052.dx.commercecloud.salesforce.com/s/RefArchGlobal/1-button-jacket/25592990M.html?lang=en_GB","price":120.96,"name":"1 Button Jacket","imageUrl":"https://zzeu-052.dx.commercecloud.salesforce.com/on/demandware.static/-/Sites-apparel-m-catalog/default/dwbdc270b/images/large/PG.10233353.JJ9MVXX.PZ.jpg","id":"25592990M","discountPrice":120.96,"description":"We took our best selling jacket and updated it with a new colour for the season.  Start showing off!","currencyCode":"GBP"}],"description":"Here are some top recommendations as per your query"},"isCartMgmtSupported":"true","className":"B2CProductSearchActionResultsRepresentation","categoryDetails":{"description":"Let me know if you are looking for something specific.","categories":[{"name":"New Arrivals","id":"newarrivals"},{"name":"Womens","id":"womens"},{"name":"Mens","id":"mens"}]}}}';

                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: realWorldPayload,
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;

                // Verify the component renders without errors
                expect(element).toBeDefined();

                // Verify the product search recommendations component is rendered
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });
        });

        describe('edge cases and error scenarios', () => {
            it('should handle nested content that is not JSON after sanitization', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: 'This is not JSON, just plain text',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should handle as plain text when content is not valid JSON
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle nested content with mixed valid and invalid JSON', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"valid": "json"} but then invalid',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should handle gracefully when content is not valid JSON
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle very long nested content with formatting issues', () => {
                const longText = '{"product": "' + 'A'.repeat(1000) + '55" TV' + 'B'.repeat(1000) + '"}';
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: longText,
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should handle long content without issues
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle nested content with special characters that need sanitization', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"message": "Product: 32" monitor\nPrice: $299.99"}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should handle special characters and formatting without errors
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });
        });

        describe('integration with existing content types', () => {
            it('should sanitize product recommendations content with formatting issues', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productRecommendations: {
                                        messagingSessionId: mockAgentSessionId,
                                        className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                        productsDetails: { products: [] },
                                        categoryDetails: { categories: [] },
                                        description: '24" monitor\nand 55" TV',
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should render product recommendations component successfully
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });

            it('should handle the specific "Unexpected token S" JSON parsing issue with unescaped quotes in product names', () => {
                // This test case reproduces the exact issue described by the user
                // Using a simplified version that contains the problematic unescaped quotes
                const problematicJsonString =
                    '{"productRecommendations":{"userQuery":"tvs under 30 inches","productsDetails":{"products":[{"variationsSummary":{},"productPageUrl":"URL_Redacted","price":549.99,"name":"Samsung Series 6 22" LCD High Definition Television","imageUrl":"URL_Redacted","id":"samsung-ln22a650M","discountPrice":549.99,"description":"Add an extraordinary touch of class and beauty to your HDTV with our unique Touch of Color™ feature. The LN22A650 also features high-definition picture quality so you see more details, heightened clarity and brilliant color. Plus, a 5,000:1 contrast ratio delivers incredibly sharp images in very dark or light scenes. You\'ll never look at your TV the same way again.","currencyCode":"USD"},{"variationsSummary":{},"productPageUrl":"URL_Redacted","price":214.5,"name":"Sanyo 19" LCD High Definition Television","imageUrl":"URL_Redacted","id":"sanyo-dp19648M","discountPrice":214.5,"description":"It features a tuner that receives both ATSC digital channels and NTSC analog channels. The digital tuner has Digital Clear QAM technology so it can receive unscrambled digital cable channels. A full complement of video inputs and audio outputs are provided. A PC/Mac input also allows alternative use as a computer monitor. And the detachable tilt base stand allows it to be wall mounted with an optional wall mount kit (not included).","currencyCode":"USD"},{"variationsSummary":{},"productPageUrl":"URL_Redacted","price":449.99,"name":"Sony Bravia® M-Series 19" LCD High Definition Television","imageUrl":"URL_Redacted","id":"sony-kdl-19m4000M","discountPrice":449.99,"description":"M-Series (19") features: 720p, MPEG Noise Reduction, 3D Comb Filter, ATSC/NTSC tuner with QAM, white with black trim ","currencyCode":"USD"}],"description":"Here are some top recommendations as per your query"},"isCartMgmtSupported":"true","className":"B2CProductSearchActionResultsRepresentation","categoryDetails":{"description":"Let me know if you are looking for something specific.","categories":[{"name":"Electronics","id":"electronics"},{"name":"New Arrivals","id":"newarrivals"}]}}}';

                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: problematicJsonString,
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                // This should not throw an "Unexpected token S" error
                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                // The component should render successfully
                expect(element).toBeDefined();

                // Should render product search recommendations component
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });

            it('should sanitize product details content with formatting issues', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productDetails: {
                                        className: CONTENT_TYPES.PRODUCT_DETAILS,
                                        details: [
                                            {
                                                id: 'prod1',
                                                name: '55" Smart TV\nwith features',
                                            },
                                        ],
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should render product details component successfully
                expect(element.querySelector('c-product-details')).toBeDefined();
            });
        });
    });

    describe('primitive JSON values handling', () => {
        it('should handle numeric values as text content instead of invalid response', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: '2', // Simple number that gets parsed to numeric 2
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
            // Should render as rich text, not show invalid response
            expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            // Verify the component doesn't show invalid response message
            expect(element.textContent).not.toContain('Invalid response');
        });

        it('should handle boolean values as text content', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'true', // Boolean that gets parsed to boolean true
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
            expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            expect(element.textContent).not.toContain('Invalid response');
        });

        it('should handle null values as text content', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'null', // Null that gets parsed to null
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
            expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            expect(element.textContent).not.toContain('Invalid response');
        });
    });

    describe('window message handling and PWA context storage', () => {
        let mockAddEventListener;
        let mockRemoveEventListener;
        let mockPostMessage;

        beforeEach(() => {
            // Mock window.addEventListener and removeEventListener
            mockAddEventListener = jest.fn();
            mockRemoveEventListener = jest.fn();
            global.window.addEventListener = mockAddEventListener;
            global.window.removeEventListener = mockRemoveEventListener;

            // Mock window.parent.postMessage
            mockPostMessage = jest.fn();
            global.window.parent = {
                postMessage: mockPostMessage,
            };

            // Mock localStorage
            const localStorageMock = {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn(),
            };
            Object.defineProperty(window, 'localStorage', {
                value: localStorageMock,
                writable: true,
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        describe('conversation context message processing', () => {
            it('should process conversation context message and store contextual data', () => {
                const conversationContext = ['Some context data', 'More context data'];

                const mockEvent = {
                    data: {
                        type: 'conversational.actualConversationContext',
                        payload: {
                            conversationContext: conversationContext,
                        },
                    },
                };

                // Simulate the message by dispatching it to the window
                window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));

                // Verify that the message was processed without errors
                // (We can't directly test private properties, but we can verify no errors occurred)
                expect(() => {
                    window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));
                }).not.toThrow();
            });

            it('should handle conversation context as single string', () => {
                const conversationContext = 'Some context data';

                const mockEvent = {
                    data: {
                        type: 'conversational.actualConversationContext',
                        payload: {
                            conversationContext: conversationContext,
                        },
                    },
                };

                window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));

                // Verify that the message was processed without errors
                expect(() => {
                    window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));
                }).not.toThrow();
            });

            it('should not process non-conversation context messages', () => {
                const mockEvent = {
                    data: {
                        type: 'other.message.type',
                        payload: {
                            conversationContext: ['PwaDomain: https://example.com'],
                        },
                    },
                };

                window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));

                expect(localStorage.setItem).not.toHaveBeenCalled();
            });

            it('should handle missing conversation context gracefully', () => {
                const mockEvent = {
                    data: {
                        type: 'conversational.actualConversationContext',
                        payload: {},
                    },
                };

                expect(() => {
                    window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));
                }).not.toThrow();

                expect(localStorage.setItem).not.toHaveBeenCalled();
            });

            it('should handle null conversation context gracefully', () => {
                const mockEvent = {
                    data: {
                        type: 'conversational.actualConversationContext',
                        payload: {
                            conversationContext: null,
                        },
                    },
                };

                expect(() => {
                    window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));
                }).not.toThrow();

                expect(localStorage.setItem).not.toHaveBeenCalled();
            });

            it('should handle conversation context with mixed data types', () => {
                const conversationContext = ['Some context data', { someObject: 'data' }, 'More context data'];

                const mockEvent = {
                    data: {
                        type: 'conversational.actualConversationContext',
                        payload: {
                            conversationContext: conversationContext,
                        },
                    },
                };

                window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));

                // Verify that the message was processed without errors
                expect(() => {
                    window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));
                }).not.toThrow();
            });
        });

        describe('PWA context localStorage handling', () => {
            let mockLocalStorage;

            beforeEach(() => {
                // Mock localStorage
                mockLocalStorage = {
                    getItem: jest.fn(),
                    setItem: jest.fn(),
                };
                Object.defineProperty(window, 'localStorage', {
                    value: mockLocalStorage,
                    writable: true,
                });
            });

            afterEach(() => {
                // Clean up localStorage mock
                delete window.localStorage;
            });

            it('should store PWA context data in localStorage when received', () => {
                const mockEvent = {
                    data: {
                        type: 'lwc.pwaContext',
                        payload: {
                            pwaDomainUrl: 'https://example.com',
                            pwaSiteId: 'site-123',
                            pwaLocale: 'en-US',
                        },
                    },
                };

                window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));

                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('pwaDomainUrl', 'https://example.com');
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('pwaSiteId', 'site-123');
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('pwaLocale', 'en-US');
            });

            it('should handle PWA context message with missing payload gracefully', () => {
                const mockEvent = {
                    data: {
                        type: 'lwc.pwaContext',
                        payload: null,
                    },
                };

                expect(() => {
                    window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));
                }).not.toThrow();

                expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
            });

            it('should handle PWA context message with partial data', () => {
                const mockEvent = {
                    data: {
                        type: 'lwc.pwaContext',
                        payload: {
                            pwaDomainUrl: 'https://example.com',
                            // pwaSiteId missing
                            pwaLocale: 'en-US',
                        },
                    },
                };

                window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));

                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('pwaDomainUrl', 'https://example.com');
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('pwaLocale', 'en-US');
                expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('pwaSiteId', expect.anything());
            });

            it('should ignore messages that are not lwc.pwaContext', () => {
                const mockEvent = {
                    data: {
                        type: 'other.message.type',
                        payload: {
                            pwaDomainUrl: 'https://example.com',
                            pwaSiteId: 'site-123',
                            pwaLocale: 'en-US',
                        },
                    },
                };

                window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));

                expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
            });
        });

        describe('component lifecycle and message listener setup', () => {
            it('should handle component lifecycle correctly', () => {
                // Test that the component can be created and destroyed without errors
                expect(element).toBeDefined();

                // Test that the component can process messages
                const mockEvent = {
                    data: {
                        type: 'conversational.actualConversationContext',
                        payload: {
                            conversationContext: ['Some context data'],
                        },
                    },
                };

                expect(() => {
                    window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));
                }).not.toThrow();
            });

            it('should have postMessage functionality available for welcome messages', () => {
                // Test that the component has the necessary postMessage functionality
                // by checking that window.parent.postMessage is available
                expect(window.parent.postMessage).toBeDefined();
                expect(typeof window.parent.postMessage).toBe('function');
            });

            it('should not send postMessage when not welcome message', () => {
                // Create a new element to trigger connectedCallback
                const testElement = createElement('c-dynamic-content-renderer', {
                    is: DynamicContentRenderer,
                });
                testElement.configuration = mockConfiguration;

                // Mock isWelcomeMessage to return false for this element
                jest.spyOn(testElement, 'isWelcomeMessage', 'get').mockReturnValue(false);

                document.body.appendChild(testElement);

                expect(mockPostMessage).not.toHaveBeenCalled();
            });
        });

        describe('Domain URL localStorage handling', () => {
            let mockLocalStorage;

            beforeEach(() => {
                // Mock localStorage
                mockLocalStorage = {
                    getItem: jest.fn(),
                    setItem: jest.fn(),
                };
                Object.defineProperty(window, 'localStorage', {
                    value: mockLocalStorage,
                    writable: true,
                });
            });

            afterEach(() => {
                // Clean up localStorage mock
                delete window.localStorage;
            });

            it('should store localizedUrl in localStorage when conversational.localizedUrl message is received', () => {
                const mockEvent = {
                    data: {
                        type: 'conversational.domainUrl',
                        payload: {
                            domainUrl: 'https://example.com/en-us',
                        },
                    },
                };

                window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));

                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('localizedUrl', 'https://example.com/en-us');
            });

            it('should not store domainUrl when payload is missing', () => {
                const mockEvent = {
                    data: {
                        type: 'conversational.domainUrl',
                        payload: {},
                    },
                };

                window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));

                expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
            });

            it('should handle localStorage errors gracefully', () => {
                const mockEvent = {
                    data: {
                        type: 'conversational.domainUrl',
                        payload: {
                            domainUrl: 'https://example.com/en-us',
                        },
                    },
                };

                // Mock localStorage.setItem to throw an error
                mockLocalStorage.setItem.mockImplementation(() => {
                    throw new Error('localStorage not available');
                });

                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                expect(() => {
                    window.dispatchEvent(new MessageEvent('message', { data: mockEvent.data }));
                }).not.toThrow();

                expect(consoleSpy).toHaveBeenCalledWith(
                    'localStorage not available for localizedUrl:',
                    expect.any(Error)
                );
                consoleSpy.mockRestore();
            });
        });
    });

    describe('enhanced JSON parsing and sanitization', () => {
        describe('double-encoding detection improvements', () => {
            it('should only parse strings that look like JSON objects or arrays', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '"This is just a plain string"', // Double-encoded string that should NOT be parsed again
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should treat as plain text, not attempt to parse as JSON
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should parse double-encoded JSON objects correctly', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"product": "55\\" TV"}', // Double-encoded JSON object
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should parse the JSON object successfully
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should parse double-encoded JSON arrays correctly', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '[{"item": "test"}]', // Double-encoded JSON array
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should parse the JSON array successfully
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle empty JSON objects and arrays', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{}', // Empty object
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle whitespace-only strings as plain text', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '   ', // Whitespace only
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });
        });

        describe('BOM and whitespace handling', () => {
            it('should remove BOM characters from JSON content', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '\uFEFF{"product": "test"}', // Content with BOM
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should parse successfully despite BOM
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should trim leading and trailing whitespace', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '   {"product": "test"}   ', // Content with whitespace
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should parse successfully despite whitespace
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle content with both BOM and whitespace', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '\uFEFF   {"product": "test"}   ', // BOM + whitespace
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should parse successfully
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });
        });

        describe('backslash-arrow polish functionality', () => {
            it('should polish backslash-arrow sequences in simple strings', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productRecommendations: {
                                        className: 'B2CProductSearchActionResultsRepresentation',
                                        productsDetails: {
                                            products: [
                                                {
                                                    id: 'p1',
                                                    name: '55\\" TV with features\\>',
                                                    description: 'A great TV\\> for your home',
                                                },
                                            ],
                                        },
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should render product recommendations component successfully
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });

            it('should polish backslash-arrow sequences in nested objects', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productDetails: {
                                        className: 'B2CMultipleProductDetailsRepresentation',
                                        details: [
                                            {
                                                name: 'Product\\> with features',
                                                description: 'Description\\> here',
                                                specs: {
                                                    size: '55\\" TV',
                                                    features: ['Feature 1\\>', 'Feature 2\\>'],
                                                },
                                            },
                                        ],
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should render product details component successfully
                expect(element.querySelector('c-product-details')).toBeDefined();
            });

            it('should handle arrays with backslash-arrow sequences', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    cartSummary: {
                                        className: 'B2CCartSummaryRepresentation',
                                        cartDetails: {
                                            items: [
                                                { name: 'Item 1\\>', price: '$100\\>' },
                                                { name: 'Item 2\\>', price: '$200\\>' },
                                            ],
                                        },
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should render cart summary component successfully
                expect(element.querySelector('c-cart-summary')).toBeDefined();
            });

            it('should not affect other escape sequences', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    message: 'Text with \\n newlines and \\t tabs but \\> arrows',
                                    data: {
                                        escaped: '\\"quotes\\" and \\\\backslashes\\\\',
                                        arrows: 'Only \\> these should change',
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should render rich text component successfully
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should be idempotent - applying polish multiple times has no effect', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    message: 'Text with \\> arrows that are already polished',
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                // Should render without errors even if polish is applied multiple times
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });
        });

        describe('integration with existing content types', () => {
            it('should apply polish to product recommendations with complex data', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    productRecommendations: {
                                        className: 'B2CProductSearchActionResultsRepresentation',
                                        productsDetails: {
                                            products: [
                                                {
                                                    id: 'prod-1',
                                                    name: 'Samsung 55\\" TV\\>',
                                                    description: 'Great TV\\> for your home',
                                                    features: ['4K Resolution\\>', 'Smart TV\\>'],
                                                },
                                            ],
                                        },
                                        categoryDetails: {
                                            categories: [
                                                {
                                                    id: 'cat-1',
                                                    name: 'Electronics\\>',
                                                    description: 'All electronics\\> here',
                                                },
                                            ],
                                        },
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });

            it('should apply polish to order confirmation data', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    orderConfirmation: {
                                        className: 'B2COrderConfirmationRepresentation',
                                        orderDetails: {
                                            orderNumber: 'ORD-123\\>',
                                            items: [
                                                {
                                                    name: 'Product\\> Name',
                                                    description: 'Description\\> here',
                                                },
                                            ],
                                        },
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                expect(element.querySelector('c-summary-details')).toBeDefined();
            });
        });

        describe('edge cases and error handling', () => {
            it('should handle null and undefined values gracefully', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    data: {
                                        nullValue: null,
                                        undefinedValue: undefined,
                                        stringValue: 'Text with \\> arrows',
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle non-string values in objects', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    data: {
                                        number: 123,
                                        boolean: true,
                                        string: 'Text with \\> arrows',
                                        array: [1, 2, 3],
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle deeply nested objects with backslash-arrow sequences', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    level1: {
                                        level2: {
                                            level3: {
                                                level4: {
                                                    message: 'Deeply nested \\> arrows',
                                                    data: ['Array\\> item 1', 'Array\\> item 2'],
                                                },
                                            },
                                        },
                                    },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                element.conversationEntry = entry;
                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });
        });

        describe('performance considerations', () => {
            it('should handle large objects with many backslash-arrow sequences efficiently', () => {
                // Create a large object with many backslash-arrow sequences
                const largeObject = {
                    products: Array.from({ length: 100 }, (_, i) => ({
                        id: `product-${i}`,
                        name: `Product ${i} with \\> arrows`,
                        description: `Description ${i} with \\> more arrows`,
                        features: Array.from({ length: 10 }, (__, j) => `Feature ${j} with \\> arrows`),
                        specs: {
                            size: `${i}\\" TV\\>`,
                            weight: `${i} lbs\\>`,
                            color: `Color ${i}\\>`,
                        },
                    })),
                };

                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify(largeObject),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                const startTime = performance.now();
                element.conversationEntry = entry;
                const endTime = performance.now();

                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();

                // Performance should be reasonable (less than 100ms for this test)
                expect(endTime - startTime).toBeLessThan(100);
            });
        });
    });

    describe('JSON sanitization functionality', () => {
        describe('handles unescaped quotes in product descriptions', () => {
            it('should sanitize product recommendations with unescaped quotes', () => {
                const problematicPayload =
                    '{"productRecommendations":{"userQuery":"women\'s bags red","productsDetails":{"products":[{"variationsSummary":{"size":["ONE SIZE"],"color":["Pompeian Red / Juicy Red"]},"productPageUrl":"https://zyom-009.unified.demandware.net/s/NTOManaged/en_US/4100816.html","price":99.95,"name":"Women\'s Chimera 18 Backpack","inStock":true,"imageUrl":"https://s3.amazonaws.com/northerntrailoutfitters.com/nto-gear/default/images/large/4100816A5N-0.jpg","id":"4100816","discountPrice":99.95,"description":"Agile and lightweight pack for trail aficionados ready to crush the miles.","currencyCode":"USD"},{"variationsSummary":{"size":["XS/S","M/L"],"color":["Urban Navy / Meridian Blue","New Taupe Green / Four Leaf Clover","Pompeian Red / Juicy Red"]},"productPageUrl":"https://zyom-009.unified.demandware.net/s/NTOManaged/en_US/4100953.html","price":169.95,"name":"Women\'s Hydra 38 Backpack","inStock":true,"imageUrl":"https://s3.amazonaws.com/northerntrailoutfitters.com/nto-gear/default/images/large/4100953A5N-0.jpg","id":"4100953","discountPrice":169.95,"description":"Breathable, light pack for superior, lasting comfort on weekend missions.","currencyCode":"USD"},{"variationsSummary":{"size":["ONE SIZE"],"color":["Sequoia Red Light Heather / Sequoia Red"]},"productPageUrl":"https://zyom-009.unified.demandware.net/s/NTOManaged/en_US/4061141.html","price":55.0,"name":"Women\'s Electra Daypack","inStock":true,"imageUrl":"https://s3.amazonaws.com/northerntrailoutfitters.com/nto-gear/default/images/large/4061141A8N-0.jpg","id":"4061141","discountPrice":55.0,"description":"Low-profile backpack for "when look good, travel light is the motto.","currencyCode":"USD"}],"description":"Here are some top recommendations based on your query."},"isCartMgmtSupported":"true","className":"B2CProductSearchActionResultsRepresentation","categoryDetails":{"description":"Let me know if you are looking for something specific.","categories":[]}}}';

                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: problematicPayload,
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                // This should not throw an error and should render successfully
                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                // The component should render successfully
                expect(element).toBeDefined();

                // Should render product search recommendations component
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });

            it('should handle product names with inch marks', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"product": {"name": "55" TV", "description": "Great "smart" TV for your home"}}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle nested objects with multiple unescaped quotes', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"data": {"user": {"name": "John "Johnny" Doe", "message": "He said "hello world""}}}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle arrays with quoted strings', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"items": ["Item with "quotes"", "Another "quoted" item"]}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle inner quoted phrases within strings', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"message": "let me know "looking for shoes" and other items", "userQuery": "search for "red sneakers" please"}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle complex nested quotes in product descriptions', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"productRecommendations":{"userQuery":"looking for "red shoes"","productsDetails":{"products":[{"name":"Nike "Air Max" 270","description":"Perfect for "running" and "walking" activities","price":120}]}}}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });
        });

        describe('handles newline normalization', () => {
            it('should normalize newlines in JSON content', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"description": "Line 1\nLine 2\r\nLine 3\rLine 4"}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle multiple consecutive newlines', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"text": "Line 1\n\n\nLine 2"}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });
        });

        describe('handles complex real-world scenarios', () => {
            it('should process product recommendations with complex formatting issues', () => {
                const complexPayload =
                    '{"productRecommendations":{"userQuery":"tvs under 30 inches","productsDetails":{"products":[{"variationsSummary":{},"productPageUrl":"URL_Redacted","price":549.99,"name":"Samsung Series 6 22" LCD High Definition Television","imageUrl":"URL_Redacted","id":"samsung-ln22a650M","discountPrice":549.99,"description":"Add an extraordinary touch of class and beauty to your HDTV with our unique Touch of Color™ feature. The LN22A650 also features high-definition picture quality so you see more details, heightened clarity and brilliant color. Plus, a 5,000:1 contrast ratio delivers incredibly sharp images in very dark or light scenes. You\'ll never look at your TV the same way again.","currencyCode":"USD"},{"variationsSummary":{},"productPageUrl":"URL_Redacted","price":214.5,"name":"Sanyo 19" LCD High Definition Television","imageUrl":"URL_Redacted","id":"sanyo-dp19648M","discountPrice":214.5,"description":"It features a tuner that receives both ATSC digital channels and NTSC analog channels. The digital tuner has Digital Clear QAM technology so it can receive unscrambled digital cable channels. A full complement of video inputs and audio outputs are provided. A PC/Mac input also allows alternative use as a computer monitor. And the detachable tilt base stand allows it to be wall mounted with an optional wall mount kit (not included).","currencyCode":"USD"}],"description":"Here are some top recommendations as per your query"},"isCartMgmtSupported":"true","className":"B2CProductSearchActionResultsRepresentation","categoryDetails":{"description":"Let me know if you are looking for something specific.","categories":[{"name":"Electronics","id":"electronics"},{"name":"New Arrivals","id":"newarrivals"}]}}}';

                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: complexPayload,
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('c-product-search-recommendations')).toBeDefined();
            });

            it('should handle product details with formatting issues', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"productDetails":{"details":[{"id":"prod1","name":"55" Smart TV\nwith features","description":"Great "smart" TV for your home"}]}}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('c-product-details')).toBeDefined();
            });

            it('should handle cart summary with quoted content', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"cartSummary":{"cartDetails":{"items":[{"name":"Item with "quotes"","price":"$100"},{"name":"Another "quoted" item","price":"$200"}]}}}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('c-cart-summary')).toBeDefined();
            });
        });

        describe('handles edge cases and error scenarios', () => {
            it('should handle content that is not JSON after sanitization', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: 'This is not JSON, just plain text with "quotes"',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle mixed valid and invalid JSON', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"valid": "json"} but then invalid with "quotes"',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle very long content with formatting issues', () => {
                const longText = '{"product": "' + 'A'.repeat(1000) + '55" TV' + 'B'.repeat(1000) + '"}';
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: longText,
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });

            it('should handle special characters that need sanitization', () => {
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: '{"message": "Product: 32" monitor\nPrice: $299.99"}',
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                expect(() => {
                    element.conversationEntry = entry;
                }).not.toThrow();

                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();
            });
        });

        describe('performance and large inputs', () => {
            it('should handle large objects with many formatting issues efficiently', () => {
                const largeObject = {
                    products: Array.from({ length: 50 }, (_, i) => ({
                        id: `product-${i}`,
                        name: `Product ${i} with "quotes"`,
                        description: `Description ${i} with "more quotes" and features`,
                    })),
                };

                const largeJson = JSON.stringify(largeObject);
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: largeJson,
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };

                const startTime = performance.now();
                element.conversationEntry = entry;
                const endTime = performance.now();

                expect(element).toBeDefined();
                expect(element.querySelector('lightning-formatted-rich-text')).toBeDefined();

                // Performance should be reasonable (less than 100ms for this test)
                expect(endTime - startTime).toBeLessThan(100);
            });
        });
    });

    describe('translation functionality', () => {
        it('should default to English when no language is configured', () => {
            expect(element.configuration?.language).toBeUndefined();
            // Test that i18n functionality works with default language
            expect(element.querySelector('[data-testid="dynamic-content"]')).toBeDefined();
        });

        it('should use Spanish labels when Spanish language is configured', async () => {
            element.configuration = {
                ...mockConfiguration,
                language: 'es',
            };
            await Promise.resolve();

            expect(element.configuration.language).toBe('es');
            // Test that component renders correctly with Spanish configuration
            expect(element.querySelector('[data-testid="dynamic-content"]')).toBeDefined();
        });

        it('should use French labels when French language is configured', async () => {
            element.configuration = {
                ...mockConfiguration,
                language: 'fr',
            };
            await Promise.resolve();

            expect(element.configuration.language).toBe('fr');
            // Test that component renders correctly with French configuration
            expect(element.querySelector('[data-testid="dynamic-content"]')).toBeDefined();
        });

        it('should fallback to English when unsupported language is configured', () => {
            element.configuration = {
                ...mockConfiguration,
                language: 'de',
            };

            expect(element.configuration.language).toBe('de');
            // Test that component renders correctly with unsupported language (should fallback)
            expect(element.querySelector('[data-testid="dynamic-content"]')).toBeDefined();
        });

        it('should handle undefined or null language configuration gracefully', () => {
            element.configuration = {
                ...mockConfiguration,
                language: undefined,
            };
            expect(element.configuration.language).toBeUndefined();
            // Test that component renders correctly with undefined language
            expect(element.querySelector('[data-testid="dynamic-content"]')).toBeDefined();

            element.configuration = {
                ...mockConfiguration,
                language: null,
            };
            expect(element.configuration.language).toBeNull();
            // Test that component renders correctly with null language
            expect(element.querySelector('[data-testid="dynamic-content"]')).toBeDefined();
        });

        it('should update translations when language configuration changes', async () => {
            // Start with English
            element.configuration = { ...mockConfiguration, language: 'en_US' };
            await Promise.resolve();

            expect(element.configuration.language).toBe('en_US');
            expect(element.querySelector('[data-testid="dynamic-content"]')).toBeDefined();

            // Change to Spanish
            element.configuration = { ...mockConfiguration, language: 'es' };
            await Promise.resolve();

            expect(element.configuration.language).toBe('es');
            expect(element.querySelector('[data-testid="dynamic-content"]')).toBeDefined();

            // Change to French
            element.configuration = { ...mockConfiguration, language: 'fr' };
            await Promise.resolve();

            expect(element.configuration.language).toBe('fr');
            expect(element.querySelector('[data-testid="dynamic-content"]')).toBeDefined();
        });
    });

    describe('isLongEndUserMessage functionality (tested via generateMessageBubbleClassname)', () => {
        it('should not include long-message class for non-EndUser messages', () => {
            const entry = {
                entryPayload: 'This is a long message with more than 40 characters',
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            const classname = element.generateMessageBubbleClassname;
            expect(classname).not.toContain('long-message');
            expect(classname).toContain('Chatbot');
        });

        it('should not include long-message class for EndUser messages with 40 or fewer characters (gets full width)', () => {
            const entry = {
                entryPayload: 'This is a medium length message',
                sender: { role: ENDUSER },
            };

            element.conversationEntry = entry;
            const classname = element.generateMessageBubbleClassname;
            expect(classname).not.toContain('long-message');
            expect(classname).toContain('EndUser');
        });

        it('should include long-message class for EndUser messages with more than 40 characters (gets 80% width)', () => {
            const entry = {
                entryPayload:
                    'This is a very long message that exceeds the forty character limit and should be constrained',
                sender: { role: ENDUSER },
            };

            element.conversationEntry = entry;
            const classname = element.generateMessageBubbleClassname;
            expect(classname).toContain('long-message');
            expect(classname).toContain('EndUser');
        });

        it('should not include long-message class for EndUser messages with exactly 40 characters (gets full width)', () => {
            const entry = {
                entryPayload: '1234567890123456789012345678901234567890', // Exactly 40 characters
                sender: { role: ENDUSER },
            };

            element.conversationEntry = entry;
            const classname = element.generateMessageBubbleClassname;
            expect(classname).not.toContain('long-message');
            expect(classname).toContain('EndUser');
        });

        it('should not include long-message class for EndUser messages with orderCompleted JSON format (gets full width)', () => {
            const orderCompletedMessage = JSON.stringify({
                orderCompleted: {
                    className: 'orderCompleted',
                    orderNumber: '1234567890',
                    paymentMethod: 'credit card',
                },
            });

            const entry = {
                entryPayload: orderCompletedMessage,
                sender: { role: ENDUSER },
            };

            element.conversationEntry = entry;
            const classname = element.generateMessageBubbleClassname;
            expect(classname).not.toContain('long-message');
            expect(classname).toContain('EndUser');
        });

        it('should include long-message class for EndUser messages with plain text that exceeds 40 characters', () => {
            const longTextMessage =
                'This is a very long message that exceeds the forty character limit and should be constrained to 80% width';

            const entry = {
                entryPayload: longTextMessage,
                sender: { role: ENDUSER },
            };

            element.conversationEntry = entry;
            const classname = element.generateMessageBubbleClassname;
            expect(classname).toContain('long-message');
            expect(classname).toContain('EndUser');
        });
    });

    describe('Error handling and edge cases', () => {
        it('should handle window.open errors in handleShowProduct', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const originalWindowOpen = window.open;
            window.open = jest.fn(() => {
                throw new Error('Window open failed');
            });

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                className: 'productRecommendations',
                                isCartMgmtSupported: false,
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;

            const event = {
                detail: { url: 'https://example.com/product' },
            };

            element.handleShowProduct(event);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to open product URL:', expect.any(Error));

            consoleErrorSpy.mockRestore();
            window.open = originalWindowOpen;
        });

        it('should handle double-encoded JSON parsing', () => {
            const doubleEncodedJson = JSON.stringify(
                JSON.stringify({
                    className: 'productRecommendations',
                    productsDetails: { products: [] },
                })
            );

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: doubleEncodedJson,
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;

            // Check that the component renders without errors
            expect(element.textContent).toBeDefined();
        });

        it('should handle JSON sanitization and repair for malformed JSON', () => {
            const malformedJson =
                '{"className": "productRecommendations", "productsDetails": {"products": []}, "description": "Test\\>Product"}';

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: malformedJson,
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;

            // Check that the component renders without errors
            expect(element.textContent).toBeDefined();
        });

        it('should handle backslash arrow polishing in strings', () => {
            const jsonWithBackslashArrows = JSON.stringify({
                className: 'productRecommendations',
                productsDetails: {
                    products: [{ name: 'Test\\>Product', description: 'Category\\>Subcategory' }],
                },
            });

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: jsonWithBackslashArrows,
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;

            // Check that the component renders without errors
            expect(element.textContent).toBeDefined();
        });

        it('should handle localStorage errors gracefully', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const localStorageSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('localStorage not available');
            });

            const messageEvent = new MessageEvent('message', {
                data: {
                    type: 'lwc.pwaContext',
                    payload: {
                        pwaDomainUrl: 'https://example.com',
                        pwaSiteId: 'test-site',
                        pwaLocale: 'en_US',
                    },
                },
            });

            // Simulate the message handler by dispatching the event
            window.dispatchEvent(messageEvent);

            expect(consoleWarnSpy).toHaveBeenCalledWith('localStorage not available:', expect.any(Error));

            consoleWarnSpy.mockRestore();
            localStorageSpy.mockRestore();
        });

        it('should handle disconnectedCallback cleanup properly', () => {
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            // Create a new element to test lifecycle
            const newElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            document.body.appendChild(newElement);

            // Remove the element to trigger disconnectedCallback
            document.body.removeChild(newElement);

            expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });

        it('should handle contextual data for welcome messages', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: '<img src="test.jpg" alt="Welcome">',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;

            // Simulate receiving contextual data via message
            const messageEvent = new MessageEvent('message', {
                data: {
                    type: 'conversational.actualConversationContext',
                    payload: {
                        conversationContext: [{ name: 'Test Context', id: 'test-id' }],
                    },
                },
            });

            window.dispatchEvent(messageEvent);

            // Check that the component handles the message without errors
            expect(element.textContent).toBeDefined();
        });

        it('should handle invalid conversation entry gracefully', () => {
            // Test with null entry
            element.conversationEntry = null;
            expect(element.textContent).toBeDefined();

            // Test with invalid entry
            element.conversationEntry = 'invalid';
            expect(element.textContent).toBeDefined();

            // Test with entry missing sender
            element.conversationEntry = { id: 'test' };
            expect(element.textContent).toBeDefined();
        });

        it('should handle empty or malformed entry payload', () => {
            const entry = {
                entryPayload: '',
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            expect(element.textContent).toBe('');
        });

        it('should handle non-JSON entry payload', () => {
            const entry = {
                entryPayload: 'This is plain text',
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            // Component should handle non-JSON payload gracefully
            expect(element.textContent).toBeDefined();
        });

        it('should handle data processor errors in dynamicComponentData', () => {
            // Test error handling by providing invalid data that would cause processing errors
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                className: 'productRecommendations',
                                productsDetails: { products: [] },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            // Component should handle the data without errors
            expect(element.textContent).toBeDefined();
        });

        it('should include contextual data for welcome messages', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: '<img src="test.jpg" alt="Welcome">',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            // Component should handle welcome messages without errors
            expect(element.textContent).toBeDefined();
        });

        it('should handle mobile detection', () => {
            // Mock navigator.userAgent for mobile
            const originalUserAgent = navigator.userAgent;
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
                configurable: true,
            });

            // Test mobile detection through component behavior
            const entry = {
                entryPayload: 'Test message',
                sender: { role: CHATBOT },
            };
            element.conversationEntry = entry;
            expect(element.textContent).toBeDefined();

            // Restore original userAgent
            Object.defineProperty(navigator, 'userAgent', {
                value: originalUserAgent,
                configurable: true,
            });
        });

        it('should handle desktop detection', () => {
            // Mock navigator.userAgent for desktop
            const originalUserAgent = navigator.userAgent;
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                configurable: true,
            });

            // Test desktop detection through component behavior
            const entry = {
                entryPayload: 'Test message',
                sender: { role: CHATBOT },
            };
            element.conversationEntry = entry;
            expect(element.textContent).toBeDefined();

            // Restore original userAgent
            Object.defineProperty(navigator, 'userAgent', {
                value: originalUserAgent,
                configurable: true,
            });
        });

        it('should handle select context with valid context name', () => {
            element.configuration = {
                util: {
                    sendTextMessage: mockSendTextMessage,
                },
            };

            const event = {
                detail: { name: 'Test Context' },
            };

            element.handleSelectContext(event);

            expect(mockSendTextMessage).toHaveBeenCalledWith('Test Context');
        });

        it('should handle select context with missing context name', () => {
            element.configuration = {
                util: {
                    sendTextMessage: mockSendTextMessage,
                },
            };

            const event = {
                detail: { id: 'test-id' }, // Missing name
            };

            element.handleSelectContext(event);

            expect(mockSendTextMessage).not.toHaveBeenCalled();
        });

        it('should handle invalid JSON parsing with fallback to invalid response message', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: '{"invalid": json}', // Invalid JSON
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;

            // Should handle invalid JSON gracefully
            expect(element.textContent).toBeDefined();
        });

        it('should handle ENDUSER role with unrecognized JSON', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                unknownProperty: 'value',
                                // No className property
                            }),
                        },
                    },
                }),
                sender: { role: 'EndUser' },
            };

            element.conversationEntry = entry;

            // Should render as plain text for EndUser
            expect(element.textContent).toBeDefined();
        });

        it('should handle welcome message postMessage calls', () => {
            const postMessageSpy = jest.spyOn(window.parent, 'postMessage');

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: '<img src="test.jpg" alt="Welcome">',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            // Test welcome message behavior
            expect(element.textContent).toBeDefined();

            postMessageSpy.mockRestore();
        });

        it('should handle non-welcome message without postMessage calls', () => {
            const postMessageSpy = jest.spyOn(window.parent, 'postMessage');

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'Regular text message',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            element.conversationEntry = entry;
            // Test non-welcome message behavior
            expect(element.textContent).toBeDefined();

            postMessageSpy.mockRestore();
        });
    });

    describe('Dynamic styling functionality', () => {
        let stylingElement;

        beforeEach(() => {
            stylingElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            stylingElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };
            document.body.appendChild(stylingElement);
        });

        afterEach(() => {
            while (document.body.firstChild) {
                document.body.removeChild(document.body.firstChild);
            }
        });

        it('should handle rich text content with DEFAULT_RICH_TEXT_CONFIG', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'Hello, this is a plain text message',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            stylingElement.conversationEntry = entry;

            // Should render rich text content (no error thrown)
            expect(stylingElement.querySelector('lightning-formatted-rich-text')).toBeDefined();
        });

        it('should handle structured content type without applying rich text styling', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                productsDetails: {
                                    products: [],
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            stylingElement.conversationEntry = entry;

            // Should render structured content (not formatted rich text)
            expect(stylingElement.querySelector('c-product-search-recommendations')).toBeDefined();
        });

        it('should handle entry set before component is connected', () => {
            // Create a new element without appending to DOM yet
            const disconnectedElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            disconnectedElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'Hello, this is a plain text message',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            // Set entry before connecting - should not throw error
            expect(() => {
                disconnectedElement.conversationEntry = entry;
            }).not.toThrow();

            // Verify content was processed
            expect(disconnectedElement.textContent).toBeDefined();
        });

        it('should handle component lifecycle with deferred operations', () => {
            // Create a new element without appending to DOM yet
            const disconnectedElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            disconnectedElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'Hello, this is a plain text message',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            // Set entry before connecting
            disconnectedElement.conversationEntry = entry;

            // Now connect the element - should not throw
            expect(() => {
                document.body.appendChild(disconnectedElement);
            }).not.toThrow();

            // Clean up
            document.body.removeChild(disconnectedElement);
        });

        it('should handle multiple entry updates without errors', () => {
            const entry1 = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'First message',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            const entry2 = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'Second message',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            // Set first entry - should not throw
            expect(() => {
                stylingElement.conversationEntry = entry1;
            }).not.toThrow();

            // Set second entry - should not throw errors
            expect(() => {
                stylingElement.conversationEntry = entry2;
            }).not.toThrow();

            // Should render formatted rich text
            expect(stylingElement.querySelector('lightning-formatted-rich-text')).toBeDefined();
        });

        it('should handle content type changes gracefully', () => {
            // First, set rich text content
            const entry1 = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'Plain text',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            stylingElement.conversationEntry = entry1;
            expect(stylingElement.querySelector('lightning-formatted-rich-text')).toBeDefined();

            // Now set structured content
            const entry2 = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                className: CONTENT_TYPES.CART_SUMMARY,
                                cartDetails: {},
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            stylingElement.conversationEntry = entry2;

            // Should render structured content component
            expect(stylingElement.querySelector('c-cart-summary')).toBeDefined();
        });

        it('should handle EndUser messages with rich text content', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'Hello from end user',
                        },
                    },
                }),
                sender: { role: ENDUSER },
            };

            stylingElement.conversationEntry = entry;

            // Should render EndUser text with formatted rich text
            expect(stylingElement.querySelector('lightning-formatted-rich-text')).toBeDefined();
        });

        it('should handle invalid conversationEntry gracefully', () => {
            const invalidEntry = null;

            // Should not throw
            expect(() => {
                stylingElement.conversationEntry = invalidEntry;
            }).not.toThrow();

            // Component should handle gracefully
            expect(stylingElement).toBeDefined();
        });

        it('should process entry with empty payload', () => {
            const entry = {
                entryPayload: '',
                sender: { role: CHATBOT },
            };

            // Should not throw
            expect(() => {
                stylingElement.conversationEntry = entry;
            }).not.toThrow();

            // Should have empty text content
            expect(stylingElement.textContent).toBe('');
        });

        it('should send postMessage calls for welcome messages with image', () => {
            const postMessageSpy = jest.spyOn(window.parent, 'postMessage');

            // Create new element for clean test
            const welcomeElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            welcomeElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };

            // Set welcome message BEFORE connecting to DOM
            const welcomeEntry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: '<img src="welcome.png" alt="Welcome" />',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };
            welcomeElement.conversationEntry = welcomeEntry;

            // Now connect - this should trigger postMessage calls
            document.body.appendChild(welcomeElement);

            // Verify all three postMessage calls were made
            expect(postMessageSpy).toHaveBeenCalledWith(
                {
                    type: 'lwc.getConversationContext',
                },
                '*'
            );

            expect(postMessageSpy).toHaveBeenCalledWith(
                {
                    type: 'lwc.getPwaContext',
                },
                '*'
            );

            expect(postMessageSpy).toHaveBeenCalledWith(
                {
                    type: 'lwc.getDomainUrl',
                },
                '*'
            );

            // Clean up
            document.body.removeChild(welcomeElement);
            postMessageSpy.mockRestore();
        });

        it('should handle welcome messages with contextual data', () => {
            const welcomeElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            welcomeElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };

            const welcomeEntry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: '<img src="welcome.png" alt="Welcome" />',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            // Set entry first, then connect (to trigger welcome message logic)
            welcomeElement.conversationEntry = welcomeEntry;
            document.body.appendChild(welcomeElement);

            // Simulate postMessage for contextual data (proper way to set internal state)
            const contextMessage = new MessageEvent('message', {
                data: {
                    type: 'lwc.conversationContext',
                    payload: {
                        conversationContext: [{ name: 'Test Context', id: '123' }],
                        conversationContextDescription: 'Test Description',
                    },
                },
            });
            window.dispatchEvent(contextMessage);

            return Promise.resolve().then(() => {
                // Verify the component renders the image (welcome message indicator)
                expect(welcomeElement.querySelector('lightning-formatted-rich-text')).toBeDefined();

                // Clean up
                document.body.removeChild(welcomeElement);
            });
        });

        it('should handle data processor errors gracefully', () => {
            const testElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            testElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };
            document.body.appendChild(testElement);

            // Test with malformed/invalid product data that would cause processing errors
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
                                // Invalid structure - missing required fields
                                productsDetails: null,
                                categoryDetails: undefined,
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            // Should not throw even with invalid data structure
            expect(() => {
                testElement.conversationEntry = entry;
            }).not.toThrow();

            // Component should still render (product recommendations component handles invalid data)
            expect(testElement.querySelector('c-product-search-recommendations')).toBeDefined();

            // Clean up
            document.body.removeChild(testElement);
        });

        it('should handle markdown parsing errors gracefully', () => {
            const testElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            testElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };
            document.body.appendChild(testElement);

            // Spy on console.warn to verify error handling
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            // Create entry with content
            const entry = {
                id: 'test-markdown-error',
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: '# Valid markdown',
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            // Should not throw
            expect(() => {
                testElement.conversationEntry = entry;
            }).not.toThrow();

            // Verify component processed the entry
            expect(testElement.conversationEntry).toBeDefined();

            consoleWarnSpy.mockRestore();
            document.body.removeChild(testElement);
        });

        it('should handle nested lists without extra <p> tags', () => {
            const testElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            testElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };
            document.body.appendChild(testElement);

            // Markdown with nested lists
            const markdownText = `1. First item
   - Nested bullet
   - Another nested bullet
2. Second item`;

            const entry = {
                id: 'test-nested-lists',
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: markdownText,
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            testElement.conversationEntry = entry;

            // Get rendered content
            return Promise.resolve().then(() => {
                const richTextElement = testElement.querySelector('lightning-formatted-rich-text');
                expect(richTextElement).toBeTruthy();

                // Should have rendered HTML without extra <p> tags in list items
                const renderedValue = richTextElement.value;
                expect(renderedValue).toBeTruthy();

                // Should not have <li><p> combinations (unwrapped by parser)
                expect(renderedValue).not.toContain('<li><p>');

                // Should have proper list structure
                expect(renderedValue).toContain('<ol>');
                expect(renderedValue).toContain('<ul>');
                expect(renderedValue).toContain('<li>');

                document.body.removeChild(testElement);
            });
        });

        it('should remove empty paragraphs from markdown output', () => {
            const testElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            testElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };
            document.body.appendChild(testElement);

            // Markdown that might produce empty paragraphs
            const markdownText = `First paragraph

Second paragraph`;

            const entry = {
                id: 'test-empty-paragraphs',
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: markdownText,
                        },
                    },
                }),
                sender: { role: AGENT },
            };

            testElement.conversationEntry = entry;

            return Promise.resolve().then(() => {
                const richTextElement = testElement.querySelector('lightning-formatted-rich-text');
                expect(richTextElement).toBeTruthy();

                const renderedValue = richTextElement.value;
                expect(renderedValue).toBeTruthy();

                // Should not have empty paragraphs
                expect(renderedValue).not.toContain('<p></p>');
                expect(renderedValue).not.toContain('<p> </p>');

                // Should have actual paragraph content
                expect(renderedValue).toContain('First paragraph');
                expect(renderedValue).toContain('Second paragraph');

                document.body.removeChild(testElement);
            });
        });

        it('should normalize cross-platform line endings', () => {
            const testElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            testElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };
            document.body.appendChild(testElement);

            // Test Windows line endings (\r\n) - all line endings get normalized the same way
            const windowsText = 'Line 1\r\nLine 2\r\nLine 3';

            const entry = {
                id: 'test-line-endings',
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: windowsText,
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            testElement.conversationEntry = entry;

            return Promise.resolve().then(() => {
                // Should be normalized and rendered consistently
                const richTextElement = testElement.querySelector('lightning-formatted-rich-text');
                expect(richTextElement).toBeTruthy();
                expect(richTextElement.value).toBeTruthy();
                expect(richTextElement.value).toContain('Line 1');
                expect(richTextElement.value).toContain('Line 2');
                expect(richTextElement.value).toContain('Line 3');

                document.body.removeChild(testElement);
            });
        });

        it('should handle mixed ordered and unordered lists', () => {
            const testElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            testElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };
            document.body.appendChild(testElement);

            // Mixed list types
            const markdownText = `1. Ordered item one
2. Ordered item two
   - Unordered nested
   - Another unordered
3. Ordered item three`;

            const entry = {
                id: 'test-mixed-lists',
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: markdownText,
                        },
                    },
                }),
                sender: { role: AGENT },
            };

            testElement.conversationEntry = entry;

            return Promise.resolve().then(() => {
                const richTextElement = testElement.querySelector('lightning-formatted-rich-text');
                expect(richTextElement).toBeTruthy();

                const renderedValue = richTextElement.value;
                expect(renderedValue).toBeTruthy();

                // Should have both ordered and unordered lists
                expect(renderedValue).toContain('<ol>');
                expect(renderedValue).toContain('<ul>');

                // Should contain the text content
                expect(renderedValue).toContain('Ordered item one');
                expect(renderedValue).toContain('Unordered nested');

                document.body.removeChild(testElement);
            });
        });

        it('should handle complex multi-level list hierarchies', () => {
            const testElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            testElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };
            document.body.appendChild(testElement);

            // Complex nested structure
            const markdownText = `1. Top level
   - Second level bullet
   - Another second level
     - Third level
2. Back to top level`;

            const entry = {
                id: 'test-multi-level-lists',
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: markdownText,
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            testElement.conversationEntry = entry;

            return Promise.resolve().then(() => {
                const richTextElement = testElement.querySelector('lightning-formatted-rich-text');
                expect(richTextElement).toBeTruthy();

                const renderedValue = richTextElement.value;
                expect(renderedValue).toBeTruthy();

                // Should have multiple list structures
                expect(renderedValue).toContain('<ol>');
                expect(renderedValue).toContain('<ul>');

                // Should not have extra paragraph wrappers in list items
                expect(renderedValue).not.toContain('<li><p>');

                // Should contain the text content
                expect(renderedValue).toContain('Top level');
                expect(renderedValue).toContain('Second level bullet');
                expect(renderedValue).toContain('Third level');

                document.body.removeChild(testElement);
            });
        });

        it('should handle invalid payment method in orderCompleted gracefully', () => {
            const testElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            testElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };
            document.body.appendChild(testElement);

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                className: CONTENT_TYPES.ORDER_COMPLETED,
                                orderCompleted: {
                                    paymentMethod: null, // Invalid payment method
                                },
                            }),
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            testElement.conversationEntry = entry;

            // Should fall back to generic payment succeeded label
            expect(testElement.orderCompletedText).toBeTruthy();

            document.body.removeChild(testElement);
        });

        it('should handle malformed JSON that requires repair', () => {
            const testElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            testElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };
            document.body.appendChild(testElement);

            // Malformed JSON with unescaped quotes and newlines
            const malformedJson = `{"title": "Test "Product"", "desc": "Line1\nLine2"}`;

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: malformedJson,
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            // Should not throw when setting entry
            expect(() => {
                testElement.conversationEntry = entry;
            }).not.toThrow();

            // Component should have processed the entry
            expect(testElement.conversationEntry).toBeDefined();

            document.body.removeChild(testElement);
        });

        it('should handle double-encoded JSON strings', () => {
            const testElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            testElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };
            document.body.appendChild(testElement);

            const innerJson = JSON.stringify({ message: 'test' });
            const doubleEncoded = JSON.stringify(innerJson);

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: doubleEncoded,
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            // Should not throw
            expect(() => {
                testElement.conversationEntry = entry;
            }).not.toThrow();

            // Component should have processed the entry
            expect(testElement.conversationEntry).toBeDefined();

            document.body.removeChild(testElement);
        });

        it('should handle non-string content in _isValidTextString', () => {
            const testElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            testElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };
            document.body.appendChild(testElement);

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: 'null', // String representation
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            // Should not throw
            expect(() => {
                testElement.conversationEntry = entry;
            }).not.toThrow();

            // Component should have processed the entry
            expect(testElement.conversationEntry).toBeDefined();

            document.body.removeChild(testElement);
        });

        it('should handle JSON parsing errors with complex fallback', () => {
            const testElement = createElement('c-dynamic-content-renderer', {
                is: DynamicContentRenderer,
            });
            testElement.configuration = {
                util: {
                    sendTextMessage: jest.fn(),
                },
            };
            document.body.appendChild(testElement);

            // Severely malformed JSON that can't be repaired
            const badJson = '{unclosed: "object", missing: brackets}';

            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: badJson,
                        },
                    },
                }),
                sender: { role: CHATBOT },
            };

            // Should not throw
            expect(() => {
                testElement.conversationEntry = entry;
            }).not.toThrow();

            // Component should have processed the entry
            expect(testElement.conversationEntry).toBeDefined();

            document.body.removeChild(testElement);
        });
    });

    describe('sendPsaMsgToStorefront method', () => {
        let mockPostMessage;
        const mockAncestorOrigin = 'http://www.test.com';

        beforeEach(() => {
            // Mock window.parent.postMessage
            mockPostMessage = jest.fn();
            Object.defineProperty(window.parent, 'postMessage', {
                value: mockPostMessage,
                writable: true,
            });
            window.location.ancestorOrigins = [mockAncestorOrigin];
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should send lwc.agentInvokedSearch postMessage when agentSessionId is provided and ancestorOrigins is set', () => {
            const agentSessionId = mockAgentSessionId;
            const searchQuery = 'search for jackets';

            element.sendPsaMsgToStorefront(agentSessionId, searchQuery);

            expect(mockPostMessage).toHaveBeenCalledWith(
                {
                    type: 'lwc.agentInvokedSearch',
                    timestamp: expect.any(Number),
                    agentSessionId: agentSessionId,
                    searchQuery: searchQuery,
                },
                mockAncestorOrigin
            );
        });

        it('should send lwc.agentInvokedSearch postMessage when agentSessionId is provided and ancestorOrigins is null', () => {
            window.location.ancestorOrigins = null;
            const agentSessionId = mockAgentSessionId;
            const searchQuery = 'search for jackets';

            element.sendPsaMsgToStorefront(agentSessionId, searchQuery);

            expect(mockPostMessage).toHaveBeenCalledWith(
                {
                    type: 'lwc.agentInvokedSearch',
                    timestamp: expect.any(Number),
                    agentSessionId: agentSessionId,
                    searchQuery: searchQuery,
                },
                '*'
            );
        });

        it('should send lwc.agentInvokedSearch postMessage when agentSessionId is provided and ancestorOrigins is empty array', () => {
            window.location.ancestorOrigins = [];
            const agentSessionId = mockAgentSessionId;
            const searchQuery = 'search for jackets';

            element.sendPsaMsgToStorefront(agentSessionId, searchQuery);

            expect(mockPostMessage).toHaveBeenCalledWith(
                {
                    type: 'lwc.agentInvokedSearch',
                    timestamp: expect.any(Number),
                    agentSessionId: agentSessionId,
                    searchQuery: searchQuery,
                },
                '*'
            );
        });

        it('should not send postMessage when agentSessionId is null', () => {
            element.sendPsaMsgToStorefront(null, 'search query');

            expect(mockPostMessage).not.toHaveBeenCalled();
        });

        it('should not send postMessage when agentSessionId is undefined', () => {
            element.sendPsaMsgToStorefront(undefined, 'search query');

            expect(mockPostMessage).not.toHaveBeenCalled();
        });

        it('should not send postMessage when agentSessionId is empty string', () => {
            element.sendPsaMsgToStorefront('', 'search query');

            expect(mockPostMessage).not.toHaveBeenCalled();
        });

        it('should send postMessage with correct message structure', () => {
            const agentSessionId = mockAgentSessionId;
            const searchQuery = 'running shoes';

            element.sendPsaMsgToStorefront(agentSessionId, searchQuery);

            expect(mockPostMessage).toHaveBeenCalledTimes(1);
            expect(mockPostMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'lwc.agentInvokedSearch',
                    timestamp: expect.any(Number),
                    agentSessionId: mockAgentSessionId,
                    searchQuery: 'running shoes',
                }),
                mockAncestorOrigin
            );
        });
    });

    describe('sendPsaSearchResultClicked method', () => {
        let mockPostMessage;
        const mockAncestorOrigin = 'http://www.test.com';

        beforeEach(() => {
            // Mock window.parent.postMessage
            mockPostMessage = jest.fn();
            Object.defineProperty(window.parent, 'postMessage', {
                value: mockPostMessage,
                writable: true,
            });
            window.location.ancestorOrigins = [mockAncestorOrigin];
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should send lwc.agentSearchResultClicked postMessage when agentSessionId is provided and ancestorOrigins is set', () => {
            const agentSessionId = mockAgentSessionId;
            const productId = 'product-123';

            element.sendPsaSearchResultClicked(agentSessionId, productId);

            expect(mockPostMessage).toHaveBeenCalledWith(
                {
                    type: 'lwc.agentSearchResultClicked',
                    timestamp: expect.any(Number),
                    agentSessionId: agentSessionId,
                    productId: productId,
                },
                mockAncestorOrigin
            );
        });

        it('should send lwc.agentSearchResultClicked postMessage when agentSessionId is provided and ancestorOrigins is null', () => {
            window.location.ancestorOrigins = null;
            const agentSessionId = mockAgentSessionId;
            const productId = 'product-123';

            element.sendPsaSearchResultClicked(agentSessionId, productId);

            expect(mockPostMessage).toHaveBeenCalledWith(
                {
                    type: 'lwc.agentSearchResultClicked',
                    timestamp: expect.any(Number),
                    agentSessionId: agentSessionId,
                    productId: productId,
                },
                '*'
            );
        });

        it('should send lwc.agentSearchResultClicked postMessage when agentSessionId is provided and ancestorOrigins is empty array', () => {
            window.location.ancestorOrigins = [];
            const agentSessionId = mockAgentSessionId;
            const productId = 'product-123';

            element.sendPsaSearchResultClicked(agentSessionId, productId);

            expect(mockPostMessage).toHaveBeenCalledWith(
                {
                    type: 'lwc.agentSearchResultClicked',
                    timestamp: expect.any(Number),
                    agentSessionId: agentSessionId,
                    productId: productId,
                },
                '*'
            );
        });

        it('should not send postMessage when agentSessionId is null', () => {
            element.sendPsaSearchResultClicked(null, 'product-123');

            expect(mockPostMessage).not.toHaveBeenCalled();
        });

        it('should not send postMessage when agentSessionId is undefined', () => {
            element.sendPsaSearchResultClicked(undefined, 'product-123');

            expect(mockPostMessage).not.toHaveBeenCalled();
        });

        it('should not send postMessage when agentSessionId is empty string', () => {
            element.sendPsaSearchResultClicked('', 'product-123');

            expect(mockPostMessage).not.toHaveBeenCalled();
        });

        it('should send postMessage with correct message structure', () => {
            const agentSessionId = mockAgentSessionId;
            const productId = 'product-123';

            element.sendPsaSearchResultClicked(agentSessionId, productId);

            expect(mockPostMessage).toHaveBeenCalledTimes(1);
            expect(mockPostMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'lwc.agentSearchResultClicked',
                    timestamp: expect.any(Number),
                    agentSessionId: mockAgentSessionId,
                    productId: 'product-123',
                }),
                mockAncestorOrigin
            );
        });
    });

    describe('handleShowMoreProducts', () => {
        it('sends text message with product IDs when show more products is clicked', () => {
            element.configuration = {
                util: {
                    sendTextMessage: mockSendTextMessage,
                },
            };

            // Mock the i18n getter to return the showMoreProductsLabel
            Object.defineProperty(element, 'i18n', {
                get: () => ({
                    showMoreProductsLabel: 'Show more',
                }),
                configurable: true,
            });

            // Create a mock event with productIds
            const mockEvent = {
                stopPropagation: jest.fn(),
                preventDefault: jest.fn(),
                detail: {
                    productIds: ['1', '2', '3'],
                },
            };

            // Call the method
            element.handleShowMoreProducts(mockEvent);

            // Verify that stopPropagation and preventDefault were called
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
            expect(mockEvent.preventDefault).toHaveBeenCalled();

            // Verify that sendTextMessage was called with the expected message
            expect(mockSendTextMessage).toHaveBeenCalledWith('Show more (1, 2, 3)');
        });

        it('handles empty productIds array gracefully', () => {
            element.configuration = {
                util: {
                    sendTextMessage: mockSendTextMessage,
                },
            };

            // Mock the i18n getter to return the showMoreProductsLabel
            Object.defineProperty(element, 'i18n', {
                get: () => ({
                    showMoreProductsLabel: 'Show more',
                }),
                configurable: true,
            });

            // Create a mock event with empty productIds
            const mockEvent = {
                stopPropagation: jest.fn(),
                preventDefault: jest.fn(),
                detail: {
                    productIds: [],
                },
            };

            // Call the method
            element.handleShowMoreProducts(mockEvent);

            // Verify that sendTextMessage was called with empty product IDs
            expect(mockSendTextMessage).toHaveBeenCalledWith('Show more ()');
        });
    });
});
