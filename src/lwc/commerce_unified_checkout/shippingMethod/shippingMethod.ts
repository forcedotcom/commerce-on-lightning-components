import { api, LightningElement, track, wire } from 'lwc';
import type { LwcCustomEventTargetOf } from 'types/common';
import {
    CheckoutInformationAdapter,
    notifyAndPollCheckout,
    waitForCheckout,
    updateDeliveryMethod,
} from 'commerce/checkoutApi';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type { CheckoutInformation, CheckoutSavable, DeliveryMethod, ErrorLabels } from 'types/unified_checkout';

import templateEdit from './shippingMethod.html';
import templateReadonly from './shippingMethodReadonly.html';
import templateStencil from './shippingMethodStencil.html';
import { StencilType } from 'commerce_unified_checkout/stencil';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import { checkoutStatusIsReady } from 'commerce_unified_checkout/checkoutApiInternal';
import emptyMessage from '@salesforce/label/Commerce_Unified_Checkout_ShippingMethods.emptyMessage';
import {
    generateCheckoutIntegrationErrorLabel,
    generateErrorLabel,
    isCheckoutIntegrationError,
    noErrorLabels,
} from 'commerce_unified_checkout/errorHandler';
interface TransformedOption {
    indexId: string;
    isChecked: boolean;
    value: string;
    labelAria: string;
    label: string;
    priceAria: string;
    shippingFee: string;
    currencyIsoCode: string;
}

/**
 * Shipping Instructions Component
 *
 * template from https://github.com/salesforce/base-components-recipes/tree/master/force-app/main/default/lwc/radioGroup
 */
export default class ShippingMethod extends LightningElement implements CheckoutSavable {
    public static renderMode = 'light';
    /**
     * form name for radio group (must be unique on the page)
     * @type {string}
     * @required
     */
    @api public name = 'delivery-method';

    private _emptyMessage: string = emptyMessage;
    private _isReadOnly = false;
    private _stencilType: StencilType = StencilType.SHIPPING_METHOD;
    private _checkoutMode: CheckoutMode = CheckoutMode.EDIT;
    private _required = true;
    private _dismissible = false;
    private _isLoading = true;
    private _hasAddress = false;
    private _isDirty = false;
    private _isSaved = true;

    /**
     * We can show a message in the template before data is loaded, when not stencil mode
     * @type boolean
     */
    private get _isShowEmptyMessage(): boolean {
        return !this._hasAddress;
    }

    /**
     * show stencil when true
     * note 'no delivery methods' is shown by shipping address component instead of this one
     */
    private get showStencil(): boolean {
        return this.checkoutMode === CheckoutMode.STENCIL || (this._isLoading && this._availableOptions.length === 0);
    }

    /**
     * Only set this if you want to the component to be in builder mode
     * where it will ignore the wire adapter refresh and instead show explicitly set options
     * Gets set in tileMenuDesignTimeSubsitute.
     * @type {boolean}
     */
    @api isBuilderMode = false;

    /**
     * Part of 'CheckoutSavable' interface.
     * Used to identify if we should focus the component after it is rendered.
     * @type {boolean}
     */
    @api shouldSetFocus = false;

    private _setFocus = true;

    /**
     * When false interactive delivery method chooser UI shown;
     * when true shows selected delivery method or nothing.
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
     * the id of the currently selected delivery method or the empty string if none selected
     */
    private _value = '';

    /**
     * the list of delivery methods to select from (directly from api response)
     */
    @track private _availableOptions: DeliveryMethod[] = [];

    /**
     * id of currently selected delivery method
     * @type {string}
     */
    @api public get value(): string {
        return this._value;
    }

    public set value(value: string) {
        this._value = value;
    }

    /**
     * the list of delivery methods to select from (directly from api response)
     * @type {Array<DeliveryMethod>}
     */
    @api public get availableOptions(): DeliveryMethod[] {
        return this._availableOptions;
    }

    public set availableOptions(value: DeliveryMethod[]) {
        this._availableOptions = value;
    }

    /**
     * Strings to show error message header and body
     * Empty strings hide the notification
     */
    private _errorLabels: ErrorLabels = noErrorLabels;

