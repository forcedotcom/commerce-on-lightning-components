import { LightningElement, api } from 'lwc';

export default class checkoutTab extends LightningElement {
    public static renderMode = 'light';
    /**
     *  Tracks if checkout step is active
     */
    @api
    active = false;

    /**
     * styling to show active region and hide inactive regions
     */
    private get regionStatus(): string {
        return `slds-p-around_medium ${this.active ? 'slds-show' : 'slds-hide'}`;
    }
}
