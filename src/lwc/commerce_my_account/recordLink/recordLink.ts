import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext, generateUrl } from 'lightning/navigation';
import type { LightningNavigationContext } from 'types/common';

/**
 * Redirect to record detail page if someone clicks on viewDetailsText
 */
export default class RecordLink extends LightningElement {
    static renderMode = 'light';

    /**
     * @description Aria label for View Details link
     */
    @api assistiveText?: string;

    @wire(NavigationContext)
    navigationContextHandler(navContext: LightningNavigationContext): void {
        this._navContext = navContext;
        this.updateUrl();
    }

    _navContext: LightningNavigationContext | undefined;

    updateUrl(): void {
        if (this._navContext && this._recordId && this._objectApiName) {
            this._url = generateUrl(this._navContext, {
                type: 'standard__recordPage',
                attributes: {
                    recordId: this._recordId,
                    objectApiName: this._objectApiName,
                    actionName: 'view',
                },
            });
        }
    }

    @api
    set recordId(recordId: string | undefined) {
        this._recordId = recordId;
        this.updateUrl();
    }

    get recordId(): string | undefined {
        return this._recordId;
    }

    _recordId?: string = '';

    private _url = '';

    /**
     * @description A salesforce entity name
     */
    _objectApiName?: string;

    @api
    set objectApiName(objectApiName: string | undefined) {
        this._objectApiName = objectApiName;
        this.updateUrl();
    }

    get objectApiName(): string | undefined {
        return this._objectApiName;
    }

    /**
     * @description Text for view details link
     */
    @api label?: string;

    /**
     * @description Whether record Id is present or not.
     */
    get _hasRecordId(): boolean {
        return (this.recordId || '').length > 0;
    }

    /**
     * @description Creates text for screen reader & voice over tool
     */
    get assistiveTextLabel(): string {
        return this.assistiveText || '';
    }

    /**
     * @description Navigates to the record detail page
     */
    navigateToRecord(event: Event): void {
        event.preventDefault();
        if (this._recordId && this._objectApiName && this._navContext) {
            navigate(this._navContext, {
                type: 'standard__recordPage',
                attributes: {
                    recordId: this._recordId,
                    objectApiName: this._objectApiName,
                    actionName: 'view',
                },
            });
        }
    }
}
