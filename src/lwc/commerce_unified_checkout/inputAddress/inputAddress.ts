import { api, LightningElement, wire } from 'lwc';
import {
    FirstNameLabel,
    LastNameLabel,
    CountryLabel,
    CityLabel,
    StreetLabel,
    ProvinceLabel,
    PostalCodeLabel,
} from './labels';
import type { LabelValuePair, LightningInputAddressChangeEvent, LwcCustomEventTargetOf } from 'types/common';
import type { Address, ContactInfo } from 'types/unified_checkout';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type { AppContext } from 'commerce/contextApi';
import { AppContextAdapter } from 'commerce/contextApi';
import {
    getShipToCountries,
    getCountryStates,
    isLastNameFirstCountry,
    getCustomLocale,
    getAllCountries,
} from 'commerce_unified_checkout/internationalization';

type PhoneNumber = string;
type Name = string | undefined;
type Street = string;

type City = string;
type PostalCode = string;
type CountryCode = string;
type Province = string;
type IsDefaultAddress = boolean;

/**
 * Represents an address with an associated full name.
 */
export default class InputAddress extends LightningElement {
    public static renderMode = 'light';
    /**
     * Show Back to list link
     */
    @api public showBackToListLink = false;

    private _isDisabled = false;

    /**
     * Disable all the input controls
     *
     * @type {boolean}
     */
    @api
    public get disabled(): boolean {
        return this._isDisabled;
    }

    public set disabled(value: boolean) {
        // TODO: need to be using read-only instead of disabled for all components
        // CheckoutMode when focus should not jump away
        this._isDisabled = value;
    }

    /**
     * isDefault is disabled in more cases than other controls
     */
    private get isDefaultDisabled(): boolean {
        return this._isDisabled || this.readonlyDefaultAddress;
    }

    /**
     * the text that is displayed for component header for an existing address.
     */
    @api public componentHeaderEditAddressLabel: string | undefined;

    /**
     * the text that is displayed for returning to the list of addresses.
     */
    @api public backToListLabel: string | undefined;

    /**
     * the text displayed for the edit address phone number label
     */
    @api public phoneNumberLabel: string | undefined;

    /**
     * the text displayed for the edit address phone number placeholder text
     */
    @api public phoneNumberPlaceholderText: string | undefined;

    /**
     * the text that is displayed for default address checkbox.
     */
    @api public makeDefaultAddressLabel: string | undefined;

    /**
     * Show Phone Number (usually for guest user)
     */
    @api public showPhoneNumber = false;

    /**
     * Show Person Name
     */
    @api public showPersonName = false;

    /**
     * Show Set as default checkbox
     */
    @api public showDefaultAddress = false;

    /**
     * some use cases default checkbox cannot be changed
     */
    @api public readonlyDefaultAddress = false;

    /**
     * Show the form boarder style
     */
    @api public showFormBorderStyle = false;

    /**
     * Show the form boarder style
     */
    @api public showAllCountries = false;

    private _firstName: Name = '';
    private _lastName: Name = '';

    private _phoneNumber = '';

    private _street: Street = '';
    private _city: City = '';
    private _country: CountryCode = '';
    private _province: Province = '';
    private _postalCode: PostalCode = '';
    private _isDefaultAddress: IsDefaultAddress = false;
    private _addressId = '';

    /**
     * AppContextAdapter to get the list of shipping countries
     * The first item becomes the default selected value in Country Dropdown of address form
     * The list is transformed to a list of label value pairs for country selector dropdown
     */
    @wire(AppContextAdapter)
    private appContext: StoreAdapterCallbackEntry<AppContext> | undefined;

    @api
    public get address(): Address {
        const result: Address = {
            firstName: this.firstName,
            lastName: this.lastName,
            street: this.street,
            city: this.city,
            postalCode: this.postalCode,
            region: this.province,
            country: this.country,
            isDefault: this.isDefaultAddress,
        };
        if (this._addressId) {
            result.addressId = this._addressId;
        }
        return result;
    }

    public set address(address: Address) {
        if (address) {
            if (address.firstName && address.lastName) {
                this._firstName = address.firstName;
                this._lastName = address.lastName;
            } else {
                this._firstName = address.name || address.firstName || address.lastName;
            }
            this._street = address.street || '';
            this._city = address.city || '';
            this._postalCode = address.postalCode || '';
            this._province = address.region || '';
            this._country = address.country ? address.country : '';
            this._isDefaultAddress = address.isDefault ?? false;
            // save and return ID if provided
            this._addressId = address.addressId ?? '';
        }
    }

    @api
    public get contactInfo(): ContactInfo {
        return {
            phoneNumber: this.phoneNumber,
            firstName: this.firstName,
            lastName: this.lastName,
        };
    }

    public set contactInfo(contactInfo: ContactInfo) {
        this._phoneNumber = contactInfo.phoneNumber || '';
        // do not set _firstName/_lastName/_name from ContactInfo as it can be shipping OR billing name
    }

    @api
    public get firstName(): Name {
        return this._firstName;
    }

    public set firstName(value: Name) {
        this._firstName = value;
    }

    @api
    public get lastName(): Name {
        return this._lastName;
    }

    public set lastName(value: Name) {
        this._lastName = value;
    }

    @api
    public get phoneNumber(): PhoneNumber {
        return this._phoneNumber;
    }

