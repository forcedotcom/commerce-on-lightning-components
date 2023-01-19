import { api, LightningElement, wire } from 'lwc';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type {
    CommerceAddressFormPageReference,
    LabelValuePair,
    LightningInputAddressChangeEvent,
    LwcCustomEventTargetOf,
} from 'types/common';
import type { AppContext, SessionContext } from 'commerce/contextApi';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import {
    ShippingLabel,
    BillingLabel,
    FirstNameLabel,
    LastNameLabel,
    AddressTypeLabel,
    AddressTypePlaceHolderLabel,
    CompanyNameLabel,
    CountryLabel,
    CityLabel,
    StreetLabel,
    ProvinceLabel,
    PostalCodeLabel,
} from './labels';
import { navigate, NavigationContext, CurrentPageReference } from 'lightning/navigation';
import type { LightningNavigationContext } from 'types/common';
import { createMyAccountAddress, updateMyAccountAddress } from 'commerce/myAccountApi';
import {
    getShipToCountries,
    getCountryStates,
    isLastNameFirstCountry,
    getCustomLocale,
    getAllCountries,
} from 'commerce_unified_checkout/internationalization';
import { MyAccountAddressDetailAdapter } from 'commerce/myAccountApi';
import type { MyAccountAddressInput, MyAccountAddressDetailResponse, MyAccountAddress } from 'commerce/myAccountApi';
import { getErrorInfo } from 'commerce_my_account/errorHandler';

type AddressName = string | undefined;
type Street = string | undefined;
type City = string | undefined;
type PostalCode = string | undefined;
type CountryCode = string | undefined;
type Province = string | undefined;
type IsDefaultAddress = boolean;
type AddressType = string;

const DEFAULTS = {
    shipping: 'Shipping',
};
/**
 * @slot actionButtons ({ locked: true, defaultContent: [{ descriptor: "commerce_builder/actionButtons", attributes: {firstActionButtonText: "Cancel", secondActionButtonText: "Save"} }] })
 * Represents an address with an associated full name.
 */
export default class MyAccountInputAddress extends LightningElement {
    public static renderMode = 'light';
    private _firstName: AddressName = '';
    private _lastName: AddressName = '';
    private _addressType: AddressType = '';
    private _street: Street = '';
    private _city: City = '';
    private _country: CountryCode = '';
    private _province: Province = '';
    private _postalCode: PostalCode = '';
    private _isDefaultAddress: IsDefaultAddress = false;
    private _addressId = '';
    private _address: MyAccountAddress | undefined;
    private _showAddressForm = false;
    private _showDiffAddressTypes = true;
    private _errorMessage = '';
    private isPreview = false;
    private _showPageSpinner = false;
    private _cancelErrorListener = (): void => this.handleCloseAddressFormClicked();
    private _saveErrorListener = (): Promise<void> => this.handleSaveAddressFormClicked();

    public connectedCallback(): void {
        this.addEventListener('firstaction', this._cancelErrorListener);
        this.addEventListener('secondaction', this._saveErrorListener);
    }

    public disconnectedCallback(): void {
        this.removeEventListener('firstaction', this._cancelErrorListener);
        this.removeEventListener('secondaction', this._saveErrorListener);
    }
    @wire(NavigationContext)
    private navContext!: LightningNavigationContext;

    /**
     * property which tells builder mode view or runtime
     */
    @wire(SessionContextAdapter)
    updateSessionContext({ data }: StoreAdapterCallbackEntry<SessionContext>): void {
        this.isPreview = data?.isPreview === true;
    }

    /**
     * Get the current page reference to extract query parameter "orderNumber"
     */
    @wire(CurrentPageReference)
    private pageRef?: CommerceAddressFormPageReference;

    @wire(MyAccountAddressDetailAdapter, {
        addressId: '$addressId',
    })
    AddressDetailHandler(response: StoreAdapterCallbackEntry<MyAccountAddressDetailResponse>): void {
        if (response?.data?.items) {
            this._address = response.data.items[0];
            this.setEditAddress(this._address);
            this._showAddressForm = true;
        }
        if (response?.error) {
            this._errorMessage = getErrorInfo(response?.error, this.isPreview);
        }
    }

    /**
     * the text that is displayed for component header for a new address.
     */
    @api public componentHeaderNewAddressLabel: string | undefined;

    /**
     * the text that is displayed for component header for an existing address.
     */
    @api public componentHeaderEditAddressLabel: string | undefined;

    /**
     * the text that is displayed for default address checkbox.
     */
    @api public makeDefaultAddressLabel: string | undefined;

    /**
     * Show Component Header
     */
    @api public showComponentHeader = false;

    /**
     * the integer field used to specify the form width
     */
    @api public formWidth: number | undefined;

