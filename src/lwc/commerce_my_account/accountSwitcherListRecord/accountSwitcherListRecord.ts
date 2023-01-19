import { LightningElement, api } from 'lwc';
import LOCALE from '@salesforce/i18n/locale';
import { addressFormat } from 'lightning/internalLocalizationService';
import type { Address as EffectiveAddressType } from 'commerce/effectiveAccountApi';

import { accountIconAltText, checkIconAltText } from './labels';

const LABELS = { accountIconAltText, checkIconAltText };

export default class AccountSwitcherListRecord extends LightningElement {
    private static renderMode = 'light';
    /**
     * Id of the Account
     */
    @api accountId: string | undefined;

    /**
     * Name of the Account
     */
    @api accountName: string | undefined;

    /**
     * Address of the Account
     */
    @api accountAddress: EffectiveAddressType | undefined;

    /**
     * Selected Effective AccountId in current session
     */
    @api selected = false;

    /**
     * Computing CSS class names for account record.
     * Adding 'selected' class if current account is current effective account
     */
    get computedClassNames(): string {
        let classNames = `account-switcher-list-record slds-var-p-vertical_medium slds-var-p-horizontal_large`;
        if (this.selected) {
            classNames = classNames + ' selected';
        }
        return classNames;
    }

    /**
     * Converting address object to string format.
     * Expected Address format is: 'street, city, state, country, zip'
     */
    get formatedAccountAddress(): string {
        const [langCode, countryCode] = LOCALE.split('-');
        const { city, country, state, street: address, zip: zipCode } = this.accountAddress || {};
        return (
            addressFormat.formatAddressAllFields(
                langCode,
                countryCode,
                {
                    address,
                    city,
                    state,
                    country,
                    zipCode,
                },
                ' '
            ) || ''
        );
    }

    get labels(): typeof LABELS {
        return LABELS;
    }

    handleClick(e: Event): void {
        e.preventDefault();
        this.dispatchEvent(
            new CustomEvent('accountswitchlistrecordclick', {
                detail: {
                    accountId: this.accountId,
                    accountName: this.accountName,
                },
            })
        );
    }
}
