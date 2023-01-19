import Labels from './labels';
import basePath from '@salesforce/community/basePath';
import { iframeSrc } from './iframeSrc';
import type { OriginalDomApis } from 'types/common';
import type { BrandingVariableMap } from 'types/payment';

function isSameDomain(href: string | null): boolean {
    if (!href) {
        return false;
    }

    const { host, port, protocol } = new URL(href);
    const { host: windowHost, port: windowPort, protocol: windowProtocol } = window.location;

    return host === windowHost && port === windowPort && protocol === windowProtocol;
}

export function getInheritedStyleUrls(): string[] {
    // eslint-disable-next-line @lwc/lwc/no-document-query
    const stylesheets = window.document.querySelectorAll('link[rel="stylesheet"]');

    return Array.from(stylesheets)
        .map((stylesheet) => (stylesheet as HTMLLinkElement).href)
        .filter(isSameDomain);
}

export function buildWebruntimeStyleTag(webruntimeBrandingMap: BrandingVariableMap): string {
    const inlineStyleString = Object.keys(webruntimeBrandingMap).reduce((inlineStyleAccumulator, styleKey) => {
        return inlineStyleAccumulator.concat(`${styleKey}:${webruntimeBrandingMap[styleKey]}; `);
    }, '');

    return inlineStyleString.length > 0 ? `<style id="webruntime-branding">:root {${inlineStyleString}}</style>` : '';
}

export default function constructPaymentIframe(originalDomApis: OriginalDomApis): Element {
    const { documentCreateElement, elementSetAttribute } = originalDomApis;

    const iframe = documentCreateElement.call(document, 'iframe');
    elementSetAttribute.call(iframe, 'src', iframeSrc(basePath));
    elementSetAttribute.call(iframe, 'frameBorder', '0');
    elementSetAttribute.call(iframe, 'style', 'width: 100%;');
    elementSetAttribute.call(iframe, 'title', Labels.CardPaymentIframeTitle);
    elementSetAttribute.call(iframe, 'basePath', basePath);
    elementSetAttribute.call(iframe, 'CardNumberLabel', Labels.CardNumberLabel);
    elementSetAttribute.call(iframe, 'CardHolderNameLabel', Labels.CardHolderNameLabel);
    elementSetAttribute.call(iframe, 'ExpiryDateLabel', Labels.ExpiryDateLabel);
    elementSetAttribute.call(iframe, 'CvvLabel', Labels.CvvLabel);
    elementSetAttribute.call(iframe, 'CreditCardNumberMissing', Labels.CreditCardNumberMissing);
    elementSetAttribute.call(iframe, 'InvalidCreditCardNumber', Labels.InvalidCreditCardNumber);
    elementSetAttribute.call(iframe, 'CardHolderNameMissing', Labels.CardHolderNameMissing);
    elementSetAttribute.call(iframe, 'ExpirationDateMissing', Labels.ExpirationDateMissing);
    elementSetAttribute.call(iframe, 'InvalidExpirationDate', Labels.InvalidExpirationDate);
    elementSetAttribute.call(iframe, 'ExpiryDatePlaceholder', Labels.ExpiryDatePlaceholder);
    elementSetAttribute.call(iframe, 'CvvMissing', Labels.CvvMissing);
    elementSetAttribute.call(iframe, 'InvalidCvv', Labels.InvalidCvv);
    elementSetAttribute.call(iframe, 'Visa', Labels.Visa);
    elementSetAttribute.call(iframe, 'MasterCard', Labels.MasterCard);
    elementSetAttribute.call(iframe, 'AmericanExpress', Labels.AmericanExpress);
    elementSetAttribute.call(iframe, 'Discover', Labels.Discover);

    return iframe;
}