    /**
     * Helper to test if error notification is showing
     * @type {boolean}
     */
    @api public get isError(): boolean {
        return !!this._errorLabels.header;
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
    }

    private get isDisabled(): boolean {
        return this._isLoading || this._checkoutMode === CheckoutMode.DISABLED;
    }

    /**
     * called once at startup and then whenever the data store updates
     */
    @wire(CheckoutInformationAdapter)
    checkoutAdapterHandler(payload: StoreAdapterCallbackEntry<CheckoutInformation>): void {
        // in builder mode wire adapter payload is empty. to prevet rendering an empty
        // component a design time subsitute sets a mock data payload in our constructor.
        if (this.isBuilderMode) {
            this._isLoading = false;
            this._hasAddress = true;
            return;
        }
        // ignore the initialization payloads that don't have data loaded yet, e.g. !response.loaded
        // ignore payloads with stale data, e.g. response.loading
        // ignore payloads checkout.ts will render, e.g. response.error
        if (!payload.data || payload.loading) {
            return;
        }

        // captures !payload.loaded, async checkout API
        this._isLoading = !checkoutStatusIsReady(payload.data?.checkoutStatus);

        // here we see what delivery methods are available for the selected delivery group/address.
        // we only support one delivery group at this time.
        const hasAddress = !!payload.data?.deliveryGroups?.items?.[0]?.deliveryAddress;
        const items = payload.data?.deliveryGroups?.items?.[0]?.availableDeliveryMethods;
        const availableOptions = Array.isArray(items) ? items : [];
        const optionsChanged = !this.isSameAvailableDeliveryMethods(this._availableOptions, availableOptions);
        const valueWasRemoved = !!this._value && !availableOptions.find((opt) => opt.id === this._value);
        const apiSelected = payload.data?.deliveryGroups?.items?.[0]?.selectedDeliveryMethod?.id || '';

        // throw out local changes and unselect if options no longer valid
        if (!this._isLoading && valueWasRemoved) {
            this._isDirty = false;
            this._isSaved = true;
            this._value = '';
        }

        // if we don't have local changes to keep update to the most recent state
        if (!this._isDirty && this._isSaved) {
            this._hasAddress = hasAddress;
            if (optionsChanged) {
                // only reset the available delivery method when different delivery methods are returned from api
                this._availableOptions = availableOptions;
            }

            if (apiSelected) {
                if (!this._value) {
                    // show (first) selected option from the api response if none are selected
                    this._value = apiSelected;
                } else if (!this._isLoading && apiSelected !== this._value) {
                    // trigger auto-select if api doesn't match current selection and current is a choice
                    this._isDirty = true;
                    this.dispatchDataReadyEvent();
                }
            } else if (!this._isLoading && !this._value && this._availableOptions.length) {
                // trigger auto-select of first option (if any) if no current selection
                this._isDirty = true;
                this._value = this._availableOptions[0].id;
                this.dispatchDataReadyEvent();
            }

            // check if there is 1 or less available delivery method
            if (availableOptions.length <= 1) {
                this.dispatchHideEditButtonEvent();
            } else {
                this.dispatchShowEditButtonEvent();
            }
        }

    }

    /**
     * This method called when user clicks on "Next" button for this step.
     * Reject promise if data is invalid, thus short-circuiting checkout.ts#proceedToNextStep
     */
    @api
    public async checkoutSave(): Promise<void> {
        this._errorLabels = noErrorLabels;
        // if no options are selected/selectable, then Navigation forward won't be allowed.
        // UI validation errors already shown, so no need for generic error banner.
        if (!this._value) {
            throw new Error('delivery method required');
        }

        // reset dirty to capture new changes and rely on not saved to indicate dirty save in flight
        this._isDirty = false;
        this._isSaved = false;

        // don't notify until all updates are done
        let checkoutInformation: CheckoutInformation;
        try {
            checkoutInformation = await updateDeliveryMethod(this._value);

            this._isSaved = true;
        } catch (e) {
            // show errors from update (PATCH) operations
            this._errorLabels = generateErrorLabel(e);
            throw e;
        }

        // if we modified the checkout state update the wire adapters
        // trigger polling and cart refresh
        await notifyAndPollCheckout(checkoutInformation);

        // show API error notification
        // only shows the error if checkout information update reqeust is sent from this component
        // but do not change the message if we already are showing a transient "update" error
        // Throw error to keep it in the edit mode
        const readyCheckoutInformation = await waitForCheckout();
        // note: checkout.ts renders errors thrown from waitForCheckout here
        if (isCheckoutIntegrationError(readyCheckoutInformation) && !this.isError) {
            this._errorLabels = generateCheckoutIntegrationErrorLabel(readyCheckoutInformation);
            throw new Error(this._errorLabels.body);
        }
        // note: the shipping.ts address component is responsible for showing the no shipping methods available error
    }

