import { LightningElement, api } from 'lwc';
import type { MyAccountAddress } from 'commerce/myAccountApi';

const DEFAULTS = {
    itemSpacing: 'medium',
    pageSize: '10',
    billing: 'Billing',
    shipping: 'Shipping',
    shippingAddresses: [
        {
            addressId: 'address1',
            name: 'Jane Doe',
            addressType: 'Shipping',
            street: '123 Broadway',
            city: 'New York',
            country: 'US',
            postalCode: '11000',
            isDefault: true,
        },
        {
            addressId: 'address2',
            name: 'John Doe',
            addressType: 'Shipping',
            street: '5 Wall Street',
            city: 'Burlington',
            country: 'US',
            postalCode: '01803',
            isDefault: false,
        },
        {
            addressId: 'address3',
            name: 'Janice Doe',
            addressType: 'Shipping',
            street: '500 Broadway',
            city: 'New York',
            country: 'US',
            postalCode: '11000',
            isDefault: false,
        },
    ],
    billingAddresses: [
        {
            addressId: 'address4',
            name: 'Jane Doe',
            addressType: 'Billing',
            street: '123 Broadway',
            city: 'New York',
            country: 'US',
            postalCode: '11000',
            isDefault: true,
        },
        {
            addressId: 'address5',
            name: 'John Doe',
            addressType: 'Billing',
            street: '5 Wall Street',
            city: 'Burlington',
            country: 'US',
            postalCode: '01803',
            isDefault: false,
        },
        {
            addressId: 'address6',
            name: 'Janice Doe',
            addressType: 'Billing',
            street: '500 Broadway',
            city: 'New York',
            country: 'US',
            postalCode: '11000',
            isDefault: false,
        },
    ],
};

export default class MyAccountAddressGridDesignSubstitute extends LightningElement {
    /**
     * This component can not yet be migrated to light-dom because the LightningTabset component
     * does flip the order of the tabs in light-dom.
     *
     * public static renderMode = 'light';
     */

    public connectedCallback(): void {
        this._shippingAddresses = !this.previewAccountId ? DEFAULTS.shippingAddresses : [];
        this._billingAddresses = !this.previewAccountId ? DEFAULTS.billingAddresses : [];
    }

    _shippingAddresses: MyAccountAddress[] = [];

    _billingAddresses: MyAccountAddress[] = [];

    @api previewAccountId: string | undefined;

    @api
    pageSize: string = DEFAULTS.pageSize;

    @api
    itemSpacing: string = DEFAULTS.itemSpacing;

    @api showAddressType: string | undefined;

    @api noAddressMessageTitle: string | undefined;

    @api noAddressMessageText: string | undefined;

    @api cardDefaultBadgeColor: string | undefined;

    @api cardDefaultBorderRadius: string | undefined;

    @api cardDefaultLabel: string | undefined;

    @api footerEditLabel: string | undefined;

    @api footerDeleteLabel: string | undefined;

    @api showMoreButtonLabel: string | undefined;

    @api showMoreButtonStyle: string | undefined;

    @api showMoreButtonSize: string | undefined;

    @api showMoreButtonWidth: string | undefined;

    @api showMoreButtonAlign: string | undefined;

    @api shippingTabLabel: string | undefined;

    @api billingTabLabel: string | undefined;
}
