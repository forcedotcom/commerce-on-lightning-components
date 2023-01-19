import type { StoreAdapterCallbackHandler } from 'experience/store';
import { getStoreAdapterValue, Store, StoreAdapter } from 'experience/store';
import type { AppContext, AppContextData, InternalContext } from './types';
import { readAppContext } from './appContextDataSource';
import { toAppContext, toInternalContext } from './util';

// This store holds the raw (server-side) app context model
export const appContextDataStore = new Store<AppContextData>('@@AppContextData');

// This store holds the client-side app context model
export const appContextStore = new Store<AppContext>('@@AppContext');

// This store holds all non-public context information
export const internalContextStore = new Store<InternalContext>('@@InternalContext');

class AppContextDataAdapter extends StoreAdapter<AppContextData> {
    constructor(dataCallback: StoreAdapterCallbackHandler<AppContextData>) {
        super(dataCallback, appContextDataStore, { loader: readAppContext });
    }
}

export function getAppContextData(): Promise<AppContextData> {
    return getStoreAdapterValue(AppContextDataAdapter);
}

function loadAppContext(): Promise<AppContext> {
    return getAppContextData().then((data: AppContextData) => toAppContext(data));
}

function loadInternalContext(): Promise<InternalContext> {
    return getAppContextData().then((data: AppContextData) => toInternalContext(data));
}

export class AppContextAdapter extends StoreAdapter<AppContext> {
    constructor(dataCallback: StoreAdapterCallbackHandler<AppContext>) {
        super(dataCallback, appContextStore, { loader: loadAppContext });
    }
}

export class InternalContextAdapter extends StoreAdapter<InternalContext> {
    constructor(dataCallback: StoreAdapterCallbackHandler<InternalContext>) {
        super(dataCallback, internalContextStore, { loader: loadInternalContext });
    }
}

export function getAppContext(): Promise<AppContext> {
    return getStoreAdapterValue(AppContextAdapter);
}

export function getInternalContext(): Promise<InternalContext> {
    return getStoreAdapterValue(InternalContextAdapter);
}
