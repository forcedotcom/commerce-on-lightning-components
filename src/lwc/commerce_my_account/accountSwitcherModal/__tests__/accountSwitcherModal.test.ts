import AccountSwitcherModal from 'commerce_my_account/accountSwitcherModal';
import { querySelector, querySelectorAll } from 'kagekiri';
import type AccountSwitcherList from 'commerce_my_account/accountSwitcherList';

const HEADER_LABEL = 'Switch Accounts?';
const DESCRIPTION = 'Switch between your accounts';

const ACCOUNTS_LOAD_SUCCESS_EVENT_NAME = 'accountsloadsuccess';
const ACCOUNTS_LOAD_FAILURE_EVENT_NAME = 'accountsloadfailure';

jest.mock(
    '@salesforce/label/Commerce_My_Account_AccountSwitcherModal.headerLabel',
    () => {
        return {
            default: HEADER_LABEL,
        };
    },
    { virtual: true }
);
jest.mock(
    '@salesforce/label/Commerce_My_Account_AccountSwitcherModal.description',
    () => {
        return {
            default: DESCRIPTION,
        };
    },
    { virtual: true }
);

// Mocking matchMedia for lighting modal
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

Object.defineProperty(window, 'location', {
    writable: true,
    value: {
        assign: jest.fn(),
    },
});

const getModalElement = function (): AccountSwitcherModal & HTMLElement {
    return <AccountSwitcherModal & HTMLElement>querySelector('lightning-modal');
};

describe('commerce_my_account/accountSwitcherModal: AccountSwitcherModal', () => {
    afterEach(() => {
        document.body.firstChild && document.body.removeChild(document.body.firstChild);
    });

    it('should render modal', () => {
        AccountSwitcherModal.open();
        const overLayElem = querySelector('lightning-overlay-container');
        expect(overLayElem).not.toBeNull();
    });

    it('should render modal with default data', () => {
        const defaultModalSize = 'medium';
        AccountSwitcherModal.open();
        const modal = getModalElement();
        expect(modal.size).toBe(defaultModalSize);
        expect(modal.description).toBe(DESCRIPTION);
        expect(querySelector('.slds-modal__title')?.textContent).toBe(HEADER_LABEL);
    });

    it('should render modal with custom data', () => {
        const modalData = {
            size: 'large',
            description: 'testing',
        };
        AccountSwitcherModal.open(modalData);
        const modal = getModalElement();
        expect(modal.size).toBe(modalData.size);
        expect(modal.description).toBe(modalData.description);
    });

    it('should show or hide footer actions based on accounts load status', async () => {
        AccountSwitcherModal.open();
        const accountListElem = querySelector('commerce_my_account-account-switcher-list');
        // Should hide initially
        let footerElem = querySelector('lightning-modal-footer');
        expect(footerElem).toBeFalsy();

        // Should show on failure
        accountListElem?.dispatchEvent(new CustomEvent(ACCOUNTS_LOAD_FAILURE_EVENT_NAME));
        await Promise.resolve();
        footerElem = querySelector('lightning-modal-footer');
        expect(footerElem).toBeTruthy();

        // Should hide on success
        accountListElem?.dispatchEvent(new CustomEvent(ACCOUNTS_LOAD_SUCCESS_EVENT_NAME));
        await Promise.resolve();
        footerElem = querySelector('lightning-modal-footer');
        expect(footerElem).toBeFalsy();
    });

    it('should reload on try again', async () => {
        AccountSwitcherModal.open();
        const accountListElem = <AccountSwitcherList | null>querySelector('commerce_my_account-account-switcher-list');
        const reloadManagedAccountsSpy = accountListElem && jest.spyOn(accountListElem, 'reloadManagedAccounts');
        accountListElem?.dispatchEvent(new CustomEvent(ACCOUNTS_LOAD_FAILURE_EVENT_NAME));
        await Promise.resolve();
        const tryAgainButton = <HTMLButtonElement | null>querySelectorAll('lightning-button')[1];
        tryAgainButton?.click();
        expect(reloadManagedAccountsSpy).toHaveBeenCalled();
    });

    it('should close modal on cancel', async () => {
        const promise = AccountSwitcherModal.open();
        const accountListElem = querySelector('commerce_my_account-account-switcher-list');
        accountListElem?.dispatchEvent(new CustomEvent(ACCOUNTS_LOAD_FAILURE_EVENT_NAME));
        await Promise.resolve();
        const cancelButton = <HTMLButtonElement | null>querySelectorAll('lightning-button')[0];
        cancelButton?.click();
        return expect(promise).resolves.toBe('cancel');
    });

    it('should dispatch accountselected event & close modal on item selects', async () => {
        const accountSelectEventData = {
            detail: {
                accountId: '001RM000004Y1nxYAD',
            },
        };
        const handleAccountSelected = jest.fn((event) => {
            expect(event.detail.accountId).toBe(accountSelectEventData.detail.accountId);
        });
        const promise = AccountSwitcherModal.open();
        const modal = getModalElement();
        modal.addEventListener('accountselect', handleAccountSelected);
        const accountListElem = querySelector('commerce_my_account-account-switcher-list');
        accountListElem?.dispatchEvent(new CustomEvent('accountselect', accountSelectEventData));
        await Promise.resolve();
        expect(handleAccountSelected).toHaveBeenCalled();
        return expect(promise).resolves.toBe('accountselected');
    });

    it('should close modal on close button click', () => {
        const result = AccountSwitcherModal.open();
        const button = querySelector('.slds-modal__close');
        (<HTMLElement | null>button)?.click();
        return expect(result).resolves.toBeUndefined();
    });
});
