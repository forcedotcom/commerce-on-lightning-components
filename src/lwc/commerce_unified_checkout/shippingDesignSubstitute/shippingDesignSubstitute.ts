import { LightningElement, api } from 'lwc';
import type { Address } from 'types/unified_checkout';

const DEFAULTS = {
    initValue: 'address1',
    options: [
        <Address>{
            addressId: 'address1',
            isDefault: true,
            firstName: 'Jane',
            lastName: 'Doe',
            street: '123 Broadway',
            city: 'New York',
            postalCode: '11000',
            region: 'NY',
            country: 'US',
        },
        <Address>{
            addressId: 'address2',
            isDefault: false,
            firstName: 'John',
            lastName: 'Doe',
            street: '5 Wall Street',
            city: 'Burlington',
            postalCode: '01803',
            region: 'MA',
            country: 'US',
        },
        <Address>{
            addressId: 'address3',
            isDefault: false,
            firstName: 'Janice',
            lastName: 'Doe',
            street: '500 Broadway',
            city: 'New York',
            postalCode: '11000',
            region: 'NY',
            country: 'US',
        },
    ],
};

export default class ShippingDesignSubstitute extends LightningElement {
    public static renderMode = 'light';
    _isBuilderMode = true;

    _addresses = DEFAULTS.options;

    _initialValue = DEFAULTS.initValue;

    _showNewAddressForm = true;

    _showNewAddressButton = true;

    _showAddressList = true;

    _showShowMoreAddressButton = true;

    _isReadOnly = false;

    _shippingAddressLimit!: number;

    @api
    get shippingAddressLimit(): number {
        return this._shippingAddressLimit;
    }
    set shippingAddressLimit(value: number) {
        this._shippingAddressLimit = value;
        // update builder mock addresses to not exceed shippingAddressLimit
        const limit = value || 1;
        this._addresses = DEFAULTS.options.slice(0, limit);
    }

    @api
    get addresses(): Address[] {
        return this._addresses;
    }

    @api shippingAddressLimitIncrease!: number;

    @api editAddressLabel: string | undefined;

    @api newAddressButtonLabel: string | undefined;

    @api showMoreButtonLabel: string | undefined;

    @api componentHeaderEditAddressLabel: string | undefined;

    @api makeDefaultAddressLabel: string | undefined;

    @api backToListLabel: string | undefined;

    @api public phoneNumberLabel: string | undefined;

    @api public phoneNumberPlaceholderText: string | undefined;
}