    /**
     * delegate the focus to the underlying input radio elements
     * apparently an abstraction on https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
     */
    @api
    public focus(): void {
        const firstRadio = <HTMLInputElement>this.querySelector('input');
        if (firstRadio) {
            firstRadio.focus();
        }
    }

    /**
     * Returns true if the element's value is valid.
     *
     * @type {boolean}
     */
    @api
    public get checkValidity(): boolean {
        return !!this._value;
    }

    /**
     * When using the accordion layout, for accessibility we focus on the shipping method.
     */
    public renderedCallback(): void {
        if (this.shouldSetFocus && this._setFocus) {
            this.focus();
            this._setFocus = false;
        }
    }

    /**
     * update our exposed API selected value when a radio button is selected
     */
    private handleShippingMethodChange(event: LwcCustomEventTargetOf<HTMLInputElement>): void {
        event.stopPropagation();
        this._isDirty = true;
        this._value = event.target.value;
        this.dispatchDataReadyEvent();
    }

    /**
     *  Emit a 'dataready` event
     */
    private dispatchDataReadyEvent(): void {
        if (this.checkValidity) {
            // Emit event to step when ready. checkout save can happen in step
            this.dispatchEvent(new CustomEvent('dataready', { bubbles: true, composed: true }));
        }
    }

    /**
     *  Emit a 'hideeditbutton` event
     */
    private dispatchHideEditButtonEvent(): void {
        // Emit event to step if there is only 1 or less delivery method.
        this.dispatchEvent(
            new CustomEvent('hideeditbutton', {
                bubbles: true,
                composed: true,
            })
        );
    }

    /**
     *  Emit a 'showeditbutton` event
     */
    private dispatchShowEditButtonEvent(): void {
        // Emit event to step if there are 2 or more delivery methods.
        this.dispatchEvent(
            new CustomEvent('showeditbutton', {
                bubbles: true,
                composed: true,
            })
        );
    }

    /**
     * return selected option transformed for rendering or null
     * note: it's a usage error if we are instantiated with no default selection
     */
    private get transformedSelectedOption(): TransformedOption {
        return this.transformedOptions.filter((opt: TransformedOption) => opt.isChecked)[0];
    }

    /**
     * return all options transformed for rendering
     */
    private get transformedOptions(): TransformedOption[] {
        return this._availableOptions.map(
            (opt: DeliveryMethod): TransformedOption => ({
                indexId: 'radio-' + opt.id,
                isChecked: this._value === opt.id,
                value: opt.id,
                labelAria: 'label-' + opt.id,
                label: opt.name,
                priceAria: 'price-' + opt.id,
                shippingFee: opt.shippingFee,
                currencyIsoCode: opt.currencyIsoCode,
            })
        );
    }

    /**
     * return true if all the delivery methods are the same
     * @type boolean
     */
    private isSameAvailableDeliveryMethods(
        firstAvailableOptions: DeliveryMethod[],
        secondAvailableOptions: DeliveryMethod[]
    ): boolean {
        if (firstAvailableOptions.length === secondAvailableOptions.length) {
            const differentOptions = firstAvailableOptions.filter(
                (option1) => !secondAvailableOptions.some((option2) => option1.id === option2.id)
            );
            return differentOptions?.length > 0 === false;
        }
        return false;
    }

    render(): HTMLElement {
        if (this.showStencil) {
            return templateStencil;
        }
        return this.readOnly ? templateReadonly : templateEdit;
    }
}
