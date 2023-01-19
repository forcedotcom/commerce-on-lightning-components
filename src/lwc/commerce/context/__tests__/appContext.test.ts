import webstoreId from '@salesforce/webstore/Id';
import basePath from '@salesforce/community/basePath';
import type { AppContext, InternalContext } from '../types';
import type { Store } from 'experience/store';
import { serializeError } from 'experience/store';
import { currentRelease } from 'commerce/config';
import { appContextResponse } from './mockDataHelpers';
// eslint-disable-next-line jest/no-mocks-import
import { mockData } from '../__mocks__/mockData';
import {
    AppContextAdapter,
    appContextDataStore,
    appContextStore,
    getAppContext,
    getInternalContext,
    internalContextStore,
} from '../appContext';
import { toAppContext, toInternalContext } from '../util';
import { fetchService } from 'experience/data';

const API_VERSION = currentRelease.apiVersion;

jest.mock('experience/data', () =>
    Object.assign({}, jest.requireActual('experience/data'), {
        fetchService: jest.fn(),
    })
);

jest.mock('commerce/effectiveAccountApi', () => ({
    effectiveAccount: Object.defineProperty({}, 'accountId', {
        get: () => '1234566',
    }),
}));

function clearContextStores(): void {
    [appContextDataStore, appContextStore, internalContextStore].forEach(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (contextStore: Store<any>) => contextStore.delete()
    );
}

describe('commerce/context', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearContextStores();
    });

    afterEach(() => {
        jest.clearAllMocks();
        clearContextStores();
    });

    describe('getInternalContext()', () => {
        it(`should set internal context data`, async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(appContextResponse());
            const internalContext = <InternalContext>await getInternalContext();

            expect(internalContext).toStrictEqual(toInternalContext(mockData.appData));
        });
    });

    describe('getAppContext()', () => {
        it('should not throw if the data is not set', async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(Promise.resolve({}));

            const appContext = <AppContext>await getAppContext();
            expect(appContext.shippingCountries).toHaveLength(0);
            expect(appContext.country).toBe('');
            expect(appContext.taxType).toBe('');
            expect(appContext.webstoreId).toBe(webstoreId);
            expect(appContext.networkId).toBe('1a2b3cZZu');
            expect(appContext.logoutUrl).toBe(basePath + '/secur/logout.jsp');
            expect(appContext.isGuestCartCheckoutEnabled).toBe(false);

            expect(fetchService).toHaveBeenCalledTimes(1);
            expect(fetchService).toHaveBeenCalledWith(
                `/services/data/${API_VERSION}/commerce/webstores/${webstoreId}/application-context`
            );
        });

        it('should provide methods for access to some of the properties', async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(appContextResponse());

            const appContext = <AppContext>await getAppContext();
            const { appData } = mockData;

            expect(appContext.shippingCountries).toEqual(mockData.appData.shippingCountries);
            expect(appContext.country).toEqual(mockData.appData.country);
            expect(appContext.taxType).toEqual(mockData.appData.taxType);
            expect(appContext.webstoreId).toBe('0ZER00000004ZWc');
            expect(appContext.networkId).toBe('1a2b3cZZu');
            expect(appContext.logoutUrl).toBe(basePath + '/secur/logout.jsp');
            expect(appContext.isGuestCartCheckoutEnabled).toBe(appData.guestCartCheckoutEnabled);
            expect(appContext.shippingCountries).toEqual(appData.shippingCountries);
        });

        it('should not re-fetch on a second call to getPromise', async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(appContextResponse());

            await getAppContext();
            await getAppContext();
            expect(fetchService).toHaveBeenCalledTimes(1);
        });

        it('should throw an error when the fetch request fails', async () => {
            (<jest.Mock>fetchService).mockRejectedValue({ status: 500, statusText: 'foo' });
            await expect(getAppContext()).rejects.toThrow('foo');
        });

        it('should throw an error when the stored value represents an error', async () => {
            appContextStore.set(<never>{
                '{}:{}': {
                    data: undefined,
                    error: serializeError(new Error('foo')),
                    loaded: true,
                    loading: false,
                },
            });
            await expect(getAppContext()).rejects.toThrow('foo');
        });
    });

    describe('AppContextAdapter', () => {
        it('should load the context', async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(appContextResponse());

            const dataCallback = jest.fn();
            const adapter = new AppContextAdapter(dataCallback);
            adapter.update({});
            adapter.connect();
            expect(fetchService).not.toHaveBeenCalled();
            expect(dataCallback).toHaveBeenCalledTimes(1);
            expect(dataCallback).toHaveBeenLastCalledWith({
                data: undefined,
                error: undefined,
                loaded: false,
                loading: true,
            });

            await adapter.get();
            expect(fetchService).toHaveBeenCalledTimes(1);
            expect(dataCallback).toHaveBeenCalledTimes(2);
            expect(dataCallback.mock.calls[1]).toEqual([
                {
                    data: {
                        ...toAppContext(mockData.appData),
                    },
                    error: undefined,
                    loaded: true,
                    loading: false,
                },
            ]);
        });

        it('should use the available context data', async () => {
            appContextStore.set(<never>{
                '{}:{}': {
                    data: { webstoreId: '0ZER00000004ZWc' },
                    error: undefined,
                    loaded: true,
                    loading: false,
                },
            });

            const dataCallback = jest.fn();
            const adapter = new AppContextAdapter(dataCallback);
            adapter.update({});
            adapter.connect();
            expect(fetchService).toHaveBeenCalledTimes(0);
            expect(dataCallback).toHaveBeenCalledTimes(1);
            expect(dataCallback).toHaveBeenLastCalledWith({
                data: { webstoreId: '0ZER00000004ZWc' },
                error: undefined,
                loaded: true,
                loading: false,
            });

            await adapter.get();
            expect(fetchService).toHaveBeenCalledTimes(0);
            expect(dataCallback).toHaveBeenCalledTimes(1);
        });
    });
});
