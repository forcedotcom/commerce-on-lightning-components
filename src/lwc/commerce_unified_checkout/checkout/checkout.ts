import { setHostElementForEkg } from 'commerce_unified_checkout/ekg';
import { api, LightningElement, wire } from 'lwc';
import type { CheckoutStep, CheckoutStepIdentifier, CheckoutStepConfig, ErrorLabels } from 'types/unified_checkout';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import { checkoutStatusIsReady } from 'commerce_unified_checkout/checkoutApiInternal';
import placeOrderAction from '@salesforce/label/B2C_Lite_Checkout.placeOrderAction';
import { CheckoutInformationAdapter, restartCheckout } from 'commerce/checkoutApi';
import type { CheckoutInformation } from 'types/unified_checkout';
import { NavigationContext, generateUrl } from 'lightning/navigation';
import type { LightningNavigationContext, NamedPageReference } from 'types/common';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import { fatalErrorLabels, generateErrorLabel, noErrorLabels } from 'commerce_unified_checkout/errorHandler';
import type { SessionContext } from 'commerce/contextApi';
import { SessionContextAdapter } from 'commerce/contextApi';

const CART_PAGE_REF: NamedPageReference = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Current_Cart',
    },
};

/**
 * The dynamic checkout container for checkout sections and child checkout components.
 * This component helps drive the checkout workflow.
 * Child checkout components in this container make actual api requests.
 *
 * Layout: Checkout Accordion vs One-Page
 * Accordion:
 *  1. The top level checkout component drives the checkout sections in order from top to bottom and sets the mode on each section. The section will set the mode on each child component which exposes a checkoutMode property. The Proceed button and event in the section are used to trigger the checkoutSave() method on each component in that section. The top level checkout component will move to the next section.
 *  2. Sections will be set to readonly mode and the user can return to them to edit them.
 *
 * One Page:
 *  1. Sections are always in edit mode.
 *  2. The components emit a dataready event to the parent section component when they are ready to be saved. If each component in the section has checkValidity as true the section will execute checkoutSave() on each child component. Any dependent components in other sections could be triggered to load. e.g. via the CheckoutInformationAdapter in ShippingMethods after the shipping address is saved.
 *  3. The place order button is located on the top parent checkout component directly and will execute placeOrder() on the section payment component to complete the order. The payment component never emits a dataready event and any checkValidity is neither implemented or exposed as a public property.
 *  4. The address and delivery methods will auto load for a returned authenticated shopper and only payment information would need to be entered.
 *
 */
export default class UnifiedCheckout extends LightningElement {
    /**
     * private member used for public property. See isOnePageLayout
     * @private
     * @type {boolean}
     */
    private _isOnePageLayout = false;

    /**
     * used in public property isOnePageLayout to set the layout once.
     * @private
     * @type {boolean}
     */
    private _isLayoutSet = false;

    /**
     * used to track the accordion layout section progression
     * @private
     * @type {number}
     */
    private _currentStepIdx = 0;

    /**
     * used for a one time operation in renderedCallback()
     * @private
     * @type {boolean}
     */
    private _rendered = false;

    /**
     * used for accordion layout steps
     * @private
     * @type {boolean}
     */
    private _navigationSteps: CheckoutStepIdentifier[] = [];

    /**
     * place order button label
     * @private
     * @type {string}
     */
    private _placeOrderAction = placeOrderAction;

    /**
     * error labels shown at the top of checkout
     * @private
     * @type {object}
     */
    private _errorLabels: ErrorLabels = noErrorLabels;

    /**
     * keep the top error notification on the screen
     * @private
     * @type {boolean}
     */
    private _dismissible = false;

    /**
     * create a link in the error notification to return to cart
     * @private
     * @type {boolean}
     */
    private _cartUrl = '';

    /**
     * private member used for public property. See isPlaceOrderDisabled
     * @private
     * @type {boolean}
     */
    private _isPlaceOrderDisabled = false;

    /**
     * private member used for public property.
     * true when callSaveOnComponentsAndProceed or onClickPlaceOrder.
     * @private
     * @type {boolean}
     */
    private _isLoading = false;

    /**
     * private member used for queuing calls to handleProceed
     */
    private _proceedQueue: string[] = [];

    /**
     * true when the page is rendered in builder or preview mode
     * @private
     */
    private _isPreviewMode = false;

    constructor() {
        super();
        // restartCheckout clears out checkout information cache in the store and start checkout process every time the page loads.
        // this avoids problems with using defunct checkoutSessionId when cart changes.
        // it should be called in the first component life cycle so there is no checkout information load in progress when the cached is cleared.
        restartCheckout();
    }

    @wire(NavigationContext)
    navigationContextHandler(navContext: LightningNavigationContext): void {
        this._cartUrl = generateUrl(navContext, CART_PAGE_REF);
    }

    @wire(CheckoutInformationAdapter)
    private checkoutInformation!: StoreAdapterCallbackEntry<CheckoutInformation>;

    @wire(SessionContextAdapter)
    private updateSessionContext({ data }: StoreAdapterCallbackEntry<SessionContext>): void {
        this._isPreviewMode = !!data?.isPreview;
    }

