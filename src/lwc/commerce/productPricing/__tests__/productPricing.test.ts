import { createElement } from 'lwc';
import { querySelector } from 'kagekiri';

import ProductPricing from '../productPricing';

jest.mock(
    '@salesforce/label/B2B_Buyer_Product_Details',
    () => {
        return { default: 'add to cart' };
    },
    { virtual: true }
);

describe('commerce/productPrice: Pricing Information', () => {
    let element: HTMLElement & ProductPricing;

    beforeEach(() => {
        element = createElement('commerce-product-pricing', {
            is: ProductPricing,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    const testCases: [boolean, boolean, string, number | undefined, string][] = [];
    [true, false].forEach((showTaxIndication) => {
        [true, false].forEach((showNegotiatedPrice) => {
            ['650', ''].forEach((negotiatedPrice) => {
                [0, 0.2, undefined].forEach((taxRate) => {
                    ['Gross', 'Net'].forEach((taxLocaleType) => {
                        const validCase =
                            showTaxIndication &&
                            showNegotiatedPrice &&
                            Boolean(negotiatedPrice) &&
                            (taxRate || taxRate === undefined) &&
                            taxLocaleType === 'Gross';
                        if (!validCase) {
                            testCases.push([
                                showTaxIndication,
                                showNegotiatedPrice,
                                negotiatedPrice,
                                taxRate,
                                taxLocaleType,
                            ]);
                        }
                    });
                });
            });
        });
    });

    describe('Tax Information is hidden', () => {
        test.each(testCases)(
            'when the showTaxIndication is %i,, showNegotiated price is %i,, negotiatedPrice is %i,, taxRate is %i, and taxLocaleType is %i,',
            (showTaxIndication, showNegotiatedPrice, negotiatedPrice, taxRate, taxLocaleType) => {
                element.showTaxIndication = showTaxIndication;
                element.showNegotiatedPrice = showNegotiatedPrice;
                element.negotiatedPrice = negotiatedPrice;
                element.taxRate = taxRate;
                element.taxLocaleType = taxLocaleType;
                return Promise.resolve().then(() => {
                    const taxInfoElement = querySelector('.tax-info-label');
                    expect(taxInfoElement).toBeFalsy();
                });
            }
        );
    });

    describe('Tax Information is shown when taxRate is not 0', () => {
        const showTaxIndication = true;
        const showNegotiatedPrice = true;
        const negotiatedPrice = '650';
        const taxRate = 0.2;
        const taxLocaleType = 'Gross';
        const taxIncludedLabel = 'Tax Included';
        it(`when the showTaxIndication is ${showTaxIndication}, showNegotiated price is ${showNegotiatedPrice}, negotiatedPrice is ${negotiatedPrice}, taxRate is ${taxRate} and taxLocaleType is ${taxLocaleType}`, () => {
            element.showTaxIndication = showTaxIndication;
            element.showNegotiatedPrice = showNegotiatedPrice;
            element.negotiatedPrice = negotiatedPrice;
            element.taxRate = taxRate;
            element.taxLocaleType = taxLocaleType;
            element.taxIncludedLabel = taxIncludedLabel;
            return Promise.resolve().then(() => {
                const taxInfoElement = querySelector('.tax-info-label');
                expect(taxInfoElement).toBeTruthy();
                expect(taxInfoElement?.textContent).toBe(taxIncludedLabel);
            });
        });
    });

    describe('Tax Information is shown when taxRate is undefined and taxLocaleType is Gross', () => {
        const showTaxIndication = true;
        const showNegotiatedPrice = true;
        const negotiatedPrice = '650';
        const taxRate = undefined;
        const taxLocaleType = 'Gross';
        const taxIncludedLabel = 'Tax Included';
        it(`when the showTaxIndication is ${showTaxIndication}, showNegotiated price is ${showNegotiatedPrice}, negotiatedPrice is ${negotiatedPrice}, taxRate is ${taxRate} and taxLocaleType is ${taxLocaleType}`, () => {
            element.showTaxIndication = showTaxIndication;
            element.showNegotiatedPrice = showNegotiatedPrice;
            element.negotiatedPrice = negotiatedPrice;
            element.taxRate = taxRate;
            element.taxLocaleType = taxLocaleType;
            element.taxIncludedLabel = taxIncludedLabel;
            return Promise.resolve().then(() => {
                const taxInfoElement = querySelector('.tax-info-label');
                expect(taxInfoElement).toBeTruthy();
                expect(taxInfoElement?.textContent).toBe(taxIncludedLabel);
            });
        });

        it('is accessible', async () => {
            element.showTaxIndication = showTaxIndication;
            element.showNegotiatedPrice = showNegotiatedPrice;
            element.negotiatedPrice = negotiatedPrice;
            element.taxRate = taxRate;
            element.taxLocaleType = taxLocaleType;
            element.taxIncludedLabel = taxIncludedLabel;

            await Promise.resolve();
            await expect(element).toBeAccessible();
        });
    });

    describe('When Negotiated Price & Original Price is enabled', () => {
        beforeEach(() => {
            element.showNegotiatedPrice = true;
            element.showOriginalPrice = true;
        });

        describe('the negotiated price', () => {
            it('is displayed when the negotiated price and the Original price are both provided and Original price is LESS than negotiated', () => {
                element.negotiatedPrice = '650';
                element.originalPrice = '500';

                return Promise.resolve().then(() => {
                    const negotiatedPriceElement = querySelector('.negotiated-price', element);
                    expect(negotiatedPriceElement).toBeTruthy();
                });
            });

            it('is displayed when the negotiated price and the Original price are both provided and Original price is MORE than negotiated', () => {
                element.negotiatedPrice = '500';
                element.originalPrice = '650';

                return Promise.resolve().then(() => {
                    const negotiatedPriceElement = querySelector('.negotiated-price', element);
                    expect(negotiatedPriceElement).toBeTruthy();
                });
            });

            it('is displayed when the negotiated price and the Original price are both provided and ARE the same', () => {
                element.negotiatedPrice = '500';
                element.originalPrice = '500';

                return Promise.resolve().then(() => {
                    const negotiatedPriceElement = querySelector('.negotiated-price', element);
                    expect(negotiatedPriceElement).toBeTruthy();
                });
            });

            [undefined, null].forEach((emptyOriginalPrice) => {
                it(`is displayed when the negotiated price is provided and the Original price is NOT provided (${JSON.stringify(
                    emptyOriginalPrice
                )})`, () => {
                    element.negotiatedPrice = '500';
                    element.originalPrice = <undefined>emptyOriginalPrice;

                    return Promise.resolve().then(() => {
                        const negotiatedPriceElement = querySelector('.negotiated-price', element);
                        expect(negotiatedPriceElement).toBeTruthy();
                    });
                });
            });

            [undefined, null].forEach((emptyNegotiatedPrice) => {
                it(`is NOT displayed when the Original price is provided and the negotiated price is NOT provided (${JSON.stringify(
                    emptyNegotiatedPrice
                )})`, () => {
                    element.negotiatedPrice = <undefined>emptyNegotiatedPrice;
                    element.originalPrice = '500';

                    return Promise.resolve().then(() => {
                        const negotiatedPriceElement = querySelector('.negotiated-price', element);
                        expect(negotiatedPriceElement).toBeFalsy();
                    });
                });
            });

            [undefined, null].forEach((emptyOriginalPrice) => {
                [undefined, null].forEach((emptyNegotiatedPrice) => {
                    it(`is NOT displayed when neither the negotiated price (${JSON.stringify(
                        emptyNegotiatedPrice
                    )}) nor the Original price (${JSON.stringify(emptyOriginalPrice)}) is provided`, () => {
                        element.negotiatedPrice = <undefined>emptyNegotiatedPrice;
                        element.originalPrice = <undefined>emptyOriginalPrice;

                        return Promise.resolve().then(() => {
                            const negotiatedPriceElement = querySelector('.negotiated-price', element);
                            expect(negotiatedPriceElement).toBeFalsy();
                        });
                    });
                });
            });
        });

        describe('the Price Unavailable text', () => {
            it('is NOT displayed when the negotiated price and the Original price are both provided', () => {
                element.negotiatedPrice = '650';
                element.originalPrice = '500';

                return Promise.resolve().then(() => {
                    const priceUnavailableElement = querySelector('.price-unavailable', element);
                    expect(priceUnavailableElement).toBeFalsy();
                });
            });

            [undefined, null].forEach((emptyOriginalPrice) => {
                it(`is NOT displayed when the negotiated price is provided and the Original price is NOT provided (${JSON.stringify(
                    emptyOriginalPrice
                )})`, () => {
                    element.negotiatedPrice = '500';
                    element.originalPrice = <undefined>emptyOriginalPrice;

                    return Promise.resolve().then(() => {
                        const priceUnavailableElement = querySelector('.price-unavailable', element);
                        expect(priceUnavailableElement).toBeFalsy();
                    });
                });
            });

            [undefined, null].forEach((emptyNegotiatedPrice) => {
                it(`is displayed when the Original price is provided and the negotiated price is NOT provided (${JSON.stringify(
                    emptyNegotiatedPrice
                )})`, () => {
                    element.negotiatedPrice = <undefined>emptyNegotiatedPrice;
                    element.originalPrice = '500';

                    return Promise.resolve().then(() => {
                        const priceUnavailableElement = querySelector('.price-unavailable', element);
                        expect(priceUnavailableElement).toBeTruthy();
                    });
                });
            });

            [undefined, null].forEach((emptyOriginalPrice) => {
                [undefined, null].forEach((emptyNegotiatedPrice) => {
                    it(`is displayed when neither the negotiated price (${JSON.stringify(
                        emptyNegotiatedPrice
                    )}) nor the Original price (${JSON.stringify(emptyOriginalPrice)}) is provided`, () => {
                        element.negotiatedPrice = <undefined>emptyNegotiatedPrice;
                        element.originalPrice = <undefined>emptyOriginalPrice;

                        return Promise.resolve().then(() => {
                            const priceUnavailableElement = querySelector('.price-unavailable', element);
                            expect(priceUnavailableElement).toBeTruthy();
                        });
                    });
                });
            });
        });

        describe('the strikethrough assistive text', () => {
            it('is accessible', async () => {
                element.negotiatedPrice = '500';
                element.originalPrice = '650';

                await Promise.resolve();
                await expect(element).toBeAccessible();
            });

            it('is displayed when Original price and negotiated price both appear', () => {
                element.negotiatedPrice = '500';
                element.originalPrice = '650';

                return Promise.resolve().then(() => {
                    const assistiveTextElement = querySelector('.slds-assistive-text', element);
                    expect(assistiveTextElement).toBeTruthy();
                });
            });

            it('is NOT displayed when only Original price appears', () => {
                element.negotiatedPrice = '';
                element.originalPrice = '500';

                return Promise.resolve().then(() => {
                    const assistiveTextElement = querySelector('.slds-assistive-text', element);
                    expect(assistiveTextElement).toBeFalsy();
                });
            });

            it('is NOT displayed when only negotiated price appears', () => {
                element.negotiatedPrice = '650';
                element.originalPrice = '';

                return Promise.resolve().then(() => {
                    const assistiveTextElement = querySelector('.slds-assistive-text', element);
                    expect(assistiveTextElement).toBeFalsy();
                });
            });

            it('is NOT displayed when both prices are unavailable', () => {
                element.negotiatedPrice = '';
                element.originalPrice = '';

                return Promise.resolve().then(() => {
                    const assistiveTextElement = querySelector('.slds-assistive-text', element);
                    expect(assistiveTextElement).toBeFalsy();
                });
            });
        });
    });

    describe('When Negotiated Price is disabled & Original Price is enabled', () => {
        beforeEach(() => {
            element.showNegotiatedPrice = false;
            element.showOriginalPrice = true;
        });

        describe('the negotiated price', () => {
            it('is NOT displayed when Original price and negotiated price are provided', () => {
                element.negotiatedPrice = '650';
                element.originalPrice = '500';

                return Promise.resolve().then(() => {
                    const negotiatedPriceElement = querySelector('.negotiated-price', element);
                    expect(negotiatedPriceElement).toBeFalsy();
                });
            });

            [undefined, null].forEach((emptyOriginalPrice) => {
                it(`is NOT displayed when Original price is NOT provided (${JSON.stringify(
                    emptyOriginalPrice
                )})`, () => {
                    element.negotiatedPrice = '500';
                    element.originalPrice = <undefined>emptyOriginalPrice;

                    return Promise.resolve().then(() => {
                        const negotiatedPriceElement = querySelector('.negotiated-price', element);
                        expect(negotiatedPriceElement).toBeFalsy();
                    });
                });
            });
        });

        describe('the Price Unavailable text', () => {
            it('is displayed when the negotiated price and the Original price are both provided', () => {
                element.negotiatedPrice = '650';
                element.originalPrice = '500';

                return Promise.resolve().then(() => {
                    const priceUnavailableElement = querySelector('.price-unavailable', element);
                    expect(priceUnavailableElement).toBeTruthy();
                });
            });

            [undefined, null].forEach((emptyOriginalPrice) => {
                it(`is displayed when the negotiated price is provided and the Original price is NOT provided (${JSON.stringify(
                    emptyOriginalPrice
                )})`, () => {
                    element.negotiatedPrice = '500';
                    element.originalPrice = <undefined>emptyOriginalPrice;

                    return Promise.resolve().then(() => {
                        const priceUnavailableElement = querySelector('.price-unavailable', element);
                        expect(priceUnavailableElement).toBeTruthy();
                    });
                });
            });

            [undefined, null].forEach((emptyNegotiatedPrice) => {
                it(`is displayed when the Original price is provided and the negotiated price is NOT provided (${JSON.stringify(
                    emptyNegotiatedPrice
                )})`, () => {
                    element.negotiatedPrice = <undefined>emptyNegotiatedPrice;
                    element.originalPrice = '500';

                    return Promise.resolve().then(() => {
                        const priceUnavailableElement = querySelector('.price-unavailable', element);
                        expect(priceUnavailableElement).toBeTruthy();
                    });
                });
            });

            [undefined, null].forEach((emptyOriginalPrice) => {
                [undefined, null].forEach((emptyNegotiatedPrice) => {
                    it(`is displayed when neither the negotiated price (${JSON.stringify(
                        emptyNegotiatedPrice
                    )}) nor the Original price (${JSON.stringify(emptyOriginalPrice)}) is provided`, () => {
                        element.negotiatedPrice = <undefined>emptyNegotiatedPrice;
                        element.originalPrice = <undefined>emptyOriginalPrice;

                        return Promise.resolve().then(() => {
                            const priceUnavailableElement = querySelector('.price-unavailable', element);
                            expect(priceUnavailableElement).toBeTruthy();
                        });
                    });
                });
            });
        });

        describe('the strikethrough assistive text', () => {
            it('is NOT displayed when Original price and negotiated price are both supplied', () => {
                element.negotiatedPrice = '650';
                element.originalPrice = '500';

                return Promise.resolve().then(() => {
                    const assistiveTextElement = querySelector('.slds-assistive-text', element);
                    expect(assistiveTextElement).toBeFalsy();
                });
            });

            it('is NOT displayed when only Original price appears', () => {
                element.negotiatedPrice = '';
                element.originalPrice = '500';

                return Promise.resolve().then(() => {
                    const assistiveTextElement = querySelector('.slds-assistive-text', element);
                    expect(assistiveTextElement).toBeFalsy();
                });
            });

            it('is NOT displayed when only negotiated price is available', () => {
                element.negotiatedPrice = '650';
                element.originalPrice = '';

                return Promise.resolve().then(() => {
                    const assistiveTextElement = querySelector('.slds-assistive-text', element);
                    expect(assistiveTextElement).toBeFalsy();
                });
            });

            it('is NOT displayed when both prices are unavailable', () => {
                element.negotiatedPrice = '';
                element.originalPrice = '';

                return Promise.resolve().then(() => {
                    const assistiveTextElement = querySelector('.slds-assistive-text', element);
                    expect(assistiveTextElement).toBeFalsy();
                });
            });
        });
    });

    describe('When Negotiated Price is disabled & Original Price is disabled', () => {
        beforeEach(() => {
            element.showNegotiatedPrice = false;
            element.showOriginalPrice = false;
        });

        describe('the negotiated price', () => {
            it('is NOT displayed when Original price and negotiated price are provided', () => {
                element.negotiatedPrice = '650';
                element.originalPrice = '500';

                return Promise.resolve().then(() => {
                    const negotiatedPriceElement = querySelector('.negotiated-price', element);
                    expect(negotiatedPriceElement).toBeFalsy();
                });
            });
        });
    });

    describe('When Negotiated Price is enabled & Original Price is disabled', () => {
        beforeEach(() => {
            element.showNegotiatedPrice = true;
            element.showOriginalPrice = false;
        });

        describe('the negotiated price', () => {
            it('is accessible', async () => {
                element.negotiatedPrice = '650';
                element.originalPrice = '500';

                await Promise.resolve();
                await expect(element).toBeAccessible();
            });

            it('is displayed when the negotiated price and the Original price are both provided and are NOT the same', () => {
                element.negotiatedPrice = '650';
                element.originalPrice = '500';

                return Promise.resolve().then(() => {
                    const negotiatedPriceElement = querySelector('.negotiated-price', element);
                    expect(negotiatedPriceElement).toBeTruthy();
                });
            });

            it('is displayed when the negotiated price and the Original price are both provided and ARE the same', () => {
                element.negotiatedPrice = '500';
                element.originalPrice = '500';

                return Promise.resolve().then(() => {
                    const negotiatedPriceElement = querySelector('.negotiated-price', element);
                    expect(negotiatedPriceElement).toBeTruthy();
                });
            });

            [undefined, null].forEach((emptyOriginalPrice) => {
                it(`is displayed when the negotiated price is provided and the Original price is NOT provided (${JSON.stringify(
                    emptyOriginalPrice
                )})`, () => {
                    element.negotiatedPrice = '500';
                    element.originalPrice = <undefined>emptyOriginalPrice;

                    return Promise.resolve().then(() => {
                        const negotiatedPriceElement = querySelector('.negotiated-price', element);
                        expect(negotiatedPriceElement).toBeTruthy();
                    });
                });
            });

            [undefined, null].forEach((emptyNegotiatedPrice) => {
                it(`is NOT displayed when the Original price is provided and the negotiated price is NOT provided (${JSON.stringify(
                    emptyNegotiatedPrice
                )})`, () => {
                    element.negotiatedPrice = <undefined>emptyNegotiatedPrice;
                    element.originalPrice = '500';

                    return Promise.resolve().then(() => {
                        const negotiatedPriceElement = querySelector('.negotiated-price', element);
                        expect(negotiatedPriceElement).toBeFalsy();
                    });
                });
            });

            [undefined, null].forEach((emptyOriginalPrice) => {
                [undefined, null].forEach((emptyNegotiatedPrice) => {
                    it(`is NOT displayed when neither the negotiated price (${JSON.stringify(
                        emptyNegotiatedPrice
                    )}) nor the Original price (${JSON.stringify(emptyOriginalPrice)}) is provided`, () => {
                        element.negotiatedPrice = <undefined>emptyNegotiatedPrice;
                        element.originalPrice = <undefined>emptyOriginalPrice;

                        return Promise.resolve().then(() => {
                            const negotiatedPriceElement = querySelector('.negotiated-price', element);
                            expect(negotiatedPriceElement).toBeFalsy();
                        });
                    });
                });
            });
        });
    });
});
