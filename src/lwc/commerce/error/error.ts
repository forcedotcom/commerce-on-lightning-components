import { LightningElement, api } from 'lwc';

export default class Error extends LightningElement {
    public static renderMode = 'light';

    @api
    errorLabel: string | undefined;
}
