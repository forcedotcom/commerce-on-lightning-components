import { createElement } from 'lwc';
import type { TestWireAdapter } from 'types/testing';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { MyAccountAddressesAdapter } from 'commerce/myAccountApi';
import { SessionContextAdapter } from 'commerce/contextApi';
import { querySelector } from 'kagekiri';
import MyAccountAddressGrid from 'commerce_my_account/myAccountAddressGrid';
import type MyAccountAddressCard from 'commerce_my_account/myAccountAddressCard';

const mockAddresses = [
    {
        addressId: '003171931112854375',
        name: 'Amy Taylor',
        addressType: 'Shipping',
        street: '5 Wall Street',
        city: 'San Fransisco',
        country: 'US',
        postalCode: '55555',
        isDefault: true,
    },
    {
        addressId: '003171931112854376',
        name: 'Test address',
        addressType: 'Shipping',
        street: 'Test 5 Wall Street',
        city: 'San Fransisco',
        country: 'US',
        postalCode: '55555',
        isDefault: false,
    },
];

const sessionDataPreviewTrue = { data: { isPreview: true } };
const sessionDataPreviewFalse = { data: { isPreview: false } };

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(() => Promise.resolve()),
    }),
    { virtual: true }
);

jest.mock(
    'lightning/navigation',
    () => ({
        navigate: jest.fn(),
        NavigationContext: mockCreateTestWireAdapter(),
    }),
    { virtual: true }
);

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        SessionContextAdapter: mockCreateTestWireAdapter(),
    })
);

const sessionContextAdapter = <typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter;

jest.mock('commerce/myAccountApi', () =>
    Object.assign({}, jest.requireActual('commerce/myAccountApi'), {
        MyAccountAddressesAdapter: mockCreateTestWireAdapter(),
    })
);

