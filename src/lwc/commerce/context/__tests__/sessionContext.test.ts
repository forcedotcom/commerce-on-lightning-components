import isPreviewMode from '@app/isPreviewMode';
import type { Store, Unsubscribable } from 'experience/store';
import { serializeError } from 'experience/store';
import { fetchService } from 'experience/data';
import { effectiveAccount } from 'commerce/effectiveAccountApi';
import type { SessionContext } from '../types';
import { appContextDataStore, appContextStore, internalContextStore } from '../appContext';
import { getSessionContext, SessionContextAdapter, sessionContextStore } from '../sessionContext';
// eslint-disable-next-line jest/no-mocks-import
import { mockData } from '../__mocks__/mockData';
import { toSessionContext } from '../util';
import { sessionContextResponse } from './mockDataHelpers';

jest.mock('experience/data', () =>
    Object.assign({}, jest.requireActual('experience/data'), {
        fetchService: jest.fn(),
    })
);

let effectiveAccountSubscription: Unsubscribable | undefined;

jest.mock('commerce/effectiveAccountApi', () => {
    const effectiveAccountApi = jest.requireActual('commerce/effectiveAccountApi');
    const originalSubscribe = effectiveAccountApi.effectiveAccount.subscribe;
    effectiveAccountApi.effectiveAccount.subscribe = jest
        .fn()
        .mockImplementation(
            (...args: unknown[]) => (effectiveAccountSubscription = originalSubscribe.apply(this, args))
        );
    return Object.assign({}, effectiveAccountApi);
});

