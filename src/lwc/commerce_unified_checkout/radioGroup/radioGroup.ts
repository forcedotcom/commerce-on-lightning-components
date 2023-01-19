import { LightningElement, api, track } from 'lwc';
import type { LwcCustomEventTargetOf } from 'types/common';
import badgeLabel from '@salesforce/label/Commerce_Unified_Checkout_Shipping.badgeLabel';
import EditAddressLabel from '@salesforce/label/Commerce_Unified_Checkout_Shipping.editAddressLabel';

import type { Address } from 'types/unified_checkout';

export default class RadioGroup extends LightningElement {
    public static renderMode = 'light';

    _value?: string;
    @track _options!: Address[];
    private required = false;
    private _isDisabled = false;
    private _editAddressLabel: string | undefined = EditAddressLabel;

    /**
     * Gets the text that is displayed for the edit address button.
     */
    @api public get editAddressLabel(): string | undefined {
        return this._editAddressLabel;
    }
    /**
     * Sets the text that is displayed for the edit address button.
     */
    public set editAddressLabel(value: string | undefined) {
        this._editAddressLabel = value;
    }

    /**
     * Disable all the radio controls
     *
     * @type {boolean}
     */
    @api
    public get disabled(): boolean {
        return this._isDisabled;
    }

    public set disabled(value: boolean) {
        this._isDisabled = value;
    }

    /**
     * List of addresses to populate the radio group
     */
    @api
    get options(): Address[] {
        return this._options;
    }

    set options(addresses: Address[]) {
        this._options = addresses;
    }

    /**
     * The pre-selected address
     */
    @api initValue!: Address;

    /**
     * Name for each radio option
     */
    @api name!: string;

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

    connectedCallback(): void {
        this.classList.add('slds-form-element');
    }

    /**
     * Assembles the label for addresses for radio groups.
     */
    assembleAddressLabel(address: Address): string {
        let assemble = [address.name, address.street, address.city, address.region]
            .filter((str) => (str || '').length > 0)
            .join(', ');
        assemble = [assemble, address.postalCode, address.country].filter((str) => (str || '').length > 0).join(' ');
        return assemble;
    }

    /**
     * Reformat the array of addresses into a consumable format for the radio group template.
     * Formatted as follows:
     * [
     *  {
     *      label: "1 Address St, San Francisco, CA, USA 94105",
     *      value: "801xx",
     *      isChecked: true,
     *      indexId: 'radio-0',
     *      isDefault: true,
     *  }, ...
     * ]
     */
    get transformedOptions(): Record<string, unknown>[] {
        const { options, value } = this;
        if (Array.isArray(options)) {
            return options.map((item, index) => ({
                label: this.assembleAddressLabel(item),
                value: item.addressId,
                isChecked: value === item.addressId,
                indexId: `radio-${index}`,
                isDefault: item.isDefault,
            }));
        }

        return [];
    }

    /**
     * Sets focus on the first radio input element.
     */
    @api
    focus(): void {
        const firstRadio = <HTMLInputElement>this.querySelector('input');
        if (firstRadio) {
            firstRadio.focus();
        }
    }

    /**
     * Handle click and fire 'changeaddressoption' event for the selected address.
     *
     * @fires RadioGroup#changeaddressoption
     */
    handleChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        event.stopPropagation(); // Stop input element from propagrating event up and instead propagate from radio group
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

    handleBlur(): void {
        this.dispatchEvent(new CustomEvent('blur'));
    }

    handleFocus(): void {
        this.dispatchEvent(new CustomEvent('focus'));
    }
}
