import type { ManagedAccount as ManagedAccountData } from 'commerce/effectiveAccountApi';
import type { ManagedAccountWithSelectedData } from './types';

export function getUserDefaultAccount(managedAccounts: ManagedAccountData[]): string | undefined {
    return managedAccounts.find((managedAccount) => managedAccount.isCurrentUserDefaultAccount)?.id;
}

/**
 * Moving selected account to top of the list
 */
export function moveSelectedAccountToTop(
    managedAccounts: ManagedAccountWithSelectedData[]
): ManagedAccountWithSelectedData[] {
    const orderedManagedAccounts = managedAccounts.slice(0);
    const selectedAccountIndex = orderedManagedAccounts.findIndex((managedAccount) => managedAccount.selected);
    if (selectedAccountIndex !== -1 && selectedAccountIndex !== 0) {
        const selectedAccount = orderedManagedAccounts.splice(selectedAccountIndex, 1)[0];
        orderedManagedAccounts.unshift(selectedAccount);
    }
    return orderedManagedAccounts;
}

export function updateSelectedStatus(
    managedAccounts: ManagedAccountData[],
    selectedAccountId: string
): ManagedAccountWithSelectedData[] {
    return managedAccounts.map((managedAccount) => {
        return {
            ...managedAccount,
            selected: managedAccount.id === selectedAccountId,
        };
    });
}
