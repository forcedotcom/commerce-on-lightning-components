import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { AppContextAdapter } from 'commerce/contextApi';
import CardPaymentMethod, {
    getWebruntimeBranding,
    webruntimeStyleInnerHTML,
    bootstrapComponent,
} from '../cardPaymentMethod';
import { setBranding, setStyle } from '../paymentMessages';

import type { CardPaymentMethodApi, Address } from 'types/unified_checkout';
import type { TestWireAdapter } from '@salesforce/wire-service-jest-util';

jest.mock(
    'transport',
    () => {
        return {
            fetch: jest.fn(() => {
                return Promise.resolve();
            }),
        };
    },
    { virtual: true }
);

jest.mock('commerce/config', () => {
    return {
        currentRelease: {
            apiVersion: 'v52.0',
        },
    };
});

jest.mock('../paymentSrc', () =>
    jest.fn(() => {
        return '../../../../../../b2c-storefront/src/public/assets/js/payment.js';
    })
);

jest.mock(
    '@app/csrfToken',
    () => {
        return { default: 'csrftoken' };
    },
    { virtual: true }
);

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        AppContextAdapter: mockCreateTestWireAdapter(),
    })
);

function getCardPaymentElement(element: HTMLElement): Element | null {
    return element.querySelector('.cardpayment > div');
}

