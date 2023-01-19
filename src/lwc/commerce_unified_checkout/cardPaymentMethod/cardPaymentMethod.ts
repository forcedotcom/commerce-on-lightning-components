import { api, LightningElement } from 'lwc';
import constructCardPaymentIframe, { getInheritedStyleUrls } from './cardPaymentIframe';
import { currentRelease } from 'commerce/config';

import type {
    CardPaymentMethodApi,
    CardPaymentMethodIframeApi,
    BrandingVariableMap,
    BrandingVariableTuple,
    PaymentTokenizeResponse,
    PaymentTokenizeRequestContext,
    Address,
} from 'types/unified_checkout';

import type { OriginalDomApis } from 'types/common';
import { setBranding, setStyle } from './paymentMessages';

const DXP_CSS_VARIABLES_REGEX = /--(lwc|dxp)-.*?;/g;

function isAllowed(styleValueString: string): boolean {
    const normalizedValue = styleValueString.normalize().trim().toLowerCase();

    if (normalizedValue.indexOf('data:') > -1 || normalizedValue.indexOf('url(') > -1) {
        return false;
    }

    return true;
}

function tokenizeStyleKeyValue(styleKeyValueString: string): BrandingVariableTuple {
    return styleKeyValueString.split(':').map((keyOrValue: string) => keyOrValue.trim()) as BrandingVariableTuple;
}

export function getWebruntimeBranding(webruntimeBrandingTextContent: string, element: Element): BrandingVariableMap {
    const dxpVariableStrings = webruntimeBrandingTextContent.match(DXP_CSS_VARIABLES_REGEX);
    if (dxpVariableStrings) {
        return Array.from(dxpVariableStrings).reduce((brandingDictionary, styleKeyValueString) => {
            const [key] = tokenizeStyleKeyValue(styleKeyValueString);

            const computedStyleValue = getComputedStyle(element).getPropertyValue(key);

            if (isAllowed(computedStyleValue)) {
                brandingDictionary[key] = computedStyleValue;
            }

            return brandingDictionary;
        }, {} as BrandingVariableMap);
    }

    return {};
}

export function webruntimeStyleInnerHTML(webruntimeBranding: BrandingVariableMap): string {
    const inlineStyleString = Object.keys(webruntimeBranding).reduce((inlineStyleAccumulator, styleKey) => {
        return inlineStyleAccumulator.concat(`${styleKey}:${webruntimeBranding[styleKey]}; `);
    }, '');

    return inlineStyleString.length > 0 ? `:root {${inlineStyleString}}` : '';
}

export function bootstrapComponent(
    element: Element,
    iframe: HTMLIFrameElement,
    brandingStyleInnerHTML: string,
    styleUrls: string[]
): void {
    if (element && element.setAttribute) {
        element.setAttribute('state', 'ready');
    }
    if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(setBranding(brandingStyleInnerHTML), origin);
        iframe.contentWindow.postMessage(setStyle(styleUrls), origin);
    }
}

function constructCardPaymentComponent(originalDomApis: OriginalDomApis, element: Element): CardPaymentMethodApi {
    const { elementAttachShadow, elementAppendChild, elementSetAttribute, documentCreateElement } = originalDomApis;

    const CardPaymentComponent = documentCreateElement.call(document, 'div') as Element & CardPaymentMethodApi;
    elementSetAttribute.call(CardPaymentComponent, 'data-card-payment-method', '');
    elementAppendChild.call(element, CardPaymentComponent);

    // None of the sensitive properties, like 'shadowRoot' should be exposed as
    // a component property (this.XXXX)
    const shadow = elementAttachShadow.call(CardPaymentComponent, { mode: 'closed' });

    let brandingStyleInnerHTML: string;
    const webRuntimeBrandingStyleElement = document.head.querySelector('style#webruntime-branding');
    if (webRuntimeBrandingStyleElement && webRuntimeBrandingStyleElement.textContent) {
        const webRuntimeBranding = getWebruntimeBranding(webRuntimeBrandingStyleElement.textContent, element);
        brandingStyleInnerHTML = webruntimeStyleInnerHTML(webRuntimeBranding);
    }

    const iframe = constructCardPaymentIframe.call(document, originalDomApis) as HTMLIFrameElement &
        CardPaymentMethodIframeApi;
    elementAppendChild.call(shadow, iframe);

    iframe.addEventListener('load', () => {
        bootstrapComponent(CardPaymentComponent, iframe, brandingStyleInnerHTML, getInheritedStyleUrls());
    });

    CardPaymentComponent.tokenizePaymentMethod = async function (
        webstoreId: string,
        billingAddress: Address
    ): Promise<PaymentTokenizeResponse> {
        const { default: csrfToken } = await import('@app/csrfToken');

        const requestContext: PaymentTokenizeRequestContext = {
            webstoreId: webstoreId,
            apiVersion: currentRelease.apiVersion,
            csrfToken,
            billingAddress: billingAddress,
        };

        return iframe.tokenizePaymentMethod(requestContext);
    };

    CardPaymentComponent.reportValidity = (): boolean => {
        return iframe.reportValidity();
    };

    CardPaymentComponent.focus = (): void => {
        return iframe.focus();
    };

    CardPaymentComponent.fillWithTestCardData = function (cardTestType: string): void {
        return iframe.fillWithTestCardData(cardTestType);
    };

    return CardPaymentComponent;
}

export default class CardPaymentMethod extends LightningElement implements CardPaymentMethodApi {
    static renderMode = 'light';

    public renderedCallback(): void {
        this.appendPaymentFrame();
    }

    private appendPaymentFrame(): void {
        const element = this.querySelector('.cardpayment');
        if (element) {
            const commercePaymentFrame = element.firstChild;

            if (!commercePaymentFrame) {
                constructCardPaymentComponent(window.originalDomApis, element);
            }
        }
    }

    public get cardPaymentComponent(): CardPaymentMethodApi {
        const lwcManualComponent = this.querySelector('.cardpayment');

        return <CardPaymentMethodApi>(<unknown>lwcManualComponent?.firstElementChild);
    }

    @api
    public tokenizePaymentMethod(webstoreId: string, billingAddress: Address): Promise<PaymentTokenizeResponse> {
        return this.cardPaymentComponent.tokenizePaymentMethod(webstoreId, billingAddress);
    }

    @api
    public reportValidity(): boolean {
        return this.cardPaymentComponent.reportValidity();
    }

    @api
    public focus(): void {
        if (this.cardPaymentComponent) {
            this.cardPaymentComponent.focus();
        }
    }

    @api
    public fillWithTestCardData(testCardType: string): void {
        if (this.cardPaymentComponent) {
            this.cardPaymentComponent.fillWithTestCardData(testCardType);
        }
    }
}
