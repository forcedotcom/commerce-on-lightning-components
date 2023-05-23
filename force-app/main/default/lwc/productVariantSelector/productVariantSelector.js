/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement, track } from 'lwc';
import { VARIANT_SELECTED_EVT } from './constants';
import { Labels } from './labels';
import { getAvailableOptions, getVariantStateFromProduct } from './productVariantSelectorUtils';
export { isVariantSupportedProductClass } from './productVariantSelectorUtils';

/**
 * @typedef {{[key: string]: *}} JsonData
 */

/**
 * Displays a list of dropdowns that represent the variant attributes
 * associated with a product. On each dropdown change it emits a `variantselected` event.
 * The width should be set by the consumer as it consumes all available width allocated.
 * @fires VariantSelector#variantselected
 */
export default class VariantSelector extends LightningElement {
    static renderMode = 'light';

    /**
     * An event fired when the user changes the variant selection
     *
     * Properties:
     * - Bubbles: false
     * - Cancelable: false
     * - Composed: false
     * @event VariantSelector#variantselected
     * @type {CustomEvent}
     */

    /**
     * A product variant attribute value option
     * @typedef {object} VariantOption
     * @property {string} label
     *  The label for the item option
     * @property {string} value
     *  The value for the item option
     */

    /**
     * A product variant attribute
     * @example
     * {
     *   id: 'item1',
     *   label: 'Item 1',
     *   options: [
     *     { label: 'Option 1', value: 'item1-option1' },
     *     { label: 'Option 2', value: 'item1-option2' },
     *     { label: 'Option 3', value: 'item1-option3' },
     *   ]
     * }
     * @typedef {object} Variant
     * @property {string} id
     *  A unique id for each item
     * @property {string} label
     *  A label for the item
     * @property {VariantOption[]} options
     *  A list of options for the item
     */

    /**
     * A normalized product variant attribute value option
     * @typedef {object} NormalizedVariantOption
     * @property {string} label
     *  The label for the item option
     * @property {string} value
     *  The value for the item option
     * @property {boolean} [disabled]
     *  Whether the option is disabled (Optional)
     * @property {boolean} [selected]
     *  Whether the option is currently selected (Optional)
     */

    /**
     * A product variant attribute with optional 'selected'
     * and 'disabled' properties in the options
     * @example
     * {
     *   id: 'item1',
     *   label: 'Item 1',
     *   value: 'item1-option3',
     *   options: [
     *     { label: 'Option 1', value: 'item1-option1' },
     *     { label: 'Option 2', value: 'item1-option2', disabled: true },
     *     { label: 'Option 3', value: 'item1-option3', selected: true },
     *   ]
     * }
     * @typedef {object} NormalizedVariant
     * @property {string} id
     *  A unique id for each item
     * @property {string} label
     *  A label for the item
     * @property {NormalizedVariantOption[]} options
     *  A list of options for the item
     */

    /**
     * An object representing a variant selector's current validation state
     * @typedef {object} ValidityState
     * @property {boolean} valueMissing
     *  True, if we are missing one or more variant selections from the user; otherwise, false
     * @property {boolean} badInput
     *  True, if the user selected options are not valid for the current list of validOptions; otherwise, false
     * @property {boolean} valid
     *  True, if the component meets all the validation constraints; otherwise, false
     */

    /**
     * An object representing selected product details and its variants
     * @type {?JsonData}
     * @example
     * {
     *   id: string;
     *   ?variationAttributeSet: JsonData;
     *   ?variationInfo: JsonData;
     *   ?variationParentId: string;
     *   productClass: string;
     *   ?purchaseQuantityRule: JsonData;
     *   fields: JsonData;
     *   primaryProductCategoryPath: JsonData;
     *   ?mediaGroups: Array<JsonData>;
     *   defaultImage: JsonData;
     *   ?attributeSetInfo: JsonData;
     * }
     */
    _productDetails;
    @api
    get product() {
        return this._productDetails;
    }
    set product(val) {
        this._productDetails = val;
        this._variantState = getVariantStateFromProduct(val);
    }

    /**
     * An object representing the state of all the variants of selected product
     * @type {?JsonData}
     * @example
     * {
     *   variants: Array<Variant>;
     *   validVariants: Array<Array<string>>;
     *   selected: Array<*>;
     *   selectionToProductIdMap: Map<string, Object.<string, *>>;
     * }
     */
    _variantState;

    /**
     * The type of product. Valid product types include 'VariationParent'
     * and 'Variation'. Only 'Variation' products are available to buy.
     * @type {?string}
     */
    get productClass() {
        return this.product?.productClass;
    }

    /**
     * Currently Selected Options represented as an array of
     * ordered string values (matching the variant option order).
     * @type {Array<string>}
     * @example
     * ['Red', 'Large']
     */
    get selectedOptions() {
        return this._variantState?.selected;
    }

    /**
     * The list of available variant options
     * @type {?Array<Variant>}
     */
    get variants() {
        return this._variantState?.variants;
    }

