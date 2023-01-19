import constructCardPaymentIframe, { getInheritedStyleUrls, buildWebruntimeStyleTag } from '../cardPaymentIframe';
import { JSDOM } from 'jsdom';
import Labels from '../labels';

jest.mock('@salesforce/community/basePath', () => '', { virtual: true });
jest.mock('../iframeSrc', () => ({
    iframeSrc: jest.fn(() => {
        return '../../../../../../b2c-storefront/src/public/assets/cardpayment/index.html';
    }),
}));

jest.mock(
    '@salesforce/label/B2C_Lite_Payments.expiryDateLabel',
    () => {
        return {
            default: 'Expiration Date',
        };
    },
    { virtual: true }
);

const TEST_VISA = '4111 1111 1111 1111';
const TEST_VISA_NOSPACES = '4111111111111111';
const TEST_AMEX = '3714 496353 98431';
const TEST_AMEX_NOSPACES = '371449635398431';
const TEST_DISCOVER = '6011 1111 1111 1117';
const TEST_DISCOVER_NOSPACES = '6011111111111117';
const TEST_MASTERCARD = '5555 5555 5555 4444';
const TEST_MASTERCARD_NOSPACES = '5555555555554444';
const TEST_INVALID_CARD = '4111 1111 1111 1119';
const TEST_JCB_CARD = '3566002020360505';
const TEST_DINERS_CLUB_CARD = '3056930009020004';

