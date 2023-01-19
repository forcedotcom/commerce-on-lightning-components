import { api, LightningElement } from 'lwc';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import type { CheckoutSavable } from 'types/unified_checkout';
import editButtonLabel from '@salesforce/label/Commerce_Unified_Checkout_CheckoutStep.editButtonLabel';
import editButtonAriaLabel from '@salesforce/label/Commerce_Unified_Checkout_CheckoutStep.editButtonAriaLabel';

export default class CheckoutStep extends LightningElement {
    private _checkoutMode: CheckoutMode = CheckoutMode.EDIT;
    private _stepComponents: CheckoutSavable[] = [];
    private _expanded = false;
    private editButtonLabel = editButtonLabel;
    private _hideEditButton = false;
    private _isReadOnly = false;
    private _saveInProgress = false;

    private _isSummaryMode = false;

    /**
     * @type {boolean}
     */
    @api
    public get summaryMode(): boolean {
        return this._isSummaryMode;
    }

    public set summaryMode(summaryMode: boolean) {
        this._isSummaryMode = summaryMode;
    }

    handleShowSummaryMode(): void {
        this._isSummaryMode = true;
        this.setComponentsCheckoutMode(this._checkoutMode);
    }

    handleHideSummaryMode(): void {
        this._isSummaryMode = false;
        this.setComponentsCheckoutMode(this._checkoutMode);
    }

    private get ariaEditButtonLabel(): string {
        return editButtonAriaLabel.replace('{0}', this.definedLabel); // i.e. 'Edit {0}'
    }

    /**
     * Set the checkout mode for each child component of this step
     *
     * @param checkoutMode {CheckoutMode}
     *
     * @private
     */
    private setComponentsCheckoutMode(checkoutMode: CheckoutMode): void {
        let firstItemFocused = false;
        this._checkoutMode = checkoutMode;
        if (!this.builderMode) {
            //read only mode enabled on load for one/more existing addresses.
            if (this.isOnePageLayout) {
                this._isReadOnly = checkoutMode === CheckoutMode.SUMMARY || this._isSummaryMode;
            } else {
                this._isReadOnly = checkoutMode === CheckoutMode.SUMMARY;
            }
            this._expanded = this.isOnePageLayout || checkoutMode !== CheckoutMode.FUTURE;
        }
        this._stepComponents?.forEach((component) => {
            if ('checkoutMode' in component) {
                //summary mode enabled on load for one/more existing addresses
                if (this.isOnePageLayout && this._isSummaryMode) {
                    component.checkoutMode = CheckoutMode.SUMMARY;
                } else {
                    component.checkoutMode = checkoutMode;
                }
                // For accordion layout, call 'shouldSetFocus' on first component.
                if (
                    !this.isOnePageLayout &&
                    this._checkoutMode === CheckoutMode.EDIT &&
                    'shouldSetFocus' in component &&
                    !firstItemFocused
                ) {
                    component.shouldSetFocus = true;
                    firstItemFocused = true;
                }
            }
        });
    }

    @api builderMode = false;
    @api isOnePageLayout = false;

    @api label: string | undefined;

    /**
     * enable deep jest createElement where it is difficult to
     * set our required properties. note at normal run time
     * this property is guaranteed set non null by server side code.
     */
    private get definedLabel(): string {
        return this.label || 'CHECKOUT STEP LABEL';
    }

    @api proceedButtonLabel: string | undefined;
    @api step: string | undefined;

    /**
     * Property to expand and collapse this step in an accordion layout.
     * @type {boolean}
     */
    @api
    public get expanded(): boolean {
        return this._expanded;
    }

    public set expanded(isExpanded: boolean) {
        this._expanded = isExpanded;
    }

    /**
     * Toggle the expand property
     * @param isExpanded {boolean}
     */
    @api
    public toggle(isExpanded?: boolean): void {
        if (typeof isExpanded !== 'undefined') {
            this._expanded = isExpanded;
        } else {
            this._expanded = !this._expanded;
        }
    }

    /**
     * Property to set the checkoutMode on the step and child components.
     * @type {CheckoutMode}
     */
    @api
    public get checkoutMode(): CheckoutMode {
        return this._checkoutMode;
    }

    set checkoutMode(checkoutMode: CheckoutMode) {
        this.setComponentsCheckoutMode(checkoutMode);
    }

    /**
     * CSS Class Properties to expand/collapse and accordion layout.
     * @type {string}
     */
    public get sectionClassList(): string {
        let classes = 'checkout-step slds-accordion__section ';
        classes += this._expanded ? 'slds-is-open' : '';
        return classes;
    }

