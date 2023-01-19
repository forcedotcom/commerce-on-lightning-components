import { LightningElement, wire, api } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import type { LightningNavigationContext } from 'types/common';
import { SessionContextAdapter } from 'commerce/contextApi';
import type { SessionContext } from 'commerce/contextApi';
import { generateStyleClass, generateSizeClass, generateStretchClass } from 'dxp_styling/sldsButtonClassGenerator';
// This was added for this component as per discussion on https://salesforce.quip.com/Kj26A1vhvioZ
import hasAccountAddressManager from '@salesforce/userPermission/AccountAddressManager';
import type { StoreAdapterCallbackEntry } from 'experience/store';

export default class MyAccountAddAddressButton extends LightningElement {
    /**
     * Enable the component to render as light DOM
     */
    public static renderMode = 'light';

    private _isBuilder = false;

    /**
     */
    @api text: string | undefined;

    /**
     */
    @api variant: undefined | 'primary' | 'secondary' | 'tertiary';

    /**
     * The size of button e.g. standard
     */
    @api size: undefined | 'small' | 'large' | 'standard';

    /**
     * The width of button e.g. default, fullwidth
     */
    @api width: undefined | 'stretch' | 'standard';

    /**
     * @description The alignment of button (left/center/right)
     */
    @api alignment: undefined | 'left' | 'right' | 'center';

    /**
     * property which tells builder mode view or runtime
     */
    @wire(SessionContextAdapter)
    updateSessionContext({ data }: StoreAdapterCallbackEntry<SessionContext>): void {
        this._isBuilder = data?.isPreview === true;
    }

    /**
     * The state of button disabled/enabled
     */
    get disabled(): boolean {
        return !this._isBuilder && !hasAccountAddressManager;
    }

    /**
     * Gets SLDS classes to apply to button.
     *
     */
    get customButtonClasses(): string {
        return `slds-button add-address-button_${this.alignment}  ${generateStyleClass(
            this.variant
        )} ${generateSizeClass(this.size)} ${generateStretchClass(this.width)}`;
    }

    @wire(NavigationContext)
    navContext!: LightningNavigationContext;

    /**
     * navigate the user to the Relative url for the active cart page when it's clicked
     */
    handleButtonClick(): void {
        navigate(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Address_Form',
            },
        });
    }
}