    /**
     * Disable the place order button during checkout loading operations
     * or during payment and order api loading operations
     * @private
     * @type boolean
     */
    private get isPlaceOrderDisabled(): boolean {
        return this.isLoading || this._isPlaceOrderDisabled;
    }

    /**
     * Show a11y checkout API busy indicator during API loading
     */
    private get isLoading(): boolean {
        // during initial load use checkoutStatus; subsequent saves use local var
        return (
            !this.checkoutInformation?.error &&
            (!checkoutStatusIsReady(this.checkoutInformation?.data?.checkoutStatus) || this._isLoading)
        );
    }

    /**
     * Set the one page layout mode once.
     * Use One Page layout when all steps are expanded initially.
     * Accordion layout is used when any steps are collapsed initially.
     * Accordion steps all eventually become expanded when the last step is reached.
     *
     * @type boolean
     */
    @api
    get isOnePageLayout(): boolean {
        if (!this._isLayoutSet) {
            // determine the layout mode
            const steps = JSON.parse(this.stepsConfig);
            this._isOnePageLayout = steps.length > 0;
            steps.forEach((stepData: CheckoutStepConfig) => {
                this._isOnePageLayout = this._isOnePageLayout && stepData.isExpanded;
            });
            this._isLayoutSet = true;
        }
        return this._isOnePageLayout;
    }

    // For now, this hard coded configuration of steps is required in this format to add defaults steps
    // and components to this unified component. Note, this has to live on one giant uninterrupted line.
    @api
    stepsConfig =
        '[{"checkoutStepKey":"ShippingAddress","checkoutStepName":"Shipping Address","proceedButtonLabel":"Next","isExpanded":true,"seedComponents":[{"fqn":"commerce_unified_checkout:guestContact","attributes":{}},{"fqn":"commerce_unified_checkout:shipping","attributes":{}}]},{"checkoutStepKey":"ShippingMethod","checkoutStepName":"Shipping Method","proceedButtonLabel":"Next","isExpanded":true,"seedComponents":[{"fqn":"commerce_unified_checkout:shippingMethod","attributes":{}}]},{"checkoutStepKey":"Payment","checkoutStepName":"Payment","proceedButtonLabel":"Place Order","isExpanded":true,"seedComponents":[{"fqn":"commerce_unified_checkout:paymentWithBilling","attributes":{}}]}]';

    public renderedCallback(): void {
        if (!this._rendered && !this.showError) {
            this._rendered = true;
            this.generateStepsForNavigation();
            this.updateStepsCheckoutModes();
            setHostElementForEkg(this.template.querySelector('[data-ekg]'));
        }
    }

    // Determine to show error message or not based on the response from wired CheckoutInformationAdapter and CurrentPageReference
    get showError(): boolean {
        const hasError = !!this.checkoutInformation?.error;
        if (hasError && this._errorLabels === noErrorLabels) {
            this._errorLabels = generateErrorLabel(this.checkoutInformation?.error, fatalErrorLabels);
        }
        return !this._isPreviewMode && hasError;
    }

    public connectedCallback(): void {
        // the 'proceed' custom event will occur when the proceed/next button is clicked.  See step.ts
        this.template.addEventListener('proceed', (evt) => this.handleProceed(evt as CustomEvent));
        this.template.addEventListener('editstep', (evt) => this.handleEditStep(evt as CustomEvent));
    }

    /**
     * For the accordion layout calls the checkoutSave() method on the current step.
     * The current step component will internally call checkoutSave() methods on its children.
     * Proceeds to the next step when checkoutSave() method completes.
     *
     * @async
     *
     * @returns {Promise<void>}
     */
    private async callSaveOnComponentsAndProceed(): Promise<void> {
        const allSteps = this.findSteps();
        let currentStep: CheckoutStep;
        let nextStep: CheckoutStep | undefined;

        // Prepare checkout steps for save and proceed operation
        if (allSteps?.length > 0) {
            currentStep = allSteps[this._currentStepIdx];
            nextStep = this.isOnePageLayout ? undefined : allSteps[this._currentStepIdx + 1];
            // accordion layout proceed -- components handle their own reportValidity in one page mode
            if (currentStep && currentStep.isReadyToSave(!this.isOnePageLayout)) {
                // This step needs to be in DISABLED mode.
                // Child components should disable their form controls.
                currentStep.checkoutMode = CheckoutMode.DISABLED;

                if (nextStep) {
                    nextStep.checkoutMode = CheckoutMode.STENCIL;
                }

                try {
                    // This step component will call checkout save on its children.
                    await currentStep?.checkoutSave();

                    // Prepare current and next checkout steps
                    currentStep.checkoutMode = this.isOnePageLayout ? CheckoutMode.EDIT : CheckoutMode.SUMMARY;

                    if (nextStep) {
                        nextStep.checkoutMode = CheckoutMode.EDIT;
                    }

                    // in accordion toggle close the current step, proceeds to and toggles open the next step
                    this._currentStepIdx++;
                } catch (exception) {
                    // Individual components will handle and display an error message.
                    //
                    // Reset current step to EDIT on error
                    if (currentStep) {
                        currentStep.checkoutMode = CheckoutMode.EDIT;
                    }
                    // Revert next step to FUTURE on error
                    if (nextStep) {
                        nextStep.checkoutMode = CheckoutMode.FUTURE;
                    }
                }
            }
        }
    }

