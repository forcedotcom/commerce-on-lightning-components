import { LightningElement, api } from 'lwc';

export default class GuestContactDesignSubstitute extends LightningElement {
    public static renderMode = 'light';
    _isBuilderMode = true;
    _showComponent = true;
    _isReadOnly = false;

    @api emailLabel: string | undefined;
}
