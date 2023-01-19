import { LightningElement, api } from 'lwc';
/**
 * @slot information
 * @slot shippingAddress
 * @slot shippingMethod
 * @slot placeOrder
 * @slot payment
 */

interface CheckoutStep {
    key: string;
    name: string;
    isActive: boolean;
}

export default class checkoutTabset extends LightningElement {
    public static renderMode = 'light';
    /**
     * json string for dynamic region components
     */
    @api
    stepsConfig =
        '[{"checkoutStepKey":"Information","checkoutStepName":"Information","isActive":true},{"checkoutStepKey":"ShippingAddress","checkoutStepName":"Shipping Address","isActive":false},{"checkoutStepKey":"ShippingMethod","checkoutStepName":"Shipping Method","isActive":false},{"checkoutStepKey":"PlaceOrder","checkoutStepName":"Place Order","isActive":false},{"checkoutStepKey":"Payment","checkoutStepName":"Payment","isActive":false}]';

    /**
     * @returns {CheckoutStep} list of checkout steps.
     */
    @api
    private get checkoutSteps(): CheckoutStep {
        const steps = JSON.parse(this.stepsConfig);
        return steps;
    }
}
