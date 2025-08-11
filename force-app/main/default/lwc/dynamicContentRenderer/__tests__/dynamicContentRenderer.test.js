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
import { ENDUSER, CHATBOT, CONTENT_TYPES } from '../constants';

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
    'c-common-link',
    () => {
        return {
            __esModule: true,
            default: class MockCommonLink {
                static renderMode = 'light';
            },
        };
    },
    { virtual: true }
);

jest.mock(
    'c-common-modal',
    () => {
        return {
            __esModule: true,
            default: class MockCommonModal {
                static renderMode = 'light';
            },
        };
    },
    { virtual: true }
);

jest.mock(
    'c-common-number-input',
    () => {
        return {
            __esModule: true,
            default: class MockCommonNumberInput {
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

        it('should handle product recommendations gracefully when productsDetails and categoryDetails are null', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify({
                                productRecommendations: {
                                    className: CONTENT_TYPES.PRODUCT_RECOMMENDATIONS,
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

        it('should handle invalid content type gracefully for ENDUSER sender role', () => {
            const entry = {
                entryPayload: JSON.stringify({
                    abstractMessage: {
                        staticContent: {
                            text: JSON.stringify('INVALID JSON'),
                        },
                    },
                }),
                sender: { role: ENDUSER },
            };

            element.conversationEntry = entry;
            expect(element).toBeDefined();
        });

        it('should handle invalid staticContent text gracefully for ENDUSER sender role', () => {
            const entry = {
                entryPayload: '{"abstractMessage":{"staticContent":{"text":"Hello"}}}',
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
            expect(errorMessage.value).toBe('Unable to process the request. Please try again.');
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
                    'Add Cotton T-shirt with size medium, color white of quantity 3 to cart'
                );
            });

            it('should send message without variant details when variantDetails is missing', () => {
                const event = {
                    detail: {
                        quantity: 1,
                        productName: 'Simple Product',
                    },
                };

                element.handleAddToCart(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Add Simple Product of quantity 1 to cart');
            });

            it('should send message without variant details when variantDetails is empty array', () => {
                const event = {
                    detail: {
                        quantity: 2,
                        productName: 'Product',
                        variantDetails: [],
                    },
                };

                element.handleAddToCart(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Add Product of quantity 2 to cart');
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

        describe('handleSelectCategory', () => {
            beforeEach(() => {
                // Set up conversation entry with userQuery
                const entry = {
                    entryPayload: JSON.stringify({
                        abstractMessage: {
                            staticContent: {
                                text: JSON.stringify({
                                    userQuery: 'test query',
                                    productsDetails: { products: [] },
                                    categoryDetails: { categories: [] },
                                }),
                            },
                        },
                    }),
                    sender: { role: CHATBOT },
                };
                element.conversationEntry = entry;
            });

            it('should send text message with category details when valid category is provided', () => {
                const event = { detail: { name: 'Test Category', id: 'cat123' } };

                element.handleSelectCategory(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('test query for category Test Category (cat123)');
            });

            it('should not send message when category name is missing', () => {
                const event = { detail: { id: 'cat123' } };

                element.handleSelectCategory(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should not send message when category id is missing', () => {
                const event = { detail: { name: 'Test Category' } };

                element.handleSelectCategory(event);

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should not send message when event detail is null', () => {
                element.handleSelectCategory({ detail: null });

                expect(mockSendTextMessage).not.toHaveBeenCalled();
            });

            it('should use empty string for userQuery when not available', () => {
                // Set up conversation entry without userQuery
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

                const event = { detail: { name: 'Test Category', id: 'cat123' } };

                element.handleSelectCategory(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith(' for category Test Category (cat123)');
            });
        });

        describe('handleShowProduct', () => {
            beforeEach(() => {
                // Mock window.open
                global.window.open = jest.fn();
            });

            afterEach(() => {
                delete global.window.open;
            });

            it('should open URL when cart management is not supported', () => {
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

                expect(window.open).toHaveBeenCalledWith('https://example.com/product', '_blank');
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

                expect(window.open).toHaveBeenCalledWith('https://example.com/product', '_blank');
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

        describe('handlePayment', () => {
            it('should send order completed message when event detail is provided', () => {
                const event = { detail: 'ORD-123' };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith(
                    '{"orderCompleted": {"className":"orderCompleted","orderNumber": "ORD-123"}}'
                );
            });

            it('should send apple pay failed message when event detail is null', () => {
                const event = { detail: null };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Apple Pay failed');
            });

            it('should send apple pay failed message when event detail is empty string', () => {
                const event = { detail: '' };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Apple Pay failed');
            });

            it('should send apple pay failed message when event detail is false', () => {
                const event = { detail: false };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Apple Pay failed');
            });

            it('should send apple pay failed message when event detail has failure status', () => {
                const event = { detail: { status: 'failure' } };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Apple Pay failed');
            });

            it('should send apple pay canceled message when event detail has cancel status', () => {
                const event = { detail: { status: 'cancel' } };

                element.handlePayment(event);

                expect(mockSendTextMessage).toHaveBeenCalledWith('Apple Pay canceled');
            });
        });
    });
});
