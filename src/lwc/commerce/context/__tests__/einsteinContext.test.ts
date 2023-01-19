import type { EinsteinContext } from '../types';
import type { Store } from 'experience/store';
import { serializeError } from 'experience/store';
import { einsteinContextResponse } from './mockDataHelpers';
import { appContextDataStore, appContextStore, internalContextStore } from '../appContext';
import { sessionContextStore } from '../sessionContext';
import { EinsteinContextAdapter, einsteinContextStore, getEinsteinContext } from '../einsteinContext';
// eslint-disable-next-line jest/no-mocks-import
import { fetchService } from 'experience/data';
import { readEinsteinContext } from '../einsteinContextDataSource';

jest.mock('experience/data', () =>
    Object.assign({}, jest.requireActual('experience/data'), {
        fetchService: jest.fn(),
    })
);

function clearContextStores(): void {
    [appContextDataStore, appContextStore, sessionContextStore, internalContextStore, einsteinContextStore].forEach(
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

    describe('getEinsteinContext()', () => {
        it('should not throw if the data is not set', async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(Promise.resolve(null));

            const einsteinContext = <EinsteinContext>await getEinsteinContext();

            expect(einsteinContext).toMatchObject({
                activityTrackingEnabled: false,
                host: undefined,
                siteId: undefined,
                tenant: undefined,
                isDeployed: false,
                catalogExists: false,
                deploymentEnabled: false,
            });
        });

        it('should provide methods for access to some of the properties', async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(einsteinContextResponse());

            const einsteinContext = <EinsteinContext>await getEinsteinContext();

            expect(einsteinContext).toMatchObject({
                activityTrackingEnabled: true,
                host: 'https://staging.ai.example.com',
                siteId: '0ZER00000004baJOAQ',
                tenant: 'core/hello/000xx0000001234567',
                isDeployed: true,
                catalogExists: true,
                deploymentEnabled: true,
            });
        });

        it('returns exception after unsuccessful fetch', async () => {
            (<jest.Mock>fetchService).mockRejectedValueOnce(
                new Response(null, { status: 500, statusText: 'Error while accessing Einstein context' })
            );
            expect.assertions(1);
            return readEinsteinContext().catch((ex: Error) => {
                expect(ex.message).toBe('Error while accessing Einstein context');
            });
        });

        it('should not re-fetch on a second call to getPromise', async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(einsteinContextResponse());

            await getEinsteinContext();
            expect(fetchService).toHaveBeenCalledTimes(1); // One for the app context and the second for the Einstein context
            await getEinsteinContext();
            expect(fetchService).toHaveBeenCalledTimes(1);
        });

        it('should throw an error when the fetch request fails', async () => {
            (<jest.Mock>fetchService).mockRejectedValue({ status: 500, statusText: 'foo' });
            await expect(getEinsteinContext()).rejects.toThrow('foo');
        });

        it('should throw an error when the stored value represents an error', async () => {
            einsteinContextStore.set(<never>{
                '{}:{}': {
                    data: undefined,
                    error: serializeError(new Error('foo')),
                    loaded: true,
                    loading: false,
                },
            });
            await expect(getEinsteinContext()).rejects.toThrow('foo');
        });
    });

    describe('EinsteinContextAdapter', () => {
        it('should load the context', async () => {
            (<jest.Mock>fetchService).mockResolvedValueOnce(einsteinContextResponse());

            const dataCallback = jest.fn();
            const adapter = new EinsteinContextAdapter(dataCallback);
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
                        activityTrackingEnabled: true,
                        host: 'https://staging.ai.example.com',
                        siteId: '0ZER00000004baJOAQ',
                        tenant: 'core/hello/000xx0000001234567',
                        catalogExists: true,
                        isDeployed: true,
                        deploymentEnabled: true,
                    },
                    error: undefined,
                    loaded: true,
                    loading: false,
                },
            ]);
        });

        it('should use the available context data', async () => {
            einsteinContextStore.set(<never>{
                '{}:{}': {
                    data: { siteId: '0ZER00000004baJOAQ' },
                    error: undefined,
                    loaded: true,
                    loading: false,
                },
            });

            const dataCallback = jest.fn();
            const adapter = new EinsteinContextAdapter(dataCallback);
            adapter.update({});
            adapter.connect();
            expect(fetchService).toHaveBeenCalledTimes(0);
            expect(dataCallback).toHaveBeenCalledTimes(1);
            expect(dataCallback).toHaveBeenLastCalledWith({
                data: { siteId: '0ZER00000004baJOAQ' },
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