describe('CardPaymentMethod', () => {
    let element: HTMLElement & CardPaymentMethod;
    let cardPaymentElement: Element | null;

    beforeEach(() => {
        window.originalDomApis = {
            htmlelementAddEventListener: Element.prototype.addEventListener,
            elementAppendChild: Document.prototype.appendChild,
            elementAttachShadow: function (): ShadowRoot {
                return Element.prototype.attachShadow.call(this, { mode: 'open' });
            },
            elementSetAttribute: jest.fn(Element.prototype.setAttribute),
            documentCreateElement: function (tag): HTMLElement {
                const el = <HTMLElement & CardPaymentMethodApi>Document.prototype.createElement.call(this, tag);
                if (tag === 'iframe') {
                    el.reportValidity = jest.fn();
                    el.tokenizePaymentMethod = jest.fn();
                    el.fillWithTestCardData = jest.fn();
                    el.focus = jest.fn();
                }

                return el;
            },
        };

        element = createElement('card-payment-method', {
            is: CardPaymentMethod,
        });

        const webruntimeStyleTag = document.createElement('style');
        webruntimeStyleTag.setAttribute('id', 'webruntime-branding');
        webruntimeStyleTag.textContent = ':root {--dxp-g-success: #4bca81;}';
        document.head.appendChild(webruntimeStyleTag);

        document.body.appendChild(element);
        cardPaymentElement = getCardPaymentElement(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should append an div that has a closed shadow dom', () => {
        expect(cardPaymentElement).toBeDefined();
        expect(cardPaymentElement?.tagName).toBe('DIV');
        expect(cardPaymentElement?.shadowRoot).toBeDefined();
    });

    it('should call reportValidity method on the underlying card payment component and iframe when reportValidity is called', () => {
        jest.spyOn(<HTMLElement & CardPaymentMethodApi>cardPaymentElement, 'reportValidity');

        element.reportValidity();

        expect((<HTMLElement & CardPaymentMethodApi>cardPaymentElement).reportValidity).toHaveBeenCalledTimes(1);
        expect(
            (<CardPaymentMethodApi>(<unknown>cardPaymentElement?.shadowRoot?.firstElementChild)).reportValidity
        ).toHaveBeenCalledTimes(1);
    });

    it('should call focus method on the underlying card payment component and iframe when reportValidity is called', () => {
        jest.spyOn(<HTMLElement & CardPaymentMethodApi>cardPaymentElement, 'focus');

        element.focus();

        expect((<HTMLElement & CardPaymentMethodApi>cardPaymentElement).focus).toHaveBeenCalledTimes(1);
        expect(
            (<CardPaymentMethodApi>(<unknown>cardPaymentElement?.shadowRoot?.firstElementChild)).focus
        ).toHaveBeenCalledTimes(1);
    });

    it('should call tokenizePaymentMethod method on the underlying card payment component and iframe when tokenizePaymentMethod is called', async () => {
        jest.spyOn(<HTMLElement & CardPaymentMethodApi>cardPaymentElement, 'tokenizePaymentMethod');

        (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
            data: { webstoreId: 'webstoreid' },
        });

        const billingAddress: Address = {
            name: 'Shopper Name',
            street: '123 Acme Drive',
            city: 'San Francisco',
            postalCode: '94105',
            region: 'CA',
            country: 'US',
        };

        await element.tokenizePaymentMethod('webstoreid', billingAddress);

        return Promise.resolve().then(() => {
            expect(
                (<HTMLElement & CardPaymentMethodApi>cardPaymentElement).tokenizePaymentMethod
            ).toHaveBeenCalledTimes(1);
            expect(
                (<CardPaymentMethodApi>(<unknown>cardPaymentElement?.shadowRoot?.firstElementChild))
                    .tokenizePaymentMethod
            ).toHaveBeenCalledWith({
                apiVersion: 'v52.0',
                csrfToken: {
                    default: 'csrftoken',
                },
                webstoreId: 'webstoreid',
                billingAddress: billingAddress,
            });
        });
    });

    it('should have a fillWithTestCardData method', () => {
        expect((<HTMLElement & CardPaymentMethodApi>cardPaymentElement).fillWithTestCardData).toBeInstanceOf(Function);
    });

    it('should call fillWithTestCardData method on the underlying card payment component and iframe when fillWithTestCardData is called', () => {
        jest.spyOn(<HTMLElement & CardPaymentMethodApi>cardPaymentElement, 'fillWithTestCardData');

        element.fillWithTestCardData('VISA_ACCEPTED');

        expect((<HTMLElement & CardPaymentMethodApi>cardPaymentElement).fillWithTestCardData).toHaveBeenCalledTimes(1);
        expect(
            (<CardPaymentMethodApi>(<unknown>cardPaymentElement?.shadowRoot?.firstElementChild)).fillWithTestCardData
        ).toHaveBeenCalledWith('VISA_ACCEPTED');
    });

    it('should have an iframe as first child of the shadow DOM', () => {
        expect((<Element>cardPaymentElement?.shadowRoot?.firstChild).tagName).toBe('IFRAME');
    });

    describe('getWebruntimeBranding', () => {
        [
            "--dxp-g-root: url('/malicious/url');",
            '--dxp-g-root: data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7;',
            '--dxp-s-some-variable: data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDo;',
        ].forEach((cssVariableDeclaration) => {
            const value = cssVariableDeclaration.substring(
                cssVariableDeclaration.indexOf(':') + 1,
                cssVariableDeclaration.length - 1
            );
            it(`should NOT allow styles with${value}`, () => {
                window.getComputedStyle = jest.fn().mockReturnValue({
                    getPropertyValue: jest.fn().mockReturnValue(value),
                });

                expect(getWebruntimeBranding(cssVariableDeclaration, element)).toEqual({});
            });
        });

        it('should NOT allow an import value', () => {
            expect(getWebruntimeBranding("@import'http://xss.rocks/xss.css';", element)).toEqual({});
        });

        [
            '--dxp-g-offline-contrast-3: #ffffff;',
            '--dxp-g-offline-contrast-3: #fff;',
            '--dxp-g-offline-contrast-3: rgb(0, 0, 0);',
            '--dxp-s-text-heading-large-font-family: Salesforce Sans;',
            '--dxp-s-text-heading-medium-font-size: 1.25rem;',
            '--dxp-s-text-heading-medium-font-size: 1.25px;',
            '--dxp-s-text-heading-medium-font-size: 1.25em;',
            '--dxp-s-text-heading-medium-font-size: 100%;',
            '--dxp-s-text-heading-medium-font-weight: 300;',
            '--dxp-s-button-color-active: var(--dxp-s-button-color-1);',
            '--dxp-s-text-heading-extra-large-text-transform: none;',
        ].forEach((cssVariableDeclaration) => {
            const [variableName, value] = cssVariableDeclaration.split(':');
            const normalizedValue = value.slice(0, -1);

            it(`should allow styles with a value of${normalizedValue}`, () => {
                window.getComputedStyle = jest.fn().mockReturnValue({
                    getPropertyValue: jest.fn().mockReturnValue(normalizedValue),
                });

                const expected = getWebruntimeBranding(cssVariableDeclaration, element);
                expect(expected).toEqual({
                    [variableName]: normalizedValue,
                });
            });
        });

        it('should return empty map if there are no variables that start with --dxp-', () => {
            expect(getWebruntimeBranding('--xyz-text-heading-color: rgb(0, 0, 0);', element)).toEqual({});
        });
    });

    describe('webruntimeStyleInnerHTML', () => {
        it('should return a style tag', () => {
            const webruntimeBrandingStyleString = webruntimeStyleInnerHTML({
                '--dxp-g-root': '#ffffff',
                '--dxp-g-root-1': '#ebebeb',
                '--dxp-s-text-heading-extra-large-font-family': 'Salesforce Sans',
            });

            expect(webruntimeBrandingStyleString).toBe(
                ':root {--dxp-g-root:#ffffff; --dxp-g-root-1:#ebebeb; --dxp-s-text-heading-extra-large-font-family:Salesforce Sans; }'
            );
        });
    });

    describe('bootstrapComponent', () => {
        let frame: unknown;
        let postMessage: jest.Mock;
        const branding = '--dxp-g-root:#ffffff;';
        const styleUrls = ['localhost:3000/assets/site.css'];

        beforeEach(() => {
            postMessage = jest.fn();
            frame = {
                contentWindow: {
                    postMessage,
                },
            };
        });

        it("should do nothing if contentWindow doesn't exist", () => {
            frame = {};
            bootstrapComponent(element, <HTMLIFrameElement>frame, branding, styleUrls);
            expect(element.getAttribute('state')).toBe('ready');
            expect(postMessage).not.toHaveBeenCalled();
        });

        it('should send a SET_STYLES and SET_BRANDING messages', () => {
            bootstrapComponent(element, <HTMLIFrameElement>frame, branding, styleUrls);
            expect(element.getAttribute('state')).toBe('ready');
            expect(postMessage).toHaveBeenNthCalledWith(1, setBranding(branding), origin);
            expect(postMessage).toHaveBeenNthCalledWith(2, setStyle(styleUrls), origin);
            expect(postMessage).toHaveBeenCalledTimes(2);
        });
    });
});