    /**
     * Find and return all the checkout steps (eg. information, shipping).
     *
     * @returns step components
     */
    private findSteps(): CheckoutStep[] {
        const checkoutStepSlot = this.template.querySelector('slot[name="checkoutSteps"]');
        return (checkoutStepSlot as HTMLSlotElement).assignedNodes() as unknown as CheckoutStep[];
    }

    /**
     * Handler for the 'proceed' event fired when user clicks "Proceed" button on step
     * 1. Sets the current step (whichever "Next" button was clicked is the current step).
     * 2. Calls the checkoutSave() method on the current step's component
     * We need to queue events because this can be auto-called by multiple 'dataready' events
     *
     * @param {Object} evt the event object
     */
    private async handleProceed(event: CustomEvent): Promise<void> {
        // all events get queued
        this._proceedQueue.push(event.detail.step.toUpperCase());
        // only the first invocation of handleProceed runs the queue
        if (this._proceedQueue.length > 1) {
            return;
        }
        // process the queue in order the events were received until the queue is empty
        try {
            this._isLoading = true;
            while (this._proceedQueue.length) {
                try {
                    this.setCurrentStep(this._proceedQueue[0]);
                    // eslint-disable-next-line no-await-in-loop
                    await this.callSaveOnComponentsAndProceed();
                } finally {
                    this._proceedQueue.shift();
                }
            }
        } finally {
            this._isLoading = false;
        }
    }

    /**
     * Handler for the 'editstep' event fired when user clicks "Edit" button on step
     * 1. Sets the current step (whichever "Edit" button was clicked is the current step).
     * 2. RenderedCallback currently sets the correct states for currentStep
     *
     * @param {Object} evt the event object
     */
    private handleEditStep(event: CustomEvent): void {
        this.setCurrentStep(event.detail.step.toUpperCase());
        this.updateStepsCheckoutModes();
    }

    /**
     * Finds the step in the list of steps (generated from stepsConfig.json) and sets it as the current step
     * @param step current step name eg. shippingAddress
     */
    private setCurrentStep(step: string): void {
        for (let i = 0; i < this._navigationSteps.length; i++) {
            if (this._navigationSteps[i].checkoutStepKey === step) {
                this._currentStepIdx = i;
                break;
            }
        }
    }

    /**
     *  Creates an array of step data used for navigation purposes.
     *  Example: [{id: 'INFORMATION'}, {id: 'SHIPPING'}]
     */
    private generateStepsForNavigation(): void {
        const steps = JSON.parse(this.stepsConfig);
        this._navigationSteps = steps.map((stepData: CheckoutStepConfig) => {
            return { checkoutStepKey: stepData.checkoutStepKey.toUpperCase() };
        });
    }

    /**
     * Set the checkout steps and child component modes based on the current step.
     * @private
     */
    private updateStepsCheckoutModes(): void {
        const steps = this.findSteps();
        // Iterate over checkout step components and set the initial mode
        steps?.forEach((stepComponent, idx) => {
            if ('isOnePageLayout' in stepComponent) {
                stepComponent.isOnePageLayout = this.isOnePageLayout;
            }

            if ('checkoutMode' in stepComponent) {
                // All steps are in edit mode for one page checkout.
                if (this._currentStepIdx === idx) {
                    stepComponent.checkoutMode = CheckoutMode.EDIT;
                } else if (idx < this._currentStepIdx) {
                    stepComponent.checkoutMode = CheckoutMode.SUMMARY;
                } else {
                    stepComponent.checkoutMode = CheckoutMode.FUTURE;
                }
            }
        });
    }

    /**
     * The one page layout place order button.
     *
     * @param event {Event} a user driven click event
     */
    @api
    async onClickPlaceOrder(): Promise<void> {
        try {
            this._isLoading = true;

            const steps = this.findSteps();
            // We need to verify each step is ready for place order
            const isReadyToSave = steps.reduce((result: boolean, step: CheckoutStep): boolean => {
                return step.isReadyToSave(true) && result;
            }, true);

            if (isReadyToSave) {
                for (const step of steps) {
                    // disable each step before place order
                    step.checkoutMode = CheckoutMode.DISABLED;
                    try {
                        if ('placeOrder' in step) {
                            // This is the case where we still need await in the loop
                            // and want to process the calls in order.
                            // disable the place order button during the operations as well
                            this._isPlaceOrderDisabled = true;
                            // eslint-disable-next-line no-await-in-loop
                            await step.placeOrder();
                        }
                    } catch (e: unknown) {
                        // re-enable the place order button on error
                        if ('placeOrder' in step) {
                            this._isPlaceOrderDisabled = false;
                        }
                        // ensure all steps are reset to edit on error
                        steps.forEach((editStep) => (editStep.checkoutMode = CheckoutMode.EDIT));
                    }
                }
            }
        } finally {
            this._isLoading = false;
        }
    }
}
