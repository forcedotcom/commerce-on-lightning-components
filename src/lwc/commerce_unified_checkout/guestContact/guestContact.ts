import { api, LightningElement, wire } from 'lwc';
import type { LwcCustomEventTargetOf } from 'types/common';
import type { CheckoutInformation, CheckoutSavable } from 'types/unified_checkout';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type { SessionContext } from 'commerce/contextApi';
import { SessionContextAdapter } from 'commerce/contextApi';
import { StencilType } from 'commerce_unified_checkout/stencil';
import { CheckoutGuestEmailAdapter, CheckoutInformationAdapter, updateGuestEmail } from 'commerce/checkoutApi';
import { emailMessageWhenPatternMismatchLabel } from './labels';
import templateEdit from './guestContact.html';
import templateReadonly from './guestContactReadonly.html';
import templateStencil from './guestStencil.html';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';

/**
 * Checkout Guest Contact Email
 */
export default class GuestContact extends LightningElement implements CheckoutSavable {
    public static renderMode = 'light';
    private _email?: string;
    private _showComponent = false;
    private _isReadOnly = false;
    private _checkoutMode: CheckoutMode = CheckoutMode.EDIT;
    private _isFirstLoad = true;
    private _guestStencilItemCount = 2;
    private _showStencil = true;
    private _stencilType: StencilType = StencilType.DEFAULT_STENCIL;

    /**
     * Keeps track if the context is Runtime or Design time (Experience Builder)
     */
    @api builderMode = false;

    /**
     * Disable the input control when checkout mode is disabled.
     *
     * @private
     *
     * @type {boolean}
     */
    private get isDisabled(): boolean {
        return this._checkoutMode === CheckoutMode.DISABLED;
    }

    private get showStencil(): boolean {
        return !this.builderMode && this.showComponent && this._showStencil;
    }

    @wire(SessionContextAdapter)
    private sessionHandler(response: StoreAdapterCallbackEntry<SessionContext>): void {
        if (!this.builderMode && response.data) {
            this._showComponent = !response.data.isLoggedIn;
        }
    }

    /**
     * Retrieves guest email info value from store
     */
    @wire(CheckoutGuestEmailAdapter)
    private checkoutGuestEmailHandler(response: StoreAdapterCallbackEntry<string>): void {
        if (this.showComponent) {
            this._email = response?.data || '';
        }
    }

    /**
     * Retrieves guest email info value from checkout response in the store
     */
    @wire(CheckoutInformationAdapter)
    checkoutAdapterHandler(response: StoreAdapterCallbackEntry<CheckoutInformation>): void {
        if (!this.builderMode && response?.data && !response.loading) {
            if (this.showComponent && !this._email && this._isFirstLoad) {
                this._email = response?.data?.contactInfo?.email || '';
                this._showStencil = !response.loaded;
                this._isFirstLoad = false;
            }
        }
    }

    /**
     * Email field label
     */
    @api public emailLabel: string | undefined;

    /**
     * Email field error message when pattern is mismatched
     */
    private emailMessageWhenPatternMismatchLabel: string | undefined = emailMessageWhenPatternMismatchLabel;

    /**
     * Default for whether to show or hide the component
     */
    @api
    public get showComponent(): boolean {
        return this._showComponent;
    }

    public set showComponent(showComponent: boolean) {
        this._showComponent = showComponent;
    }

    /**
     * Returns true if the element's value is valid.
     *
     * @type {boolean}
     */
    @api
    public get checkValidity(): boolean {
        return !this._showComponent || this.getEmailInputElement()?.checkValidity();
    }

    /**
     * Call reportValidity on the lightning input component.
     *
     * @return {boolean}
     */
    @api
    public reportValidity(): boolean {
        return !this.showComponent || this.getEmailInputElement()?.reportValidity();
    }

    /**
     * Returns true if the element's is readonly.
     *
     * @type {boolean}
     */
    @api
    get readOnly(): boolean {
        return this._isReadOnly;
    }
    set readOnly(value: boolean) {
        this._isReadOnly = value;
    }

    /**
     * The guest email address.
     *
     * @type {string | undefined}
     */
    @api
    public get email(): string | undefined {
        return this._email;
    }

    public set email(value: string | undefined) {
        this._email = value;
    }

    /**
     * Access to the lighting input component.
     *
     * @private
     *
     * @returns {HTMLInputElement} the lighting input component
     */
    private getEmailInputElement(): HTMLInputElement {
        return <HTMLInputElement>this.querySelector('[data-guest-email]');
    }

    /**
     * Focuses on the email field if it is invalid
     */
    @api
    public focus(): void {
        this.getEmailInputElement().focus();
    }

    /**
     * @fires CheckoutInputAddress#change
     */
    private handleEmailChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        event.target.value = event.target.value.trim();
        this._email = event.target.value;
        if (this.checkValidity) {
            // Emit event to step when ready. checkout save can happen in step
            this.dispatchEvent(new CustomEvent('dataready', { bubbles: true, composed: true }));
        }
    }

    /**
     * This method called when user clicks on "Next" button for this step.
     * Reject promise if data is invalid, thus short-circuiting checkout.ts#proceedToNextStep
     * TODO: update email contact in the data store
     */
    @api
    public async checkoutSave(): Promise<void> {
        if (this.showComponent) {
            if (!this.reportValidity()) {
                return Promise.reject('email not valid');
            }
            await updateGuestEmail(this.email);
        }

        return Promise.resolve();
    }

    /**
     * The current checkout mode for this component
     *
     * @type {CheckoutMode}
     */
    @api public get checkoutMode(): CheckoutMode {
        return this._checkoutMode;
    }

    set checkoutMode(value: CheckoutMode) {
        this._checkoutMode = value;
        this._isReadOnly = value === CheckoutMode.SUMMARY;
    }

    /**
     * Render the readonly template or the edit template.
     */
    render(): HTMLElement {
        if (this.showStencil) {
            return templateStencil;
        }
        return this.readOnly ? templateReadonly : templateEdit;
    }
}
