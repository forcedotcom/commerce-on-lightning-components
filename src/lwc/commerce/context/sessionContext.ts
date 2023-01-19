import type { Action, Adapter, State, StoreAdapterCallbackHandler, Unsubscribable } from 'experience/store';
import { getStoreAdapterValue, Store, StoreAdapter } from 'experience/store';
import { effectiveAccount } from 'commerce/effectiveAccountApi';
import type { SessionContext, SessionContextData, SessionContextStore } from './types';
import { toSessionContext } from './util';
import { readSessionContext } from './sessionContextDataSource';

const ACTION_EFFECTIVEACCOUNT_UPDATE = 'updateEffectiveAccount';
let effectiveAccountSubscription: Unsubscribable;

function effectiveAccountConnector(adapter: Adapter<SessionContextStore>): void {
    adapter.subscribeAction(ACTION_EFFECTIVEACCOUNT_UPDATE, {
        before: ({ payload }: Action<{ id: string; name?: string }>, state: State<SessionContextStore>) => {
            state.update(
                'context',
                (context: SessionContext | Error | undefined): SessionContext | Error | undefined => {
                    return {
                        ...(<SessionContext>context),
                        effectiveAccountId: payload?.id,
                        effectiveAccountName: payload?.name,
                    };
                }
            );
        },
    });
}

export const sessionContextStore = new Store<SessionContextStore>('@@SessionContext', {
    actions: {
        [ACTION_EFFECTIVEACCOUNT_UPDATE]: (): void => undefined,
    },
});

function loadSessionContext(): Promise<SessionContext> {
    // Store references to the current effective account ID and name
    let accountId: string | undefined | null;
    let accountName: string | undefined | null;

    return readSessionContext()
        .then((data: SessionContextData) => {
            // Read existing information from the `effectiveAccount` module
            ({ accountId, accountName } = effectiveAccount);

            // In case some effective account data is already available, make sure it takes
            // precedence over the data we just loaded from the session context API endpoint
            return toSessionContext({
                ...data,
                ...(accountId ? { accountId } : {}),
                ...(accountName ? { accountName } : {}),
            });
        })
        .finally(() => {
            // Subscribe to updates of the effective account data
            effectiveAccountSubscription && effectiveAccountSubscription.unsubscribe();
            effectiveAccountSubscription = effectiveAccount.subscribe(
                ({ payload }: Action<{ accountId: string | undefined; accountName: string | undefined }>) => {
                    const effectiveAccountId = payload?.accountId;
                    if (effectiveAccountId && effectiveAccountId !== accountId) {
                        // Update current effective account ID and name references
                        accountId = effectiveAccountId;
                        accountName = payload?.accountName;

                        // Dispatch update action
                        sessionContextStore.dispatch(ACTION_EFFECTIVEACCOUNT_UPDATE, {
                            id: accountId,
                            name: accountName,
                        });
                    }
                }
            );
        });
}

export class SessionContextAdapter extends StoreAdapter<SessionContextStore> {
    constructor(dataCallback: StoreAdapterCallbackHandler<SessionContext>) {
        super(dataCallback, sessionContextStore, 'context', {
            loader: loadSessionContext,
            connectors: [effectiveAccountConnector],
        });
    }
}

export function getSessionContext(): Promise<SessionContext> {
    return getStoreAdapterValue(SessionContextAdapter);
}
