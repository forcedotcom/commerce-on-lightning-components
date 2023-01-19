import type { SetBrandingMessage, SetStylesMessage, SetStylesPayload } from 'types/payment';

export function setBranding(brandingStyleInnerHTML: string): SetBrandingMessage {
    return {
        type: 'SET_BRANDING',
        data: brandingStyleInnerHTML,
    };
}

export function setStyle(styleUrls: SetStylesPayload): SetStylesMessage {
    return {
        type: 'SET_STYLES',
        data: styleUrls,
    };
}
