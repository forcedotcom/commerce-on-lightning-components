import { api, LightningElement, track } from 'lwc';
import { VARIANT_SELECTED_EVT } from './constants';
import { getAvailableOptions } from './variantSelectorUtils';
import labelRequired from '@salesforce/label/LightningControl.required';
import productVariantSelectorPlaceholderText from '@salesforce/label/Commerce_Product_Details_Variant_Selector.productVariantSelectorPlaceholderText';
import type {
    NormalizedVariant,
    VariantSelectedEventDetail,
    VariationInfo,
    VariationProductIdMap,
    VariationValidityState,
} from './types';
import type { LwcCustomEventTargetOf } from 'types/common';

export type { VariantSelectedEventDetail, VariationInfo };

export { isVariantSupportedProductClass, getVariantStateFromProduct } from './variantSelectorUtils';
export type { VariantSelectorProductState } from './variantSelectorUtils';

/**
 * Displays a list of dropdowns that represent the variant attributes
 * associated with a product. On each dropdown change it emits a `variantselected` event.
 * It consumes all available width allocated to it by the consumer, so the width
 * should be set by the consumer.
 *
 * @fires VariantSelector#variantselected
 */

export default class VariantSelector extends LightningElement {
    public static renderMode = 'light';
    /**
     * An event fired when the user changes the variant selection
     *
     * Properties:
     *   - Bubbles: false
     *   - Cancelable: false
     *   - Composed: false
     *
     * @event VariantSelector#variantselected
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * A product variant attribute value option
     * @typedef {Object} VariantOption
     *
     * @property {string} label
     *  The label for the item option
     *
     * @property {string} value
     *  The value for the item option
     *
     */

    /**
     * A product variant attribute
     *
     * @example
     * {
            id: 'item1',
            label: 'Item 1',
            options: [
                { label: 'Option 1', value: 'item1-option1' },
                { label: 'Option 2', value: 'item1-option2' },
                { label: 'Option 3', value: 'item1-option3'}
            ]
        }
     * @typedef {Object} Variant
     *
     * @property {string} id
     *  A unique id for each item
     *
     * @property {string} label
     *  A label for the item
     *
     * @property {VariantOption[]} options
     *  A list of options for the item
     */

    /**
     * A normalized product variant attribute value option
     * @typedef {Object} NormalizedVariantOption
     *
     * @property {string} label
     *  The label for the item option
     *
     * @property {string} value
     *  The value for the item option
     *
     * @property {Boolean} [disabled]
     *  Whether the option is disabled (Optional)
     *
     * @property {Boolean} [selected]
     *  Whether the option is currently selected (Optional)
     *
     */

    /**
     * A product variant attribute with optional 'selected'
     * and 'disabled' properties in the options
     *
     * @example
     * {
            id: 'item1',
            label: 'Item 1',
            value: 'item1-option3',
            options: [
                { label: 'Option 1', value: 'item1-option1' },
                { label: 'Option 2', value: 'item1-option2', disabled: true },
                { label: 'Option 3', value: 'item1-option3', selected: true }
            ]
        }
     * @typedef {Object} NormalizedVariant
     *
     * @property {string} id
     *  A unique id for each item
     *
     * @property {string} label
     *  A label for the item
     *
     * @property {NormalizedVariantOption[]} options
     *  A list of options for the item
     */

    /**
     * An object representing a variant selector's current validation state
     * @typedef {Object} ValidityState
     *
     * @property {Boolean} valueMissing
     *  True, if we are missing one or more variant selections from the user; otherwise, false
     *
     * @property {Boolean} badInput
     *  True, if the user selected options are not valid for the current list of validOptions; otherwise, false
     *
     * @property {Boolean} valid
     *  True, if the component meets all the validation constraints; otherwise, false
     *
     */

    /**
     * The label for the placeholder text
     *
     * @type {string}
     */
    @api
    placeholder = productVariantSelectorPlaceholderText;

    /**
     * The type of product. Valid product types include 'VariationParent'
     * and 'Variation'. Only 'Variation' products are available to buy.
     *
     * @type {string}
     */
    @api
    productClass?: string;

