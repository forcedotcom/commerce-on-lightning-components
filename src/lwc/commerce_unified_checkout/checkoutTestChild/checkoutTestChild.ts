import { LightningElement, api } from 'lwc';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';

export default class CheckoutTestChild extends LightningElement {
    @api checkoutMode = CheckoutMode.EDIT;

    @api forceException = false;

    @api shouldSetFocus = false;

    @api reportValidity(): boolean {
        return true;
    }

    @api async placeOrder(): Promise<void> {
        return this.checkoutSave();
    }

    @api async checkoutSave(): Promise<void> {
        if (this.forceException) {
            throw new Error('Test Error');
        }
        return Promise.resolve();
    }
}
