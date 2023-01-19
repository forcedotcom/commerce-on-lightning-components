import { createElement } from 'lwc';
import type { TestWireAdapter } from 'types/testing';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { MyAccountAddressesAdapter } from 'commerce/myAccountApi';
import MyAccountAddressGridContainer from 'commerce_my_account/myAccountAddressGridContainer';
import MyAccountAddressGridDesignSubstitute from 'commerce_my_account/myAccountAddressGridDesignSubstitute';
import { querySelector, querySelectorAll } from 'kagekiri';
import type MyAccountAddressGrid from 'commerce_my_account/myAccountAddressGrid';

const mockShippingAddresses = [
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
];

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
        CurrentPageReference: mockCreateTestWireAdapter(),
    }),
    { virtual: true }
);

jest.mock('commerce/myAccountApi', () =>
    Object.assign({}, jest.requireActual('commerce/myAccountApi'), {
        MyAccountAddressesAdapter: mockCreateTestWireAdapter(),
    })
);
jest.mock(
    '@salesforce/label/Commerce_My_Account_AddressGridContainer.shippingLabel',
    () => {
        return {
            default: 'Shipping',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/Commerce_My_Account_AddressGridContainer.billingLabel',
    () => {
        return {
            default: 'Billing',
        };
    },
    { virtual: true }
);

describe('commerce_my_account/MyAccountAddressGridContainer: MyAccountAddressGridContainer', () => {
    let element: MyAccountAddressGridContainer & HTMLElement;
    let designElement: HTMLElement & MyAccountAddressGridDesignSubstitute;

    type addressGrid =
        | 'pageSize'
        | 'previewAccountId'
        | 'showAddressType'
        | 'shippingTabLabel'
        | 'billingTabLabel'
        | 'itemSpacing'
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
        element = createElement('commerce_my_account-my-account-address-grid-container', {
            is: MyAccountAddressGridContainer,
        });
        element.shippingAddresses = [];
        element.billingAddresses = [];
        document.body.appendChild(element);
    });
    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('My Account Address Grid', () => {
        it('should have default labels for shipping and billing types', async () => {
            element.showAddressType = 'Shipping and billing';
            await Promise.resolve();
            const tabElements = <(HTMLElement & { label: string })[]>querySelectorAll('lightning-tab');
            expect(tabElements[1].label).toBe('Billing');
            expect(tabElements[0].label).toBe('Shipping');
        });

        it('should show error notification if addresserror event occurs', async () => {
            element.dispatchEvent(
                new CustomEvent('addresserror', {
                    bubbles: true,
                    composed: true,
                    cancelable: false,
                    detail: {
                        value: 'abc',
                    },
                })
            );
            await Promise.resolve();
            const addressErrorNotification = (element.shadowRoot as ShadowRoot | null)?.querySelector(
                'b2c_lite_commerce-scoped-notification'
            );
            expect(addressErrorNotification).toBeTruthy();

            addressErrorNotification?.dispatchEvent(
                new CustomEvent('dismissnotification', {
                    bubbles: true,
                    cancelable: true,
                })
            );
            await Promise.resolve();
            const addressErrorNotificationAfterDismiss = (element.shadowRoot as ShadowRoot | null)?.querySelector(
                'b2c_lite_commerce-scoped-notification'
            );
            expect(addressErrorNotificationAfterDismiss).toBeFalsy();
        });
    });
    [
        {
            property: 'pageSize',
            defaultValue: '10',
            changeValue: '1',
        },
        {
            property: 'previewAccountId',
            defaultValue: '',
            changeValue: 'abc',
        },
        {
            property: 'shippingTabLabel',
            defaultValue: 'Shipping',
            changeValue: 'shipping',
        },
        {
            property: 'billingTabLabel',
            defaultValue: 'Billing',
            changeValue: 'billing',
        },
        {
            property: 'showAddressType',
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

    describe('MyAccountAddressGrid Design Substitute component', () => {
        designElement = createElement('commerce_my_account-my-account-address-grid-design-substitute', {
            is: MyAccountAddressGridDesignSubstitute,
        });
        afterEach(() => {
            document.body.removeChild(designElement);
        });

        it('should test design substitute', async () => {
            document.body.appendChild(designElement);
            await Promise.resolve();
            const gridComponent = <MyAccountAddressGridContainer & HTMLElement>(
                querySelector('commerce_my_account-my-account-address-grid-container')
            );
            expect(gridComponent.shippingAddresses).not.toBeNull();
        });
    });
    it('should test design substitute with non empty preview Account ID and pagesize', async () => {
        designElement.previewAccountId = 'accountId';
        designElement.pageSize = '1';
        document.body.appendChild(designElement);
        (<typeof MyAccountAddressesAdapter & typeof TestWireAdapter>MyAccountAddressesAdapter).emit({
            data: {
                items: mockShippingAddresses,
                count: 0,
            },
            error: undefined,
            loaded: true,
            loading: false,
        });
        return Promise.resolve().then(() => {
            const gridComponent = <MyAccountAddressGrid & HTMLElement>(
                querySelector('commerce_my_account-my-account-address-grid')
            );
            expect(gridComponent.myAddresses).not.toBeNull();
            expect(gridComponent.myAddresses).toHaveLength(1);
            expect(gridComponent.myAddresses).toStrictEqual(mockShippingAddresses);
            expect(gridComponent.showEmptyState).toBe(true);
        });
    });
});