    /**
     * Currently Selected Options represented as an array of
     * ordered string values (matching the variant option order).
     *
     * @type {string[]}
     * @example
     * ['Red', 'Large']
     */
    @api
    selectedOptions?: string[];

    /**
     * The list of available variant options
     *
     * @type {Variant[]}
     */
    @api
    variants?: VariationInfo[];

    /**
     * A list of valid variants
     * @example
     * [
     *     ['Small', 'Blue', 'Cotton'],
     *     ['Medium', 'Yellow', 'Cotton'],
     *      ...
     * ]
     *
     * @type {Array<string[]>}
     */
    @api
    validVariantsList: string[][] = [];

    /**
     * An object representing a map of attribute values strings to product id strings.
     * The key represents the valid variant attribute values as a string and the value
     * is an object with the product id and the valid variant attribute values as a list.
     *
     * @type {Map<string, Object>}
     * @example
     * [
     *      'Red_Small_Cotton',
     *      {
     *          productId: '01tRM000000PWydYAG',
     *          attributes: ['Red', 'Small', 'Cotton]
     *      }
     * ]
     */
    @api
    variantSelectionToProductIdMap?: Map<string, VariationProductIdMap>;

    /**
     * This is true if the variant selector satifies all the validation constraints,
     * defined in the 'validity' property
     *
     * @type {Boolean}
     */
    @api
    checkValidity(): boolean {
        return this.validity.valid;
    }

    /**
     * The required label for variant options
     *
     * @type {string}
     */
    get requiredPicklistLabel(): string | undefined {
        return labelRequired;
    }

    /**
     * An object representing the current validation state for the variant selector.
     *
     * @type {VariationValidityState}
     * @readonly
     */
    @api
    get validity(): VariationValidityState {
        const numberOfAvailableAttributes = this.variants?.length;
        const numberOfSelectedAttributes = this.currentlySelectedOptions.filter((attribute) => !!attribute).length;
        const valueMissing = numberOfSelectedAttributes !== numberOfAvailableAttributes;
        const badInput = !this.validVariantsListContainsSelectedOptions;
        return Object.freeze({
            valueMissing,
            badInput,
            valid: !valueMissing && !badInput,
        });
    }

    /**
     * The currently selected variant options
     *
     * @type {string[]}
     * @example
     * ['Red', 'Large']
     */
    @api
    get currentlySelectedOptions(): string[] {
        return [...this.querySelectorAll<HTMLSelectElement>('select')].map((item) => item.value);
    }

    _selectedAttributeIndex: number | undefined;

    /**
     * Gets the normalized (always an array) value of the {@see selectedOptions} property.
     *
     * @type {string[]}
     * @readonly
     * @private
     */
    get _selectedOptions(): string[] {
        return this.selectedOptions || [];
    }

    /**
     * Whether or not the valid variants list contains the currently selected options
     *
     * @type {Boolean}
     * @private
     */
    get validVariantsListContainsSelectedOptions(): boolean {
        if (
            this.variants?.length !== this.currentlySelectedOptions.length ||
            this.currentlySelectedOptions.includes('')
        ) {
            return false;
        }
        const currentlySelectedOptionsAsStr = JSON.stringify(this.currentlySelectedOptions);
        const listOfVariantsAsStr = this.validVariantsList.map((variant) => JSON.stringify(variant));
        return listOfVariantsAsStr.includes(currentlySelectedOptionsAsStr);
    }

    /**
     * A normalized list of variants.
     * This representation includes a 'value' property.
     * Additionally, the selected options has the 'selected' property set
     *
     * @type {NormalizedVariant}
     * @private
     */
    get normalizedVariants(): NormalizedVariant[] {
        return (this.variants || []).map((variant, variantIndex) => {
            return {
                id: variant.id,
                label: variant.label,
                value: this._selectedOptions[variantIndex],
                options: variant.options.map((option) => {
                    return {
                        label: option.label,
                        value: option.value,
                        selected: this.isOptionSelected(option.value, variantIndex),
                        disabled: !this.isOptionAvailable(option.value, variantIndex),
                    };
                }),
            };
        });
    }

    /**
     * Stores a list of options that are available for
     * the attribute the user just selected
     * @example
     * {'Small', 'Medium'}
     *
     * @type {Set}
     * @private
     */
    @track
    _availableOptions?: Set<string>;

