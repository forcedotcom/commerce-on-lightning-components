import { LightningElement, api } from 'lwc';

export default class PageLevelErrorMessage extends LightningElement {
    public static renderMode = 'light';

    @api
    errorIconName: string | undefined;

    @api
    errorIconSize: string | undefined;

    @api
    errorIconVariant: string | undefined;

    @api
    errorHeading: string | undefined;

    @api
    errorDescription: string | undefined;

    @api
    errorActionLabel: string | undefined;

    @api
    errorActionVariant: string | undefined;

    handleErrorActionClick(): void {
        this.dispatchEvent(new CustomEvent('erroractionclick'));
    }
}
