import { LightningElement } from 'lwc';

/**
 *
 * @slot header ({ locked: true })
 * @slot footer ({ locked: true })
 * @slot navigation ({ locked: true })
 * @slot
 */
export default class MyAccountLayout extends LightningElement {
    public static renderMode = 'light';
}
