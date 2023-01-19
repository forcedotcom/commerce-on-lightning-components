import { api, LightningElement, track, wire } from 'lwc';
import type { SessionContext } from 'commerce/contextApi';
import { SessionContextAdapter } from 'commerce/contextApi';
import type { Address, ContactInfo, CheckoutInformation } from 'types/unified_checkout';
import type InputAddress from '../inputAddress/inputAddress';
import type { CssClassname, LwcCustomEventTargetOf } from 'types/common';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import { CheckoutInformationAdapter } from 'commerce/checkoutApi';

const DEFAULT_ADDRESS: Address = {
    city: '',
    country: '',
    isDefault: false,
    firstName: '',
    lastName: '',
    name: '',
    postalCode: '',
    region: '',
    street: '',
};

const DEFAULTCONTACTINFO: ContactInfo = {
    phoneNumber: '',
};

export default class BillingAddressGroup extends LightningElement {
    public static renderMode = 'light';

    @track private contactInfo: ContactInfo = DEFAULTCONTACTINFO;
    private _shippingAddress!: Address;
    private _billingAddress!: Address;
    private _hideBilling = false;
    private _showAllCountries = true;

    private _isLoggedIn = false;
    private _address = DEFAULT_ADDRESS;

    /**
     * Keeps track if the context is Runtime or Design time (Experience Builder)
     */
    @api builderMode = false;

    /**
     * Label for the "use same address" option.
     * @type {string}
     */
    @api public labelSameAsShippingOption: string | undefined;
    @api public showBillingAddressHeading!: boolean;
    @api public billingAddressHeadingLabel: string | undefined;
    @api public phoneNumberLabel: string | undefined;
    @api public phoneNumberPlaceholderText: string | undefined;

    @wire(SessionContextAdapter)
    private sessionHandler(response: StoreAdapterCallbackEntry<SessionContext>): void {
        if (!this.builderMode && response.data) {
            this._isLoggedIn = response.data.isLoggedIn;
        }
    }

    @wire(CheckoutInformationAdapter)
    checkoutAdapterHandler(response: StoreAdapterCallbackEntry<CheckoutInformation>): void {
        if (!this.builderMode && response?.data && !response.loading) {
            this._shippingAddress = this.getShippingAddress(response?.data);

            if (this.isGuestUser) {
                this.contactInfo = {
                    ...this.contactInfo,
                    phoneNumber: response?.data?.contactInfo?.phoneNumber || '',
                };
            }
        }
    }

    private get isGuestUser(): boolean {
        return !this._isLoggedIn;
    }

    public renderedCallback(): void {
        // when clicking on the step button, the component will be re-rendered
        // this will make sure it keeps the previous form display state
        this._hideBilling = this.addressCheckboxComponent.checked;
    }

    @api
    public reportValidity(): boolean {
        // If using a billing address instead of shipping address report billing address form validity
        if (!this.addressCheckboxComponent.checked) {
            return this.billingAddressComponent.reportValidity();
        }

        // Report billing option as valid when using shipping address
        return true;
    }

    @api
    public focus(): void {
        // Out of date LWC type definitions, the property indeed exists
        // @ts-ignore
        if (this.isConnected) {
            this.addressCheckboxComponent.focus();
        }
    }

    @api
    public get shippingAddress(): Address {
        return this._shippingAddress;
    }

    public set shippingAddress(value: Address) {
        this._shippingAddress = value;
    }

    @api
    public get billingAddress(): Address {
        return this.billingAddressComponent.address;
    }

    public set billingAddress(value: Address) {
        this._billingAddress = value;
    }

    @api
    public get billingAddressComponent(): InputAddress {
        return <InputAddress>(<unknown>this.querySelector('[data-billing-input-address]'));
    }

    private get addressCheckboxComponent(): HTMLInputElement {
        return <HTMLInputElement>this.querySelector('[data-use-same-shipping-address]');
    }

    private get billingAddressClasses(): CssClassname {
        return this._hideBilling ? 'slds-hide' : undefined;
    }

    private handleAddressChange(event: LwcCustomEventTargetOf<InputAddress>): void {
        this._billingAddress = event.target.address;
    }

    private handleBillingAddressOptionChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        this._hideBilling = event.target.checked;

        if (!this._hideBilling) {
            this.billingAddressComponent.address = this.billingAddress;
        }

        // Always fire an event when changing the billing address option
        this.dispatchEvent(
            new CustomEvent('changebillingaddressoption', {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    checked: event.target.checked,
                },
            })
        );
    }

    private getShippingAddress(checkoutInformation: CheckoutInformation): Address {
        let shippingAddress: Address = DEFAULT_ADDRESS;
        // Read address && delivery groups
        const deliveryAddress = checkoutInformation?.deliveryGroups?.items[0]?.deliveryAddress;
        if (deliveryAddress) {
            shippingAddress = deliveryAddress;
        }
        return shippingAddress;
    }
}
