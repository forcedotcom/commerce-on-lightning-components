import LightningModal from 'lightning/modal';
import type AccountSwitcherList from 'commerce_my_account/accountSwitcherList';
import { cancelActionLabel, description, headerLabel, tryAgainActionLabel } from './labels';

const LABELS = {
    cancelActionLabel,
    description,
    headerLabel,
    tryAgainActionLabel,
};
const MODAL_SIZE = 'medium';

export default class AccountSwitcherModal extends LightningModal {
    showAccountsLoadFailureActions = false;

    static open(props?: Record<string, string>): Promise<string> {
        return super.open({
            description: LABELS.description,
            size: MODAL_SIZE,
            ...(props || {}),
        });
    }

    get labels(): typeof LABELS {
        return LABELS;
    }

    handleAccountSelect(e: CustomEvent): void {
        this.dispatchEvent(
            new CustomEvent('accountselect', {
                detail: e.detail,
            })
        );
        this.closeModal('accountselected');
    }

    handleAccountsLoadSuccess(): void {
        this.showAccountsLoadFailureActions = false;
    }

    handleAccountsLoadFailure(): void {
        this.showAccountsLoadFailureActions = true;
    }

    handleTryAgain(): void {
        const accountListComp = <AccountSwitcherList | null>(
            this.template.querySelector('commerce_my_account-account-switcher-list')
        );
        accountListComp?.reloadManagedAccounts();
    }

    handleCancel(): void {
        this.closeModal('cancel');
    }

    closeModal(closeMessage: string): void {
        this.close(closeMessage);
    }
}
