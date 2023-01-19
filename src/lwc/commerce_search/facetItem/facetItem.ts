import { LightningElement, api } from 'lwc';
import { FacetUiTypeEnum, FACETVALUE_TOGGLE_EVT } from './constants';
import type { DistinctFacetValue } from 'commerce/searchApiInternal';
import type { LwcCustomEventTargetOf } from 'types/common';

/**
 * Wrapper component for facet values
 *
 *  @fires FacetItem#facetvaluetoggle
 */
export default class FacetItem extends LightningElement {
    static renderMode = 'light';

    /**
     * An event fired when the facet value has been toggled.
     *
     * @event FacetItem#facetvaluetoggle
     *
     * @property detail.id
     *   The ID of the facet value
     *
     * @property detail.checked
     *   Whether the facet value has been checked or unchecked
     *
     * @export
     */

    /**
     * Facet representation that inputFacet will take in
     *
     * @typedef DistinctFacetValue
     *
     * @property id
     *  ID or internal name of the facet value.
     *
     * @property name
     *  Display Name of the facet value with product count.
     *
     * @property checked
     *  Whether or not the value is selected.
     *
     * @property focusOnInit
     *  Whether or not to show the focus when initially displayed.
     *
     * @property productCount
     *  Number of products in search results under this category
     */

    /**
     * Gets or sets the facet value
     *
     */
    @api
    value: DistinctFacetValue | null | undefined;

    /**
     * The type of facet being displayed ("radio" or "checkbox")
     *
     */
    @api
    type: string = FacetUiTypeEnum.CHECKBOX;

    /**
     * Indicates whether we should focus on the facet value when it's first rendered
     *
     */
    @api
    focusOnInit = false;

    /**
     * Whether the facet item has been rendered at least once.
     *
     */
    hasRenderedAtLeastOnce = false;

    /**
     * Whether the component has acquired focus when it was initially displayed.
     *
     */
    hasInitiallyFocused = false;

    /**
     * Focuses on the facet value on inital rendering if flag is true
     *
     * @private
     */
    renderedCallback(): void {
        // If this is our first render and we've not already acquired focus and we shoudl acquire focus, acquire focus.
        // We only want the behavior to occur the first time the component renders in the DOM after being inserted.
        const lightningInputElement = this.querySelector('lightning-input');

        if (!this.hasRenderedAtLeastOnce && !this.hasInitiallyFocused && this.focusOnInit) {
            (<HTMLElement>lightningInputElement)?.focus();
            this.hasInitiallyFocused = true;
        }

        // Disable checkbox if productCount is Zero
        if (this.type === FacetUiTypeEnum.CHECKBOX) {
            (<HTMLElement>lightningInputElement).setAttribute(
                'disabled',
                this.value?.productCount === 0 ? 'true' : 'false'
            );
        }

        this.hasRenderedAtLeastOnce = true;
    }

    disconnectedCallback(): void {
        // When we're removed from the DOM, reset out render and focus flags so that
        // re-insertion can trigger the behaviors anew.
        // If we move in the DOM, we likely want to re-evaluate our auto-focus behavior.
        this.hasInitiallyFocused = false;
        this.hasRenderedAtLeastOnce = false;
    }

    /**
     * Handler for the 'keyup' event fired from facetItem
     *
     */
    handleKeyPress(evt: KeyboardEvent & LwcCustomEventTargetOf<HTMLInputElement>): void {
        if (evt.code === 'Space') {
            this.handleFacetValueToggle(evt);
        }
    }

    /**
     * Handler for the 'click' event fired from inputFacet
     *
     */
    handleFacetValueToggle(evt: LwcCustomEventTargetOf<HTMLInputElement>): void {
        const element = evt.target;

        if (!element.disabled) {
            evt.preventDefault();
            element.checked = !element.checked;
            // Manually call focus since we are suppressing the default click event for lightning-input
            element.focus();
        }

        this.dispatchEvent(
            new CustomEvent(FACETVALUE_TOGGLE_EVT, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    id: element.dataset.id,
                    checked: element.checked,
                },
            })
        );
    }
}
