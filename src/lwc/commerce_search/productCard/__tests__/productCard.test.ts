import type { LightningElement } from 'lwc';
import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import ProductCard from 'commerce_search/productCard';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import type { PageReference } from 'types/common';
import type { TestWireAdapter } from 'types/testing';

import * as resolver from 'experience/resourceResolver';

const selectors = {
    callToActionButton: 'commerce_product_details-add-to-cart-button',
    callToActionAnchorButton: 'commerce_search-call-to-action-anchor-button',
    productField: 'commerce_search-product-field',
    productPrice: 'commerce_search-product-price',
};

let exposedNavigationParams: PageReference | undefined;

// Used to mock GeneratedUrl in callToActionAnchorButton
const mockGeneratedUrl = '/b2b/s/detail/0a9000000000001AAA';
jest.mock('lightning/navigation', () => ({
    navigate: jest.fn((_, params) => {
        exposedNavigationParams = params;
    }),
    generateUrl: jest.fn(() => mockGeneratedUrl),
    NavigationContext: mockCreateTestWireAdapter(),
}));

jest.mock(
    '@salesforce/label/B2B_Search_Product_Card.addToCartAriaLabel',
    () => {
        return { default: 'Add to cart: {productTitle}' };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/B2B_Search_Product_Card.viewOptionsAriaLabel',
    () => {
        return { default: 'View options: {productTitle}' };
    },
    { virtual: true }
);

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        AppContextAdapter: mockCreateTestWireAdapter(),
        SessionContextAdapter: mockCreateTestWireAdapter(),
    })
);

const isGuestCartCheckoutEnabled = true;
const isLoggedIn = true;

const prices = {
    listingPrice: '200',
    negotiatedPrice: '500',
    currencyIsoCode: 'USD',
    isLoading: false,
};

const image = {
    alternateText: 'Supernova Pendant Alt Text',
    url: 'https://via.placeholder.com',
};

const fieldConfiguration = {
    Name: {
        showLabel: false,
        fontSize: 'large',
        fontColor: '#333',
    },
    Description: {
        showLabel: false,
        fontSize: 'medium',
        fontColor: '#111',
    },
    StockKeepingUnit: {
        showLabel: true,
        fontSize: 'small',
        fontColor: '#222',
    },
};

const config = {
    addToCartDisabled: false,
    addToCartButtonText: '',
    showCallToActionButton: false,
    viewOptionsButtonText: '',
    showQuantityRules: false,
    minimumQuantityGuideText: '',
    maximumQuantityGuideText: '',
    incrementQuantityGuideText: '',
    showQuantityRulesText: false,
    quantitySelectorLabelText: '',
    showProductImage: false,
    layout: '',
    fieldConfiguration: {},
    priceConfiguration: {
        showNegotiatedPrice: false,
        showListingPrice: false,
    },
};

const fields = [
    {
        name: 'Name',
        label: 'Product Name',
        type: 'STRING',
        value: 'Pendant',
        tabStoppable: true,
    },
    {
        name: 'Description',
        label: 'Product Name',
        type: 'STRING',
        value: 'Description of the product',
        tabStoppable: false,
    },
    {
        name: 'StockKeepingUnit',
        label: 'Product Name',
        type: 'STRING',
        value: 'SK0001',
        tabStoppable: false,
    },
];

const cardInfo = {
    id: '01tRM000000Osl0ABC',
    name: 'SuperNova Pendant',
    image,
    prices,
    fields,
    productClass: 'Variation',
    purchaseQuantityRule: undefined,
    variationAttributeSet: undefined,
};

const createComponentUnderTest = (): ProductCard & HTMLElement => {
    const productCard: ProductCard & HTMLElement = createElement('commerce_search-product-card', {
        is: ProductCard,
    });

    return productCard;
};