describe('cardPaymentIframe', () => {
    let iframe;
    let dom;
    describe('constructPaymentIframe', () => {
        let originalDomApis;

        beforeEach(() => {
            return JSDOM.fromFile(`${__dirname}/payment.html`, {
                resources: 'usable',
                runScripts: 'dangerously',
            }).then((testDom) => {
                dom = testDom;

                return new Promise((resolve) => {
                    (() => {
                        const module = {
                            // In the source code we create the iframe element using this function
                            // like so documentCreateElement(document, 'iframe'). The catch is the test
                            // is running in context of dom.window and not window (window !== dom.window // true)
                            // Therefore we get an illegal invocation error.  We beat around that bush by injecting
                            // the context to createElement to be dom.window.document. Voila!
                            documentCreateElement: function (...args) {
                                if (this === window.document) {
                                    return dom.window.document.createElement.apply(dom.window.document, args);
                                }

                                return dom.window.document.createElement(this, args);
                            },
                            elementSetAttribute: dom.window.Element.prototype.setAttribute,
                        };

                        originalDomApis = module;
                    })();

                    iframe = constructCardPaymentIframe(originalDomApis, {});
                    iframe.addEventListener('load', () => {
                        resolve();
                    });
                    dom.window.document.body.appendChild(iframe);
                });
            });
        });

        afterEach(() => {
            dom.window.document.body.removeChild(iframe);
        });

        it('should render an iframe', () => {
            const paymentFrame = dom.window.document.body.querySelector('iframe');
            expect(paymentFrame).toBeDefined();
        });

        describe('card number', () => {
            let cardInput;
            let cardInputFormElement;
            let cartInputForm;

            beforeEach(() => {
                cardInputFormElement = iframe.contentDocument.body.querySelector('[data-card-number-container]');
                cartInputForm = cardInputFormElement.closest('form');
                cardInput = cardInputFormElement.querySelector('input[data-card-number]');
            });

            it('should have proper autocomplete attribute', () => {
                expect(cartInputForm.getAttribute('autocomplete')).toBe('off');
                expect(cardInput.getAttribute('autocomplete')).toBe('cc-number');
            });

            it('should only allow numbers and spaces when a value is inputted', () => {
                cardInput.value = 'a';
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                expect(cardInput.value).toBe('');
            });

            it('should format a credit card number as "XXXX XXXX XXXX XXXX" when given a Visa card number', () => {
                cardInput.value = TEST_VISA_NOSPACES;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                expect(cardInput.value).toBe(TEST_VISA);
                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#visa'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('visa');
            });

            it('should format a credit card number as "XXXX XXXX XXXX XXXX" when given a Discover card number', () => {
                cardInput.value = TEST_DISCOVER_NOSPACES;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                expect(cardInput.value).toBe(TEST_DISCOVER);
                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#discover'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('discover');
            });

            it('should format a credit card number as "XXXX XXXX XXXX XXXX" when given a Mastercard card number', () => {
                cardInput.value = TEST_MASTERCARD_NOSPACES;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                expect(cardInput.value).toBe(TEST_MASTERCARD);
                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#mastercard'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('mastercard');
            });

            it('should format a credit card number as "XXXX XXXXXX XXXXX" when given an American Express card number', () => {
                cardInput.value = TEST_AMEX_NOSPACES;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                expect(cardInput.value).toBe(TEST_AMEX);
                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#amex'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('amex');
            });

            it('should display a credit card number required error message when given an empty card via a change event', () => {
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));
                const cardInputHelp = cardInputFormElement.querySelector('.slds-form-element__help');
                expect(cardInputHelp).not.toBeNull();
                expect(cardInputHelp.textContent).toBe(Labels.CreditCardNumberMissing);
                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#blank'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('');
            });

            it('should display a credit card number required error message when given an empty card via a blur event', () => {
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('blur'));
                const cardInputHelp = cardInputFormElement.querySelector('.slds-form-element__help');
                expect(cardInputHelp).not.toBeNull();
                expect(cardInputHelp.textContent).toBe(Labels.CreditCardNumberMissing);
                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#blank'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('');
            });

            it('should display an invalid credit card number error message when given an invalid card number', () => {
                cardInput.value = TEST_INVALID_CARD;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));
                const cardInputHelp = cardInputFormElement.querySelector('.slds-form-element__help');
                expect(cardInputHelp).not.toBeNull();
                expect(cardInputHelp.textContent).toBe(Labels.InvalidCreditCardNumber);
            });

            it('should display an invalid credit card number error message when given an JCB card number', () => {
                cardInput.value = TEST_JCB_CARD;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));
                const cardInputHelp = cardInputFormElement.querySelector('.slds-form-element__help');
                expect(cardInputHelp).not.toBeNull();
                expect(cardInputHelp.textContent).toBe(Labels.InvalidCreditCardNumber);
            });

            it('should display an invalid credit card number error message when given an Diners club card number', () => {
                cardInput.value = TEST_DINERS_CLUB_CARD;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));
                const cardInputHelp = cardInputFormElement.querySelector('.slds-form-element__help');
                expect(cardInputHelp).not.toBeNull();
                expect(cardInputHelp.textContent).toBe(Labels.InvalidCreditCardNumber);
            });

            it('should display an invalid credit card number error message when give card number is too short', () => {
                cardInput.value = '4242';

                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const cardInputHelp = cardInputFormElement.querySelector('.slds-form-element__help');
                expect(cardInputHelp).not.toBeNull();
                expect(cardInputHelp.textContent).toBe(Labels.InvalidCreditCardNumber);
            });

            it('should remove error message after providing a valid card number', () => {
                // Test invalid card number
                cardInput.value = TEST_INVALID_CARD;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));
                let cardInputHelp = cardInputFormElement.querySelector('.slds-form-element__help');
                expect(cardInputHelp).not.toBeNull();
                expect(cardInputHelp.textContent).toBe(Labels.InvalidCreditCardNumber);
                let formElementContainer = cardInput.closest('.slds-form-element');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                // Now enter a valid card number
                cardInput.value = TEST_VISA_NOSPACES;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));
                cardInputHelp = cardInputFormElement.querySelector('.slds-form-element__help');
                expect(cardInputHelp).toBeNull();
                formElementContainer = cardInput.closest('.slds-form-element');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(false);
            });

            it('should leave selector at the end of digits after entering 37 that indicates an amex card', () => {
                // enter two characters that indicate that this is an AMEX card.
                // This use to fail by putting the cursor at the beginning instead of leaving it at the end.
                const amexCardStart = '37';
                const cardLength = amexCardStart.length;
                cardInput.value = amexCardStart;

                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#amex'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('amex');
                expect(cardInput.value).toBe(amexCardStart);
                // puts the cursor at the end of the entered digits
                expect(cardInput.selectionStart).toBe(cardLength);
            });

            it("should place selector at the next group of digits if user hits the delete key between two groups of numbers ie 'XXXX| XXXX' to 'XXXX |XXXX' for VISA card", () => {
                const cardStart = '42424242';
                cardInput.value = cardStart;

                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));

                expect(cardInput.value).toBe('4242 4242');

                cardInput.setSelectionRange(4, 4);
                const deleteInputEvent = new iframe.contentWindow.InputEvent('input');
                Object.defineProperty(deleteInputEvent, 'inputType', {
                    value: 'deleteContentForward',
                });
                cardInput.dispatchEvent(deleteInputEvent);

                expect(cardInput.value).toBe('4242 4242');
                expect(cardInput.selectionStart).toBe(5);
                expect(cardInput.selectionEnd).toBe(5);

                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#visa'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('visa');
            });

            it("should place selector at the next group of digits if user hits the delete key between two groups of numbers ie 'XXXX| XXXXXX XXXXX' to 'XXXX |XXXXXX XXXXX' for AMEX card", () => {
                cardInput.value = TEST_AMEX_NOSPACES;

                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));

                expect(cardInput.value).toEqual(TEST_AMEX);

                cardInput.setSelectionRange(4, 4);
                const deleteInputEvent = new iframe.contentWindow.InputEvent('input');
                Object.defineProperty(deleteInputEvent, 'inputType', {
                    value: 'deleteContentForward',
                });
                cardInput.dispatchEvent(deleteInputEvent);

                expect(cardInput.value).toEqual(TEST_AMEX);
                expect(cardInput.selectionStart).toBe(5);
                expect(cardInput.selectionEnd).toBe(5);

                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#amex'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('amex');
            });

            it("should place selector at the next group of digits if user hits the delete key between two groups of numbers ie 'XXXX XXXXXX| XXXXX' to 'XXXX XXXXXX |XXXXX' for AMEX card", () => {
                cardInput.value = TEST_AMEX_NOSPACES;

                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));

                expect(cardInput.value).toEqual(TEST_AMEX);

                cardInput.setSelectionRange(11, 11);
                const deleteInputEvent = new iframe.contentWindow.InputEvent('input');
                Object.defineProperty(deleteInputEvent, 'inputType', {
                    value: 'deleteContentForward',
                });
                cardInput.dispatchEvent(deleteInputEvent);

                expect(cardInput.value).toEqual(TEST_AMEX);
                expect(cardInput.selectionStart).toBe(12);
                expect(cardInput.selectionEnd).toBe(12);

                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#amex'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('amex');
            });

            it('should not move the selector if user deletes the a formatted space with the backspace key', () => {
                // Remove second space and set selection point where space was
                cardInput.value = TEST_AMEX.slice(0, 11) + TEST_AMEX.slice(12, TEST_AMEX.length);
                cardInput.setSelectionRange(11, 11);

                const deleteInputEvent = new iframe.contentWindow.InputEvent('input');
                Object.defineProperty(deleteInputEvent, 'inputType', {
                    value: 'deleteContentBackward',
                });
                cardInput.dispatchEvent(deleteInputEvent);

                expect(cardInput.value).toEqual(TEST_AMEX);
                expect(cardInput.selectionStart).toBe(11);
                expect(cardInput.selectionEnd).toBe(11);

                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#amex'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('amex');
            });

            it('should not move the cursor to the end if editing the middle of a card number', () => {
                // Add full visa card number
                cardInput.value = TEST_VISA_NOSPACES;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                expect(cardInput.value).toBe(TEST_VISA);
                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#visa'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('visa');

                // Delete the 8th digit.  This will include the formatting spaces so its actually the 9th character
                cardInput.value =
                    cardInput.value.toString().slice(0, 8) + cardInput.value.substring(9, cardInput.value.length);
                cardInput.setSelectionRange(8, 8);
                let inputEvent = new iframe.contentWindow.InputEvent('input');
                Object.defineProperty(inputEvent, 'inputType', {
                    value: 'deleteContentBackward',
                });
                cardInput.dispatchEvent(inputEvent);

                // Assert the cursor is in the correct spot
                expect(cardInput.value).toBe('4111 1111 1111 111');
                expect(cardInput.selectionStart).toBe(8);
            });

            it('should place selector marker at correct location after hitting back space, 1 character at a time till halfway, but then adding extra digits when given Visa Credit Card', () => {
                cardInput.value = TEST_VISA_NOSPACES;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                expect(cardInput.value).toBe(TEST_VISA);
                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#visa'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('visa');

                let count = cardInput.value.length;
                let length = cardInput.value.length;
                // remove till half way
                for (let i = length - 1; i > length / 2; i--) {
                    cardInput.value = cardInput.value.toString().slice(0, i);
                    let inputEvent = new iframe.contentWindow.InputEvent('input');
                    Object.defineProperty(inputEvent, 'inputType', {
                        value: 'deleteContentBackward',
                    });

                    cardInput.dispatchEvent(inputEvent);
                    // if we are on the edge then we skip over the white space
                    if ((count - 1) % 5 === 0) {
                        count -= 2;
                        i--;
                    } else {
                        count -= 1;
                    }
                    expect(cardInput.value).toBe(TEST_VISA.slice(0, count));
                    expect(cardInput.selectionStart).toBe(i);

                    expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                        '/assets/images/Cards.svg#visa'
                    );
                    expect(cardInput.previousElementSibling.getAttribute('title')).toBe('visa');
                }

                count = cardInput.value.length;
                // add starting from half way
                for (let i = count; i < 16; i++) {
                    cardInput.value += TEST_VISA_NOSPACES[i];
                    let inputEvent = new iframe.contentWindow.InputEvent('input');
                    Object.defineProperty(inputEvent, 'inputType', {
                        value: 'insertText',
                    });

                    cardInput.dispatchEvent(inputEvent);
                    // if we are on the edge then we add the white space
                    if ((count + 1) % 5 === 0) {
                        count += 2;
                    } else {
                        count += 1;
                    }
                    expect(cardInput.value).toBe(TEST_VISA.slice(0, count));
                    expect(cardInput.selectionStart).toBe(count);

                    expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                        '/assets/images/Cards.svg#visa'
                    );
                    expect(cardInput.previousElementSibling.getAttribute('title')).toBe('visa');
                }
            });

            it('should place selector marker at correct location after filled out halfway, and then inserting from the center of input when given Visa Credit Card, go half way and delete and reinsert them', () => {
                let count = 0;
                // add starting till half way
                cardInput.value = TEST_VISA_NOSPACES.substring(0, 8);
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                expect(cardInput.value).toBe(TEST_VISA.substring(0, TEST_VISA.length / 2));
                expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                    '/assets/images/Cards.svg#visa'
                );
                expect(cardInput.previousElementSibling.getAttribute('title')).toBe('visa');

                //go to the middle and add
                cardInput.selectionStart = 5;
                let newSelector = 5;

                //add more values
                for (let i = 8; i < 16; i++) {
                    cardInput.value = cardInput.value.slice(0, 4) + 1 + cardInput.value.slice(5);
                    cardInput.selectionStart = newSelector;
                    let inputEvent = new iframe.contentWindow.InputEvent('input');
                    Object.defineProperty(inputEvent, 'inputType', {
                        value: 'insertText',
                    });

                    cardInput.dispatchEvent(inputEvent);
                    // if we are on the edge then we add the white space
                    if (count % 5 === 0) {
                        count += 2;
                        newSelector += 1;
                    } else {
                        count += 1;
                    }
                    expect(cardInput.selectionStart).toBe(newSelector);

                    expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                        '/assets/images/Cards.svg#visa'
                    );
                    expect(cardInput.previousElementSibling.getAttribute('title')).toBe('visa');
                    newSelector++;
                }

                // delete 3 values from the middle
                cardInput.selectionStart = 7;
                newSelector = 7;
                count = TEST_VISA.length;
                for (let i = 7; i > 4; i--) {
                    cardInput.value = cardInput.value.slice(0, 7) + cardInput.value.slice(8);
                    cardInput.selectionStart = newSelector;
                    let inputEvent = new iframe.contentWindow.InputEvent('input');
                    Object.defineProperty(inputEvent, 'inputType', {
                        value: 'deleteContentBackward',
                    });

                    cardInput.dispatchEvent(inputEvent);
                    // if we are on the edge then we skip over the white space
                    if ((count - 1) % 5 === 0) {
                        count -= 2;
                        newSelector--;
                    } else {
                        count -= 1;
                    }
                    expect(cardInput.value).toBe(TEST_VISA.slice(0, count));
                    expect(cardInput.selectionStart).toBe(newSelector);

                    expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                        '/assets/images/Cards.svg#visa'
                    );
                    expect(cardInput.previousElementSibling.getAttribute('title')).toBe('visa');
                    newSelector--;
                }

                //add those values back
                cardInput.selectionStart = 4;
                newSelector = 4;
                for (let i = 4; i < 7; i++) {
                    cardInput.value = cardInput.value.slice(0, 4) + 1 + cardInput.value.slice(5);
                    cardInput.selectionStart = newSelector;
                    let inputEvent = new iframe.contentWindow.InputEvent('input');
                    Object.defineProperty(inputEvent, 'inputType', {
                        value: 'insertText',
                    });

                    cardInput.dispatchEvent(inputEvent);
                    // if we are on the edge then we add the white space
                    if (newSelector % 5 === 0) {
                        count += 1;
                        newSelector += 1;
                    } else {
                        count += 1;
                    }
                    expect(cardInput.value).toBe(TEST_VISA.slice(0, count));
                    expect(cardInput.selectionStart).toBe(newSelector);

                    expect(cardInput.previousElementSibling.firstElementChild.getAttribute('xlink:href')).toBe(
                        '/assets/images/Cards.svg#visa'
                    );
                    expect(cardInput.previousElementSibling.getAttribute('title')).toBe('visa');
                    newSelector++;
                }
            });
        });

        describe('The cardholder name input', () => {
            it('should set the cardholder name property when given a string value', () => {
                const cardholderInput = iframe.contentDocument.body.querySelector('input[data-cardholder-name]');
                expect(cardholderInput.getAttribute('autocomplete')).toBe('cc-name');
                cardholderInput.value = 'J. Doe';
                cardholderInput.dispatchEvent(new dom.window.InputEvent('change'));
                expect(cardholderInput.value).toBe('J. Doe');
            });

            it('should display error when left blank', () => {
                const cardholderInput = iframe.contentDocument.body.querySelector('input[data-cardholder-name]');
                cardholderInput.value = '';
                cardholderInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = cardholderInput.closest('.slds-form-element-cardholder-name');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);
                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(Labels.CardHolderNameMissing);
            });

            it('should display error when left blank twice', () => {
                const cardholderInput = iframe.contentDocument.body.querySelector('input[data-cardholder-name]');
                cardholderInput.value = '';
                cardholderInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));
                cardholderInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = cardholderInput.closest('.slds-form-element-cardholder-name');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);
                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(Labels.CardHolderNameMissing);
            });

            it('should remove error when name is added after initially being blank', () => {
                const cardholderInput = iframe.contentDocument.body.querySelector('input[data-cardholder-name]');
                cardholderInput.value = '';
                cardholderInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = cardholderInput.closest('.slds-form-element-cardholder-name');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);
                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(Labels.CardHolderNameMissing);
            });
        });

        describe('tokenizePaymentMethod', () => {
            let requestContext, cardInput, cardHolderInput, cvvInput, expiryDateInput;

            describe('201 created', () => {
                beforeEach(() => {
                    cardInput = iframe.contentDocument.body.querySelector('input[data-card-number]');
                    cardHolderInput = iframe.contentDocument.body.querySelector('input[data-cardholder-name]');
                    cvvInput = iframe.contentDocument.body.querySelector('#cvv');
                    expiryDateInput = iframe.contentDocument.body.querySelector('input[data-expiry-date]');

                    iframe.contentWindow.fetch = jest.fn(() => {
                        return Promise.resolve({
                            ok: true,
                            status: 201,
                            json: () =>
                                Promise.resolve({
                                    token: 'apaymenttoken',
                                    errors: [],
                                }),
                        });
                    });

                    requestContext = {
                        webstoreId: 'webstoreid',
                        apiVersion: 'v52.0',
                        csrfToken: 'csrftoken',
                    };
                });

                it('should send a valid POST request', async () => {
                    cardInput.value = TEST_VISA;
                    cardHolderInput.value = 'Test Shopper';
                    cvvInput.value = '111';
                    expiryDateInput.value = '02/24';

                    const tokenizeResponse = await iframe.tokenizePaymentMethod(requestContext, {
                        city: 'San Francisco',
                        country: 'US',
                        name: 'Test Shopper',
                        postalCode: '94105',
                        region: 'CA',
                        street: '415 Mission Street (Shipping)',
                    });

                    expect(tokenizeResponse).toEqual({
                        token: 'apaymenttoken',
                        errors: [],
                    });
                    expect(iframe.contentWindow.fetch).toHaveBeenCalledTimes(1);
                    expect(iframe.contentWindow.fetch).toHaveBeenCalledWith(
                        '/webruntime/api/services/data/v52.0/commerce/webstores/webstoreid/payments/token',
                        {
                            body: '{"cardPaymentMethod":{"cardHolderName":"Test Shopper","cardNumber":"4111111111111111","cvv":"111","expiryYear":"24","expiryMonth":"02","cardType":"Visa"}}',
                            credentials: 'same-origin',
                            headers: { 'CSRF-Token': 'csrftoken', 'Content-Type': 'application/json;  charset=utf-8' },
                            method: 'POST',
                        }
                    );
                });

                // Payments team doesn't have a card type for discover
                it('should not include cardType in the case of discover cards', async () => {
                    cardInput.value = TEST_DISCOVER;
                    cardHolderInput.value = 'Test Shopper';
                    cvvInput.value = '111';
                    expiryDateInput.value = '02/24';

                    const tokenizePaymentMethodResponse = await iframe.tokenizePaymentMethod(requestContext, {
                        city: 'San Francisco',
                        country: 'US',
                        name: 'Test Shopper',
                        postalCode: '94105',
                        region: 'CA',
                        street: '415 Mission Street (Shipping)',
                    });

                    expect(tokenizePaymentMethodResponse).toEqual({
                        token: 'apaymenttoken',
                        errors: [],
                    });
                    expect(iframe.contentWindow.fetch).toHaveBeenCalledTimes(1);
                    expect(iframe.contentWindow.fetch).toHaveBeenCalledWith(
                        '/webruntime/api/services/data/v52.0/commerce/webstores/webstoreid/payments/token',
                        {
                            body: '{"cardPaymentMethod":{"cardHolderName":"Test Shopper","cardNumber":"6011111111111117","cvv":"111","expiryYear":"24","expiryMonth":"02"}}',
                            credentials: 'same-origin',
                            headers: { 'CSRF-Token': 'csrftoken', 'Content-Type': 'application/json;  charset=utf-8' },
                            method: 'POST',
                        }
                    );
                });
            });

            describe('422 Unprocessable Entity', () => {
                beforeEach(() => {
                    cardInput = iframe.contentDocument.body.querySelector('input[data-card-number]');
                    cardHolderInput = iframe.contentDocument.body.querySelector('input[data-cardholder-name]');
                    cvvInput = iframe.contentDocument.body.querySelector('#cvv');
                    expiryDateInput = iframe.contentDocument.body.querySelector('input[data-expiry-date]');

                    iframe.contentWindow.fetch = jest.fn(() => {
                        return Promise.resolve({
                            ok: false,
                            status: 422,
                            json: () =>
                                Promise.resolve({
                                    errors: [
                                        {
                                            detail: 'We are unable to process your payment at this time.  Please try back later.',
                                            invalidParameters: [
                                                {
                                                    detail: 'Required Request Parameter &#39;CVV&#39; is missing',
                                                },
                                            ],
                                            type: '/commerce/errors/payment-failure',
                                        },
                                    ],
                                }),
                        });
                    });

                    requestContext = {
                        webstoreId: 'webstoreid',
                        apiVersion: 'v52.0',
                        csrfToken: 'csrftoken',
                    };
                });

                it('should send a valid POST request and return rejected promise', async () => {
                    cardInput.value = TEST_VISA;
                    cardHolderInput.value = 'Test Shopper';
                    cvvInput.value = '111';
                    expiryDateInput.value = '02/24';

                    await expect(
                        iframe.tokenizePaymentMethod(requestContext, {
                            city: 'San Francisco',
                            country: 'US',
                            name: 'Test Shopper',
                            postalCode: '94105',
                            region: 'CA',
                            street: '415 Mission Street (Shipping)',
                        })
                    ).rejects.toEqual({
                        errors: [
                            {
                                detail: 'We are unable to process your payment at this time.  Please try back later.',
                                invalidParameters: [
                                    {
                                        detail: 'Required Request Parameter &#39;CVV&#39; is missing',
                                    },
                                ],
                                type: '/commerce/errors/payment-failure',
                            },
                        ],
                    });

                    expect(iframe.contentWindow.fetch).toHaveBeenCalledTimes(1);
                    expect(iframe.contentWindow.fetch).toHaveBeenCalledWith(
                        '/webruntime/api/services/data/v52.0/commerce/webstores/webstoreid/payments/token',
                        {
                            body: '{"cardPaymentMethod":{"cardHolderName":"Test Shopper","cardNumber":"4111111111111111","cvv":"111","expiryYear":"24","expiryMonth":"02","cardType":"Visa"}}',
                            credentials: 'same-origin',
                            headers: { 'CSRF-Token': 'csrftoken', 'Content-Type': 'application/json;  charset=utf-8' },
                            method: 'POST',
                        }
                    );
                });
            });
        });

        describe('The cvv number', () => {
            let cardInput, cvvInput;
            let enterCvvMsg = Labels.CvvMissing;
            let enterValidCvvMsg = Labels.InvalidCvv;

            beforeEach(() => {
                const cardInputFormElement = iframe.contentDocument.body.querySelector('[data-card-number-container]');
                cardInput = cardInputFormElement.querySelector('input[data-card-number]');
                cvvInput = iframe.contentDocument.body.querySelector('input[data-cvv]');
            });

            it('should have proper autocomplete attribute', () => {
                expect(cvvInput.getAttribute('autocomplete')).toBe('off');
            });

            it('should not be empty when change event is fired', () => {
                cvvInput.value = '';
                cvvInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-cvv-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(enterCvvMsg);
            });

            it('should not be empty when blur event is fired', () => {
                cvvInput.value = '';
                cvvInput.dispatchEvent(new iframe.contentWindow.InputEvent('blur'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-cvv-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(enterCvvMsg);
            });

            //
            // VISA, DISCOVER, and MASTERCARD
            //
            it('should be valid for length of 3 for VISA, DISCOVER, or MASTERCARD', () => {
                cardInput.value = TEST_VISA;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));

                cvvInput.value = '123';
                cvvInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-cvv-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(false);
            });

            it('should not be too short for VISA, DISCOVER, or MASTERCARD', () => {
                cardInput.value = TEST_VISA;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));

                cvvInput.value = '12';
                cvvInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-cvv-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(enterValidCvvMsg);
            });

            it('should not be too long for VISA, DISCOVER, or MASTERCARD', () => {
                cardInput.value = TEST_VISA;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));

                cvvInput.value = '1234';
                cvvInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-cvv-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(enterValidCvvMsg);
            });

            //
            // AMEX
            //
            it('should be valid for length of 4 for AMEX', () => {
                cardInput.value = TEST_AMEX;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));

                cvvInput.value = '1234';
                cvvInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-cvv-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(false);
            });

            it('should not be too short for AMEX', () => {
                cardInput.value = TEST_AMEX;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));

                cvvInput.value = '123';
                cvvInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-cvv-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(enterValidCvvMsg);
            });

            it('should not be too long for AMEX', () => {
                cardInput.value = TEST_AMEX;
                cardInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));

                cvvInput.value = '12345';
                cvvInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-cvv-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(enterValidCvvMsg);
            });
        });

        describe('The expiration date', () => {
            let expiryDateInput;
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const enterExpiryDateMsg = Labels.ExpirationDateMissing;
            const enterValidExpiryDateMsg = Labels.InvalidExpirationDate;

            beforeEach(() => {
                expiryDateInput = iframe.contentDocument.body.querySelector('input[data-expiry-date]');
            });

            it('should have proper autocomplete attribute', () => {
                expect(expiryDateInput.getAttribute('autocomplete')).toBe('cc-exp');
            });

            it('should not be empty after change event has fired', () => {
                expiryDateInput.value = '';
                expiryDateInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-expiry-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(enterExpiryDateMsg);
            });

            it('should not be empty after blur event has fired', () => {
                expiryDateInput.value = '';
                expiryDateInput.dispatchEvent(new iframe.contentWindow.InputEvent('blur'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-expiry-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(enterExpiryDateMsg);
            });

            it('should not be too short', () => {
                expiryDateInput.value = '7/21';
                expiryDateInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-expiry-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(enterValidExpiryDateMsg);
            });

            it('should not be longer than 5 characters MM/YY', () => {
                expiryDateInput.value = '01/2021';
                expiryDateInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-expiry-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(enterValidExpiryDateMsg);
            });

            if (currentMonth > 0) {
                it('should not be an earlier month in this year', () => {
                    const currentYear = currentDate.getFullYear().toString().substring(2, 4);
                    expiryDateInput.value = `01/${currentYear}`;
                    expiryDateInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                    const formElementContainer = iframe.contentDocument.body.querySelector('[data-expiry-container]');
                    expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                    const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                    expect(helpElement.textContent).toBe(enterValidExpiryDateMsg);
                });
            }

            it('should not be an invalid month in this year', () => {
                const currentYear = currentDate.getFullYear().toString().substring(2, 4);
                expiryDateInput.value = `13/${currentYear}`;
                expiryDateInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-expiry-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(enterValidExpiryDateMsg);
            });

            it('should not be earlier than this year', () => {
                expiryDateInput.value = '01/20';
                expiryDateInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-expiry-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(enterValidExpiryDateMsg);
            });

            it('should remove error after setting a valid expiration date', () => {
                expiryDateInput.value = '';
                expiryDateInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                let formElementContainer = iframe.contentDocument.body.querySelector('[data-expiry-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(true);

                let helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement.textContent).toBe(enterExpiryDateMsg);

                expiryDateInput.value = '0224';
                expiryDateInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                formElementContainer = iframe.contentDocument.body.querySelector('[data-expiry-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(false);

                helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement).toBeNull();

                expect(expiryDateInput.value).toBe('02/24');
            });

            it('should not have an error with a valid date NOT including slash', () => {
                expiryDateInput.value = '0224';
                expiryDateInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-expiry-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(false);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement).toBeNull();

                expect(expiryDateInput.value).toBe('02/24');
            });

            it('should not have an error with a valid date including slash', () => {
                expiryDateInput.value = '0224';
                expiryDateInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const formElementContainer = iframe.contentDocument.body.querySelector('[data-expiry-container]');
                expect(formElementContainer.classList.contains('slds-has-error')).toBe(false);

                const helpElement = formElementContainer.querySelector('.slds-form-element__help');
                expect(helpElement).toBeNull();

                expect(expiryDateInput.value).toBe('02/24');
            });
        });

        describe('reportValidity', () => {
            it('returns false when card number is invalid', () => {
                const cardNumberInput = iframe.contentDocument.body.querySelector('input[data-card-number]');
                cardNumberInput.value = TEST_INVALID_CARD;
                cardNumberInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                cardNumberInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const cardholderInput = iframe.contentDocument.body.querySelector('input[data-cardholder-name]');
                cardholderInput.value = 'J. Doe';
                cardholderInput.dispatchEvent(new dom.window.InputEvent('change'));

                const expiryDateInput = iframe.contentDocument.body.querySelector('input[data-expiry-date]');
                expiryDateInput.value = '02/29';
                expiryDateInput.dispatchEvent(new dom.window.InputEvent('change'));

                const cvvInput = iframe.contentDocument.body.querySelector('[data-cvv]');
                cvvInput.value = '123';
                cvvInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                expect(iframe.reportValidity()).toBe(false);
            });

            it('returns false when card holder name is invalid', () => {
                const cardNumberInput = iframe.contentDocument.body.querySelector('input[data-card-number]');
                cardNumberInput.value = TEST_VISA;
                cardNumberInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                cardNumberInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const cardholderInput = iframe.contentDocument.body.querySelector('input[data-cardholder-name]');
                cardholderInput.value = '';
                cardholderInput.dispatchEvent(new dom.window.InputEvent('change'));

                const expiryDateInput = iframe.contentDocument.body.querySelector('input[data-expiry-date]');
                expiryDateInput.value = '02/29';
                expiryDateInput.dispatchEvent(new dom.window.InputEvent('change'));

                const cvvInput = iframe.contentDocument.body.querySelector('[data-cvv]');
                cvvInput.value = '123';
                cvvInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                expect(iframe.reportValidity()).toBe(false);
            });

            it('returns false when expiration date is invalid', () => {
                const cardNumberInput = iframe.contentDocument.body.querySelector('input[data-card-number]');
                cardNumberInput.value = TEST_VISA;
                cardNumberInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                cardNumberInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const cardholderInput = iframe.contentDocument.body.querySelector('input[data-cardholder-name]');
                cardholderInput.value = 'J Doe.';
                cardholderInput.dispatchEvent(new dom.window.InputEvent('change'));

                const expiryDateInput = iframe.contentDocument.body.querySelector('input[data-expiry-date]');
                expiryDateInput.value = '02/2999';
                expiryDateInput.dispatchEvent(new dom.window.InputEvent('change'));

                const cvvInput = iframe.contentDocument.body.querySelector('[data-cvv]');
                cvvInput.value = '123';
                cvvInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                expect(iframe.reportValidity()).toBe(false);
            });

            it('returns true when cvv is invalid', () => {
                const cardNumberInput = iframe.contentDocument.body.querySelector('input[data-card-number]');
                cardNumberInput.value = TEST_VISA;
                cardNumberInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                cardNumberInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const cardholderInput = iframe.contentDocument.body.querySelector('input[data-cardholder-name]');
                cardholderInput.value = 'J Doe.';
                cardholderInput.dispatchEvent(new dom.window.InputEvent('change'));

                const expiryDateInput = iframe.contentDocument.body.querySelector('input[data-expiry-date]');
                expiryDateInput.value = '02/29';
                expiryDateInput.dispatchEvent(new dom.window.InputEvent('change'));

                const cvvInput = iframe.contentDocument.body.querySelector('[data-cvv]');
                cvvInput.value = '1234';
                cvvInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                expect(iframe.reportValidity()).toBe(false);
            });

            it('returns true when all inputs are valid', () => {
                const cardNumberInput = iframe.contentDocument.body.querySelector('input[data-card-number]');
                cardNumberInput.value = TEST_VISA;
                cardNumberInput.dispatchEvent(new iframe.contentWindow.InputEvent('input'));
                cardNumberInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                const cardholderInput = iframe.contentDocument.body.querySelector('input[data-cardholder-name]');
                cardholderInput.value = 'J Doe.';
                cardholderInput.dispatchEvent(new dom.window.InputEvent('change'));

                const expiryDateInput = iframe.contentDocument.body.querySelector('input[data-expiry-date]');
                expiryDateInput.value = '02/29';
                expiryDateInput.dispatchEvent(new dom.window.InputEvent('change'));

                const cvvInput = iframe.contentDocument.body.querySelector('[data-cvv]');
                cvvInput.value = '123';
                cvvInput.dispatchEvent(new iframe.contentWindow.InputEvent('change'));

                expect(iframe.reportValidity()).toBe(true);
            });
        });
    });

    describe('buildWebruntimeStyleTag', () => {
        it('should return a style tag', () => {
            const webruntimeBrandingStyleString = buildWebruntimeStyleTag({
                '--dxp-g-root': '#ffffff',
                '--dxp-g-root-1': '#ebebeb',
                '--dxp-s-text-heading-extra-large-font-family': 'Salesforce Sans',
            });

            const styleElement = new DOMParser().parseFromString(webruntimeBrandingStyleString, 'text/html').head
                .firstElementChild;

            expect(styleElement.getAttribute('id')).toBe('webruntime-branding');
            expect(styleElement.tagName).toBe('STYLE');
            expect(styleElement.textContent).toBe(
                ':root {--dxp-g-root:#ffffff; --dxp-g-root-1:#ebebeb; --dxp-s-text-heading-extra-large-font-family:Salesforce Sans; }'
            );
        });

        it('should return an empty string when webruntimeBrandingMap is empty', () => {
            const webruntimeBrandingStyleString = buildWebruntimeStyleTag({});

            expect(webruntimeBrandingStyleString).toBe('');
        });
    });

    describe('getInheritedStyleUrls', () => {
        it('should allow same domain', () => {
            window.document.querySelectorAll = jest.fn().mockReturnValue([
                {
                    href: 'http://localhost/assets/styles/salesforce-lightning-design-system.min.css?cf4d65d079',
                },
            ]);

            expect(getInheritedStyleUrls()).toHaveLength(1);
            expect(getInheritedStyleUrls()[0]).toBe(
                'http://localhost/assets/styles/salesforce-lightning-design-system.min.css?cf4d65d079'
            );
        });

        it('should omit cross domain', () => {
            window.document.querySelectorAll = jest.fn().mockReturnValue([
                {
                    href: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
                },
            ]);

            expect(getInheritedStyleUrls()).toHaveLength(0);
        });

        it('should omit null domain', () => {
            window.document.querySelectorAll = jest.fn().mockReturnValue([
                {
                    href: null,
                },
            ]);

            expect(getInheritedStyleUrls()).toHaveLength(0);
        });
    });
});
