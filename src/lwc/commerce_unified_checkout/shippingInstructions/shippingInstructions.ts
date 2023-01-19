import { LightningElement, api, wire } from 'lwc';
import { coerceBooleanProperty, coerceStringProperty } from 'experience/coercion';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type { DeliveryGroup, Address, ErrorLabels } from 'types/unified_checkout';
import { StencilType } from 'commerce_unified_checkout/stencil';
/**
 * Conditional templates, to be rendered based on the DisplayMode property
 */
import templateEdit from './shippingInstructions.html';
import templateReadonly from './shippingInstructionsReadonly.html';
import templateStencil from './shippingInstructionsStencil.html';
import type { CheckoutSavable } from 'types/unified_checkout';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import { CheckoutInformationAdapter, notifyAndPollCheckout, updateShippingAddress } from 'commerce/checkoutApi';
import type { CheckoutInformation } from 'types/unified_checkout';
import type { LwcCustomEventTargetOf } from 'types/common';
import { generateErrorLabel, noErrorLabels } from 'commerce_unified_checkout/errorHandler';
import type { SessionContext } from 'commerce/contextApi';
import { SessionContextAdapter } from 'commerce/contextApi';

const DEFAULT_SHIPPING_ADDRESS: Address = {
    city: '',
    country: '',
    isDefault: false,
    name: '',
    postalCode: '',
    region: '',
    street: '',
};

const DEFAULT_DELIVERY_GROUP: DeliveryGroup = {
    deliveryAddress: DEFAULT_SHIPPING_ADDRESS,
    desiredDeliveryDate: '',
    shippingInstructions: '',
};

/**
 * Shipping Instructions Component
 */
export default class ShippingInstructions extends LightningElement implements CheckoutSavable {
    public static renderMode = 'light';
    private _errorLabels: ErrorLabels = noErrorLabels;
    private _builderMode = false;
    private _deliveryGroup: DeliveryGroup = DEFAULT_DELIVERY_GROUP;
    private _isFirstLoad = true;
    private _instructions = '';
    private _showComp = true;
    private _showHeaderLabel = true;
    private _isReadOnly = false;
    private _checkoutMode: CheckoutMode = CheckoutMode.EDIT;
    private _showStencil = true;
    private _stencilType: StencilType = StencilType.DEFAULT_STENCIL;
    private _shippingInstructionsStencilItemCount = 2;

    @wire(SessionContextAdapter)
    private updateSessionContext({ data }: StoreAdapterCallbackEntry<SessionContext>): void {
        this._builderMode = !!data?.isPreview;
    }
    /**
     * Retrieves deliveryGroup and the very first shippingInstructions in the store
     */
    @wire(CheckoutInformationAdapter)
    checkoutAdapterHandler(response: StoreAdapterCallbackEntry<CheckoutInformation>): void {
        if (!this._builderMode && !response.loading && response?.data?.deliveryGroups?.items?.[0]) {
            this._deliveryGroup = response.data.deliveryGroups.items[0];
            if (this._isFirstLoad) {
                this._instructions = this._deliveryGroup?.shippingInstructions || '';
                this._isFirstLoad = false;
                this._showStencil = !response.loaded;
            }
        }
    }

    @api
    public async checkoutSave(): Promise<void> {
        if (this.isInstructionsChanged()) {
            this._errorLabels = noErrorLabels;
            const deliveryAddressGroup: DeliveryGroup = {
                shippingInstructions: this._instructions,
            };
            try {
                await notifyAndPollCheckout(await updateShippingAddress(deliveryAddressGroup));
            } catch (e) {
                this._errorLabels = generateErrorLabel(e);
                throw e;
            }
        }
    }

    @api public get isError(): boolean {
        return !!this._errorLabels.header;
    }

    /**
     * Header label
     */
    @api public headerLabel: string | undefined;

    /**
     * instruction input field place holder label
     */
    @api public placeholderLabel: string | undefined;

    /**
     * Gets or sets the readonly mode of template.
     * @type {boolean}
     */
    @api
    get readOnly(): boolean {
        return this._isReadOnly;
    }
    set readOnly(value: boolean) {
        this._isReadOnly = value;
    }

    /**
     * The current checkout mode for this component
     *
     * @type {CheckoutMode}
     */
    @api public get checkoutMode(): CheckoutMode {
        return this._checkoutMode;
    }

    set checkoutMode(value: CheckoutMode) {
        this._checkoutMode = value;
        this._isReadOnly = value === CheckoutMode.SUMMARY;
        //show the component only in Edit mode
        //or has instruction value in the readonly mode
        this._showComp = !this.readOnly || (this.readOnly && !!this.instructions);
    }

    /**
     * Gets or sets the visibility of the whole component.
     * @type {boolean}
     */
    @api
    public get showComp(): boolean {
        return this._showComp;
    }
    public set showComp(val: boolean) {
        this._showComp = coerceBooleanProperty(val);
    }

    /**
     * Gets or sets the visibility of the header label.
     * @type {boolean}
     */
    @api
    public get showHeaderLabel(): boolean {
        return this._showHeaderLabel;
    }
    public set showHeaderLabel(val: boolean) {
        this._showHeaderLabel = coerceBooleanProperty(val);
    }

    /**
     * Gets or sets the actual instructions value.
     * @type {string}
     */
    @api
    public get instructions(): string {
        return this._instructions;
    }

    public set instructions(val: string) {
        this._instructions = coerceStringProperty(val, '');
    }

    /**
     * Disable the input control when checkout mode is disabled.
     *
     * @private
     *
     * @type {boolean}
     */
    private get isDisabled(): boolean {
        return this._checkoutMode === CheckoutMode.DISABLED;
    }

    private get showStencil(): boolean {
        return !this._builderMode && this._showStencil;
    }

    private isInstructionsChanged(): boolean {
        return this._instructions !== (this._deliveryGroup?.shippingInstructions || '');
    }

    /**
     * Emit the `dataready` event when use enters shipping instructions and the changes are valid input.
     *
     * @param event the change event from the input with `valid` flag.
     *
     * @private
     *
     * @fires ShippingInstructions#dataready
     */
    private handleShippingInstructionChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        event.target.value = event.target.value.trim();
        this._instructions = event.target.value;
        this.dispatchEvent(new CustomEvent('dataready', { bubbles: true, composed: true }));
    }

    render(): HTMLElement {
        if (this.showStencil) {
            return templateStencil;
        }
        return this.readOnly ? templateReadonly : templateEdit;
    }
}