describe('commerceSearch/productCard: Product Card', () => {
    let element: ProductCard & HTMLElement;

    beforeEach(async () => {
        element = createComponentUnderTest();
        document.body.appendChild(element);

        (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
            data: { isGuestCartCheckoutEnabled },
        });
        (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({ data: { isLoggedIn } });

        await Promise.resolve();
    });

    afterEach(() => {
        document.body.removeChild(element);
        exposedNavigationParams = undefined;
    });

    describe('Verify productCard default values', () => {
        it('should be initialized to undefined', () => {
            expect(<LightningElement>element).toMatchObject({
                displayData: undefined,
                configuration: undefined,
                customStyles: undefined,
            });
        });

        it('reflects a changed value', () => {
            // Change the value.
            element.displayData = cardInfo;
            element.configuration = config;
            element.customStyles = {};

            // Ensure we reflect the changed value.
            expect(<LightningElement>element).toMatchObject({
                displayData: cardInfo,
                configuration: config,
                customStyles: {},
            });
        });
    });

    it('shows alternative text for product image', () => {
        const alternateText = 'Supernova Pendant Alt Text';

        element.configuration = {
            ...config,
            showProductImage: true,
            fieldConfiguration,
        };
        element.displayData = cardInfo;

        return Promise.resolve().then(() => {
            const imageWithAltAttribute = element.querySelector(`img[alt='${alternateText}']`);
            expect(imageWithAltAttribute).toBeTruthy();
        });
    });

    it('hides the image when showProductImage set to false', () => {
        element.configuration = {
            ...config,
            showProductImage: false,
        };

        return Promise.resolve().then(() => {
            const productImage = element.querySelector('.productImage>img');
            expect(productImage).toBeFalsy();
        });
    });

    it('shows the image when showProductImage set to true', () => {
        element.configuration = {
            ...config,
            showProductImage: true,
        };

        return Promise.resolve().then(() => {
            const productImage = element.querySelector('.productImage');
            expect(productImage).toBeTruthy();
        });
    });

    [null, ''].forEach((emptyImage) => {
        it(`shows a plain image element when no default image (${JSON.stringify(emptyImage)}) is provided`, () => {
            element.configuration = {
                ...config,
                showProductImage: true,
            };
            element.displayData = {
                ...cardInfo,
                image: {
                    alternateText: '',
                    url: emptyImage,
                },
            };

            return Promise.resolve().then(() => {
                const imageWithEmptyAlt = element.querySelector("img[alt=''][src='']");
                expect(imageWithEmptyAlt).toBeTruthy();
            });
        });
    });

    [null, ''].forEach((emptyValue) => {
        it(`shows an image with no alternative text when none is provided (${JSON.stringify(
            emptyValue
        )}) by the defaultImage`, () => {
            element.configuration = {
                ...config,
                showProductImage: true,
            };
            element.displayData = {
                ...cardInfo,
                image: {
                    alternateText: emptyValue,
                    url: '',
                },
            };

            return Promise.resolve().then(() => {
                const imageWithEmptyAlt = element.querySelector("img[alt='']");
                expect(imageWithEmptyAlt).toBeTruthy();
            });
        });

        it(`shows an image with no source when none is provided (${JSON.stringify(
            emptyValue
        )}) by the defaultImage`, () => {
            element.configuration = {
                ...config,
                showProductImage: true,
            };
            element.displayData = {
                ...cardInfo,
                image: {
                    url: emptyValue,
                    alternateText: '',
                },
            };

            return Promise.resolve().then(() => {
                const imageWithEmptyAlt = element.querySelector("img[src='']");
                expect(imageWithEmptyAlt).toBeTruthy();
            });
        });
    });

    describe('The `showproduct` event', () => {
        const SHOW_PRODUCT = 'showproduct';

        const expectedProductId = '01tRM000000Osl0ABC';

        [
            {
                elementName: 'productName',
                selector: 'section>.fieldsArea>a',
            },
            {
                elementName: 'productImage',
                selector: 'figure',
            },
        ].forEach((clickableElement) => {
            it('is fired when the product card is clicked', () => {
                element.configuration = {
                    ...config,
                    showProductImage: true,
                    showCallToActionButton: false,
                    fieldConfiguration,
                };
                element.displayData = cardInfo;

                const handler = jest.fn();
                element.addEventListener(SHOW_PRODUCT, handler);

                return Promise.resolve().then(() => {
                    const productCardElement = <HTMLElement>element.querySelector(`${clickableElement.selector}`);
                    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                    productCardElement!.click();
                    expect(handler).toHaveBeenCalledWith(
                        expect.objectContaining({
                            detail: {
                                productId: expectedProductId,
                                productName: cardInfo.name,
                            },
                        })
                    );
                });
            });
        });

        [
            {
                elementName: 'productName',
                selector: 'section>.fieldsArea>a',
            },
            {
                elementName: 'productImage',
                selector: 'figure',
            },
        ].forEach((clickableElement) => {
            it(`navigates to the product detail page with the correct productId when the user press 'Enter' ${clickableElement.elementName}`, () => {
                element.configuration = {
                    ...config,
                    showProductImage: true,
                    showCallToActionButton: false,
                    fieldConfiguration,
                };
                element.displayData = cardInfo;
                const handler = jest.fn();
                element.addEventListener(SHOW_PRODUCT, handler);
                return Promise.resolve().then(() => {
                    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                    element
                        .querySelector(clickableElement.selector)!
                        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                    expect(handler).toHaveBeenCalledWith(
                        expect.objectContaining({
                            detail: {
                                productId: expectedProductId,
                                productName: cardInfo.name,
                            },
                        })
                    );
                });
            });

            it(`ignores all keys except 'Enter' for ${clickableElement.elementName}`, () => {
                element.configuration = {
                    ...config,
                    showProductImage: true,
                    showCallToActionButton: false,
                    fieldConfiguration,
                };
                element.displayData = cardInfo;
                const handler = jest.fn();
                element.addEventListener(SHOW_PRODUCT, handler);
                return Promise.resolve().then(() => {
                    const clickElement = element.querySelector(clickableElement.selector);
                    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                    clickElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));
                    expect(handler).not.toHaveBeenCalled();
                });
            });
        });
    });

    describe('layout property', () => {
        [
            {
                layout: 'grid',
                cardContainerClass: 'cardContainerGrid',
            },
            {
                layout: 'list',
                cardContainerClass: 'cardContainerList',
            },
        ].forEach((param) => {
            it(`expects the container class ${param.cardContainerClass} for the ${param.layout} layout`, () => {
                element.displayData = cardInfo;
                element.configuration = {
                    ...config,
                    layout: param.layout,
                    fieldConfiguration,
                };

                return Promise.resolve().then(() => {
                    const containerClass = element.querySelector(`.${param.cardContainerClass}`);
                    expect(containerClass).toBeTruthy();
                });
            });
        });
    });

    describe('Add to Cart button', () => {
        ['Variation', 'Simple'].forEach((productClass) => {
            const ADD_PRODUCT_TO_CART_EVENT = 'addproducttocart';
            const handler = jest.fn();

            it('hides the Add to Cart button when showCallToActionButton set to false', () => {
                element.displayData = { ...cardInfo, productClass };
                element.configuration = {
                    ...config,
                    showCallToActionButton: false,
                    fieldConfiguration,
                };

                return Promise.resolve().then(() => {
                    const addToCartButton = element.querySelector(selectors.callToActionButton);
                    expect(addToCartButton).toBeFalsy();
                });
            });

            it('has an aria-label for assistive text', () => {
                element.displayData = { ...cardInfo, productClass };
                element.configuration = {
                    ...config,
                    showCallToActionButton: true,
                    fieldConfiguration,
                };

                return Promise.resolve().then(() => {
                    const addToCartButton = element.querySelector(selectors.callToActionButton);
                    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                    expect(addToCartButton!.ariaLabel).toBe('Add to cart: SuperNova Pendant');
                });
            });

            it('has an empty aria-label', () => {
                const emptyName = {
                    ...cardInfo,
                    productClass,
                    name: '',
                };
                element.displayData = emptyName;

                element.configuration = {
                    ...config,
                    showCallToActionButton: true,
                    fieldConfiguration,
                };

                return Promise.resolve().then(() => {
                    const addToCartButton = element.querySelector(selectors.callToActionButton);
                    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                    expect(addToCartButton!.ariaLabel).toBe('');
                });
            });

            it("fires 'addproducttocart' with productId and quantity fields", () => {
                element.displayData = { ...cardInfo, productClass };
                element.configuration = {
                    ...config,
                    showCallToActionButton: true,
                    fieldConfiguration,
                };
                element.addEventListener(ADD_PRODUCT_TO_CART_EVENT, handler);
                return Promise.resolve()
                    .then(() => {
                        const addToCartButton = <HTMLElement>element.querySelector(selectors.callToActionButton);
                        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                        addToCartButton!.click();
                    })
                    .then(() => {
                        expect(handler).toHaveBeenCalledTimes(1);
                        const eventDetails = handler.mock.calls[0][0].detail;
                        expect(eventDetails).toStrictEqual({
                            quantity: 1,
                            productId: '01tRM000000Osl0ABC',
                        });
                    });
            });

            it("fires 'addproducttocart' with productId and quantity", () => {
                element.displayData = {
                    ...cardInfo,
                    productClass,
                    purchaseQuantityRule: {
                        minimum: '3.0',
                        maximum: '30.0',
                        increment: '1.0',
                    },
                };
                element.configuration = {
                    ...config,
                    showQuantityRules: true,
                    showQuantityRulesText: true,
                    showCallToActionButton: true,
                    minimumQuantityGuideText: '',
                    maximumQuantityGuideText: '',
                    incrementQuantityGuideText: '',
                    fieldConfiguration,
                };
                element.addEventListener(ADD_PRODUCT_TO_CART_EVENT, handler);
                return Promise.resolve()
                    .then(() => {
                        const addToCartButton = <HTMLElement>element.querySelector(selectors.callToActionButton);
                        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                        addToCartButton!.click();
                    })
                    .then(() => {
                        expect(handler).toHaveBeenCalledTimes(1);
                        const eventDetails = handler.mock.calls[0][0].detail;
                        expect(eventDetails).toStrictEqual({ productId: '01tRM000000Osl0ABC', quantity: '3.0' });
                    });
            });

            it('should navigate to the login page when the user is a guest', async () => {
                (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
                    data: { isGuestCartCheckoutEnabled: false },
                });
                (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                    data: { isLoggedIn: false },
                });
                element.displayData = { ...cardInfo, productClass };
                element.configuration = {
                    ...config,
                    showCallToActionButton: true,
                    fieldConfiguration,
                };
                element.addEventListener(ADD_PRODUCT_TO_CART_EVENT, handler);
                const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
                await Promise.resolve();
                const addToCartButton = <HTMLButtonElement>element.querySelector(selectors.callToActionButton);
                // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                addToCartButton!.click();
                await Promise.resolve();
                expect(dispatchSpy).not.toHaveBeenCalled();
                expect(exposedNavigationParams).toEqual({
                    type: 'comm__namedPage',
                    attributes: {
                        name: 'Login',
                    },
                });
            });
        });
    });

    describe('View Options button', () => {
        const SHOW_PRODUCT_EVENT = 'showproduct';
        const handler = jest.fn();

        ['VariationParent', 'Set'].forEach((productClass) => {
            it(`hides the View Options button when showCallToActionButton is set to false and productClass is ${productClass}`, () => {
                element.displayData = {
                    ...cardInfo,
                    productClass: productClass,
                };
                element.configuration = {
                    ...config,
                    showCallToActionButton: false,
                    fieldConfiguration,
                };

                return Promise.resolve().then(() => {
                    const viewOptionsButton = element.querySelector(selectors.callToActionAnchorButton);
                    expect(viewOptionsButton).toBeNull();
                });
            });
        });

        ['VariationParent', 'Set'].forEach((productClass) => {
            it(`has an aria-label for assistive text when productClass is ${productClass}`, () => {
                element.displayData = {
                    ...cardInfo,
                    productClass: productClass,
                };
                element.configuration = {
                    ...config,
                    showCallToActionButton: true,
                    fieldConfiguration,
                };

                return Promise.resolve().then(() => {
                    const viewOptionsButton = element.querySelector(selectors.callToActionAnchorButton);
                    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                    expect(viewOptionsButton!.ariaLabel).toBe('View options: SuperNova Pendant');
                });
            });

            it('has empty aria-label for assistive text', () => {
                element.displayData = {
                    ...cardInfo,
                    name: '',
                    productClass: 'VariationParent',
                };
                element.configuration = {
                    ...config,
                    showCallToActionButton: true,
                    fieldConfiguration,
                };

                return Promise.resolve().then(() => {
                    const viewOptionsButton = <HTMLElement>element.querySelector(selectors.callToActionAnchorButton);
                    expect(viewOptionsButton.ariaLabel).toBe('');
                });
            });

            it('shows view options button for simple product when quantity rules are available', () => {
                element.displayData = {
                    ...cardInfo,
                    productClass: 'Simple',
                    purchaseQuantityRule: {
                        minimum: '2',
                        maximum: '',
                        increment: '',
                    },
                };
                element.configuration = {
                    ...config,
                    showCallToActionButton: true,
                    fieldConfiguration,
                };

                return Promise.resolve().then(() => {
                    const viewOptionsButtonEl = element.querySelector(selectors.callToActionAnchorButton);

                    expect(viewOptionsButtonEl).toBeTruthy();
                });
            });

            it('shows view options button for variation product when quantity rules are available', () => {
                element.displayData = {
                    ...cardInfo,
                    productClass: 'Variation',
                    purchaseQuantityRule: {
                        minimum: '2',
                        maximum: '',
                        increment: '',
                    },
                };
                element.configuration = {
                    ...config,
                    showCallToActionButton: true,
                    fieldConfiguration,
                };

                return Promise.resolve().then(() => {
                    const viewOptionsButtonEl = element.querySelector(selectors.callToActionAnchorButton);

                    expect(viewOptionsButtonEl).toBeTruthy();
                });
            });

            it('does not show view options button for simple product when quantity rules are absent', () => {
                element.displayData = {
                    ...cardInfo,
                    productClass: 'Simple',
                    purchaseQuantityRule: undefined,
                };
                element.configuration = {
                    ...config,
                    showCallToActionButton: true,
                    fieldConfiguration,
                };

                return Promise.resolve().then(() => {
                    const viewOptionsButtonEl = element.querySelector(selectors.callToActionAnchorButton);

                    expect(viewOptionsButtonEl).toBeNull();
                });
            });

            it('does not show view options button for simple product when quantity rules are empty', () => {
                element.displayData = {
                    ...cardInfo,
                    productClass: 'Simple',
                    // @ts-ignore edge case
                    purchaseQuantityRule: {},
                };
                element.configuration = {
                    ...config,
                    showQuantityRules: true,
                    showCallToActionButton: true,
                    fieldConfiguration,
                };

                return Promise.resolve().then(() => {
                    const viewOptionsButtonEl = element.querySelector(selectors.callToActionAnchorButton);

                    expect(viewOptionsButtonEl).toBeNull();
                });
            });

            it("fires 'showproduct' when the View Options button is clicked", () => {
                element.displayData = {
                    ...cardInfo,
                    productClass: 'VariationParent',
                };
                element.configuration = {
                    ...config,
                    showCallToActionButton: true,
                    fieldConfiguration,
                };
                element.addEventListener(SHOW_PRODUCT_EVENT, handler);
                return Promise.resolve()
                    .then(() => {
                        const viewOptionsButton = <HTMLElement>(
                            element.querySelector(selectors.callToActionAnchorButton)
                        );
                        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                        viewOptionsButton!.click();
                    })
                    .then(() => {
                        expect(handler).toHaveBeenCalledWith(
                            expect.objectContaining({
                                bubbles: false,
                                composed: false,
                                detail: {
                                    productId: '01tRM000000Osl0ABC',
                                    productName: 'SuperNova Pendant',
                                },
                            })
                        );
                    });
            });
        });
    });

    describe('Handle focus', () => {
        ['Variation', 'Simple'].forEach((productClass) => {
            it(`should focus the Call to Action button of a ${productClass} product when its enabled`, async () => {
                // Arrange

                element.displayData = { ...cardInfo, productClass };
                element.configuration = {
                    ...config,
                    showCallToActionButton: true,
                    fieldConfiguration,
                };

                await new Promise((resolve) => {
                    // eslint-disable-next-line @lwc/lwc/no-async-operation
                    setTimeout(resolve, 0);
                });

                // Act

                element.focus();

                // Assert

                const addToCartButtonEl = element.querySelector('commerce_product_details-add-to-cart-button button');
                expect(document.activeElement).toEqual(addToCartButtonEl);
            });

            it(`should focus product field when Call to Action button of a ${productClass} product is not enabled`, async () => {
                // Arrange

                element.displayData = { ...cardInfo, productClass };
                element.configuration = {
                    ...config,
                    showCallToActionButton: false,
                    fieldConfiguration,
                };

                await new Promise((resolve) => {
                    // eslint-disable-next-line @lwc/lwc/no-async-operation
                    setTimeout(resolve, 0);
                });

                // Act

                element.focus();

                // Assert

                const productFieldEl = <HTMLElement>element.querySelector('commerce_search-product-field');
                expect(productFieldEl.contains(document.activeElement)).toBeTruthy();
            });
        });
    });

    it('places focus on the Call to Action button when the focus() method is called', () => {
        // Arrange
        element.displayData = { ...cardInfo, productClass: 'VariationParent' };
        element.configuration = {
            ...config,
            showCallToActionButton: true,
            fieldConfiguration,
        };

        // Wait for all the microtasks to finish since we rely on a Promise chain for this URL resolution.
        // Do not blithely copy this pattern - this applies only to touchy lifecycle behaviors.
        const settled = new Promise((resolve) => {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(resolve, 0);
        });

        return settled.then(() => {
            // Act
            element.focus();
            const addToCartButtonEl = <HTMLElement>element.querySelector(selectors.callToActionAnchorButton);

            // Assert
            expect(addToCartButtonEl.contains(document.activeElement)).toBeTruthy();
        });
    });

    describe('Inline quantity rule text', () => {
        it('should show quantity rule text when (min, max, incr) text are non empty', async () => {
            // Arrange

            element.displayData = {
                ...cardInfo,
                productClass: 'Simple',
                purchaseQuantityRule: {
                    minimum: '3.0',
                    maximum: '30.0',
                    increment: '1.0',
                },
            };
            element.configuration = {
                ...config,
                showQuantityRules: true,
                showQuantityRulesText: true,
                minimumQuantityGuideText: 'Min Qty is {0}',
                maximumQuantityGuideText: 'Max Qty is {0}',
                incrementQuantityGuideText: 'Sold in increments of {0}',
                fieldConfiguration,
            };

            await Promise.resolve();

            // Assert

            const quantityRuleText = <HTMLTextAreaElement>element.querySelector('lightning-formatted-text');
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            expect(quantityRuleText.value).toBe('Min Qty is 3 • Max Qty is 30 • Sold in increments of 1');
        });

        it('should show empty quantity rules text when (min, max, incr) text are empty', async () => {
            element.displayData = {
                ...cardInfo,
                productClass: 'Simple',
                purchaseQuantityRule: {
                    minimum: '3.0',
                    maximum: '30.0',
                    increment: '1.0',
                },
            };
            element.configuration = {
                ...config,
                showQuantityRules: true,
                showQuantityRulesText: true,
                minimumQuantityGuideText: '',
                maximumQuantityGuideText: '',
                incrementQuantityGuideText: '',
                fieldConfiguration,
            };

            await new Promise((resolve) => {
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                setTimeout(resolve, 0);
            });

            const quantityRuleText = <HTMLTextAreaElement>element.querySelector('lightning-formatted-text');
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            expect(quantityRuleText!.value).toBe('');
        });

        it('should not show quantity rules text when showQuantityRulesText is false', () => {
            element.displayData = {
                ...cardInfo,
                productClass: 'Simple',
                purchaseQuantityRule: {
                    minimum: '3.0',
                    maximum: '30.0',
                    increment: '1.0',
                },
            };
            element.configuration = {
                ...config,
                showQuantityRules: true,
                showQuantityRulesText: false,
                minimumQuantityGuideText: '',
                maximumQuantityGuideText: '',
                incrementQuantityGuideText: '',
                fieldConfiguration,
            };

            return Promise.resolve().then(() => {
                const quantityRuleText = element.querySelector('lightning-formatted-text');
                expect(quantityRuleText).toBeNull();
            });
        });

        it('should not show quantity rules text when purchaseQuantityRule is null and showQuantityRules is true', () => {
            element.displayData = {
                ...cardInfo,
                productClass: 'Simple',
                purchaseQuantityRule: undefined,
            };
            element.configuration = {
                ...config,
                showQuantityRules: true,
                showQuantityRulesText: true,
                fieldConfiguration,
                minimumQuantityGuideText: 'Min Qty is {0}',
                maximumQuantityGuideText: 'Max Qty is {0}',
                incrementQuantityGuideText: 'Sold in increments of {0}',
            };

            return Promise.resolve().then(() => {
                const quantityRuleText = element.querySelector('lightning-formatted-text');
                expect(quantityRuleText).toBeNull();
            });
        });

        it('should not show quantity rules text when purchaseQuantityRule is undefined and showQuantityRules is true', () => {
            element.displayData = {
                ...cardInfo,
                productClass: 'Simple',
                purchaseQuantityRule: undefined,
            };
            element.configuration = {
                ...config,
                showQuantityRules: true,
                showQuantityRulesText: true,
                fieldConfiguration,
                minimumQuantityGuideText: 'Min Qty is {0}',
                maximumQuantityGuideText: 'Max Qty is {0}',
                incrementQuantityGuideText: 'Sold in increments of {0}',
            };

            return Promise.resolve().then(() => {
                const quantityRuleText = element.querySelector('lightning-formatted-text');
                expect(quantityRuleText).toBeNull();
            });
        });

        it('should not show quantity rule text if showQuantityRules is false', () => {
            element.displayData = {
                ...cardInfo,
                productClass: 'Simple',
                purchaseQuantityRule: {
                    minimum: '3',
                    maximum: '',
                    increment: '',
                },
            };
            element.configuration = {
                ...config,
                showQuantityRules: false,
                minimumQuantityGuideText: 'Min Qty is {0}',
                maximumQuantityGuideText: 'Max Qty is {0}',
                incrementQuantityGuideText: 'Sold in increments of {0}',
                fieldConfiguration,
            };

            return Promise.resolve().then(() => {
                const quantityRuleText = element.querySelector('lightning-formatted-text');
                expect(quantityRuleText).toBeNull();
            });
        });

        it('should not show quantity rule text if productClass is VariationParent', () => {
            element.displayData = {
                ...cardInfo,
                productClass: 'VariationParent',
                purchaseQuantityRule: {
                    minimum: '3',
                    maximum: '',
                    increment: '',
                },
            };
            element.configuration = {
                ...config,
                showQuantityRules: false,
                minimumQuantityGuideText: 'Min Qty is {0}',
                maximumQuantityGuideText: 'Max Qty is {0}',
                incrementQuantityGuideText: 'Sold in increments of {0}',
                fieldConfiguration,
            };

            return Promise.resolve().then(() => {
                const quantityRuleText = element.querySelector('lightning-formatted-text');
                expect(quantityRuleText).toBeNull();
            });
        });
    });

    describe('Inline quantity selector', () => {
        it('should not show inline quantity selector when purchaseQuantityRule is null', () => {
            element.displayData = {
                ...cardInfo,
                productClass: 'Simple',
                purchaseQuantityRule: undefined,
            };
            element.configuration = {
                ...config,
                showQuantityRules: true,
                showQuantityRulesText: true,
                fieldConfiguration,
                minimumQuantityGuideText: 'Min Qty is {0}',
                maximumQuantityGuideText: 'Max Qty is {0}',
                incrementQuantityGuideText: 'Sold in increments of {0}',
            };

            return Promise.resolve().then(() => {
                const quantitySelector = element.querySelector('commerce-quantity-selector');
                expect(quantitySelector).toBeNull();
            });
        });

        it('should not show inline quantity selector when product class is Variation Parent', () => {
            element.displayData = {
                ...cardInfo,
                productClass: 'VariationParent',
                purchaseQuantityRule: {
                    minimum: '3',
                    maximum: '',
                    increment: '',
                },
            };
            element.configuration = {
                ...config,
                showQuantityRules: true,
                showQuantityRulesText: true,
                fieldConfiguration,
                minimumQuantityGuideText: 'Min Qty is {0}',
                maximumQuantityGuideText: 'Max Qty is {0}',
                incrementQuantityGuideText: 'Sold in increments of {0}',
            };

            return Promise.resolve().then(() => {
                const quantitySelector = element.querySelector('commerce-quantity-selector');
                expect(quantitySelector).toBeNull();
            });
        });

        it('should show inline quantity selector when purchaseQuantityRule is available and showQuantityRules is true', () => {
            element.displayData = {
                ...cardInfo,
                productClass: 'Simple',
                purchaseQuantityRule: {
                    minimum: '3',
                    maximum: '',
                    increment: '',
                },
            };
            element.configuration = {
                ...config,
                showQuantityRules: true,
                showQuantityRulesText: true,
                fieldConfiguration,
                minimumQuantityGuideText: 'Min Qty is {0}',
                maximumQuantityGuideText: 'Max Qty is {0}',
                incrementQuantityGuideText: 'Sold in increments of {0}',
            };

            return Promise.resolve().then(() => {
                const quantitySelector = element.querySelector('commerce-quantity-selector');
                expect(quantitySelector).toBeDefined();
            });
        });

        const VALIDATION_CHANGED_EVT = 'valuechanged';
        [
            {
                productClass: 'Simple',
            },
            {
                productClass: 'Variation',
            },
        ].forEach((propertyTest) => {
            it(`add to cart button is enabled when the quantity is valid for "${propertyTest.productClass}" product`, () => {
                element.displayData = {
                    ...cardInfo,
                    productClass: propertyTest.productClass,
                    purchaseQuantityRule: {
                        minimum: '3.0',
                        maximum: '30.0',
                        increment: '1.0',
                    },
                };
                element.configuration = {
                    ...config,
                    showQuantityRules: true,
                    showQuantityRulesText: true,
                    showCallToActionButton: true,
                    minimumQuantityGuideText: '',
                    maximumQuantityGuideText: '',
                    incrementQuantityGuideText: '',
                    fieldConfiguration,
                };

                return Promise.resolve()
                    .then(() => {
                        const qs = element.querySelector('commerce-quantity-selector');
                        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                        qs!.dispatchEvent(
                            new CustomEvent(VALIDATION_CHANGED_EVT, {
                                bubbles: true,
                                composed: true,
                                detail: {
                                    isValid: true,
                                },
                            })
                        );
                    })
                    .then(() => {
                        const button = <HTMLButtonElement>(
                            element.querySelector('commerce_product_details-add-to-cart-button')
                        );
                        expect(button.disabled).toBe(false);
                    });
            });
        });

        [
            {
                productClass: 'Simple',
            },
            {
                productClass: 'Variation',
            },
        ].forEach((propertyTest) => {
            it(`add to cart button is disabled when the quantity is invalid for "${propertyTest.productClass}" product`, () => {
                element.displayData = {
                    ...cardInfo,
                    productClass: 'Simple',
                    purchaseQuantityRule: {
                        minimum: '3.0',
                        maximum: '30.0',
                        increment: '1.0',
                    },
                };
                element.configuration = {
                    ...config,
                    showQuantityRules: true,
                    showQuantityRulesText: true,
                    showCallToActionButton: true,
                    minimumQuantityGuideText: '',
                    maximumQuantityGuideText: '',
                    incrementQuantityGuideText: '',
                    fieldConfiguration,
                };

                return Promise.resolve()
                    .then(() => {
                        const qs = element.querySelector('commerce-quantity-selector');
                        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                        qs!.dispatchEvent(
                            new CustomEvent(VALIDATION_CHANGED_EVT, {
                                bubbles: true,
                                composed: true,
                                detail: {
                                    isValid: false,
                                },
                            })
                        );
                    })
                    .then(() => {
                        const button = <HTMLButtonElement>(
                            element.querySelector('commerce_product_details-add-to-cart-button')
                        );
                        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                        expect(button!.disabled).toBe(true);
                    });
            });
        });
    });

    describe('Inline quantity selector styling', () => {
        it('quantitySelectorContainer should contain stacked CSS class for a GridLayout', () => {
            element.displayData = {
                ...cardInfo,
                productClass: 'Simple',
                purchaseQuantityRule: {
                    minimum: '3.0',
                    maximum: '30.0',
                    increment: '1.0',
                },
            };
            element.configuration = {
                ...config,
                showQuantityRules: true,
                showQuantityRulesText: true,
                showCallToActionButton: true,
                minimumQuantityGuideText: 'Min Qty is {0}',
                maximumQuantityGuideText: 'Max Qty is {0}',
                incrementQuantityGuideText: 'Sold in increments of {0}',
                layout: 'grid',
                fieldConfiguration,
            };

            return Promise.resolve().then(() => {
                const quantitySelectorContainer = element.querySelector('.quantitySelectorContainer.stacked');
                expect(quantitySelectorContainer).toBeTruthy();
            });
        });

        it('quantitySelectorContainer should not contain stacked CSS class for a ListLayout', () => {
            element.displayData = {
                ...cardInfo,
                productClass: 'Simple',
                purchaseQuantityRule: {
                    minimum: '3.0',
                    maximum: '30.0',
                    increment: '1.0',
                },
            };
            element.configuration = {
                ...config,
                showQuantityRules: true,
                showQuantityRulesText: true,
                showCallToActionButton: true,
                minimumQuantityGuideText: '',
                maximumQuantityGuideText: '',
                incrementQuantityGuideText: '',
                layout: 'list',
                fieldConfiguration,
            };

            return Promise.resolve().then(() => {
                const quantitySelectorContainer = element.querySelector('.quantitySelectorContainer:not(.stacked)');
                expect(quantitySelectorContainer).toBeTruthy();
            });
        });
    });

    describe('Pricing', () => {
        it('shows product price when at least once price is configured to be shown', () => {
            element.configuration = {
                ...config,
                fieldConfiguration,
                priceConfiguration: {
                    showNegotiatedPrice: true,
                    showListingPrice: false,
                },
            };
            element.displayData = {
                ...cardInfo,
                productClass: 'Simple',
            };

            return Promise.resolve().then(() => {
                const productPriceEl = element.querySelector(selectors.productPrice);
                expect(productPriceEl).toBeTruthy();
            });
        });

        it('hides product price when both showNegotiatedPrice and showListingPrice are set to false', () => {
            element.configuration = {
                ...config,
                fieldConfiguration,
                priceConfiguration: {
                    showNegotiatedPrice: false,
                    showListingPrice: false,
                },
            };
            element.displayData = {
                ...cardInfo,
                productClass: 'Simple',
            };

            return Promise.resolve().then(() => {
                const productPriceEl = element.querySelector(selectors.productPrice);
                expect(productPriceEl).toBeNull();
            });
        });

        describe('When the custom height and width property are set', () => {
            it('should call the resolve function with assigned height and width', () => {
                element.configuration = {
                    ...config,
                    showProductImage: true,
                };

                element.displayData = cardInfo;
                const spy = jest.spyOn(resolver, 'resolve');

                return Promise.resolve().then(() => {
                    expect(spy).toHaveBeenNthCalledWith(1, image.url, false, {
                        height: 460,
                        width: 460,
                    });
                    const imageSrc = (<HTMLImageElement>element.querySelector('img'))?.src;
                    expect(imageSrc).toBe(`${image.url}/`);
                });
            });
        });
    });
});