    /**
     * A list of valid variants
     * @example
     * [
     *   ['Small', 'Blue', 'Cotton'],
     *   ['Medium', 'Yellow', 'Cotton'],
     * ]
     * @type {?Array<Array<string>>}
     */
    get validVariantsList() {
        return this._variantState?.validVariants;
    }

    /**
     * An object representing a map of attribute values strings to product id strings.
     * The key represents the valid variant attribute values as a string and the value
     * is an object with the product id and the valid variant attribute values as a list.
     * @type {Map<string, JsonData>}
     * @example
     * [
     *   'Red_Small_Cotton',
     *   {
     *     productId: '01tRM000000PWydYAG',
     *     attributes: ['Red', 'Small', 'Cotton],
     *   }
     * ]
     */
    get variantSelectionToProductIdMap() {
        return this._variantState?.selectionToProductIdMap;
    }

    /**
     * This is true if the variant selector satifies all the validation constraints,
     * defined in the 'validity' property
     * @type {boolean}
     */
    @api
    checkValidity() {
        return this.validity.valid;
    }

    /**
     * The label for required variant options
     * @type {string}
     */
    get requiredPicklistLabel() {
        return Labels.labelRequired;
    }

    /**
     * The label for the placeholder text
     * @type {string}
     */
    get placeholderLabel() {
        return Labels.placeholderText;
    }

    /**
     * An object representing the current validation state for the variant selector.
     * @type {ValidityState}
     * @readonly
     */
    @api
    get validity() {
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
     * @type {Array<string>}
     * @example
     * ['Red', 'Large']
     */
    @api
    get currentlySelectedOptions() {
        return [...this.querySelectorAll('select')].map((item) => item.value);
    }

    /**
     * Tracks the index of the last focused item
     * @type {?number}
     * @private
     */
    _selectedAttributeIndex;

    /**
     * Whether the valid variants list contains the currently selected options
     * @type {boolean}
     * @private
     */
    get validVariantsListContainsSelectedOptions() {
        if (
            this.variants?.length !== this.currentlySelectedOptions.length ||
            this.currentlySelectedOptions.includes('')
        ) {
            return false;
        }
        const currentlySelectedOptionsAsStr = JSON.stringify(this.currentlySelectedOptions);
        const listOfVariantsAsStr = this.validVariantsList?.map((variant) => JSON.stringify(variant));
        return Boolean(listOfVariantsAsStr?.includes(currentlySelectedOptionsAsStr));
    }

    /**
     * A normalized list of variants.
     * This representation includes a 'value' property.
     * Additionally, the selected options has the 'selected' property set
     * @type {Array<NormalizedVariant>}
     * @private
     */
    get normalizedVariants() {
        return (this.variants || []).map((variant, variantIndex) => {
            return {
                id: variant.id,
                label: variant.label,
                value: this.selectedOptions[variantIndex],
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
     * @type {Set<string>}
     * @private
     */
    @track
    _availableOptions;

    /**
     * List of available options for each attribute index.
     * The product variant (child product) references this list to improve performance.
     * @example
     * [Set(['Small']), Set(['Red', 'Green']), Set(['Cotton'])]
     * @type {Array<Set<string>>}
     * @private
     */
    _availableOptionsList = [];

    /**
     * Checks whether the available options list has been created.
     * Populates the available options list if it hasn't already been created.
     * @type {boolean}
     * @private
     */
    get checkAndPopulateAvailableOptionsList() {
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
     * @param {string} optionValue
     *  Value of the given option (e.g. 'Small')
     * @param {number} variantIndex
     *  Index of the variant that the option belongs to
     * @returns {boolean}
     *  True if option is in selectedOptions, otherwise false.
     */
    isOptionSelected(optionValue, variantIndex) {
        const currentlySelectedOptions = this.currentlySelectedOptions;

        if (currentlySelectedOptions.includes('') && this.selectedOptions.length > 0) {
            return optionValue === currentlySelectedOptions[variantIndex];
        }
        return optionValue === this.selectedOptions[variantIndex];
    }

    /**
     * Whether the provided optionsValue is in the list of available options
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
    isOptionAvailable(optionValue, variantIndex) {
        return (
            !this._availableOptions ||
            variantIndex !== this._selectedAttributeIndex ||
            this._availableOptions.has(optionValue)
        );
    }

    /**
     * Handler for the 'focus' event
     * @param {FocusEvent} event Received whenever a variant selection is focused
     * @private
     */
    handleFocus(event) {
        if (event.target.dataset.index !== null && event.target.dataset.index !== undefined) {
            this._selectedAttributeIndex = +event.target.dataset.index;

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
     * @private
     * @fires VariantSelector#variantselected
     */
    handleChange() {
        const isValid = this.checkValidity();
        const currentVariantSelectionsAsStr = this.currentlySelectedOptions.join('_');
        const productId = this.variantSelectionToProductIdMap?.get(currentVariantSelectionsAsStr)?.productId;
        this.dispatchEvent(
            new CustomEvent(VARIANT_SELECTED_EVT, {
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
