import { toAppContext, toInternalContext, toSessionContext, toCurrencyIsoCode } from '../util';
// eslint-disable-next-line jest/no-mocks-import
import { mockData } from '../__mocks__/mockData';
import webstoreId from '@salesforce/webstore/Id';
import basePath from '@salesforce/community/basePath';
import communityId from '@salesforce/community/Id';
import isPreviewMode from '@app/isPreviewMode';
import type { AppContextData, SessionContextData } from 'commerce/context';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });
jest.mock('commerce/effectiveAccountApi', () => ({
    effectiveAccount: Object.defineProperty({}, 'accountId', {
        get: () => '1234566',
    }),
}));

describe('transformContext', () => {
    describe('toAppContext', () => {
        it('should transform app context data', () => {
            const appContext = toAppContext(mockData.appData);
            expect(appContext.shippingCountries).toEqual(mockData.appData.shippingCountries);
            expect(appContext.country).toEqual(mockData.appData.country);
            expect(appContext.taxType).toEqual(mockData.appData.taxType);
            expect(appContext.isGuestCartCheckoutEnabled).toBe(mockData.appData.guestCartCheckoutEnabled);
            expect(appContext.logoutUrl).toBe(basePath + '/secur/logout.jsp');
            expect(appContext.webstoreId).toBe(webstoreId);
            expect(appContext.networkId).toBe(communityId);
            expect(appContext.communityId).toBe(communityId);

            const appContextFallback = toAppContext(<AppContextData>{});
            expect(appContextFallback.shippingCountries).toHaveLength(0);
            expect(appContextFallback.country).toBe('');
            expect(appContextFallback.taxType).toBe('');
            expect(appContextFallback.isGuestCartCheckoutEnabled).toBeFalsy();
            expect(appContextFallback.logoutUrl).toBe(basePath + '/secur/logout.jsp');
            expect(appContextFallback.webstoreId).toBe(webstoreId);
            expect(appContextFallback.networkId).toBe(communityId);
            expect(appContextFallback.communityId).toBe(communityId);
        });
    });
    describe('toInternalContext', () => {
        it('should transform internal context data', () => {
            const internalContext = toInternalContext(mockData.appData);
            expect(internalContext.canUseGuestDataForAuthUsers).toBe(true);
            expect(internalContext.urlPathPrefix).toBe(basePath);
            expect(internalContext.propertiesEx).toEqual(mockData.appData.propertiesEx);
            expect(internalContext.catalogSnapshotVersionId).toBe(mockData.appData.catalogSnapshotVersionId);
            expect(internalContext.currencyIsoCode).toBe(mockData.appData.defaultCurrency);
            expect(internalContext.clientSidePaymentConfiguration).toBe(
                mockData.appData.clientSidePaymentConfiguration
            );

            const internalContextFallback = toInternalContext(<AppContextData>{});
            expect(internalContextFallback.canUseGuestDataForAuthUsers).toBeFalsy();
            expect(internalContextFallback.urlPathPrefix).toBe(basePath);
            expect(internalContextFallback.propertiesEx).toEqual({ highScaleCartEnabled: false });
            expect(internalContextFallback.catalogSnapshotVersionId).toBe('');
            expect(internalContextFallback.clientSidePaymentConfiguration).toBeUndefined();
        });
    });
    describe('toInternalContextGuestBrowsingTrue', () => {
        it('should transform internal context data guest browsing enabled', () => {
            const internalContext = toInternalContext(mockData.appData);
            expect(internalContext.canUseGuestDataForAuthUsers).toBe(true);
        });
    });
    describe('toInternalContextGuestBrowsingFalse', () => {
        it('should transform internal context data guest browsing disabled', () => {
            const internalContext = toInternalContext(mockData.guestBrowsingFalseData);
            expect(internalContext.canUseGuestDataForAuthUsers).toBe(false);
        });
    });
    describe('toInternalContextSingleEntitlementPolicyFalse', () => {
        it('should transform internal context data use single entitlement policy false', () => {
            const internalContext = toInternalContext(mockData.usesSingleEntitlementPolicyFalseData);
            expect(internalContext.canUseGuestDataForAuthUsers).toBe(false);
        });
    });
    describe('toInternalContextSingleEntitlementPolicyAndGuestBrowsingEnabledFalse', () => {
        it('should transform internal context data guest browsing disabled and use single entitlment policy false', () => {
            const internalContext = toInternalContext(
                mockData.usesSingleEntitlementPolicyAndGuestBrowsingEnabledFalseData
            );
            expect(internalContext.canUseGuestDataForAuthUsers).toBe(false);
        });
    });
    describe('toSessionContext', () => {
        it('should transform session context data', () => {
            const sessionContext = toSessionContext(mockData.sessionData);
            expect(sessionContext.effectiveAccountId).toBe('1234566');
            expect(sessionContext.isLoggedIn).toBe(!mockData.sessionData.guestUser);
            expect(sessionContext.userId).toBe(mockData.sessionData.userId);
            expect(sessionContext.userName).toBe(mockData.sessionData.userName);
            expect(sessionContext.isPreview).toBe(isPreviewMode);

            const sessionContextFallback = toSessionContext(<SessionContextData>{});
            expect(sessionContextFallback.effectiveAccountId).toBeUndefined();
            expect(sessionContextFallback.isLoggedIn).toBeFalsy();
            expect(sessionContextFallback.userId).toBeUndefined();
            expect(sessionContextFallback.userName).toBeUndefined();
            expect(sessionContextFallback.isPreview).toBe(isPreviewMode);
        });
    });
    describe('toCurrencyIsoCode', () => {
        it('should return null for currencyIsoCode when sessionDrivenCurrency is true', () => {
            const currencyIsoCode = toCurrencyIsoCode(mockData.appDataSessionDrivenCurrency);
            expect(currencyIsoCode).toBeNull();
        });

        it('should transform app context data to currencyIsoCode string when sessionDrivenCurrency is false', () => {
            const currencyIsoCode = toCurrencyIsoCode(mockData.appDataSingleCurrency);
            expect(currencyIsoCode).toEqual(mockData.appDataSingleCurrency.supportedCurrencies[0]);
        });

        it('should transform app context data to currencyIsoCode string using COMMERCE_CURRENCY_MAP func', () => {
            const spy = jest.fn();
            spy.mockReturnValueOnce('USD');
            // @ts-ignore
            window.COMMERCE_CURRENCY_MAP = spy;
            const currencyIsoCode = toCurrencyIsoCode(mockData.appData);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith('en-US');
            expect(currencyIsoCode).toBe('USD');
            // @ts-ignore
            delete window.COMMERCE_CURRENCY_MAP;
        });
    });
});
