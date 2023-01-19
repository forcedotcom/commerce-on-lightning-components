import type { EinsteinContext, EinsteinContextData } from './types';
import type { StoreAdapterCallbackHandler } from 'experience/store';
import { getStoreAdapterValue, Store, StoreAdapter } from 'experience/store';
import { readEinsteinContext } from './einsteinContextDataSource';

export function toEinsteinContext(data: EinsteinContextData): EinsteinContext {
    return {
        get activityTrackingEnabled(): boolean {
            return !!data && true === data.activityTrackingEnabled;
        },

        get catalogExists(): boolean {
            return !!data && true === data.catalogExists;
        },

        get isDeployed(): boolean {
            return !!data && true === data.isDeployed;
        },
        get host(): string | undefined {
            return data ? data.host : undefined;
        },

        get siteId(): string | undefined {
            return data ? data.siteId : undefined;
        },

        get tenant(): string | undefined {
            return data ? data.tenant : undefined;
        },

        get deploymentEnabled(): boolean {
            return !!data && true === data.deploymentEnabled;
        },
    };
}

function loadEinsteinContext(): Promise<EinsteinContext> {
    return readEinsteinContext().then((data: EinsteinContextData) => toEinsteinContext(data));
}

export const einsteinContextStore = new Store<EinsteinContext>('@@EinsteinContext');

export class EinsteinContextAdapter extends StoreAdapter<EinsteinContext> {
    constructor(dataCallback: StoreAdapterCallbackHandler<EinsteinContext>) {
        super(dataCallback, einsteinContextStore, { loader: loadEinsteinContext });
    }
}

export function getEinsteinContext(): Promise<EinsteinContext> {
    return getStoreAdapterValue<EinsteinContext>(EinsteinContextAdapter);
}
