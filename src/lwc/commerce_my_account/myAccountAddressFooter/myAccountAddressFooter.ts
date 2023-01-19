import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import type { LightningNavigationContext } from 'types/common';
import { deleteMyAccountAddress } from 'commerce/myAccountApi';
import {
    CancelLabel,
    DeleteLabel,
    DeleteAddressHeaderText,
    DeleteAddressText,
    AriaEditLabel,
    AriaDeleteLabel,
} from './labels';
import { getErrorInfo } from 'commerce_my_account/errorHandler';
import type { SessionContext } from 'commerce/contextApi';
import { SessionContextAdapter } from 'commerce/contextApi';
import type { StoreAdapterCallbackEntry } from 'experience-components/dist/lwc/experience/store/types';

export default class MyAccountAddressFooter extends LightningElement {
    public static renderMode = 'light';

    @wire(NavigationContext)
    private navContext!: LightningNavigationContext;

    /**
     * Gets or Sets the label of the edit button
     *
     * @type {String}
     */
    @api editLabel: string | undefined;

    /**
     * Gets or Sets the label of the delete button
     *
     * @type {String}
     */
    @api deleteLabel: string | undefined;

    /**
     * Gets or Sets the address Id of address under action
     *
     */
    @api addressId = '';

    /**
     * Gets or Sets the footer button disable
     *
     */
    @api disable = false;
    /**
     * Gets or Sets the address name of address under action
     */
    @api addressName = '';

    private isPreviewMode = false;

    private _showPageSpinner = false;

    /**
     * property which tells builder mode view or runtime
     */
    @wire(SessionContextAdapter)
    updateSessionContext({ data }: StoreAdapterCallbackEntry<SessionContext>): void {
        this.isPreviewMode = data?.isPreview === true;
    }

    /**
     * Gets the labels for delete address
     *
     */
    private get labels(): Record<string, string | undefined> {
        return {
            cancelLabel: CancelLabel,
            deleteLabel: DeleteLabel,
            confirmDeleteAddressHeaderText: DeleteAddressHeaderText,
            confirmDeleteAddressText: DeleteAddressText,
        };
    }

    private get deleteModal(): HTMLDialogElement {
        return <HTMLDialogElement>this.querySelector('lightning-dialog');
    }
    private closeModal(): void {
        // eslint-disable-next-line
        (this.deleteModal as any).close();
    }

    private async handleConfirmDeleteAddress(): Promise<void> {
        try {
            this._showPageSpinner = true;
            await deleteMyAccountAddress(this.addressId);
        } catch (e) {
            this.dispatchEvent(
                new CustomEvent('addresserror', {
                    bubbles: true,
                    composed: true,
                    cancelable: false,
                    detail: {
                        value: getErrorInfo(e, this.isPreviewMode),
                    },
                })
            );
        } finally {
            this._showPageSpinner = false;
        }
        this.closeModal();
    }
    private handleDeleteAddressClick(): void {
        // eslint-disable-next-line
        (this.deleteModal as any).showModal();
    }

    private handleEditAddressClick(): void {
        navigate(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Address_Form',
            },
            state: {
                addressId: this.addressId,
            },
        });
    }

    /**
     * Getting the edit label tag to be read out as edit label plus address name.
     */
    private get ariaEditLabel(): string {
        return AriaEditLabel.replace('{editLabel}', `${this.editLabel}`).replace(
            '{addressName}',
            `${this.addressName}`
        );
    }

    /**
     * Getting the delete label tag to be read out as delete label plus address name.
     */
    private get ariaDeleteLabel(): string {
        return AriaDeleteLabel.replace('{deleteLabel}', `${this.deleteLabel}`).replace(
            '{addressName}',
            `${this.addressName}`
        );
    }

    /**
     * Put the focus on this component's edit link.
     */
    @api focusCell(): void {
        this.querySelector<HTMLElement>('[data-edit-address]')?.focus();
    }
}
