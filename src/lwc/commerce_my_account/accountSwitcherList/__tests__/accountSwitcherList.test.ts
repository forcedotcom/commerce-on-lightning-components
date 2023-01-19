import { createElement } from 'lwc';
import AccountSwitcherList from 'commerce_my_account/accountSwitcherList';
import { ManagedAccountsAdapter, loadEffectiveAccounts, effectiveAccount } from 'commerce/effectiveAccountApi';

import type AccountSwitcherListRecord from 'commerce_my_account/accountSwitcherListRecord';
import type PageLevelErrorMessage from 'commerce/pageLevelErrorMessage';
import type LightningSpinner from 'lightning/spinner';
import type { TestWireAdapter } from 'types/testing';

import {
    mockedCurrentUserDefaultAccountId,
    mockedManagedAccounts,
    mockedResponseWithData,
    mockedResponseWithError,
    mockedResponseWithLoading,
    mockedResponseWithNoData,
    mockedSelectedAccountId,
} from './data/managedAccountsData';

const ERROR_DESCRIPTION = 'Try again or contact your system admin.';
const ERROR_HEADING = 'Try again or contact your system admin.';
const SPINNER_ALT_TEXT = 'Loading Accounts';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock(
    '@salesforce/label/Commerce_My_Account_AccountSwitcherList.errorDescription',
    () => {
        return {
            default: ERROR_DESCRIPTION,
        };
    },
    { virtual: true }
);
jest.mock(
    '@salesforce/label/Commerce_My_Account_AccountSwitcherList.errorHeading',
    () => {
        return {
            default: ERROR_HEADING,
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/Commerce_My_Account_AccountSwitcherList.spinnerAltText',
    () => {
        return {
            default: SPINNER_ALT_TEXT,
        };
    },
    { virtual: true }
);

jest.mock('commerce/effectiveAccountApi', () =>
    Object.assign({}, jest.requireActual('commerce/effectiveAccountApi'), {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        ManagedAccountsAdapter: require('@salesforce/wire-service-jest-util').createTestWireAdapter(),
        loadEffectiveAccounts: jest.fn(),
    })
);

const managedAccountsAdapter = <typeof ManagedAccountsAdapter & typeof TestWireAdapter>ManagedAccountsAdapter;

describe('commerce_my_account/accountSwitcherList: AccountSwitcherList', () => {
    let element: AccountSwitcherList & HTMLElement;
    beforeEach(() => {
        element = createElement('commerce_my_account-account-switcher-list-record', { is: AccountSwitcherList });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should show loader while data is loading', async () => {
        managedAccountsAdapter.emit(mockedResponseWithLoading);
        await Promise.resolve();
        const spinnerElement: (HTMLElement & LightningSpinner) | null = element.querySelector('lightning-spinner');
        expect(spinnerElement?.alternativeText).toBe(SPINNER_ALT_TEXT);
        expect(spinnerElement?.variant).toBe('brand');
    });

    it('should not load list if no data in response', async () => {
        managedAccountsAdapter.emit(mockedResponseWithNoData);
        await Promise.resolve();
        const accountElems = element.querySelectorAll('commerce_my_account-account-switcher-list-record');
        expect(accountElems).toHaveLength(0);
    });

    it('should load accounts & dispatch accountsloadsuccess event', async () => {
        const accountsLoadSuccessHandler = jest.fn();
        element.addEventListener('accountsloadsuccess', accountsLoadSuccessHandler);
        managedAccountsAdapter.emit(mockedResponseWithData);
        await Promise.resolve();
        const accountElems = element.querySelectorAll('commerce_my_account-account-switcher-list-record');
        expect(accountElems).toHaveLength(mockedManagedAccounts.length);
        expect(accountsLoadSuccessHandler).toHaveBeenCalled();
    });

    it('current effectiveAccountId should be first element, user default account if effectiveAccountId is null in session storage', async () => {
        managedAccountsAdapter.emit(mockedResponseWithData);
        await Promise.resolve();
        expect(effectiveAccount.accountId).toBeFalsy();
        const accountElem: (HTMLElement & AccountSwitcherListRecord) | null = element.querySelector(
            'commerce_my_account-account-switcher-list-record'
        );
        expect(accountElem?.accountId).toBe(mockedCurrentUserDefaultAccountId);
        expect(accountElem?.selected).toBe(true);
    });

    it('should dispatch event on account click', async () => {
        const onAccountSwitch = jest.fn((event) => {
            expect(event.detail.accountId).toBe(mockedSelectedAccountId);
        });
        element.addEventListener('accountselect', onAccountSwitch);

        managedAccountsAdapter.emit(mockedResponseWithData);
        await Promise.resolve();
        expect(effectiveAccount.accountId).toBeFalsy();
        const accountAElems = element.querySelectorAll('commerce_my_account-account-switcher-list-record a');
        (<HTMLElement | null>[...accountAElems].pop())?.click();
        await Promise.resolve();
        expect(onAccountSwitch).toHaveBeenCalled();
    });

    it('should load error message & dispatch accountsloadfailure event', async () => {
        const accountsLoadFailureHandler = jest.fn();
        element.addEventListener('accountsloadfailure', accountsLoadFailureHandler);
        managedAccountsAdapter.emit(mockedResponseWithError);
        await Promise.resolve();
        const errorElem: (HTMLElement & PageLevelErrorMessage) | null = element.querySelector(
            'commerce-page-level-error-message'
        );
        expect(errorElem).toBeTruthy();
        expect(errorElem?.errorDescription).toBe(ERROR_DESCRIPTION);
        expect(errorElem?.errorHeading).toBe(ERROR_HEADING);
        expect(accountsLoadFailureHandler).toHaveBeenCalled();
    });

    it('should dispatch store event on reload', async () => {
        managedAccountsAdapter.emit(mockedResponseWithError);
        await Promise.resolve();
        element.reloadManagedAccounts();
        expect(loadEffectiveAccounts).toHaveBeenCalled();
    });
});
