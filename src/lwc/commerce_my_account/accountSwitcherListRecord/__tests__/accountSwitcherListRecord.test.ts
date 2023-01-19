import { createElement } from 'lwc';
import AccountSwitcherListRecord from 'commerce_my_account/accountSwitcherListRecord';

import type LightningIcon from 'lightning/icon';
import type LightningFormattedText from 'lightning/formattedText';

const ACCOUNT_SWITCHER_LIST_RECORD = {
    accountId: '001RM000004Y1nxYAD',
    accountName: 'Amazon Inventory1',
    accountAddress: {
        city: 'Seattle',
        street: '1 Prime Way',
        state: 'Washington',
        country: 'United States',
        zip: '98003',
    },
    selected: false,
};

const createAccountSwitcherListRecord = (props = {}): AccountSwitcherListRecord & HTMLElement => {
    const accountSwitcherListRecord: AccountSwitcherListRecord & HTMLElement = createElement(
        'commerce_my_account-account-switcher-list-record',
        { is: AccountSwitcherListRecord }
    );
    document.body.appendChild(Object.assign(accountSwitcherListRecord, props));
    return accountSwitcherListRecord;
};

const ACCOUNT_ICON_ALT_TEXT = 'Company Logo';
const CHECK_ICON_ALT_TEXT = 'Current Effective Account';
const FORMATTED_ADDRESS = '1 Prime Way Seattle, Washington 98003 United States';

jest.mock(
    '@salesforce/label/Commerce_My_Account_AccountSwitcherListRecord.accountIconAltText',
    () => {
        return {
            default: ACCOUNT_ICON_ALT_TEXT,
        };
    },
    { virtual: true }
);
jest.mock(
    '@salesforce/label/Commerce_My_Account_AccountSwitcherListRecord.checkIconAltText',
    () => {
        return {
            default: CHECK_ICON_ALT_TEXT,
        };
    },
    { virtual: true }
);

jest.mock(
    'lightning/internalLocalizationService',
    () => ({
        addressFormat: {
            formatAddressAllFields: jest.fn((langCode, countryCode, values) => {
                return values.address ? FORMATTED_ADDRESS : '';
            }),
        },
    }),
    { virtual: true }
);

describe('commerce_my_account/accountSwitcherListRecord: AccountSwitcherListRecord', () => {
    let element: AccountSwitcherListRecord & HTMLElement;
    beforeEach(() => {
        element = createAccountSwitcherListRecord(ACCOUNT_SWITCHER_LIST_RECORD);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should render element', () => {
        const { accountId, accountName, accountAddress, selected } = ACCOUNT_SWITCHER_LIST_RECORD;

        // Testing Property values
        expect(element.accountId).toBe(accountId);
        expect(element.accountName).toBe(accountName);
        expect(element.accountAddress).toStrictEqual(accountAddress);
        expect(element.selected).toBe(selected);

        // Testing HTML values
        const titleElem: (HTMLElement & LightningFormattedText) | null = element.querySelector(
            '.account-switcher-list-record__title lightning-formatted-text'
        );
        expect(titleElem?.value).toBe(accountName);

        const addressElem: (HTMLElement & LightningFormattedText) | null = element.querySelector(
            '.account-switcher-list-record__address lightning-formatted-text'
        );
        expect(addressElem?.value).toBe(FORMATTED_ADDRESS);

        const iconElems = element.querySelectorAll('lightning-icon');
        expect(iconElems).toHaveLength(1);
    });

    it('should not have address', async () => {
        // Setting Address as empty
        element.accountAddress = undefined;
        await Promise.resolve();
        const addressElem = element.querySelector('.account-switcher-list-record__address');
        expect(addressElem).toBeNull();
    });

    it('should be selected', async () => {
        // Mark element as selected
        element.selected = true;
        await Promise.resolve();
        const checkIconElem = element.querySelector('.account-switcher-list-record__icon_check');
        expect(checkIconElem).not.toBeNull();
    });

    it('Alt text should load from labels', async () => {
        // Mark element as selected
        element.selected = true;
        await Promise.resolve();
        const accountIconElem: (HTMLElement & LightningIcon) | null = element.querySelector(
            '.account-switcher-list-record__icon_account'
        );
        const checkIconElem: (HTMLElement & LightningIcon) | null = element.querySelector(
            '.account-switcher-list-record__icon_check'
        );

        expect(accountIconElem?.alternativeText).toBe(ACCOUNT_ICON_ALT_TEXT);

        expect(checkIconElem?.alternativeText).toBe(CHECK_ICON_ALT_TEXT);
    });

    it('Should trigger "accountswitchlistrecordclick" event on click', () => {
        const onAccountSwitchListRecordClick = jest.fn((event) => {
            expect(event.detail.accountId).toBe(ACCOUNT_SWITCHER_LIST_RECORD.accountId);
        });

        element.addEventListener('accountswitchlistrecordclick', onAccountSwitchListRecordClick);

        (<HTMLElement>element.querySelector('a')).click();

        expect(onAccountSwitchListRecordClick).toHaveBeenCalled();
    });
});