function clearContextStores(): void {
    if (effectiveAccountSubscription) {
        effectiveAccountSubscription.unsubscribe();
        effectiveAccountSubscription = undefined;
    }

    [appContextDataStore, appContextStore, sessionContextStore, internalContextStore].forEach(
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

    describe('getSessionContext()', () => {
        it('should not throw if the data is not set', async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(Promise.resolve({}));

            const sessionContext = <SessionContext>await getSessionContext();

            expect(sessionContext.effectiveAccountId).toBeUndefined();
            expect(sessionContext.userId).toBeUndefined();
            expect(sessionContext.userName).toBeUndefined();
            expect(sessionContext.isLoggedIn).toBe(false);
            expect(sessionContext.isPreview).toBe(false);
            expect(sessionContext.isAnonymousPreview).toBe(false);
        });

        it('should provide methods for access to some of the properties', async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(sessionContextResponse());

            const sessionContext = <SessionContext>await getSessionContext();
            const { sessionData } = mockData;

            expect(sessionContext.userId).toBe(sessionData.userId);
            expect(sessionContext.userName).toBe(sessionData.userName);
            expect(sessionContext.isLoggedIn).toBe(!sessionData.guestUser);
            expect(sessionContext.isPreview).toBe(isPreviewMode);
            expect(sessionContext.isAnonymousPreview).toBe(isPreviewMode);
        });

        it('should throw an error when the fetch request fails', async () => {
            (<jest.Mock>fetchService).mockRejectedValue({ status: 500, statusText: 'foo' });
            await expect(getSessionContext()).rejects.toThrow('foo');
        });

        it('should throw an error when the stored value represents an error', async () => {
            sessionContextStore.set(<never>{
                '{}:{}': {
                    data: undefined,
                    error: serializeError(new Error('foo')),
                    loaded: true,
                    loading: false,
                },
            });
            await expect(getSessionContext()).rejects.toThrow('foo');
        });
    });

    describe('SessionContextAdapter', () => {
        it('should load the context', async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(sessionContextResponse());

            const dataCallback = jest.fn();
            const adapter = new SessionContextAdapter(dataCallback);
            adapter.update({});
            adapter.connect();
            expect(fetchService).not.toHaveBeenCalled();
            expect(dataCallback).toHaveBeenCalledTimes(1);
            expect(dataCallback).toHaveBeenNthCalledWith(1, {
                data: undefined,
                error: undefined,
                loaded: false,
                loading: true,
            });

            await adapter.get();
            expect(fetchService).toHaveBeenCalledTimes(1);
            expect(dataCallback).toHaveBeenCalledTimes(2);
            expect(dataCallback).toHaveBeenNthCalledWith(2, {
                data: { ...toSessionContext(mockData.sessionData) },
                error: undefined,
                loaded: true,
                loading: false,
            });
        });

        it('should use the available context data', async () => {
            sessionContextStore.set('context', <never>{
                '{}:{}': {
                    data: { effectiveAccountId: '001R0000006ZKQN' },
                    error: undefined,
                    loaded: true,
                    loading: false,
                },
            });

            const dataCallback = jest.fn();
            const adapter = new SessionContextAdapter(dataCallback);
            adapter.update({});
            adapter.connect();
            expect(fetchService).toHaveBeenCalledTimes(0);
            expect(dataCallback).toHaveBeenCalledTimes(1);
            expect(dataCallback).toHaveBeenLastCalledWith({
                data: { effectiveAccountId: '001R0000006ZKQN' },
                error: undefined,
                loaded: true,
                loading: false,
            });

            await adapter.get();
            expect(fetchService).toHaveBeenCalledTimes(0);
            expect(dataCallback).toHaveBeenCalledTimes(1);
        });

        it('should subscribe to the effective account (without initial account information)', async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(sessionContextResponse());

            const dataCallback = jest.fn();
            const adapter = new SessionContextAdapter(dataCallback);
            adapter.update({});
            adapter.connect();
            expect(fetchService).not.toHaveBeenCalled();
            expect(dataCallback).toHaveBeenCalledTimes(1);
            expect(dataCallback).toHaveBeenNthCalledWith(1, {
                data: undefined,
                error: undefined,
                loaded: false,
                loading: true,
            });

            await adapter.get();
            expect(fetchService).toHaveBeenCalledTimes(1);
            expect(dataCallback).toHaveBeenCalledTimes(2);
            expect(dataCallback).toHaveBeenNthCalledWith(2, {
                data: toSessionContext(mockData.sessionData),
                error: undefined,
                loaded: true,
                loading: false,
            });

            effectiveAccount.update('foo', 'bar');
            await adapter.get();

            expect(fetchService).toHaveBeenCalledTimes(1);
            expect(dataCallback).toHaveBeenCalledTimes(3);
            expect(dataCallback).toHaveBeenNthCalledWith(3, {
                data: toSessionContext({ ...mockData.sessionData, accountId: 'foo', accountName: 'bar' }),
                error: undefined,
                loaded: true,
                loading: false,
            });
        });

        it('should subscribe to the effective account (with initial account information)', async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(sessionContextResponse());
            effectiveAccount.update('foo', 'bar');

            const dataCallback = jest.fn();
            const adapter = new SessionContextAdapter(dataCallback);
            adapter.update({});
            adapter.connect();
            expect(fetchService).not.toHaveBeenCalled();
            expect(dataCallback).toHaveBeenCalledTimes(1);
            expect(dataCallback).toHaveBeenNthCalledWith(1, {
                data: undefined,
                error: undefined,
                loaded: false,
                loading: true,
            });

            await adapter.get();
            expect(fetchService).toHaveBeenCalledTimes(1);
            expect(dataCallback).toHaveBeenCalledTimes(2);
            expect(dataCallback).toHaveBeenNthCalledWith(2, {
                data: toSessionContext({ ...mockData.sessionData, accountId: 'foo', accountName: 'bar' }),
                error: undefined,
                loaded: true,
                loading: false,
            });

            effectiveAccount.update('bar', 'baz');
            await adapter.get();

            expect(fetchService).toHaveBeenCalledTimes(1);
            expect(dataCallback).toHaveBeenCalledTimes(3);
            expect(dataCallback).toHaveBeenNthCalledWith(3, {
                data: toSessionContext({ ...mockData.sessionData, accountId: 'bar', accountName: 'baz' }),
                error: undefined,
                loaded: true,
                loading: false,
            });
        });
    });
});