    /**
     * Handle click and fire 'proceed' event for this step.
     *
     * @fires CheckoutStep#proceed
     */
    public onClickProceed(): void {
        const proceedToNextStepEvent = new CustomEvent('proceed', {
            detail: {
                step: this.step,
            },
            bubbles: true,
            composed: true,
        });

        this.dispatchEvent(proceedToNextStepEvent);
    }

    /**
     * Handle click and fire 'editstep'' event for this step.
     *
     * @fires CheckoutStep#editstep
     */
    public onClickEdit(): void {
        this.handleHideSummaryMode();
        this.dispatchEvent(
            new CustomEvent('editstep', {
                detail: {
                    step: this.step,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    /**
     * Get disable state for the step button
     * @type {boolean}
     * @private
     */
    private get disableButton(): boolean {
        return this.checkoutMode !== CheckoutMode.EDIT;
    }

    /**
     * Get show/hide state for the step button
     * @type {boolean}
     * @private
     */
    private get hideButton(): boolean {
        return this.isOnePageLayout || this.checkoutMode === CheckoutMode.SUMMARY;
    }

    /**
     * Get show/hide state for the edit button
     * @returns boolean
     */
    private get showEditButton(): boolean {
        return this._isReadOnly && !this._hideEditButton;
    }

    /**
     * Register checkout step components (eg. information, shipping).
     *
     * @param event the slot change event
     */
    handleSlotChange(event: Event): void {
        // The direct child nodes added to the slot
        const target = event?.target as HTMLSlotElement;
        const components = target?.assignedNodes() as unknown as CheckoutSavable[];
        // Register the components if implementing checkoutComponent
        this._stepComponents = components.filter((component) => 'checkoutMode' in component);
    }

    /**
     * Check all step components and validate if the step is ready to save
     * @param reportValidity report form errors or silently check validity
     * @type boolean
     */
    @api isReadyToSave(reportValidity?: boolean): boolean {
        function isReadyToSaveAndCheckResult(result: boolean, component: CheckoutSavable): boolean {
            let isValid: boolean | undefined = true;
            if (component.checkoutSave) {
                if (reportValidity) {
                    if (component.reportValidity) {
                        isValid = isValid && component.reportValidity();
                    }
                } else {
                    if ('checkValidity' in component) {
                        isValid = isValid && component.checkValidity;
                    }
                }
            }
            return <boolean>isValid && result;
        }
        return [...this._stepComponents].reduce(isReadyToSaveAndCheckResult, true);
    }

    /**
     * For each child component call checkoutSave.
     *
     * @return Promise<void>
     */
    @api
    public async checkoutSave(): Promise<void> {
        for (let i = 0; i < this._stepComponents.length; i++) {
            const savable = this._stepComponents[i];
            if (savable.checkoutSave) {
                // eslint-disable-next-line no-await-in-loop
                await savable.checkoutSave();
            }
        }
    }

    /**
     * Call `placeOrder()` only on the `place order` component(s).
     *
     * @return Promise<void>
     */
    @api
    public async placeOrder(): Promise<void> {
        for (let i = 0; i < this._stepComponents.length; i++) {
            const savable = this._stepComponents[i];
            if (savable.placeOrder) {
                // eslint-disable-next-line no-await-in-loop
                await savable.placeOrder();
            }
        }
    }

    /**
     * For one page layout and for each component in this step call checkout
     * save when all components are valid.
     *
     * @async
     *
     * @returns void
     */
    handleDataReady(): void {
        if (this.isOnePageLayout) {
            this.onClickProceed();
        }
    }

    /**
     * If hideeditbutton event is fired and there's no other child component in this step
     * hide the Edit button in the step even in summary mode.
     *
     * @returns void
     */
    handleHideEditButton(event: CustomEvent): void {
        event.stopPropagation();
        //if there are other child components, it's possible for edit button to be used
        if (this._stepComponents.length <= 1) {
            this._hideEditButton = true;
        }
    }
    /**
     * If showeditbutton event is fired, showing/hiding Edit button is only controled by
     * checkout mode in that step.
     *
     * @returns void
     */
    handleShowEditButton(event: CustomEvent): void {
        event.stopPropagation();
        this._hideEditButton = false;
    }

    /**
     * use connected callback to add event listeners
     *
     */
    public connectedCallback(): void {
        // Listen for child components valid input `dataready` events (currently used for one page layout)
        this.template.addEventListener('dataready', () => this.handleDataReady());
        // Listen for child components valid `hideEditButton` & `showEditButton` event (used for deliveryMethod section)
        this.template.addEventListener('hideeditbutton', (evt) => this.handleHideEditButton(evt as CustomEvent));
        this.template.addEventListener('showeditbutton', (evt) => this.handleShowEditButton(evt as CustomEvent));
        //summary mode
        this.template.addEventListener('showsummarymode', () => this.handleShowSummaryMode());
        this.template.addEventListener('hidesummarymode', () => this.handleHideSummaryMode());
    }
}