    /**
     * Show both shipping and billing address types
     */
    @api
    public get showDifferentAddressTypes(): boolean {
        return this._showDiffAddressTypes;
    }

    public set showDifferentAddressTypes(value: boolean) {
        if (!value) {
            this._addressType = DEFAULTS.shipping;
        }
        this._showDiffAddressTypes = value;
    }
    /**
     * AppContextAdapter to get the list of shipping countries
     * The first item becomes the default selected value in Country Dropdown of address form
     * The list is transformed to a list of label value pairs for country selector dropdown
     */
    @wire(AppContextAdapter)
    private appContext: StoreAdapterCallbackEntry<AppContext> | undefined;

    @api
    public get firstName(): AddressName {
        return this._firstName;
    }

    public set firstName(value: AddressName) {
        this._firstName = value;
    }

    @api
    public get lastName(): AddressName {
        return this._lastName;
    }

    public set lastName(value: AddressName) {
        this._lastName = value;
    }

    /**
     * Street number, name, unit, etc, eg. "10 Main St."
     */
    @api
    public get street(): Street {
        return this._street;
    }

    public set street(value: Street) {
        this._street = value;
    }

    @api
    public get city(): City {
        return this._city;
    }

    public set city(value: City) {
        this._city = value;
    }

    /**
     * Country code.
     */
    @api
    public get country(): CountryCode {
        return this._country;
    }

    public set country(value: CountryCode) {
        this._country = value;
    }

    /**
     * Province/territory/state, some countries do not have this.
     */
    @api
    public get province(): Province {
        return this._province;
    }

    public set province(value: Province) {
        this._province = value;
    }

    /**
     * Postal/post/zip code.
     */
    @api
    public get postalCode(): PostalCode {
        return this._postalCode;
    }

    public set postalCode(value: PostalCode) {
        this._postalCode = value;
    }

    /**
     * Address type (billing/shipping)
     */
    @api
    public get addressType(): AddressType {
        return this._addressType;
    }

    public set addressType(value: AddressType) {
        this._addressType = value;
    }

    get addressTypeOptions(): Record<string, string | undefined>[] {
        return [
            { label: ShippingLabel, value: 'Shipping' },
            { label: BillingLabel, value: 'Billing' },
        ];
    }

    /**
     * Is default address
     *
     * @returns {boolean}
     */
    @api
    public get isDefaultAddress(): IsDefaultAddress {
        return this._isDefaultAddress;
    }

    public set isDefaultAddress(value: IsDefaultAddress) {
        this._isDefaultAddress = value;
    }

    get normalizedCountry(): CountryCode {
        return this._country || this.appContext?.data?.country || (this.appContext?.data?.shippingCountries || [''])[0];
    }

    /**
     * true if creating a new address, false if editing an existing address
     */
    private get isNewAddressMode(): boolean {
        return !this.addressId;
    }

    /**
     * true if we need to show address form
     */
    get showAddressForm(): boolean {
        if (!this.addressId || this.isPreview) {
            this._showAddressForm = true;
        }
        return this._showAddressForm;
    }

    /**
     * The address Id captured from address footer for edit address
     *
     * @type {string}
     */
    private get addressId(): string {
        this._addressId = this.pageRef?.state?.addressId || '';
        return this._addressId;
    }

    /**
     * Gets the labels for address fields
     *
     * @returns {Record<string, string | undefined>} object of key-value pairs for labels
     */
    private get labels(): Record<string, string | undefined> {
        return {
            firstNameLabel: FirstNameLabel,
            lastNameLabel: LastNameLabel,
            addressTypeLabel: AddressTypeLabel,
            addressTypePlaceHolderLabel: AddressTypePlaceHolderLabel,
            companyNameLabel: CompanyNameLabel,
            countryLabel: CountryLabel,
            cityLabel: CityLabel,
            streetLabel: StreetLabel,
            provinceLabel: ProvinceLabel,
            postalCodeLabel: PostalCodeLabel,
        };
    }

    private get addressInput(): MyAccountAddressInput {
        const result: MyAccountAddressInput = {
            firstName: this.firstName,
            lastName: this.lastName,
            street: this.street,
            city: this.city,
            postalCode: this.postalCode,
            region: this.province,
            country: this.country,
            isDefault: this.isDefaultAddress,
            addressType: this.addressType,
        };
        return result;
    }

    private setEditAddress(address: MyAccountAddress): void {
        if (address.firstName && address.lastName) {
            this._firstName = address.firstName;
            this._lastName = address.lastName;
        } else {
            this._firstName = address.name;
        }
        this._street = address.street;
        this._city = address.city;
        this._country = address.country;
        this._postalCode = address.postalCode;
        this._province = address.region;
        this._isDefaultAddress = address.isDefault;
        this._addressId = address.addressId;
        this._addressType = address.addressType;
    }

