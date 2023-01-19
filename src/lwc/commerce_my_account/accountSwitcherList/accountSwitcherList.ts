import { api, LightningElement, wire } from 'lwc';
import { ManagedAccountsAdapter, loadEffectiveAccounts, effectiveAccount } from 'commerce/effectiveAccountApi';

import { getUserDefaultAccount, moveSelectedAccountToTop, updateSelectedStatus } from './managedAccountsUtils';

import type { ManagedAccount as ManagedAccountData, ManagedAccountsRequestOption } from 'commerce/effectiveAccountApi';
import type { ManagedAccountWithSelectedData } from './types';

import { errorActionLabel, errorDescription, errorHeading, spinnerAltText } from './labels';

const MANAGED_ACCOUNTS_REQUEST_OPTIONS: ManagedAccountsRequestOption = { includeMyAccount: true };
const ACCOUNTS_LOAD_SUCCESS_EVENT_NAME = 'accountsloadsuccess';
const ACCOUNTS_LOAD_FAILURE_EVENT_NAME = 'accountsloadfailure';
const LABELS = {
    errorActionLabel,
    errorDescription,
    errorHeading,
    spinnerAltText,
};

export default class AccountSwitcherList extends LightningElement {
    private static renderMode = 'light';
    private userDefaultAccount: string | undefined;

    /**
     * Stores current effective id which will be shown as selected in UI
     */
    effectiveAccountId = '';

    /**
     * To show or hide the spinner / loader
     */
    isLoading = true;

    /**
     * List of available managed accounts
     */
    managedAccounts: ManagedAccountWithSelectedData[] = [];

    hasError = false;

    @api
    reloadManagedAccounts(): void {
        loadEffectiveAccounts(MANAGED_ACCOUNTS_REQUEST_OPTIONS);
    }

    @wire(ManagedAccountsAdapter, { ...MANAGED_ACCOUNTS_REQUEST_OPTIONS })
    getManagedAccountsData({
        error,
        data = [],
        loading,
    }: {
        error: unknown;
        data: ManagedAccountData[];
        loading: boolean;
    }): void {
        this.hasError = Boolean(error);
        this.effectiveAccountId = effectiveAccount.accountId || getUserDefaultAccount(data) || '';
        this.managedAccounts = moveSelectedAccountToTop(updateSelectedStatus(data, this.effectiveAccountId));
        if (this.hasError) {
            this.dispatchAccountsLoadStatusEvent(ACCOUNTS_LOAD_FAILURE_EVENT_NAME);
        } else if (!loading) {
            this.dispatchAccountsLoadStatusEvent(ACCOUNTS_LOAD_SUCCESS_EVENT_NAME);
        }
        this.isLoading = loading;
    }

    get labels(): typeof LABELS {
        return LABELS;
    }

    get hasManagedAccounts(): boolean {
        return !!this.managedAccounts.length;
    }

    handleAccountSelect(e: CustomEvent): void {
        this.isLoading = true;
        this.effectiveAccountId = e.detail.accountId;
        this.managedAccounts = updateSelectedStatus(this.managedAccounts, this.effectiveAccountId);
        this.dispatchEvent(
            new CustomEvent('accountselect', {
                detail: e.detail,
            })
        );
        this.isLoading = false;
    }

    dispatchAccountsLoadStatusEvent(eventName: string): void {
        this.dispatchEvent(new CustomEvent(eventName));
    }
}
