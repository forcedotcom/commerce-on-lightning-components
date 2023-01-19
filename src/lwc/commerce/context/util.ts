import webstoreId from '@salesforce/webstore/Id';
import basePath from '@salesforce/community/basePath';
import communityId from '@salesforce/community/Id';
import isPreviewMode from '@app/isPreviewMode';
import locale from '@salesforce/i18n/locale';
import type {
    AppContext,
    AppContextData,
    ClientSidePaymentConfiguration,
    InternalContext,
    SessionContext,
    SessionContextData,
} from './types';
import type { ExperimentalProperties } from './types';

export function toAppContext(data: AppContextData): AppContext {
    return {
        get isGuestCartCheckoutEnabled(): boolean {
            return !!data?.guestCartCheckoutEnabled;
        },
        get logoutUrl(): string {
            const sitePrefix = basePath.replace(/\/s$/i, '');
            return sitePrefix + '/secur/logout.jsp';
        },

        /**
         * @deprecated Please use communityId instead.
         */
        get networkId(): string {
            return communityId;
        },

        get communityId(): string {
            return communityId;
        },

        get webstoreId(): string {
            return webstoreId;
        },

        get shippingCountries(): string[] {
            return data?.shippingCountries || [];
        },

        get taxType(): string {
            return data?.taxType || '';
        },

        get country(): string {
            return data?.country || '';
        },
    };
}

/**
 * Calls a merchandiser/custom defined function COMMERCE_CURRENCY_MAP to allow for
 * currency to locale mapping. W-11681595
 * sessionDrivenCurrency will be used in 244 to derive currency from sessionContext, until then we set to null. W-11927086
 * Note: This is a temporary way of retrieving currency in 242 and will likely change with markets in 244+
 */
export function toCurrencyIsoCode(data: AppContextData): string | null {
    if (data?.sessionDrivenCurrency) {
        return null;
    } else if (data?.supportedCurrencies?.length === 1) {
        return data?.supportedCurrencies[0];
        // @ts-ignore
    } else if (window !== 'undefined' && typeof window.COMMERCE_CURRENCY_MAP === 'function') {
        // @ts-ignore
        const currencyIsoCode = window.COMMERCE_CURRENCY_MAP(locale);
        if (currencyIsoCode && data?.supportedCurrencies.includes(currencyIsoCode)) {
            return currencyIsoCode;
        }
    }
    return data?.defaultCurrency;
}

export function toInternalContext(data: AppContextData): InternalContext {
    return {
        /**
         * Checks whether guest data may be served to auth users.
         * Note: This property is hidden when publicly exposing via contextApi.
         */
        get canUseGuestDataForAuthUsers(): boolean {
            return !!data?.usesSingleEntitlementPolicy && !!data?.guestBrowsingEnabled;
        },

        get propertiesEx(): ExperimentalProperties {
            return {
                highScaleCartEnabled: !!data?.propertiesEx?.highScaleCartEnabled,
            };
        },

        get urlPathPrefix(): string {
            return basePath;
        },

        get catalogSnapshotVersionId(): string {
            return data?.catalogSnapshotVersionId || '';
        },

        get clientSidePaymentConfiguration(): ClientSidePaymentConfiguration | undefined {
            return data?.clientSidePaymentConfiguration;
        },

        /**
         * Note: This property is hidden when publicly exposing via contextApi.
         */
        get currencyIsoCode(): string | null {
            return toCurrencyIsoCode(data);
        },
    };
}

export function toSessionContext(data: SessionContextData): SessionContext {
    return {
        get effectiveAccountId(): string | undefined {
            return data.accountId || undefined;
        },

        get effectiveAccountName(): string | undefined {
            return data.accountName || undefined;
        },

        get isLoggedIn(): boolean {
            return (data && data.guestUser === false) || false;
        },

        get userId(): string | undefined {
            return data?.userId;
        },

        get userName(): string | undefined {
            return data?.userName;
        },

        get isPreview(): boolean {
            return isPreviewMode;
        },

        /**
         * @deprecated
         */
        get isAnonymousPreview(): boolean {
            return isPreviewMode;
        },
    };
}