    /**
     * Gets the list of ship-to countries to populate the country field drop down
     *
     * @returns {LabelValuePair[] | undefined} array of label value pairs of ship-to countries or undefined
     */
    private get countryOptions(): LabelValuePair[] | undefined {
        /**
         * If the list of shipping countries does not exist, then we return undefined.
         * We need undefined to convert the country drop down into a plain text field.
         */
        let countries;
        if (this.addressType === DEFAULTS.shipping) {
            countries = getShipToCountries(this.appContext?.data?.shippingCountries || []);
        } else {
            countries = getAllCountries();
        }
        return countries.length > 0 ? countries : undefined;
    }

    /**
     * Gets the list of states for a country selected from country field drop down.
     *
     * @returns {LabelValuePair[] | undefined} array of label value pairs of states/provinces or undefined
     */
    private get provinceOptions(): LabelValuePair[] | undefined {
        /**
         * If the list of states does not exist for a particular country, then we return undefined.
         * We need undefined to convert the state drop down into a plain text field.
         */
        const countryStates = this.normalizedCountry ? getCountryStates(this.normalizedCountry) : [];
        return countryStates.length ? countryStates : undefined;
    }
    /**
     * Gets the class values for the form' styles
     *
     * @returns {string}
     */
    private get formStyle(): string {
        return `--com-c-my-account-input-address-form-width: ${this.formWidth}%`;
    }

    private get customLocale(): string {
        return getCustomLocale(this.normalizedCountry || '');
    }
    private get isLastNameFirst(): boolean {
        /**
         * Countries with Last Name first display order:
         * China, Hungary, Japan, Republic of Korea, Macao, Malaysia, Singapore, Taiwan, Vietnam.
         */
        return isLastNameFirstCountry(this.normalizedCountry || '');
    }

    /**
     * @fires MyAccountInputAddress#change
     */
    private handleAddressChange(event: LightningInputAddressChangeEvent): void {
        const target = event.target;
        this._street = target.street;
        this._city = target.city;
        this._country = target.country;
        this._province = target.province;
        this._postalCode = target.postalCode;
    }

    /**
     * @fires MyAccountInputAddress#change
     */
    private handleAddressTypeChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        this._addressType = event.target.value;
    }

    /**
     * @fires MyAccountInputAddress#change
     */
    private handleFirstNameChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        this._firstName = event?.target?.value;
    }

    /**
     * @fires MyAccountInputAddress#change
     */
    private handleLastNameChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        this._lastName = event?.target?.value;
    }

    /**
     * User chooses this new address as the default.
     *
     */
    private handleIsDefaultAddressChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        this._isDefaultAddress = event.target.checked;
    }

    private handleCloseAddressFormClicked(): void {
        navigate(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Address_List',
            },
            state: {
                addressType: this.addressType,
            },
        });
    }

    private handleDismissNotification(): void {
        this._errorMessage = '';
    }

    private async handleSaveAddressFormClicked(): Promise<void> {
        let outputAddress: MyAccountAddress | undefined;
        const isFormValid = this.reportValidity();
        if (isFormValid) {
            if (this.isNewAddressMode) {
                try {
                    this._showPageSpinner = true;
                    outputAddress = await createMyAccountAddress(this.addressInput);
                } catch (e) {
                    this._errorMessage = getErrorInfo(e, this.isPreview);
                } finally {
                    this._showPageSpinner = false;
                }
            } else {
                try {
                    this._showPageSpinner = true;
                    outputAddress = await updateMyAccountAddress({
                        ...this.addressInput,
                        addressId: this.addressId,
                    });
                } catch (e) {
                    this._errorMessage = getErrorInfo(e, this.isPreview);
                } finally {
                    this._showPageSpinner = false;
                }
            }
            if (outputAddress?.addressId) {
                navigate(this.navContext, {
                    type: 'comm__namedPage',
                    attributes: {
                        name: 'Address_List',
                    },
                    state: {
                        addressType: this.addressType,
                    },
                });
            }
        }
    }

    /**
     * Makes the address component report its validity by showing errors next to fields that are not valid.
     */
    private reportValidity(): boolean {
        const componentsToValidate = this.findComponentsToValidate();

        function reportValidityAndCheckResult(result: boolean, component: HTMLInputElement): boolean {
            return component.reportValidity && component.reportValidity() && result;
        }

        // We want to show all errors at once, as such reportValidity needs to run on all components.
        return [...componentsToValidate].reduce(reportValidityAndCheckResult, true);
    }

    /**
     * Finds the HTML elements which can be validated
     *
     * @returns {HTMLInputElement[]} array of HTML input elements to be validated
     */
    private findComponentsToValidate(): HTMLInputElement[] {
        return Array.from(this.querySelectorAll('[data-validate]'));
    }
}
