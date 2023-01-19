import type { LightningElement } from 'lwc';
import { createElement } from 'lwc';
import ProductPrice, { generateClassForSize } from 'commerce_search/productPrice';

const createComponentUnderTest = (): HTMLElement & ProductPrice => {
    const element: HTMLElement & ProductPrice = createElement('commerce_search-product-price', {
        is: ProductPrice,
    });
    document.body.appendChild(element);
    return element;
};

const displayData = {
    isLoading: true,
    negotiatedPrice: '50',
    currencyIsoCode: 'USD',
    listingPrice: '',
};

describe('commerce_search/productPrice: ProductPrice', () => {
    let element: HTMLElement & ProductPrice;

    afterEach(() => {
        document.body.removeChild(element);
    });

    beforeEach(() => {
        element = createComponentUnderTest();
    });

    describe('Product price properties', () => {
        it('properties defaults to undefined', () => {
            expect(<LightningElement>element).toMatchObject({
                displayData: undefined,
                configuration: undefined,
                customStyles: undefined,
            });
        });

        it('reflects a changed value', () => {
            element.displayData = displayData;
            element.configuration = {
                showNegotiatedPrice: true,
                showListingPrice: false,
            };
            element.customStyles = {};
            // Ensure we reflect the changed value.
            expect(<LightningElement>element).toMatchObject({
                displayData,
                configuration: { showNegotiatedPrice: true, showListingPrice: false },
                customStyles: {},
            });
        });
    });

    it('shows price loading', () => {
        element.configuration = {
            showListingPrice: true,
            showNegotiatedPrice: true,
        };
        element.displayData = {
            isLoading: true,
            negotiatedPrice: '50',
            currencyIsoCode: 'USD',
            listingPrice: '',
        };

        return Promise.resolve().then(() => {
            const priceLoadingEl = element.querySelector("[data-loading='true']");
            expect(priceLoadingEl).toBeTruthy();
        });
    });

    [
        // shows both listing and negotiated prices
        {
            showListingPrice: true,
            showNegotiatedPrice: true,
            listingPrice: '100',
            negotiatedPrice: '80', // negotiated price is lower
            expected: {
                listingPriceShown: true,
                negotiatedPriceShown: true,
                listingPriceStikedThroughShown: true,
                priceUnavailableShown: false,
            },
        },
        // if negotiated price is more than listing price then show negotiated price only
        {
            showListingPrice: true,
            showNegotiatedPrice: true,
            listingPrice: '100',
            negotiatedPrice: '110', // negotiated price is higher
            expected: {
                listingPriceShown: false,
                negotiatedPriceShown: true,
                listingPriceStikedThroughShown: false,
                priceUnavailableShown: false,
            },
        },
        // shows negotiated price only
        {
            showListingPrice: false, // disabled listing price
            showNegotiatedPrice: true,
            listingPrice: '100',
            negotiatedPrice: '80',
            expected: {
                listingPriceShown: false,
                negotiatedPriceShown: true,
                listingPriceStikedThroughShown: false,
                priceUnavailableShown: false,
            },
        },
        // shows negotiated price only
        {
            showListingPrice: true,
            showNegotiatedPrice: true,
            listingPrice: '', // empty listing price
            negotiatedPrice: '80',
            expected: {
                listingPriceShown: false,
                negotiatedPriceShown: true,
                listingPriceStikedThroughShown: false,
                priceUnavailableShown: false,
            },
        },
        // show price unavailable
        {
            showListingPrice: true, // visible listed price
            showNegotiatedPrice: true, // visible negotiated price
            listingPrice: '', // empty listed price
            negotiatedPrice: '', // empty negotiated price
            expected: {
                listingPriceShown: false,
                negotiatedPriceShown: false,
                listingPriceStikedThroughShown: false,
                priceUnavailableShown: true,
            },
        },
        // show price unavailable
        {
            showListingPrice: true, // visible listed price
            showNegotiatedPrice: false, // disabled negotiated price
            listingPrice: '100',
            negotiatedPrice: '80', // non empty negotiated price
            expected: {
                listingPriceShown: false,
                negotiatedPriceShown: false,
                listingPriceStikedThroughShown: false,
                priceUnavailableShown: true,
            },
        },
        // show price unavailable
        {
            showListingPrice: true,
            showNegotiatedPrice: true, // visible negotiated price
            listingPrice: '100',
            negotiatedPrice: '', // empty negotiated price
            expected: {
                listingPriceShown: false,
                negotiatedPriceShown: false,
                listingPriceStikedThroughShown: false,
                priceUnavailableShown: true,
            },
        },
    ].forEach((param) => {
        it(`${param.listingPrice ? 'shows' : 'does not show'} listing price and ${
            param.negotiatedPrice ? 'shows' : 'does not show'
        } negotiated price 
            when: 
                listingPrice: ${param.listingPrice ? param.listingPrice : 'empty'} and showListingPrice: ${
            param.showListingPrice
        }
                negotiatedPrice: ${param.negotiatedPrice ? param.negotiatedPrice : 'empty'} and showNegotiatedPrice: ${
            param.showNegotiatedPrice
        }`, () => {
            element.displayData = {
                listingPrice: param.listingPrice,
                negotiatedPrice: param.negotiatedPrice,
                currencyIsoCode: '',
                isLoading: false,
            };
            element.configuration = {
                showListingPrice: param.showListingPrice,
                showNegotiatedPrice: param.showNegotiatedPrice,
            };

            return Promise.resolve().then(() => {
                expect(element.querySelector("[data-loading='true']")).toBeNull();
                expect(!!element.querySelector('.listing-price')).toBe(param.expected.listingPriceShown);
                expect(!!element.querySelector('.negotiated-price')).toBe(param.expected.negotiatedPriceShown);
                expect(!!element.querySelector('.price-line-through')).toBe(
                    param.expected.listingPriceStikedThroughShown
                );
                expect(!!element.querySelector('.price-unavailable')).toBe(param.expected.priceUnavailableShown);
            });
        });
    });

    it('shows the correct currency for the specified currency code', () => {
        const expectedCurrencyCode = 'USD';
        element.displayData = {
            negotiatedPrice: '50',
            currencyIsoCode: 'USD',
            listingPrice: '',
            isLoading: false,
        };
        element.configuration = {
            showNegotiatedPrice: true,
            showListingPrice: false,
        };

        return Promise.resolve().then(() => {
            const negotiatedPrice = <HTMLElement & ProductPrice>element.querySelector('.negotiated-price');
            expect(negotiatedPrice.currencyCode).toBe(expectedCurrencyCode);
        });
    });
});

describe('commerce_search/productPrice: generateClassForSize', () => {
    [
        undefined,
        '',
        'Small', // Case-sensitive matches - we're strict.
        'SMALL',
        "you'll never catch me!",
    ].forEach((unrecognizedSize) => {
        it(`returns undefined when provided an unrecognized size of ${JSON.stringify(unrecognizedSize)}`, () => {
            const cssClass = generateClassForSize(unrecognizedSize);
            expect(cssClass).toBeUndefined();
        });
    });

    [
        {
            size: 'small',
            cssClass: 'slds-text-heading_small',
        },
        {
            size: 'medium',
            cssClass: 'slds-text-heading_medium',
        },
        {
            size: 'large',
            cssClass: 'slds-text-heading_large',
        },
    ].forEach((supportedSize) => {
        it(`returns the SLDS CSS class "${supportedSize.cssClass}" when given a size of "${supportedSize.size}"`, () => {
            const cssClass = generateClassForSize(supportedSize.size);

            expect(cssClass).toBe(supportedSize.cssClass);
        });
    });
});
