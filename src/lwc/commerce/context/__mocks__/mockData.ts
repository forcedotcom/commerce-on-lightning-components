// Force JEST to use the mock connectors
import type { AppContextData, EinsteinContextData, SessionContextData } from '../types';
import { appContextStore } from '../appContext';
import { einsteinContextStore, toEinsteinContext } from '../einsteinContext';
import { sessionContextStore } from '../sessionContext';
import { toAppContext, toSessionContext } from '../util';

export const mockData = {
    appData: {
        shippingCountries: ['US'],
        taxType: 'Net',
        country: 'US',
        guestCartCheckoutEnabled: true,
        guestBrowsingEnabled: true,
        usesSingleEntitlementPolicy: true,
        sessionDrivenCurrency: false,
        catalogSnapshotVersionId: '123456',
        defaultCurrency: 'USD',
        supportedCurrencies: ['USD', 'EUR'],
        clientSidePaymentConfiguration: {
            componentName: 'cmp',
            config: {
                one: 'one',
            },
        },
        propertiesEx: {
            highScaleCartEnabled: true,
        },
    },
    appDataSingleCurrency: {
        shippingCountries: ['US'],
        taxType: 'Net',
        country: 'US',
        guestCartCheckoutEnabled: true,
        guestBrowsingEnabled: true,
        usesSingleEntitlementPolicy: true,
        sessionDrivenCurrency: false,
        catalogSnapshotVersionId: '123456',
        defaultCurrency: 'USD',
        supportedCurrencies: ['EUR'],
        clientSidePaymentConfiguration: {
            componentName: 'cmp',
            config: {
                one: 'one',
            },
        },
        propertiesEx: {
            highScaleCartEnabled: true,
        },
    },
    appDataSessionDrivenCurrency: {
        shippingCountries: ['US'],
        taxType: 'Net',
        country: 'US',
        guestCartCheckoutEnabled: true,
        usesSingleEntitlementPolicy: true,
        guestBrowsingEnabled: true,
        sessionDrivenCurrency: true,
        catalogSnapshotVersionId: '123456',
        defaultCurrency: 'USD',
        supportedCurrencies: ['EUR'],
        clientSidePaymentConfiguration: {
            componentName: 'cmp',
            config: {
                one: 'one',
            },
        },
        propertiesEx: {
            highScaleCartEnabled: true,
        },
    },
    sessionData: {
        userId: '005R0000000q3XZ',
        userName: 'Test User',
        guestUser: false,
        accountId: '1234566',
        accountName: 'accountName',
    },
    einsteinData: {
        activityTrackingEnabled: true,
        host: 'https://staging.ai.example.com',
        siteId: '0ZER00000004baJOAQ',
        tenant: 'core/hello/000xx0000001234567',
        isDeployed: true,
        catalogExists: true,
        deploymentEnabled: true,
    },
    guestBrowsingFalseData: {
        shippingCountries: ['US'],
        taxType: 'Net',
        country: 'US',
        guestCartCheckoutEnabled: true,
        guestBrowsingEnabled: false,
        sessionDrivenCurrency: false,
        usesSingleEntitlementPolicy: true,
        catalogSnapshotVersionId: '123456',
        defaultCurrency: 'USD',
        supportedCurrencies: ['USD', 'EUR'],
        clientSidePaymentConfiguration: {
            componentName: 'cmp',
            config: {
                one: 'one',
            },
        },
        propertiesEx: {
            highScaleCartEnabled: true,
        },
    },
    usesSingleEntitlementPolicyFalseData: {
        shippingCountries: ['US'],
        taxType: 'Net',
        country: 'US',
        guestCartCheckoutEnabled: true,
        guestBrowsingEnabled: true,
        sessionDrivenCurrency: false,
        usesSingleEntitlementPolicy: false,
        catalogSnapshotVersionId: '123456',
        defaultCurrency: 'USD',
        supportedCurrencies: ['USD', 'EUR'],
        clientSidePaymentConfiguration: {
            componentName: 'cmp',
            config: {
                one: 'one',
            },
        },
        propertiesEx: {
            highScaleCartEnabled: true,
        },
    },
    usesSingleEntitlementPolicyAndGuestBrowsingEnabledFalseData: {
        shippingCountries: ['US'],
        taxType: 'Net',
        country: 'US',
        guestCartCheckoutEnabled: true,
        guestBrowsingEnabled: false,
        sessionDrivenCurrency: false,
        usesSingleEntitlementPolicy: false,
        catalogSnapshotVersionId: '123456',
        defaultCurrency: 'USD',
        supportedCurrencies: ['USD', 'EUR'],
        clientSidePaymentConfiguration: {
            componentName: 'cmp',
            config: {
                one: 'one',
            },
        },
        propertiesEx: {
            highScaleCartEnabled: true,
        },
    },
};

export function mockAppContextData(data: Partial<AppContextData>): void {
    appContextStore.delete();
    appContextStore.set(<never>{
        '{}': {
            data: Object.assign({}, toAppContext(mockData.appData), data),
            error: undefined,
            loaded: true,
            loading: false,
        },
    });
}

export function mockSessionContextData(data: Partial<SessionContextData>): void {
    sessionContextStore.delete();
    sessionContextStore.set(<never>{
        '{}': {
            data: Object.assign({}, toSessionContext(mockData.sessionData), data),
            error: undefined,
            loaded: true,
            loading: false,
        },
    });
}

export function mockEinsteinContextData(data: Partial<EinsteinContextData>): void {
    einsteinContextStore.delete();
    einsteinContextStore.set(<never>{
        '{}': {
            data: Object.assign({}, toEinsteinContext(mockData.einsteinData), data),
            error: undefined,
            loaded: true,
            loading: false,
        },
    });
}
