import { api, LightningElement, track } from 'lwc';
import type { LwcCustomEventTargetOf } from 'types/common';
import badgeLabel from '@salesforce/label/Commerce_Unified_Checkout_Shipping.badgeLabel';
import editButtonAriaLabel from '@salesforce/label/Commerce_Unified_Checkout_AddressVisualPicker.editButtonAriaLabel';
import {
    getCustomLocale,
    isLastNameFirstCountry,
    getCountryLabel,
} from 'commerce_unified_checkout/internationalization';

import type { Address } from 'types/unified_checkout';

export default class AddressVisualPicker extends LightningElement {
    public static renderMode = 'light';

    static delegatesFocus = true;
    _value: string | undefined;
    @track _options: Address[] | undefined;

    /**
     * Disable all the radio controls
     */
    @api disabled = false;

    /**
     * Label for the Edit button
     */
    @api editAddressLabel: string | undefined;

    /**
     * Hide all the Edit buttons
     */
    @api disableEdit = false;

    /**
     * The pre-selected address
     */
    @api initValue: Address | undefined;

    /**
     * Name for each visual picker option
     */
    @api name: string | undefined;

    /**
     * List of addresses to populate the visual picker
     */
    @api
    get options(): Address[] | undefined {
        return this._options;
    }

    set options(addresses: Address[] | undefined) {
        this._options = addresses;
    }

    /**
     * set input focus on radio button with given value if present
     */
    @api
    focusOnValue(value: string): void {
        (<HTMLElement>this.querySelector(`input[value="${value}"]`))?.focus();
    }

    /**
     * The current selected address option
     */
    @api
    get value(): string | undefined {
        return this._value;
    }

    set value(value: string | undefined) {
        this._value = value;
    }
    get badgeLabel(): string {
        return badgeLabel;
    }

    private concatenatedName(item: Address): string | undefined {
        if (item.firstName && item.lastName) {
            return isLastNameFirstCountry(item.country)
                ? `${item.lastName} ${item.firstName}`
                : `${item.firstName} ${item.lastName}`;
        }
        return item.name || item.firstName || item.lastName;
    }

    private countryLabel(countryCode: string | undefined): string {
        return countryCode ? getCountryLabel(countryCode) : '';
    }

    /**
     * Reformat the array of addresses into a consumable format for the radio group template.
     */
    get transformedOptions(): Record<string, unknown>[] {
        return (this.options || []).map((item, index) => ({
            isChecked: this.value === item.addressId,
            canEdit: !this.disableEdit && this.value === item.addressId,
            indexId: `radio-${index}`,
            address: item,
            countryLabel: this.countryLabel(item.country),
            name: this.concatenatedName(item),
            customLocale: getCustomLocale(item.country || ''),
            ariaLabel: editButtonAriaLabel.replace('{0}', item.name ?? ''), // i.e. 'Edit {0}'
        }));
    }

    /**
     * Handle click and fire 'changeaddressoption' event for the selected address.
     *
     * @fires RadioGroup#changeaddressoption
     */
    handleChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        event.stopPropagation(); // Stop input element from propagrating event up and instead propagate from visual picker
        this._value = event.target.value;

        this.dispatchEvent(
            new CustomEvent('changeaddressoption', {
                detail: {
                    value: event.target.value,
                },
            })
        );
    }

    /**
     * Handle click and fire 'editaddress' event for the selected address.
     * Note this does not change the selected radio button.
     *
     * @fires RadioGroup#editaddress
     */
    public handleEdit(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        event.stopPropagation(); // Stop input element from propagrating event up and instead propagate from radio group
        this.dispatchEvent(
            new CustomEvent('editaddress', {
                detail: {
                    // lightning-button id similar to https://salesforce.stackexchange.com/a/281538
                    value: event.target.value,
                },
            })
        );
    }
}