describe('commerce_my_account/MyAccountAddressGrid: MyAccountAddressGrid', () => {
    let element: MyAccountAddressGrid & HTMLElement;

    type addressGrid =
        | 'pageSize'
        | 'itemSpacing'
        | 'previewAccountId'
        | 'addressType'
        | 'cardDefaultBadgeColor'
        | 'cardDefaultBorderRadius'
        | 'cardDefaultLabel'
        | 'footerEditLabel'
        | 'footerDeleteLabel'
        | 'noAddressMessageTitle'
        | 'noAddressMessageText'
        | 'showMoreButtonLabel'
        | 'showMoreButtonSize'
        | 'showMoreButtonWidth'
        | 'showMoreButtonAlign'
        | 'showMoreButtonStyle';

    beforeEach(() => {
        element = createElement('commerce_my_account-my-account-address-grid', {
            is: MyAccountAddressGrid,
        });
        element.myAddresses = [];
        document.body.appendChild(element);
    });
    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('My Account Address Grid', () => {
        it('should populate the wire adapter data and send it to card component', () => {
            element.previewAccountId = 'accountId';
            sessionContextAdapter.emit(sessionDataPreviewTrue);
            (<typeof MyAccountAddressesAdapter & typeof TestWireAdapter>MyAccountAddressesAdapter).emit({
                data: {
                    count: 1,
                    nextPageUrl: 'nextPageUrl',
                    items: mockAddresses,
                },
                error: undefined,
                loaded: true,
                loading: false,
            });
            document.body.appendChild(element);
            return Promise.resolve().then(() => {
                const addressCard = <MyAccountAddressCard & HTMLElement>(
                    querySelector('commerce_my_account-my-account-address-card')
                );
                expect(addressCard).not.toBeNull();
                expect(addressCard.name).toBe(mockAddresses[0].name);
                expect(addressCard.addressType).toBe(mockAddresses[0].addressType);
                expect(addressCard.street).toBe(mockAddresses[0].street);
                expect(addressCard.city).toBe(mockAddresses[0].city);
                expect(addressCard.country).toBe(mockAddresses[0].country);
                expect(addressCard.postalCode).toBe(mockAddresses[0].postalCode);
                expect(addressCard.isDefault).toBe(mockAddresses[0].isDefault);
            });
        });
        it('should not populate the wire adapter data when previewAccountId is empty', () => {
            element.previewAccountId = '';
            element.myAddresses = [];
            sessionContextAdapter.emit(sessionDataPreviewTrue);
            (<typeof MyAccountAddressesAdapter & typeof TestWireAdapter>MyAccountAddressesAdapter).emit({
                data: {
                    count: 1,
                    nextPageUrl: 'nextPageUrl',
                    items: mockAddresses,
                },
                error: undefined,
                loaded: true,
                loading: false,
            });
            return Promise.resolve().then(() => {
                expect(element.myAddresses).toHaveLength(0);
            });
        });
        it('should not have edit/delete button disable check only for site admin even without address manager user perm', async () => {
            element.previewAccountId = '3432423';
            element.myAddresses = [];
            element.isAccountAddressManager = false;
            sessionContextAdapter.emit(sessionDataPreviewTrue);
            element.pageSize = '1';
            element.showShowMoreAddressesButton = true;
            await Promise.resolve();
            (<typeof MyAccountAddressesAdapter & typeof TestWireAdapter>MyAccountAddressesAdapter).emit({
                data: {
                    count: 1,
                    nextPageUrl: 'nextPageUrl',
                    items: mockAddresses,
                },
                error: undefined,
                loaded: true,
                loading: false,
            });
            await Promise.resolve();
            const editButton = <HTMLButtonElement>element.querySelectorAll('[data-edit-address]')[0];
            expect(editButton.disabled).toBe(false);
        });
        it('should have accountId as current and populate the wire adapter data when builderMode is false', () => {
            element.previewAccountId = '';
            element.myAddresses = [];
            sessionContextAdapter.emit(sessionDataPreviewFalse);
            (<typeof MyAccountAddressesAdapter & typeof TestWireAdapter>MyAccountAddressesAdapter).emit({
                data: {
                    count: 1,
                    nextPageUrl: 'nextPageUrl',
                    items: mockAddresses,
                },
                error: undefined,
                loaded: true,
                loading: false,
            });
            return Promise.resolve().then(() => {
                expect(element.myAddresses).toHaveLength(2);
            });
        });
        it('should dispatch error event when wire adapter api call fail', () => {
            element.myAddresses = [];
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            sessionContextAdapter.emit(sessionDataPreviewFalse);
            (<typeof MyAccountAddressesAdapter & typeof TestWireAdapter>MyAccountAddressesAdapter).emit({
                data: undefined,
                error: [
                    {
                        errorCode: 'ITEM_NOT_FOUND',
                        message: "You can't perform this operation.",
                    },
                ],
                loaded: true,
                loading: false,
            });
            return Promise.resolve().then(() => {
                expect(dispatchSpy).toHaveBeenCalledTimes(1);
            });
        });
    });
    describe('Preview Account ID, Show more, empty state, pagination', () => {
        it('should increment the limit', async () => {
            element.showShowMoreAddressesButton = true;
            await Promise.resolve();
            const showMoreButton = <HTMLButtonElement>querySelector('[data-show-more-addresses]');
            showMoreButton.click();
            document.body.appendChild(element);
            expect(element._addressLimitIncrease).not.toBe(0);
        });
        it('should show empty state', async () => {
            element.showEmptyState = true;
            await Promise.resolve();
            const emptyState = <HTMLParagraphElement>querySelector('.emptyStateTitle');
            expect(emptyState).not.toBeNull();
        });
        it('should return show more button style class as expected', async () => {
            element.showAddressType = 'Shipping';
            element.showMoreButtonStyle = 'primary';
            element.showShowMoreAddressesButton = true;
            await Promise.resolve();

            const showMoreButton = <HTMLButtonElement>querySelector('[data-show-more-addresses]');
            expect(showMoreButton.getAttribute('class')).toContain('slds-button_brand');

            element.showMoreButtonStyle = 'secondary';
            await Promise.resolve();
            expect(showMoreButton.getAttribute('class')).toContain('slds-button_outline-brand');
        });
        it('should return show more button size class as expected', async () => {
            element.showAddressType = 'Shipping';
            element.showMoreButtonSize = 'small';
            element.showShowMoreAddressesButton = true;
            await Promise.resolve();

            const showMoreButton = <HTMLButtonElement>querySelector('[data-show-more-addresses]');
            expect(showMoreButton.getAttribute('class')).toContain('dxp-button-small');

            element.showMoreButtonSize = 'large';
            await Promise.resolve();
            expect(showMoreButton.getAttribute('class')).toContain('dxp-button-large');
        });
        it('should return show more button stretch class as expected', async () => {
            element.showAddressType = 'Shipping';
            element.showMoreButtonWidth = 'stretch';
            element.showShowMoreAddressesButton = true;
            await Promise.resolve();

            const showMoreButton = <HTMLButtonElement>querySelector('[data-show-more-addresses]');
            expect(showMoreButton.getAttribute('class')).toContain('slds-button_stretch');
        });
        it('should return show more button align class as expected', async () => {
            element.showAddressType = 'Shipping';
            element.showMoreButtonAlign = 'left';
            element.showShowMoreAddressesButton = true;
            await Promise.resolve();

            const showMoreButton = <HTMLButtonElement>querySelector('[data-show-more-addresses]');
            expect(showMoreButton.getAttribute('class')).toContain('show-more-button_left');

            element.showMoreButtonAlign = 'center';
            await Promise.resolve();
            expect(showMoreButton.getAttribute('class')).toContain('show-more-button_center');

            element.showMoreButtonAlign = 'right';
            await Promise.resolve();
            expect(showMoreButton.getAttribute('class')).toContain('show-more-button_right');
        });
        it('should focus on the edit link of the first card of the newly added cards', async () => {
            element.myAddresses = [];
            element.pageSize = '1';
            element.showShowMoreAddressesButton = true;
            element.isAccountAddressManager = true;
            sessionContextAdapter.emit(sessionDataPreviewFalse);
            await Promise.resolve();

            (<typeof MyAccountAddressesAdapter & typeof TestWireAdapter>MyAccountAddressesAdapter).emit({
                data: {
                    count: 1,
                    nextPageUrl: 'nextPageUrl',
                    items: mockAddresses,
                },
                error: undefined,
                loaded: true,
                loading: false,
            });

            const showMoreButton = <HTMLButtonElement>querySelector('[data-show-more-addresses]');
            showMoreButton.click();

            return Promise.resolve().then(() => {
                expect(document.activeElement).toBe(element.querySelectorAll('[data-edit-address]')[1]);
            });
        });
    });

    [
        {
            property: 'pageSize',
            defaultValue: '10',
            changeValue: '1',
        },
        {
            property: 'showAddressType',
            defaultValue: '',
            changeValue: 'Shipping',
        },
        {
            property: 'previewAccountId',
            defaultValue: '',
            changeValue: 'acctId',
        },
        {
            property: 'addressType',
            defaultValue: '',
            changeValue: 'Shipping',
        },
        {
            property: 'itemSpacing',
            defaultValue: 'medium',
            changeValue: 'large',
        },
        {
            property: 'cardDefaultBadgeColor',
            defaultValue: '',
            changeValue: 'green',
        },
        {
            property: 'cardDefaultBorderRadius',
            defaultValue: '',
            changeValue: '2',
        },
        {
            property: 'cardDefaultLabel',
            defaultValue: '',
            changeValue: 'Default',
        },
        {
            property: 'footerEditLabel',
            defaultValue: '',
            changeValue: 'Edit',
        },
        {
            property: 'footerDeleteLabel',
            defaultValue: '',
            changeValue: 'Delete',
        },
        {
            property: 'noAddressMessageTitle',
            defaultValue: '',
            changeValue: 'No Address Title',
        },
        {
            property: 'noAddressMessageText',
            defaultValue: '',
            changeValue: 'No Address Text',
        },
        {
            property: 'showMoreButtonLabel',
            defaultValue: '',
            changeValue: 'Show More',
        },
        {
            property: 'showMoreButtonSize',
            defaultValue: '',
            changeValue: '10',
        },
        {
            property: 'showMoreButtonWidth',
            defaultValue: '',
            changeValue: '5',
        },
        {
            property: 'showMoreButtonAlign',
            defaultValue: '',
            changeValue: 'left',
        },
        {
            property: 'showMoreButtonStyle',
            defaultValue: '',
            changeValue: 'large',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<addressGrid>propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<addressGrid>propertyTest.property]).not.toBe(propertyTest.changeValue);

                // Change the value.
                element[<addressGrid>propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[<addressGrid>propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });
});
