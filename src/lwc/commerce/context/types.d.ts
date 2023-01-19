declare interface BaseEinsteinContext {
    /**
     * @property host - The hostname for Commerce Einstein APIs
     */
    host?: string;
    /**
     * @property siteId - The site id to use in Commerce Einstein
     */
    siteId?: string;
    /**
     * @property tenant - The tenant identifier to use in Commerce Einstein
     */
    tenant?: string;
    /**
     * @property catalogExists - True if and only if this site has a webstore catalog
     */
    catalogExists?: boolean;
    /**
     * @property isDeployed - True if and only if the deployment toggle is set to true in the admin panel
     * AND the last deployment to Commerce Einstein was successful
     */
    isDeployed?: boolean;
    /**
     * @property deploymentEnabled - True if and only if the deployment toggle is set to true in the admin panel
     */
    deploymentEnabled?: boolean;
}

/**
 * Interface to define the shape of our application context data.
 */
export declare interface AppContext {
    logoutUrl: string;
    networkId: string;
    communityId: string;
    webstoreId: string;
    isGuestCartCheckoutEnabled: boolean;
    shippingCountries: string[];
    taxType: string;
    country: string;
}

export declare interface ExperimentalProperties {
    highScaleCartEnabled?: boolean;
}

/**
 * Interface to define the shape of our internal context data.
 */
export declare interface InternalContext {
    canUseGuestDataForAuthUsers: boolean;
    urlPathPrefix: string;
    catalogSnapshotVersionId: string;
    clientSidePaymentConfiguration?: ClientSidePaymentConfiguration;
    propertiesEx: ExperimentalProperties;
    currencyIsoCode: string | null;
}

/**
 * Interface of the data returned by the context API.
 */
export declare interface AppContextData {
    guestCartCheckoutEnabled: boolean;
    guestBrowsingEnabled: boolean;
    usesSingleEntitlementPolicy: boolean; // Used by the client to access products as guest
    sessionDrivenCurrency: boolean;
    catalogSnapshotVersionId: string;
    defaultCurrency: string;
    supportedCurrencies: string[];
    clientSidePaymentConfiguration: ClientSidePaymentConfiguration;
    propertiesEx: ExperimentalProperties;
    shippingCountries: string[];
    taxType: string;
    country: string;
}

/**
 * Interface to define the shape of our session context data.
 */
export declare interface SessionContext {
    effectiveAccountId?: string;
    effectiveAccountName?: string;
    userId?: string;
    isAnonymousPreview: boolean;
    isLoggedIn: boolean;
    isPreview: boolean;
    userName?: string;
}

/**
 * Interface of the data returned by the context API.
 */
export declare interface SessionContextData {
    userId: string;
    userName: string;
    guestUser: boolean;
    accountId: string | null;
    accountName: string | null;
}

/**
 * Interface to define the shape of our Einstein context data.
 */
export declare interface EinsteinContext extends BaseEinsteinContext {
    activityTrackingEnabled: boolean;
}

/**
 * Interface of the data returned by the Einstein configuration API.
 */
export declare interface EinsteinContextData extends BaseEinsteinContext {
    /**
     * @property activityTrackingEnabled - True if and only if activity tracking is enabled for this site in the admin panel
     */
    activityTrackingEnabled?: boolean;
}

export declare interface ClientSidePaymentConfiguration {
    componentName: string;
    config: Record<string, string>;
    error?: string;
}

export declare interface SessionContextStore {
    context?: SessionContext;
}
