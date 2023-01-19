import { LightningElement } from 'lwc';

/**
 * Header for the Checkout page
 *
 * @slot storeLogo ({ locked: true })
 * @slot cart ({ locked: true })
 */
export default class LayoutHeader extends LightningElement {
    public static renderMode = 'light';
}
