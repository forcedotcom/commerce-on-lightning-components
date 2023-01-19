import { LightningElement } from 'lwc';

const DEFAULTS = {
    availableOptions: [
        {
            id: '2Dmxx0000004CFVCA2',
            name: 'UPS Ground 3-5 business days',
            shippingFee: '3.14',
            currencyIsoCode: 'USD',
            carrier: 'UPS',
            classOfService: 'Same day UPS Ground',
            selected: false,
        },
        {
            id: '2Dmxx0000005DEWDB3',
            name: 'UPS Next Day 2 business days',
            shippingFee: '2.03',
            currencyIsoCode: 'USD',
            carrier: 'UPS',
            classOfService: 'Next day UPS Ground',
            selected: true,
        },
    ],
};

export default class ShippingMethodDesignSubstitute extends LightningElement {
    public static renderMode = 'light';
    _isBuilderMode = true;
    _availableOptions = DEFAULTS.availableOptions;
}