    public set phoneNumber(value: PhoneNumber) {
        this._phoneNumber = value;
        this.contactInfo.phoneNumber = value;
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
        return this._country || this.appContext?.data?.country || (this.appContext?.data?.shippingCountries || [''])[0];
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

    /**
     * true if creating a new address, false if editing an existing address
     */
    private get isNewAddressMode(): boolean {
        return !this._addressId;
    }

    /**
     * concatenated language code and country code as custom locale
     * to override store locale
     */
    private get customLocale(): string {
        return getCustomLocale(this.country);
    }

    /**
     * disable country field when only one shippingCountry exists
     * otherwise keep it enabled
     */
    private get disableCountryDropdown(): boolean {
        if (!this.showAllCountries) {
            return this.appContext?.data?.shippingCountries.length === 1;
        }
        return false;
    }

    /**
     * Places the focus on the first input field.
     * If the country is where last name comes before first name,
     * then the focus is put on the last name field, otherwise on the first name field.
     */
    @api
    public focus(): void {
        if (this.isLastNameFirst) {
            (<HTMLElement>this.querySelector('[data-lastname-field]'))?.focus();
        } else {
            (<HTMLElement>this.querySelector('[data-firstname-field]'))?.focus();
        }
    }

    /**
     * Makes the address component report or check its validity.
     *
     * @param report Show errors next to fields that are not valid otherwise validate silently
     *
     * @returns {boolean} true if all fields are valid (eg. all required fields are filled), false otherwise.
     */
    @api
    public validity(report: boolean): boolean {
        const componentsToValidate = this.findComponentsToValidate();

        function validate(result: boolean, component: HTMLInputElement): boolean {
            // Report the validity to the user
            if (report) {
                return component.reportValidity && component.reportValidity() && result;
            }
            // Silently check validity
            return component.checkValidity && component.checkValidity() && result;
        }

        // If we want to show all errors at once, as such reportValidity needs to run on all components.
        return [...componentsToValidate].reduce(validate, true);
    }

    /**
     * Makes the address component report its validity by showing errors next to fields that are not valid.
     *
     * @returns {boolean} true if all fields are valid (eg. all required fields are filled), false otherwise.
     */
    @api
    public reportValidity(): boolean {
        return this.validity(true);
    }
    /**
     * Check the address component validity.
     *
     * @returns {boolean} true if all fields are valid (eg. all required fields are filled), false otherwise.
     */
    @api
    public checkValidity(): boolean {
        return this.validity(false);
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
            countryLabel: CountryLabel,
            cityLabel: CityLabel,
            streetLabel: StreetLabel,
            provinceLabel: ProvinceLabel,
            postalCodeLabel: PostalCodeLabel,
        };
    }

    /**
     * Gets the list of ship-to countries to populate the country field drop down
     *
     * @returns {LabelValuePair[] | undefined} array of label value pairs of ship-to countries or undefined
     */
    private get countryOptions(): LabelValuePair[] | undefined {
        let countries;

        if (!this.showAllCountries) {
            countries = getShipToCountries(this.appContext?.data?.shippingCountries || []);
        } else {
            countries = getAllCountries();
        }

        // If the list of countries does not exist, then we return undefined.
        // We need undefined to convert the country drop down into a plain text field.
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
        const countryStates = this.country ? getCountryStates(this.country) : [];
        return countryStates.length ? getCountryStates(this.country) : undefined;
    }

    /**
     * Checks to see if the country selected in Country field drop down is one where last name comes before first name or not
     *
     * @returns {boolean} true if country has last name before first name, false otherwise.
     */
    private get isLastNameFirst(): boolean {
        /**
         * Countries with Last Name first display order:
         * China, Hungary, Japan, Republic of Korea, Macao, Malaysia, Singapore, Taiwan, Vietnam.
         */
        return isLastNameFirstCountry(this.country);
    }

    /**
     * Gets the class values for the form's border
     *
     * @returns {string}
     */
    private get formBorderClass(): string {
        return this.showFormBorderStyle ? 'slds-form-element slds-p-around_medium slds-box' : 'slds-form-element';
    }

    /**
     * Finds the HTML elements which can be validated
     *
     * @returns {HTMLInputElement[]} array of HTML input elements to be validated
     */
    private findComponentsToValidate(): HTMLInputElement[] {
        return <HTMLInputElement[]>[...this.querySelectorAll('[data-validate]')];
    }

    /**
     * @fires CheckoutInputAddress#change
     */
    private handleAddressChange(event: LightningInputAddressChangeEvent): void {
        const target = event.target;
        this._street = target.street;
        this._city = target.city;
        this._country = target.country;
        this._province = target.province;
        this._postalCode = target.postalCode;
        this.dispatchChangeEvent();
    }

    /**
     * @fires CheckoutInputAddress#change
     */
    private handleFirstNameChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        this._firstName = event.target.value;
        this.dispatchChangeEvent();
    }

    /**
     * @fires CheckoutInputAddress#change
     */
    private handleLastNameChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        this._lastName = event.target.value;
        this.dispatchChangeEvent();
    }

    /**
     * @fires CheckoutInputAddress#change
     */
    private handlePhoneNumberChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        this._phoneNumber = event.target.value;
        this.dispatchChangeEvent();
    }

    /**
     * User chosoes this new address as the default.
     *
     */
    private handleIsDefaultAddressChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        this._isDefaultAddress = event.target.checked;
        this.dispatchChangeEvent();
    }

    /**
     * Dispatch a change event with validity.
     *
     * @private
     *
     * @fires InputAddress#change pass `valid` boolean flag with event.
     */
    private dispatchChangeEvent(): void {
        // ensure entire form is valid without triggering and displaying ALL field errors
        const isFormValid = this.checkValidity();

        if (isFormValid) {
            this.dispatchEvent(
                new CustomEvent('addresschanged', {
                    composed: true,
                    bubbles: true,
                    detail: {
                        valid: isFormValid,
                    },
                })
            );
        }
    }

    private handleCloseNewAddressFormClicked(): void {
        const closeNewAddressFormClickEvent = new CustomEvent('closenewaddressformclick');
        this.dispatchEvent(closeNewAddressFormClickEvent);
    }
}
