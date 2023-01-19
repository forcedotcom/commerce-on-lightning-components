import { getUserDefaultAccount, moveSelectedAccountToTop, updateSelectedStatus } from '../managedAccountsUtils';
import { mockedCurrentUserDefaultAccountId, mockedManagedAccounts } from './data/managedAccountsData';

describe('commerce_my_account/accountSwitcherList: managedAccountsUtils', () => {
    it('should get user default account id', () => {
        expect(getUserDefaultAccount(mockedManagedAccounts)).toBe(mockedCurrentUserDefaultAccountId);
    });
    it('should add selected flag to account', () => {
        const managedAccountsWithSelectedStatus = updateSelectedStatus(
            mockedManagedAccounts,
            mockedCurrentUserDefaultAccountId
        );
        let selectedItemCount = 0;
        managedAccountsWithSelectedStatus.forEach((managedAccount) => {
            managedAccount.selected && selectedItemCount++;
            expect(managedAccount).toHaveProperty('selected');
        });
        expect(selectedItemCount).toBe(1);
    });
    it('should move selected account to top', () => {
        const managedAccountsWithSelectedStatus = updateSelectedStatus(
            mockedManagedAccounts,
            mockedCurrentUserDefaultAccountId
        );
        expect(managedAccountsWithSelectedStatus[0].id).not.toBe(mockedCurrentUserDefaultAccountId);
        const orderedManagedAccounts = moveSelectedAccountToTop(managedAccountsWithSelectedStatus);
        expect(orderedManagedAccounts[0].id).toBe(mockedCurrentUserDefaultAccountId);
    });
});
