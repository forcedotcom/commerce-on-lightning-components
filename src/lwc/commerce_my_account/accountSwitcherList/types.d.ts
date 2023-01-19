import type { ManagedAccount as ManagedAccountData } from 'commerce/effectiveAccountApi';

export interface ManagedAccountWithSelectedData extends ManagedAccountData {
    selected: boolean;
}