    /**
     * List of available options for each attribute index.
     * The product variant (child product) references this list to improve performance.
     * @example
     * [Set(['Small']), Set(['Red', 'Green']), Set(['Cotton'])]
     *
     * @type {Array<Set<string>>}
     * @private
     */
    _availableOptionsList?: Set<string>[] = [];

    /**
     * Checks whether or not the available options list has been created.
     * Populates the available options list if it hasn't already been created.
     *
     * @type {Boolean}
     * @private
     */
    get checkAndPopulateAvailableOptionsList(): boolean {
        // Only create available options list when
        //     - the product is a variant (child product),
        //     - the list hasn't been populated already,
        //     - and all attributes have selected options
        if (
            this.productClass === 'Variation' &&
            !this._availableOptionsList?.length &&
            !this.currentlySelectedOptions.includes('')
        ) {
            this._availableOptionsList = this.variants?.map((variant, index) =>
                getAvailableOptions(index, this.currentlySelectedOptions, this.validVariantsList)
            );
            return true;
        }
        return false;
    }

    /**
     * Checks if the option is selected or not
     *
     * @param {string} optionValue
     *  Value of the given option (e.g. 'Small')
     * @param {number} variantIndex
     *  Index of the variant that the option belongs to
     * @returns {boolean}
     *  True if option is in selectedOptions, otherwise false.
     */
    isOptionSelected(optionValue: string, variantIndex: number): boolean {
        const currentlySelectedOptions = this.currentlySelectedOptions;
        // If attributes are partially set, use the selected option values found
        // found in the DOM; otherwise, use the selected options passed in from purchaseOptions.
        if (currentlySelectedOptions.includes('') && this._selectedOptions.length > 0) {
            return optionValue === currentlySelectedOptions[variantIndex];
        }
        return optionValue === this._selectedOptions[variantIndex];
    }

    /**
     * Whether the provided optionsValue is in the list of available options
     *
     * @param {string} optionValue
     *  Value of the given option (e.g. 'Small')
     * @param {number} variantIndex
     *  Index of the variant that the option belongs to
     * @returns {boolean}
     *  True if
     *      - availableOptions is not yet defined (currently only defined when the user selects an option)
     *      - the option given doesn't belong the selected attribute index
     *      - the option value is in the list of available options
     *  False if
     *      - the option value is not in the list of available options
     */
    isOptionAvailable(optionValue: string, variantIndex: number): boolean {
        return (
            !this._availableOptions ||
            variantIndex !== this._selectedAttributeIndex ||
            this._availableOptions.has(optionValue)
        );
    }

    /**
     * Handler for the 'focus' event fired whenever a variant selection has focus
     *
     * @param {FocusEvent}
     * @private
     */
    handleFocus(event: LwcCustomEventTargetOf<HTMLElement>): void {
        if (event.target.dataset.index !== null && event.target.dataset.index !== undefined) {
            this._selectedAttributeIndex = +event.target.dataset.index;
            // Reference the predetermined list of available options if it has been created
            this._availableOptions = this.checkAndPopulateAvailableOptionsList
                ? this._availableOptionsList && this._availableOptionsList[this._selectedAttributeIndex]
                : getAvailableOptions(
                      this._selectedAttributeIndex,
                      this.currentlySelectedOptions,
                      this.validVariantsList
                  );
        }
    }

    /**
     * Handler for the 'change' event fired whenever a variant selection changes
     * It fires a custom event 'variantselected'
     *
     * @private
     * @fires VariantSelector#variantselected
     */
    handleChange(): void {
        const isValid = this.checkValidity();
        const currentVariantSelectionsAsStr = this.currentlySelectedOptions.join('_');
        const productId = this.variantSelectionToProductIdMap?.get(currentVariantSelectionsAsStr)?.productId;

        this.dispatchEvent(
            new CustomEvent<VariantSelectedEventDetail>(VARIANT_SELECTED_EVT, {
                bubbles: false,
                composed: false,
                cancelable: false,
                detail: {
                    productId: productId,
                    isValid: isValid,
                    options: this.currentlySelectedOptions,
                },
            })
        );
    }
}
