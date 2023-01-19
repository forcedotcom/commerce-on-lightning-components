import type { LightningElement } from 'lwc';
import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import ProductGrid from 'commerce_search/productGrid';

// Used to mock GeneratedUrl in callToActionAnchorButton
const mockGeneratedUrl = '/b2b/s/detail/0a9000000000001AAA';
jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => mockGeneratedUrl),
    NavigationContext: mockCreateTestWireAdapter(),
}));

const prices = {
    listingPrice: '200',
    negotiatedPrice: '500',
    currencyIsoCode: 'USD',
    isLoading: false,
};

const image = {
    alternateText: 'Supernova Pendant Alt Text',
    url: 'https://via.placeholder.com/250',
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

const cards = [
    {
        id: '001',
        name: 'product1',
        image,
        prices,
        fields,
        productClass: '',
    },
    {
        id: '002',
        name: 'product2',
        image,
        prices,
        fields,
        productClass: '',
    },
    {
        id: '003',
        name: 'product3',
        image,
        prices,
        fields,
        productClass: '',
    },
];

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
    layout: 'grid',
    fieldConfiguration: {},
    priceConfiguration: {
        showNegotiatedPrice: false,
        showListingPrice: false,
    },
};

const configuration = {
    layout: 'grid',
    gridMaxColumnsDisplayed: 4,
    cardConfiguration: config,
};

const customStyles = {
    'row-spacing': 'medium',
    'column-spacing': 'large',
};

const createComponentUnderTest = (): ProductGrid & HTMLElement => {
    const element: ProductGrid & HTMLElement = createElement('commerce_search-product-grid', {
        is: ProductGrid,
    });
    document.body.appendChild(element);
    return element;
};

const nextTick = Promise.resolve();

describe('commerce_search/productGrid: Product Grid', () => {
    let element: ProductGrid & HTMLElement;

    beforeEach(() => {
        element = createComponentUnderTest();
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('Product grid properties', () => {
        it('defaults to undefined', () => {
            expect(<LightningElement>element).toMatchObject({
                displayData: undefined,
                configuration: undefined,
                customStyles: undefined,
            });
        });

        it('reflects a changed value', () => {
            // Change the value.
            element.displayData = cards;
            element.configuration = configuration;
            element.customStyles = customStyles;

            // Ensure we reflect the changed value.
            expect(<LightningElement>element).toMatchObject({
                displayData: cards,
                configuration: configuration,
                customStyles: customStyles,
            });
        });
    });

    describe('Product Grid UI', () => {
        it('displays nothing when provided an empty product list undefined', () => {
            element.displayData = undefined;
            return Promise.resolve().then(() => {
                const productItems = element.querySelectorAll('li');
                expect(productItems).toHaveLength(0);
            });
        });

        it('reflects the correct number of grid elements when products are passed in', () => {
            // Change the value.
            element.displayData = cards;

            return Promise.resolve().then(() => {
                const productItems = element.querySelectorAll('li');
                expect(productItems).toHaveLength(cards.length);
            });
        });
    });

    describe('Product Grid Styling Configuration', () => {
        it("creates the CSS classes for the grid's list elements when a CustomStyles object is provided", async () => {
            // Arrange

            element.displayData = cards;

            element.customStyles = customStyles;

            // Act

            await Promise.resolve();

            // Assert

            const productItems = element.querySelectorAll('section.slds-m-vertical_medium.slds-m-horizontal_large');
            expect(productItems).toHaveLength(cards.length);
        });

        describe('Product Grid', () => {
            const productId = '01tRM000000Osl0ABC';
            const productName = 'SuperNova Pendant';

            it("handles and refires the 'showproduct' event", () => {
                element.configuration = {
                    layout: 'grid',
                    gridMaxColumnsDisplayed: 4,
                    cardConfiguration: config,
                };
                element.displayData = cards;

                const handler = jest.fn();
                element.addEventListener('showproduct', handler);

                return Promise.resolve()
                    .then(() => {
                        const productCard = element.querySelector('commerce_search-product-card');
                        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                        productCard!.dispatchEvent(
                            new CustomEvent('showproduct', {
                                bubbles: false,
                                composed: false,
                                detail: {
                                    productId: productId,
                                    productName: productName,
                                },
                            })
                        );
                    })
                    .then(() => {
                        expect(handler).toHaveBeenCalledWith(
                            expect.objectContaining({
                                detail: {
                                    productId: productId,
                                    productName: productName,
                                },
                            })
                        );
                    });
            });

            it("handles and refires the 'addproducttocart' event", () => {
                element.configuration = {
                    layout: 'grid',
                    gridMaxColumnsDisplayed: 3,
                    cardConfiguration: {
                        ...config,
                        showCallToActionButton: true,
                    },
                };
                element.displayData = cards;

                const handler = jest.fn();
                element.addEventListener('addproducttocart', handler);

                return Promise.resolve()
                    .then(() => {
                        const productCard = element.querySelector('commerce_search-product-card');
                        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                        productCard!.dispatchEvent(
                            new CustomEvent('addproducttocart', {
                                bubbles: true,
                                composed: true,
                                detail: {
                                    productId: productId,
                                    quantity: 1,
                                },
                            })
                        );
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
        });
    });

    describe('Product Grid a11y', () => {
        let handler0 = jest.fn();
        let handler1 = jest.fn();
        let handler2 = jest.fn();

        beforeEach(() => {
            // Arrange
            element.displayData = cards;
            element.configuration = {
                layout: 'list',
                gridMaxColumnsDisplayed: 4,
                cardConfiguration: {
                    ...config,
                    showCallToActionButton: false,
                },
            };

            handler0 = jest.fn();
            handler1 = jest.fn();
            handler2 = jest.fn();
        });

        const updateList = (el: HTMLElement): HTMLElement | null => {
            const ulEl = el.querySelector('ul');
            const productCardEls = Array.from(el.querySelectorAll<HTMLElement>('commerce_search-product-card'));

            jest.spyOn(productCardEls[0], 'focus').mockImplementation(handler0);
            jest.spyOn(productCardEls[1], 'focus').mockImplementation(handler1);
            jest.spyOn(productCardEls[2], 'focus').mockImplementation(handler2);

            return ulEl;
        };

        it('updates and rotates focus on ArrowDown', async () => {
            await nextTick;

            const ulEl = updateList(element);

            // Adding a synthetic target.dataset.id

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.setAttribute('data-id', '001');

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));

            expect(handler1).toHaveBeenCalled();

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.setAttribute('data-id', '002');

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));

            expect(handler2).toHaveBeenCalled();

            // Press ArrowDown on the last item
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.setAttribute('data-id', '003');

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));

            // Rotate focus to first item
            expect(handler0).toHaveBeenCalled();
        });

        it('updates and rotates focus on ArrowUp', async () => {
            await nextTick;

            const ulEl = updateList(element);

            // Adding a synthetic target.dataset.id
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.setAttribute('data-id', '003');

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

            expect(handler1).toHaveBeenCalled();

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.setAttribute('data-id', '002');

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

            expect(handler0).toHaveBeenCalled();

            // Press ArrowUp on the first item

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.setAttribute('data-id', '001');

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

            // Rotate focus to last item
            expect(handler2).toHaveBeenCalled();
        });

        it('should not update focus on ArrowUp/ArrowDown when showCallToActionButton = true', async () => {
            element.configuration = {
                layout: 'grid',
                gridMaxColumnsDisplayed: 4,
                cardConfiguration: {
                    ...config,
                    showCallToActionButton: true,
                },
            };

            await nextTick;

            const ulEl = updateList(element);

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.setAttribute('data-id', '002');
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));

            expect(handler2).not.toHaveBeenCalled();

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.setAttribute('data-id', '002');
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

            expect(handler0).not.toHaveBeenCalled();
        });

        it('should move focus to the first item on Home button press', async () => {
            // Arrange
            element.configuration = {
                layout: 'grid',
                gridMaxColumnsDisplayed: 4,
                cardConfiguration: {
                    ...config,
                    showCallToActionButton: true,
                },
            };

            await nextTick;

            const ulEl = updateList(element);

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.setAttribute('data-id', '002');
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.dispatchEvent(new KeyboardEvent('keydown', { code: 'Home' }));

            expect(handler0).toHaveBeenCalled();
        });

        it('should move focus to the last item on End button press', async () => {
            // Arrange
            element.configuration = {
                layout: 'grid',
                gridMaxColumnsDisplayed: 4,
                cardConfiguration: {
                    ...config,
                    showCallToActionButton: true,
                },
            };

            await nextTick;

            const ulEl = updateList(element);

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.setAttribute('data-id', '002');
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.dispatchEvent(new KeyboardEvent('keydown', { code: 'End' }));

            expect(handler2).toHaveBeenCalled();
        });

        it('should not explicitly track Tab button press', async () => {
            // Arrange
            element.configuration = {
                layout: 'grid',
                gridMaxColumnsDisplayed: 4,
                cardConfiguration: {
                    ...config,
                    showCallToActionButton: true,
                },
            };

            await nextTick;

            const ulEl = updateList(element);

            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.setAttribute('data-id', '002');
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            ulEl!.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab' }));

            expect(handler0).not.toHaveBeenCalled();
            expect(handler1).not.toHaveBeenCalled();
            expect(handler2).not.toHaveBeenCalled();
        });
    });
});
